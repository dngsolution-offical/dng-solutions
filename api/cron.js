// ═══════════════════════════════════════════════════════════════════════
// api/cron.js — Autonomous Agents Scheduler
// ყოველ საათში ეშვება (vercel.json-ში)
// 1. Schedule Agent — ამოწმებს დაგეგმილ დავალებებს
// 2. Report Agent — დღიური ანგარიში (23:00-ზე)
// 3. Report Agent — თვიური არქივი (1 რიცხვში)
// ═══════════════════════════════════════════════════════════════════════

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

if (!admin.apps.length) {
  try {
    let serviceAccount;
    try {
      const keyPath = path.join(process.cwd(), 'firebase-key.json');
      if (fs.existsSync(keyPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      } else {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
      }
    } catch {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    }

    if (serviceAccount.project_id) {
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } else {
      admin.initializeApp({ credential: admin.credential.applicationDefault() });
    }
  } catch (e) {
    console.error('[fb-init]', e.message);
  }
}
const db = admin.apps.length ? admin.firestore() : null;

// ─────────────────────────────────────────────────────────────────────
// Schedule check
// ─────────────────────────────────────────────────────────────────────
function shouldRunToday(schedule) {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  if (schedule.frequency === 'daily') {
    return schedule.lastRun !== todayStr;
  }
  if (schedule.frequency === 'weekly') {
    const dayOfWeek = now.getDay();
    return schedule.dayOfWeek === dayOfWeek && schedule.lastRun !== todayStr;
  }
  if (schedule.frequency === 'monthly') {
    const dayOfMonth = now.getDate();
    return schedule.dayOfMonth === dayOfMonth && schedule.lastRun !== todayStr;
  }
  if (schedule.frequency === 'once') {
    const scheduledDate = new Date(schedule.scheduledTime).toISOString().split('T')[0];
    return scheduledDate === todayStr && schedule.status === 'pending';
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────
// Report generation helper
// ─────────────────────────────────────────────────────────────────────
async function generateDailyReport(uid) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const snap = await db.collection('orders')
    .where('uid', '==', uid)
    .where('createdAt', '>=', startOfDay)
    .get();

  let totalOrders = 0, totalGuests = 0, totalRevenue = 0, totalPaid = 0, totalBalance = 0;
  snap.forEach(doc => {
    const d = doc.data();
    totalOrders++;
    totalGuests += d.guests || 0;
    totalRevenue += d.totalAmount || 0;
    totalPaid += d.paidAmount || 0;
    totalBalance += d.balance || 0;
  });

  return {
    date: startOfDay.toISOString().split('T')[0],
    totalOrders,
    totalGuests,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalPaid: Math.round(totalPaid * 100) / 100,
    totalBalance: Math.round(totalBalance * 100) / 100,
  };
}

async function generateMonthlyReport(uid) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const snap = await db.collection('orders')
    .where('uid', '==', uid)
    .where('createdAt', '>=', startOfMonth)
    .get();

  let totalOrders = 0, totalGuests = 0, totalRevenue = 0, totalPaid = 0, totalBalance = 0;
  snap.forEach(doc => {
    const d = doc.data();
    totalOrders++;
    totalGuests += d.guests || 0;
    totalRevenue += d.totalAmount || 0;
    totalPaid += d.paidAmount || 0;
    totalBalance += d.balance || 0;
  });

  return {
    month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    totalOrders,
    totalGuests,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalPaid: Math.round(totalPaid * 100) / 100,
    totalBalance: Math.round(totalBalance * 100) / 100,
  };
}

// ─────────────────────────────────────────────────────────────────────
// MAIN CRON
// ─────────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }

  if (!db) {
    return res.status(500).json({ ok: false, error: 'database_unavailable' });
  }

  const results = {
    schedules: 0,
    dailyReports: 0,
    monthlyReports: 0,
    errors: [],
  };

  const now = new Date();
  const hour = now.getHours();
  const dayOfMonth = now.getDate();

  // ─────────────────────────────────────────────────────────────────
  // 1. Process pending schedules (Schedule Agent)
  // ─────────────────────────────────────────────────────────────────
  try {
    const snap = await db.collection('schedules').where('status', '==', 'pending').get();
    if (!snap.empty) {
      const batch = db.batch();
      for (const doc of snap.docs) {
        const data = doc.data();
        if (shouldRunToday(data)) {
          const todayStr = now.toISOString().split('T')[0];
          if (data.frequency === 'once') {
            batch.update(doc.ref, { status: 'completed', completedAt: new Date() });
          } else {
            batch.update(doc.ref, { lastRun: todayStr });
          }
          results.schedules++;
        }
      }
      if (results.schedules > 0) await batch.commit();
    }
  } catch (e) {
    results.errors.push(`schedules: ${e.message}`);
  }

  // ─────────────────────────────────────────────────────────────────
  // 2. Daily reports at 23:00 (Report Agent — autonomous)
  // ─────────────────────────────────────────────────────────────────
  if (hour === 23) {
    try {
      const usersSnap = await db.collection('users').where('package', 'in', ['Gold', 'Diamond', 'Infinity']).get();
      const batch = db.batch();
      for (const userDoc of usersSnap.docs) {
        try {
          const report = await generateDailyReport(userDoc.id);
          const reportRef = db.collection('reports').doc();
          batch.set(reportRef, {
            uid: userDoc.id,
            type: 'daily',
            ...report,
            generatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          results.dailyReports++;
        } catch (e) {
          results.errors.push(`daily-report-${userDoc.id}: ${e.message}`);
        }
      }
      if (results.dailyReports > 0) await batch.commit();
    } catch (e) {
      results.errors.push(`daily-reports: ${e.message}`);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 3. Monthly reports on 1st of month at 01:00 (Report Agent — autonomous)
  // ─────────────────────────────────────────────────────────────────
  if (dayOfMonth === 1 && hour === 1) {
    try {
      const usersSnap = await db.collection('users').where('package', 'in', ['Gold', 'Diamond', 'Infinity']).get();
      const batch = db.batch();
      for (const userDoc of usersSnap.docs) {
        try {
          const report = await generateMonthlyReport(userDoc.id);
          const reportRef = db.collection('reports').doc();
          batch.set(reportRef, {
            uid: userDoc.id,
            type: 'monthly',
            ...report,
            generatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          results.monthlyReports++;
        } catch (e) {
          results.errors.push(`monthly-report-${userDoc.id}: ${e.message}`);
        }
      }
      if (results.monthlyReports > 0) await batch.commit();
    } catch (e) {
      results.errors.push(`monthly-reports: ${e.message}`);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 4. Update public_stats (for homepage counters)
  // ─────────────────────────────────────────────────────────────────
  try {
    const [usersSnap, ordersSnap, ratingsSnap] = await Promise.all([
      db.collection('users').get(),
      db.collection('orders').get(),
      db.collection('ratings').get(),
    ]);

    let rating = null;
    if (ratingsSnap.size > 0) {
      let total = 0;
      ratingsSnap.forEach(d => { total += d.data().rating || 0; });
      rating = Number((total / ratingsSnap.size).toFixed(1));
    }

    await db.collection('public_stats').doc('main').set({
      users: usersSnap.size,
      orders: ordersSnap.size,
      rating,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    results.publicStats = 'updated';
  } catch (e) {
    results.errors.push(`public_stats: ${e.message}`);
  }

  console.log('[cron]', JSON.stringify(results));
  return res.status(200).json({ ok: true, ...results });
}