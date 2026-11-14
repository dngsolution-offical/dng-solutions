// server/start-trial.cjs
// One-time free trial (7 days) for Basic and Gold. Server-side only.
const admin = require('firebase-admin');

const TRIAL_DAYS = 7;
const TRIAL_PACKAGES = ['Basic', 'Gold'];

function getApp() {
  const found = admin.apps.find((a) => a && a.name === 'trial');
  if (found) return found;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT || '';
  let sa;
  try {
    sa = JSON.parse(raw);
  } catch (e) {
    sa = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  }
  if (sa.private_key) sa.private_key = sa.private_key.replace(/\\n/g, '\n');
  return admin.initializeApp({ credential: admin.credential.cert(sa) }, 'trial');
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (e) {
      return {};
    }
  }
  return {};
}

function toMillis(v) {
  if (!v) return 0;
  if (typeof v.toMillis === 'function') return v.toMillis();
  const t = new Date(v).getTime();
  return Number.isFinite(t) ? t : 0;
}

async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'method_not_allowed' });

  const m = String(req.headers.authorization || '').match(/^Bearer (.+)$/);
  if (!m) return send(res, 401, { error: 'unauthorized' });

  const body = readBody(req);
  const packageKey = body.packageKey;
  if (!TRIAL_PACKAGES.includes(packageKey)) return send(res, 400, { error: 'bad_package' });

  let uid;
  try {
    const app = getApp();
    const decoded = await app.auth().verifyIdToken(m[1]);
    uid = decoded.uid;
  } catch (e) {
    return send(res, 401, { error: 'unauthorized' });
  }

  try {
    const app = getApp();
    const db = app.firestore();
    const ref = db.collection('users').doc(uid);
    const now = Date.now();
    const expires = now + TRIAL_DAYS * 24 * 60 * 60 * 1000;

    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const data = snap.exists ? snap.data() : {};
      if (data.trialUsed) return 'TRIAL_USED';
      if (data.subscriptionStatus === 'active' && toMillis(data.subscriptionExpiresAt) > now) return 'ACTIVE_SUB';
      tx.set(
        ref,
        {
          package: packageKey,
          subscriptionCycle: 'trial',
          subscriptionStatus: 'active',
          subscriptionExpiresAt: admin.firestore.Timestamp.fromMillis(expires),
          trialUsed: true,
          trialStartedAt: admin.firestore.Timestamp.fromMillis(now),
        },
        { merge: true }
      );
      return 'OK';
    });

    if (result === 'TRIAL_USED') return send(res, 409, { error: 'TRIAL_USED' });
    if (result === 'ACTIVE_SUB') return send(res, 409, { error: 'ACTIVE_SUB' });
    return send(res, 200, { ok: true, packageKey, expiresAt: expires });
  } catch (e) {
    console.error('start-trial error', e && e.message);
    return send(res, 500, { error: 'server_error' });
  }
}

module.exports = handler;
module.exports.default = handler;