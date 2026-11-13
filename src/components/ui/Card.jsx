import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hover = true,
  glow = false,
  glowColor = 'blue',
  delay = 0,
  ...props
}) => {
  const glowColorClass =
    glowColor === 'cyan'
      ? 'hover:shadow-[0_0_40px_rgba(0,212,255,0.2)]'
      : 'hover:shadow-[0_0_40px_rgba(0,102,255,0.2)]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { y: -6 } : {}}
      className={`
        relative
        bg-white/[0.03] backdrop-blur-xl
        border border-white/10
        rounded-2xl
        transition-all duration-500
        ${hover ? `hover:bg-white/[0.06] hover:border-white/20 ${glowColorClass}` : ''}
        ${glow ? 'shadow-[0_0_30px_rgba(0,102,255,0.1)]' : ''}
        ${className}
      `}
      {...props}
    >
      {/* შიდა ნათების ეფექტი */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default Card;
