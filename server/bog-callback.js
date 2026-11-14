// server/bog-callback.js - POST /api/bog-callback (called by BOG after a payment attempt)
// The body is only a trigger: the real status is always re-read from the BOG API in fulfillOrder().
'use strict';

const { db, fulfillOrder } = require('./_bog-fulfill.cjs');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('method_not_allowed');
  try {
    let payload = req.body || {};
    if (typeof payload === 'string') {
      try { payload = JSON.parse(payload); } catch { payload = {}; }
    }
    const b = payload.body || {};
    let orderId = b.external_order_id;

    if (!orderId && b.order_id) {
      const q = await db().collection('orders').where('bogOrderId', '==', String(b.order_id)).limit(1).get();
      if (!q.empty) orderId = q.docs[0].id;
    }
    if (!orderId) return res.status(200).send('ignored');

    const result = await fulfillOrder(orderId);
    console.log('[bog-callback]', orderId, result);
    return res.status(200).send('ok');
  } catch (err) {
    console.error('[bog-callback]', err);
    return res.status(500).send('server_error'); // BOG retries on non-200
  }
};
