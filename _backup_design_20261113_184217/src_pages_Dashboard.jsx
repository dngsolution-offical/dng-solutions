import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useFreeTrial, PACKAGE_LIMITS } from '../hooks/useFreeTrial';

const Icons = {
  Bot: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Crown: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 17l3-10 4 6 2-8 2 8 4-6 3 10H3z" /></svg>,
  Clock: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Table: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7-8v8m14-8v8M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" /></svg>,
  AlertTriangle: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  ArrowRight: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>,
  CheckCircle: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Activity: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
};

const THEME = {
  Free: { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30', grad: 'from-gray-500 to-gray-700' },
  Basic: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', grad: 'from-blue-500 to-cyan-500' },
  Gold: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', grad: 'from-amber-400 to-orange-500' },
  Diamond: { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', grad: 'from-purple-500 to-pink-500' },
  Infinity: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', grad: 'from-emerald-400 to-teal-500' },
};

export default function Dashboard() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { trialData, timeLeft, loading } = useFreeTrial(currentUser?.uid);
  const navigate = useNavigate();

  // Fake activity feed for realism
  const [activity] = useState([
    { id: 1, type: 'order', text: 'New order parsed successfully', time: '2 mins ago', icon: Icons.CheckCircle, color: 'text-emerald-400' },
    { id: 2, type: 'agent', text: 'AI Agent completed Excel export', time: '15 mins ago', icon: Icons.Bot, color: 'text-blue-400' },
    { id: 3, type: 'system', text: 'Daily report generated', time: '1 hour ago', icon: Icons.Activity, color: 'text-purple-400' },
  ]);

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">{t('common.loading')}</div>;
  if (!currentUser) return null;

  const pkg = trialData?.package || 'Free';
  const isExpired = trialData?.isExpired;
  const limits = PACKAGE_LIMITS[pkg] || PACKAGE_LIMITS.Free;
  const ordersUsed = trialData?.ordersUsed || 0;
  
  const maxOrders = limits.maxOrders;
  const isUnlimited = maxOrders === -1;
  const ordersLeft = isUnlimited ? '∞' : Math.max(0, maxOrders - ordersUsed);
  const percentUsed = isUnlimited ? 10 : Math.min(100, (ordersUsed / maxOrders) * 100);
  const theme = THEME[pkg] || THEME.Free;

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-20 px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-gradient-to-b ${theme.grad} opacity-[0.03] blur-3xl`} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Expiration Banner */}
        {(isExpired || (timeLeft && timeLeft.days <= 5)) && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className={`p-4 mb-8 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md ${isExpired ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isExpired ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                <Icons.AlertTriangle />
              </div>
              <div>
                <h3 className={`font-bold ${isExpired ? 'text-red-400' : 'text-amber-400'}`}>
                  {isExpired ? t('dashboard.subscriptionExpired') : t('dashboard.expiringSoon')}
                </h3>
                <p className="text-sm text-gray-300">
                  {isExpired ? t('dashboard.renewToRestore') : t('dashboard.expiresIn', { days: timeLeft.days })}
                </p>
              </div>
            </div>
            <Link to="/packages" className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl transition-all whitespace-nowrap">
              {t('dashboard.renewNow')}
            </Link>
          </motion.div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
              {t('dashboard.welcome')} {currentUser.displayName?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-gray-400">{t('dashboard.overview')}</p>
          </div>
          <div className={`px-5 py-3 ${theme.bg} border ${theme.border} rounded-2xl flex items-center gap-3`}>
            <Icons.Crown />
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{t('dashboard.currentPlan')}</p>
              <p className={`text-lg font-black uppercase ${theme.color}`}>{pkg}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div whileHover={{ y: -4 }} className="p-6 rounded-3xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl ${theme.bg} ${theme.color} flex items-center justify-center`}>
                <Icons.Clock />
              </div>
              <h3 className="text-gray-300 font-bold">{t('dashboard.timeRemaining')}</h3>
            </div>
            {pkg === 'Free' ? (
              <div className="text-2xl font-black text-white">{t('dashboard.foreverFree')}</div>
            ) : isExpired ? (
              <div className="text-2xl font-black text-red-400">{t('dashboard.expired')}</div>
            ) : timeLeft ? (
              <div className="flex items-end gap-2 text-white">
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-black">{timeLeft.days}</span>
                  <span className="text-[10px] text-gray-500 uppercase font-bold">{t('common.days')}</span>
                </div>
                <span className="text-2xl text-gray-600 mb-2">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-black">{timeLeft.hours}</span>
                  <span className="text-[10px] text-gray-500 uppercase font-bold">{t('common.hours')}</span>
                </div>
                <span className="text-2xl text-gray-600 mb-2">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-black">{timeLeft.minutes}</span>
                  <span className="text-[10px] text-gray-500 uppercase font-bold">{t('common.minutes')}</span>
                </div>
              </div>
            ) : null}
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="p-6 rounded-3xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${theme.bg} ${theme.color} flex items-center justify-center`}>
                  <Icons.Table />
                </div>
                <h3 className="text-gray-300 font-bold">{t('dashboard.ordersProcessed')}</h3>
              </div>
              <span className="text-xs font-bold text-gray-500">{ordersUsed} / {isUnlimited ? '∞' : maxOrders}</span>
            </div>
            <div className="mb-2 flex items-end justify-between">
              <div>
                <span className="text-4xl font-black text-white">{ordersUsed}</span>
                <span className="text-sm text-gray-500 ml-2">{t('dashboard.used')}</span>
              </div>
              <div className="text-right">
                <span className={`text-xl font-bold ${theme.color}`}>{ordersLeft}</span>
                <span className="text-[10px] text-gray-500 uppercase block">{t('dashboard.left')}</span>
              </div>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${percentUsed}%` }} transition={{ duration: 1 }} className={`h-full bg-gradient-to-r ${theme.grad}`} />
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 cursor-pointer" onClick={() => navigate('/agents')}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center`}>
                <Icons.Bot />
              </div>
              <h3 className="text-gray-300 font-bold">{t('dashboard.aiAgents')}</h3>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-4xl font-black text-white">{limits.maxAgents}</span>
                <span className="text-sm text-gray-500 ml-2">{t('dashboard.available')}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white">
                <Icons.ArrowRight />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">{t('dashboard.quickActions')}</h2>
            <div className="space-y-4">
              <motion.div whileHover={{ scale: 1.01 }} className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/10 cursor-pointer flex items-center justify-between" onClick={() => navigate('/agents')}>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">{t('dashboard.startAiChat')}</h3>
                  <p className="text-xs text-gray-400">{t('dashboard.parseOrders')}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-dng-cyan/20 flex items-center justify-center text-dng-cyan shrink-0">
                  <Icons.Bot />
                </div>
              </motion.div>
              <motion.div whileHover={{ scale: 1.01 }} className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/10 cursor-pointer flex items-center justify-between" onClick={() => navigate('/packages')}>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">{t('dashboard.upgradePlan')}</h3>
                  <p className="text-xs text-gray-400">{t('dashboard.unlockMore')}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <Icons.Crown />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Recent Activity (NEW) */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">{t('dashboard.recentActivity')}</h2>
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-4">
              {activity.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 ${a.color}`}>
                    <a.icon />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300 font-medium">{a.text}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
