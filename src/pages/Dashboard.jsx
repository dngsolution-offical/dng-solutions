import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore/lite';
import { useAuth } from '../context/AuthContext';
import { useFreeTrial, PACKAGE_LIMITS } from '../hooks/useFreeTrial';
import ActivePackageBadge from '../components/ui/ActivePackageBadge';
import { db } from '../firebase';
import { formatCurrency, getPrice } from '../utils/currency';
import CountUp from '../components/ui/CountUp';

const THEME = {
  Free: { text: 'text-gray-300', bg: 'bg-gray-500/10', border: 'border-gray-500/30', bar: 'from-gray-400 to-gray-600' },
  Basic: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', bar: 'from-blue-500 to-cyan-500' },
  Gold: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', bar: 'from-amber-400 to-orange-500' },
  Diamond: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', bar: 'from-purple-500 to-pink-500' },
  Infinity: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', bar: 'from-emerald-400 to-teal-500' },
};

const PLANS = [
  { id: 'Basic', features: ['orders100', 'agent1', 'file5mb'] },
  { id: 'Gold', features: ['orders500', 'agent4', 'file10mb', 'prioritySupport'] },
  { id: 'Diamond', features: ['orders2000', 'agent7', 'file25mb', 'support247'] },
  { id: 'Infinity', features: ['ordersUnlimited', 'agentsAll', 'file100mb', 'dedicatedManager'] },
];

const STATUS_STYLE = {
  confirmed: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  completed: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
  cancelled: 'bg-red-500/10 text-red-300 border-red-500/30',
  pending: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
};

