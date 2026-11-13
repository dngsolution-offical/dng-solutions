// api/ai.cjs â€” FIXED Firebase init (modular API)
console.log('[ai.cjs] Loading...');

const fs = require('fs');
const path = require('path');

// â”€â”€â”€ Firebase Admin with modular API â”€â”€â”€
let admin, db, auth, initError;

try {
  console.log('[ai.cjs] Loading firebase-admin...');

  // Try modular API first (firebase-admin v11+)
  let initializeApp, cert, getApps, getApp, getFirestore, getAuth;

  try {
    const appModule = require('firebase-admin/app');
    initializeApp = appModule.initializeApp;
    cert = appModule.cert;
    getApps = appModule.getApps;
    getApp = appModule.getApp;
    console.log('[ai.cjs] Using modular API (firebase-admin/app)');
  } catch (e) {
    console.log('[ai.cjs] Modular API not available, using legacy');
  }

  try {
    const firestoreModule = require('firebase-admin/firestore');
    getFirestore = firestoreModule.getFirestore;
  } catch (e) {
    console.log('[ai.cjs] firestore module not available:', e.message);
  }

  try {
    const authModule = require('firebase-admin/auth');
    getAuth = authModule.getAuth;
  } catch (e) {
    console.log('[ai.cjs] auth module not available:', e.message);
  }

  // Load service account
  let sa = null;
  try {
    const kp = path.join(process.cwd(), 'firebase-key.json');
    console.log('[ai.cjs] Looking for:', kp);
    if (fs.existsSync(kp)) {
      sa = JSON.parse(fs.readFileSync(kp, 'utf8'));
      console.log('[ai.cjs] Key loaded for:', sa.project_id);
    }
  } catch (e) { console.error('[ai.cjs] key error:', e.message); }

  if (!sa && process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      console.log('[ai.cjs] Loaded from env');
    } catch (e) { console.error('[ai.cjs] env error:', e.message); }
  }

  if (!sa || !sa.project_id) {
    throw new Error('No service account found');
  }

  // Initialize app
  const existingApps = getApps ? getApps() : (admin?.apps || []);
  if (existingApps.length === 0) {
    console.log('[ai.cjs] Initializing app...');

    if (initializeApp && cert) {
      // Modular API
      initializeApp({ credential: cert(sa) });
      console.log('[ai.cjs] App initialized (modular)');
    } else {
      // Legacy API
      const legacyAdmin = require('firebase-admin');
      legacyAdmin.initializeApp({ credential: legacyAdmin.credential.cert(sa) });
      console.log('[ai.cjs] App initialized (legacy)');
    }
  } else {
    console.log('[ai.cjs] App already exists');
  }

  // Get Firestore
  if (getFirestore) {
    db = getFirestore();
  } else {
    const legacyAdmin = require('firebase-admin');
    db = legacyAdmin.firestore();
  }
  console.log('[ai.cjs] Firestore ready');

  // Get Auth
  if (getAuth) {
    auth = getAuth();
  } else {
    const legacyAdmin = require('firebase-admin');
    auth = legacyAdmin.auth();
  }
  console.log('[ai.cjs] Auth ready');

} catch (e) {
  initError = e.message;
  console.error('[ai.cjs] INIT FAILED:', e.message);
  console.error(e.stack);
}

const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

console.log('[ai.cjs] Model:', CLAUDE_MODEL);
console.log('[ai.cjs] API key:', process.env.ANTHROPIC_API_KEY ? 'SET' : 'MISSING');
console.log('[ai.cjs] DB:', db ? 'READY' : 'FAILED');

const SYSTEM_PROMPTS = {
  standard: 'You are DNG AI, a professional business assistant. Respond in English.',
  excel: 'You are an Excel expert. When user asks for Excel/spreadsheet, ALWAYS call "create_excel" tool.',
  file: 'You are a file generator. When user asks for a file, ALWAYS call "create_file" tool.',
  code: 'You are a code generator. When user asks for code, ALWAYS call "create_file" tool.',
};

const CREATE_EXCEL_TOOL = {
  name: 'create_excel',
  description: 'Create Excel file with sheets',
  input_schema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Filename .xlsx' },
      sheets: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            headers: { type: 'array', items: { type: 'string' } },
            rows: { type: 'array', items: { type: 'array', items: { type: 'string' } } },
          },
          required: ['name', 'headers', 'rows'],
        },
      },
      mime: { type: 'string' },
    },
    required: ['name', 'sheets', 'mime'],
  },
};

const CREATE_FILE_TOOL = {
  name: 'create_file',
  description: 'Create a file (CSV, JSON, MD, code)',
  input_schema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      content: { type: 'string' },
      mime: { type: 'string' },
    },
    required: ['name', 'content', 'mime'],
  },
};

