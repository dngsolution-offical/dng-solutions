// src/components/ui/ActivePackageBadge.jsx
// Shows active package everywhere with distinct styling
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFreeTrial } from '../../hooks/useFreeTrial';

const PACKAGE_THEME = {
  Free: {
    label: 'Free',
    labelRu: 'Бесплатный',
    labelKa: 'უფასო',
    color: 'text-gray-300',
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/30',
    grad: 'from-gray-500 to-gray-700',
    dot: 'bg-gray-400',
    icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7',
  },
  Basic: {
    label: 'Basic',
    labelRu: 'Базовый',
    labelKa: 'ბაზისური',
    color: 'text-blue-300',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/40',
    grad: 'from-blue-500 to-cyan-500',
    dot: 'bg-blue-400',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  Gold: {
    label: 'Gold',
    labelRu: 'Золотой',
    labelKa: 'ოქრო',
    color: 'text-amber-300',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/40',
    grad: 'from-amber-400 to-orange-500',
    dot: 'bg-amber-400',
    icon: 'M3 17l3-10 4 6 2-8 2 8 4-6 3 10H3z',
  },
  Diamond: {
    label: 'Diamond',
    labelRu: 'Алмазный',
    labelKa: 'ალმასი',
    color: 'text-purple-300',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/40',
    grad: 'from-purple-500 to-pink-500',
    dot: 'bg-purple-400',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  },
  Infinity: {
    label: 'Infinity',
    labelRu: 'Безлимит',
    labelKa: 'უსასრულო',
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/40',
    grad: 'from-emerald-400 to-teal-500',
    dot: 'bg-emerald-400',
    icon: 'M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z',
  },
};

export default function ActivePackageBadge({ size = 'md', showIcon = true, showDaysLeft = false, language = 'en' }) {
  const { currentUser } = useAuth();
  const { trialData, timeLeft } = useFreeTrial(currentUser?.uid);

  const pkg = trialData?.package || 'Free';
  const isExpired = trialData?.isExpired;
  const theme = PACKAGE_THEME[pkg] || PACKAGE_THEME.Free;

  // Size classes
  const sizes = {
    sm: { pill: 'px-2 py-0.5 text-[10px]', icon: 'w-3 h-3', dot: 'w-1.5 h-1.5' },
    md: { pill: 'px-3 py-1 text-xs', icon: 'w-3.5 h-3.5', dot: 'w-2 h-2' },
    lg: { pill: 'px-4 py-1.5 text-sm', icon: 'w-4 h-4', dot: 'w-2 h-2' },
  };
  const s = sizes[size] || sizes.md;

  // Label based on language
  const label = language === 'ru' ? theme.labelRu : language === 'ka' ? theme.labelKa : theme.label;

  return (
    <div className={`inline-flex items-center gap-1.5 ${s.pill} rounded-full ${theme.bg} ${theme.border} border font-bold uppercase tracking-wider ${theme.color}`}>
      <span className={`${s.dot} rounded-full ${theme.dot} animate-pulse`} />
      {showIcon && (
        <svg className={s.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={theme.icon} />
        </svg>
      )}
      <span>{label}</span>
      {isExpired && <span className="text-red-400">!</span>}
      {showDaysLeft && timeLeft && !isExpired && pkg !== 'Free' && (
        <span className="text-gray-500 font-normal normal-case ml-1">
          ({timeLeft.days}d)
        </span>
      )}
    </div>
  );
}