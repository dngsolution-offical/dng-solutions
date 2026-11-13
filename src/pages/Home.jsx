import React from 'react';
import { motion } from 'framer-motion';
import HeroSection from '../components/sections/HeroSection';
import FeaturesSection from '../components/sections/FeaturesSection';
import StatsSection from '../components/sections/StatsSection';
import PackagesPreview from '../components/sections/PackagesPreview';
import ReportBanner from '../components/sections/ReportBanner';
import CTASection from '../components/sections/CTASection';

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#050505] overflow-hidden"
    >
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <PackagesPreview />
      <ReportBanner />
      <CTASection />
    </motion.div>
  );
}