// api/parse-order.cjs — CommonJS
const fs = require('fs');
const path = require('path');

let admin, db, auth;
try {
  admin = require('firebase-admin');
  if (!admin.apps || admin.apps.length === 0) {
    let sa = null;
    try {
      const kp = path.join(process.cwd(), 'firebase-key.json');
      if (fs.existsSync(kp)) sa = JSON.parse(fs.readFileSync(kp, 'utf8'));
    } catch (e) {}
    if (!sa && process.env.FIREBASE_SERVICE_ACCOUNT) {
      try { sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT); } catch {}
    }
    if (sa && sa.project_id) {
      admin.initializeApp({ credential: admin.credential.cert(sa) });
    } else {
      admin.initializeApp({ credential: admin.credential.applicationDefault() });
    }
  }
  db = admin.firestore();
  auth = admin.auth();
} catch (e) { console.error('[fb-init]', e.message); }

const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-haiku-4-5-20251001';
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method_not_allowed' });

  let body = req.body;
  if (!body || typeof body !== 'object') {
    try {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
    } catch { body = {}; }
  }

  const { text, idToken } = body || {};

  if (!text || typeof text !== 'string' || text.trim().length < 3) {
    return res.status(400).json({ ok: false, error: 'invalid_text' });
  }
  if (!idToken) return res.status(401).json({ ok: false, error: 'unauthorized' });
  if (!auth) return res.status(500).json({ ok: false, error: 'firebase_init_failed' });

  try {
    await auth.verifyIdToken(idToken);
  } catch (e) {
    return res.status(401).json({ ok: false, error: 'invalid_token', message: e.message });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ ok: false, error: 'ai_key_missing' });
  }

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        temperature: 0,
        system: 'Extract event order data. Return ONLY JSON: {"orderDate":null,"clientName":null,"celebrantName":null,"guests":null,"menuKey":null,"programKey":null,"durationMinutes":null,"extras":[],"paidAmount":null,"status":null,"missingFields":[],"confidence":0}',
        messages: [{ role: 'user', content: text.trim() }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return res.status(response.status).json({ ok: false, error: 'ai_error', detail: errText.slice(0, 200) });
    }

    const data = await response.json();
    const raw = data.content?.find(b => b.type === 'text')?.text || '{}';
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    let parsed;
    try { parsed = JSON.parse(cleaned); } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : {};
    }

    return res.status(200).json({ ok: true, data: parsed, model: CLAUDE_MODEL });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'ai_request_failed', message: err.message });
  }
};