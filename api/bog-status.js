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
    if (sa && sa.project_id) appModule.initializeApp({ credential: appModule.cert(sa) });
    else appModule.initializeApp({ credential: appModule.applicationDefault() });
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

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

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

  const { orderId } = body || {};
  if (!orderId) return res.status(400).json({ ok: false, error: 'missing_order_id' });
  if (!db) return res.status(500).json({ ok: false, error: 'database_unavailable' });

  try {
    const orderRef = db.collection('payment_orders').doc(orderId);
    const snap = await orderRef.get();
    if (!snap.exists) return res.status(404).json({ ok: false, error: 'order_not_found' });

    const order = snap.data();
    if (order.status === 'paid') {
      return res.status(200).json({ ok: true, status: 'paid', already: true });
    }

    if (!order.bogOrderId) {
      return res.status(200).json({ ok: true, status: order.status || 'pending' });
    }

    // Verify with BOG
    const token = await getBogToken();
    const bogRes = await fetch(`https://api.bog.ge/payments/v1/receipt/${order.bogOrderId}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
    });

    if (!bogRes.ok) {
      return res.status(502).json({ ok: false, error: 'bog_verify_failed' });
    }

    const receipt = await bogRes.json();
    const status = receipt.order_status?.key || receipt.status || 'unknown';

    if (status === 'completed' || status === 'success' || status === 'paid') {
      const days = BILLING_DAYS[order.billingCycle] || 30;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);

      const packageName = PACKAGE_NAMES[order.packageId];
      if (packageName) {
        await db.collection('users').doc(order.userId).update({
          package: packageName,
          expiresAt,
          packageUpdatedAt: new Date(),
        });
      }

      await orderRef.update({
        status: 'paid',
        paidAt: new Date(),
        bogStatus: status,
      });

      return res.status(200).json({ ok: true, status: 'paid', activated: true, package: packageName });
    }

    await orderRef.update({ bogStatus: status, lastCheckedAt: new Date() });
    return res.status(200).json({ ok: true, status });
  } catch (err) {
    console.error('[bog-status]', err.message);
    return res.status(500).json({ ok: false, error: 'status_check_failed', message: err.message });
  }
};