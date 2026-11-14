// src/pages/Dashboard.jsx — AI სტატისტიკის დაშბორდი (ka / en / ru)
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';

const T = {
  ka: {
    title: 'დაშბორდი', sub: 'შენი AI გამოყენების მიმოხილვა',
    needLogin: 'დაშბორდისთვის საჭიროა შესვლა.', login: 'შესვლა', loading: 'იტვირთება...', errLoad: 'მონაცემები ვერ ჩაიტვირთა', retry: 'ხელახლა ცდა',
    plan: 'პაკეტი', today: 'დღეს', unlimited: 'შეუზღუდავი', left: 'დარჩა',
    telegram: 'ტელეგრამ-ბოტები', total: 'სულ შეტყობინება', last14: 'ბოლო 14 დღე', activity: 'აქტივობა',
    byAgent: 'აგენტების მიხედვით', bySource: 'წყარო', web: 'ვებ-ჩატი', tg: 'ტელეგრამი',
    recent: 'ბოლო შეტყობინებები', empty: 'ჯერ შეტყობინებები არ გაქვს.', emptySub: 'დაიწყე ჩატი აგენტთან და აქ გამოჩნდება ისტორია.',
    tryAgents: 'AI აგენტები', openTg: 'ტელეგრამის მართვა', packages: 'პაკეტები',
    welcome: 'მოგესალმები', msgsToday: 'შეტყობინება დღეს',
    agentNames: { standard: 'ასისტენტი', thinking: 'ღრმა აზროვნება', business: 'ბიზნესი', startup: 'სტარტაპი', finance: 'ფინანსები', crypto: 'კრიპტო', marketing: 'მარკეტინგი', sales: 'გაყიდვები', investing: 'ინვესტიციები', product: 'პროდუქტი', legal: 'იურიდიული', research: 'კვლევა', competitor: 'კონკურენტები', businessplan: 'ბიზნესგეგმა', pitchdeck: 'პიჩდეკი', contract: 'კონტრაქტი', meeting: 'შეხვედრა', calculator: 'კალკულატორი', excel: 'Excel', file: 'ფაილი', code: 'კოდი' },
  },
  en: {
    title: 'Dashboard', sub: 'An overview of your AI usage',
    needLogin: 'You need to sign in to view the dashboard.', login: 'Sign in', loading: 'Loading...', errLoad: 'Could not load data', retry: 'Try again',
    plan: 'Plan', today: 'Today', unlimited: 'Unlimited', left: 'left',
    telegram: 'Telegram bots', total: 'Total messages', last14: 'Last 14 days', activity: 'Activity',
    byAgent: 'By agent', bySource: 'Source', web: 'Web chat', tg: 'Telegram',
    recent: 'Recent messages', empty: 'No messages yet.', emptySub: 'Start a chat with an agent and your history will show up here.',
    tryAgents: 'AI agents', openTg: 'Manage Telegram', packages: 'Plans',
    welcome: 'Welcome back', msgsToday: 'messages today',
    agentNames: { standard: 'Assistant', thinking: 'Deep Thinking', business: 'Business', startup: 'Startup', finance: 'Finance', crypto: 'Crypto', marketing: 'Marketing', sales: 'Sales', investing: 'Investing', product: 'Product', legal: 'Legal', research: 'Research', competitor: 'Competitors', businessplan: 'Business Plan', pitchdeck: 'Pitch Deck', contract: 'Contract', meeting: 'Meeting Notes', calculator: 'Calculator', excel: 'Excel', file: 'File', code: 'Code' },
  },
  ru: {
    title: 'Панель', sub: 'Обзор вашего использования AI',
    needLogin: 'Для панели нужно войти.', login: 'Войти', loading: 'Загрузка...', errLoad: 'Не удалось загрузить данные', retry: 'Повторить',
    plan: 'Пакет', today: 'Сегодня', unlimited: 'Без лимита', left: 'осталось',
    telegram: 'Telegram-боты', total: 'Всего сообщений', last14: 'Последние 14 дней', activity: 'Активность',
    byAgent: 'По агентам', bySource: 'Источник', web: 'Веб-чат', tg: 'Telegram',
    recent: 'Последние сообщения', empty: 'Сообщений пока нет.', emptySub: 'Начните чат с агентом, и здесь появится история.',
    tryAgents: 'AI агенты', openTg: 'Управление Telegram', packages: 'Пакеты',
    welcome: 'С возвращением', msgsToday: 'сообщений сегодня',
    agentNames: { standard: 'Ассистент', thinking: 'Глубокое мышление', business: 'Бизнес', startup: 'Стартап', finance: 'Финансы', crypto: 'Крипто', marketing: 'Маркетинг', sales: 'Продажи', investing: 'Инвестиции', product: 'Продукт', legal: 'Юридический', research: 'Исследование', competitor: 'Конкуренты', businessplan: 'Бизнес-план', pitchdeck: 'Питчдек', contract: 'Контракт', meeting: 'Заметки встреч', calculator: 'Калькулятор', excel: 'Excel', file: 'Файл', code: 'Код' },
  },
};

