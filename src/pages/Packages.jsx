// src/pages/Packages.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { PACKAGES, SAVINGS, formatPrice } from '../config/packagePrices';

const SUPPORTED = ['ka', 'en', 'ru'];

function normalizeLang(value) {
  const code = String(value || 'ka').toLowerCase().split('-')[0];
  return SUPPORTED.includes(code) ? code : 'ka';
}

const T = {
  ka: {
    badge: 'ფასები',
    title: 'აირჩიეთ თქვენი',
    accent: 'AI პაკეტი',
    sub: 'ყველა პაკეტში შედის AI აგენტები. Telegram ბოტების მხარდაჭერა იწყება Diamond პაკეტიდან.',
    monthly: '1 თვე',
    semiannual: '6 თვე',
    yearly: '1 წელი',
    save: 'დაზოგეთ',
    activate: 'გააქტიურება',
    popular: 'ყველაზე პოპულარული',
    premium: 'პრემიუმი',
    perMonth: '/თვეში',
    featTitle: 'რას მოიცავს',
    compareTitle: 'სრული შედარება',
    compareSub: 'აირჩიეთ პაკეტი თქვენი საჭიროებების მიხედვით',
    note: 'უსაფრთხო გადახდა · პაკეტი გადახდის შემდეგ ავტომატურად გააქტიურდება',
    f: {
      orders: 'შეკვეთა თვეში',
      unlimitedOrders: 'შეუზღუდავი შეკვეთა',
      unlimited: 'შეუზღუდავი',
      agents: 'სპეციალიზებული AI აგენტი',
      storage: 'ფაილის ატვირთვის ლიმიტი',
      telegram: 'დაკავშირებადი Telegram ბოტი',
      priority: 'პრიორიტეტული მხარდაჭერა',
      support247: '24/7 ცოცხალი მხარდაჭერა',
      manager: 'პერსონალური ანგარიშის მენეჯერი',
      noTelegram: 'Telegram ბოტის გარეშე',
      orderRow: 'შეკვეთა თვეში',
      agentRow: 'AI აგენტი',
      storageRow: 'ფაილის ატვირთვა',
      priorityRow: 'პრიორიტეტული მხარდაჭერა',
      supportRow: '24/7 მხარდაჭერა',
      telegramRow: 'Telegram ბოტი',
      managerRow: 'პერსონალური მენეჯერი',
    },
    detail: {
      Basic: 'საწყისი დონე მცირე ბიზნესისთვის. 4 AI აგენტი ამუშავებს შეკვეთებს და ზოგავს დროს. Telegram ბოტი არ შედის.',
      Gold: 'გაფართოებული პაკეტი მზარდი ბიზნესისთვის — 7 AI აგენტი, მეტი ლიმიტი და პრიორიტეტული მხარდაჭერა.',
      Diamond: 'სრული ავტომატიზაცია: 21 AI აგენტი და 3 Telegram ბოტი, რომლებიც 24/7 პასუხობენ კლიენტებს.',
      Infinity: 'ყველაფერი შეუზღუდავი — შეკვეთები, ფაილები, 21 AI აგენტი, 10 Telegram ბოტი და პირადი მენეჯერი.',
    },
  },
  en: {
    badge: 'Pricing',
    title: 'Choose your',
    accent: 'AI Plan',
    sub: 'Every plan includes AI agents. Telegram bot support starts from the Diamond plan.',
    monthly: '1 Month',
    semiannual: '6 Months',
    yearly: '1 Year',
    save: 'Save',
    activate: 'Activate',
    popular: 'Most Popular',
    premium: 'Premium',
    perMonth: '/mo',
    featTitle: "What's included",
    compareTitle: 'Full comparison',
    compareSub: 'Pick the plan that fits your needs',
    note: 'Secure payment · Your plan activates automatically after payment',
    f: {
      orders: 'orders per month',
      unlimitedOrders: 'Unlimited orders',
      unlimited: 'Unlimited',
      agents: 'specialized AI agents',
      storage: 'file upload limit',
      telegram: 'connectable Telegram bots',
      priority: 'Priority support',
      support247: '24/7 live support',
      manager: 'Dedicated account manager',
      noTelegram: 'No Telegram bot',
      orderRow: 'Orders per month',
      agentRow: 'AI agents',
      storageRow: 'File upload',
      priorityRow: 'Priority support',
      supportRow: '24/7 support',
      telegramRow: 'Telegram bots',
      managerRow: 'Personal manager',
    },
    detail: {
      Basic: 'An entry-level plan for small businesses. 4 AI agents handle orders and save time. Telegram bot is not included.',
      Gold: 'An expanded plan for growing businesses: 7 AI agents, higher limits and priority support.',
      Diamond: 'Full automation: all 21 AI agents plus 3 Telegram bots that answer customers 24/7.',
      Infinity: 'Everything unlimited: orders, storage, all 21 AI agents, 10 Telegram bots and a personal manager.',
    },
  },
  ru: {
    badge: 'Тарифы',
    title: 'Выберите свой',
    accent: 'AI тариф',
    sub: 'Каждый тариф включает AI агентов. Поддержка Telegram-ботов начинается с тарифа Diamond.',
    monthly: '1 месяц',
    semiannual: '6 месяцев',
    yearly: '1 год',
    save: 'Экономия',
    activate: 'Активировать',
    popular: 'Популярный',
    premium: 'Премиум',
    perMonth: '/мес',
    featTitle: 'Что входит',
    compareTitle: 'Полное сравнение',
    compareSub: 'Выберите тариф, который подходит вашим задачам',
    note: 'Безопасная оплата · Тариф активируется автоматически после оплаты',
    f: {
      orders: 'заказов в месяц',
      unlimitedOrders: 'Заказы без ограничений',
      unlimited: 'Без лимита',
      agents: 'специализированных AI агентов',
      storage: 'лимит загрузки файлов',
      telegram: 'подключаемых Telegram-ботов',
      priority: 'Приоритетная поддержка',
      support247: 'Поддержка 24/7',
      manager: 'Персональный менеджер аккаунта',
      noTelegram: 'Без Telegram-бота',
      orderRow: 'Заказов в месяц',
      agentRow: 'AI агенты',
      storageRow: 'Загрузка файлов',
      priorityRow: 'Приоритетная поддержка',
      supportRow: 'Поддержка 24/7',
      telegramRow: 'Telegram-боты',
      managerRow: 'Персональный менеджер',
    },
    detail: {
      Basic: 'Стартовый тариф для малого бизнеса. 4 AI агента обрабатывают заказы и экономят время. Telegram-бот не входит.',
      Gold: 'Расширенный тариф для растущего бизнеса: 7 AI агентов, увеличенные лимиты и приоритетная поддержка.',
      Diamond: 'Полная автоматизация: все 21 AI агент и 3 Telegram-бота, которые отвечают клиентам 24/7.',
      Infinity: 'Всё без ограничений: заказы, файлы, все 21 AI агент, 10 Telegram-ботов и персональный менеджер.',
    },
  },
};

