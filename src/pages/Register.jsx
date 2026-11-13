import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore/lite';
import { auth, db } from '../firebase';
import { toast, Toaster } from 'react-hot-toast';

const Icons = {
  User: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Mail: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Lock: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  Eye: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  EyeOff: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>,
  Check: () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>,
};

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password validation
  const isLengthValid = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordStrong = isLengthValid && hasUpperCase && hasLowerCase && hasNumber;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error(t('auth.passwordsMismatch'));
      return;
    }
    if (!isPasswordStrong) {
      toast.error(t('auth.passwordTooShort'));
      return;
    }
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });
      await sendEmailVerification(user);

      await setDoc(doc(db, 'users', user.uid), {
        name: name,
        email: email,
        package: 'Free',
        ordersUsed: 0,
        createdAt: serverTimestamp(),
        trialStartedAt: null,
        emailVerified: false,
      });

      toast.success(t('auth.successRegister'));
      navigate('/login');
    } catch (err) {
      toast.error(t('auth.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050506] flex items-center justify-center px-4 relative overflow-hidden font-sans selection:bg-dng-cyan/30 py-12">
      <Toaster position="top-center" toastOptions={{ style: { background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-dng-blue/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-dng-cyan/5 rounded-full blur-[150px] pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md bg-[#0A0A0C]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.6)]">

        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-dng-blue to-dng-cyan rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
            <Icons.User />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">{t('auth.registerTitle')}</h1>
          <p className="text-gray-500 text-sm">{t('auth.registerSubtitle')}</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">{t('auth.name')}</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><Icons.User /></span>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full bg-[#050505] border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-dng-cyan/50 transition-all text-sm"
                placeholder={t('auth.namePlaceholder')} />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">{t('auth.email')}</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><Icons.Mail /></span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full bg-[#050505] border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-dng-cyan/50 transition-all text-sm"
                placeholder={t('auth.emailPlaceholder')} />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">{t('auth.password')}</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><Icons.Lock /></span>
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full bg-[#050505] border border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-dng-cyan/50 transition-all text-sm"
                placeholder={t('auth.passwordPlaceholder')} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
              </button>
            </div>

            {/* Password rules — now i18n */}
            <div className="mt-2 space-y-1">
              <p className={`text-[11px] flex items-center gap-1.5 ${isLengthValid ? 'text-green-400' : 'text-gray-500'}`}>
                <span className={`w-3 h-3 rounded-full flex items-center justify-center ${isLengthValid ? 'bg-green-400/20 text-green-400' : 'bg-gray-500/20'}`}>
                  {isLengthValid && <Icons.Check />}
                </span>
                {t('auth.ruleLength')}
              </p>
              <p className={`text-[11px] flex items-center gap-1.5 ${hasUpperCase ? 'text-green-400' : 'text-gray-500'}`}>
                <span className={`w-3 h-3 rounded-full flex items-center justify-center ${hasUpperCase ? 'bg-green-400/20 text-green-400' : 'bg-gray-500/20'}`}>
                  {hasUpperCase && <Icons.Check />}
                </span>
                {t('auth.ruleUppercase')}
              </p>
              <p className={`text-[11px] flex items-center gap-1.5 ${hasLowerCase ? 'text-green-400' : 'text-gray-500'}`}>
                <span className={`w-3 h-3 rounded-full flex items-center justify-center ${hasLowerCase ? 'bg-green-400/20 text-green-400' : 'bg-gray-500/20'}`}>
                  {hasLowerCase && <Icons.Check />}
                </span>
                {t('auth.ruleLowercase')}
              </p>
              <p className={`text-[11px] flex items-center gap-1.5 ${hasNumber ? 'text-green-400' : 'text-gray-500'}`}>
                <span className={`w-3 h-3 rounded-full flex items-center justify-center ${hasNumber ? 'bg-green-400/20 text-green-400' : 'bg-gray-500/20'}`}>
                  {hasNumber && <Icons.Check />}
                </span>
                {t('auth.ruleNumber')}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">{t('auth.confirmPassword')}</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><Icons.Lock /></span>
              <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                className="w-full bg-[#050505] border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-dng-cyan/50 transition-all text-sm"
                placeholder={t('auth.confirmPasswordPlaceholder')} />
            </div>
          </div>

          <button type="submit" disabled={loading || !isPasswordStrong}
            className="w-full py-3.5 bg-gradient-to-r from-dng-blue to-dng-cyan text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] mt-2">
            {loading ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t('auth.registerBtn')}</>
            ) : t('auth.registerBtn')}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          {t('auth.haveAccount')} <Link to="/login" className="text-dng-cyan hover:underline font-semibold">{t('auth.loginLink')}</Link>
        </p>
      </motion.div>
    </div>
  );
}