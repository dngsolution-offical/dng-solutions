// server/bog-status.js - POST /api/bog-status { orderId } -> { status: 'paid' | 'failed' | 'pending' }
// Also re-checks the order at BOG, so the package activates even if the callback never arrives.
// GET /api/bog-status?selftest=1 -> checks that the BOG credentials work.
'use strict';

const { getAccessToken } = require('./_bog.cjs');
const { db, verifyUser, fulfillOrder } = require('./_bog-fulfill.cjs');

module.exports = async function handler(req, res) {
  if (req.method === 'GET' && req.query && req.query.selftest) {
    try {
      await getAccessToken();
      return res.status(200).json({ bogAuth: true });
    } catch (e) {
      return res.status(200).json({ bogAuth: false, error: String(e.message || e).slice(0, 200) });
    }
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  try {
    const user = await verifyUser(req);
    if (!user) return res.status(401).json({ error: 'unauthorized' });

    const orderId = req.body && req.body.orderId;
    if (!orderId) return res.status(400).json({ error: 'missing_order' });

    const snap = await db().collection('orders').doc(String(orderId)).get();
    if (!snap.exists) return res.status(404).json({ error: 'not_found' });
    const order = snap.data();
    if (order.uid !== user.uid) return res.status(403).json({ error: 'forbidden' });

    const status = await fulfillOrder(orderId);
    return res.status(200).json({ status, packageKey: order.packageKey, cycle: order.cycle });
  } catch (err) {
    console.error('[bog-status]', err);
    return res.status(500).json({ error: 'server_error' });
  }
};
