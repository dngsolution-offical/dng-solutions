// src/pages/Checkout.jsx — Beautiful checkout with test mode
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Icons = {
  Check: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>,
  Shield: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Loader: () => <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>,
  ArrowLeft: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Gift: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>,
  Lock: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
};

const PACKAGES = {
  basic: {
    name: 'Basic',
    icon: '⚡',
    gradient: 'from-blue-500 to-cyan-500',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    features: ['100 orders/month', '1 AI Agent', 'File upload 5MB', 'Email support'],
  },
  gold: {
    name: 'Gold',
    icon: '👑',
    gradient: 'from-amber-400 to-orange-500',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    features: ['500 orders/month', '4 AI Agents', 'File upload 10MB', 'Priority support'],
  },
  diamond: {
    name: 'Diamond',
    icon: '💎',
    gradient: 'from-purple-500 to-pink-500',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    features: ['2000 orders/month', '7 AI Agents', 'File upload 25MB', '24/7 Support'],
  },
  infinity: {
    name: 'Infinity',
    icon: '♾️',
    gradient: 'from-emerald-400 to-teal-500',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    features: ['Unlimited orders', 'All AI Agents', 'File upload 100MB', 'Dedicated manager'],
  },
};

export default function Checkout() {
  const { t } = useTranslation();
  const { packageId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const billing = searchParams.get('billing') || 'monthly';
  const pkgData = PACKAGES[packageId?.toLowerCase()] || PACKAGES.basic;

  const handlePay = async () => {
    if (!currentUser) { navigate('/login'); return; }
    setLoading(true);

    try {
      const res = await fetch('/api/quickpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: packageId.toLowerCase(),
          billingCycle: billing,
          userId: currentUser.uid,
          userEmail: currentUser.email,
        }),
      });

      const data = await res.json();

      if (data.ok && data.testMode && data.activated) {
        setSuccess(data);
        toast.success(`✅ ${data.package} activated!`, {
          duration: 3000,
          icon: '🎉',
        });
        setTimeout(() => navigate('/dashboard'), 2500);
        return;
      }

      if (data.ok && data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }

      toast.error(data.message || data.error || 'Payment failed');
    } catch (err) {
      console.error('[checkout] Error:', err);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br ${pkgData.gradient} opacity-[0.06] blur-[120px] rounded-full`} />
        <div className={`absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl ${pkgData.gradient} opacity-[0.06] blur-[120px] rounded-full`} />
      </div>

      <Toaster position="top-center" toastOptions={{
        style: { background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-lg w-full relative z-10"
      >
        {/* Back button */}
        <Link to="/packages" className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-4 transition-colors group">
          <Icons.ArrowLeft />
          <span className="group-hover:translate-x-1 transition-transform">Back to packages</span>
        </Link>

        {/* Main card */}
        <div className="relative bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          {/* Top gradient bar */}
          <div className={`h-1.5 bg-gradient-to-r ${pkgData.gradient}`} />

          <div className="p-6 sm:p-8">
            {/* Security badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                <Icons.Shield />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Secure Checkout</span>
              </div>
            </div>

            {/* Package header */}
            <div className="text-center mb-8">
              <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${pkgData.gradient} flex items-center justify-center text-4xl mb-4 shadow-2xl`}>
                {pkgData.icon}
              </div>
              <h1 className="text-3xl font-black text-white mb-1">{pkgData.name}</h1>
              <p className="text-gray-400 text-sm capitalize">{billing} plan</p>
            </div>

            {/* Success state */}
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center mb-4">
                    <div className="text-emerald-400">
                      <Icons.Check />
                    </div>
                  </div>
                  <h2 className="text-2xl font-black text-white mb-2">🎉 Success!</h2>
                  <p className="text-emerald-400 font-bold mb-2">{success.package} Activated</p>
                  <p className="text-gray-400 text-sm mb-4">
                    {success.days} days · {success.amountGEL}₾
                  </p>
                  <p className="text-xs text-gray-500">Redirecting to dashboard...</p>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 1 }}>
                  {/* Features list */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 mb-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-3">What's included</p>
                    <ul className="space-y-2">
                      {pkgData.features.map((feature, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-2 text-sm text-gray-300"
                        >
                          <div className={`w-4 h-4 rounded-full ${pkgData.bg} ${pkgData.color} flex items-center justify-center flex-shrink-0`}>
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          {feature}
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Test mode banner */}
                  <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">🧪</div>
                      <div>
                        <p className="text-sm font-bold text-amber-300 mb-1">Test Mode Active</p>
                        <p className="text-xs text-amber-200/70 leading-relaxed">
                          This is a test payment. No real money will be charged. 
                          The package will be activated instantly for testing purposes.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="bg-white/[0.02] rounded-2xl p-5 mb-6 border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Subtotal</span>
                      <span className="text-sm text-white">0₾</span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-gray-400">Tax</span>
                      <span className="text-sm text-white">0₾</span>
                    </div>
                    <div className="h-px bg-white/10 my-3" />
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold text-white">Total</span>
                      <div className="text-right">
                        <span className={`text-3xl font-black ${pkgData.color}`}>0₾</span>
                        <p className="text-[10px] text-emerald-400 font-bold mt-1">FREE (Test Mode)</p>
                      </div>
                    </div>
                  </div>

                  {/* Pay button */}
                  <button
                    onClick={handlePay}
                    disabled={loading}
                    className={`w-full py-4 rounded-2xl bg-gradient-to-r ${pkgData.gradient} text-white font-bold text-base transition-all hover:shadow-2xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                  >
                    {loading ? (
                      <>
                        <Icons.Loader />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Icons.Gift />
                        Activate {pkgData.name} (0₾ Test)
                      </>
                    )}
                  </button>

                  {/* Trust badges */}
                  <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-gray-600 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Icons.Lock /> Secure
                    </span>
                    <span>·</span>
                    <span>Instant activation</span>
                    <span>·</span>
                    <span>No card required</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-4">
          {currentUser?.email && `Logged in as ${currentUser.email}`}
        </p>
      </motion.div>
    </div>
  );
}