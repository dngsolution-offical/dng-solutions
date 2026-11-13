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

const PACKAGE_NAMES = {
  basic: 'Basic', gold: 'Gold', diamond: 'Diamond', infinity: 'Infinity',
};
const BILLING_DAYS = { monthly: 30, semiannual: 180, yearly: 365 };

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

  const { requestId, action } = body || {};

  if (!requestId || !action) {
    return res.status(400).json({ ok: false, error: 'missing_fields' });
  }

  if (!db) {
    return res.status(500).json({ ok: false, error: 'database_unavailable' });
  }

  try {
    const reqRef = db.collection('payment_requests').doc(requestId);
    const reqSnap = await reqRef.get();

    if (!reqSnap.exists) {
      return res.status(404).json({ ok: false, error: 'request_not_found' });
    }

    const reqData = reqSnap.data();

    if (action === 'approve') {
      const days = BILLING_DAYS[reqData.billingCycle] || 30;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);

      const packageName = PACKAGE_NAMES[reqData.packageId];
      if (!packageName) {
        return res.status(400).json({ ok: false, error: 'invalid_package' });
      }

      await db.collection('users').doc(reqData.userId).update({
        package: packageName,
        expiresAt: expiresAt,
        packageUpdatedAt: new Date(),
      });

      await reqRef.update({
        status: 'approved',
        approvedAt: new Date(),
      });

      return res.status(200).json({
        ok: true,
        activated: true,
        package: packageName,
        expiresAt: expiresAt.toISOString(),
      });
    }

    if (action === 'reject') {
      await reqRef.update({
        status: 'rejected',
        rejectedAt: new Date(),
      });
      return res.status(200).json({ ok: true, rejected: true });
    }

    return res.status(400).json({ ok: false, error: 'invalid_action' });
  } catch (err) {
    console.error('[quickpay-callback] Error:', err.message);
    return res.status(500).json({ ok: false, error: 'action_failed', message: err.message });
  }
};