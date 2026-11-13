// api/quickpay-callback.js — BOG webhook handler
const fs = require('fs');
const path = require('path');

let db, FieldValue;
try {
  const appModule = require('firebase-admin/app');
  const firestoreModule = require('firebase-admin/firestore');

  if (!appModule.getApps || appModule.getApps().length === 0) {
    let sa = null;
    try {
      const kp = path.join(process.cwd(), 'firebase-key.json');
      if (fs.existsSync(kp)) sa = JSON.parse(fs.readFileSync(kp, 'utf8'));
    } catch (e) { console.error('[key]', e.message); }

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
  FieldValue = firestoreModule.FieldValue;
  console.log('[quickpay-callback] ✅ Firestore ready');
} catch (e) {
  console.error('[quickpay-callback] ❌ Firebase init failed:', e.message);
}

const PACKAGE_NAMES = {
  basic: 'Basic',
  gold: 'Gold',
  diamond: 'Diamond',
  infinity: 'Infinity',
};

const BILLING_DAYS = {
  monthly: 30,
  semiannual: 180,
  yearly: 365,
};

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  let body = req.body;
  if (!body || typeof body !== 'object') {
    try {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
    } catch { body = {}; }
  }

  console.log('[quickpay-callback] Webhook received:', JSON.stringify(body).slice(0, 500));

  // BOG webhook format
  const orderId = body.order_id || body.external_order_id || body.merchant_order_id;
  const status = body.status || body.order_status || body.payment_status;
  const paymentId = body.payment_id || body.order_id;

  if (!orderId) {
    console.error('[quickpay-callback] No order_id');
    return res.status(400).json({ ok: false, error: 'missing_order_id' });
  }

  // Parse orderId: DNG_{userId}_{pkgKey}_{billingCycle}_{timestamp}
  const parts = orderId.split('_');
  if (parts.length < 5 || parts[0] !== 'DNG') {
    console.error('[quickpay-callback] Invalid order format:', orderId);
    return res.status(400).json({ ok: false, error: 'invalid_order_format' });
  }

  const userId = parts[1];
  const pkgKey = parts[2];
  const billingCycle = parts[3];

  // Check if payment was successful
  const isSuccess = ['success', 'completed', 'paid', 'SUCCESS', 'COMPLETED', 'PAID'].includes(status) 
    || body.status === 'success' 
    || body.order_status === 'completed';

  if (!isSuccess) {
    console.log('[quickpay-callback] Payment not successful:', status);
    return res.status(200).json({ ok: true, status: 'ignored', paymentStatus: status });
  }

  if (!db) {
    console.error('[quickpay-callback] No database');
    return res.status(500).json({ ok: false, error: 'database_unavailable' });
  }

  // Activate package
  const days = BILLING_DAYS[billingCycle] || 30;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);

  const packageName = PACKAGE_NAMES[pkgKey];
  if (!packageName) {
    return res.status(400).json({ ok: false, error: 'invalid_package' });
  }

  const now = new Date();

  try {
    // Update user package
    await db.collection('users').doc(userId).update({
      package: packageName,
      expiresAt: expiresAt,
      lastPaymentId: paymentId || orderId,
      packageUpdatedAt: now,
    });

    // Log transaction
    await db.collection('transactions').add({
      userId,
      packageId: pkgKey,
      billingCycle,
      amount: body.amount?.total || body.purchase_units?.total_amount || 0.01,
      currency: 'GEL',
      status: 'success',
      paymentId: paymentId || orderId,
      orderId: orderId,
      createdAt: now,
    });

    console.log('[quickpay-callback] ✅ Package activated:', { userId, packageName, days });

    return res.status(200).json({
      ok: true,
      activated: true,
      package: packageName,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err) {
    console.error('[quickpay-callback] Activation failed:', err.message);
    return res.status(500).json({ ok: false, error: 'activation_failed', message: err.message });
  }
};