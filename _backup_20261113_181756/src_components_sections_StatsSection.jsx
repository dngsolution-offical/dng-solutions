import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

export default function StatsSection() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ users: 0, orders: 0, rating: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const ratingsSnap = await getDocs(collection(db, 'ratings'));
        
        let avgRating = 0;
        if (ratingsSnap.size > 0) {
          let total = 0;
          ratingsSnap.forEach(doc => total += doc.data().rating || 0);
          avgRating = (total / ratingsSnap.size).toFixed(1);
        }

        setStats({
          users: usersSnap.size,
          orders: 0, // შეკვეთები ჯერ არ არის
          rating: avgRating || 0
        });
      } catch (err) {
        console.error('Stats error:', err);
      }
    }
    fetchStats();
  }, []);

  return (
    <section className="py-20 border-y border-white/5 bg-[#050505] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="text-4xl md:text-5xl font-black text-white mb-2">
              {stats.users}
            </div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">
              {t('aboutPage.statsUsers', 'მომხმარებელი')}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <div className="text-4xl md:text-5xl font-black text-white mb-2">
              {stats.orders}
            </div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">
              {t('aboutPage.statsOrders', 'შეკვეთა')}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <div className="text-4xl md:text-5xl font-black text-white mb-2">
              {stats.rating > 0 ? stats.rating : '-'}
            </div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">
              {t('aboutPage.statsRating', 'რეიტინგი')}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
            <div className="text-4xl md:text-5xl font-black text-white mb-2">
              24/7
            </div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">
              AI Support
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}