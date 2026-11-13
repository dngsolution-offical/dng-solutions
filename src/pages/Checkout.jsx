// src/pages/Checkout.jsx — Multi-currency checkout
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFreeTrial } from '../hooks/useFreeTrial';
import { toast, Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

const Icons = {
  Alert: () => <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  Shield: () => <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
  Loader: () => <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>,
};

// Prices in USD (base currency)
const PACKAGES_USD = {
  basic: { name: 'Basic', prices: { monthly: 29, semiannual: 79, yearly: 350 } },
  gold: { name: 'Gold', prices: { monthly: 99, semiannual: 249, yearly: 1500 } },
  diamond: { name: 'Diamond', prices: { monthly: 279, semiannual: 799, yearly: 5000 } },
  infinity: { name: 'Infinity', prices: { monthly: 499, semiannual: 1499, yearly: 9999 } },
};

// Currency conversion rates
const CURRENCY = {
  en: { symbol: '$', code: 'USD', rate: 1, locale: 'en-US' },
  ka: { symbol: '₾', code: 'GEL', rate: 2.7, locale: 'ka-GE' },
  ru: { symbol: '₽', code: 'RUB', rate: 90, locale: 'ru-RU' },
};

function getCurrency(lang) {
  const code = (lang || 'en').split('-')[0];
  return CURRENCY[code] || CURRENCY.en;
}

function formatPrice(usdAmount, lang) {
  const curr = getCurrency(lang);
  const amount = Math.round(usdAmount * curr.rate);
  return {
    formatted: `${curr.symbol}${amount.toLocaleString(curr.locale)}`,
    amount,
    code: curr.code,
    symbol: curr.symbol,
  };
}

export default function Checkout() {
  const { t, i18n } = useTranslation();
  const { packageId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { activatePackage } = useFreeTrial(currentUser?.uid);
  const [loading, setLoading] = useState(false);

  const billing = searchParams.get('billing') || 'monthly';
  const pkgData = PACKAGES_USD[packageId?.toLowerCase()] || PACKAGES_USD.basic;
  const amountUSD = pkgData.prices[billing];

  // Format prices in all currencies for display
  const pricePrimary = formatPrice(amountUSD, i18n.language);
  const priceGEL = formatPrice(amountUSD, 'ka');
  const priceUSD = formatPrice(amountUSD, 'en');
  const priceRUB = formatPrice(amountUSD, 'ru');

  const handlePay = async () => {
    if (!currentUser) { navigate('/login'); return; }
    setLoading(true);
    try {
      // Try Quickpay API first
      const idToken = await currentUser?.getIdToken();
      let paymentResult = null;

      try {
        const res = await fetch('/api/quickpay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            packageId: packageId.toLowerCase(),
            billingCycle: billing,
            userId: currentUser.uid,
          }),
        });

        // Safely parse JSON
        const text = await res.text();
        if (text) {
          try {
            paymentResult = JSON.parse(text);
          } catch (e) {
            console.error('[checkout] Invalid JSON:', text.slice(0, 200));
            paymentResult = { ok: false, error: 'invalid_response' };
          }
        } else {
          paymentResult = { ok: false, error: 'empty_response' };
        }
      } catch (fetchErr) {
        console.error('[checkout] Fetch error:', fetchErr.message);
        paymentResult = { ok: false, error: 'network_error' };
      }

      // If payment URL exists -> redirect
      if (paymentResult?.paymentUrl) {
        window.location.href = paymentResult.paymentUrl;
        return;
      }

      // Demo mode (no Quickpay configured) -> activate directly
      if (paymentResult?.ok || paymentResult?.demo) {
        const res = await activatePackage(pkgData.name, billing);
        if (res.ok) {
          toast.success(t('checkout.success') || 'Package activated!');
          navigate('/dashboard');
        } else {
          toast.error(res.error || t('checkout.failed') || 'Activation failed');
        }
        return;
      }

      // Error
      const errMsg = paymentResult?.message || paymentResult?.error || 'Payment failed';
      toast.error(errMsg);
    } catch (err) {
      console.error('[checkout] Error:', err);
      toast.error(t('checkout.failed') || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
      <Toaster position="top-center" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative z-10 shadow-2xl">
        <div className="flex items-center justify-center mb-6">
          <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center gap-2">
            <Icons.Shield />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
              {t('checkout.secure') || 'Secure Checkout'}
            </span>
          </div>
        </div>

        <h1 className="text-3xl font-black text-white text-center mb-1">
          {t('checkout.completePayment') || 'Complete Payment'}
        </h1>
        <p className="text-gray-400 text-sm text-center mb-6">
          {t('checkout.secureSubscription') || 'Secure your subscription'}
        </p>

        {/* Warning */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 flex gap-3">
          <div className="text-amber-400 mt-0.5"><Icons.Alert /></div>
          <div>
            <p className="text-sm text-amber-200 font-medium mb-1">{t('checkout.important') || 'Important'}</p>
            <p className="text-xs text-amber-200/70 leading-relaxed">
              {t('checkout.warning') || 'Disable VPN/Ad blockers for payment to work.'}
            </p>
          </div>
        </div>

        {/* Package info */}
        <div className="bg-white/5 rounded-2xl p-5 mb-6 border border-white/5">
          <div className="flex justify-between mb-3">
            <span className="text-gray-400 text-sm">{t('checkout.package') || 'Package'}</span>
            <span className="text-white font-bold text-sm uppercase">{pkgData.name}</span>
          </div>
          <div className="flex justify-between mb-3">
            <span className="text-gray-400 text-sm">{t('checkout.billingCycle') || 'Billing'}</span>
            <span className="text-white font-bold text-sm capitalize">
              {t(`checkout.billing.${billing}`) || billing}
            </span>
          </div>
          <div className="h-px bg-white/10 my-3" />

          {/* Multi-currency display */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-xs">{pricePrimary.code}</span>
              <span className="text-white text-sm">{pricePrimary.formatted}</span>
            </div>
            {pricePrimary.code !== 'GEL' && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">GEL</span>
                <span className="text-gray-300 text-sm">{priceGEL.formatted}</span>
              </div>
            )}
            {pricePrimary.code !== 'USD' && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">USD</span>
                <span className="text-gray-300 text-sm">{priceUSD.formatted}</span>
              </div>
            )}
            {pricePrimary.code !== 'RUB' && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">RUB</span>
                <span className="text-gray-300 text-sm">{priceRUB.formatted}</span>
              </div>
            )}
          </div>

          <div className="h-px bg-white/10 my-3" />
          <div className="flex justify-between items-end">
            <span className="text-gray-400 text-sm font-bold">{t('checkout.totalDue') || 'Total'}</span>
            <span className="text-2xl font-black text-white">{pricePrimary.formatted}</span>
          </div>
        </div>

        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
        >
          {loading ? (
            <><Icons.Loader /> {t('checkout.processing') || 'Processing...'}</>
          ) : (
            <>{t('checkout.payWith') || 'Pay with Quickpay'}</>
          )}
        </button>

        <Link to="/packages" className="block text-center text-sm text-gray-500 mt-5 hover:text-white transition-colors">
          {t('checkout.cancel') || 'Cancel and go back'}
        </Link>
      </motion.div>
    </div>
  );
}