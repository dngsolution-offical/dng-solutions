import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Icons = {
  Target: () => <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Eye: () => <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  Star: () => <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  Lightbulb: () => <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  Shield: () => <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Award: () => <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
  Users: () => <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  Briefcase: () => <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Rocket: () => <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Chart: () => <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Code: () => <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  ArrowRight: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>,
  Sparkles: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  Globe: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

const VALUES = [
  { key: 'v1', icon: 'Lightbulb', color: 'blue' },
  { key: 'v2', icon: 'Shield',    color: 'green' },
  { key: 'v3', icon: 'Award',     color: 'amber' },
];

const AUDIENCE = [
  { key: 'a1', icon: 'Users',     color: 'pink' },
  { key: 'a2', icon: 'Briefcase', color: 'cyan' },
  { key: 'a3', icon: 'Rocket',    color: 'purple' },
];

const TECH = [
  { name: 'React 19',         tag: 'Frontend' },
  { name: 'Firebase',         tag: 'Auth & DB' },
  { name: 'Claude AI',        tag: 'LLM' },
  { name: 'Vercel',           tag: 'Hosting' },
  { name: 'Tailwind CSS',     tag: 'Styling' },
  { name: 'EmailJS',          tag: 'Email' },
];

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-500/10',    border: 'border-blue-500/30',   text: 'text-blue-400',   glow: 'hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.4)]',   gradient: 'from-blue-500/10 to-transparent' },
  green:  { bg: 'bg-green-500/10',   border: 'border-green-500/30',  text: 'text-green-400',  glow: 'hover:shadow-[0_0_40px_-10px_rgba(34,197,94,0.4)]',    gradient: 'from-green-500/10 to-transparent' },
  amber:  { bg: 'bg-amber-500/10',   border: 'border-amber-500/30',  text: 'text-amber-400',  glow: 'hover:shadow-[0_0_40px_-10px_rgba(245,158,11,0.4)]',   gradient: 'from-amber-500/10 to-transparent' },
  pink:   { bg: 'bg-pink-500/10',    border: 'border-pink-500/30',   text: 'text-pink-400',   glow: 'hover:shadow-[0_0_40px_-10px_rgba(236,72,153,0.4)]',   gradient: 'from-pink-500/10 to-transparent' },
  cyan:   { bg: 'bg-cyan-500/10',    border: 'border-cyan-500/30',   text: 'text-cyan-400',   glow: 'hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.4)]',    gradient: 'from-cyan-500/10 to-transparent' },
  purple: { bg: 'bg-purple-500/10',  border: 'border-purple-500/30', text: 'text-purple-400', glow: 'hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.4)]',   gradient: 'from-purple-500/10 to-transparent' },
};

function ValueCard({ item, index, t }) {
  const Icon = Icons[item.icon];
  const c = COLOR_MAP[item.color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -6 }}
      className={`group relative bg-[#0A0A0A] border border-white/[0.08] rounded-3xl p-6 sm:p-8 overflow-hidden transition-all duration-500 ${c.glow}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className="relative z-10">
        <div className={`w-14 h-14 rounded-2xl ${c.bg} ${c.text} border ${c.border} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
          <Icon />
        </div>
        <h3 className="text-lg font-bold text-white mb-3">{t(`aboutPage.${item.key}Title`)}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{t(`aboutPage.${item.key}Desc`)}</p>
      </div>
    </motion.div>
  );
}

