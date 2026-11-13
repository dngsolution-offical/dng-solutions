import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  onClick,
  className = '',
  icon,
  ...props
}) => {
  // ვარიანტების სტილები
  const variants = {
    primary:
      'bg-gradient-to-r from-dng-blue to-blue-600 text-white font-bold shadow-[0_0_20px_rgba(0,102,255,0.4)] hover:shadow-[0_0_35px_rgba(0,102,255,0.7)]',
    secondary:
      'border-2 border-white/20 text-white font-bold hover:border-dng-cyan hover:bg-white/5 hover:shadow-[0_0_25px_rgba(0,212,255,0.25)]',
    ghost:
      'text-dng-cyan font-semibold hover:text-white hover:bg-white/5',
    cyan:
      'bg-gradient-to-r from-dng-cyan to-dng-blue text-white font-bold shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:shadow-[0_0_35px_rgba(0,212,255,0.7)]',
  };

  // ზომების სტილები
  const sizes = {
    sm: 'px-5 py-2.5 text-sm rounded-lg',
    md: 'px-7 py-3.5 text-base rounded-xl',
    lg: 'px-9 py-4 text-lg rounded-xl',
  };

  const baseClasses = `inline-flex items-center justify-center gap-2 transition-all duration-300 ${variants[variant]} ${sizes[size]} ${className}`;

  const content = (
    <>
      {children}
      {icon && <span className="flex-shrink-0">{icon}</span>}
    </>
  );

  // თუ არის "to" prop, გამოვიყენებთ React Router Link-ს
  if (to) {
    return (
      <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
        <Link to={to} className={baseClasses} {...props}>
          {content}
        </Link>
      </motion.div>
    );
  }

  // თუ არის "href", ჩვეულებრივი <a> ტეგი
  if (href) {
    return (
      <motion.a
        href={href}
        className={baseClasses}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        {...props}
      >
        {content}
      </motion.a>
    );
  }

  // ჩვეულებრივი ღილაკი
  return (
    <motion.button
      onClick={onClick}
      className={baseClasses}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      {...props}
    >
      {content}
    </motion.button>
  );
};

export default Button;
