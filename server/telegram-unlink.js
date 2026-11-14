// api/telegram-unlink.js — ტელეგრამ-ბოტის გათიშვა (მხოლოდ საკუთარ ჩანაწერზე)
const { initializeFirebase } = require('./_firebase.cjs');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method_not_allowed' });

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

  const chatId = String((req.body && req.body.chatId) || '');
  if (!chatId) return res.status(400).json({ ok: false, error: 'missing_chat_id' });

  const ref = db.collection('telegram_links').doc(chatId);
  const snap = await ref.get();
  if (!snap.exists || snap.data().uid !== uid) {
    return res.status(404).json({ ok: false, error: 'not_found' });
  }
  await ref.delete();
  return res.json({ ok: true });
};