const card = {
  hidden: { opacity: 0, y: 20 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.45 } }),
};

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { currentUser } = useAuth();
  const { trialData, timeLeft, loading } = useFreeTrial(currentUser?.uid);
  const navigate = useNavigate();
  const lang = (i18n.language || 'ka').split('-')[0];
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('uid', '==', currentUser.uid),
          limit(200)
        );
        const snap = await getDocs(q);
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data(), date: d.data().createdAt?.toDate?.() ?? null })));
      } catch (e) {
        console.error('orders load:', e.message);
      }
    })();
  }, [currentUser]);

  const chart = useMemo(() => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push({ date: d, count: 0 });
    }
    orders.forEach((o) => {
      if (!o.date) return;
      const day = days.find((x) => x.date.toDateString() === o.date.toDateString());
      if (day) day.count += 1;
    });
    return { days, max: Math.max(1, ...days.map((d) => d.count)) };
  }, [orders]);

  const totals = useMemo(
    () =>
      orders.reduce(
        (acc, o) => {
          acc.amount += Number(o.totalAmount) || 0;
          acc.balance += Number(o.balance) || 0;
          return acc;
        },
        { amount: 0, balance: 0 }
      ),
    [orders]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-gray-400">
        <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!currentUser) return null;

  const pkg = trialData?.package || 'Free';
  const isExpired = trialData?.isExpired;
  const limits = PACKAGE_LIMITS[pkg] || PACKAGE_LIMITS.Free;
  const theme = THEME[pkg] || THEME.Free;
  const ordersUsed = trialData?.ordersUsed || 0;
  const isUnlimited = limits.maxOrders === -1;
  const percentUsed = isUnlimited ? 100 : Math.min(100, (ordersUsed / limits.maxOrders) * 100);
  const ordersLeft = isUnlimited ? '∞' : Math.max(0, limits.maxOrders - ordersUsed);
  const dateLocale = lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'ka-GE';
  const firstName = currentUser.displayName?.split(' ')[0] || 'User';
  const showExpiry = isExpired || (timeLeft && timeLeft.days <= 5);

  return (
    <div className="min-h-screen bg-[#050505] pt-28 pb-20 px-4 relative overflow-hidden">
      <motion.div
        animate={{ opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 8, repeat: Infinity }}
        className={`pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-gradient-to-b ${theme.bar} blur-3xl`}
      />

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        {showExpiry && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md ${
              isExpired ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'
            }`}
          >
            <div>
              <h3 className={`font-bold ${isExpired ? 'text-red-400' : 'text-amber-400'}`}>
                {isExpired ? t('dashboard.subscriptionExpired') : t('dashboard.expiringSoon')}
              </h3>
              <p className="text-sm text-gray-300 mt-1">
                {isExpired ? t('dashboard.renewToRestore') : t('dashboard.expiresIn', { days: timeLeft.days })}
              </p>
            </div>
            <Link to="/packages" className="px-6 py-2.5 bg-white text-black font-bold text-sm rounded-xl hover:bg-gray-200 transition-colors whitespace-nowrap">
              {t('dashboard.renewNow')}
            </Link>
          </motion.div>
        )}

        <motion.div variants={card} initial="hidden" animate="show" custom={0} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
              {t('dashboard.welcome')} {firstName}
            </h1>
            <p className="text-gray-400">{t('dashboard.overview')}</p>
          </div>
          <div className={`px-5 py-3 ${theme.bg} border ${theme.border} rounded-2xl flex items-center gap-3`}>
            <span className={`text-lg ${theme.text}`}>★</span>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{t('dashboard.currentPlan')}</p>
              <p className={`text-lg font-black uppercase ${theme.text}`}>{pkg}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          <motion.div variants={card} initial="hidden" animate="show" custom={1} whileHover={{ y: -4 }} className="p-6 rounded-3xl bg-white/[0.03] border border-white/10">
            <p className="text-gray-400 text-sm font-semibold mb-4">{t('dashboard.timeRemaining')}</p>
            {pkg === 'Free' ? (
              <div className="text-2xl font-black text-white">{t('dashboard.foreverFree')}</div>
            ) : isExpired ? (
              <div className="text-2xl font-black text-red-400">{t('dashboard.expired')}</div>
            ) : timeLeft ? (
              <div className="flex items-end gap-3 text-white">
                {[
                  { v: timeLeft.days, l: t('common.days') },
                  { v: timeLeft.hours, l: t('common.hours') },
                  { v: timeLeft.minutes, l: t('common.minutes') },
                ].map((x, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span className="text-2xl text-gray-600 mb-3">:</span>}
                    <div className="flex flex-col items-center">
                      <span className="text-4xl font-black tabular-nums">{String(x.v).padStart(2, '0')}</span>
                      <span className="text-[10px] text-gray-500 uppercase font-bold">{x.l}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            ) : null}
          </motion.div>

          <motion.div variants={card} initial="hidden" animate="show" custom={2} whileHover={{ y: -4 }} className="p-6 rounded-3xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-400 text-sm font-semibold">{t('dashboard.ordersProcessed')}</p>
              <span className="text-xs text-gray-500 font-bold">{ordersUsed} / {isUnlimited ? '∞' : limits.maxOrders}</span>
            </div>
            <div className="flex items-end justify-between mb-3">
              <div>
                <span className="text-4xl font-black text-white"><CountUp value={ordersUsed} /></span>
                <span className="text-sm text-gray-500 ml-2">{t('dashboard.used')}</span>
              </div>
              <div className="text-right">
                <span className={`text-xl font-bold ${theme.text}`}>{ordersLeft}</span>
                <span className="text-[10px] text-gray-500 uppercase block">{t('dashboard.left')}</span>
              </div>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentUsed}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className={`h-full bg-gradient-to-r ${theme.bar}`}
              />
            </div>
          </motion.div>

          <motion.div
            variants={card}
            initial="hidden"
            animate="show"
            custom={3}
            whileHover={{ y: -4 }}
            onClick={() => navigate('/agents')}
            className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 cursor-pointer"
          >
            <p className="text-gray-400 text-sm font-semibold mb-4">{t('dashboard.aiAgents')}</p>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-4xl font-black text-white"><CountUp value={limits.maxAgents} /></span>
                <span className="text-sm text-gray-500 ml-2">{t('dashboard.available')}</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white">→</div>
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <motion.div variants={card} initial="hidden" animate="show" custom={4} className="lg:col-span-2 p-6 rounded-3xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">{t('dashboard.chartTitle')}</h2>
              <div className="text-right">
                <p className="text-xs text-gray-500">{t('dashboard.totalAmount')}</p>
                <p className={`font-black ${theme.text}`}>{formatCurrency(totals.amount, lang)}</p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-gray-500 text-sm">{t('dashboard.chartEmpty')}</div>
            ) : (
              <div className="h-48 flex items-end gap-1.5">
                {chart.days.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-2 group">
                    <span className="text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">{d.count}</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(d.count ? 8 : 3, (d.count / chart.max) * 100)}%` }}
                      transition={{ duration: 0.7, delay: i * 0.03, ease: 'easeOut' }}
                      className={`w-full rounded-md bg-gradient-to-t ${theme.bar} ${d.count ? 'opacity-100' : 'opacity-20'}`}
                    />
                    <span className="text-[9px] text-gray-600">{d.date.toLocaleDateString(dateLocale, { day: '2-digit', month: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div variants={card} initial="hidden" animate="show" custom={5} className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-5">
            <h2 className="text-lg font-bold text-white">{t('dashboard.quickActions')}</h2>
            <Link to="/agents" className="block p-4 rounded-2xl bg-gradient-to-br from-blue-500/15 to-cyan-500/10 border border-cyan-500/20 hover:border-cyan-400/50 transition-colors">
              <p className="font-bold text-white">{t('dashboard.startAiChat')}</p>
              <p className="text-xs text-gray-400 mt-1">{t('dashboard.parseOrders')}</p>
            </Link>
            <Link to="/packages" className="block p-4 rounded-2xl bg-gradient-to-br from-purple-500/15 to-pink-500/10 border border-purple-500/20 hover:border-purple-400/50 transition-colors">
              <p className="font-bold text-white">{t('dashboard.upgradePlan')}</p>
              <p className="text-xs text-gray-400 mt-1">{t('dashboard.unlockMore')}</p>
            </Link>
            <div className="pt-4 border-t border-white/5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{t('dashboard.totalBalance')}</span>
                <span className="font-bold text-red-300">{formatCurrency(totals.balance, lang)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{t('dashboard.usage')}</span>
                <span className="font-bold text-white">{Math.round(percentUsed)}%</span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div variants={card} initial="hidden" animate="show" custom={6} className="rounded-3xl bg-white/[0.03] border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">{t('dashboard.recentOrders')}</h2>
            <Link to="/agents/history" className="text-sm text-cyan-300 hover:underline">{t('dashboard.viewAll')}</Link>
          </div>
          {orders.length === 0 ? (
            <div className="p-10 text-center text-gray-500 text-sm">{t('dashboard.noOrders')}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-gray-500 text-xs uppercase tracking-wider">
                  <tr className="border-b border-white/5">
                    <th className="text-left px-6 py-3 font-semibold">{t('dashboard.client')}</th>
                    <th className="text-left px-6 py-3 font-semibold">{t('dashboard.date')}</th>
                    <th className="text-right px-6 py-3 font-semibold">{t('dashboard.amount')}</th>
                    <th className="text-right px-6 py-3 font-semibold">{t('dashboard.balance')}</th>
                    <th className="text-center px-6 py-3 font-semibold">{t('dashboard.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 8).map((o, i) => (
                    <motion.tr
                      key={o.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-6 py-4 text-white font-medium">{o.clientName || '—'}</td>
                      <td className="px-6 py-4 text-gray-400">{o.date ? o.date.toLocaleDateString(dateLocale) : (o.orderDate || '—')}</td>
                      <td className="px-6 py-4 text-right text-white font-bold">{formatCurrency(o.totalAmount || 0, lang)}</td>
                      <td className="px-6 py-4 text-right text-red-300">{formatCurrency(o.balance || 0, lang)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold uppercase ${STATUS_STYLE[o.status] || STATUS_STYLE.pending}`}>
                          {t(`dashboard.status${(o.status || 'pending').charAt(0).toUpperCase()}${(o.status || 'pending').slice(1)}`, { defaultValue: o.status || '—' })}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        <motion.div variants={card} initial="hidden" animate="show" custom={7}>
          <h2 className="text-lg font-bold text-white mb-5">{t('dashboard.comparePlans')}</h2>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
            {PLANS.map((p, i) => {
              const isCurrent = p.id === pkg;
              const pt = THEME[p.id];
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  whileHover={{ y: -6 }}
                  className={`relative p-6 rounded-3xl border bg-white/[0.02] ${isCurrent ? `${pt.border} shadow-[0_0_40px_-12px_rgba(6,182,212,0.4)]` : 'border-white/10'}`}
                >
                  {isCurrent && (
                    <span className={`absolute -top-3 left-6 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-gradient-to-r ${pt.bar} text-white`}>
                      {t('dashboard.current')}
                    </span>
                  )}
                  <h3 className={`text-xl font-black ${pt.text}`}>{p.id}</h3>
                  <p className="text-2xl font-black text-white mt-3">
                    {formatCurrency(getPrice(p.id, lang), lang)}
                    <span className="text-xs text-gray-500 font-medium"> / {t('packages.monthly')}</span>
                  </p>
                  <ul className="mt-5 space-y-2.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className={`mt-0.5 ${pt.text}`}>✓</span>
                        {t(`packages.features.${f}`)}
                      </li>
                    ))}
                  </ul>
                  {!isCurrent && (
                    <Link to="/packages" className="mt-6 block text-center py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
                      {t('packages.activate')}
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}