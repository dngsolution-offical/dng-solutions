// api/_payments.cjs — BOG iPay: token, სტატუსის შემოწმება, პაკეტის გააქტიურება
const { initializeFirebase } = require('./_firebase.cjs');
const { CYCLE_DAYS, PACKAGE_NAMES } = require('./_prices.cjs');

const OAUTH_URL = 'https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token';

async function getBogToken() {
  const id = process.env.BOG_CLIENT_ID;
  const secret = process.env.BOG_CLIENT_SECRET;
  if (!id || !secret) throw new Error('bog_credentials_missing');
  const r = await fetch(OAUTH_URL, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(id + ':' + secret).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!r.ok) throw new Error('bog_oauth_failed_' + r.status);
  const data = await r.json();
  return data.access_token;
}

function mapStatus(key) {
  if (key === 'completed') return 'paid';
  if (['rejected', 'declined', 'failed', 'cancelled', 'canceled', 'refunded', 'expired'].includes(key)) return 'failed';
  return 'pending';
}

// BOG-ისგან ამოწმებს სტატუსს (callback-ის მონაცემს არ ვენდობით) და თუ გადახდილია — აქტივაციას აკეთებს ერთხელ
async function checkAndActivate(orderId) {
  const { db, FieldValue, Timestamp } = initializeFirebase();
  const token = await getBogToken();

  const r = await fetch(`https://api.bog.ge/payments/v1/receipt/${encodeURIComponent(orderId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error('bog_receipt_' + r.status);
  const receipt = await r.json();
  const key = (receipt && receipt.order_status && receipt.order_status.key) || 'unknown';
  const status = mapStatus(key);
  const payRef = db.collection('payments').doc(orderId);

  if (status !== 'paid') {
    await payRef.set({ bogStatus: key, lastCheckedAt: FieldValue.serverTimestamp() }, { merge: true });
    return status;
  }

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(payRef);
    if (!snap.exists) throw new Error('unknown_order');
    const p = snap.data();
    if (p.status === 'paid') return;

    const expiresAt = Timestamp.fromDate(new Date(Date.now() + CYCLE_DAYS[p.billingCycle] * 24 * 60 * 60 * 1000));
    const now = FieldValue.serverTimestamp();

    tx.set(db.collection('users').doc(p.uid), {
      package: PACKAGE_NAMES[p.packageId],
      expiresAt,
      packageExpiresAt: expiresAt,
      lastPaymentId: orderId,
      packageUpdatedAt: now,
    }, { merge: true });

    tx.set(payRef, { status: 'paid', bogStatus: key, paidAt: now }, { merge: true });

    tx.set(db.collection('transactions').doc(orderId), {
      userId: p.uid,
      packageId: p.packageId,
      billingCycle: p.billingCycle,
      amount: p.amount,
      currency: 'GEL',
      paymentId: orderId,
      status: 'success',
      provider: 'bog',
      createdAt: now,
    });
  });

  return 'paid';
}

module.exports = { getBogToken, checkAndActivate, mapStatus };