import React from 'react';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.05),transparent_50%)] pointer-events-none" />
      <div className="relative max-w-4xl mx-auto">
        <Link to="/" className="inline-block text-sm text-gray-500 hover:text-white mb-8 transition-colors">
          ← Back to Home
        </Link>
        
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-8">Last updated: November 11, 2026</p>
        
        <div className="prose prose-invert prose-sm max-w-none text-gray-400 space-y-6 leading-relaxed">
          <p>This Privacy Policy explains how DNG Solutions ("we") collects, uses, and protects your personal information when you use our website and AI automation services.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-3">1. Information We Collect</h2>
          <p>We collect: personal information (name, email), usage data (orders, AI requests), and technical data (IP, browser).</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-3">2. How We Use Information</h2>
          <p>We use information to provide the Service, manage accounts, provide support, and improve the Service.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-3">3. Data Security</h2>
          <p>Your data is stored securely on Google Firebase servers with SSL/TLS encryption.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-3">4. Third-Party Services</h2>
          <p>We use Firebase (authentication), Claude API (AI), EmailJS (email), and Quickpay (payment).</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-3">5. Cookies</h2>
          <p>We use cookies for language preferences and traffic analysis.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-3">6. Your Rights</h2>
          <p>You have the right to view, correct, or delete your data: <a href="mailto:dng.solution01@gmail.com" className="text-dng-cyan">dng.solution01@gmail.com</a>.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-3">7. Changes</h2>
          <p>We reserve the right to change this policy. Changes take effect upon publication.</p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;