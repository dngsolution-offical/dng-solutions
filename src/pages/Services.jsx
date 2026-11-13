import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Icons = {
  Excel: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Calculator: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  Chart: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Shield: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Chat: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
  CRM: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  Mail: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Mobile: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  ArrowRight: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>,
  ArrowUpRight: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 17L17 7M17 7H8m9 0v9" /></svg>,
  Check: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>,
  Sparkles: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  Zap: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Brain: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  FileText: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Table: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M3 14h18m-9-4v8m-7-8v8m14-8v8M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" /></svg>,
  Eye: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  Users: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  Clock: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Code: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
};

// 8 სერვისი — რეალური ფუნქციონალი
const SERVICES = [
  { key: 's1', icon: 'Excel',      color: 'blue' },
  { key: 's2', icon: 'Calculator', color: 'cyan' },
  { key: 's3', icon: 'Chart',      color: 'purple' },
  { key: 's4', icon: 'Shield',     color: 'green' },
  { key: 's5', icon: 'Chat',       color: 'yellow' },
  { key: 's6', icon: 'CRM',        color: 'pink' },
  { key: 's7', icon: 'Mail',       color: 'orange' },
  { key: 's8', icon: 'Mobile',     color: 'red' },
];

// 9 AI აგენტი — src/config/agents.js-იდან
const AGENTS_LIST = [
  { name: 'Text Agent',       icon: 'FileText', color: 'blue',   pkg: 'Free' },
  { name: 'Excel Agent',      icon: 'Table',    color: 'green',  pkg: 'Basic' },
  { name: 'Email Agent',      icon: 'Mail',     color: 'cyan',   pkg: 'Basic' },
  { name: 'Vision Agent',     icon: 'Eye',      color: 'purple', pkg: 'Gold' },
  { name: 'Report Agent',     icon: 'Chart',    color: 'yellow', pkg: 'Gold' },
  { name: 'CRM Agent',        icon: 'Users',    color: 'pink',   pkg: 'Gold' },
  { name: 'Schedule Agent',   icon: 'Clock',    color: 'orange', pkg: 'Diamond' },
  { name: 'Automation Agent', icon: 'Zap',      color: 'red',    pkg: 'Diamond' },
  { name: 'API Agent',        icon: 'Code',     color: 'cyan',   pkg: 'Infinity' },
];

// 4 ნაბიჯი — რეალური workflow
const STEPS = [
  { key: 'step1', num: '01', icon: 'Chat' },
  { key: 'step2', num: '02', icon: 'Brain' },
  { key: 'step3', num: '03', icon: 'Calculator' },
  { key: 'step4', num: '04', icon: 'Check' },
];

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-500/10',    border: 'border-blue-500/30',   text: 'text-blue-400',   glow: 'group-hover:shadow-[0_0_40px_-5px_rgba(59,130,246,0.4)]',    gradient: 'from-blue-500/10 to-transparent' },
  cyan:   { bg: 'bg-cyan-500/10',    border: 'border-cyan-500/30',   text: 'text-cyan-400',   glow: 'group-hover:shadow-[0_0_40px_-5px_rgba(6,182,212,0.4)]',     gradient: 'from-cyan-500/10 to-transparent' },
  purple: { bg: 'bg-purple-500/10',  border: 'border-purple-500/30', text: 'text-purple-400', glow: 'group-hover:shadow-[0_0_40px_-5px_rgba(168,85,247,0.4)]',    gradient: 'from-purple-500/10 to-transparent' },
  green:  { bg: 'bg-green-500/10',   border: 'border-green-500/30',  text: 'text-green-400',  glow: 'group-hover:shadow-[0_0_40px_-5px_rgba(34,197,94,0.4)]',     gradient: 'from-green-500/10 to-transparent' },
  yellow: { bg: 'bg-yellow-500/10',  border: 'border-yellow-500/30', text: 'text-yellow-400', glow: 'group-hover:shadow-[0_0_40px_-5px_rgba(234,179,8,0.4)]',     gradient: 'from-yellow-500/10 to-transparent' },
  pink:   { bg: 'bg-pink-500/10',    border: 'border-pink-500/30',   text: 'text-pink-400',   glow: 'group-hover:shadow-[0_0_40px_-5px_rgba(236,72,153,0.4)]',    gradient: 'from-pink-500/10 to-transparent' },
  orange: { bg: 'bg-orange-500/10',  border: 'border-orange-500/30', text: 'text-orange-400', glow: 'group-hover:shadow-[0_0_40px_-5px_rgba(249,115,22,0.4)]',    gradient: 'from-orange-500/10 to-transparent' },
  red:    { bg: 'bg-red-500/10',     border: 'border-red-500/30',    text: 'text-red-400',    glow: 'group-hover:shadow-[0_0_40px_-5px_rgba(239,68,68,0.4)]',     gradient: 'from-red-500/10 to-transparent' },
};

