// api/ai.js — ვებ-ჩატის AI endpoint
const { initializeFirebase } = require('./_firebase.cjs');
const { runAgent, ApiError } = require('./_ai-core.cjs');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method_not_allowed' });

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ ok: false, error: 'ai_key_missing', message: 'ANTHROPIC_API_KEY არ არის დაყენებული' });
  }

  let auth;
  try {
    ({ auth } = initializeFirebase());
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'database_unavailable', message: e.message });
  }

  const body = req.body || {};
  const idToken = body.idToken || String(req.headers.authorization || '').replace(/^Bearer /, '');
  if (!idToken) return res.status(401).json({ ok: false, error: 'no_token', message: 'საჭიროა შესვლა' });

  let uid;
  try {
    uid = (await auth.verifyIdToken(idToken)).uid;
  } catch {
    return res.status(401).json({ ok: false, error: 'invalid_token', message: 'სესია ამოიწურა, შედი თავიდან' });
  }

  try {
    const r = await runAgent({
      uid,
      agentKey: body.mode || body.agentId || 'standard',
      text: body.text,
      history: body.history,
      image: body.image,
      source: 'web',
    });
    return res.json({
      ok: true,
      reply: r.reply,
      files: r.files,
      mode: r.mode,
      package: r.package,
      limits: { daily: r.limits },
    });
  } catch (e) {
    if (e instanceof ApiError) return res.status(e.status).json({ ok: false, error: e.code, message: e.message });
    console.error('[ai]', e);
    return res.status(500).json({ ok: false, error: 'server_error', message: e.message });
  }
};