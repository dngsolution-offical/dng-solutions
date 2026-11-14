// src/pages/Profile.jsx — Full redesigned profile page (3 languages)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore/lite';
import { toast } from 'react-hot-toast';

// ─── ICONS ───
const Icon = ({ d, className = 'w-5 h-5', sw = 2 }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Icons = {
  User: () => <Icon d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
  Mail: () => <Icon d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
  Calendar: () => <Icon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
  Package: () => <Icon d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
  Edit: () => <Icon d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" sw={2} />,
  LogOut: () => <Icon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />,
  ArrowLeft: () => <Icon d="M10 19l-7-7m0 0l7-7m-7 7h18" />,
  Settings: () => <Icon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
  Check: () => <Icon d="M5 13l4 4L19 7" sw={2.5} />,
  Crown: () => <Icon d="M3 17l3-10 4 6 2-8 2 8 4-6 3 10H3z" />,
  Shield: () => <Icon d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
  Chart: () => <Icon d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
};

const THEME = {
  Free: { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30', grad: 'from-gray-500 to-gray-700', icon: '👤' },
  Basic: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', grad: 'from-blue-500 to-cyan-500', icon: '⚡' },
  Gold: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', grad: 'from-amber-400 to-orange-500', icon: '👑' },
  Diamond: { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', grad: 'from-purple-500 to-pink-500', icon: '💎' },
  Infinity: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', grad: 'from-emerald-400 to-teal-500', icon: '♾️' },
};

export default function Profile() {
  const { t, i18n } = useTranslation();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentUser) { navigate('/login'); return; }
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', currentUser.uid));
        if (snap.exists()) {
          setUserData(snap.data());
          setNewName(snap.data().name || '');
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [currentUser, navigate]);

  const handleSave = async () => {
    if (!newName.trim()) {
      toast.error(t('profilePage.nameEmpty') || 'Name cannot be empty');
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { name: newName.trim() });
      setUserData(prev => ({ ...prev, name: newName.trim() }));
      setEditing(false);
      toast.success(t('profilePage.nameUpdated') || 'Name updated');
    } catch (e) {
      toast.error(t('profilePage.error') || 'Error');
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    if (!confirm(t('profilePage.confirmLogout') || 'Logout?')) return;
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-dng-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pkg = userData?.package || 'Free';
  const isPremium = pkg !== 'Free';
  const theme = THEME[pkg] || THEME.Free;
  const initial = (userData?.name || currentUser?.displayName || currentUser?.email || 'U')[0]?.toUpperCase();
  const displayName = userData?.name || currentUser?.displayName || (currentUser?.email?.split('@')[0]) || 'User';

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-20 px-4 relative overflow-hidden">

      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-b ${theme.grad} opacity-[0.05] blur-3xl`} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2.5 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
            <Icons.ArrowLeft />
          </button>
          <h1 className="text-2xl font-bold text-white tracking-tight">{t('profilePage.title') || 'Profile'}</h1>
          <button onClick={handleLogout} className="p-2.5 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all" title={t('profilePage.logout') || 'Logout'}>
            <Icons.LogOut />
          </button>
        </motion.div>

        {/* Hero Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="relative bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sm:p-8 mb-6 overflow-hidden">
          <div className={`absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-br ${theme.grad} opacity-10 blur-3xl`} />

          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${theme.grad} flex items-center justify-center shadow-2xl`}>
                <span className="text-4xl font-black text-white">{initial}</span>
              </div>
              <div className={`absolute -bottom-2 -right-2 px-2.5 py-1 rounded-lg ${theme.bg} border ${theme.border} backdrop-blur-md`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.color}`}>{pkg}</span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              {editing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    maxLength={50}
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-dng-cyan/50"
                    placeholder={t('profilePage.namePlaceholder') || 'Your name'}
                  />
                  <div className="flex gap-2 justify-center sm:justify-start">
                    <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-white text-black font-semibold text-sm rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50">
                      {saving ? '...' : (t('profilePage.save') || 'Save')}
                    </button>
                    <button onClick={() => setEditing(false)} className="px-5 py-2 bg-white/5 text-gray-400 font-semibold text-sm rounded-xl hover:bg-white/10 transition-all">
                      {t('profilePage.cancel') || 'Cancel'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-1 truncate">{displayName}</h2>
                  <p className="text-gray-500 text-sm mb-4 truncate">{currentUser?.email}</p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <button onClick={() => setEditing(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-all">
                      <Icons.Edit /> {t('profilePage.edit') || 'Edit'}
                    </button>
                    <button onClick={() => navigate('/settings')} className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-all">
                      <Icons.Settings /> {t('profilePage.settings') || 'Settings'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl ${theme.bg} flex items-center justify-center ${theme.color} mb-3`}>
              <Icons.Package />
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">{t('profilePage.package') || 'Package'}</p>
            <p className={`text-xl font-bold ${theme.color}`}>{pkg}</p>
            {!isPremium && (
              <button onClick={() => navigate('/packages')} className="mt-2 text-xs text-dng-cyan font-semibold hover:underline">
                {t('profilePage.upgrade') || 'Upgrade'} →
              </button>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 mb-3">
              <Icons.Calendar />
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">{t('profilePage.memberSince') || 'Member since'}</p>
            <p className="text-lg font-bold text-white">
              {userData?.createdAt?.toDate?.().toLocaleDateString(i18n.language) || '—'}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-3">
              <Icons.Chart />
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">{t('profilePage.ordersUsed') || 'Orders used'}</p>
            <p className="text-xl font-bold text-white">{userData?.ordersUsed || 0}</p>
          </motion.div>
        </div>

        {/* Security */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Icons.Shield />
            </div>
            <h3 className="text-white font-bold">{t('profilePage.security') || 'Security'}</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
              <span className="text-sm text-gray-400">{t('profilePage.emailVerified') || 'Email verified'}</span>
              {currentUser?.emailVerified ? (
                <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                  <Icons.Check /> {t('profilePage.verified') || 'Verified'}
                </span>
              ) : (
                <span className="text-amber-400 text-xs font-bold">{t('profilePage.notVerified') || 'Not verified'}</span>
              )}
            </div>
            <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
              <span className="text-sm text-gray-400">{t('profilePage.accountStatus') || 'Account status'}</span>
              <span className="text-emerald-400 text-xs font-bold">{t('profilePage.active') || 'Active'}</span>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-3">
          <button onClick={() => navigate('/settings')} className="w-full flex items-center justify-between p-4 bg-[#0A0A0A] border border-white/5 rounded-2xl hover:bg-white/[0.03] transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                <Icons.Settings />
              </div>
              <span className="text-white font-medium text-sm">{t('profilePage.settings') || 'Settings'}</span>
            </div>
            <svg className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>

          <button onClick={() => navigate('/packages')} className="w-full flex items-center justify-between p-4 bg-[#0A0A0A] border border-white/5 rounded-2xl hover:bg-white/[0.03] transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Icons.Crown />
              </div>
              <span className="text-white font-medium text-sm">{t('profilePage.upgradePlan') || 'Upgrade plan'}</span>
            </div>
            <svg className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>

          <button onClick={() => navigate('/')} className="w-full flex items-center justify-between p-4 bg-[#0A0A0A] border border-white/5 rounded-2xl hover:bg-white/[0.03] transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                <Icons.ArrowLeft />
              </div>
              <span className="text-white font-medium text-sm">{t('profilePage.backHome') || 'Back to home'}</span>
            </div>
            <svg className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>

          <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 bg-red-500/5 border border-red-500/20 rounded-2xl hover:bg-red-500/10 transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
                <Icons.LogOut />
              </div>
              <span className="text-red-400 font-medium text-sm">{t('profilePage.logout') || 'Logout'}</span>
            </div>
          </button>
        </motion.div>
      </div>
    </div>
  );
}