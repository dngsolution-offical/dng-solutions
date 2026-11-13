import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { doc, getDoc } from 'firebase/firestore/lite';
import { db } from '../../firebase';

const Icons = {
  Users: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  ShoppingCart: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  Bot: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  ArrowRight: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>,
  Check: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>,
  Sparkles: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  Chart: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
};

const PKG_COLORS = {
  Free: 'bg-gray-500/20 border-gray-500/30 text-gray-400',
  Basic: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
  Gold: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
  Diamond: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
  Infinity: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
};

const PKG_GRADIENTS = {
  Free: 'from-gray-500/20 to-gray-700/20',
  Basic: 'from-blue-500/30 to-cyan-500/30',
  Gold: 'from-amber-500/30 to-orange-500/30',
  Diamond: 'from-purple-500/30 to-pink-500/30',
  Infinity: 'from-emerald-500/30 to-teal-500/30',
};

const DEFAULT_STATS = {
  users: 0,
  orders: 0,
  rating: 0,
  packageCounts: { Free: 0, Basic: 0, Gold: 0, Diamond: 0, Infinity: 0 },
  recentUsers: [],
  loading: true,
};

export default function HeroSection() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(DEFAULT_STATS);

  // Load stats via polling (no onSnapshot)
  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        const snap = await getDoc(doc(db, 'public_stats', 'main'));
        if (cancelled) return;

        if (snap.exists()) {
          const d = snap.data();
          setStats({
            users: d.users || 0,
            orders: d.orders || 0,
            rating: d.rating || 0,
            packageCounts: d.packageCounts || DEFAULT_STATS.packageCounts,
            recentUsers: d.recentUsers || [],
            loading: false,
          });
        } else {
          setStats({ ...DEFAULT_STATS, loading: false });
        }
      } catch (e) {
        console.warn('[Hero] stats load failed:', e.message);
        if (!cancelled) setStats(prev => ({ ...prev, loading: false }));
      }
    }

    loadStats();
    const timer = setInterval(loadStats, 10000); // poll every 10s

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const display = (v) => (v === null || v === undefined ? '—' : v);

  return (
    <section className="relative min-h-screen pt-32 pb-20 flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.15),transparent_50%)] pointer-events-none" />
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 -left-40 w-[500px] h-[500px] bg-dng-blue/[0.08] rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-20 -right-40 w-[500px] h-[500px] bg-dng-cyan/[0.08] rounded-full blur-[120px] pointer-events-none"
      />

      <div className="relative max-w-7xl mx-auto px-4 w-full grid lg:grid-cols-2 gap-12 lg:gap-16 items-center z-10">
        {/* LEFT */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-dng-cyan uppercase tracking-wider mb-6 backdrop-blur-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-dng-cyan animate-pulse" />
            {t('hero.badge')}
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6">
            {t('hero.title1')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              {t('hero.title2')}
            </span> <br />
            {t('hero.title3')}
          </h1>

          <p className="text-lg text-gray-400 mb-8 max-w-lg leading-relaxed">
            {t('hero.desc')}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/register"
              className="group relative px-8 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.6)] overflow-hidden inline-flex items-center gap-2"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-dng-blue to-dng-cyan translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10 group-hover:text-white transition-colors">{t('hero.btnStart')}</span>
              <span className="relative z-10 group-hover:text-white group-hover:translate-x-1 transition-all"><Icons.ArrowRight /></span>
            </Link>
            <Link
              to="/packages"
              className="group px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 hover:border-dng-cyan/30 transition-all inline-flex items-center gap-2"
            >
              {t('hero.btnPackages')}
              <span className="group-hover:translate-x-1 transition-transform"><Icons.ArrowRight /></span>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
            {['trust1', 'trust2', 'trust3'].map((k) => (
              <div key={k} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Icons.Check />
                </div>
                <span>{t(`hero.${k}`)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT — LIVE DASHBOARD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 blur-[80px] rounded-full" />

          <div className="relative bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
            {/* HEADER */}
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

            {/* MAIN STATS */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Icons.Users />
                  <span className="text-xs text-gray-400 font-medium">{t('hero.liveUsers')}</span>
                </div>
                <div className="text-3xl font-black text-white tabular-nums">
                  {stats.loading ? '...' : display(stats.users)}
                </div>
              </div>
              <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Icons.ShoppingCart />
                  <span className="text-xs text-gray-400 font-medium">{t('hero.liveOrders')}</span>
                </div>
                <div className="text-3xl font-black text-white tabular-nums">
                  {stats.loading ? '...' : display(stats.orders)}
                </div>
              </div>
            </div>

            {/* PACKAGE BREAKDOWN */}
            {stats.packageCounts && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icons.Chart />
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                    {t('hero.packageBreakdown')}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {Object.entries(stats.packageCounts).map(([pkg, count]) => {
                    const total = stats.users || 1;
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={pkg} className="flex items-center gap-2 text-xs">
                        <span className={`w-16 font-bold ${PKG_COLORS[pkg]?.split(' ').pop() || 'text-gray-400'}`}>
                          {pkg}
                        </span>
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className={`h-full bg-gradient-to-r ${PKG_GRADIENTS[pkg] || 'from-gray-500/30 to-gray-700/30'}`}
                          />
                        </div>
                        <span className="text-white font-bold tabular-nums w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* RECENT USERS */}
            {stats.recentUsers && stats.recentUsers.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                    {t('hero.recentUsers')}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {stats.recentUsers.slice(0, 3).map((u, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/[0.02] p-2 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center text-[10px] font-bold text-blue-400 uppercase shrink-0">
                          {(u.name || 'U').charAt(0)}
                        </div>
                        <span className="text-xs font-medium text-gray-300 truncate max-w-[100px]">{u.name}</span>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase shrink-0 ${PKG_COLORS[u.package] || PKG_COLORS.Free}`}>
                        {u.package}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI AGENTS CTA */}
            <div className="mt-4 bg-gradient-to-br from-dng-blue/10 to-dng-cyan/10 border border-dng-cyan/20 rounded-2xl p-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-dng-cyan/20 flex items-center justify-center text-dng-cyan flex-shrink-0">
                  <Icons.Bot />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white">{t('hero.aiAgentsLabel')}</p>
                  <p className="text-[10px] text-gray-400">{t('hero.aiAgentsDesc')}</p>
                </div>
                <Link to="/agents" className="text-dng-cyan">
                  <Icons.ArrowRight />
                </Link>
              </div>
            </div>

            {/* LIVE BADGE */}
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t('hero.realtime')}
              </span>
              {stats.rating > 0 && (
                <span className="flex items-center gap-1 text-yellow-400">
                  <Icons.Sparkles />
                  {stats.rating} ★
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}