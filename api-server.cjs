// api-server.cjs — DNG API Server
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

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    env: {
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
      hasFirebaseKey: fs.existsSync(path.join(process.cwd(), 'firebase-key.json')),
      testMode: process.env.PAYMENT_TEST_MODE === 'true',
    },
  });
});

function loadRoute(routePath, baseName) {
  const apiDir = path.join(__dirname, 'api');
  const candidates = [
    path.join(apiDir, baseName + '.cjs'),
    path.join(apiDir, baseName + '.js'),
  ];

  for (const filePath of candidates) {
    if (!fs.existsSync(filePath)) continue;

    try {
      delete require.cache[require.resolve(filePath)];
      const mod = require(filePath);
      const handler = typeof mod === 'function' ? mod : mod.default;

      if (typeof handler !== 'function') {
        console.log(`[api-server] SKIP ${routePath}: not a function`);
        continue;
      }

      app.all(routePath, async (req, res) => {
        try { 
          await handler(req, res); 
        } catch (err) {
          console.error(`[api-server] ${routePath} ERROR:`, err.message);
          if (!res.headersSent) {
            res.status(500).json({ ok: false, error: 'server_error', message: err.message });
          }
        }
      });

      console.log(`[api-server] ✅ ${routePath} (${path.basename(filePath)})`);
      return;
    } catch (err) {
      console.log(`[api-server] ❌ ${path.basename(filePath)}: ${err.message.slice(0, 80)}`);
    }
  }

  console.log(`[api-server] ⚠️  MISSING ${routePath}`);
}

// Load routes
loadRoute('/api/ai', 'ai');
loadRoute('/api/quickpay', 'quickpay');
loadRoute('/api/quickpay-callback', 'quickpay-callback');
loadRoute('/api/parse-order', 'parse-order');
loadRoute('/api/agent-chat', 'agent-chat');
loadRoute('/api/export-excel', 'export-excel');
loadRoute('/api/public-stats', 'public-stats');
loadRoute('/api/admin', 'admin');
loadRoute('/api/admin-login', 'admin-login');

app.use((req, res) => res.status(404).json({ ok: false, error: 'not_found', path: req.path }));

app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log(`  ✅ DNG API SERVER — http://localhost:${PORT}`);
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log(`  Health: http://localhost:${PORT}/health`);
  console.log(`  Test Mode: ${process.env.PAYMENT_TEST_MODE === 'true' ? 'ENABLED' : 'DISABLED'}`);
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('');
});

process.on('SIGINT', () => {
  console.log('\n[api-server] Shutdown');
  process.exit(0);
});