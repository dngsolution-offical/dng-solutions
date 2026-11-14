// server/admin.js — ადმინ პანელის API: მომხმარებლების სია, პაკეტის მინიჭება/მოხსნა, როლი
const { initializeFirebase } = require('./_firebase.cjs');
const { verifyToken } = require('./admin-session.cjs');
const { toMs, effectiveExpiry } = require('./_plan.cjs');

const PACKAGES = ['Free', 'Basic', 'Gold', 'Diamond', 'Infinity'];
const ROLES = ['user', 'admin'];
const DAY = 24 * 60 * 60 * 1000;
const MAX_DAYS = 3650;
const MAX_USERS = 5000;

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
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

function bearer(req) {
  const m = String(req.headers.authorization || '').match(/^Bearer (.+)$/);
  return m ? m[1] : null;
}

function iso(ms) {
  return ms ? new Date(ms).toISOString() : null;
}

function parseDays(v, fallback) {
  const n = v === undefined || v === null || v === '' ? fallback : Number(v);
  return Number.isInteger(n) && n >= 1 && n <= MAX_DAYS ? n : null;
}

async function listAuthUsers(auth) {
  const all = [];
  let pageToken;
  do {
    const page = await auth.listUsers(1000, pageToken);
    all.push(...page.users);
    pageToken = page.pageToken;
  } while (pageToken && all.length < MAX_USERS);
  return all;
}

function buildRow(uid, au, d, now) {
  const expMs = effectiveExpiry(d);
  const pkg = PACKAGES.includes(d.package) ? d.package : 'Free';
  const active = pkg !== 'Free' && (!expMs || expMs > now);
  const meta = (au && au.metadata) || {};
  const createdMs = meta.creationTime ? new Date(meta.creationTime).getTime() : toMs(d.createdAt);
  const lastMs = meta.lastSignInTime ? new Date(meta.lastSignInTime).getTime() : 0;
  return {
    uid,
    email: (au && au.email) || d.email || '',
    name: (au && au.displayName) || d.name || d.displayName || d.username || '',
    package: pkg,
    role: d.role === 'admin' ? 'admin' : 'user',
    ordersUsed: Number(d.ordersUsed) || 0,
    active,
    expiresAt: iso(expMs),
    createdAt: iso(createdMs),
    lastLoginAt: iso(lastMs),
    disabled: !!(au && au.disabled),
    inAuth: !!au,
  };
}

module.exports = async function handler(req, res) {
  const token = bearer(req);
  if (!token) return send(res, 401, { ok: false, error: 'no_token' });

  let session;
  try {
    session = verifyToken(token);
  } catch (e) {
    return send(res, 500, { ok: false, error: 'admin_not_configured' });
  }
  if (!session) return send(res, 401, { ok: false, error: 'invalid_session' });

  let fb;
  try {
    fb = initializeFirebase();
  } catch (e) {
    console.error('[admin] firebase init failed:', e.message);
    return send(res, 500, { ok: false, error: 'firebase_init_failed' });
  }
  const { admin, db, auth, FieldValue } = fb;
  const Timestamp = admin.firestore.Timestamp;
  const actor = session.u;

  // ─── სია: Firebase Auth + Firestore ერთად ───
  if (req.method === 'GET') {
    try {
      const [authUsers, snap] = await Promise.all([listAuthUsers(auth), db.collection('users').get()]);
      const docs = new Map();
      snap.forEach((doc) => docs.set(doc.id, doc.data()));

      const now = Date.now();
      const seen = new Set();
      const users = [];
      for (const au of authUsers) {
        seen.add(au.uid);
        users.push(buildRow(au.uid, au, docs.get(au.uid) || {}, now));
      }
      for (const [uid, d] of docs) {
        if (!seen.has(uid)) users.push(buildRow(uid, null, d, now));
      }
      users.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
      return send(res, 200, { ok: true, users, packages: PACKAGES });
    } catch (e) {
      console.error('[admin GET]', e.message);
      return send(res, 500, { ok: false, error: 'db_error', detail: e.message });
    }
  }

  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method_not_allowed' });

  const body = readBody(req);
  const userId = typeof body.userId === 'string' ? body.userId.trim() : '';
  if (!userId) return send(res, 400, { ok: false, error: 'missing_userId' });

  const action = body.action || (body.packageName ? 'grant' : body.role ? 'role' : '');
  const now = Date.now();
  const ref = db.collection('users').doc(userId);

  // ყველა ველი, რომელსაც სისტემა ვადისთვის კითხულობს — ერთდროულად ვწერთ
  const planPatch = (pkg, expMs) => {
    const ts = Timestamp.fromMillis(expMs);
    return {
      package: pkg,
      expiresAt: ts,
      packageExpiresAt: ts,
      subscriptionExpiresAt: ts,
      subscriptionStatus: 'active',
      subscriptionCycle: 'admin',
      packageUpdatedAt: FieldValue.serverTimestamp(),
      packageUpdatedBy: actor,
    };
  };

  try {
    if (action === 'grant') {
      const pkg = body.packageName;
      const days = parseDays(body.days, 30);
      if (!PACKAGES.includes(pkg) || pkg === 'Free') return send(res, 400, { ok: false, error: 'invalid_package' });
      if (days === null) return send(res, 400, { ok: false, error: 'invalid_days' });
      const expMs = now + days * DAY;
      await ref.set(planPatch(pkg, expMs), { merge: true });
      return send(res, 200, { ok: true, action, userId, package: pkg, expiresAt: iso(expMs) });
    }

    if (action === 'extend') {
      const days = parseDays(body.days, 30);
      if (days === null) return send(res, 400, { ok: false, error: 'invalid_days' });
      const snap = await ref.get();
      const d = snap.exists ? snap.data() : {};
      const requested = body.packageName;
      const pkg = PACKAGES.includes(requested) && requested !== 'Free' ? requested : d.package;
      if (!pkg || pkg === 'Free' || !PACKAGES.includes(pkg)) {
        return send(res, 400, { ok: false, error: 'no_active_package_to_extend' });
      }
      const base = Math.max(now, effectiveExpiry(d));
      const expMs = base + days * DAY;
      await ref.set(planPatch(pkg, expMs), { merge: true });
      return send(res, 200, { ok: true, action, userId, package: pkg, expiresAt: iso(expMs) });
    }

    if (action === 'revoke') {
      await ref.set(
        {
          package: 'Free',
          expiresAt: null,
          packageExpiresAt: null,
          subscriptionExpiresAt: null,
          subscriptionStatus: 'inactive',
          packageUpdatedAt: FieldValue.serverTimestamp(),
          packageUpdatedBy: actor,
        },
        { merge: true }
      );
      return send(res, 200, { ok: true, action, userId, package: 'Free' });
    }

    if (action === 'role') {
      if (!ROLES.includes(body.role)) return send(res, 400, { ok: false, error: 'invalid_role' });
      await ref.set(
        { role: body.role, roleUpdatedAt: FieldValue.serverTimestamp(), roleUpdatedBy: actor },
        { merge: true }
      );
      return send(res, 200, { ok: true, action, userId, role: body.role });
    }

    return send(res, 400, { ok: false, error: 'unknown_action' });
  } catch (e) {
    console.error('[admin POST]', e.message);
    return send(res, 500, { ok: false, error: 'update_failed', detail: e.message });
  }
};