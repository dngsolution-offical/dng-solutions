const fs = require('fs');
const path = require('path');

let db;
try {
  const appModule = require('firebase-admin/app');
  const firestoreModule = require('firebase-admin/firestore');
  
  if (!appModule.getApps || appModule.getApps().length === 0) {
    let sa = null;
    try {
      const kp = path.join(process.cwd(), 'firebase-key.json');
      if (fs.existsSync(kp)) sa = JSON.parse(fs.readFileSync(kp, 'utf8'));
    } catch (e) {}
    if (!sa && process.env.FIREBASE_SERVICE_ACCOUNT) {
      try { sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT); } catch {}
    }
    if (sa && sa.project_id) {
      appModule.initializeApp({ credential: appModule.cert(sa) });
    } else {
      appModule.initializeApp({ credential: appModule.applicationDefault() });
    }
  }
  db = firestoreModule.getFirestore();
} catch (e) { console.error('[fb-init]', e.message); }

const PACKAGE_PRICES = {
  basic: { monthly: 79, semiannual: 199, yearly: 349 },
  gold: { monthly: 249, semiannual: 649, yearly: 1199 },
  diamond: { monthly: 799, semiannual: 1999, yearly: 3599 },
  infinity: { monthly: 1499, semiannual: 3999, yearly: 7499 },
};

async function getBogToken() {
  const clientId = process.env.BOG_CLIENT_ID;
  const clientSecret = process.env.BOG_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('BOG credentials not configured');
  }

  const res = await fetch('https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('[bog-auth]', res.status, text.slice(0, 300));
    throw new Error('BOG auth failed: ' + res.status);
  }

  const data = await res.json();
  return data.access_token;
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method_not_allowed' });

  let body = req.body;
  if (!body || typeof body !== 'object') {
    try {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
    } catch { body = {}; }
  }

  const { packageId, billingCycle = 'monthly', userId, userEmail, baseUrl } = body || {};

  if (!userId || !packageId) {
    return res.status(400).json({ ok: false, error: 'missing_fields' });
  }

  const pkg = PACKAGE_PRICES[packageId.toLowerCase()];
  if (!pkg) return res.status(400).json({ ok: false, error: 'invalid_package' });

  const amount = pkg[billingCycle];
  if (!amount) return res.status(400).json({ ok: false, error: 'invalid_billing_cycle' });

  if (!db) return res.status(500).json({ ok: false, error: 'database_unavailable' });

  try {
    // 1. Create Firestore order (pending)
    const orderRef = db.collection('payment_orders').doc();
    const orderId = orderRef.id;

    await orderRef.set({
      userId,
      userEmail: userEmail || '',
      packageId: packageId.toLowerCase(),
      billingCycle,
      amount,
      currency: 'GEL',
      status: 'pending',
      provider: 'bog',
      createdAt: new Date(),
    });

    // 2. Get BOG token
    const token = await getBogToken();

    // 3. Create BOG order
    const host = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'https://dngmind.com';
    const callbackUrl = `${host}/api/bog-callback`;

    const bogRes = await fetch('https://api.bog.ge/payments/v1/ecommerce/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        callback_url: callbackUrl,
        external_order_id: orderId,
        purchase_units: {
          currency: 'GEL',
          total_amount: amount,
          basket: [{
            product_id: packageId.toLowerCase(),
            description: `DNG ${packageId} - ${billingCycle}`,
            quantity: 1,
            unit_price: amount,
            total_price: amount,
          }],
        },
        redirect_urls: {
          success: `${host}/checkout/success?order_id=${orderId}`,
          fail: `${host}/checkout/fail?order_id=${orderId}`,
        },
        buyer: {
          email: userEmail || '',
        },
      }),
    });

    if (!bogRes.ok) {
      const errText = await bogRes.text();
      console.error('[bog-order]', bogRes.status, errText.slice(0, 500));
      await orderRef.update({ status: 'error', error: errText.slice(0, 500) });
      return res.status(502).json({ ok: false, error: 'bog_api_error', detail: errText.slice(0, 200) });
    }

    const bogData = await bogRes.json();
    const paymentUrl = bogData.links?.redirect?.href || bogData.redirect_url;

    if (!paymentUrl) {
      await orderRef.update({ status: 'error', error: 'no_payment_url', bogResponse: bogData });
      return res.status(502).json({ ok: false, error: 'no_redirect_url' });
    }

    // Save BOG order id
    await orderRef.update({
      bogOrderId: bogData.id || null,
      bogPaymentUrl: paymentUrl,
    });

    console.log('[bog-create] ✅ Order created:', orderId, '| BOG ID:', bogData.id);

    return res.status(200).json({
      ok: true,
      orderId,
      paymentUrl,
      amount,
      currency: 'GEL',
    });
  } catch (err) {
    console.error('[bog-create] Error:', err.message);
    return res.status(500).json({ ok: false, error: 'create_failed', message: err.message });
  }
};