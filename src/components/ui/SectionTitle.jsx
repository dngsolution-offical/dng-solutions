import React from 'react';
import { motion } from 'framer-motion';

const SectionTitle = ({
  badge,
  title,
  highlight,
  description,
  align = 'center',
  className = '',
}) => {
  const alignment =
    align === 'left' ? 'text-left items-start' : 'text-center items-center';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`flex flex-col gap-4 ${alignment} ${className}`}
    >
      {/* Badge */}
      {badge && (
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-dng-blue/30 bg-dng-blue/10 text-dng-cyan text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-dng-cyan animate-pulse" />
          {badge}
        </div>
      )}

      {/* Title */}
      {title && (
        <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight text-balance">
          {title}{' '}
          {highlight && (
            <span className="gradient-text">{highlight}</span>
          )}
        </h2>
      )}

      {/* Description */}
      {description && (
        <p
          className={`text-lg text-dng-gray max-w-2xl leading-relaxed ${
            align === 'center' ? 'mx-auto' : ''
          }`}
        >
          {description}
        </p>
      )}
    </motion.div>
  );
};

export default SectionTitle;
