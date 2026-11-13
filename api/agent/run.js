import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

let db = null;
try {
  if (!admin.apps || admin.apps.length === 0) {
    let sa = null;
    try {
      const kp = path.join(process.cwd(), 'firebase-key.json');
      if (fs.existsSync(kp)) sa = JSON.parse(fs.readFileSync(kp, 'utf8'));
    } catch (e) { console.error('[key]', e.message); }
    if (!sa) { try { sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}'); } catch {} }
    if (sa && sa.project_id) admin.initializeApp({ credential: admin.credential.cert(sa) });
    else admin.initializeApp({ credential: admin.credential.applicationDefault() });
  }
  db = admin.firestore();
} catch (e) { console.error('[fb-init]', e.message); }

const PACKAGE_LEVELS = { Free: 0, Basic: 1, Gold: 2, Diamond: 3, Infinity: 4 };
const CLAUDE_MODEL = (process.env.CLAUDE_MODEL || process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest');
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

async function callClaude(systemPrompt, userText, image = null, useThinking = false) {
  const content = [];
  if (image && image.data && image.mediaType) content.push({ type: 'image', source: { type: 'base64', media_type: image.mediaType, data: image.data } });
  content.push({ type: 'text', text: userText || ' ' });
  const body = { model: CLAUDE_MODEL, max_tokens: useThinking ? 4096 : 2048, temperature: 0, system: systemPrompt, messages: [{ role: 'user', content }] };
  if (useThinking) body.thinking = { type: 'enabled', budget_tokens: 2048 };
  const res = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    console.error('[claude]', res.status, t.slice(0, 500));
    throw new Error(res.status === 401 ? 'ai_unauthorized' : res.status === 429 ? 'ai_rate_limited' : 'ai_error');
  }
  const data = await res.json();
  const block = data.content?.find(b => b.type === 'text');
  if (!block?.text) throw new Error('ai_empty');
  return block.text;
}

function parseJSON(raw) {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try { return JSON.parse(cleaned); } catch {
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0]); } catch {} }
    throw new Error('ai_invalid_format');
  }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method_not_allowed' });

  let body = req.body;
  if (!body || typeof body !== 'object') {
    try { const chunks = []; for await (const c of req) chunks.push(c); body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch { body = {}; }
  }

  const { agentId, text, idToken, image = null } = body || {};
  if (!agentId) return res.status(400).json({ ok: false, error: 'missing_agent_id' });
  if (!text && !image) return res.status(400).json({ ok: false, error: 'missing_input' });
  if (!idToken) return res.status(401).json({ ok: false, error: 'unauthorized' });

  let uid;
  try { uid = (await admin.auth().verifyIdToken(idToken)).uid; } catch { return res.status(401).json({ ok: false, error: 'unauthorized' }); }

  if (!db) return res.status(500).json({ ok: false, error: 'database_unavailable' });

  let user = {}, agent = null;
  try {
    const [uSnap, aSnap] = await Promise.all([db.collection('users').doc(uid).get(), db.collection('agents').doc(agentId).get()]);
    user = uSnap.exists ? uSnap.data() : { package: 'Free' };
    agent = aSnap.exists ? aSnap.data() : null;
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'database_error', message: e.message });
  }

  if (!agent) return res.status(404).json({ ok: false, error: 'agent_not_found' });
  if (!agent.enabled) return res.status(403).json({ ok: false, error: 'agent_disabled' });

  const userLevel = PACKAGE_LEVELS[user.package || 'Free'] ?? 0;
  const reqLevel = PACKAGE_LEVELS[agent.minPackage] ?? 0;
  if (userLevel < reqLevel) return res.status(403).json({ ok: false, error: 'package_required', required: agent.minPackage });

  let result;
  try {
    const useThinking = agentId === 'thinking-agent';
    const raw = await callClaude(agent.systemPrompt, text || 'Analyze input.', image, useThinking);
    result = parseJSON(raw);
  } catch (e) {
    const map = { ai_unauthorized: [401, 'ai_unauthorized'], ai_rate_limited: [429, 'ai_rate_limited'], ai_invalid_format: [502, 'ai_invalid_format'], ai_empty: [502, 'ai_empty'], ai_error: [500, 'ai_error'] };
    const pair = map[e.message] || [500, 'ai_error'];
    return res.status(pair[0]).json({ ok: false, error: pair[1], message: e.message });
  }

  const runId = db.collection('agent_runs').doc().id;
  try {
    await db.collection('agent_runs').doc(runId).set({
      uid, agentId, agentName: agent.name,
      input: text ? String(text).slice(0, 2000) : null, hasImage: !!image,
      output: result, createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (e) { console.error('[agent-run]', e.message); }

  return res.status(200).json({ ok: true, agentId, agentName: agent.name, runId, data: result });
}