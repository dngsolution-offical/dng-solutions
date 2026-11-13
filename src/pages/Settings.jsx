// src/pages/Settings.jsx — Full settings page (3 languages)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore/lite';
import { updateProfile, updatePassword, sendPasswordResetEmail, deleteUser } from 'firebase/auth';
import { toast, Toaster } from 'react-hot-toast';

// ─── ICONS ───
const Icon = ({ d, className = 'w-5 h-5', sw = 2 }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Icons = {
  User: () => <Icon d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
  Lock: () => <Icon d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />,
  Globe: () => <Icon d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  Bell: () => <Icon d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
  Moon: () => <Icon d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />,
  Shield: () => <Icon d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
  Trash: () => <Icon d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
  Check: () => <Icon d="M5 13l4 4L19 7" sw={2.5} />,
  ArrowLeft: () => <Icon d="M10 19l-7-7m0 0l7-7m-7 7h18" />,
  Eye: () => <Icon d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />,
  EyeOff: () => <Icon d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />,
  Save: () => <Icon d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />,
};

const TABS = [
  { id: 'profile', label: 'profileTab', icon: 'User' },
  { id: 'security', label: 'securityTab', icon: 'Lock' },
  { id: 'language', label: 'languageTab', icon: 'Globe' },
  { id: 'notifications', label: 'notificationsTab', icon: 'Bell' },
  { id: 'appearance', label: 'appearanceTab', icon: 'Moon' },
  { id: 'privacy', label: 'privacyTab', icon: 'Shield' },
  { id: 'danger', label: 'dangerTab', icon: 'Trash' },
];

const LANGUAGES = [
  { code: 'ka', label: 'ქართული', flag: '🇬🇪', native: 'ქართული' },
  { code: 'en', label: 'English', flag: '🇬🇧', native: 'English' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺', native: 'Русский' },
];

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile
  const [name, setName] = useState('');

  // Security
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailReports: true,
    emailMarketing: false,
    pushMessages: true,
    pushReminders: true,
  });

  // Appearance
  const [theme, setTheme] = useState('dark');
  const [accentColor, setAccentColor] = useState('blue');

  // Privacy
  const [privacy, setPrivacy] = useState({
    publicProfile: false,
    showStats: true,
    dataAnalytics: true,
  });

  useEffect(() => {
    if (!currentUser) { navigate('/login'); return; }
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', currentUser.uid));
        if (snap.exists()) {
          const data = snap.data();
          setUserData(data);
          setName(data.name || currentUser.displayName || '');
          if (data.notifications) setNotifications(data.notifications);
          if (data.theme) setTheme(data.theme);
          if (data.privacy) setPrivacy(data.privacy);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [currentUser, navigate]);

  // Save user data to Firestore
  const saveToFirestore = async (updates) => {
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), updates);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  // Profile save
  const handleSaveProfile = async () => {
    if (!name.trim()) { toast.error(t('settings.nameEmpty') || 'Name empty'); return; }
    setSaving(true);
    try {
      await updateProfile(currentUser, { displayName: name.trim() });
      await saveToFirestore({ name: name.trim() });
      setUserData(prev => ({ ...prev, name: name.trim() }));
      toast.success(t('settings.profileSaved') || 'Profile saved');
    } catch (e) {
      toast.error(t('settings.error') || 'Error');
    }
    setSaving(false);
  };

  // Password change
  const handleChangePassword = async () => {
    if (password.length < 6) { toast.error(t('settings.passwordTooShort') || 'Min 6 chars'); return; }
    if (password !== confirmPassword) { toast.error(t('settings.passwordMismatch') || 'Passwords mismatch'); return; }
    setSaving(true);
    try {
      await updatePassword(currentUser, password);
      setPassword('');
      setConfirmPassword('');
      toast.success(t('settings.passwordChanged') || 'Password changed');
    } catch (e) {
      if (e.code === 'auth/requires-recent-login') {
        toast.error(t('settings.recentLogin') || 'Please re-login first');
      } else {
        toast.error(e.message);
      }
    }
    setSaving(false);
  };

  // Password reset
  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      toast.success(t('settings.resetEmailSent') || 'Reset email sent');
    } catch (e) {
      toast.error(e.message);
    }
  };

  // Language change
  const handleChangeLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('lang', code);
    saveToFirestore({ language: code });
    toast.success(t('settings.languageChanged') || 'Language changed');
  };

  // Notification toggle
  const handleToggleNotification = async (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    await saveToFirestore({ notifications: updated });
  };

  // Theme change
  const handleChangeTheme = async (newTheme) => {
    setTheme(newTheme);
    await saveToFirestore({ theme: newTheme });
    toast.success(t('settings.themeChanged') || 'Theme changed');
  };

  // Accent change
  const handleChangeAccent = async (newAccent) => {
    setAccentColor(newAccent);
    await saveToFirestore({ accentColor: newAccent });
    toast.success(t('settings.accentChanged') || 'Accent changed');
  };

  // Privacy toggle
  const handleTogglePrivacy = async (key) => {
    const updated = { ...privacy, [key]: !privacy[key] };
    setPrivacy(updated);
    await saveToFirestore({ privacy: updated });
  };

  // Delete account
  const handleDeleteAccount = async () => {
    const confirmText = t('settings.deleteConfirmText') || 'DELETE';
    const input = prompt(t('settings.deletePrompt') || 'Type DELETE to confirm:');
    if (input !== confirmText) {
      toast.error(t('settings.deleteCancelled') || 'Cancelled');
      return;
    }
    try {
      await deleteUser(currentUser);
      toast.success(t('settings.accountDeleted') || 'Account deleted');
      navigate('/');
    } catch (e) {
      if (e.code === 'auth/requires-recent-login') {
        toast.error(t('settings.recentLogin') || 'Please re-login first');
      } else {
        toast.error(e.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-dng-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-20 px-4 relative overflow-hidden">
      <Toaster position="top-center" toastOptions={{ style: { background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
          <button onClick={() => navigate('/profile')} className="p-2.5 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
            <Icons.ArrowLeft />
          </button>
          <h1 className="text-2xl font-bold text-white tracking-tight">{t('settings.title') || 'Settings'}</h1>
          <div className="w-10" />
        </motion.div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full md:w-56 shrink-0 space-y-1">
            {TABS.map(tab => {
              const IconCmp = Icons[tab.icon];
              const isActive = activeTab === tab.id;
              const isDanger = tab.id === 'danger';
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? isDanger
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <IconCmp />
                  <span className="flex-1 text-left">{t(`settings.${tab.label}`) || tab.id}</span>
                </button>
              );
            })}
          </motion.div>

          {/* Content */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-white mb-6">{t('settings.profileHeading') || 'Profile Information'}</h2>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">{t('settings.email') || 'Email'}</label>
                      <input type="email" disabled value={currentUser?.email || ''} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed" />
                      <p className="text-xs text-gray-600 mt-1">{t('settings.emailCannotChange') || 'Email cannot be changed'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">{t('settings.name') || 'Name'}</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} maxLength={50} placeholder={t('settings.namePlaceholder') || 'Your name'} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all" />
                    </div>
                    <button onClick={handleSaveProfile} disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all disabled:opacity-50">
                      <Icons.Save /> {saving ? t('settings.saving') || 'Saving...' : t('settings.save') || 'Save'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SECURITY TAB */}
              {activeTab === 'security' && (
                <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-white mb-6">{t('settings.changePassword') || 'Change Password'}</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">{t('settings.newPassword') || 'New Password'}</label>
                        <div className="relative">
                          <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 pr-12 text-white focus:border-blue-500 outline-none transition-all" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                            {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">{t('settings.confirmPassword') || 'Confirm Password'}</label>
                        <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all" />
                      </div>
                      <button onClick={handleChangePassword} disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all disabled:opacity-50">
                        <Icons.Lock /> {saving ? t('settings.saving') || 'Saving...' : t('settings.changePasswordBtn') || 'Change'}
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-white mb-4">{t('settings.forgotPassword') || 'Forgot Password?'}</h2>
                    <p className="text-gray-400 text-sm mb-4">{t('settings.forgotDesc') || 'Send a reset link to your email'}</p>
                    <button onClick={handleResetPassword} className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all">
                      <Icons.Globe /> {t('settings.sendResetEmail') || 'Send Reset Email'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* LANGUAGE TAB */}
              {activeTab === 'language' && (
                <motion.div key="language" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-white mb-6">{t('settings.languageHeading') || 'Language'}</h2>
                  <div className="space-y-3">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => handleChangeLanguage(lang.code)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                          i18n.language === lang.code
                            ? 'bg-blue-500/10 border-blue-500/40'
                            : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                        }`}
                      >
                        <span className="text-3xl">{lang.flag}</span>
                        <div className="flex-1 text-left">
                          <p className="text-white font-bold">{lang.native}</p>
                          <p className="text-xs text-gray-500">{lang.label}</p>
                        </div>
                        {i18n.language === lang.code && (
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white">
                            <Icons.Check />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === 'notifications' && (
                <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-white mb-6">{t('settings.notificationsHeading') || 'Notifications'}</h2>
                  <div className="space-y-3">
                    {[
                      { key: 'emailOrders', label: t('settings.emailOrders') || 'Email: New Orders' },
                      { key: 'emailReports', label: t('settings.emailReports') || 'Email: Daily Reports' },
                      { key: 'emailMarketing', label: t('settings.emailMarketing') || 'Email: Marketing' },
                      { key: 'pushMessages', label: t('settings.pushMessages') || 'Push: Messages' },
                      { key: 'pushReminders', label: t('settings.pushReminders') || 'Push: Reminders' },
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                        <span className="text-white text-sm font-medium">{item.label}</span>
                        <button
                          onClick={() => handleToggleNotification(item.key)}
                          className={`relative w-12 h-6 rounded-full transition-all ${notifications[item.key] ? 'bg-blue-500' : 'bg-gray-700'}`}
                        >
                          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${notifications[item.key] ? 'left-6' : 'left-0.5'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* APPEARANCE TAB */}
              {activeTab === 'appearance' && (
                <motion.div key="appearance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-white mb-6">{t('settings.theme') || 'Theme'}</h2>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'dark', label: 'Dark', icon: '🌙' },
                        { id: 'light', label: 'Light', icon: '☀️' },
                        { id: 'auto', label: 'Auto', icon: '⚙️' },
                      ].map(item => (
                        <button
                          key={item.id}
                          onClick={() => handleChangeTheme(item.id)}
                          className={`p-4 rounded-2xl border transition-all ${
                            theme === item.id
                              ? 'bg-blue-500/10 border-blue-500/40'
                              : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                          }`}
                        >
                          <div className="text-3xl mb-2">{item.icon}</div>
                          <p className="text-sm font-bold text-white">{item.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-white mb-6">{t('settings.accentColor') || 'Accent Color'}</h2>
                    <div className="grid grid-cols-5 gap-3">
                      {[
                        { id: 'blue', color: 'bg-blue-500' },
                        { id: 'cyan', color: 'bg-cyan-500' },
                        { id: 'purple', color: 'bg-purple-500' },
                        { id: 'amber', color: 'bg-amber-500' },
                        { id: 'emerald', color: 'bg-emerald-500' },
                      ].map(item => (
                        <button
                          key={item.id}
                          onClick={() => handleChangeAccent(item.id)}
                          className={`aspect-square rounded-2xl ${item.color} relative transition-all hover:scale-105 ${
                            accentColor === item.id ? 'ring-4 ring-white/30' : ''
                          }`}
                        >
                          {accentColor === item.id && (
                            <div className="absolute inset-0 flex items-center justify-center text-white">
                              <Icons.Check />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* PRIVACY TAB */}
              {activeTab === 'privacy' && (
                <motion.div key="privacy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-white mb-6">{t('settings.privacyHeading') || 'Privacy'}</h2>
                  <div className="space-y-3">
                    {[
                      { key: 'publicProfile', label: t('settings.publicProfile') || 'Public profile' },
                      { key: 'showStats', label: t('settings.showStats') || 'Show my stats publicly' },
                      { key: 'dataAnalytics', label: t('settings.dataAnalytics') || 'Share analytics data' },
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                        <span className="text-white text-sm font-medium">{item.label}</span>
                        <button
                          onClick={() => handleTogglePrivacy(item.key)}
                          className={`relative w-12 h-6 rounded-full transition-all ${privacy[item.key] ? 'bg-blue-500' : 'bg-gray-700'}`}
                        >
                          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${privacy[item.key] ? 'left-6' : 'left-0.5'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* DANGER TAB */}
              {activeTab === 'danger' && (
                <motion.div key="danger" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                      <Icons.Trash />
                    </div>
                    <h2 className="text-xl font-bold text-red-400">{t('settings.dangerHeading') || 'Danger Zone'}</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                      <p className="text-white font-bold mb-1">{t('settings.deleteAccount') || 'Delete Account'}</p>
                      <p className="text-sm text-gray-400 mb-3">{t('settings.deleteDesc') || 'This will permanently delete your account and all data. This cannot be undone.'}</p>
                      <button onClick={handleDeleteAccount} className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-sm rounded-xl transition-all">
                        {t('settings.deleteBtn') || 'Delete My Account'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}