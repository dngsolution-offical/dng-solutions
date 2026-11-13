import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PACKAGES = [
  { name: 'Basic', cls: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
  { name: 'Gold', cls: 'bg-amber-500/10 border-amber-500/30 text-amber-400' },
  { name: 'Diamond', cls: 'bg-purple-500/10 border-purple-500/30 text-purple-400' },
  { name: 'Infinity', cls: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
];

export default function HeroSection() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ users: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public-stats')
      .then((r) => r.json())
      .then((d) => { if (d.ok) setStats({ users: d.users, orders: d.orders }); })
      .catch((err) => console.error('Live stats error:', err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="relative min-h-screen pt-32 pb-20 flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.15),transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-dng-cyan uppercase tracking-wider mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-dng-cyan animate-pulse" />
            {t('hero.badge')}
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6">
            {t('hero.title1')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{t('hero.title2')}</span> <br />
            {t('hero.title3')}
          </h1>

          <p className="text-lg text-gray-400 mb-8 max-w-lg leading-relaxed">{t('hero.desc')}</p>

          <div className="flex flex-wrap gap-4">
            <Link to="/register" className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 transition-transform">
              {t('hero.btnStart')}
            </Link>
            <Link to="/packages" className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-colors">
              {t('hero.btnPackages')}
            </Link>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 blur-[80px] rounded-full" />

          <div className="relative bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
              <div>
                <h3 className="text-white font-bold">{t('hero.dashTitle')}</h3>
                <p className="text-xs text-gray-500">{t('hero.dashSub')}</p>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
                <span className="text-xs text-gray-400 font-medium">{t('hero.liveUsers')}</span>
                <div className="text-3xl font-black text-white mt-2">{loading ? '...' : stats.users}</div>
              </div>
              <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
                <span className="text-xs text-gray-400 font-medium">{t('hero.liveOrders')}</span>
                <div className="text-3xl font-black text-white mt-2">{loading ? '...' : stats.orders}</div>
              </div>
            </div>

            <h4 className="text-sm font-bold text-white mb-3">AI პაკეტები</h4>
            <div className="grid grid-cols-2 gap-2">
              {PACKAGES.map((p) => (
                <div key={p.name} className={`text-center text-xs font-bold px-3 py-2 rounded-xl border uppercase ${p.cls}`}>
                  {p.name}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}