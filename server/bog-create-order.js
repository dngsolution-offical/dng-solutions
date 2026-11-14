// server/bog-create-order.js - POST /api/bog-create-order { packageId, billingCycle } -> { redirectUrl, orderId }
'use strict';

const { createOrder } = require('./_bog.cjs');
const { db, FieldValue, verifyUser, findPackage, priceGel } = require('./_bog-fulfill.cjs');

function siteUrl(req) {
  const env = (process.env.SITE_URL || '').trim().replace(/\/+$/, '');
  if (env) return env;
  return `https://${req.headers['x-forwarded-host'] || req.headers.host}`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  try {
    const user = await verifyUser(req);
    if (!user) return res.status(401).json({ error: 'unauthorized', message: 'Sign in required' });

    const body = req.body || {};
    const pkgKey = findPackage(body.packageId || body.packageKey);
    const cycle = body.billingCycle || body.cycle;
    if (!pkgKey) return res.status(400).json({ error: 'invalid_package', message: 'Unknown package' });
    const amountGel = priceGel(pkgKey, cycle);
    if (!amountGel) return res.status(400).json({ error: 'invalid_cycle', message: 'Unknown billing cycle' });

    const orderRef = db().collection('orders').doc();
    const orderId = orderRef.id;
    await orderRef.set({
      uid: user.uid,
      email: user.email || '',
      packageKey: pkgKey,
      cycle,
      amountGel,
      currency: 'GEL',
      status: 'created',
      createdAt: FieldValue.serverTimestamp(),
    });

    const site = siteUrl(req);
    let bog;
    try {
      bog = await createOrder({
        externalOrderId: orderId,
        amountGel,
        description: `DNG Solutions - ${pkgKey} (${cycle})`,
        callbackUrl: `${site}/api/bog-callback`,
        successUrl: `${site}/checkout/success?order_id=${orderId}`,
        failUrl: `${site}/checkout?package=${pkgKey}&cycle=${cycle}&payment=failed`,
        lang: body.lang || 'ka',
      });
    } catch (e) {
      await orderRef.update({ status: 'error', error: String(e.message || e).slice(0, 500) });
      throw e;
    }

    await orderRef.update({ bogOrderId: bog.orderId, status: 'pending' });
    return res.status(200).json({ redirectUrl: bog.redirectUrl, orderId });
  } catch (err) {
    console.error('[bog-create-order]', err);
    return res.status(500).json({ error: 'server_error', message: String(err.message || err).slice(0, 300) });
  }
};
