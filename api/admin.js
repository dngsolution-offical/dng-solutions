// api/admin.js — Admin panel API (v14 compatible)
const { initializeFirebase } = require('./_firebase.cjs');
const { verifySession } = require('./_admin-sessions.cjs');

const PACKAGES = ['Free', 'Basic', 'Gold', 'Diamond', 'Infinity'];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  // INIT FIREBASE
  let admin, db;
  try {
    const init = initializeFirebase();
    admin = init.admin;
    db = init.db;
    if (!db) throw new Error('Firestore not initialized');
  } catch (e) {
    console.error('[admin] firebase init failed:', e.message);
    return res.status(500).json({ ok: false, error: 'firebase_init_failed', detail: e.message });
  }

  // AUTH
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, error: 'no_token' });
  }
  const token = authHeader.slice(7);
  const session = verifySession(token);
  if (!session) {
    return res.status(401).json({ ok: false, error: 'invalid_session' });
  }

  // GET — list users
  if (req.method === 'GET') {
    try {
      const usersSnap = await db.collection('users').limit(500).get();
      const users = [];
      usersSnap.forEach(doc => {
        const d = doc.data();
        users.push({
          uid: doc.id,
          email: d.email || '',
          name: d.name || d.displayName || '',
          package: d.package || 'Free',
          role: d.role || 'user',
          ordersUsed: d.ordersUsed || 0,
          expiresAt: d.expiresAt?.toDate?.()?.toISOString?.() || null,
        });
      });
      return res.json({ ok: true, users, packages: PACKAGES });
    } catch (e) {
      console.error('[admin GET]', e.message);
      return res.status(500).json({ ok: false, error: 'db_error', detail: e.message });
    }
  }

  // POST — update user package
  if (req.method === 'POST') {
    const { userId, packageName, days = 30, role } = req.body || {};
    if (!userId) return res.status(400).json({ ok: false, error: 'missing_userId' });

    console.log('[admin POST] userId:', userId, '| package:', packageName, '| days:', days);

    try {
      const update = {};

      if (packageName) {
        if (!PACKAGES.includes(packageName)) {
          return res.status(400).json({ ok: false, error: 'invalid_package', valid: PACKAGES });
        }
        update.package = packageName;

        // serverTimestamp — v14 safe
        try {
          const firestoreModule = require('firebase-admin/firestore');
          update.packageUpdatedAt = firestoreModule.FieldValue.serverTimestamp();
        } catch {
          update.packageUpdatedAt = new Date();
        }

        // expiresAt
        if (packageName === 'Free') {
          update.expiresAt = null;
        } else {
          const expiresAt = new Date(Date.now() + Number(days) * 24 * 60 * 60 * 1000);
          try {
            const firestoreModule = require('firebase-admin/firestore');
            update.expiresAt = firestoreModule.Timestamp.fromDate(expiresAt);
          } catch {
            update.expiresAt = expiresAt;
          }
        }
      }

      if (role && ['user', 'admin'].includes(role)) {
        update.role = role;
      }

      if (Object.keys(update).length === 0) {
        return res.status(400).json({ ok: false, error: 'no_changes' });
      }

      await db.collection('users').doc(userId).update(update);
      console.log('[admin POST] ✅ SUCCESS');
      return res.json({ ok: true, userId, update: Object.keys(update) });
    } catch (e) {
      console.error('[admin POST] ERROR:', e.message);
      console.error('[admin POST] Stack:', e.stack);
      return res.status(500).json({ ok: false, error: 'update_failed', detail: e.message, stack: e.stack?.split('\n').slice(0, 3).join('\n') });
    }
  }

  return res.status(405).json({ ok: false, error: 'method_not_allowed' });
};