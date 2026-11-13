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

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

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

  const { packageId, billingCycle, userId, userEmail, amount, paymentMethod } = body || {};

  if (!userId || !packageId) {
    return res.status(400).json({ ok: false, error: 'missing_fields' });
  }

  if (!db) {
    return res.status(500).json({ ok: false, error: 'database_unavailable' });
  }

  try {
    const requestRef = db.collection('payment_requests').doc();
    const requestId = requestRef.id;

    await requestRef.set({
      userId,
      userEmail: userEmail || '',
      packageId: packageId.toLowerCase(),
      billingCycle: billingCycle || 'monthly',
      amount: amount || 0,
      paymentMethod: paymentMethod || 'bank_transfer',
      status: 'pending',
      createdAt: new Date(),
    });

    console.log('[quickpay] ✅ Payment request created:', requestId);

    return res.status(200).json({
      ok: true,
      requestId,
      status: 'pending',
      message: 'მოთხოვნა გაგზავნილია. ადმინი მალე დაამტკიცებს.',
    });
  } catch (err) {
    console.error('[quickpay] Error:', err.message);
    return res.status(500).json({ ok: false, error: 'request_failed', message: err.message });
  }
};