function AudienceCard({ item, index, t }) {
  const Icon = Icons[item.icon];
  const c = COLOR_MAP[item.color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className={`relative bg-[#0A0A0A] border border-white/[0.08] rounded-2xl p-5 hover:${c.border} transition-colors group`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-11 h-11 rounded-xl ${c.bg} ${c.text} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
          <Icon />
        </div>
        <div>
          <h4 className="text-white font-bold text-sm mb-1">{t(`aboutPage.${item.key}Title`)}</h4>
          <p className="text-xs text-gray-400 leading-relaxed">{t(`aboutPage.${item.key}Desc`)}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden font-sans selection:bg-dng-cyan/30">

      {/* BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.10),transparent_55%)]" />
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 -left-40 w-[600px] h-[600px] bg-dng-blue/[0.05] rounded-full blur-[150px]"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-20 -right-40 w-[600px] h-[600px] bg-dng-cyan/[0.05] rounded-full blur-[150px]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative pt-32 pb-24 px-4">
        <div className="max-w-7xl mx-auto">

          {/* â•â•â•â•â•â•â• HERO â•â•â•â•â•â•â• */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 mb-8 backdrop-blur-xl">
              <span className="w-2 h-2 rounded-full bg-dng-cyan animate-pulse" />
              <span className="text-xs font-bold text-gray-300 tracking-widest uppercase">
                {t('aboutPage.badge')}
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-[1.05]">
              {t('aboutPage.title')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-dng-blue via-dng-cyan to-dng-blue bg-[length:200%_auto] animate-gradient">
                {t('aboutPage.highlight')}
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              {t('aboutPage.intro')}
            </p>
          </motion.div>

          {/* â•â•â•â•â•â•â• MISSION & VISION â•â•â•â•â•â•â• */}
          <div className="grid lg:grid-cols-2 gap-6 mb-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative bg-gradient-to-br from-dng-blue/15 via-[#0A0A0A] to-transparent border border-dng-blue/20 rounded-3xl p-8 sm:p-10 overflow-hidden group"
            >
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-dng-blue/20 rounded-full blur-[100px] group-hover:bg-dng-blue/30 transition-colors" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-dng-blue/20 border border-dng-blue/30 flex items-center justify-center text-dng-blue mb-6">
                  <Icons.Target />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-4">{t('aboutPage.mission')}</h3>
                <p className="text-gray-300 leading-relaxed text-base">{t('aboutPage.missionDesc')}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative bg-gradient-to-br from-dng-cyan/15 via-[#0A0A0A] to-transparent border border-dng-cyan/20 rounded-3xl p-8 sm:p-10 overflow-hidden group"
            >
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-dng-cyan/20 rounded-full blur-[100px] group-hover:bg-dng-cyan/30 transition-colors" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-dng-cyan/20 border border-dng-cyan/30 flex items-center justify-center text-dng-cyan mb-6">
                  <Icons.Eye />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-4">{t('aboutPage.vision')}</h3>
                <p className="text-gray-300 leading-relaxed text-base">{t('aboutPage.visionDesc')}</p>
              </div>
            </motion.div>
          </div>

          {/* â•â•â•â•â•â•â• STORY (no placeholder numbers, real narrative) â•â•â•â•â•â•â• */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative mb-20"
          >
            <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-3xl p-8 sm:p-12 lg:p-16 overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
              <div className="relative grid lg:grid-cols-5 gap-10 items-start">
                <div className="lg:col-span-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-5">
                    <Icons.Sparkles />
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">
                      {t('aboutPage.storyBadge')}
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
                    {t('aboutPage.storyTitle')}
                  </h2>
                  <p className="text-gray-400 leading-relaxed">{t('aboutPage.storyLead')}</p>
                </div>

                <div className="lg:col-span-3 space-y-4 text-gray-300 leading-relaxed">
                  <p>{t('aboutPage.storyP1')}</p>
                  <p>{t('aboutPage.storyP2')}</p>
                  <p>{t('aboutPage.storyP3')}</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* â•â•â•â•â•â•â• VALUES â•â•â•â•â•â•â• */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 mb-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {t('aboutPage.valuesBadge')}
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
                {t('aboutPage.valuesTitle')}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-dng-blue to-dng-cyan">
                  {t('aboutPage.valuesHighlight')}
                </span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {VALUES.map((item, i) => <ValueCard key={item.key} item={item} index={i} t={t} />)}
            </div>
          </motion.section>

          {/* â•â•â•â•â•â•â• AUDIENCE â•â•â•â•â•â•â• */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="grid lg:grid-cols-5 gap-8 items-start">
              <div className="lg:col-span-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 mb-4">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {t('aboutPage.audienceBadge')}
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
                  {t('aboutPage.audienceTitle')}{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-dng-blue to-dng-cyan">
                    {t('aboutPage.audienceHighlight')}
                  </span>
                </h2>
                <p className="text-gray-400 leading-relaxed">{t('aboutPage.audienceDesc')}</p>
              </div>

              <div className="lg:col-span-3 grid sm:grid-cols-2 gap-3">
                {AUDIENCE.map((item, i) => <AudienceCard key={item.key} item={item} index={i} t={t} />)}
              </div>
            </div>
          </motion.section>

          {/* â•â•â•â•â•â•â• TECH STACK â•â•â•â•â•â•â• */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="bg-gradient-to-br from-[#0A0A0A] to-[#08080C] border border-white/[0.08] rounded-3xl p-8 sm:p-12 overflow-hidden relative">
              <div className="absolute top-0 left-1/3 w-96 h-96 bg-dng-blue/10 rounded-full blur-[120px] pointer-events-none" />
              <div className="relative">
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4">
                    <Icons.Code />
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                      {t('aboutPage.techBadge')}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-white mb-3">
                    {t('aboutPage.techTitle')}{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-dng-blue to-dng-cyan">
                      {t('aboutPage.techHighlight')}
                    </span>
                  </h2>
                  <p className="text-sm text-gray-400 max-w-2xl mx-auto">{t('aboutPage.techDesc')}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {TECH.map((tech, i) => (
                    <motion.div
                      key={tech.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -3 }}
                      className="bg-white/[0.03] border border-white/[0.08] hover:border-dng-cyan/30 rounded-2xl p-4 text-center transition-colors"
                    >
                      <p className="text-white font-bold text-sm mb-1">{tech.name}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{tech.tag}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* â•â•â•â•â•â•â• TRUST / COMMITMENTS â•â•â•â•â•â•â• */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: <Icons.Shield />, titleKey: 'commit1Title', descKey: 'commit1Desc', color: 'green' },
                { icon: <Icons.Globe />,  titleKey: 'commit2Title', descKey: 'commit2Desc', color: 'cyan' },
                { icon: <Icons.Check />,  titleKey: 'commit3Title', descKey: 'commit3Desc', color: 'blue' },
              ].map((item, i) => {
                const c = COLOR_MAP[item.color];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`bg-[#0A0A0A] border border-white/[0.08] rounded-2xl p-6 hover:${c.border} transition-colors group`}
                  >
                    <div className={`w-12 h-12 rounded-xl ${c.bg} ${c.text} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      {item.icon}
                    </div>
                    <h4 className="text-white font-bold mb-2 text-sm">{t(`aboutPage.${item.titleKey}`)}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">{t(`aboutPage.${item.descKey}`)}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* â•â•â•â•â•â•â• FINAL CTA â•â•â•â•â•â•â• */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-[2.5rem] bg-gradient-to-br from-dng-blue/20 via-[#0A0A0A] to-dng-cyan/20 border border-white/10 p-10 sm:p-16 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.3),transparent_60%)] pointer-events-none" />
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-dng-cyan/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-dng-blue to-dng-cyan flex items-center justify-center mx-auto mb-8 shadow-[0_0_60px_-10px_rgba(37,99,235,0.6)]"
              >
                <Icons.Sparkles />
              </motion.div>

              <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 leading-tight max-w-3xl mx-auto">
                {t('aboutPage.ctaTitle')}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-dng-blue to-dng-cyan">
                  {t('aboutPage.ctaHighlight')}
                </span>
              </h2>

              <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
                {t('aboutPage.ctaDesc')}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_-5px_rgba(255,255,255,0.5)] overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-dng-blue to-dng-cyan translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative z-10 group-hover:text-white transition-colors flex items-center gap-2">
                    {t('hero.btnStart')}
                    <span className="group-hover:translate-x-1 transition-transform"><Icons.ArrowRight /></span>
                  </span>
                </Link>

                <Link
                  to="/contact"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-white/[0.05] text-white font-bold rounded-2xl border border-white/10 hover:bg-white/[0.1] hover:border-dng-cyan/30 backdrop-blur-xl transition-all"
                >
                  {t('nav.contact')}
                  <span className="group-hover:translate-x-1 transition-transform"><Icons.ArrowRight /></span>
                </Link>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      <style>{`
        @keyframes gradient-shift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        .animate-gradient { animation: gradient-shift 6s ease infinite; }
      `}</style>
    </div>
  );
}