function ServiceCard({ service, index, t }) {
  const Icon = Icons[service.icon];
  const c = COLOR_MAP[service.color] || COLOR_MAP.blue;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      whileHover={{ y: -6 }}
      className={`group relative bg-[#0A0A0A] border border-white/[0.08] rounded-3xl p-6 sm:p-8 overflow-hidden transition-all duration-500 ${c.glow}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
      <div className="relative z-10">
        <div className={`w-14 h-14 rounded-2xl ${c.bg} ${c.text} border ${c.border} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
          <Icon />
        </div>
        <h3 className="text-lg font-bold text-white mb-3">{t(`servicesPage.${service.key}Title`)}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{t(`servicesPage.${service.key}Desc`)}</p>
      </div>
    </motion.div>
  );
}

function AgentCard({ agent, index }) {
  const Icon = Icons[agent.icon];
  const c = COLOR_MAP[agent.color] || COLOR_MAP.blue;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`relative rounded-2xl ${c.bg} border ${c.border} p-4 flex flex-col items-center justify-center gap-2 text-center`}
    >
      <div className={c.text}><Icon /></div>
      <span className="text-[11px] font-bold text-white leading-tight">{agent.name}</span>
      <span className={`text-[9px] font-bold ${c.text} uppercase tracking-wider`}>{agent.pkg}+</span>
    </motion.div>
  );
}

