import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function AboutPreview() {
  const { t } = useTranslation();
  const points = [t('aboutPreview.point1'), t('aboutPreview.point2'), t('aboutPreview.point3')];
  const values = [
    { title: t('aboutPage.mission'), desc: t('aboutPage.missionDesc'), cls: 'from-blue-500/15 to-transparent border-blue-500/25' },
    { title: t('aboutPage.vision'), desc: t('aboutPage.visionDesc'), cls: 'from-purple-500/15 to-transparent border-purple-500/25' },
    { title: t('aboutPage.value2'), desc: t('aboutPage.value2Desc'), cls: 'from-cyan-500/15 to-transparent border-cyan-500/25' },
  ];

  return (
    <section className="relative py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <span className="inline-block px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-sm font-medium mb-5">
            {t('aboutPreview.badge')}
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5">
            {t('aboutPreview.title')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{t('aboutPreview.highlight')}</span>
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed mb-8">{t('aboutPreview.desc')}</p>

          <ul className="space-y-4 mb-10">
            {points.map((p, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className="flex items-start gap-3 text-gray-300"
              >
                <span className="mt-1 w-5 h-5 shrink-0 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                </span>
                {p}
              </motion.li>
            ))}
          </ul>

          <Link to="/about" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white text-black font-bold hover:scale-105 transition-transform">
            {t('aboutPreview.btnMore')} →
          </Link>
        </motion.div>

        <div className="grid gap-5">
          {values.map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              whileHover={{ x: -6 }}
              className={`p-7 rounded-3xl bg-gradient-to-br border ${v.cls}`}
            >
              <h3 className="text-xl font-bold text-white mb-2">{v.title}</h3>
              <p className="text-gray-400 leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}