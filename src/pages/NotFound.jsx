import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const NotFound = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.08),transparent_50%)] pointer-events-none" />
      
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center relative">
        <h1 className="text-[120px] sm:text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-r from-dng-blue to-dng-cyan leading-none mb-4">
          404
        </h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{t('notFound.title') || 'Page not found'}</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">{t('notFound.desc') || 'The page you are looking for does not exist.'}</p>
        <Link to="/" className="inline-block px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all">
          {t('notFound.backHome') || 'Back to Home'}
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;