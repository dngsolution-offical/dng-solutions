import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

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
const db = admin.firestore();

const AGENTS = [
  { id: 'order-builder', name: 'Order Builder', icon: 'Grid', category: 'orders', description: 'Build complete event orders from text, photo or file.', systemPrompt: 'You are an expert order builder for Georgian event venues. Extract order details. Return ONLY JSON: {"orderDate":null,"clientName":null,"celebrantName":null,"guests":null,"menuKey":null,"programKey":null,"durationMinutes":null,"extras":[],"paidAmount":null,"status":null,"missingFields":[],"confidence":0}. Use null for missing. Never invent. menuKey/programKey must be standard|premium|vip|kids|veg.', minPackage: 'Free', enabled: true, sortOrder: 1 },
  { id: 'email-agent', name: 'Email Agent', icon: 'Mail', category: 'communication', description: 'Draft professional client messages.', systemPrompt: 'You are an email agent. Draft professional Georgian emails. Return ONLY JSON: {"targetEmail":"email","subject":"subject","body":"body"}.', minPackage: 'Free', enabled: true, sortOrder: 2 },
  { id: 'schedule-assistant', name: 'Schedule Assistant', icon: 'Calendar', category: 'automation', description: 'Create recurring tasks and reminders.', systemPrompt: 'You are a scheduling assistant. Extract task and timing. Return ONLY JSON: {"task":"what","scheduledTime":null,"frequency":"once|daily|weekly|monthly","dayOfWeek":null,"dayOfMonth":null,"timeOfDay":null}.', minPackage: 'Basic', enabled: true, sortOrder: 3 },
  { id: 'vision-agent', name: 'Vision Agent', icon: 'Image', category: 'ai', description: 'Extract order data from photos and PDFs.', systemPrompt: 'You are a vision agent. Extract order info from image/PDF. Return ONLY JSON: {"orderDate":null,"clientName":null,"celebrantName":null,"guests":null,"menuKey":null,"programKey":null,"durationMinutes":null,"extras":[],"paidAmount":null,"status":null,"missingFields":[],"confidence":0}. Use null for missing.', minPackage: 'Basic', enabled: true, sortOrder: 4 },
  { id: 'excel-agent', name: 'Excel Agent', icon: 'Grid', category: 'reports', description: 'Generate Excel/CSV reports from orders.', systemPrompt: 'You are an Excel export agent. Convert order data into CSV rows. Return ONLY JSON: {"orders":[],"summary":{"count":0,"total":0}}.', minPackage: 'Basic', enabled: true, sortOrder: 5 },
  { id: 'batch-agent', name: 'Batch Agent', icon: 'Layers', category: 'ai', description: 'Process many orders at once.', systemPrompt: 'You are a batch processor. Extract multiple orders from single input. Return ONLY JSON: {"orders":[]}. Each order has same fields as Order Builder.', minPackage: 'Gold', enabled: true, sortOrder: 6 },
  { id: 'finance-analyst', name: 'Finance Analyst', icon: 'Layers', category: 'finance', description: 'Analyze revenue, taxes and balances.', systemPrompt: 'You are a financial analyst. Analyze order data. Return ONLY JSON: {"totalRevenue":0,"totalTax":0,"outstandingBalance":0,"orderCount":0,"topMenu":null,"insights":[]}.', minPackage: 'Gold', enabled: true, sortOrder: 7 },
  { id: 'thinking-agent', name: 'Thinking Agent', icon: 'Brain', category: 'ai', description: 'Deep reasoning for complex requests.', systemPrompt: 'You are a reasoning agent. Think step-by-step. Return ONLY JSON: {"thinking":"step by step","result":"final answer"}.', minPackage: 'Diamond', enabled: true, sortOrder: 8 },
];

async function seed() {
  try {
    const batch = db.batch();
    for (const a of AGENTS) {
      const ref = db.collection('agents').doc(a.id);
      batch.set(ref, { ...a, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    }
    await batch.commit();
    console.log('Seeded ' + AGENTS.length + ' agents');
    process.exit(0);
  } catch (e) {
    console.error('Seed error:', e.message);
    process.exit(1);
  }
}
seed();