// src/pages/Login.jsx — შესვლა (ანიმაციური, შეცდომების სწორი დამუშავებით)
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { toast, Toaster } from 'react-hot-toast';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { authErrorMessage } from '../utils/authErrors';

const T = {
  ka: { title: 'შესვლა', sub: 'შედი შენს ანგარიშში', email: 'ელ-ფოსტა', password: 'პაროლი', btn: 'შესვლა',
        or: 'ან', google: 'Google-ით შესვლა', noAcc: 'არ გაქვს ანგარიში?', reg: 'რეგისტრაცია',
        fill: 'შეავსე ყველა ველი', ok: 'წარმატებით შეხვედი!', already: 'უკვე შესული ხარ' },
  en: { title: 'Sign in', sub: 'Welcome back to your account', email: 'Email', password: 'Password', btn: 'Sign in',
        or: 'or', google: 'Continue with Google', noAcc: "Don't have an account?", reg: 'Sign up',
        fill: 'Please fill in all fields', ok: 'Signed in successfully!', already: 'You are already signed in' },
  ru: { title: 'Вход', sub: 'Войдите в свой аккаунт', email: 'Email', password: 'Пароль', btn: 'Войти',
        or: 'или', google: 'Войти через Google', noAcc: 'Нет аккаунта?', reg: 'Регистрация',
        fill: 'Заполните все поля', ok: 'Вход выполнен!', already: 'Вы уже вошли' },
};

export default function Login() {
  const { i18n } = useTranslation();
  const lang = ['ka', 'en', 'ru'].includes((i18n.language || 'ka').split('-')[0]) ? (i18n.language || 'ka').split('-')[0] : 'ka';
  const L = T[lang];
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  // უკვე შესული მომხმარებელი ლოგინზე არ უნდა დარჩეს
  useEffect(() => {
    if (!authLoading && currentUser) navigate('/agents', { replace: true });
  }, [authLoading, currentUser, navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password) return toast.error(L.fill);
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      toast.success(L.ok);
      navigate('/agents', { replace: true });
    } catch (err) {
      toast.error(authErrorMessage(err, lang));
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setBusy(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      toast.success(L.ok);
      navigate('/agents', { replace: true });
    } catch (err) {
      toast.error(authErrorMessage(err, lang));
    } finally {
      setBusy(false);
    }
  }

  if (currentUser && !authLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        <p className="text-gray-400">{L.already}…</p>
      </div>
    );
  }

  const inputCls = 'w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10 transition-all text-sm';

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-24 relative overflow-hidden">
      <Toaster position="top-center" toastOptions={{ style: { background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
      <motion.div animate={{ x: [0, 40, 0], y: [0, -20, 0] }} transition={{ duration: 14, repeat: Infinity }}
        className="absolute top-10 -left-32 w-[460px] h-[460px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <motion.div animate={{ x: [0, -40, 0], y: [0, 20, 0] }} transition={{ duration: 16, repeat: Infinity }}
        className="absolute bottom-10 -right-32 w-[460px] h-[460px] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5 }}
        className="relative w-full max-w-md bg-[#0A0A0C]/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.6)]">
        <div className="text-center mb-8">
          <motion.div initial={{ rotate: -10, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
            className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(6,182,212,0.35)]">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </motion.div>
          <h1 className="text-3xl font-black text-white mb-2">{L.title}</h1>
          <p className="text-gray-500 text-sm">{L.sub}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">{L.email}</label>
            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">{L.password}</label>
            <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="••••••••" />
          </div>
          <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={busy}
            className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <AnimatePresence mode="wait">
              {busy ? (
                <motion.span key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <motion.span key="txt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{L.btn}</motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
          <div className="relative flex justify-center text-xs"><span className="px-3 bg-[#0A0A0C] text-gray-500">{L.or}</span></div>
        </div>

        <motion.button whileTap={{ scale: 0.98 }} onClick={onGoogle} disabled={busy}
          className="w-full py-3.5 rounded-xl font-bold bg-white text-black hover:bg-gray-200 disabled:opacity-50 transition-colors">
          {L.google}
        </motion.button>

        <p className="text-center text-sm text-gray-500 mt-8">
          {L.noAcc} <Link to="/register" className="text-cyan-300 hover:underline font-semibold">{L.reg}</Link>
        </p>
      </motion.div>
    </div>
  );
}