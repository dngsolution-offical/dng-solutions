// src/pages/Register.jsx — რეგისტრაცია (ანიმაციური, დუბლიკატის შემოწმებით)
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore/lite';
import { toast } from 'react-hot-toast';
import { auth, db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { authErrorMessage } from '../utils/authErrors';

const T = {
  ka: { title: 'რეგისტრაცია', sub: 'შექმენი ახალი ანგარიში', name: 'სახელი', email: 'ელ-ფოსტა', password: 'პაროლი',
        confirm: 'გაიმეორე პაროლი', btn: 'ანგარიშის შექმნა', have: 'უკვე გაქვს ანგარიში?', login: 'შესვლა',
        mismatch: 'პაროლები არ ემთხვევა', fill: 'შეავსე ყველა ველი', ok: 'ანგარიში შეიქმნა! შედი ახლა.',
        already: 'უკვე შესული ხარ', rules: ['მინიმუმ 8 სიმბოლო', '1 დიდი ასო (A-Z)', '1 პატარა ასო (a-z)', '1 ციფრი (0-9)'] },
  en: { title: 'Sign up', sub: 'Create a new account', name: 'Name', email: 'Email', password: 'Password',
        confirm: 'Repeat password', btn: 'Create account', have: 'Already have an account?', login: 'Sign in',
        mismatch: 'Passwords do not match', fill: 'Please fill in all fields', ok: 'Account created! Please sign in.',
        already: 'You are already signed in', rules: ['At least 8 characters', '1 uppercase letter (A-Z)', '1 lowercase letter (a-z)', '1 number (0-9)'] },
  ru: { title: 'Регистрация', sub: 'Создайте новый аккаунт', name: 'Имя', email: 'Email', password: 'Пароль',
        confirm: 'Повторите пароль', btn: 'Создать аккаунт', have: 'Уже есть аккаунт?', login: 'Войти',
        mismatch: 'Пароли не совпадают', fill: 'Заполните все поля', ok: 'Аккаунт создан! Теперь войдите.',
        already: 'Вы уже вошли', rules: ['Минимум 8 символов', '1 заглавная буква (A-Z)', '1 строчная буква (a-z)', '1 цифра (0-9)'] },
};

const checks = (p) => [p.length >= 8, /[A-Z]/.test(p), /[a-z]/.test(p), /[0-9]/.test(p)];

export default function Register() {
  const { i18n } = useTranslation();
  const lang = ['ka', 'en', 'ru'].includes((i18n.language || 'ka').split('-')[0]) ? (i18n.language || 'ka').split('-')[0] : 'ka';
  const L = T[lang];
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authLoading && currentUser) navigate('/agents', { replace: true });
  }, [authLoading, currentUser, navigate]);

  const rules = checks(password);
  const strong = rules.every(Boolean);

  async function onSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password || !confirm) return toast.error(L.fill);
    if (password !== confirm) return toast.error(L.mismatch);
    if (!strong) return toast.error(L.rules[rules.findIndex((r) => !r)]);

    setBusy(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = cred.user;
      await updateProfile(user, { displayName: name.trim() });

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: name.trim(),
        email: email.trim(),
        package: 'Free',
        ordersUsed: 0,
        role: 'user',
        emailVerified: false,
        createdAt: serverTimestamp(),
      }, { merge: true });

      sendEmailVerification(user).catch(() => {});
      toast.success(L.ok);
      // createUserWithEmailAndPassword უკვე ავტომატურად შემოაქვს მომხმარებელს, ამიტომ პირდაპირ /agents-ზე
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
      <motion.div animate={{ x: [0, 40, 0], y: [0, -20, 0] }} transition={{ duration: 14, repeat: Infinity }}
        className="absolute top-10 -left-32 w-[460px] h-[460px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <motion.div animate={{ x: [0, -40, 0], y: [0, 20, 0] }} transition={{ duration: 16, repeat: Infinity }}
        className="absolute bottom-10 -right-32 w-[460px] h-[460px] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5 }}
        className="relative w-full max-w-md bg-[#0A0A0C]/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.6)]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white mb-2">{L.title}</h1>
          <p className="text-gray-500 text-sm">{L.sub}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">{L.name}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">{L.email}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={inputCls} placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">{L.password}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" className={inputCls} placeholder="••••••••" />
            <ul className="mt-2 grid grid-cols-2 gap-1">
              {L.rules.map((r, i) => (
                <li key={i} className={`text-[11px] flex items-center gap-1.5 transition-colors ${rules[i] ? 'text-emerald-400' : 'text-gray-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${rules[i] ? 'bg-emerald-400' : 'bg-gray-600'}`} />{r}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">{L.confirm}</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" className={inputCls} placeholder="••••••••" />
          </div>
          <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={busy}
            className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            {busy ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : L.btn}
          </motion.button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          {L.have} <Link to="/login" className="text-cyan-300 hover:underline font-semibold">{L.login}</Link>
        </p>
      </motion.div>
    </div>
  );
}