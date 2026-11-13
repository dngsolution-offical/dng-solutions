// api/quickpay.js — TEST MODE: ALL PACKAGES = 0 GEL
const fs = require('fs');
const path = require('path');

let admin, db;
try {
  admin = require('firebase-admin');
  
  if (!admin.apps || admin.apps.length === 0) {
    let sa = null;
    try {
      const kp = path.join(process.cwd(), 'firebase-key.json');
      if (fs.existsSync(kp)) sa = JSON.parse(fs.readFileSync(kp, 'utf8'));
    } catch (e) { console.error('[key]', e.message); }
    
    if (!sa && process.env.FIREBASE_SERVICE_ACCOUNT) {
      try { sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT); } catch {}
    }
    
    if (sa && sa.project_id) {
      admin.initializeApp({ credential: admin.credential.cert(sa) });
    } else {
      admin.initializeApp({ credential: admin.credential.applicationDefault() });
    }
  }
  db = admin.firestore();
} catch (e) {
  console.error('[fb-init]', e.message);
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

  const { packageId, billingCycle, userId, userEmail } = body || {};

  if (!packageId || !billingCycle || !userId) {
    return res.status(400).json({ ok: false, error: 'missing_fields', message: 'packageId, billingCycle, userId required' });
  }

  const pkgKey = String(packageId).toLowerCase();
  const packageName = PACKAGE_NAMES[pkgKey];

  if (!packageName) {
    return res.status(400).json({ ok: false, error: 'invalid_package', packageId: pkgKey });
  }

  const days = BILLING_DAYS[billingCycle] || 30;

  if (!db) {
    return res.status(500).json({ ok: false, error: 'database_unavailable' });
  }

  // ═══ ALWAYS 0 GEL — TEST MODE ═══
  console.log('[quickpay] 🧪 TEST MODE: activating', packageName, 'for', days, 'days — 0 GEL');

  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    const paymentId = `TEST_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    // Update user package
    await db.collection('users').doc(userId).update({
      package: packageName,
      expiresAt: expiresAt,
      lastPaymentId: paymentId,
      packageUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Log transaction
    await db.collection('transactions').add({
      userId,
      userEmail: userEmail || '',
      packageId: pkgKey,
      billingCycle,
      amount: 0,
      currency: 'GEL',
      status: 'test',
      testMode: true,
      paymentId,
      expiresAt,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('[quickpay] ✅ Activated:', { userId, packageName, days });

    return res.status(200).json({
      ok: true,
      testMode: true,
      activated: true,
      package: packageName,
      packageId: pkgKey,
      billingCycle,
      days,
      expiresAt: expiresAt.toISOString(),
      amountGEL: 0,
      paymentId,
      message: `🧪 Test: ${packageName} activated for ${days} days (0 GEL)`,
    });
  } catch (err) {
    console.error('[quickpay] Activation failed:', err.message);
    return res.status(500).json({
      ok: false,
      error: 'activation_failed',
      message: err.message,
    });
  }
};