import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { pollDoc } from '../../utils/firestorePolling';
import { db } from '../../firebase';

function AnimatedNumber({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!inView || value === null || value === undefined) return;
    if (value === 0) { setDisplay(0); return; }
    const duration = 1500;
    const start = Date.now();
    const timer = setInterval(() => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(value * eased));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, value]);

  return <span ref={ref} className="tabular-nums">{value === null ? 'â€”' : display.toLocaleString()}{suffix}</span>;
}

export default function StatsSection() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ users: null, orders: null, rating: null, loading: true });

  useEffect(() => {
    const unsub = pollDoc(db, 'public_stats/main', (data) => {
        if (data) {
          setStats({
            users: data.users || 0,
            orders: data.orders || 0,
            rating: data.rating || 0,
            loading: false,
          });
        } else {
          setStats({ users: 0, orders: 0, rating: 0, loading: false });
        }
      }, 5000);
    return unsub;
  }, []);

  const cards = [
    { key: 'users', value: stats.users, label: t('homePage.statUsers') || 'Users', color: 'blue', icon: 'ðŸ‘¥' },
    { key: 'orders', value: stats.orders, label: t('homePage.statOrders') || 'Orders', color: 'cyan', icon: 'ðŸ“Š' },
    { key: 'agents', value: 9, label: t('homePage.statAgents') || 'AI Agents', color: 'purple', icon: 'ðŸ¤–' },
    { key: 'rating', value: stats.rating, label: t('homePage.statRating') || 'Rating', color: 'yellow', icon: 'â­' },
  ];

  const COLOR_MAP = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', glow: 'hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.4)]' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', glow: 'hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.4)]' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', glow: 'hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.4)]' },
    yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', glow: 'hover:shadow-[0_0_40px_-10px_rgba(234,179,8,0.4)]' },
  };

  return (
    <section className="py-24 px-4 border-y border-white/5 bg-[#050505] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.06),transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {t('homePage.statsBadge') || 'Live Stats'}
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
            {t('homePage.statsTitle') || 'Real Numbers'}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-dng-blue to-dng-cyan">
              {t('homePage.statsHighlight') || 'Live'}
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {t('homePage.statsDesc') || 'Straight from Firebase'}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map((card, i) => {
            const c = COLOR_MAP[card.color];
            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className={`group relative bg-[#0A0A0A] border border-white/[0.08] rounded-3xl p-6 text-center transition-all duration-300 ${c.glow}`}
              >
                <div className={`w-12 h-12 rounded-2xl ${c.bg} border ${c.border} flex items-center justify-center mx-auto mb-4 text-2xl group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
                <div className={`text-4xl md:text-5xl font-black ${c.text} mb-2`}>
                  {stats.loading && (card.key === 'users' || card.key === 'orders') ? '...' : (
                    <AnimatedNumber value={card.value} suffix={card.key === 'rating' && card.value > 0 ? '' : ''} />
                  )}
                </div>
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                  {card.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}