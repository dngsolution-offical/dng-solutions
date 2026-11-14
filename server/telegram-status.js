// api/telegram-status.js — მომხმარებლის ტელეგრამ-ბოტების სტატუსი
const { initializeFirebase } = require('./_firebase.cjs');
const { TELEGRAM_LIMITS } = require('./_ai-core.cjs');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  let db, auth;
  try {
    ({ db, auth } = initializeFirebase());
  } catch {
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

  const linked = await db.collection('telegram_links').where('uid', '==', uid).get();
  const links = linked.docs.map((d) => {
    const x = d.data();
    return {
      chatId: d.id,
      agent: x.agent || 'standard',
      linkedAt: x.linkedAt && x.linkedAt.toMillis ? x.linkedAt.toMillis() : null,
    };
  });

  return res.json({ ok: true, package: pkg, limit, used: links.length, links });
};