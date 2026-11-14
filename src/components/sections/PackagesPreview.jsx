// src/components/sections/PackagesPreview.jsx — მთავარი გვერდის პაკეტების ბლოკი
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { PACKAGES, formatPrice } from '../../config/packagePrices';

export default function PackagesPreview() {
  const { t, i18n } = useTranslation();
  const lang = ['ka', 'en', 'ru'].includes((i18n.language || 'ka').split('-')[0]) ? (i18n.language || 'ka').split('-')[0] : 'ka';

  return (
    <section className="py-24 px-4 bg-[#050505] relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-4">
            {t('homePage.pkgBadge')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">{t('hero.packagesTitle')}</h2>
          <p className="text-gray-400 max-w-xl mx-auto">{t('homePage.pkgDesc')}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PACKAGES.map((pkg, i) => (
            <motion.div key={pkg.key} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`relative rounded-2xl p-6 border backdrop-blur-xl flex flex-col
                ${pkg.popular ? 'bg-gradient-to-b from-blue-900/30 to-[#0A0A0C]/90 border-cyan-400/30' : 'bg-[#0A0A0C]/80 border-white/10'}`}>
              {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-black text-[11px] font-bold whitespace-nowrap">
                  {t('packages.mostPopular')}
                </span>
              )}
              <h3 className="text-white font-black text-lg mt-2">{pkg.key}</h3>
              <p className="text-3xl font-black text-white my-2">{formatPrice(pkg.prices.monthly, lang)}<span className="text-sm text-gray-500 font-medium">/{t('homePage.pkgMonth')}</span></p>
              <p className="text-xs text-gray-500 mb-4">{pkg.orders}</p>
              <Link to="/packages" className="mt-auto text-center py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-white/10 transition-colors">
                {t('packages.activate')}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/packages" className="inline-block px-7 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:opacity-90 transition-opacity">
            {t('homePage.pkgViewAll')}
          </Link>
        </div>
      </div>
    </section>
  );
}