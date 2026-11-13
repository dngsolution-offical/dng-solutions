// api/_admin-sessions.cjs — Shared session store
// Both admin-login.js and admin.js require this same module instance

const sessions = new Map();
const SESSION_TTL = 24 * 60 * 60 * 1000; // 24 hours

function generateToken() {
  const crypto = require('crypto');
  return crypto.randomBytes(48).toString('hex');
}

function createSession(username) {
  const token = generateToken();
  const expiresAt = Date.now() + SESSION_TTL;
  sessions.set(token, {
    username,
    createdAt: Date.now(),
    expiresAt,
  });
  return { token, expiresAt };
}

function verifySession(token) {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return session;
}

function deleteSession(token) {
  return sessions.delete(token);
}

function cleanup() {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (session.expiresAt < now) sessions.delete(token);
  }
}

// Cleanup every 10 min
setInterval(cleanup, 10 * 60 * 1000);

module.exports = {
  createSession,
  verifySession,
  deleteSession,
  cleanup,
  SESSION_TTL,
};