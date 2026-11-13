import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { toast, Toaster } from 'react-hot-toast';

const CONTACT = {
  email: 'dng.solution01@gmail.com',
  phone1: '+995 551 222 098',
  phone1Tel: '+995551222098',
  phone2: '+995 551 071 451',
  phone2Tel: '+995551071451',
};

const SOCIALS = [
  { name: 'Instagram', handle: '@dng.solutions', url: 'https://www.instagram.com/dng.solutions',
    gradient: 'from-pink-500 via-rose-500 to-orange-500', glow: 'shadow-[0_0_50px_-10px_rgba(236,72,153,0.6)]',
    bg: 'from-pink-500/15 to-transparent', text: 'text-pink-400', border: 'border-pink-500/20', hover: 'hover:border-pink-500/50' },
  { name: 'TikTok', handle: '@dng.solutions', url: 'https://www.tiktok.com/@dng_solution',
    gradient: 'from-cyan-400 via-slate-200 to-rose-500', glow: 'shadow-[0_0_50px_-10px_rgba(6,182,212,0.6)]',
    bg: 'from-cyan-500/15 to-transparent', text: 'text-cyan-300', border: 'border-cyan-500/20', hover: 'hover:border-cyan-400/50' },
  { name: 'Facebook', handle: 'DNG Solutions', url: 'https://www.facebook.com/profile.php?id=61596586850292',
    gradient: 'from-blue-500 to-blue-600', glow: 'shadow-[0_0_50px_-10px_rgba(59,130,246,0.6)]',
    bg: 'from-blue-500/15 to-transparent', text: 'text-blue-400', border: 'border-blue-500/20', hover: 'hover:border-blue-500/50' },
];

