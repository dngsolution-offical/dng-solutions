// server/_bog-fulfill.cjs - Firebase (named app) + order fulfilment shared by bog-* handlers
'use strict';

const admin = require('firebase-admin');
const { getOrderDetails } = require('./_bog.cjs');

const GEL_RATE = 2.7; // must match RATE.ka in src/config/packagePrices.js
const PRICES_USD = {
  Basic: { monthly: 79, semiannual: 399, yearly: 699 },
  Gold: { monthly: 249, semiannual: 1299, yearly: 2199 },
  Diamond: { monthly: 799, semiannual: 3999, yearly: 6999 },
  Infinity: { monthly: 2499, semiannual: 12999, yearly: 19999 },
};
const CYCLE_DAYS = { monthly: 31, semiannual: 186, yearly: 366 };

function findPackage(id) {
  const k = Object.keys(PRICES_USD).find((n) => n.toLowerCase() === String(id || '').toLowerCase());
  return k || null;
}

function priceGel(pkgKey, cycle) {
  const usd = PRICES_USD[pkgKey] && PRICES_USD[pkgKey][cycle];
  return usd ? Math.round(usd * GEL_RATE) : 0;
}

// Named app: never collides with the default app other handlers initialise.
function getApp() {
  const existing = admin.apps.find((a) => a && a.name === 'bog');
  if (existing) return existing;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT is not set');
  let sa;
  try {
    sa = JSON.parse(raw);
  } catch {
    sa = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  }
  if (sa.private_key) sa.private_key = sa.private_key.replace(/\\n/g, '\n');
  return admin.initializeApp({ credential: admin.credential.cert(sa) }, 'bog');
}
const db = () => admin.firestore(getApp());
const auth = () => admin.auth(getApp());
// firebase-admin-ის ვერსიიდან დამოუკიდებლად ვიღებთ FieldValue-ს
let FieldValue;
try {
  FieldValue = require('firebase-admin/firestore').FieldValue;
} catch {
  FieldValue = admin.firestore.FieldValue;
}

async function verifyUser(req) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return null;
  try {
    return await auth().verifyIdToken(token);
  } catch {
    return null;
  }
}

// Checks the real status at BOG (never trusts the callback body) and grants the package once.
// Returns 'paid' | 'failed' | 'pending'.
async function fulfillOrder(orderId) {
  const orderRef = db().collection('orders').doc(String(orderId));
  const snap = await orderRef.get();
  if (!snap.exists) return 'pending';
  const order = snap.data();
  if (order.status === 'completed') return 'paid';
  if (order.status === 'rejected') return 'failed';
  if (!order.bogOrderId) return 'pending';

  const details = await getOrderDetails(order.bogOrderId);
  const key = details && details.order_status && details.order_status.key;

  if (details.external_order_id && details.external_order_id !== String(orderId)) {
    console.error('[bog-fulfill] external_order_id mismatch', orderId, details.external_order_id);
    return 'pending';
  }

  if (key === 'rejected') {
    await orderRef.update({ status: 'rejected', bogStatus: key, updatedAt: FieldValue.serverTimestamp() });
    return 'failed';
  }
  if (key !== 'completed') {
    await orderRef.update({ bogStatus: key || 'unknown', updatedAt: FieldValue.serverTimestamp() });
    return 'pending';
  }

  const paid = Number(details.purchase_units && details.purchase_units.transfer_amount);
  if (Number.isFinite(paid) && paid + 0.01 < Number(order.amountGel)) {
    console.error('[bog-fulfill] amount mismatch', orderId, paid, order.amountGel);
    await orderRef.update({ bogStatus: 'amount_mismatch', paidAmount: paid, updatedAt: FieldValue.serverTimestamp() });
    return 'pending';
  }

  const userRef = db().collection('users').doc(order.uid);
  await db().runTransaction(async (tx) => {
    const fresh = await tx.get(orderRef);
    if (fresh.data().status === 'completed') return; // already granted by a parallel call
    const userSnap = await tx.get(userRef);
    const now = new Date();
    let base = now;
    const u = userSnap.exists ? userSnap.data() : null;
    if (u && u.package === order.packageKey && u.subscriptionExpiresAt) {
      const cur = u.subscriptionExpiresAt.toDate ? u.subscriptionExpiresAt.toDate() : new Date(u.subscriptionExpiresAt);
      if (cur > now) base = cur; // renewing the same package extends it
    }
    const expiresAt = new Date(base.getTime() + (CYCLE_DAYS[order.cycle] || 31) * 86400000);
    tx.set(userRef, {
      package: order.packageKey,
      subscriptionCycle: order.cycle,
      subscriptionExpiresAt: expiresAt,
      subscriptionStatus: 'active',
      lastOrderId: String(orderId),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    tx.update(orderRef, {
      status: 'completed',
      bogStatus: key,
      completedAt: FieldValue.serverTimestamp(),
      subscriptionExpiresAt: expiresAt,
    });
  });
  return 'paid';
}

module.exports = { db, FieldValue, verifyUser, fulfillOrder, findPackage, priceGel };
