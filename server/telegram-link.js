// api/telegram-link.js — ქმნის ერთჯერად კოდს ტელეგრამში ანგარიშის მისაბმელად
const crypto = require('crypto');
const { initializeFirebase } = require('./_firebase.cjs');
const { TELEGRAM_LIMITS } = require('./_ai-core.cjs');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method_not_allowed' });

  let db, auth, FieldValue, Timestamp;
  try {
    ({ db, auth, FieldValue, Timestamp } = initializeFirebase());
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'database_unavailable' });
  }

  const idToken = String(req.headers.authorization || '').replace(/^Bearer /, '');
  if (!idToken) return res.status(401).json({ ok: false, error: 'no_token' });

  let uid;
  try {
    uid = (await auth.verifyIdToken(idToken)).uid;
  } catch {
    return res.status(401).json({ ok: false, error: 'invalid_token' });
  }

  const userSnap = await db.collection('users').doc(uid).get();
  const pkg = (userSnap.exists && userSnap.data().package) || 'Free';
  const limit = TELEGRAM_LIMITS[pkg] || 0;
  if (!limit) {
    return res.status(403).json({ ok: false, error: 'package_required', message: 'ტელეგრამ-ბოტი თქვენს პაკეტში არ შედის' });
  }

  const linked = await db.collection('telegram_links').where('uid', '==', uid).get();
  if (linked.size >= limit) {
    return res.status(403).json({ ok: false, error: 'limit_reached', message: `ბოტების ლიმიტი (${limit}) ამოიწურა` });
  }

  const code = crypto.randomBytes(5).toString('hex').toUpperCase();
  await db.collection('telegram_codes').doc(code).set({
    uid,
    createdAt: FieldValue.serverTimestamp(),
    expiresAt: Timestamp.fromMillis(Date.now() + 15 * 60 * 1000),
  });

  const username = process.env.TELEGRAM_BOT_USERNAME;
  return res.json({
    ok: true,
    code,
    deepLink: username ? `https://t.me/${username}?start=${code}` : null,
    expiresInMin: 15,
  });
};