const AGENT_COLORS = {
  standard: 'from-blue-500 to-cyan-400', thinking: 'from-violet-500 to-purple-400', business: 'from-emerald-500 to-teal-400',
  startup: 'from-orange-500 to-amber-400', finance: 'from-green-500 to-lime-400', crypto: 'from-yellow-500 to-amber-400',
  marketing: 'from-pink-500 to-rose-400', sales: 'from-red-500 to-orange-400', investing: 'from-teal-500 to-cyan-400',
  product: 'from-indigo-500 to-blue-400', legal: 'from-slate-500 to-gray-400', research: 'from-cyan-500 to-blue-400',
  competitor: 'from-fuchsia-500 to-pink-400', businessplan: 'from-emerald-500 to-green-400', pitchdeck: 'from-purple-500 to-fuchsia-400',
  contract: 'from-gray-500 to-slate-400', meeting: 'from-sky-500 to-blue-400', calculator: 'from-amber-500 to-yellow-400',
  excel: 'from-green-600 to-emerald-400', file: 'from-blue-600 to-indigo-400', code: 'from-zinc-500 to-neutral-400', vision: 'from-violet-600 to-indigo-400',
};

const Icon = {
  msg: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  total: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 3v18h18"/><path d="M18.4 8.6 12 15l-3-3-4 4"/></svg>,
  bot: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4M8 16h0M16 16h0"/></svg>,
  split: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M16 3h5v5M8 3H3v5M3 16v5h5M21 16v5h-5"/></svg>,
  inbox: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
};

const card = 'relative bg-white/[0.03] border border-white/10 rounded-3xl p-6 overflow-hidden';
const gloss = 'absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br blur-3xl opacity-20 pointer-events-none';

