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

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  if (!db) return res.status(500).json({ ok: false, error: 'database_unavailable' });
  try {
    const snap = await db.collection('agents').where('enabled', '==', true).get();
    const agents = snap.docs.map(d => {
      const x = d.data();
      return { id: d.id, name: x.name, icon: x.icon, category: x.category, description: x.description, minPackage: x.minPackage, sortOrder: x.sortOrder || 0 };
    }).sort((a, b) => a.sortOrder - b.sortOrder);
    return res.status(200).json({ ok: true, agents });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'database_error', message: e.message });
  }
}