import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import SectionTitle from '../ui/SectionTitle';
import Card from '../ui/Card';

const FeaturesSection = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: t('features.f1Title'),
      description: t('features.f1Desc'),
      color: 'blue',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      title: t('features.f2Title'),
      description: t('features.f2Desc'),
      color: 'cyan',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: t('features.f3Title'),
      description: t('features.f3Desc'),
      color: 'blue',
    },
  ];

  return (
    <section className="relative py-24 bg-dng-dark overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-dng-blue/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle badge={t('features.badge')} title={t('features.title')} highlight={t('features.highlight')} description={t('features.desc')} />
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {features.map((feature, i) => (
            <Card key={i} delay={i * 0.15} className="p-8 group">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${feature.color === 'cyan' ? 'bg-dng-cyan/10 border border-dng-cyan/30 text-dng-cyan' : 'bg-dng-blue/10 border border-dng-blue/30 text-dng-blue'}`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-dng-gray leading-relaxed text-sm">{feature.description}</p>
              <div className="mt-6 h-0.5 w-12 rounded-full bg-gradient-to-r from-dng-blue to-dng-cyan group-hover:w-24 transition-all duration-500" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
