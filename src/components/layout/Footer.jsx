import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.services'), path: '/services' },
    { name: t('nav.packages'), path: '/packages' },
    { name: t('nav.about'), path: '/about' },
    { name: t('nav.contact'), path: '/contact' },
  ];

  const servicesLinks = [
    { name: t('footer.s1'), path: '/services' },
    { name: t('footer.s2'), path: '/services' },
    { name: t('footer.s3'), path: '/services' },
    { name: t('footer.s4'), path: '/services' },
    { name: t('footer.s5'), path: '/services' },
  ];

  const socialLinks = [
    { name: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61596586850292', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
    { name: 'Instagram', url: 'https://www.instagram.com/dng.solutions', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
    { name: 'TikTok', url: 'https://www.tiktok.com/@dng_solution', icon: 'M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z' },
  ];

  return (
    <footer className="bg-[#020205] border-t border-white/5 pt-16 pb-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(37,99,235,0.05),transparent_50%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Column 1: Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4 group">
              <img
                src="/logo8.webp"
                alt="DNG Solutions"
                className="h-10 w-10 object-cover rounded-full border-2 border-white/10 group-hover:border-dng-cyan/50 transition-colors"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="flex flex-col leading-none">
                <span className="text-white font-extrabold text-lg">DNG <span className="text-dng-cyan">Solutions</span></span>
                <span className="text-[9px] text-gray-500 tracking-[0.2em] uppercase mt-1">AI Automation</span>
              </div>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              {t('footer.desc')}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-dng-cyan/30 transition-all"
                  aria-label={social.name}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-5 text-sm uppercase tracking-wider">{t('footer.quickLinks')}</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-dng-cyan text-sm transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-dng-cyan transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
            <h3 className="text-white font-bold mb-5 text-sm uppercase tracking-wider">{t('footer.services')}</h3>
            <ul className="space-y-3">
              {servicesLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-dng-cyan text-sm transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-dng-cyan transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="text-white font-bold mb-5 text-sm uppercase tracking-wider">{t('footer.contact')}</h3>
            <ul className="space-y-4">
              <li>
                <a href="mailto:dng.solution01@gmail.com" className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-dng-cyan/10 flex items-center justify-center text-dng-cyan shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{t('contactPage.emailLabel')}</p>
                    <p className="text-sm text-white group-hover:text-dng-cyan transition-colors">dng.solution01@gmail.com</p>
                  </div>
                </a>
              </li>
              <li>
                <a href="tel:+995551071451" className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{t('contactPage.phone2Label')}</p>
                    <p className="text-sm text-white group-hover:text-dng-cyan transition-colors">+995 551 071 451</p>
                  </div>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs text-center md:text-left">
            © {currentYear} DNG Solutions. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-gray-500 hover:text-white text-xs transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link to="/terms" className="text-gray-500 hover:text-white text-xs transition-colors">
              {t('footer.terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;