// src/pages/Checkout.jsx — BOG გადახდის გვერდი (ka/en/ru)
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { PACKAGES, formatPrice } from '../config/packagePrices';
import { startBogCheckout } from '../utils/bogCheckout';

const T = {
  ka: {
    back: '← პაკეტები', notFound: 'პაკეტი ვერ მოიძებნა', backToPackages: 'პაკეტებზე დაბრუნება',
    title: 'შეკვეთა:', desc: 'აირჩიე ვადა და გადაიხადე უსაფრთხოდ BOG-ით.',
    failed: 'გადახდა ვერ შესრულდა. სცადეთ თავიდან.',
    monthly: '1 თვე', semiannual: '6 თვე', yearly: '1 წელი',
    save: 'დაზოგე', package: 'პაკეტი', period: 'ვადა', total: 'სულ გადასახდელი',
    pay: 'გადახდა BOG-ით', processing: 'მუშავდება...', secureNote: 'გადახდის შემდეგ პაკეტი ავტომატურად გააქტიურდება.',
    needLogin: 'გასაგრძელებლად საჭიროა შესვლა', login: 'შესვლა',
  },
  en: {
    back: '← Plans', notFound: 'Plan not found', backToPackages: 'Back to plans',
    title: 'Checkout:', desc: 'Choose a billing period and pay securely with BOG.',
    failed: 'Payment failed. Please try again.',
    monthly: '1 Month', semiannual: '6 Months', yearly: '1 Year',
    save: 'Save', package: 'Plan', period: 'Billing period', total: 'Total due',
    pay: 'Pay with BOG', processing: 'Processing...', secureNote: 'Your plan activates automatically after payment.',
    needLogin: 'Please sign in to continue', login: 'Sign in',
  },
  ru: {
    back: '← Пакеты', notFound: 'Пакет не найден', backToPackages: 'Вернуться к пакетам',
    title: 'Оформление:', desc: 'Выберите период оплаты и оплатите безопасно через BOG.',
    failed: 'Оплата не прошла. Попробуйте снова.',
    monthly: '1 месяц', semiannual: '6 месяцев', yearly: '1 год',
    save: 'Экономия', package: 'Пакет', period: 'Период', total: 'Итого к оплате',
    pay: 'Оплатить через BOG', processing: 'Обработка...', secureNote: 'Пакет активируется автоматически после оплаты.',
    needLogin: 'Войдите, чтобы продолжить', login: 'Войти',
  },
};

const CYCLES = ['monthly', 'semiannual', 'yearly'];
const SAVINGS = {
  semiannual: { Basic: 16, Gold: 13, Diamond: 17, Infinity: 13 },
  yearly: { Basic: 26, Gold: 26, Diamond: 27, Infinity: 33 },
};

export default function Checkout() {
  const { i18n } = useTranslation();
  const lang = ['ka', 'en', 'ru'].includes((i18n.language || 'ka').split('-')[0]) ? (i18n.language || 'ka').split('-')[0] : 'ka';
  const L = T[lang];
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const packageKey = searchParams.get('package') || '';
  const initialCycle = searchParams.get('cycle');
  const [cycle, setCycle] = useState(CYCLES.includes(initialCycle) ? initialCycle : 'monthly');
  const failed = searchParams.get('payment') === 'failed';

  const pkg = PACKAGES.find((p) => p.key.toLowerCase() === packageKey.toLowerCase());

  if (!pkg) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white gap-4 px-4">
        <h1 className="text-2xl font-bold">{L.notFound}</h1>
        <Link to="/packages" className="px-6 py-3 bg-white text-black rounded-xl font-bold">{L.backToPackages}</Link>
      </div>
    );
  }

  const price = pkg.prices[cycle];
  const cycleLabel = { monthly: L.monthly, semiannual: L.semiannual, yearly: L.yearly }[cycle];

  async function pay() {
    if (!currentUser) { navigate('/login'); return; }
    setLoading(true);
    try {
      await startBogCheckout(pkg.key, cycle);
    } catch (e) {
      toast.error(e.message || L.failed);
      setLoading(false);
    }
  }

  const card = 'relative bg-[#0A0A0C]/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 overflow-hidden';

  return (
    <div className="min-h-screen bg-[#050505] pt-28 pb-24 px-4 relative overflow-hidden">
      <Toaster position="top-center" toastOptions={{ style: { background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
      <motion.div animate={{ x: [0, 30, 0], y: [0, -15, 0] }} transition={{ duration: 16, repeat: Infinity }}
        className="absolute top-10 -left-32 w-[460px] h-[460px] bg-blue-600/15 rounded-full blur-[130px] pointer-events-none" />
      <motion.div animate={{ x: [0, -30, 0], y: [0, 15, 0] }} transition={{ duration: 18, repeat: Infinity }}
        className="absolute bottom-10 -right-32 w-[460px] h-[460px] bg-cyan-500/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="relative max-w-xl mx-auto">
        <Link to="/packages" className="text-sm text-gray-500 hover:text-white transition-colors">{L.back}</Link>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-4 mb-8">
          <h1 className="text-3xl font-black text-white mb-2">{L.title} <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">{pkg.key}</span></h1>
          <p className="text-gray-400">{L.desc}</p>
        </motion.div>

        {failed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            {L.failed}
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-3 gap-3 mb-6">
          {CYCLES.map((c) => {
            const saving = c !== 'monthly' ? SAVINGS[c][pkg.key] : 0;
            return (
              <button key={c} type="button" onClick={() => setCycle(c)}
                className={`relative p-4 rounded-2xl border-2 text-sm font-bold transition-all ${
                  cycle === c ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                }`}>
                {{ monthly: L.monthly, semiannual: L.semiannual, yearly: L.yearly }[c]}
                <div className="text-lg font-black mt-1 text-white">{formatPrice(pkg.prices[c], lang)}</div>
                {saving > 0 && <div className="text-[10px] text-emerald-400 font-bold mt-0.5">{L.save} {saving}%</div>}
              </button>
            );
          })}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={card + ' mb-6'}>
          <div className="flex justify-between text-sm text-gray-400 mb-3">
            <span>{L.package}</span><span className="text-white font-semibold">{pkg.key}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-400 mb-4">
            <span>{L.period}</span><span className="text-white font-semibold">{cycleLabel}</span>
          </div>
          <div className="flex justify-between text-xl font-black border-t border-white/10 pt-4">
            <span className="text-white">{L.total}</span><span className="text-cyan-300">{formatPrice(price, lang)}</span>
          </div>
        </motion.div>

        {!currentUser ? (
          <Link to="/login" className="block w-full text-center py-4 rounded-2xl font-bold bg-white text-black hover:opacity-90 transition-opacity">
            {L.needLogin}
          </Link>
        ) : (
          <button type="button" onClick={pay} disabled={loading}
            className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white disabled:opacity-50 hover:opacity-90 transition-opacity">
            {loading ? L.processing : L.pay}
          </button>
        )}
        <p className="text-xs text-gray-500 text-center mt-4">{L.secureNote}</p>
      </div>
    </div>
  );
}