async function callClaude({ system, messages, tools, maxTokens }) {
  console.log('[ai.cjs] Calling Claude API...');

  const body = { model: CLAUDE_MODEL, max_tokens: maxTokens, system, messages };
  if (tools && tools.length) body.tools = tools;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 55000);

  try {
    const res = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    console.log('[ai.cjs] Claude status:', res.status);

    if (!res.ok) {
      const t = await res.text().catch(() => '');
      console.error('[ai.cjs] Claude error:', res.status, t.slice(0, 400));
      if (res.status === 401) throw new Error('ai_unauthorized');
      if (res.status === 429) throw new Error('ai_rate_limited');
      throw new Error('ai_error_' + res.status);
    }
    return await res.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

async function runWithTools({ system, messages, tools }) {
  const conversation = [...messages];
  const files = [];
  let finalText = '';
  let iterations = 0;

  while (iterations < 3) {
    iterations++;
    const response = await callClaude({ system, messages: conversation, tools, maxTokens: 2048 });

    for (const block of response.content || []) {
      if (block.type === 'text') finalText += block.text;
    }

    const toolCalls = (response.content || []).filter(b => b.type === 'tool_use');
    if (toolCalls.length === 0) break;

    const toolResults = [];
    for (const call of toolCalls) {
      if (call.name === 'create_excel') {
        const inp = call.input || {};
        const sheets = Array.isArray(inp.sheets) ? inp.sheets : [];
        files.push({
          name: inp.name || 'spreadsheet.xlsx',
          content: JSON.stringify({ sheets }),
          mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          size: JSON.stringify({ sheets }).length,
          type: 'excel',
          excelData: { sheets },
        });
        toolResults.push({ type: 'tool_result', tool_use_id: call.id, content: 'Excel created.' });
      } else if (call.name === 'create_file') {
        const inp = call.input || {};
        files.push({
          name: inp.name || 'file.txt',
          content: inp.content || '',
          mime: inp.mime || 'text/plain',
          size: (inp.content || '').length,
          type: 'text',
        });
        toolResults.push({ type: 'tool_result', tool_use_id: call.id, content: 'File created.' });
      }
    }

    conversation.push({ role: 'assistant', content: response.content });
    conversation.push({ role: 'user', content: toolResults });

    if (response.stop_reason === 'end_turn') break;
  }

  return { text: finalText.trim(), files };
}

module.exports = async function handler(req, res) {
  console.log('[ai.cjs] Handler:', req.method);

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method_not_allowed' });

  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ ok: false, error: 'ai_key_missing' });
    }

    let body = req.body;
    if (!body || typeof body !== 'object') {
      try {
        const chunks = [];
        for await (const c of req) chunks.push(c);
        body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
      } catch {
        return res.status(400).json({ ok: false, error: 'invalid_body' });
      }
    }

    const { text = '', mode = 'standard', idToken = '', image = null } = body || {};

    if (!idToken) return res.status(401).json({ ok: false, error: 'unauthorized' });
    if (!text.trim() && !image) return res.status(400).json({ ok: false, error: 'empty_input' });

    if (!db || !auth) {
      return res.status(500).json({
        ok: false,
        error: 'database_unavailable',
        message: initError || 'Firebase not initialized',
      });
    }

    let uid;
    try {
      uid = (await auth.verifyIdToken(idToken)).uid;
    } catch (e) {
      return res.status(401).json({ ok: false, error: 'invalid_token', message: e.message });
    }

    let pkg = 'Free';
    try {
      const snap = await db.collection('users').doc(uid).get();
      if (snap.exists) pkg = snap.data().package || 'Free';
    } catch (e) { console.error('[user]', e.message); }

    console.log('[ai.cjs] User:', uid, 'Package:', pkg, 'Mode:', mode);

    const userMessages = [{ role: 'user', content: text.trim() }];

    let tools = [];
    if (mode === 'excel' && ['Gold', 'Diamond', 'Infinity'].includes(pkg)) tools = [CREATE_EXCEL_TOOL];
    else if (['file', 'code'].includes(mode) && pkg !== 'Free') tools = [CREATE_FILE_TOOL];

    const result = await runWithTools({
      system: SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.standard,
      messages: userMessages,
      tools,
    });

    console.log('[ai.cjs] Result: reply=' + result.text.length + ' chars, files=' + result.files.length);

    return res.status(200).json({
      ok: true,
      reply: result.text || 'Done',
      files: result.files,
      package: pkg,
      mode,
      model: CLAUDE_MODEL,
    });
  } catch (err) {
    console.error('[ai.cjs] ERROR:', err.message);
    console.error(err.stack);
    return res.status(500).json({
      ok: false,
      error: 'server_error',
      message: err.message,
      initError: initError,
    });
  }
};