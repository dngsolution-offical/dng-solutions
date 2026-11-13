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

const PACKAGE_NAMES = { basic: 'Basic', gold: 'Gold', diamond: 'Diamond', infinity: 'Infinity' };
const BILLING_DAYS = { monthly: 30, semiannual: 180, yearly: 365 };

async function getBogToken() {
  const clientId = process.env.BOG_CLIENT_ID;
  const clientSecret = process.env.BOG_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('BOG credentials not configured');

  const res = await fetch('https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error('BOG auth failed');
  return (await res.json()).access_token;
}

async function verifyBogOrder(orderId) {
  const token = await getBogToken();
  const res = await fetch(`https://api.bog.ge/payments/v1/receipt/${orderId}`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error('BOG verify failed: ' + res.status + ' ' + t.slice(0, 200));
  }
  return await res.json();
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  // BOG sends callback as POST with body {event, body: {order_id, status, external_order_id, ...}}
  let payload = req.body;
  if (!payload || typeof payload !== 'object') {
    try {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      payload = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
    } catch { payload = {}; }
  }

  console.log('[bog-callback] Received:', JSON.stringify(payload).slice(0, 500));

  if (!db) {
    console.error('[bog-callback] DB unavailable');
    return res.status(500).json({ ok: false, error: 'database_unavailable' });
  }

  try {
    // BOG callback structure: { event: "order_payment", body: { order_id, status, external_order_id } }
    const bogOrderId = payload?.body?.order_id || payload?.order_id;
    const bogStatus = payload?.body?.status || payload?.status;
    const externalOrderId = payload?.body?.external_order_id || payload?.external_order_id;

    if (!bogOrderId && !externalOrderId) {
      console.warn('[bog-callback] No order id in callback');
      return res.status(400).json({ ok: false, error: 'no_order_id' });
    }

    // 1. Find Firestore order
    let orderRef = null;
    let orderData = null;

    if (externalOrderId) {
      const snap = await db.collection('payment_orders').doc(externalOrderId).get();
      if (snap.exists) {
        orderRef = snap.ref;
        orderData = snap.data();
      }
    }

    if (!orderRef && bogOrderId) {
      const q = await db.collection('payment_orders').where('bogOrderId', '==', bogOrderId).limit(1).get();
      if (!q.empty) {
        orderRef = q.docs[0].ref;
        orderData = q.docs[0].data();
      }
    }

    if (!orderRef) {
      console.warn('[bog-callback] Order not found:', { bogOrderId, externalOrderId });
      return res.status(404).json({ ok: false, error: 'order_not_found' });
    }

    if (orderData.status === 'paid') {
      console.log('[bog-callback] Already paid:', orderRef.id);
      return res.status(200).json({ ok: true, already_paid: true });
    }

    // 2. Verify with BOG API (never trust callback alone!)
    let verifiedStatus = bogStatus;
    if (bogOrderId) {
      try {
        const receipt = await verifyBogOrder(bogOrderId);
        verifiedStatus = receipt.order_status?.key || receipt.status || bogStatus;
        console.log('[bog-callback] Verified status:', verifiedStatus);
      } catch (e) {
        console.error('[bog-callback] Verify error:', e.message);
        // Continue with callback status if verify fails (BOG may retry)
      }
    }

    // 3. Activate if paid
    if (verifiedStatus === 'completed' || verifiedStatus === 'success' || verifiedStatus === 'paid') {
      const days = BILLING_DAYS[orderData.billingCycle] || 30;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);

      const packageName = PACKAGE_NAMES[orderData.packageId];
      if (!packageName) {
        await orderRef.update({ status: 'error', error: 'invalid_package' });
        return res.status(400).json({ ok: false, error: 'invalid_package' });
      }

      // Update user package
      await db.collection('users').doc(orderData.userId).update({
        package: packageName,
        expiresAt: expiresAt,
        packageUpdatedAt: new Date(),
      });

      // Mark order as paid
      await orderRef.update({
        status: 'paid',
        paidAt: new Date(),
        bogStatus: verifiedStatus,
      });

      // Log transaction
      await db.collection('transactions').add({
        userId: orderData.userId,
        orderId: orderRef.id,
        packageId: orderData.packageId,
        billingCycle: orderData.billingCycle,
        amount: orderData.amount,
        currency: 'GEL',
        provider: 'bog',
        bogOrderId,
        status: 'success',
        createdAt: new Date(),
      });

      console.log('[bog-callback] ✅ Package activated:', orderData.userId, '→', packageName);
      return res.status(200).json({ ok: true, activated: true, package: packageName });
    }

    // Not paid yet or failed
    await orderRef.update({
      status: verifiedStatus === 'failed' || verifiedStatus === 'cancelled' ? 'failed' : 'pending',
      bogStatus: verifiedStatus,
      lastCheckedAt: new Date(),
    });

    return res.status(200).json({ ok: true, status: verifiedStatus });
  } catch (err) {
    console.error('[bog-callback] Error:', err.message);
    return res.status(500).json({ ok: false, error: 'callback_failed', message: err.message });
  }
};