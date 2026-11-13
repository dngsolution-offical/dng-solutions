import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const Icons = {
  Target: () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Eye: () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  Star: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  Clock: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Bot: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  TrendingUp: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  Users: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Money: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Zap: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  CheckCircle: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  ArrowRight: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>,
};

// AI Agents list (using translation keys)
const AI_AGENTS = [
  { key: 'text', color: 'blue' },
  { key: 'excel', color: 'green' },
  { key: 'email', color: 'cyan' },
  { key: 'vision', color: 'purple' },
  { key: 'report', color: 'yellow' },
  { key: 'crm', color: 'pink' },
  { key: 'schedule', color: 'orange' },
  { key: 'automation', color: 'red' },
];

// Business benefits
const BENEFITS = [
  { key: 'benefit1', icon: 'Clock', color: 'blue' },
  { key: 'benefit2', icon: 'Money', color: 'green' },
  { key: 'benefit3', icon: 'TrendingUp', color: 'purple' },
  { key: 'benefit4', icon: 'Users', color: 'amber' },
];

export default function About() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ users: 0, rating: 0 });

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

        setStats({ users: usersSnap.size, rating: avgRating || 0 });
      } catch (err) {
        console.error('About stats error:', err);
      }
    }
    fetchStats();
  }, []);

  const iconMap = { Clock: Icons.Clock, Money: Icons.Money, TrendingUp: Icons.TrendingUp, Users: Icons.Users };
  const colorMap = {
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-emerald-500/20 text-emerald-400',
    purple: 'bg-purple-500/20 text-purple-400',
    amber: 'bg-amber-500/20 text-amber-400',
    cyan: 'bg-cyan-500/20 text-cyan-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    pink: 'bg-pink-500/20 text-pink-400',
    orange: 'bg-orange-500/20 text-orange-400',
    red: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4">
            {t('aboutPage.title1')} <span className="text-dng-cyan">{t('aboutPage.title2')}</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            {t('aboutPage.tagline')}
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto text-base leading-relaxed mt-3">
            {t('aboutPage.intro')}
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 sm:p-6 text-center">
            <div className="text-3xl sm:text-4xl font-black text-white mb-2">{stats.users}</div>
            <div className="text-xs sm:text-sm text-gray-400 font-medium uppercase tracking-wider">{t('aboutPage.statsUsers')}</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 sm:p-6 text-center">
            <div className="text-3xl sm:text-4xl font-black text-white mb-2">{stats.rating > 0 ? stats.rating : '-'}</div>
            <div className="text-xs sm:text-sm text-gray-400 font-medium uppercase tracking-wider">{t('aboutPage.statsRating')}</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 sm:p-6 text-center">
            <div className="text-3xl sm:text-4xl font-black text-white mb-2">24/7</div>
            <div className="text-xs sm:text-sm text-gray-400 font-medium uppercase tracking-wider">{t('aboutPage.statsSupport')}</div>
          </motion.div>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-3xl p-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
              <Icons.Target />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">{t('aboutPage.mission')}</h3>
            <p className="text-gray-400 leading-relaxed">{t('aboutPage.missionDesc')}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-3xl p-8">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
              <Icons.Eye />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">{t('aboutPage.vision')}</h3>
            <p className="text-gray-400 leading-relaxed">{t('aboutPage.visionDesc')}</p>
          </motion.div>
        </div>

        {/* WHY CHOOSE US — Business Benefits */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
          <div className="text-center mb-10">
            <p className="text-xs text-dng-cyan uppercase tracking-widest font-bold mb-2">{t('aboutPage.whyBadge')}</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">{t('aboutPage.whyTitle')}</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">{t('aboutPage.whyDesc')}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BENEFITS.map((b, i) => {
              const IconComp = iconMap[b.icon] || Icons.Star;
              return (
                <motion.div
                  key={b.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 hover:border-white/20 hover:bg-white/[0.04] transition-all group"
                >
                  <div className={`w-12 h-12 rounded-xl ${colorMap[b.color]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComp />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{t(`aboutPage.${b.key}Title`)}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{t(`aboutPage.${b.key}Desc`)}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* AI AGENTS — What they do for business */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
          <div className="text-center mb-10">
            <p className="text-xs text-dng-cyan uppercase tracking-widest font-bold mb-2">{t('aboutPage.agentsBadge')}</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">{t('aboutPage.agentsTitle')}</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">{t('aboutPage.agentsDesc')}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {AI_AGENTS.map((agent, i) => (
              <motion.div
                key={agent.key}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#0A0A0C] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all"
              >
                <div className={`w-10 h-10 rounded-lg ${colorMap[agent.color]} flex items-center justify-center mb-3`}>
                  <Icons.Bot />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{t(`aboutPage.agent_${agent.key}_name`)}</h4>
                <p className="text-[11px] text-gray-500 leading-snug">{t(`aboutPage.agent_${agent.key}_desc`)}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link to="/agents" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-dng-blue to-dng-cyan text-white font-bold rounded-xl hover:opacity-90 transition-all">
              {t('aboutPage.tryAgents')} <Icons.ArrowRight />
            </Link>
          </div>
        </motion.div>

        {/* VALUES */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
          <h2 className="text-3xl font-black text-white text-center mb-10">{t('aboutPage.values')}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mx-auto mb-4">
                <Icons.Target />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{t('aboutPage.value1')}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{t('aboutPage.value1Desc')}</p>
            </div>
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-4">
                <Icons.Star />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{t('aboutPage.value2')}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{t('aboutPage.value2Desc')}</p>
            </div>
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 mx-auto mb-4">
                <Icons.Clock />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{t('aboutPage.value3')}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{t('aboutPage.value3Desc')}</p>
            </div>
          </div>
        </motion.div>

        {/* BUSINESS IDEAS / USE CASES */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
          <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 rounded-3xl p-8 sm:p-10">
            <div className="text-center mb-8">
              <p className="text-xs text-dng-cyan uppercase tracking-widest font-bold mb-2">{t('aboutPage.useCasesBadge')}</p>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">{t('aboutPage.useCasesTitle')}</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">{t('aboutPage.useCasesDesc')}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="flex items-start gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                    <Icons.CheckCircle />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">{t(`aboutPage.useCase${i}Title`)}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">{t(`aboutPage.useCase${i}Desc`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <div className="inline-flex flex-col sm:flex-row gap-3">
            <Link to="/packages" className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all">
              {t('aboutPage.ctaPackages')}
            </Link>
            <Link to="/contact" className="px-6 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all">
              {t('aboutPage.ctaContact')}
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}