import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';

const CTASection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative py-24 bg-dng-dark overflow-hidden">
      <motion.div animate={{ x: [0, 50, 0], y: [0, -30, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-dng-blue/15 rounded-full blur-[120px] pointer-events-none" />
      <motion.div animate={{ x: [0, -50, 0], y: [0, 30, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-dng-cyan/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative rounded-3xl bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/10 backdrop-blur-xl p-8 sm:p-12 lg:p-16 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-dng-blue/5 via-transparent to-dng-cyan/5 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-dng-cyan to-transparent" />
          <div className="relative space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-dng-cyan/30 bg-dng-cyan/10 text-dng-cyan text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-dng-cyan animate-pulse" />
              {t('cta.badge')}
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
              {t('cta.title1')} <span className="gradient-text">{t('cta.title2')}</span>
            </h2>
            <p className="text-lg sm:text-xl text-dng-gray max-w-2xl mx-auto leading-relaxed">{t('cta.desc')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button to="/contact" variant="primary" size="lg">{t('cta.btnConsult')}</Button>
              <Button to="/packages" variant="secondary" size="lg">{t('cta.btnPackages')}</Button>
            </div>
            <div className="pt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-dng-gray">
              <div className="flex items-center gap-2"><svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>{t('cta.trust1')}</div>
              <div className="flex items-center gap-2"><svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>{t('cta.trust2')}</div>
              <div className="flex items-center gap-2"><svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>{t('cta.trust3')}</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
