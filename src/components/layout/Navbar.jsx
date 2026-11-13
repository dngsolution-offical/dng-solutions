import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import ActivePackageBadge from '../ui/ActivePackageBadge';

const LANGUAGES = [
  { code: 'ka', label: 'ქართული', short: 'GE' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ru', label: 'Русский', short: 'RU' },
];

const Icon = {
  Globe: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Chevron: () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
    </svg>
  ),
  User: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Logout: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Close: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

const dropdownMotion = {
  initial: { opacity: 0, y: -8, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.98 },
  transition: { duration: 0.15 },
};

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const langRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onDown = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') { setLangOpen(false); setUserOpen(false); setMobileOpen(false); }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setLangOpen(false);
    setUserOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const activeLangCode = (i18n.language || 'ka').split('-')[0];
  const currentLang = LANGUAGES.find((l) => l.code === activeLangCode) || LANGUAGES[0];

  const changeLang = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('lang', code);
    setLangOpen(false);
  };

  const handleLogout = async () => {
    setUserOpen(false);
    await logout();
    navigate('/');
  };

  const links = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.services'), path: '/services' },
    { name: t('nav.packages'), path: '/packages' },
    { name: t('nav.about'), path: '/about' },
    { name: t('nav.contact'), path: '/contact' },
  ];
  const authLinks = currentUser
    ? [
        { name: t('nav.agents'), path: '/agents' },
        { name: t('nav.dashboard'), path: '/dashboard' },
      ]
    : [];
  const allLinks = [...links, ...authLinks];

  const isActive = (path) => location.pathname === path;
  const initial = (currentUser?.displayName?.[0] || currentUser?.email?.[0] || 'U').toUpperCase();
  const firstName = currentUser?.displayName?.split(' ')[0] || 'User';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || mobileOpen
          ? 'bg-[#050505]/85 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.45)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6" aria-label="Main navigation">
        <div className="h-16 sm:h-[72px] flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2.5 group shrink-0" aria-label="DNG Solutions home">
            <img
              src="/logo8.webp"
              alt=""
              className="w-9 h-9 object-contain rounded-full ring-1 ring-white/10 group-hover:ring-cyan-400/50 group-hover:scale-105 transition-all duration-300"
            />
            <div className="flex flex-col leading-none">
              <span className="text-white font-black text-[15px] tracking-tight group-hover:text-cyan-300 transition-colors">
                DNG-SOLUTIONS
              </span>
              <span className="text-[9px] text-gray-500 font-semibold uppercase tracking-[0.18em] mt-0.5">AI Automation</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            {allLinks.map((l) => {
              const active = isActive(l.path);
              return (
                <Link
                  key={l.path}
                  to={l.path}
                  aria-current={active ? 'page' : undefined}
                  className={`relative px-3.5 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                    active ? 'text-white bg-white/[0.08]' : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {l.name}
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute -bottom-px left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative" ref={langRef}>
              <button
                type="button"
                onClick={() => { setLangOpen((v) => !v); setUserOpen(false); }}
                aria-haspopup="listbox"
                aria-expanded={langOpen}
                aria-label="Change language"
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-white/[0.06] bg-white/[0.02] text-gray-300 hover:text-white hover:bg-white/[0.07] transition-all text-xs font-bold"
              >
                <Icon.Globe />
                <span className="hidden sm:inline uppercase">{currentLang.short}</span>
                <span className={`transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`}><Icon.Chevron /></span>
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.ul
                    {...dropdownMotion}
                    role="listbox"
                    className="absolute right-0 top-full mt-2 w-48 p-1.5 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl"
                  >
                    {LANGUAGES.map((lang) => {
                      const selected = lang.code === currentLang.code;
                      return (
                        <li key={lang.code}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={selected}
                            onClick={() => changeLang(lang.code)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                              selected ? 'bg-blue-500/10 text-blue-300 font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                            }`}
                          >
                            <span className={`w-8 h-6 rounded-md flex items-center justify-center text-[10px] font-black ${selected ? 'bg-blue-500/20 text-blue-300' : 'bg-white/5 text-gray-500'}`}>
                              {lang.short}
                            </span>
                            <span className="flex-1 text-left">{lang.label}</span>
                            {selected && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                          </button>
                        </li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {currentUser ? (
              <div className="relative" ref={userRef}>
                <button
                  type="button"
                  onClick={() => { setUserOpen((v) => !v); setLangOpen(false); }}
                  aria-haspopup="menu"
                  aria-expanded={userOpen}
                  className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.07] transition-all"
                >
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
                    {initial}
                  </span>
                  <span className="hidden md:inline text-sm font-medium text-gray-300 max-w-[100px] truncate">{firstName}</span>
                  <span className={`text-gray-500 transition-transform duration-200 ${userOpen ? 'rotate-180' : ''}`}><Icon.Chevron /></span>
                </button>

                <AnimatePresence>
                  {userOpen && (
                    <motion.div
                      {...dropdownMotion}
                      role="menu"
                      className="absolute right-0 top-full mt-2 w-60 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
                    >
                      <div className="px-4 py-3.5 border-b border-white/[0.06]">
                        <p className="text-sm font-semibold text-white truncate">{currentUser.displayName || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{currentUser.email}</p>
                      </div>
                      <div className="p-1.5">
                        <Link to="/profile" role="menuitem" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all">
                          <Icon.User /> {t('nav.profile')}
                        </Link>
                        <Link to="/settings" role="menuitem" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all">
                          <Icon.Settings /> {t('nav.settings')}
                        </Link>
                        <div className="h-px bg-white/[0.06] my-1.5" />
                        <button type="button" role="menuitem" onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/[0.08] transition-all">
                          <Icon.Logout /> {t('nav.logout')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="px-3.5 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="px-4 py-2 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-[0_0_20px_-4px_rgba(59,130,246,0.6)] active:scale-95 transition-all">
                  {t('nav.register')}
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              className="lg:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/[0.07] transition-all"
            >
              {mobileOpen ? <Icon.Close /> : <Icon.Menu />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden border-t border-white/[0.08] bg-[#050505]/98 backdrop-blur-2xl"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {allLinks.map((l) => {
                const active = isActive(l.path);
                return (
                  <Link
                    key={l.path}
                    to={l.path}
                    aria-current={active ? 'page' : undefined}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      active ? 'text-white bg-white/[0.07] border-l-2 border-blue-500' : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    {l.name}
                  </Link>
                );
              })}

              {!currentUser && (
                <div className="pt-3 mt-3 border-t border-white/[0.06] grid grid-cols-2 gap-2">
                  <Link to="/login" className="text-center px-4 py-2.5 text-sm font-medium text-gray-300 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                    {t('nav.login')}
                  </Link>
                  <Link to="/register" className="text-center px-4 py-2.5 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
                    {t('nav.register')}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}