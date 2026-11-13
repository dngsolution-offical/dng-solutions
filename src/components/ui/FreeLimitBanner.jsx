import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// 🎨 SVG იკონები
const Icons = {
  Gift: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>,
  Alert: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  ArrowRight: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>,
};

const FreeLimitBanner = ({ trialData }) => {
  const { t } = useTranslation();
  if (!trialData) return null;
  if (trialData.package !== 'Free' && !trialData.isExpired && !trialData.isLimitReached) return null;

  const { isActive, isExpired, isLimitReached, daysLeft, ordersLeft } = trialData;

  // 🚨 ლიმიტი ამოიწურა (წითელი)
  if (isExpired || isLimitReached) {
    return (
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
              <Icons.Alert />
            </div>
            <div>
              <p className="text-red-400 font-bold text-base">
                {isExpired ? t('banner.expired') : t('banner.limitReached')}
              </p>
              <p className="text-gray-400 text-sm mt-1">{t('banner.upgradeDesc')}</p>
            </div>
          </div>
          <Link to="/packages" className="px-5 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 font-semibold text-sm rounded-xl hover:bg-red-500/20 transition-all whitespace-nowrap flex items-center gap-2">
            {t('banner.upgradeBtn')} <Icons.ArrowRight />
          </Link>
        </div>
      </motion.div>
    );
  }

  // 🎁 აქტიური (ყვითელი)
  if (isActive) {
    return (
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-5 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-400 shrink-0">
              <Icons.Gift />
            </div>
            <div>
              <p className="text-yellow-400 font-bold text-base">{t('banner.freePackage')}</p>
              <p className="text-gray-400 text-sm mt-0.5">
                {daysLeft} {t('banner.daysLeft')} · {ordersLeft} {t('banner.ordersLeft')}
              </p>
            </div>
          </div>
          <Link to="/packages" className="px-5 py-2.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-semibold text-sm rounded-xl hover:bg-yellow-500/20 transition-all whitespace-nowrap flex items-center gap-2">
            {t('banner.premiumBtn')} <Icons.ArrowRight />
          </Link>
        </div>
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
            style={{ width: `${Math.max(0, Math.min(100, (ordersLeft / 10) * 100))}%` }}
          />
        </div>
      </motion.div>
    );
  }
  return null;
};

export default FreeLimitBanner;