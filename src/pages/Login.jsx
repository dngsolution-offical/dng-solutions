import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { toast, Toaster } from 'react-hot-toast';

const Icons = {
  Mail: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Lock: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  Eye: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  EyeOff: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>,
};

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error(t('auth.fillAllFields') || 'Please fill all fields'); return; }
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success(t('auth.successLogin'));
      navigate('/dashboard');
    } catch (err) {
      toast.error(t('auth.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success(t('auth.googleLoginSuccess'));
      navigate('/dashboard');
    } catch (err) {
      toast.error(t('auth.googleLoginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050506] flex items-center justify-center px-4 relative overflow-hidden font-sans selection:bg-dng-cyan/30">
      <Toaster position="top-center" toastOptions={{ style: { background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-dng-blue/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-dng-cyan/5 rounded-full blur-[150px] pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md bg-[#0A0A0C]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.6)]">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-dng-blue to-dng-cyan rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">{t('auth.loginTitle')}</h1>
          <p className="text-gray-500 text-sm">{t('auth.loginSubtitle')}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">{t('auth.email')}</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><Icons.Mail /></span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-[#050505] border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-dng-cyan/50 transition-all text-sm" placeholder={t('auth.emailPlaceholder')} />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">{t('auth.password')}</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><Icons.Lock /></span>
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-[#050505] border border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-dng-cyan/50 transition-all text-sm" placeholder={t('auth.passwordPlaceholder')} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-dng-blue to-dng-cyan text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] mt-2">
            {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t('auth.loginBtn')}</> : t('auth.loginBtn')}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
          <div className="relative flex justify-center text-xs"><span className="px-3 bg-[#0A0A0C] text-gray-500">{t('auth.or')}</span></div>
        </div>

        <button onClick={handleGoogleLogin} disabled={loading} className="w-full py-3.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
          {t('auth.googleLogin')}
        </button>

        <p className="text-center text-sm text-gray-500 mt-8">
          {t('auth.noAccount')} <Link to="/register" className="text-dng-cyan hover:underline font-semibold">{t('auth.registerLink')}</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;