const PACKAGE_THEME = {
  Basic: {
    accent: 'from-cyan-500 to-blue-500',
    text: 'text-cyan-300',
    border: 'border-cyan-400/20 hover:border-cyan-400/60',
    glow: 'hover:shadow-[0_25px_70px_-20px_rgba(34,211,238,0.45)]',
    bg: 'from-cyan-950/40 to-[#0A0A0C]/95',
    line: 'from-transparent via-cyan-400 to-transparent',
    check: 'text-cyan-400',
    ring: '',
  },
  Gold: {
    accent: 'from-amber-500 to-yellow-400',
    text: 'text-amber-300',
    border: 'border-amber-400/20 hover:border-amber-400/60',
    glow: 'hover:shadow-[0_25px_70px_-20px_rgba(245,158,11,0.45)]',
    bg: 'from-amber-950/40 to-[#0A0A0C]/95',
    line: 'from-transparent via-amber-400 to-transparent',
    check: 'text-amber-400',
    ring: '',
  },
  Diamond: {
    accent: 'from-sky-400 to-indigo-500',
    text: 'text-sky-300',
    border: 'border-sky-400/30 hover:border-sky-400/70',
    glow: 'hover:shadow-[0_25px_70px_-20px_rgba(56,189,248,0.5)]',
    bg: 'from-sky-950/40 to-[#0A0A0C]/95',
    line: 'from-transparent via-sky-400 to-transparent',
    check: 'text-sky-400',
    ring: 'ring-1 ring-sky-400/40 shadow-[0_0_60px_-15px_rgba(56,189,248,0.45)]',
  },
  Infinity: {
    accent: 'from-violet-500 to-fuchsia-500',
    text: 'text-violet-300',
    border: 'border-violet-400/30 hover:border-violet-400/70',
    glow: 'hover:shadow-[0_25px_70px_-20px_rgba(139,92,246,0.5)]',
    bg: 'from-violet-950/40 to-[#0A0A0C]/95',
    line: 'from-transparent via-violet-400 to-transparent',
    check: 'text-violet-400',
    ring: '',
  },
};

