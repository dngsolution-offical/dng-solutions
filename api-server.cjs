// api-server.cjs — ლოკალური API სერვერი (npm run dev:api)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    time: new Date().toISOString(),
    env: {
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      bog: !!process.env.BOG_CLIENT_ID,
      siteUrl: process.env.VITE_SITE_URL || null,
      firebaseKeyFile: fs.existsSync(path.join(process.cwd(), 'firebase-key.json')),
    },
  });
});

const ROUTES = [
  ['/api/ai', 'ai'],
  ['/api/agent-chat', 'agent-chat'],
  ['/api/parse-order', 'parse-order'],
  ['/api/quickpay', 'quickpay'],
  ['/api/quickpay-callback', 'quickpay-callback'],
  ['/api/bog-create-order', 'bog-create-order'],
  ['/api/bog-callback', 'bog-callback'],
  ['/api/bog-status', 'bog-status'],
  ['/api/public-stats', 'public-stats'],
  ['/api/admin', 'admin'],
  ['/api/admin-login', 'admin-login'],
  ['/api/telegram-webhook', 'telegram-webhook'],
  ['/api/telegram-link', 'telegram-link'],
  ['/api/telegram-status', 'telegram-status'],
  ['/api/telegram-unlink', 'telegram-unlink'],
];

for (const [route, file] of ROUTES) {
  const base = path.join(__dirname, 'api', file);
  const filePath = fs.existsSync(base + '.cjs') ? base + '.cjs' : base + '.js';
  if (!fs.existsSync(filePath)) {
    console.log(`[api-server] ⚠️  MISSING ${route} (${file})`);
    continue;
  }
  try {
    const mod = require(filePath);
    const handler = typeof mod === 'function' ? mod : mod.default;
    if (typeof handler !== 'function') throw new Error('handler is not a function');
    app.all(route, async (req, res) => {
      try {
        await handler(req, res);
      } catch (e) {
        console.error(`[api-server] ${route} ERROR:`, e);
        if (!res.headersSent) res.status(500).json({ ok: false, error: 'server_error', message: e.message });
      }
    });
    console.log(`[api-server] ✅ ${route}`);
  } catch (e) {
    console.error(`[api-server] ❌ ${route}: ${e.message}`);
  }
}

app.use((req, res) => res.status(404).json({ ok: false, error: 'not_found', path: req.path }));

app.listen(PORT, () => {
  console.log('');
  console.log(`  ✅ DNG API SERVER — http://localhost:${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/health`);
  console.log('');
});

process.on('SIGINT', () => {
  console.log('\n[api-server] Shutdown');
  process.exit(0);
});