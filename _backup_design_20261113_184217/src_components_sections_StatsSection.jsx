import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function StatsSection() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ users: 0, orders: 0, rating: 0 });

  useEffect(() => {
    fetch('/api/public-stats')
      .then((r) => r.json())
      .then((d) => { if (d.ok) setStats({ users: d.users, orders: d.orders, rating: d.rating }); })
      .catch((err) => console.error('Stats error:', err.message));
  }, []);

  const items = [
    { value: stats.users, label: t('aboutPage.statsUsers', 'მომხმარებელი') },
    { value: stats.orders, label: t('aboutPage.statsOrders', 'შეკვეთა') },
    { value: stats.rating > 0 ? stats.rating : '-', label: t('aboutPage.statsRating', 'რეიტინგი') },
    { value: '24/7', label: 'AI Support' },
  ];

  return (
    <section className="py-20 border-y border-white/5 bg-[#050505] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {items.map((it, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="text-4xl md:text-5xl font-black text-white mb-2">{it.value}</div>
              <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">{it.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}