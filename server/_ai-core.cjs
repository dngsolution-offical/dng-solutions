// api/_ai-core.cjs — ერთიანი AI ბირთვი: ვებ-ჩატი და ტელეგრამი ერთნაირად მუშაობენ
const { initializeFirebase } = require('./_firebase.cjs');
const { AGENTS, LEVELS, DAILY, EXCEL_CONTRACT, FILE_CONTRACT } = require('./_agents.cjs');

const CLAUDE_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = process.env.CLAUDE_MODEL || process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5';
const MODEL_HEAVY = process.env.CLAUDE_MODEL_HEAVY || MODEL;
const TIMEOUT_MS = 45000;

const TELEGRAM_LIMITS = { Free: 0, Basic: 0, Gold: 0, Diamond: 3, Infinity: 10 };

class ApiError extends Error {
  constructor(status, code, message) {
    super(message || code);
    this.status = status;
    this.code = code;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function callClaude({ system, messages, maxTokens, model }) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const r = await fetch(CLAUDE_URL, {
        method: 'POST',
        signal: ctrl.signal,
        headers: {
          'content-type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: model || MODEL,
          max_tokens: maxTokens,
          system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
          messages,
        }),
      });
      if (!r.ok) {
        const t = await r.text().catch(() => '');
        const err = new Error(`claude_${r.status}: ${t.slice(0, 200)}`);
        err.retryable = r.status === 429 || r.status === 529;
        throw err;
      }
      const d = await r.json();
      return (d.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
    } catch (e) {
      const timedOut = e.name === 'AbortError';
      if (attempt === 0 && (timedOut || e.retryable)) {
        await sleep(1500);
        continue;
      }
      throw timedOut ? new Error('ai_timeout') : e;
    } finally {
      clearTimeout(timer);
    }
  }
}

function extractJson(text) {
  const cleaned = String(text || '').replace(/```json|```/gi, '').trim();
  const s = cleaned.indexOf('{');
  const e = cleaned.lastIndexOf('}');
  if (s === -1 || e === -1) throw new Error('ai_invalid_format');
  return JSON.parse(cleaned.slice(s, e + 1));
}

async function structured(args) {
  const raw = await callClaude(args);
  try {
    return { json: extractJson(raw), raw };
  } catch {
    const raw2 = await callClaude({
      ...args,
      messages: [
        ...args.messages,
        ...(raw ? [{ role: 'assistant', content: raw.slice(0, 2000) }] : []),
        { role: 'user', content: 'მხოლოდ სწორი JSON დააბრუნე, სხვა ტექსტის გარეშე.' },
      ],
    });
    return { json: extractJson(raw2), raw: raw2 };
  }
}

function buildHistory(raw) {
  let h = Array.isArray(raw)
    ? raw
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }))
    : [];
  while (h.length && h[0].role !== 'user') h.shift();
  while (h.length && h[h.length - 1].role === 'user') h.pop();
  return h;
}

