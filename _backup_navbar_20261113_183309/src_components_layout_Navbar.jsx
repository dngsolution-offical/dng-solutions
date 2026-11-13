import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

const Icons = {
  Globe: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  User: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Settings: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Logout: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  ChevronDown: () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>,
  Menu: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>,
  X: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
};

const LANGUAGES = [
  { code: 'ka', label: 'ქართული', flag: 'GE' },
  { code: 'en', label: 'English', flag: 'EN' },
  { code: 'ru', label: 'Русский', flag: 'RU' },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const langRef = useRef(null);
  const userRef = useRef(null);

  // Detect scroll for glass effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setLangOpen(false);
    setUserOpen(false);
  }, [location.pathname]);

  const changeLang = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('lang', code);
    setLangOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const currentLang = LANGUAGES.find(l => l.code === (i18n.language || 'ka')) || LANGUAGES[0];

  const links = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.services'), path: '/services' },
    { name: t('nav.packages'), path: '/packages' },
    { name: t('nav.about'), path: '/about' },
    { name: t('nav.contact'), path: '/contact' },
  ];

  const authLinks = currentUser ? [
    { name: t('nav.agents'), path: '/agents' },
    { name: t('nav.dashboard'), path: '/dashboard' },
  ] : [];

  const allLinks = [...links, ...authLinks];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-[#050505]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)]' 
        : 'bg-transparent border-b border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-16 sm:h-[72px] flex items-center justify-between gap-6">
          
          {/* LOGO */}
          <Link 
            to="/" 
            className="flex items-center gap-2.5 group shrink-0" 
            aria-label="DNG Solutions Home"
          >
            <img src="/logo8.webp" alt="DNG Solutions" className="w-9 h-9 object-contain group-hover:scale-105 transition-transform duration-300" />
            <div className="flex flex-col leading-none">
              <span className="text-white font-black text-[15px] tracking-tight group-hover:text-blue-400 transition-colors">
                DNG-SOLUTIONS
              </span>
              <span className="text-[9px] text-gray-500 font-semibold uppercase tracking-[0.18em] mt-0.5">
                AI Automation
              </span>
            </div>
          </Link>

          {/* DESKTOP LINKS */}
          <div className="hidden lg:flex items-center gap-1">
            {allLinks.map((l) => {
              const isActive = location.pathname === l.path;
              return (
                <Link
                  key={l.path}
                  to={l.path}
                  className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'text-white bg-white/[0.06]' 
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  {l.name}
                  {isActive && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* RIGHT SIDE: Language + Profile */}
          <div className="flex items-center gap-2">
            
            {/* LANGUAGE SWITCHER */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all text-sm font-medium"
                aria-label="Change language"
              >
                <Icons.Globe />
                <span className="hidden sm:inline uppercase text-xs font-bold">{currentLang.flag}</span>
                <Icons.ChevronDown />
              </button>

              {langOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-[#0a0a0a] border border-white/[0.08] rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-1">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => changeLang(lang.code)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                          currentLang.code === lang.code
                            ? 'bg-blue-500/10 text-blue-400 font-semibold'
                            : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                        }`}
                      >
                        <span className={`w-7 h-5 rounded flex items-center justify-center text-[9px] font-black tracking-wider ${
                          currentLang.code === lang.code ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-500'
                        }`}>
                          {lang.flag}
                        </span>
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PROFILE / AUTH */}
            {currentUser ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserOpen(!userOpen)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs uppercase">
                    {currentUser.displayName?.[0] || currentUser.email?.[0] || 'U'}
                  </div>
                  <span className="hidden md:inline text-sm font-medium text-gray-300 max-w-[100px] truncate">
                    {currentUser.displayName?.split(' ')[0] || 'User'}
                  </span>
                  <Icons.ChevronDown />
                </button>

                {userOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#0a0a0a] border border-white/[0.08] rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-white/[0.06]">
                      <p className="text-sm font-semibold text-white truncate">{currentUser.displayName || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{currentUser.email}</p>
                    </div>
                    <div className="p-1">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all"
                      >
                        <Icons.User />
                        {t('nav.profile')}
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all"
                      >
                        <Icons.Settings />
                        {t('nav.settings')}
                      </Link>
                      <div className="h-px bg-white/[0.06] my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/[0.08] transition-all"
                      >
                        <Icons.Logout />
                        {t('nav.logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link 
                  to="/login" 
                  className="px-3.5 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 text-sm font-bold text-white rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-[0_0_20px_-4px_rgba(59,130,246,0.6)] active:scale-95 transition-all"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}

            {/* MOBILE MENU TOGGLE */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all"
              aria-label="Menu"
            >
              {mobileOpen ? <Icons.X /> : <Icons.Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/[0.08] bg-[#050505]/98 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {allLinks.map((l) => {
              const isActive = location.pathname === l.path;
              return (
                <Link
                  key={l.path}
                  to={l.path}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'text-white bg-white/[0.06] border-l-2 border-blue-500' 
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  {l.name}
                </Link>
              );
            })}
            
            {!currentUser && (
              <div className="pt-3 mt-3 border-t border-white/[0.06] flex gap-2">
                <Link 
                  to="/login" 
                  className="flex-1 text-center px-4 py-2.5 text-sm font-medium text-gray-300 rounded-lg bg-white/[0.03] border border-white/[0.08]"
                >
                  {t('nav.login')}
                </Link>
                <Link 
                  to="/register" 
                  className="flex-1 text-center px-4 py-2.5 text-sm font-bold text-white rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