export default function Services() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden font-sans selection:bg-dng-cyan/30">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.12),transparent_50%)]" />
        <div className="absolute top-1/3 -left-40 w-[700px] h-[700px] bg-dng-blue/[0.06] rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 -right-40 w-[700px] h-[700px] bg-dng-cyan/[0.06] rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative">
        {/* ═══════ HERO ═══════ */}
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 mb-8 backdrop-blur-xl">
                <span className="w-2 h-2 rounded-full bg-dng-cyan animate-pulse" />
                <span className="text-xs font-semibold text-gray-300 tracking-widest uppercase">
                  {t('servicesPage.badge')}
                </span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-[1.05]">
                {t('servicesPage.title')}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-dng-blue to-dng-cyan">
                  {t('servicesPage.highlight')}
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-10">
                {t('servicesPage.desc')}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.6)] overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-dng-blue to-dng-cyan translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative z-10 group-hover:text-white transition-colors flex items-center gap-2">
                    {t('hero.btnStart')}
                    <span className="group-hover:translate-x-1 transition-transform"><Icons.ArrowRight /></span>
                  </span>
                </Link>

                <Link
                  to="/packages"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-white/[0.03] text-white font-bold rounded-2xl border border-white/10 hover:bg-white/[0.06] hover:border-dng-cyan/30 backdrop-blur-xl transition-all"
                >
                  {t('hero.btnPackages')}
                  <span className="group-hover:translate-x-1 transition-transform"><Icons.ArrowRight /></span>
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-500">
                {['trust1', 'trust2', 'trust3'].map((key) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Icons.Check />
                    </div>
                    <span>{t(`servicesPage.${key}`)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════ SERVICES GRID ═══════ */}
        <section className="pb-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {SERVICES.map((service, i) => (
                <ServiceCard key={service.key} service={service} index={i} t={t} />
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ AI AGENTS ═══════ */}
        <section className="pb-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="relative rounded-[2.5rem] bg-gradient-to-br from-[#0A0A0A] via-[#0A0A0A] to-[#0F0F14] border border-white/[0.08] p-8 sm:p-12 lg:p-16 overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-dng-cyan/10 rounded-full blur-[120px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-dng-blue/10 rounded-full blur-[120px] pointer-events-none" />

              <div className="relative grid lg:grid-cols-2 gap-12 items-center">
                <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dng-cyan/10 border border-dng-cyan/20 mb-6">
                    <span className="w-2 h-2 rounded-full bg-dng-cyan animate-pulse" />
                    <span className="text-xs font-bold text-dng-cyan uppercase tracking-widest">
                      {t('servicesPage.agentsBadge')}
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
                    {t('servicesPage.agentsTitle')}{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-dng-blue to-dng-cyan">
                      {t('servicesPage.agentsHighlight')}
                    </span>
                  </h2>
                  <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                    {t('servicesPage.agentsDesc')}
                  </p>
                  <Link
                    to="/agents"
                    className="group inline-flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-dng-blue to-dng-cyan text-white font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-[0_0_30px_-5px_rgba(37,99,235,0.5)]"
                  >
                    {t('servicesPage.tryAgents')}
                    <span className="group-hover:translate-x-1 transition-transform"><Icons.ArrowRight /></span>
                  </Link>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                  <div className="grid grid-cols-3 gap-3">
                    {AGENTS_LIST.map((agent, i) => (
                      <AgentCard key={agent.name} agent={agent} index={i} />
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ PROCESS ═══════ */}
        <section className="pb-24 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 mb-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {t('servicesPage.processBadge')}
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
                {t('servicesPage.processTitle')}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-dng-blue to-dng-cyan">
                  {t('servicesPage.processHighlight')}
                </span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-4 relative">
              <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              {STEPS.map((step, i) => {
                const Icon = Icons[step.icon];
                return (
                  <motion.div
                    key={step.key}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className="relative group"
                  >
                    <div className="relative bg-[#0A0A0A] border border-white/[0.08] rounded-2xl p-6 hover:border-dng-cyan/30 hover:bg-[#0A0A0C] transition-all duration-300 h-full">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-dng-blue/20 to-dng-cyan/20 border border-dng-cyan/20 flex items-center justify-center text-dng-cyan mb-6 group-hover:scale-110 transition-transform">
                        <Icon />
                      </div>
                      <div className="text-[10px] font-black text-dng-cyan/60 tracking-[0.2em] mb-2">{step.num}</div>
                      <h3 className="text-base font-bold text-white mb-2">{t(`servicesPage.${step.key}Title`)}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed">{t(`servicesPage.${step.key}Desc`)}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════ FINAL CTA ═══════ */}
        <section className="pb-24 px-4">
          <div className="max-w-7xl mx-auto">
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

                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight max-w-4xl mx-auto">
                  {t('servicesPage.ctaTitle')}{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-dng-blue to-dng-cyan">
                    {t('servicesPage.ctaHighlight')}
                  </span>
                </h2>

                <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
                  {t('servicesPage.ctaDesc')}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    to="/register"
                    className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_-5px_rgba(255,255,255,0.5)] overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-dng-blue to-dng-cyan translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative z-10 group-hover:text-white transition-colors flex items-center gap-3">
                      {t('hero.btnStart')}
                      <span className="group-hover:translate-x-1 transition-transform"><Icons.ArrowRight /></span>
                    </span>
                  </Link>

                  <Link
                    to="/contact"
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-white/[0.05] text-white font-bold rounded-2xl border border-white/10 hover:bg-white/[0.1] hover:border-dng-cyan/30 backdrop-blur-xl transition-all"
                  >
                    {t('servicesPage.ctaBtn')}
                    <span className="group-hover:translate-x-1 transition-transform"><Icons.ArrowRight /></span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}