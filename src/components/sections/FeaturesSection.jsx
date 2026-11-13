import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const ICONS = {
  brain: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  link: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  shield: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
};

export default function FeaturesSection() {
  const { t } = useTranslation();

  const features = [
    { icon: ICONS.brain, title: t('features.f1Title'), desc: t('features.f1Desc'), color: 'blue' },
    { icon: ICONS.link, title: t('features.f2Title'), desc: t('features.f2Desc'), color: 'cyan' },
    { icon: ICONS.clock, title: t('features.f3Title'), desc: t('features.f3Desc'), color: 'purple' },
    { icon: ICONS.shield, title: t('features.f4Title'), desc: t('features.f4Desc'), color: 'emerald' },
  ];

  const colors = {
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400 group-hover:border-blue-400/60',
    cyan: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 group-hover:border-cyan-400/60',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400 group-hover:border-purple-400/60',
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 group-hover:border-emerald-400/60',
  };

  const steps = [
    { title: t('features.step1Title'), desc: t('features.step1Desc') },
    { title: t('features.step2Title'), desc: t('features.step2Desc') },
    { title: t('features.step3Title'), desc: t('features.step3Desc') },
  ];

  return (
    <section className="relative py-28 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-cyan-300 text-sm font-medium mb-5">
            {t('features.badge')}
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5">
            {t('features.title')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{t('features.highlight')}</span>
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">{t('features.desc')}</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -6 }}
              className="group relative p-7 rounded-3xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-colors duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-6 transition-colors ${colors[f.color]}`}>
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={f.icon} />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              <div className="mt-6 h-0.5 w-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 group-hover:w-24 transition-all duration-500" />
            </motion.div>
          ))}
        </div>

        <div className="mt-24">
          <h3 className="text-center text-2xl md:text-3xl font-bold text-white mb-12">{t('features.stepsTitle')}</h3>
          <div className="grid md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-7 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center p-8 rounded-3xl bg-[#0a0a0a]/80 border border-white/5"
              >
                <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-black text-lg mb-5 shadow-[0_0_25px_-5px_rgba(6,182,212,0.6)]">
                  {i + 1}
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{s.title}</h4>
                <p className="text-sm text-gray-400">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}