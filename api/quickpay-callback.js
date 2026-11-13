import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  });
}
const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { status, metadata, payment_id } = req.body;

  if (status === 'success' && metadata) {
    const { userId, packageId, billingCycle } = metadata;
    
    let days = 30;
    if (billingCycle === 'yearly') days = 365;
    else if (billingCycle === 'semiannual') days = 180;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    try {
      await db.collection('users').doc(userId).update({
        package: packageId,
        expiresAt,
        lastPaymentId: payment_id,
        packageUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await db.collection('transactions').add({
        userId, packageId, billingCycle, paymentId: payment_id,
        status: 'success', createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(200).json({ ok: true });
}
