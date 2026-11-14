// server/admin-login.js — ადმინის შესვლა (ფარული მონაცემები მხოლოდ Vercel-ის env-ში)
const crypto = require('crypto');
const { issueToken, verifyToken } = require('./admin-session.cjs');

const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;
const failures = new Map(); // ip -> { count, lockedUntil }

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

function clientIp(req) {
  const fwd = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return fwd || (req.socket && req.socket.remoteAddress) || 'unknown';
}

function sameSecret(given, expected) {
  const a = crypto.createHash('sha256').update(String(given)).digest();
  const b = crypto.createHash('sha256').update(String(expected)).digest();
  return crypto.timingSafeEqual(a, b);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = async function handler(req, res) {
  if (req.method === 'POST') {
    const ip = clientIp(req);
    const rec = failures.get(ip);
    if (rec && rec.lockedUntil > Date.now()) {
      return send(res, 429, { ok: false, error: 'too_many_attempts' });
    }

    const expUser = process.env.ADMIN_USERNAME || '';
    const expPass = process.env.ADMIN_PASSWORD || '';
    if (!expUser || !expPass || !process.env.ADMIN_SESSION_SECRET) {
      return send(res, 500, { ok: false, error: 'admin_not_configured' });
    }

    const body = readBody(req);
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const ok = username !== '' && password !== '' && sameSecret(username, expUser) && sameSecret(password, expPass);

    if (!ok) {
      const prev = rec && rec.lockedUntil && rec.lockedUntil <= Date.now() ? null : rec;
      const count = (prev ? prev.count : 0) + 1;
      failures.set(ip, { count, lockedUntil: count >= MAX_FAILS ? Date.now() + LOCK_MS : 0 });
      await sleep(800);
      return send(res, 401, { ok: false, error: 'invalid_credentials' });
    }

    failures.delete(ip);
    const { token, expiresAt } = issueToken(expUser);
    return send(res, 200, { ok: true, token, expiresAt });
  }

  if (req.method === 'GET') {
    const token = bearer(req);
    if (!token) return send(res, 401, { ok: false, error: 'no_token' });
    let session;
    try {
      session = verifyToken(token);
    } catch (e) {
      return send(res, 500, { ok: false, error: 'admin_not_configured' });
    }
    if (!session) return send(res, 401, { ok: false, error: 'invalid_session' });
    return send(res, 200, { ok: true, username: session.u, expiresAt: session.exp });
  }

  if (req.method === 'DELETE') return send(res, 200, { ok: true });

  return send(res, 405, { ok: false, error: 'method_not_allowed' });
};