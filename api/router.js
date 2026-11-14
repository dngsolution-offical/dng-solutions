// api/router.js — ყველა API მარშრუტი ერთ ფუნქციაში
const path = require('path');

const ROUTES = {
  'ai': 'ai.js',
  'usage-stats': 'usage-stats.js',
  'telegram-webhook': 'telegram-webhook.js',
  'telegram-link': 'telegram-link.js',
  'telegram-status': 'telegram-status.js',
  'telegram-unlink': 'telegram-unlink.js',
  'bog-create-order': 'bog-create-order.js',
  'bog-callback': 'bog-callback.js',
  'bog-status': 'bog-status.js',
  'start-trial': 'start-trial.cjs',
};

module.exports = async function handler(req, res) {
  const raw = req.query.slug;
  const segs = Array.isArray(raw) ? raw : (raw ? [raw] : []);
  const name = segs.join('/');
  const file = ROUTES[name];

  if (!file) {
    return res.status(404).json({ ok: false, error: 'not_found', debug: { url: req.url, query: req.query, name } });
  }

  try {
    const mod = require(path.join(__dirname, '..', 'server', file));
    const fn = typeof mod === 'function' ? mod : mod.default;
    return await fn(req, res);
  } catch (e) {
    console.error(`[api:${name}]`, e);
    if (!res.headersSent) res.status(500).json({ ok: false, error: 'server_error', message: e.message });
  }
};