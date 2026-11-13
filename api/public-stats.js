// api/public-stats.js — Public stats for home dashboard
const { initializeFirebase } = require('./_firebase.cjs');

module.exports = async function handler(req, res) {
  try {
    const { admin, db } = initializeFirebase();

    const action = req.query?.action || req.body?.action || 'get';

    // SEED
    if (action === 'seed' || req.method === 'POST') {
      const usersSnap = await db.collection('users').get();
      const usersArray = [];
      usersSnap.forEach(doc => {
        const d = doc.data();
        usersArray.push({
          uid: doc.id,
          name: d.name || d.displayName || d.email?.split('@')[0] || 'User',
          email: d.email || '',
          package: d.package || 'Free',
          createdAt: d.createdAt?.toDate?.()?.toISOString?.() || null,
          ordersUsed: d.ordersUsed || 0,
        });
      });

      const ordersSnap = await db.collection('orders').get();
      const ordersCount = ordersSnap.size;

      const ratingsSnap = await db.collection('ratings').get();
      let avgRating = 0;
      if (ratingsSnap.size > 0) {
        let total = 0;
        ratingsSnap.forEach(d => { total += d.data().rating || 0; });
        avgRating = Number((total / ratingsSnap.size).toFixed(1));
      }

      const packageCounts = { Free: 0, Basic: 0, Gold: 0, Diamond: 0, Infinity: 0 };
      usersArray.forEach(u => {
        if (packageCounts[u.package] !== undefined) packageCounts[u.package]++;
      });

      const recentUsers = usersArray
        .filter(u => u.createdAt)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      const pkgRank = { 'Infinity': 5, 'Diamond': 4, 'Gold': 3, 'Basic': 2, 'Free': 1 };
      const topUsers = [...usersArray]
        .sort((a, b) => (pkgRank[b.package] || 0) - (pkgRank[a.package] || 0))
        .slice(0, 5);

      const statsData = {
        users: usersArray.length,
        orders: ordersCount,
        rating: avgRating,
        packageCounts,
        recentUsers,
        topUsers,
      };

      // Add serverTimestamp if available
      if (db.FieldValue) {
        statsData.updatedAt = db.FieldValue.serverTimestamp();
      } else {
        statsData.updatedAt = new Date();
      }

      await db.collection('public_stats').doc('main').set(statsData, { merge: true });

      return res.json({
        ok: true,
        message: 'public_stats/main updated',
        users: statsData.users,
        orders: statsData.orders,
        rating: statsData.rating,
        packageCounts: statsData.packageCounts,
      });
    }

    // GET
    const doc = await db.collection('public_stats').doc('main').get();
    if (!doc.exists) {
      return res.json({
        ok: true,
        users: 0,
        orders: 0,
        rating: 0,
        packageCounts: { Free: 0, Basic: 0, Gold: 0, Diamond: 0, Infinity: 0 },
        recentUsers: [],
        topUsers: [],
      });
    }

    const data = doc.data();
    return res.json({
      ok: true,
      users: data.users || 0,
      orders: data.orders || 0,
      rating: data.rating || 0,
      packageCounts: data.packageCounts || { Free: 0, Basic: 0, Gold: 0, Diamond: 0, Infinity: 0 },
      recentUsers: data.recentUsers || [],
      topUsers: data.topUsers || [],
    });
  } catch (e) {
    console.error('[public-stats]', e.message);
    return res.status(500).json({ ok: false, error: e.message });
  }
};