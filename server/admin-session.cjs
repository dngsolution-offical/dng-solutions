// server/admin-session.cjs — ხელმოწერილი ადმინ-ტოკენი (სერვერზე მდგომარეობის გარეშე)
const crypto = require('crypto');

const TTL_MS = 12 * 60 * 60 * 1000; // 12 საათი

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET || '';
  if (s.length < 32) throw new Error('ADMIN_SESSION_SECRET_MISSING');
  return s;
}

function b64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function fromB64url(s) {
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

function sign(payload) {
  return b64url(crypto.createHmac('sha256', secret()).update(payload).digest());
}

function issueToken(username) {
  const exp = Date.now() + TTL_MS;
  const payload = b64url(JSON.stringify({ u: username, exp }));
  return { token: payload + '.' + sign(payload), expiresAt: exp };
}

function verifyToken(token) {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  let data;
  try {
    data = JSON.parse(fromB64url(payload));
  } catch (e) {
    return null;
  }
  if (!data || typeof data.exp !== 'number' || data.exp < Date.now()) return null;
  return { u: data.u, exp: data.exp };
}

module.exports = { issueToken, verifyToken, TTL_MS };