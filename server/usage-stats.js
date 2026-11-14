// server/usage-stats.js — მომხმარებლის AI სტატისტიკა დაშბორდისთვის
const { initializeFirebase } = require('./_firebase.cjs');
const { TELEGRAM_LIMITS } = require('./_ai-core.cjs');
const { DAILY } = require('./_agents.cjs');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'method_not_allowed' });

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
  const user = userSnap.exists ? userSnap.data() : {};
  const pkg = user.package || 'Free';

  const iso = (ms) => new Date(ms).toISOString().slice(0, 10);
  const today = iso(Date.now());
  const days = [];
  for (let i = 13; i >= 0; i--) days.push(iso(Date.now() - i * 86400000));

  const usageSnap = await db.collection('daily_usage').where('uid', '==', uid).get();
  const usageMap = {};
  usageSnap.forEach((d) => {
    const x = d.data();
    usageMap[x.date] = x.count || 0;
  });
  const series = days.map((d) => ({ date: d, count: usageMap[d] || 0 }));

  const histSnap = await db.collection('agent_history').where('userId', '==', uid).limit(300).get();
  const history = histSnap.docs
    .map((d) => {
      const x = d.data();
      return {
        mode: x.mode || 'standard',
        source: x.source || 'web',
        message: String(x.message || '').slice(0, 160),
        createdAt: x.createdAt && x.createdAt.toMillis ? x.createdAt.toMillis() : 0,
      };
    })
    .sort((a, b) => b.createdAt - a.createdAt);

  const perAgent = {};
  const perSource = { web: 0, telegram: 0 };
  history.forEach((h) => {
    perAgent[h.mode] = (perAgent[h.mode] || 0) + 1;
    perSource[h.source] = (perSource[h.source] || 0) + 1;
  });

  const linked = await db.collection('telegram_links').where('uid', '==', uid).get();

  return res.json({
    ok: true,
    package: pkg,
    daily: { used: usageMap[today] || 0, limit: DAILY[pkg] ?? 10 },
    telegram: { used: linked.size, limit: TELEGRAM_LIMITS[pkg] || 0 },
    series,
    totalMessages: history.length,
    perAgent,
    perSource,
    recent: history.slice(0, 10),
  });
};