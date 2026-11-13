import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Icons = {
  Zap: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Crown: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 17l3-10 4 6 2-8 2 8 4-6 3 10H3z" /></svg>,
  Sparkles: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  Infinity: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z" /></svg>,
  Check: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>,
  ArrowRight: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>,
};

const PACKAGES = [
  { id: 'basic',    name: 'Basic',    usd: 29,   icon: 'Zap',      color: 'blue',   features: ['orders100', 'agent1', 'file5mb'] },
  { id: 'gold',     name: 'Gold',     usd: 99,   icon: 'Crown',    color: 'amber',  badge: 'mostPopular', features: ['orders500', 'agent4', 'file10mb', 'prioritySupport'] },
  { id: 'diamond',  name: 'Diamond',  usd: 279,  icon: 'Sparkles', color: 'purple', badge: 'premium',     features: ['orders2000', 'agent7', 'file25mb', 'support247'] },
  { id: 'infinity', name: 'Infinity', usd: 1499, icon: 'Infinity', color: 'cyan',   badge: 'unlimited',   features: ['ordersUnlimited', 'agentsAll', 'file100mb', 'dedicatedManager'] },
];

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-500/10',   text: 'text-blue-400',   border: 'border-blue-500/30',   btn: 'from-blue-500 to-cyan-500',   glow: 'shadow-[0_0_50px_-10px_rgba(59,130,246,0.4)]' },
  amber:  { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/40',  btn: 'from-amber-400 to-orange-500', glow: 'shadow-[0_0_60px_-10px_rgba(245,158,11,0.5)]' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', btn: 'from-purple-500 to-pink-500',  glow: 'shadow-[0_0_50px_-10px_rgba(168,85,247,0.4)]' },
  cyan:   { bg: 'bg-cyan-500/10',   text: 'text-cyan-400',   border: 'border-cyan-500/30',   btn: 'from-cyan-400 to-teal-500',    glow: 'shadow-[0_0_50px_-10px_rgba(6,182,212,0.4)]' },
};

const ICON_MAP = { Zap: Icons.Zap, Crown: Icons.Crown, Sparkles: Icons.Sparkles, Infinity: Icons.Infinity };
const CONVERT = { en: (u) => u, ka: (u) => Math.round(u * 2.7), ru: (u) => Math.round(u * 90) };
const SYMBOL = { en: '$', ka: '₾', ru: '₽' };

export default function PackagesPreview() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || 'ka').split('-')[0];
  const symbol = SYMBOL[lang] || '₾';
  const convert = CONVERT[lang] || CONVERT.ka;

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.06),transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {t('homePage.pkgBadge')}
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
            {t('packages.title')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-dng-blue to-dng-cyan">
              {t('packages.titleAccent')}
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">{t('homePage.pkgDesc')}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PACKAGES.map((pkg, i) => {
            const Icon = ICON_MAP[pkg.icon];
            const c = COLOR_MAP[pkg.color];
            const price = convert(pkg.usd);
            const isHighlighted = pkg.id === 'gold';
            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className={`group relative bg-[#0A0A0A] border rounded-3xl p-6 overflow-hidden transition-all duration-300 ${
                  isHighlighted ? c.border + ' ' + c.glow : 'border-white/[0.08] hover:border-white/[0.15]'
                }`}
              >
                {isHighlighted && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white bg-gradient-to-r ${c.btn} shadow-lg`}>
                    {t('packages.mostPopular')}
                  </div>
                )}
                {!isHighlighted && pkg.badge && (
                  <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${c.bg} ${c.text} border ${c.border}`}>
                    {t(`packages.${pkg.badge}`)}
                  </div>
                )}

                <div className={`absolute inset-0 bg-gradient-to-br ${c.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />

                <div className="relative">
                  <div className={`w-14 h-14 rounded-2xl ${c.bg} ${c.text} border ${c.border} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <Icon />
                  </div>

                  <h3 className="text-xl font-black text-white mb-1">{pkg.name}</h3>
                  <p className="text-xs text-gray-500 mb-5">{t('homePage.pkgBilled')}</p>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className={`text-lg font-bold ${c.text}`}>{symbol}</span>
                    <span className="text-4xl font-black text-white tabular-nums">{price.toLocaleString()}</span>
                    <span className="text-xs text-gray-500 ml-1">/ {t('homePage.pkgMonth')}</span>
                  </div>

                  <ul className="space-y-2.5 mb-6 min-h-[100px]">
                    {pkg.features.map((fKey) => (
                      <li key={fKey} className="flex items-start gap-2 text-xs text-gray-400">
                        <span className={`mt-0.5 w-4 h-4 rounded-full ${c.bg} ${c.text} flex items-center justify-center shrink-0`}>
                          <Icons.Check />
                        </span>
                        {t(`packages.features.${fKey}`)}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={`/checkout/${pkg.id}?billing=monthly`}
                    className={`block w-full py-3 rounded-xl text-center text-sm font-bold text-white bg-gradient-to-r ${c.btn} hover:opacity-90 active:scale-[0.98] transition-all shadow-lg`}
                  >
                    {t('packages.activate')}
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-10"
        >
          <Link
            to="/packages"
            className="group inline-flex items-center gap-2 text-sm font-bold text-dng-cyan hover:text-white transition-colors"
          >
            {t('homePage.pkgViewAll')}
            <span className="group-hover:translate-x-1 transition-transform"><Icons.ArrowRight /></span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}