async function runAgent({ uid, agentKey: requested, text, history, image, source = 'web' }) {
  const { db, FieldValue } = initializeFirebase();

  const userSnap = await db.collection('users').doc(uid).get();
  const user = userSnap.exists ? userSnap.data() : {};
  let pkg = user.package || 'Free';
  const expMs = (user.expiresAt && user.expiresAt.toMillis && user.expiresAt.toMillis()) || 0;
  if (pkg !== 'Free' && expMs && expMs < Date.now()) pkg = 'Free';

  const agentKey = AGENTS[requested] ? requested : 'standard';
  const agent = AGENTS[agentKey];
  if ((LEVELS[pkg] || 0) < LEVELS[agent.minPkg]) {
    throw new ApiError(403, 'package_required', `${agent.label} მოითხოვს ${agent.minPkg} ან უფრო მაღალ პაკეტს`);
  }

  const clean = String(text || '').trim();
  if (!clean && !(image && image.data)) throw new ApiError(400, 'message_required', 'ჩაწერე შეტყობინება');
  if (clean.length > 5000) throw new ApiError(400, 'text_too_long', 'ტექსტი ძალიან გრძელია (მაქს. 5000)');
  if (agent.kind === 'vision' && !(image && image.data)) {
    throw new ApiError(400, 'image_required', 'Vision აგენტისთვის ატვირთე სურათი');
  }

  const limit = DAILY[pkg];
  const today = new Date().toISOString().slice(0, 10);
  const usageRef = db.collection('daily_usage').doc(`${uid}_${today}`);
  const usageSnap = await usageRef.get();
  const used = usageSnap.exists ? (usageSnap.data().count || 0) : 0;
  if (limit !== -1 && used >= limit) {
    throw new ApiError(429, 'daily_limit_reached', `დღიური ლიმიტი ამოიწურა (${used}/${limit}). ხვალ განახლდება.`);
  }

  const userContent = [];
  if (image && image.data && image.mediaType) {
    userContent.push({ type: 'image', source: { type: 'base64', media_type: image.mediaType, data: image.data } });
  }
  userContent.push({ type: 'text', text: clean || 'გააანალიზე მიბმული სურათი.' });

  let system = agent.system;
  if (agent.kind === 'excel') system += EXCEL_CONTRACT;
  if (agent.kind === 'file') system += FILE_CONTRACT;

  const heavy = agent.kind === 'excel' || agent.kind === 'file' || agentKey === 'thinking' || agentKey === 'research';
  const maxTokens = heavy ? 4096 : 1500;
  const model = heavy ? MODEL_HEAVY : MODEL;
  const messages = [...buildHistory(history), { role: 'user', content: userContent }];

  let reply = '';
  let files = [];

  try {
    if (agent.kind === 'excel') {
      const { json } = await structured({ system, messages, maxTokens, model });
      const sheets = (json.sheets || [])
        .filter((s) => s && Array.isArray(s.headers))
        .map((s) => ({
          name: String(s.name || 'Sheet').slice(0, 31),
          headers: s.headers.map((h) => String(h)),
          rows: Array.isArray(s.rows) ? s.rows : [],
        }));
      if (!sheets.length) throw new Error('excel_empty');
      files = [{
        name: `DNG-${agentKey}-${Date.now()}.xlsx`,
        type: 'excel',
        size: JSON.stringify(sheets).length,
        excelData: { sheets },
      }];
      reply = String(json.summary || 'Excel ფაილი მზადაა.');
    } else if (agent.kind === 'file') {
      const { json } = await structured({ system, messages, maxTokens, model });
      const content = String(json.content || '');
      files = [{
        name: String(json.name || `dng-${Date.now()}.txt`),
        mime: String(json.mime || 'text/plain'),
        content,
        size: content.length,
      }];
      reply = String(json.summary || 'ფაილი მზადაა.');
    } else {
      reply = await callClaude({ system, messages, maxTokens, model });
      if (!reply) reply = 'პასუხი ვერ მოიძებნა, სცადე თავიდან.';
    }
  } catch (e) {
    const friendly = ['ai_invalid_format', 'excel_empty'].includes(e.message)
      ? 'AI-მ ვერ შეადგინა სწორი ფორმატი. სცადე თავიდან, უფრო კონკრეტულად.'
      : e.message === 'ai_timeout'
      ? 'AI-მ დრო ვერ მოასწრო. სცადე თავიდან.'
      : 'AI სერვისში შეცდომა მოხდა.';
    console.error('[ai-core]', e.message);
    throw new ApiError(500, 'ai_error', friendly);
  }

  await usageRef.set({
    uid,
    date: today,
    count: FieldValue.increment(1),
    lastUsedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  db.collection('agent_history').add({
    userId: uid,
    mode: agentKey,
    source,
    message: clean.slice(0, 1000),
    reply: reply.slice(0, 5000),
    model,
    createdAt: FieldValue.serverTimestamp(),
  }).catch(() => {});

  return {
    reply,
    files,
    mode: agentKey,
    package: pkg,
    limits: { used: used + 1, limit },
  };
}

module.exports = { runAgent, ApiError, TELEGRAM_LIMITS };