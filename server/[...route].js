// api/[...route].js — ერთი Vercel ფუნქცია ყველა API მარშრუტისთვის
const path = require('path');

const ROUTES = {
  'ai': 'ai.js',
  'telegram-webhook': 'telegram-webhook.js',
  'telegram-link': 'telegram-link.js',
  'telegram-status': 'telegram-status.js',
  'telegram-unlink': 'telegram-unlink.js',
  'bog-create-order': 'bog-create-order.js',
  'bog-callback': 'bog-callback.js',
  'bog-status': 'bog-status.js',
};

module.exports = async function handler(req, res) {
  const r = req.query && req.query.route;
  const name = (Array.isArray(r) ? r : String(r || '').split('/')).filter(Boolean).join('/');
  const file = ROUTES[name];
  if (!file) return res.status(404).json({ ok: false, error: 'not_found', path: name });

  try {
    const mod = require(path.join(process.cwd(), 'server', file));
    const fn = typeof mod === 'function' ? mod : mod.default;
    return await fn(req, res);
  } catch (e) {
    console.error(`[api:${name}]`, e);
    if (!res.headersSent) res.status(500).json({ ok: false, error: 'server_error', message: e.message });
  }
};