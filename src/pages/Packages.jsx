import React, { useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CustomPackageModal from '../components/ui/CustomPackageModal';

const CYCLES = [
  { id: 'monthly', months: 1 },
  { id: 'semiannual', months: 6 },
  { id: 'yearly', months: 12 },
];

// Same USD prices as Checkout.jsx
const PLANS = [
  {
    id: 'Basic',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    prices: { monthly: 29, semiannual: 79, yearly: 350 },
    features: ['orders100', 'agent1', 'file5mb'],
    theme: {
      text: 'text-blue-300',
      bar: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-500/15 border-blue-400/30',
      glow: 'rgba(59,130,246,0.35)',
      check: 'bg-blue-500/15 text-blue-300',
    },
  },
  {
    id: 'Gold',
    icon: 'M3 17l3-10 4 6 2-8 2 8 4-6 3 10H3z',
    badge: 'mostPopular',
    featured: true,
    prices: { monthly: 99, semiannual: 249, yearly: 1500 },
    features: ['orders500', 'agent4', 'file10mb', 'prioritySupport'],
    theme: {
      text: 'text-amber-300',
      bar: 'from-amber-400 to-orange-500',
      iconBg: 'bg-amber-500/15 border-amber-400/30',
      glow: 'rgba(245,158,11,0.35)',
      check: 'bg-amber-500/15 text-amber-300',
    },
  },
  {
    id: 'Diamond',
    icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
    badge: 'premium',
    prices: { monthly: 279, semiannual: 799, yearly: 5000 },
    features: ['orders2000', 'agent7', 'file25mb', 'support247'],
    theme: {
      text: 'text-purple-300',
      bar: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-500/15 border-purple-400/30',
      glow: 'rgba(168,85,247,0.35)',
      check: 'bg-purple-500/15 text-purple-300',
    },
  },
  {
    id: 'Infinity',
    icon: 'M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z',
    badge: 'unlimited',
    prices: { monthly: 999, semiannual: 1499, yearly: 9999 },
    features: ['ordersUnlimited', 'agentsAll', 'file100mb', 'dedicatedManager'],
    theme: {
      text: 'text-cyan-300',
      bar: 'from-emerald-400 to-teal-500',
      iconBg: 'bg-emerald-500/15 border-emerald-400/30',
      glow: 'rgba(16,185,129,0.35)',
      check: 'bg-emerald-500/15 text-emerald-300',
    },
  },
];

const RATE = { en: 1, ka: 2.7, ru: 90 };

function fmt(usd, lang) {
  const v = Math.round(usd * (RATE[lang] || RATE.ka));
  if (lang === 'en') return `$${v.toLocaleString('en-US')}`;
  if (lang === 'ru') return `${v.toLocaleString('ru-RU')} ₽`;
  return `₾${v.toLocaleString('ka-GE')}`;
}

function PlanCard({ plan, cycle, lang, t, onActivate, reduce, index }) {
  const ref = useRef(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 180, damping: 18 });
  const sy = useSpring(my, { stiffness: 180, damping: 18 });
  const rotY = useTransform(sx, [0, 1], [-10, 10]);
  const rotX = useTransform(sy, [0, 1], [9, -9]);
  const glow = useTransform(
    [sx, sy],
    ([x, y]) => `radial-gradient(420px circle at ${x * 100}% ${y * 100}%, ${plan.theme.glow}, transparent 60%)`
  );

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 95%', 'end 45%'] });
  const enterRot = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [45, 0]);
  const enterY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [120, 0]);
  const enterScale = useTransform(scrollYProgress, [0, 1], [0.88, 1]);
  const enterOp = useTransform(scrollYProgress, [0, 0.35], [0, 1]);

  const handleMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const handleLeave = () => { mx.set(0.5); my.set(0.5); };

  const months = CYCLES.find((c) => c.id === cycle).months;
  const price = plan.prices[cycle];
  const perMonth = price / months;

  const card = (
    <motion.div
      onMouseMove={reduce ? undefined : handleMove}
      onMouseLeave={reduce ? undefined : handleLeave}
      style={reduce ? undefined : { rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }}
      className="relative h-full flex flex-col rounded-3xl bg-[#0a0a0f]/95 border border-white/10 p-7 overflow-hidden"
    >
      <motion.div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: glow }} />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      {plan.badge && (
        <span className={`absolute top-5 right-5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-white bg-gradient-to-r ${plan.theme.bar}`} style={{ transform: 'translateZ(40px)' }}>
          {t(`packages.${plan.badge}`)}
        </span>
      )}

      <div className="relative" style={{ transform: 'translateZ(30px)' }}>
        <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-6 ${plan.theme.iconBg} ${plan.theme.text}`}>
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={plan.icon} />
          </svg>
        </div>
        <h3 className="text-2xl font-black text-white">{plan.id}</h3>

        <div className="mt-5 flex items-end gap-2 h-16">
          <AnimatePresence mode="wait">
            <motion.span
              key={`${plan.id}-${cycle}-${lang}`}
              initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -14, filter: 'blur(6px)' }}
              transition={{ duration: 0.3 }}
              className="text-5xl font-black text-white tracking-tight tabular-nums"
            >
              {fmt(price, lang)}
            </motion.span>
          </AnimatePresence>
          <span className="text-sm text-gray-500 pb-2">/ {t(`packages.${cycle}`)}</span>
        </div>
        <p className={`text-xs text-gray-500 h-4 mt-1 ${months > 1 ? '' : 'invisible'}`}>
          ≈ {fmt(perMonth, lang)} / {t('packages.monthly')}
        </p>
      </div>

      <div className="my-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <ul className="space-y-3.5 flex-1" style={{ transform: 'translateZ(20px)' }}>
        {plan.features.map((f, i) => (
          <motion.li
            key={f}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 * i }}
            className="flex items-start gap-3 text-sm text-gray-300"
          >
            <span className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.theme.check}`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            {t(`packages.features.${f}`)}
          </motion.li>
        ))}
      </ul>

      <motion.button
        type="button"
        onClick={onActivate}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className={`mt-8 w-full py-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r ${plan.theme.bar} shadow-lg hover:shadow-[0_0_30px_-4px_rgba(255,255,255,0.25)] transition-shadow`}
        style={{ transform: 'translateZ(40px)' }}
      >
        {t('packages.activate')} {plan.id}
      </motion.button>
    </motion.div>
  );

  return (
    <motion.div
      ref={ref}
      style={reduce ? undefined : { rotateX: enterRot, y: enterY, scale: enterScale, opacity: enterOp, transformPerspective: 1400 }}
      className="h-full"
    >
      {plan.featured ? (
        <div className="relative h-full rounded-3xl p-[1.5px] overflow-hidden shadow-[0_0_60px_-15px_rgba(245,158,11,0.5)]">
          <motion.div
            aria-hidden
            className="absolute left-1/2 top-1/2 w-[220%] aspect-square -translate-x-1/2 -translate-y-1/2"
            style={{ background: 'conic-gradient(from 0deg, #f59e0b, #f97316, #ec4899, #a855f7, #f59e0b)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          />
          {card}
        </div>
      ) : (
        card
      )}
    </motion.div>
  );
}

export default function Packages() {
  const { t, i18n } = useTranslation();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [customOpen, setCustomOpen] = useState(false);
  const reduce = useReducedMotion();
  const lang = (i18n.language || 'ka').split('-')[0];
  const [cycle, setCycle] = useState('monthly');

  const { scrollYProgress } = useScroll();
  const orbA = useTransform(scrollYProgress, [0, 1], [0, -500]);
  const orbB = useTransform(scrollYProgress, [0, 1], [0, 350]);

  const handleActivate = (plan) => {
    if (!currentUser) { navigate('/login'); return; }
    navigate(`/checkout/${plan.id.toLowerCase()}?billing=${cycle}`);
  };

  return (
    <div className="relative min-h-screen bg-[#050505] pt-28 pb-24 px-4 overflow-hidden">
      <motion.div style={{ y: reduce ? 0 : orbA }} className="pointer-events-none absolute top-24 left-[10%] w-[480px] h-[480px] rounded-full bg-blue-600/20 blur-[140px]" />
      <motion.div style={{ y: reduce ? 0 : orbB }} className="pointer-events-none absolute top-[40%] right-[5%] w-[420px] h-[420px] rounded-full bg-purple-600/15 blur-[140px]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      <div className="relative max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center mb-14">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-8">
            {t('packages.title')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400">
              {t('packages.titleAccent')}
            </span>
          </h1>

          <div className="relative inline-flex p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl">
            {CYCLES.map((c) => {
              const active = cycle === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCycle(c.id)}
                  className={`relative px-5 sm:px-6 py-2.5 rounded-xl text-sm font-bold transition-colors ${active ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  {active && (
                    <motion.span
                      layoutId="cycle-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 shadow-[0_0_25px_-5px_rgba(6,182,212,0.7)]"
                    />
                  )}
                  <span className="relative">{t(`packages.${c.id}`)}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
          {PLANS.map((plan, i) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              index={i}
              cycle={cycle}
              lang={lang}
              t={t}
              reduce={reduce}
              onActivate={() => handleActivate(plan)}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-14 flex flex-wrap justify-center gap-x-10 gap-y-3 text-sm text-gray-400"
        >
          {['cta.trust1', 'cta.trust2', 'cta.trust3'].map((k) => (
            <div key={k} className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-xs">✓</span>
              {t(k)}
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mt-20 rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.01] p-10 sm:p-14 text-center overflow-hidden"
        >
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-cyan-500/20 blur-[100px] pointer-events-none" />
          <h2 className="relative text-3xl sm:text-4xl font-black text-white mb-4">
            {t('cta.title1')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{t('cta.title2')}</span>
          </h2>
          <p className="relative text-gray-400 max-w-xl mx-auto mb-8">{t('cta.desc')}</p>
          <Link
            to="/contact"
            className="relative inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-black font-bold hover:scale-105 transition-transform"
          >
            {t('cta.btnConsult')} →
          </Link>
        </motion.div>
      </div>

      <CustomPackageModal isOpen={customOpen} onClose={() => setCustomOpen(false)} />
    </div>
  );
}