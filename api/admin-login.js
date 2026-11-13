// api/admin-login.js — Admin login
const { createSession, verifySession, deleteSession } = require('./_admin-sessions.cjs');

// ═══════════════════════════════════════════════════════════════
// ADMIN CREDENTIALS
// ═══════════════════════════════════════════════════════════════
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'dng_master_admin_2026';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'DnG!M@st3r#S3cur3$2026%XyZ';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  // ═══════════════ LOGIN ═══════════════
  if (req.method === 'POST') {
    const { username, password } = req.body || {};
    console.log('[admin-login] attempt:', username);

    if (!username || !password) {
      return res.status(400).json({ ok: false, error: 'missing_credentials' });
    }

    // Timing-safe comparison
    const crypto = require('crypto');
    let userMatch = false, passMatch = false;
    try {
      const ub = Buffer.from(username), eb = Buffer.from(ADMIN_USERNAME);
      const pb = Buffer.from(password), epb = Buffer.from(ADMIN_PASSWORD);
      userMatch = ub.length === eb.length && crypto.timingSafeEqual(ub, eb);
      passMatch = pb.length === epb.length && crypto.timingSafeEqual(pb, epb);
    } catch {
      userMatch = false; passMatch = false;
    }

    if (!userMatch || !passMatch) {
      console.log('[admin-login] FAILED');
      return res.status(401).json({ ok: false, error: 'invalid_credentials' });
    }

    // Create session
    const { token, expiresAt } = createSession(ADMIN_USERNAME);
    console.log('[admin-login] SUCCESS — token:', token.substring(0, 16) + '...');

    return res.json({
      ok: true,
      token,
      expiresAt,
      message: 'Login successful',
    });
  }

  // ═══════════════ VERIFY ═══════════════
  if (req.method === 'GET') {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ ok: false, error: 'no_token' });
    }
    const token = authHeader.slice(7);
    const session = verifySession(token);

    if (!session) {
      return res.status(401).json({ ok: false, error: 'invalid_session' });
    }

    return res.json({
      ok: true,
      username: session.username,
      expiresAt: session.expiresAt,
    });
  }

  // ═══════════════ LOGOUT ═══════════════
  if (req.method === 'DELETE') {
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
      deleteSession(authHeader.slice(7));
    }
    return res.json({ ok: true });
  }

  return res.status(405).json({ ok: false, error: 'method_not_allowed' });
};