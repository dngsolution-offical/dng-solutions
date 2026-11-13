import React from 'react';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.05),transparent_50%)] pointer-events-none" />
      <div className="relative max-w-4xl mx-auto">
        <Link to="/" className="inline-block text-sm text-gray-500 hover:text-white mb-8 transition-colors">
          ← Back to Home
        </Link>
        
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">Terms of Service</h1>
        <p className="text-gray-500 text-sm mb-8">Last updated: November 11, 2026</p>
        
        <div className="prose prose-invert prose-sm max-w-none text-gray-400 space-y-6 leading-relaxed">
          <p>These Terms of Service ("Terms") govern your access to and use of the DNG Solutions website and services ("Service"). By using the site, you agree to these Terms. If you do not agree, please stop using the Service.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-3">1. Use of Service</h2>
          <p>You must be at least 18 years old to use our Service. You must provide accurate, complete, and updated information during registration. You are responsible for the confidentiality of your account and all activity that occurs under your account.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-3">2. Prohibited Actions</h2>
          <p>You may not:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Use the Service for illegal or unauthorized purposes.</li>
            <li>Attempt unauthorized access to the system (hacking, SQL injection, XSS).</li>
            <li>Obtain or modify other users' data.</li>
            <li>Use automated scripts to overload the Service (violating Rate Limits).</li>
            <li>Resell or transfer your account to third parties.</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8 mb-3">3. Intellectual Property</h2>
          <p>All content on the site (design, code, logo, text, graphics) belongs to DNG Solutions or its licensors. Copying, distribution, or commercial use is prohibited without written permission.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-3">4. Limitation of Liability</h2>
          <p>Our AI Service operates "As-Is". We are not responsible for the accuracy of AI-processed data. Users must independently verify AI results.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-3">5. Termination</h2>
          <p>We reserve the right to terminate, restrict, or block your account without prior notice if you violate these Terms.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-3">6. Changes</h2>
          <p>We reserve the right to change these Terms at any time. Changes take effect upon publication on the site.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-3">7. Contact</h2>
          <p>For questions, contact us: <a href="mailto:dng.solution01@gmail.com" className="text-dng-cyan">dng.solution01@gmail.com</a></p>
        </div>
      </div>
    </div>
  );
};

export default Terms;