const Icons = {
  Mail: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Phone: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
  MapPin: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Clock: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Instagram: () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
  TikTok: () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/></svg>,
  Facebook: () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  Send: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
  ArrowUpRight: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 17L17 7M17 7H8m9 0v9" /></svg>,
  ArrowRight: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>,
  Check: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>,
  Sparkles: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  User: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Tag: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
  Message: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  Globe: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

const SOCIAL_ICONS = { Instagram: Icons.Instagram, TikTok: Icons.TikTok, Facebook: Icons.Facebook };

export default function Contact() {
  const { t } = useTranslation();
  const formRef = useRef();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await emailjs.sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        formRef.current,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      toast.success(t('contactPage.success'));
      formRef.current.reset();
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch {
      toast.error(t('contactPage.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden font-sans selection:bg-dng-cyan/30">
      <Toaster position="top-center" toastOptions={{ style: { background: '#0A0A0C', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '14px 18px' } }} />

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.12),transparent_55%)]" />
        <motion.div animate={{ x: [0, 40, 0], y: [0, -30, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 -left-40 w-[600px] h-[600px] bg-dng-blue/[0.06] rounded-full blur-[150px]" />
        <motion.div animate={{ x: [0, -40, 0], y: [0, 30, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-20 -right-40 w-[600px] h-[600px] bg-dng-cyan/[0.06] rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative pt-32 pb-24 px-4">
        <div className="max-w-7xl mx-auto">

          {/* HERO */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16 max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 mb-8 backdrop-blur-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-gray-300 tracking-widest uppercase">{t('contactPage.badge')}</span>
            </motion.div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-[1.05]">
              {t('contactPage.title')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-dng-blue via-dng-cyan to-dng-blue bg-[length:200%_auto] animate-gradient">
                {t('contactPage.highlight')}
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">{t('contactPage.desc')}</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href={`mailto:${CONTACT.email}`}
                className="group relative inline-flex items-center gap-3 px-7 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-dng-blue to-dng-cyan translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <Icons.Mail />
                <span className="relative z-10 group-hover:text-white transition-colors">Email</span>
              </a>
              <a href={`tel:${CONTACT.phone1Tel}`}
                className="group inline-flex items-center gap-3 px-7 py-4 bg-emerald-500/10 text-emerald-400 font-bold rounded-2xl border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 backdrop-blur-xl transition-all">
                <Icons.Phone />
                <span>{CONTACT.phone1}</span>
              </a>
            </div>
          </motion.div>

          {/* 3 CONTACT CARDS */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
            <motion.a href={`mailto:${CONTACT.email}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} whileHover={{ y: -6 }}
              className="group relative bg-[#0A0A0A] border border-white/[0.08] hover:border-sky-500/40 rounded-3xl p-6 sm:p-7 overflow-hidden transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform"><Icons.Mail /></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-sky-400/60 group-hover:text-sky-400 transition-colors">Email</span>
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">{t('contactPage.emailLabel')}</p>
                <p className="text-white font-bold text-sm mb-5 truncate group-hover:text-sky-400 transition-colors">{CONTACT.email}</p>
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
                  <span>{t('contactPage.send')}</span>
                  <Icons.ArrowUpRight />
                </div>
              </div>
            </motion.a>

            <motion.a href={`tel:${CONTACT.phone1Tel}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} whileHover={{ y: -6 }}
              className="group relative bg-[#0A0A0A] border border-white/[0.08] hover:border-emerald-500/40 rounded-3xl p-6 sm:p-7 overflow-hidden transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform"><Icons.Phone /></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400/60 group-hover:text-emerald-400 transition-colors">01</span>
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">{t('contactPage.phoneLabel')}</p>
                <p className="text-white font-bold text-sm mb-5 group-hover:text-emerald-400 transition-colors">{CONTACT.phone1}</p>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
                  <span>{t('contactPage.send')}</span>
                  <Icons.ArrowUpRight />
                </div>
              </div>
            </motion.a>

            <motion.a href={`tel:${CONTACT.phone2Tel}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} whileHover={{ y: -6 }}
              className="group relative bg-[#0A0A0A] border border-white/[0.08] hover:border-teal-500/40 rounded-3xl p-6 sm:p-7 overflow-hidden transition-colors sm:col-span-2 lg:col-span-1">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform"><Icons.Phone /></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-teal-400/60 group-hover:text-teal-400 transition-colors">02</span>
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">{t('contactPage.phone2Label')}</p>
                <p className="text-white font-bold text-sm mb-5 group-hover:text-teal-400 transition-colors">{CONTACT.phone2}</p>
                <div className="flex items-center gap-2 text-xs font-bold text-teal-400 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
                  <span>{t('contactPage.send')}</span>
                  <Icons.ArrowUpRight />
                </div>
              </div>
            </motion.a>
          </div>

          {/* FORM + SIDEBAR */}
          <div className="grid lg:grid-cols-5 gap-6 mb-16">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="lg:col-span-3 relative bg-gradient-to-br from-[#0A0A0A] to-[#08080C] border border-white/[0.08] rounded-3xl p-6 sm:p-10 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-dng-cyan/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-dng-cyan/10 border border-dng-cyan/20 flex items-center justify-center text-dng-cyan"><Icons.Message /></div>
                  <span className="text-xs font-bold text-dng-cyan uppercase tracking-widest">{t('contactPage.formTitle')}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">{t('contactPage.formTitle')}</h2>
                <p className="text-sm text-gray-500 mb-8">{t('contactPage.formSubtitle')}</p>

                <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t('contactPage.name')}</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none"><Icons.User /></span>
                        <input type="text" name="user_name" required placeholder={t('contactPage.namePlaceholder')}
                          className="w-full bg-[#050505] border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-gray-600 text-sm focus:outline-none focus:border-dng-cyan/50 focus:ring-2 focus:ring-dng-cyan/20 transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t('contactPage.email')}</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none"><Icons.Mail /></span>
                        <input type="email" name="user_email" required placeholder={t('contactPage.emailPlaceholder')}
                          className="w-full bg-[#050505] border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-gray-600 text-sm focus:outline-none focus:border-dng-cyan/50 focus:ring-2 focus:ring-dng-cyan/20 transition-all" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t('contactPage.subject')}</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none"><Icons.Tag /></span>
                      <input type="text" name="subject" required placeholder={t('contactPage.subjectPlaceholder')}
                        className="w-full bg-[#050505] border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-gray-600 text-sm focus:outline-none focus:border-dng-cyan/50 focus:ring-2 focus:ring-dng-cyan/20 transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t('contactPage.message')}</label>
                    <textarea name="message" required rows={6} placeholder={t('contactPage.messagePlaceholder')}
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 text-sm focus:outline-none focus:border-dng-cyan/50 focus:ring-2 focus:ring-dng-cyan/20 transition-all resize-none" />
                  </div>
                  <button type="submit" disabled={loading || sent}
                    className="group relative w-full py-4 bg-gradient-to-r from-dng-blue via-blue-600 to-dng-cyan bg-[length:200%_auto] hover:bg-[position:100%_0] text-white font-bold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-[0_0_30px_-5px_rgba(37,99,235,0.5)]">
                    {loading ? (
                      <><svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>{t('contactPage.sending')}</>
                    ) : sent ? (
                      <><Icons.Check />{t('contactPage.success')}</>
                    ) : (
                      <><Icons.Send />{t('contactPage.send')}<span className="group-hover:translate-x-1 transition-transform"><Icons.ArrowRight /></span></>
                    )}
                  </button>
                  <p className="text-[11px] text-center text-gray-600">{t('contactPage.formFooter')}</p>
                </form>
              </div>
            </motion.div>

            <div className="lg:col-span-2 space-y-4">
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                className="relative bg-[#0A0A0A] border border-white/[0.08] rounded-3xl p-6 overflow-hidden hover:border-orange-500/30 transition-colors group">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0 group-hover:scale-110 transition-transform"><Icons.Clock /></div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">{t('contactPage.hoursLabel')}</p>
                    <p className="text-white font-bold text-sm mb-1">{t('contactPage.hoursWeekday')}</p>
                    <p className="text-gray-400 text-xs">{t('contactPage.hoursWeekdayTime')}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{t('contactPage.openNow')}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                className="relative bg-[#0A0A0A] border border-white/[0.08] rounded-3xl p-6 overflow-hidden hover:border-purple-500/30 transition-colors group">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-110 transition-transform"><Icons.MapPin /></div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">{t('contactPage.locationLabel')}</p>
                    <p className="text-white font-bold text-sm">{t('contactPage.locationValue')}</p>
                    <p className="text-gray-400 text-xs mt-1">{t('contactPage.locationDesc')}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
                className="relative bg-gradient-to-br from-dng-blue/10 via-[#0A0A0A] to-dng-cyan/10 border border-dng-cyan/20 rounded-3xl p-6 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-dng-cyan/20 rounded-full blur-[80px]" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-dng-cyan/20 flex items-center justify-center text-dng-cyan"><Icons.Sparkles /></div>
                    <span className="text-[10px] font-black text-dng-cyan uppercase tracking-widest">{t('contactPage.responseTimeLabel')}</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-black text-white">{t('contactPage.responseTimeValue')}</span>
                    <span className="text-sm text-gray-400 font-semibold">{t('contactPage.responseTimeUnit')}</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{t('contactPage.responseTimeDesc')}</p>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
                className="bg-[#0A0A0A] border border-white/[0.08] rounded-2xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-gray-400"><Icons.Globe /></div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">{t('contactPage.languagesLabel')}</p>
                  <p className="text-white text-sm font-bold">{t('contactPage.languagesValue')}</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* SOCIAL */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 mb-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('contactPage.socialsTitle')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                {t('contactPage.socialsTitle')}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-cyan-400 to-blue-500">{t('contactPage.socialsHighlight')}</span>
              </h2>
              <p className="text-sm text-gray-500">{t('contactPage.socialsSubtitle')}</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {SOCIALS.map((social, i) => {
                const Icon = SOCIAL_ICONS[social.name];
                return (
                  <motion.a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -8 }}
                    className={`group relative bg-[#0A0A0A] border ${social.border} ${social.hover} rounded-3xl p-6 sm:p-8 overflow-hidden transition-colors`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${social.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />
                    <div className={`absolute -top-20 -right-20 w-56 h-56 bg-gradient-to-br ${social.gradient} opacity-[0.15] rounded-full blur-3xl group-hover:opacity-30 transition-opacity`} />
                    <div className="relative z-10">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${social.gradient} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ${social.glow}`}>
                        <Icon />
                      </div>
                      <h3 className="text-xl font-black text-white mb-1">{social.name}</h3>
                      <p className={`text-sm font-medium ${social.text} mb-6`}>{social.handle}</p>
                      <div className={`flex items-center gap-2 text-xs font-bold ${social.text} opacity-60 group-hover:opacity-100 transition-opacity`}>
                        <span>{t('contactPage.followLabel')}</span>
                        <span className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"><Icons.ArrowUpRight /></span>
                      </div>
                    </div>
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* WHY US */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative bg-gradient-to-br from-[#0A0A0A] to-[#08080C] border border-white/[0.08] rounded-3xl p-8 sm:p-12 overflow-hidden mb-16">
            <div className="absolute top-0 left-1/3 w-96 h-96 bg-dng-blue/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="relative grid md:grid-cols-3 gap-8">
              {[
                { icon: <Icons.Clock />, titleKey: 'whyFastTitle', descKey: 'whyFastDesc', color: 'text-orange-400', bg: 'bg-orange-500/10' },
                { icon: <Icons.Check />, titleKey: 'whyFreeTitle', descKey: 'whyFreeDesc', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { icon: <Icons.Sparkles />, titleKey: 'whyPersonalTitle', descKey: 'whyPersonalDesc', color: 'text-purple-400', bg: 'bg-purple-500/10' },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                  <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} border border-white/5 flex items-center justify-center mx-auto mb-4`}>{item.icon}</div>
                  <h3 className="text-white font-bold mb-2">{t(`contactPage.${item.titleKey}`)}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{t(`contactPage.${item.descKey}`)}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* FINAL CTA */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative rounded-[2.5rem] bg-gradient-to-br from-dng-blue/20 via-[#0A0A0A] to-dng-cyan/20 border border-white/10 p-10 sm:p-14 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.3),transparent_60%)] pointer-events-none" />
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-dng-cyan/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="relative">
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-dng-blue to-dng-cyan flex items-center justify-center mx-auto mb-6 shadow-[0_0_60px_-10px_rgba(37,99,235,0.7)]">
                <Icons.Mail />
              </motion.div>
              <h2 className="text-2xl sm:text-4xl font-black text-white mb-4 max-w-2xl mx-auto leading-tight">
                {t('contactPage.ctaTitle')}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-dng-blue to-dng-cyan">{t('contactPage.ctaHighlight')}</span>
              </h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto text-sm sm:text-base">{t('contactPage.ctaDesc')}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/register" className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_-5px_rgba(255,255,255,0.5)] overflow-hidden">
                  <span className="absolute inset-0 bg-gradient-to-r from-dng-blue to-dng-cyan translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative z-10 group-hover:text-white transition-colors flex items-center gap-2">
                    {t('hero.btnStart')}
                    <span className="group-hover:translate-x-1 transition-transform"><Icons.ArrowRight /></span>
                  </span>
                </Link>
                <Link to="/packages" className="group inline-flex items-center gap-3 px-8 py-4 bg-white/[0.05] text-white font-bold rounded-2xl border border-white/10 hover:bg-white/[0.1] hover:border-dng-cyan/30 backdrop-blur-xl transition-all">
                  {t('hero.btnPackages')}
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