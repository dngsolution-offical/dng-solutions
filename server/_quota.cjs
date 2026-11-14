// server/_quota.cjs — ორდერების (შეკვეთების) კონტროლი: პაკეტის თვიური ლიმიტი, ვადა და დაჯავშნა
const { effectiveExpiry } = require('./_plan.cjs');

// ორდერები თვეში პაკეტის მიხედვით. ციფრები საიტის ტექსტთან უნდა შეესაბამებოდეს
const ORDER_QUOTA = { Free: 50, Basic: 500, Gold: 2000, Diamond: 5000, Infinity: 15000 };

// მძიმე აგენტები (ფაილები, კოდი, ღრმა ანალიზი) იხარჯავენ მეტ ორდერს
const HEAVY_AGENTS = ['excel', 'file', 'code', 'research', 'thinking', 'businessplan', 'pitchdeck', 'contract'];
const HEAVY_WEIGHT = 3;

function orderWeight(agentKey) {
  return HEAVY_AGENTS.includes(agentKey) ? HEAVY_WEIGHT : 1;
}

function periodKey(now = new Date()) {
  return now.toISOString().slice(0, 7); // YYYY-MM
}

function quotaFor(pkg) {
  return ORDER_QUOTA[pkg] ?? 0;
}

// ატომურად ამოწმებს და ჯავშნის ორდერებს. თუ ლიმიტი ამოიწურა, არაფერს არ ჯავშნის
async function reserveOrders(db, uid, pkg, weight) {
  const limit = quotaFor(pkg);
  const period = periodKey();
  const ref = db.collection('order_usage').doc(`${uid}_${period}`);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const used = snap.exists ? Number(snap.data().used || 0) : 0;
    if (used + weight > limit) return { ok: false, used, limit, period };
    tx.set(ref, { uid, period, used: used + weight, updatedAt: new Date() }, { merge: true });
    return { ok: true, used: used + weight, limit, period };
  });
}

// თუ AI-ის ზარი ჩავარდა, ჯავშნილ ორდერებს ვაბრუნებთ
async function refundOrders(db, uid, weight) {
  const ref = db.collection('order_usage').doc(`${uid}_${periodKey()}`);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return;
    const used = Math.max(0, Number(snap.data().used || 0) - weight);
    tx.set(ref, { used, updatedAt: new Date() }, { merge: true });
  });
}

function maskEmail(email) {
  const [name, domain] = String(email || '').split('@');
  if (!name || !domain) return 'უცნობი';
  return name.slice(0, 2) + '***@' + domain;
}

function fmtDate(ms) {
  return ms ? new Date(ms).toISOString().slice(0, 10) : 'არ არის';
}

// ტელეგრამში ჩანს, რომელი ანგარიშიდანაა აგენტი და რამდენი ორდერი დარჩა
async function accountStatus(db, auth, uid) {
  const userSnap = await db.collection('users').doc(uid).get();
  const user = userSnap.exists ? userSnap.data() : {};
  const pkg = user.package || 'Free';
  let email = '';
  try {
    email = (await auth.getUser(uid)).email || '';
  } catch (e) {
    email = '';
  }
  const usageSnap = await db.collection('order_usage').doc(`${uid}_${periodKey()}`).get();
  const used = usageSnap.exists ? Number(usageSnap.data().used || 0) : 0;
  const limit = quotaFor(pkg);
  const expMs = effectiveExpiry(user);
  return [
    `ანგარიში: ${maskEmail(email)}`,
    `პაკეტი: ${pkg}`,
    `ორდერები ამ თვეში: ${used}/${limit} (დარჩა ${Math.max(0, limit - used)})`,
    `ვადა: ${fmtDate(expMs)}`,
    '',
    `მძიმე აგენტი (ფაილი, Excel, კოდი, ანალიზი) ×${HEAVY_WEIGHT} ორდერს ხარჯავს.`,
  ].join('\n');
}

module.exports = {
  ORDER_QUOTA,
  HEAVY_AGENTS,
  HEAVY_WEIGHT,
  orderWeight,
  quotaFor,
  reserveOrders,
  refundOrders,
  accountStatus,
  maskEmail,
};
