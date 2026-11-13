import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { toast, Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const PACKAGES = {
  basic: { name: 'Basic', priceGEL: 79, icon: '⚡', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  gold: { name: 'Gold', priceGEL: 249, icon: '👑', color: 'from-amber-400 to-orange-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
  diamond: { name: 'Diamond', priceGEL: 799, icon: '💎', color: 'from-purple-500 to-pink-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
  infinity: { name: 'Infinity', priceGEL: 1499, icon: '♾️', color: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
};

const BANK_DETAILS = {
  bankName: 'TBC Bank',
  accountNumber: 'GE00TB0000000000000000',
  receiverName: 'DNG Solutions',
  phone: '+995 555 000 000'
};

const WESTERN_UNION_DETAILS = {
  receiverName: 'DNG Solutions',
  country: 'Georgia',
  city: 'Tbilisi',
  phone: '+995 551 222 098',
};

const T = {
  en: {
    title: 'Complete Payment',
    subtitle: 'Choose your payment method',
    package: 'Package',
    price: 'Price',
    perMonth: '/ month',
    bank: 'Bank Transfer',
    bankDesc: 'Transfer directly to our bank account',
    wu: 'Western Union',
    wuDesc: 'Send money from anywhere in the world',
    instructions: 'Payment Instructions',
    bankSteps: [
      'Transfer the amount to the bank account below.',
      'Return to this page and click "I\'ve Paid".',
      'Admin will verify and activate your package within 24 hours.'
    ],
    wuSteps: [
      'Open westernunion.com or the app.',
      'Send the amount to Georgia (Bank account or Cash pickup).',
      'Receive MTCN code via email.',
      'Enter MTCN below and click "I\'ve Paid".'
    ],
    showDetails: 'Show Bank Details',
    showWuDetails: 'Show Recipient Details',
    bankName: 'Bank',
    accountNumber: 'Account Number',
    receiver: 'Receiver',
    phone: 'Phone',
    country: 'Country',
    city: 'City',
    mtcnLabel: 'MTCN Code (10 digits)',
    mtcnHint: 'MTCN is a 10-digit code sent to your email after transfer.',
    payButton: 'I Have Paid',
    processing: 'Processing...',
    cancel: 'Cancel',
    success: 'Request sent! Admin will approve soon.',
    error: 'Error',
    copied: 'Copied!',
    mtcnRequired: 'Please enter MTCN code',
    secure: 'Secure payment',
    encrypted: 'Encrypted',
    support: '24/7 Support',
    instant: 'Fast Activation',
  },
  ka: {
    title: 'გადახდის დასრულება',
    subtitle: 'აირჩიე გადახდის მეთოდი',
    package: 'პაკეტი',
    price: 'ფასი',
    perMonth: '/ თვე',
    bank: 'საბანკო გადარიცხვა',
    bankDesc: 'გადარიცხე პირდაპირ ჩვენს ანგარიშზე',
    wu: 'Western Union',
    wuDesc: 'გაგზავნე ფული მსოფლიოს ნებისმიერი ადგილიდან',
    instructions: 'გადახდის ინსტრუქცია',
    bankSteps: [
      'გადარიცხე თანხა ქვემოთ მოცემულ ანგარიშზე.',
      'დაუბრუნდი ამ გვერდს და დააჭირე "გადავიხადე".',
      'ადმინი შეამოწმებს და გაააქტიურებს პაკეტს 24 საათში.'
    ],
    wuSteps: [
      'გახსენი westernunion.com ან აპი.',
      'გაგზავნე თანხა საქართველოში (Bank account ან Cash pickup).',
      'მიიღე MTCN კოდი ელ-ფოსტაზე.',
      'შეიყვანე MTCN ქვემოთ და დააჭირე "გადავიხადე".'
    ],
    showDetails: 'რეკვიზიტების ნახვა',
    showWuDetails: 'მიმღების ნახვა',
    bankName: 'ბანკი',
    accountNumber: 'ანგარიში',
    receiver: 'მიმღები',
    phone: 'ტელეფონი',
    country: 'ქვეყანა',
    city: 'ქალაქი',
    mtcnLabel: 'MTCN კოდი (10 ციფრი)',
    mtcnHint: 'MTCN არის 10-ციფრიანი კოდი, რომელსაც Western Union გიგზავნით ელ-ფოსტაზე.',
    payButton: 'გადავიხადე',
    processing: 'მუშავდება...',
    cancel: 'გაუქმება',
    success: 'მოთხოვნა გაგზავნილია! ადმინი მალე დაამტკიცებს.',
    error: 'შეცდომა',
    copied: 'დაკოპირდა!',
    mtcnRequired: 'შეიყვანეთ MTCN კოდი',
    secure: 'უსაფრთხო გადახდა',
    encrypted: 'დაშიფრული',
    support: '24/7 მხარდაჭერა',
    instant: 'სწრაფი აქტივაცია',
  },
  ru: {
    title: 'Завершить оплату',
    subtitle: 'Выберите способ оплаты',
    package: 'Пакет',
    price: 'Цена',
    perMonth: '/ месяц',
    bank: 'Банковский перевод',
    bankDesc: 'Перевод напрямую на наш банковский счет',
    wu: 'Western Union',
    wuDesc: 'Отправьте деньги из любой точки мира',
    instructions: 'Инструкции по оплате',
    bankSteps: [
      'Переведите сумму на счет ниже.',
      'Вернитесь на эту страницу и нажмите "Я оплатил".',
      'Администратор проверит и активирует пакет в течение 24 часов.'
    ],
    wuSteps: [
      'Откройте westernunion.com или приложение.',
      'Отправьте сумму в Грузию (Bank account или Cash pickup).',
      'Получите код MTCN на email.',
      'Введите MTCN ниже и нажмите "Я оплатил".'
    ],
    showDetails: 'Показать реквизиты',
    showWuDetails: 'Показать получателя',
    bankName: 'Банк',
    accountNumber: 'Счет',
    receiver: 'Получатель',
    phone: 'Телефон',
    country: 'Страна',
    city: 'Город',
    mtcnLabel: 'Код MTCN (10 цифр)',
    mtcnHint: 'MTCN — 10-значный код, который Western Union отправляет на ваш email.',
    payButton: 'Я оплатил',
    processing: 'Обработка...',
    cancel: 'Отмена',
    success: 'Запрос отправлен! Админ скоро одобрит.',
    error: 'Ошибка',
    copied: 'Скопировано!',
    mtcnRequired: 'Введите код MTCN',
    secure: 'Безопасная оплата',
    encrypted: 'Зашифровано',
    support: 'Поддержка 24/7',
    instant: 'Быстрая активация',
  },
};

const Icons = {
  Bank: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11m16-11v11M8 14v3m4-3v3m4-3v3" /></svg>,
  Globe: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Copy: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  Check: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>,
  Shield: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Lock: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  Clock: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  ArrowLeft: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Spinner: () => <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>,
};

export default function Checkout() {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { i18n } = useTranslation();

  const lang = (i18n.language || 'ka').split('-')[0];
  const t = T[lang] || T.ka;

  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('bank_transfer');
  const [showDetails, setShowDetails] = useState(false);
  const [mtcn, setMtcn] = useState('');

  const safePackageId = (packageId || 'basic').toLowerCase();
  const pkgData = PACKAGES[safePackageId] || PACKAGES.basic;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(t.copied, { icon: '📋' });
  };

  const handleSubmit = async () => {
    if (!currentUser) { navigate('/login'); return; }
    if (method === 'western_union' && !mtcn.trim()) {
      toast.error(t.mtcnRequired);
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/quickpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: safePackageId,
          billingCycle: 'monthly',
          userId: currentUser.uid,
          userEmail: currentUser.email,
          amount: pkgData.priceGEL,
          paymentMethod: method,
          mtcn: method === 'western_union' ? mtcn.trim() : null,
        }),
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.message || 'Error');

      toast.success(t.success, { duration: 3000, icon: '✅' });
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      toast.error(`${t.error}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isReady = showDetails && (method === 'bank_transfer' || (method === 'western_union' && mtcn.trim().length >= 8));

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden py-8 px-4">
      <Toaster position="top-center" toastOptions={{ style: { background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />

      {/* Background glow */}
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] ${pkgData.bg} rounded-full blur-[150px] pointer-events-none opacity-30`} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.05),transparent_50%)] pointer-events-none" />

      <div className="relative max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <Link to="/packages" className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-6 transition-colors">
            <Icons.ArrowLeft /> {t.cancel}
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">{t.title}</h1>
          <p className="text-gray-500 text-sm">{t.subtitle}</p>
        </motion.div>

        {/* Package Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`relative rounded-3xl p-6 mb-6 border ${pkgData.border} ${pkgData.bg} overflow-hidden`}
        >
          <div className={`absolute inset-0 bg-gradient-to-r ${pkgData.color} opacity-5`} />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{pkgData.icon}</div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">{t.package}</p>
                <h2 className={`text-2xl font-black ${pkgData.text}`}>{pkgData.name}</h2>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">{t.price}</p>
              <p className="text-3xl font-black text-white">{pkgData.priceGEL} ₾</p>
              <p className="text-xs text-gray-500">{t.perMonth}</p>
            </div>
          </div>
        </motion.div>

        {/* Payment Method Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          <button
            onClick={() => { setMethod('bank_transfer'); setShowDetails(false); }}
            className={`relative p-5 rounded-2xl border-2 transition-all text-left ${
              method === 'bank_transfer'
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-white/10 bg-white/[0.02] hover:border-white/20'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
              method === 'bank_transfer' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-400'
            }`}>
              <Icons.Bank />
            </div>
            <h3 className={`font-bold text-sm mb-1 ${method === 'bank_transfer' ? 'text-white' : 'text-gray-300'}`}>
              {t.bank}
            </h3>
            <p className="text-[11px] text-gray-500 leading-tight">{t.bankDesc}</p>
          </button>

          <button
            onClick={() => { setMethod('western_union'); setShowDetails(false); }}
            className={`relative p-5 rounded-2xl border-2 transition-all text-left ${
              method === 'western_union'
                ? 'border-cyan-500 bg-cyan-500/10'
                : 'border-white/10 bg-white/[0.02] hover:border-white/20'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
              method === 'western_union' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-gray-400'
            }`}>
              <Icons.Globe />
            </div>
            <h3 className={`font-bold text-sm mb-1 ${method === 'western_union' ? 'text-white' : 'text-gray-300'}`}>
              {t.wu}
            </h3>
            <p className="text-[11px] text-gray-500 leading-tight">{t.wuDesc}</p>
          </button>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 mb-6"
        >
          <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-3">{t.instructions}</p>
          <ol className="space-y-2">
            {(method === 'bank_transfer' ? t.bankSteps : t.wuSteps).map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-300">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5 ${
                  method === 'bank_transfer' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'
                }`}>
                  {i + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </motion.div>

        {/* Details Toggle */}
        <AnimatePresence mode="wait">
          {!showDetails ? (
            <motion.button
              key="show"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetails(true)}
              className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all mb-4"
            >
              {method === 'bank_transfer' ? t.showDetails : t.showWuDetails}
            </motion.button>
          ) : (
            <motion.div
              key="details"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 mb-4"
            >
              {method === 'bank_transfer' ? (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 space-y-3">
                  {[
                    { label: t.bankName, value: BANK_DETAILS.bankName, copy: false },
                    { label: t.accountNumber, value: BANK_DETAILS.accountNumber, copy: true },
                    { label: t.receiver, value: BANK_DETAILS.receiverName, copy: true },
                    { label: t.phone, value: BANK_DETAILS.phone, copy: true },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">{row.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white font-medium select-all">{row.value}</span>
                        {row.copy && (
                          <button onClick={() => copyToClipboard(row.value)} className="text-emerald-400 hover:text-emerald-300 transition-colors">
                            <Icons.Copy />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-5 space-y-3">
                    {[
                      { label: t.receiver, value: WESTERN_UNION_DETAILS.receiverName, copy: true },
                      { label: t.country, value: WESTERN_UNION_DETAILS.country, copy: false },
                      { label: t.city, value: WESTERN_UNION_DETAILS.city, copy: false },
                      { label: t.phone, value: WESTERN_UNION_DETAILS.phone, copy: true },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between gap-3">
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">{row.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white font-medium select-all">{row.value}</span>
                          {row.copy && (
                            <button onClick={() => copyToClipboard(row.value)} className="text-cyan-400 hover:text-cyan-300 transition-colors">
                              <Icons.Copy />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
                    <label className="block text-xs text-gray-500 uppercase tracking-wider font-bold mb-3">{t.mtcnLabel}</label>
                    <input
                      type="text"
                      value={mtcn}
                      onChange={(e) => setMtcn(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="1234567890"
                      inputMode="numeric"
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-lg tracking-widest focus:outline-none focus:border-cyan-500/50 transition-all text-center"
                    />
                    <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">{t.mtcnHint}</p>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pay Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={handleSubmit}
          disabled={loading || !isReady}
          className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
            loading || !isReady
              ? 'bg-gray-800 opacity-50 cursor-not-allowed'
              : `bg-gradient-to-r ${pkgData.color} hover:opacity-90 shadow-lg`
          }`}
        >
          {loading ? <><Icons.Spinner /> {t.processing}</> : <><Icons.Check /> {t.payButton}</>}
        </motion.button>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex items-center justify-center gap-6 text-[10px] text-gray-500"
        >
          <div className="flex items-center gap-1.5">
            <Icons.Shield />
            <span>{t.encrypted}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Icons.Lock />
            <span>{t.secure}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Icons.Clock />
            <span>{t.instant}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}