import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const Icons = {
  Target: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Eye: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  Star: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  Clock: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Bot: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  TrendingUp: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  Users: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Money: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  CheckCircle: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>,
  ArrowRight: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>,
  Sparkles: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
};

const AI_AGENTS = [
  { key: 'text', color: 'from-blue-500/20 to-blue-600/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  { key: 'excel', color: 'from-emerald-500/20 to-emerald-600/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  { key: 'email', color: 'from-cyan-500/20 to-cyan-600/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  { key: 'vision', color: 'from-purple-500/20 to-purple-600/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  { key: 'report', color: 'from-yellow-500/20 to-yellow-600/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  { key: 'crm', color: 'from-pink-500/20 to-pink-600/10', text: 'text-pink-400', border: 'border-pink-500/20' },
  { key: 'schedule', color: 'from-orange-500/20 to-orange-600/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  { key: 'automation', color: 'from-red-500/20 to-red-600/10', text: 'text-red-400', border: 'border-red-500/20' },
];

const BENEFITS = [
  { key: 'benefit1', icon: 'Clock', color: 'from-blue-500/20 to-blue-600/10', text: 'text-blue-400' },
  { key: 'benefit2', icon: 'Money', color: 'from-emerald-500/20 to-emerald-600/10', text: 'text-emerald-400' },
  { key: 'benefit3', icon: 'TrendingUp', color: 'from-purple-500/20 to-purple-600/10', text: 'text-purple-400' },
  { key: 'benefit4', icon: 'Users', color: 'from-amber-500/20 to-amber-600/10', text: 'text-amber-400' },
];

export default function About() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ users: 0, rating: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [usersSnap, ratingsSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'ratings'))
        ]);

        let avgRating = 0;
        if (ratingsSnap.size > 0) {
          let total = 0;
          ratingsSnap.forEach(doc => total += doc.data().rating || 0);
          avgRating = (total / ratingsSnap.size).toFixed(1);
        }

        setStats({ users: usersSnap.size, rating: avgRating || 0 });
      } catch (err) {
        console.error('About stats error:', err);
      }
    }
    fetchStats();
  }, []);

  const iconMap = { Clock: Icons.Clock, Money: Icons.Money, TrendingUp: Icons.TrendingUp, Users: Icons.Users };

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 pt-28 pb-20">

        {/* ═══ HERO ═══ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dng-cyan/10 border border-dng-cyan/20 mb-6">
            <Icons.Sparkles />
            <span className="text-xs font-bold text-dng-cyan uppercase tracking-widest">DNG Solutions</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-5 leading-tight">
            {t('aboutPage.title1')}{' '}
            <span className="bg-gradient-to-r from-dng-blue via-dng-cyan to-emerald-400 bg-clip-text text-transparent">
              {t('aboutPage.title2')}
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-medium mb-3">
            {t('aboutPage.tagline')}
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto text-base leading-relaxed">
            {t('aboutPage.intro')}
          </p>
        </motion.div>

        {/* ═══ STATS ═══ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-3 sm:gap-5 mb-20">
          {[
            { value: stats.users, label: t('aboutPage.statsUsers') },
            { value: stats.rating > 0 ? stats.rating : '—', label: t('aboutPage.statsRating') },
            { value: '24/7', label: t('aboutPage.statsSupport') },
          ].map((s, i) => (
            <div key={i} className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 rounded-2xl p-5 sm:p-7 text-center backdrop-blur-sm">
              <div className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent mb-2">
                {s.value}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-widest">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* ═══ MISSION & VISION ═══ */}
        <div className="grid md:grid-cols-2 gap-5 mb-20">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-3xl p-8 overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-5">
                <Icons.Target />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{t('aboutPage.mission')}</h3>
              <p className="text-gray-400 leading-relaxed">{t('aboutPage.missionDesc')}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20 rounded-3xl p-8 overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-5">
                <Icons.Eye />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{t('aboutPage.vision')}</h3>
              <p className="text-gray-400 leading-relaxed">{t('aboutPage.visionDesc')}</p>
            </div>
          </motion.div>
        </div>

        {/* ═══ WHY US — BENEFITS ═══ */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-20">
          <div className="text-center mb-12">
            <p className="text-xs text-dng-cyan uppercase tracking-widest font-bold mb-3">{t('aboutPage.whyBadge')}</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">{t('aboutPage.whyTitle')}</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">{t('aboutPage.whyDesc')}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BENEFITS.map((b, i) => {
              const IconComp = iconMap[b.icon];
              return (
                <motion.div
                  key={b.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="relative bg-[#0A0A0C] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${b.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${b.color} ${b.text} flex items-center justify-center mb-4 border border-white/5 group-hover:scale-110 transition-transform`}>
                      <IconComp />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{t(`aboutPage.${b.key}Title`)}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{t(`aboutPage.${b.key}Desc`)}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ═══ AI AGENTS ═══ */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-20">
          <div className="text-center mb-12">
            <p className="text-xs text-dng-cyan uppercase tracking-widest font-bold mb-3">{t('aboutPage.agentsBadge')}</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">{t('aboutPage.agentsTitle')}</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">{t('aboutPage.agentsDesc')}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {AI_AGENTS.map((agent, i) => (
              <motion.div
                key={agent.key}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -3 }}
                className="bg-[#0A0A0C] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all group"
              >
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${agent.color} ${agent.text} flex items-center justify-center mb-3 border ${agent.border} group-hover:scale-110 transition-transform`}>
                  <Icons.Bot />
                </div>
                <h4 className="text-sm font-bold text-white mb-1 leading-tight">{t(`aboutPage.agent_${agent.key}_name`)}</h4>
                <p className="text-[11px] text-gray-500 leading-snug">{t(`aboutPage.agent_${agent.key}_desc`)}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/agents"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-dng-blue to-dng-cyan text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-cyan-500/20"
            >
              {t('aboutPage.tryAgents')}
              <span className="group-hover:translate-x-1 transition-transform">
                <Icons.ArrowRight />
              </span>
            </Link>
          </div>
        </motion.div>

        {/* ═══ VALUES ═══ */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-20">
          <h2 className="text-3xl font-black text-white text-center mb-12">{t('aboutPage.values')}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: <Icons.Target />, title: 'value1', desc: 'value1Desc', color: 'blue' },
              { icon: <Icons.Star />, title: 'value2', desc: 'value2Desc', color: 'emerald' },
              { icon: <Icons.Clock />, title: 'value3', desc: 'value3Desc', color: 'amber' },
            ].map((v, i) => (
              <div key={i} className="bg-[#0A0A0C] border border-white/10 rounded-2xl p-6 text-center hover:border-white/20 transition-all">
                <div className={`w-12 h-12 rounded-xl bg-${v.color}-500/20 flex items-center justify-center text-${v.color}-400 mx-auto mb-4`}>
                  {v.icon}
                </div>
                <h3 className="text-base font-bold text-white mb-2">{t(`aboutPage.${v.title}`)}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{t(`aboutPage.${v.desc}`)}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ═══ USE CASES ═══ */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-20">
          <div className="relative bg-gradient-to-br from-[#0A0A0C] to-[#111] border border-white/10 rounded-3xl p-8 sm:p-12 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-dng-cyan/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-dng-blue/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="text-center mb-10">
                <p className="text-xs text-dng-cyan uppercase tracking-widest font-bold mb-3">{t('aboutPage.useCasesBadge')}</p>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">{t('aboutPage.useCasesTitle')}</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">{t('aboutPage.useCasesDesc')}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 bg-white/[0.03] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                      <Icons.CheckCircle />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">{t(`aboutPage.useCase${i}Title`)}</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">{t(`aboutPage.useCase${i}Desc`)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══ CTA ═══ */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-6">{t('aboutPage.ctaTitle')}</h2>
          <div className="inline-flex flex-col sm:flex-row gap-3">
            <Link to="/packages" className="px-8 py-3.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-95">
              {t('aboutPage.ctaPackages')}
            </Link>
            <Link to="/contact" className="px-8 py-3.5 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 hover:border-white/20 transition-all active:scale-95">
              {t('aboutPage.ctaContact')}
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}