const CYCLES = ['monthly', 'semiannual', 'yearly'];
const LANGS = [
  { code: 'ka', label: 'ქა' },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
];

function ordersText(pkg, L) {
  const n = String(pkg.orders).match(/\d[\d,]*/);
  return n ? `${n[0]} ${L.f.orders}` : L.f.unlimitedOrders;
}

function ordersCell(pkg, L) {
  const n = String(pkg.orders).match(/\d[\d,]*/);
  return n ? n[0] : L.f.unlimited;
}

function Icon({ d, className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

const CHECK = 'M20 6 9 17l-5-5';
const CROSS = 'M18 6 6 18M6 6l12 12';
const ARROW = 'M5 12h14M12 5l7 7-7 7';

export default function Packages() {
  const { i18n } = useTranslation();
  const { currentUser } = useAuth();
  const [lang, setLang] = useState(() => normalizeLang(i18n.language));
  const [cycle, setCycle] = useState('monthly');
  const L = T[lang];

  useEffect(() => {
    setLang(normalizeLang(i18n.language));
  }, [i18n.language]);

  const changeLang = (code) => {
    setLang(code);
    if (normalizeLang(i18n.language) !== code) {
      i18n.changeLanguage(code);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-28 pb-24 px-4 sm:px-6 relative overflow-hidden">
      {/* ფონის ბზინვარება */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.14, 0.08] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[480px] bg-cyan-600 rounded-full blur-[170px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.06, 0.12, 0.06] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-0 right-0 w-[480px] h-[380px] bg-violet-600 rounded-full blur-[160px] pointer-events-none"
      />

      {/* ენის გადამრთველი */}
      <div className="absolute top-6 right-4 sm:right-8 z-30 flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-xl">
        {LANGS.map((l) => {
          const isActive = lang === l.code;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => changeLang(l.code)}
              aria-pressed={isActive}
              className={`relative px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-300 ${
                isActive ? 'text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="langPill"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-300 to-blue-400"
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                />
              )}
              <span className="relative z-10">{l.label}</span>
            </button>
          );
        })}
      </div>

      {/* სათაური */}
      <header className="relative max-w-6xl mx-auto text-center mb-12">
        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 text-[11px] font-bold tracking-widest uppercase"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
          {L.badge}
        </motion.span>

        <motion.h1
          key={`title-${lang}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-5 text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight"
        >
          {L.title}{' '}
          <motion.span
            animate={{ backgroundPosition: ['0% 50%', '200% 50%'] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            className="inline-block bg-gradient-to-r from-blue-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent bg-[length:200%_auto]"
          >
            {L.accent}
          </motion.span>
        </motion.h1>

        <motion.p
          key={`sub-${lang}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-4 text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed"
        >
          {L.sub}
        </motion.p>

        {/* ციკლის გადამრთველი */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex mt-8 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-2xl shadow-black/60"
        >
          {CYCLES.map((c) => {
            const isActive = cycle === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCycle(c)}
                aria-pressed={isActive}
                className={`relative px-4 sm:px-6 py-2.5 rounded-xl text-sm font-bold transition-colors duration-300 ${
                  isActive ? 'text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="cyclePill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-white via-cyan-100 to-white shadow-[0_0_28px_rgba(34,211,238,0.5)]"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{L[c]}</span>
              </button>
            );
          })}
        </motion.div>
      </header>

      {/* პაკეტების ბარათები */}
      <section className="relative max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 items-stretch">
        {PACKAGES.map((pkg, i) => (
          <motion.div
            key={pkg.key}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className={pkg.popular || pkg.premium ? 'lg:-mt-4 lg:mb-4' : ''}
          >
            <PlanCard
              pkg={pkg}
              theme={PACKAGE_THEME[pkg.key]}
              cycle={cycle}
              lang={lang}
              L={L}
              currentUser={currentUser}
            />
          </motion.div>
        ))}
      </section>

      {/* შედარების ცხრილი */}
      <section className="relative max-w-5xl mx-auto mt-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-black text-white">{L.compareTitle}</h2>
          <p className="mt-2 text-gray-500 text-sm">{L.compareSub}</p>
        </motion.div>

        <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#0A0A0C]/70 backdrop-blur-xl shadow-2xl shadow-black/50">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-gray-500 font-medium px-5 py-4" />
                {PACKAGES.map((p) => (
                  <th
                    key={p.key}
                    className={`px-4 py-4 text-center font-black text-base ${PACKAGE_THEME[p.key].text} ${
                      p.popular || p.premium ? 'bg-white/[0.03]' : ''
                    }`}
                  >
                    {p.key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <Row label={L.f.orderRow} values={PACKAGES.map((p) => ordersCell(p, L))} />
              <Row label={L.f.agentRow} values={PACKAGES.map((p) => String(p.agents))} />
              <Row label={L.f.storageRow} values={PACKAGES.map((p) => p.storage)} />
              <Row label={L.f.priorityRow} values={PACKAGES.map((p) => p.key !== 'Basic')} isBool />
              <Row label={L.f.supportRow} values={PACKAGES.map((p) => p.key === 'Diamond' || p.key === 'Infinity')} isBool />
              <Row
                label={L.f.telegramRow}
                values={PACKAGES.map((p) => (p.telegram > 0 ? String(p.telegram) : null))}
                isHighlight
              />
              <Row label={L.f.managerRow} values={PACKAGES.map((p) => p.key === 'Infinity')} isBool isLast />
            </tbody>
          </table>
        </div>
      </section>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative text-center text-gray-600 text-xs mt-12"
      >
        {L.note}
      </motion.p>
    </div>
  );
}

function Row({ label, values, isBool, isHighlight, isLast }) {
  return (
    <tr className={`${isLast ? '' : 'border-b border-white/5'} hover:bg-white/[0.02] transition-colors duration-300`}>
      <td className="px-5 py-3.5 text-gray-400 text-[13px]">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="px-4 py-3.5 text-center text-[13px]">
          {isBool ? (
            v ? (
              <motion.span
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="inline-block"
              >
                <Icon d={CHECK} className="w-4 h-4 mx-auto text-emerald-400" />
              </motion.span>
            ) : (
              <Icon d={CROSS} className="w-3.5 h-3.5 mx-auto text-gray-700" />
            )
          ) : v === null ? (
            <span className="text-gray-700">—</span>
          ) : isHighlight ? (
            <span className="text-cyan-300 font-bold">{v}</span>
          ) : (
            <span className="font-semibold text-white">{v}</span>
          )}
        </td>
      ))}
    </tr>
  );
}

function PlanCard({ pkg, theme, cycle, lang, L, currentUser }) {
  const price = pkg.prices[cycle];
  const savingPct = cycle === 'monthly' ? 0 : SAVINGS[cycle][pkg.key];
  const months = cycle === 'semiannual' ? 6 : cycle === 'yearly' ? 12 : 1;
  const perMonth = Math.round(price / months);
  const badge = pkg.popular ? L.popular : pkg.premium ? L.premium : null;

  const features = [
    { text: ordersText(pkg, L), on: true },
    { text: `${pkg.agents} ${L.f.agents}`, on: true },
    { text: `${pkg.storage} ${L.f.storage}`, on: true },
    { text: L.f.priority, on: pkg.key !== 'Basic' },
    { text: L.f.support247, on: pkg.key === 'Diamond' || pkg.key === 'Infinity' },
    { text: L.f.manager, on: pkg.key === 'Infinity' },
    pkg.telegram > 0
      ? { text: `${pkg.telegram} ${L.f.telegram}`, on: true, highlight: true }
      : { text: L.f.noTelegram, on: false },
  ];

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={`group relative h-full overflow-hidden rounded-3xl p-6 flex flex-col backdrop-blur-2xl border
        bg-gradient-to-b ${theme.bg} ${theme.border} ${theme.glow} ${theme.ring}
        shadow-xl shadow-black/40 transition-[border-color,box-shadow] duration-500`}
    >
      {/* ზედა ხაზი */}
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${theme.line}`} />
      <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${theme.accent} opacity-[0.07] pointer-events-none`} />

      {badge && (
        <span
          className={`absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r ${theme.accent} text-black text-[10px] font-black uppercase tracking-wide shadow-lg`}
        >
          {badge}
        </span>
      )}

      <h3 className={`relative text-xl font-black ${theme.text}`}>{pkg.key}</h3>

      {/* ფასი */}
      <div className="relative mt-4 min-h-[4.25rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${cycle}-${lang}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            <div className="text-3xl sm:text-[2rem] font-black text-white leading-none">
              {formatPrice(price, lang)}
            </div>
            {cycle !== 'monthly' && (
              <div className="text-gray-500 text-xs mt-1.5">
                {formatPrice(perMonth, lang)}
                {L.perMonth}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative mt-3 mb-5 h-6">
        {savingPct > 0 && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-2 py-0.5 rounded-md bg-emerald-400/10 border border-emerald-400/25 text-emerald-300 text-[11px] font-bold"
          >
            {L.save} {savingPct}%
          </motion.span>
        )}
      </div>

      <p className="relative text-[10px] uppercase tracking-[0.18em] text-gray-600 font-bold mb-3">{L.featTitle}</p>

      <motion.ul
        variants={{ show: { transition: { staggerChildren: 0.05 } }, hidden: {} }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="relative space-y-2.5 text-[13px] flex-1"
      >
        {features.map((f, i) => (
          <Feature key={i} text={f.text} on={f.on} highlight={f.highlight} check={theme.check} />
        ))}
      </motion.ul>

      <p className="relative text-[12px] text-gray-500 leading-relaxed mt-5 mb-5 min-h-[3.5rem]">
        {L.detail[pkg.key]}
      </p>

      <Link
        to={currentUser ? `/checkout?package=${pkg.key}&cycle=${cycle}` : '/register'}
        className={`group/btn relative mt-auto block text-center py-3.5 rounded-xl font-bold overflow-hidden text-white text-sm
          bg-gradient-to-r ${theme.accent} shadow-lg shadow-black/40
          transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]`}
      >
        <span className="relative z-10 inline-flex items-center justify-center gap-2">
          {L.activate}
          <Icon d={ARROW} className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
        </span>
        <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 pointer-events-none" />
      </Link>
    </motion.div>
  );
}

function Feature({ text, on, highlight, check }) {
  return (
    <motion.li
      variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}
      className="flex items-start gap-2.5"
    >
      {on ? (
        <Icon d={CHECK} className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${highlight ? 'text-cyan-400' : check}`} />
      ) : (
        <Icon d={CROSS} className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-700" />
      )}
      <span className={on ? (highlight ? 'text-cyan-300 font-semibold' : 'text-gray-300') : 'text-gray-600'}>
        {text}
      </span>
    </motion.li>
  );
}