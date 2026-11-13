import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Icons = {
  Check: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>,
  Zap: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Crown: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 17l3-10 4 6 2-8 2 8 4-6 3 10H3z" /></svg>,
  Sparkles: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  Infinity: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z" /></svg>,
  ChevronLeft: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>,
  ChevronRight: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>,
};

const PACKAGES = [
  { id: 'basic', name: 'Basic', prices: { monthly: 29, semiannual: 79, yearly: 350 }, icon: 'Zap', color: 'blue', features: ['orders100', 'agent1', 'file5mb'] },
  { id: 'gold', name: 'Gold', prices: { monthly: 99, semiannual: 249, yearly: 1500 }, icon: 'Crown', color: 'amber', badge: 'mostPopular', features: ['orders500', 'agent4', 'file10mb', 'prioritySupport'] },
  { id: 'diamond', name: 'Diamond', prices: { monthly: 279, semiannual: 799, yearly: 5000 }, icon: 'Sparkles', color: 'purple', badge: 'premium', features: ['orders2000', 'agent7', 'file25mb', 'support247'] },
  { id: 'infinity', name: 'Infinity', prices: { monthly: 1499, semiannual: 2499, yearly: 15000 }, icon: 'Infinity', color: 'cyan', badge: 'unlimited', features: ['ordersUnlimited', 'agentsAll', 'file100mb', 'dedicatedManager'] },
];

const COLOR = {
  blue: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-400/40', btn: 'from-blue-500 to-cyan-500', glow: 'shadow-[0_0_50px_-10px_rgba(59,130,246,0.5)]' },
  amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-400/40', btn: 'from-amber-400 to-orange-500', glow: 'shadow-[0_0_60px_-10px_rgba(245,158,11,0.5)]' },
  purple: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-400/40', btn: 'from-purple-500 to-pink-500', glow: 'shadow-[0_0_70px_-10px_rgba(168,85,247,0.5)]' },
  cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-400/40', btn: 'from-cyan-400 to-teal-500', glow: 'shadow-[0_0_80px_-10px_rgba(6,182,212,0.5)]' },
};

const ICON_MAP = { Zap: Icons.Zap, Crown: Icons.Crown, Sparkles: Icons.Sparkles, Infinity: Icons.Infinity };
const CONVERT = { en: (usd) => usd, ka: (usd) => Math.round(usd * 2.7), ru: (usd) => Math.round(usd * 90) };
const SYMBOL = { en: '$', ka: '₾', ru: '₽' };

export default function Packages() {
  const { t, i18n } = useTranslation();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const lang = (i18n.language || 'ka').split('-')[0];
  const [activeIndex, setActiveIndex] = useState(1);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const wheelLock = useRef(false);
  const containerRef = useRef(null);

  const currentCurrency = SYMBOL[lang] || '₾';
  const getPrice = (usd) => (CONVERT[lang] || CONVERT.ka)(usd);

  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(() => setActiveIndex((i) => (i + 1) % PACKAGES.length), 6000);
    return () => clearInterval(timer);
  }, [isAutoPlay]);

  const goTo = useCallback((i) => { setIsAutoPlay(false); setActiveIndex(i); setTimeout(() => setIsAutoPlay(true), 12000); }, []);
  const prev = () => goTo((activeIndex - 1 + PACKAGES.length) % PACKAGES.length);
  const next = () => goTo((activeIndex + 1) % PACKAGES.length);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => { e.preventDefault(); if (wheelLock.current) return; wheelLock.current = true; if (e.deltaY > 0) next(); else prev(); setTimeout(() => { wheelLock.current = false; }, 400); };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [next, prev]);

  const handleActivate = (pkg) => {
    if (!currentUser) { navigate('/login'); return; }
    navigate(`/checkout/${pkg.id}?billing=${billingCycle}`);
  };

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden pt-20 pb-16">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(37,99,235,0.08),transparent)]" />
      
      <div className="relative max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-3">
            {t('packages.title')} <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">{t('packages.titleAccent')}</span>
          </h1>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-white/5 p-1.5 rounded-2xl flex gap-1 border border-white/10 shadow-lg">
            {['monthly', 'semiannual', 'yearly'].map(c => (
              <button key={c} onClick={() => setBillingCycle(c)} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${billingCycle === c ? 'bg-white/10 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                {t(`packages.${c}`)}
              </button>
            ))}
          </div>
        </div>

        <div ref={containerRef} className="relative mx-auto" style={{ height: '560px', width: '100%', maxWidth: '1100px', perspective: '1200px' }} onMouseEnter={() => setIsAutoPlay(false)} onMouseLeave={() => setIsAutoPlay(true)}>
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-90"><Icons.ChevronLeft /></button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-90"><Icons.ChevronRight /></button>

          {PACKAGES.map((pkg, i) => {
            const total = PACKAGES.length; const offset = i - activeIndex;
            let norm = offset; if (norm > total/2) norm -= total; if (norm < -total/2) norm += total;
            const abs = Math.abs(norm); const isActive = norm === 0;
            if (abs > 2) return null;
            const c = COLOR[pkg.color]; const Icon = ICON_MAP[pkg.icon];
            const displayPrice = getPrice(pkg.prices[billingCycle]);

            return (
              <motion.div 
                key={pkg.id} 
                onClick={() => !isActive && goTo(i)} 
                animate={{ 
                  x: norm * 320, 
                  z: -abs * 200,
                  rotateY: norm * -15,
                  scale: isActive ? 1 : 0.85 - (abs - 1) * 0.05, 
                  opacity: isActive ? 1 : Math.max(0.3, 0.6 - (abs - 1) * 0.2) 
                }} 
                transition={{ type: 'spring', stiffness: 200, damping: 25 }} 
                className={`absolute left-1/2 top-1/2 w-[320px] sm:w-[360px] rounded-3xl p-7 backdrop-blur-xl border transition-colors duration-300 ${isActive ? c.border + ' bg-[#0a0a0a]/90 ' + c.glow : 'border-white/[0.05] bg-[#050505]/60 cursor-pointer hover:border-white/20'}`} 
                style={{ marginLeft: '-180px', marginTop: '-280px', zIndex: 10 - abs, willChange: 'transform, opacity', transformStyle: 'preserve-3d' }}
              >
                {pkg.badge && isActive && (
                  <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest text-white bg-gradient-to-r ${c.btn} shadow-lg`}>
                    {t(`packages.${pkg.badge}`)}
                  </div>
                )}
                
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${c.bg} ${c.border} ${c.text}`}><Icon /></div>
                <h3 className="text-2xl font-black text-white mb-1">{pkg.name}</h3>
                <p className="text-gray-500 text-xs mb-6">{t('packages.billed')} {t(`packages.${billingCycle}`)}</p>
                
                <div className="flex items-baseline gap-1 mb-6 h-12">
                  <span className={`text-xl font-bold ${c.text}`}>{currentCurrency}</span>
                  <motion.span key={displayPrice} initial={{ y: -15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-5xl font-black text-white tracking-tight">{displayPrice}</motion.span>
                </div>
                
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />
                
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((fKey, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                      <span className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${c.bg} ${c.text}`}><Icons.Check /></span>
                      {t(`packages.features.${fKey}`)}
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); handleActivate(pkg); }} 
                  className={`w-full py-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r ${c.btn} hover:opacity-90 active:scale-[0.98] transition-all shadow-lg`}
                >
                  {t('packages.activate')} {pkg.name}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
