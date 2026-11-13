import express from 'express';
import path from 'path';
import fs from 'fs';
import { pathToFileURL, fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: '10mb' }));

app.use(async (req, res) => {
  const rel = req.path.replace(/^\/+|\/+$/g, '');
  if (!rel) return res.status(404).json({ ok: false, error: 'not_found' });

  const base = path.join(__dirname, 'api', rel);
  const file = [base + '.js', base + '.mjs'].find((f) => fs.existsSync(f));
  if (!file) return res.status(404).json({ ok: false, error: 'not_found', path: rel });

  try {
    const mod = await import(pathToFileURL(file).href);
    return mod.default(req, res);
  } catch (e) {
    console.error('[api-server]', rel, e.message);
    return res.status(500).json({ ok: false, error: 'handler_failed', message: e.message });
  }
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`));