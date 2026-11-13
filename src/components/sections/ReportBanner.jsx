import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Icons = {
  Star: () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>,
  ArrowRight: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>,
  MessageCircle: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
};

const ReportBanner = () => {
  const { t } = useTranslation();

  return (
    <section className="relative py-24 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.08),transparent_60%)] pointer-events-none" />
      
      <div className="relative max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-br from-[#0A0A0A] to-[#111] border border-white/10 rounded-[2rem] p-8 sm:p-12 overflow-hidden"
        >
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-dng-cyan/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-dng-blue/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 grid lg:grid-cols-5 gap-8 items-center">
            
            {/* Left: Text */}
            <div className="lg:col-span-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-dng-cyan/10 border border-dng-cyan/20 text-dng-cyan text-xs font-semibold uppercase tracking-wider mb-5">
                <Icons.MessageCircle />
                {t('reportBanner.badge') || 'Feedback'}
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
                {t('reportBanner.title1')}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-dng-blue to-dng-cyan">
                  {t('reportBanner.title2')}
                </span>
              </h2>
              
              <p className="text-gray-400 text-base leading-relaxed max-w-xl">
                {t('reportBanner.desc')}
              </p>
            </div>

            {/* Right: Stars + CTA */}
            <div className="lg:col-span-2 flex flex-col items-center lg:items-end gap-6">
              {/* Stars */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
                    className="text-yellow-400"
                  >
                    <Icons.Star />
                  </motion.div>
                ))}
              </div>
              
              <p className="text-sm text-gray-500 text-center lg:text-right">
                5.0 / 5.0 · {t('aboutPage.averageRating') || 'Average Rating'}
              </p>

              <Link
                to="/report"
                className="group inline-flex items-center gap-3 px-6 py-3.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all"
              >
                {t('reportBanner.btn')}
                <span className="group-hover:translate-x-1 transition-transform"><Icons.ArrowRight /></span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ReportBanner;