export default function Dashboard() {
  const { i18n } = useTranslation();
  const lang = ['ka', 'en', 'ru'].includes((i18n.language || 'ka').split('-')[0]) ? (i18n.language || 'ka').split('-')[0] : 'ka';
  const L = T[lang];
  const dateLocale = lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'ka-GE';
  const { currentUser, loading } = useAuth();
  const [data, setData] = useState(null);
  const [err, setErr] = useState(false);
  const [hoverBar, setHoverBar] = useState(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!currentUser) return;
    setErr(false);
    (async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const r = await fetch('/api/usage-stats', { headers: { Authorization: `Bearer ${token}` } });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setData(d);
      } catch {
        setErr(true);
      }
    })();
  }, [currentUser, reload]);

  if (loading || (currentUser && !data && !err)) return <SkeletonShell />;

  if (!currentUser) {
    return (
      <Shell>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={card + ' text-center py-14'}>
          <div className={gloss + ' from-blue-500 to-cyan-400 left-1/2 -translate-x-1/2 top-0'} />
          <Icon.inbox className="w-14 h-14 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 mb-5">{L.needLogin}</p>
          <Link to="/login" className="inline-block px-7 py-3 rounded-xl bg-white text-black font-bold hover:scale-105 transition-transform">{L.login}</Link>
        </motion.div>
      </Shell>
    );
  }

  if (err) {
    return (
      <Shell>
        <div className={card + ' text-center py-14'}>
          <p className="text-red-400 mb-5">{L.errLoad}</p>
          <button onClick={() => setReload((n) => n + 1)} className="px-6 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white font-semibold hover:bg-white/15 transition-colors">{L.retry}</button>
        </div>
      </Shell>
    );
  }

  const unlimited = data.daily.limit === -1;
  const left = unlimited ? null : Math.max(0, data.daily.limit - data.daily.used);
  const maxDay = Math.max(1, ...data.series.map((s) => s.count));
  const agentEntries = Object.entries(data.perAgent).sort((a, b) => b[1] - a[1]);
  const maxAgent = Math.max(1, ...agentEntries.map(([, v]) => v));
  const name = (k) => L.agentNames[k] || k;
  const grad = (k) => AGENT_COLORS[k] || 'from-blue-500 to-cyan-400';

  return (
    <Shell>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">{L.welcome}{currentUser.displayName ? `, ${currentUser.displayName.split(' ')[0]}` : ''}</p>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{L.title}</h1>
          </div>
          <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400/15 to-blue-500/15 border border-cyan-400/25 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            {L.plan}: {data.package}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat icon={Icon.msg} grad="from-blue-500 to-cyan-400" label={L.today} value={data.daily.used} sub={unlimited ? L.unlimited : `${left} ${L.left}`} />
          <Stat icon={Icon.total} grad="from-purple-500 to-fuchsia-400" label={L.total} value={data.totalMessages} />
          <Stat icon={Icon.bot} grad="from-emerald-500 to-teal-400" label={L.telegram} value={`${data.telegram.used} / ${data.telegram.limit}`} />
          <Stat icon={Icon.split} grad="from-orange-500 to-amber-400" label={L.bySource} value={`${data.perSource.web} / ${data.perSource.telegram}`} sub={`${L.web} / ${L.tg}`} />
        </div>

        <div className={card}>
          <div className={gloss + ' from-blue-500 to-cyan-400 top-0 right-0'} />
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">{L.last14}</h2>
            <span className="text-xs text-gray-500">{L.activity}</span>
          </div>
          <div className="h-44 flex items-end gap-1.5 relative">
            {data.series.map((s, i) => (
              <div key={s.date} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5"
                onMouseEnter={() => setHoverBar(i)} onMouseLeave={() => setHoverBar(null)}>
                <AnimatePresence>
                  {hoverBar === i && (
                    <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-[10px] font-bold text-cyan-300 bg-cyan-400/10 border border-cyan-400/20 rounded px-1.5 py-0.5">
                      {s.count}
                    </motion.span>
                  )}
                </AnimatePresence>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(s.count ? 10 : 4, (s.count / maxDay) * 100)}%` }}
                  transition={{ duration: 0.6, delay: i * 0.03, ease: 'easeOut' }}
                  whileHover={{ scaleY: 1.03 }}
                  className={`w-full rounded-lg bg-gradient-to-t transition-opacity ${s.count ? 'from-blue-500 to-cyan-400' : 'from-white/10 to-white/5'} ${hoverBar !== null && hoverBar !== i ? 'opacity-40' : 'opacity-100'}`}
                  style={{ transformOrigin: 'bottom' }}
                />
                <span className="text-[9px] text-gray-600 font-medium">{new Date(s.date).toLocaleDateString(dateLocale, { day: '2-digit', month: '2-digit' })}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <div className={card}>
            <h2 className="text-lg font-bold text-white mb-5">{L.byAgent}</h2>
            {agentEntries.length === 0 ? (
              <EmptyMini text={L.empty} />
            ) : (
              <ul className="space-y-3.5">
                {agentEntries.slice(0, 8).map(([k, v], i) => (
                  <li key={k}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-300 font-medium">{name(k)}</span>
                      <span className="text-white font-bold tabular-nums">{v}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(v / maxAgent) * 100}%` }}
                        transition={{ duration: 0.8, delay: i * 0.05, ease: 'easeOut' }}
                        className={`h-full rounded-full bg-gradient-to-r ${grad(k)}`} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={card}>
            <h2 className="text-lg font-bold text-white mb-5">{L.recent}</h2>
            {data.recent.length === 0 ? (
              <EmptyMini text={L.empty} sub={L.emptySub} />
            ) : (
              <ul className="space-y-2.5 max-h-[22rem] overflow-y-auto pr-1 scrollbar-thin">
                {data.recent.map((r, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-colors">
                    <div className="flex justify-between items-center gap-2 mb-1.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-gradient-to-r ${grad(r.mode)} bg-clip-text text-transparent`}>
                        {name(r.mode)}
                      </span>
                      <span className="text-[10px] text-gray-500 shrink-0">
                        {r.source === 'telegram' ? L.tg : L.web} · {r.createdAt ? new Date(r.createdAt).toLocaleString(dateLocale, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 truncate">{r.message || '—'}</p>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/agents" className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-sm hover:opacity-90 hover:scale-[1.02] transition-all">{L.tryAgents}</Link>
          <Link to="/telegram" className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-colors">{L.openTg}</Link>
          <Link to="/packages" className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-colors">{L.packages}</Link>
        </div>
      </motion.div>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-[#050505] pt-28 pb-24 px-4 relative overflow-hidden">
      <motion.div animate={{ x: [0, 30, 0], y: [0, -15, 0] }} transition={{ duration: 16, repeat: Infinity }}
        className="absolute top-0 left-1/4 w-[600px] h-[450px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <motion.div animate={{ x: [0, -30, 0], y: [0, 15, 0] }} transition={{ duration: 18, repeat: Infinity }}
        className="absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="relative max-w-6xl mx-auto">{children}</div>
    </div>
  );
}

function Stat({ icon: IconC, grad, label, value, sub }) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="relative bg-white/[0.03] border border-white/10 rounded-2xl p-5 overflow-hidden group">
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${grad} blur-2xl opacity-0 group-hover:opacity-20 transition-opacity`} />
      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${grad} bg-opacity-10 flex items-center justify-center mb-3`}>
        <IconC className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
      </div>
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">{label}</p>
      <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </motion.div>
  );
}

function EmptyMini({ text, sub }) {
  return (
    <div className="text-center py-8">
      <Icon.inbox className="w-10 h-10 mx-auto text-gray-700 mb-3" />
      <p className="text-gray-500 text-sm">{text}</p>
      {sub && <p className="text-gray-600 text-xs mt-1">{sub}</p>}
    </div>
  );
}

function SkeletonShell() {
  const pulse = 'animate-pulse bg-white/5 rounded-xl';
  return (
    <Shell>
      <div className="space-y-5">
        <div className="flex justify-between items-end">
          <div>
            <div className={`${pulse} h-4 w-28 mb-2`} />
            <div className={`${pulse} h-9 w-48`} />
          </div>
          <div className={`${pulse} h-9 w-28`} />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className={`${pulse} h-28`} />)}
        </div>
        <div className={`${pulse} h-56`} />
        <div className="grid lg:grid-cols-2 gap-5">
          <div className={`${pulse} h-64`} />
          <div className={`${pulse} h-64`} />
        </div>
      </div>
    </Shell>
  );
}