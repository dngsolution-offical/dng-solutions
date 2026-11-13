import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const ORDERS = [
  { value: 100,  usd: 0,   key: 'orders100' },
  { value: 500,  usd: 40,  key: 'orders500' },
  { value: 2000, usd: 120, key: 'orders2000' },
  { value: -1,   usd: 350, key: 'ordersUnlimited' },
];
const AGENTS = [
  { value: 1, usd: 0,  key: 'agents1' },
  { value: 2, usd: 5,  key: 'agents2' },
  { value: 4, usd: 15, key: 'agents4' },
  { value: 7, usd: 35, key: 'agents7' },
  { value: 9, usd: 60, key: 'agents9' },
];
const STORAGE = [
  { value: 5,   usd: 0,  key: 'storage5' },
  { value: 10,  usd: 2,  key: 'storage10' },
  { value: 25,  usd: 5,  key: 'storage25' },
  { value: 100, usd: 15, key: 'storage100' },
];
const FEATURES = [
  { id: 'thinking', usd: 5,  key: 'featThinking' },
  { id: 'vision',   usd: 10, key: 'featVision' },
  { id: 'schedule', usd: 8,  key: 'featSchedule' },
  { id: 'crm',      usd: 8,  key: 'featCrm' },
  { id: 'priority', usd: 5,  key: 'featPriority' },
  { id: 'api',      usd: 15, key: 'featApi' },
];

const BASE_USD = 29;
const MIN_PRICE_USD = 29;

// რეალური ხარჯების მოდელი — ამ ციფრებზე დაბლა ვერ წახვალ
const COSTS = {
  base: 8,              // Firebase + Vercel + 1 საათი support
  perOrder: 0.003,      // Claude API ~$0.003/order
  perAgent: 1,          // agent-ის მოდელის cost
  per10MB: 0.5,         // storage cost
  perFeature: 1,        // ფიჩერის hosting cost
  paymentFee: 0.03,     // 3% processor fee
  minMargin: 1.5,       // 150% მინიმუმ
};

const CURRENCIES = {
  en: { symbol: '$', rate: 1 },
  ka: { symbol: '₾', rate: 2.7 },
  ru: { symbol: '₽', rate: 90 },
};

function calculatePrice(config) {
  const orders = ORDERS[config.orders];
  const agents = AGENTS[config.agents];
  const storage = STORAGE[config.storage];

  // შემოთავაზებული ფასი (რასაც იუზერი იხდის)
  let usd = BASE_USD + orders.usd + agents.usd + storage.usd;
  config.features.forEach(i => { usd += FEATURES[i].usd; });

  // რეალური ხარჯი
  let cost = COSTS.base;
  cost += (orders.value === -1 ? 10000 : orders.value) * COSTS.perOrder;
  cost += agents.value * COSTS.perAgent;
  cost += (storage.value / 10) * COSTS.per10MB;
  cost += config.features.length * COSTS.perFeature;

  // უსაფრთხოების ჭერი — მინიმუმ 150% margin + 3% payment fee reserve
  const minSafePrice = Math.ceil((cost * COSTS.minMargin) / (1 - COSTS.paymentFee));
  const finalUsd = Math.max(usd, minSafePrice, MIN_PRICE_USD);

  return {
    usd: finalUsd,
    cost,
    wasAdjusted: finalUsd > usd,
    margin: (((finalUsd * (1 - COSTS.paymentFee)) - cost) / finalUsd * 100).toFixed(1),
  };
}

export default function CustomPackageModal({ isOpen, onClose }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = (i18n.language || 'ka').split('-')[0];
  const currency = CURRENCIES[lang] || CURRENCIES.ka;

  const [config, setConfig] = useState({ orders: 0, agents: 0, storage: 0, features: [] });
  const pricing = useMemo(() => calculatePrice(config), [config]);

  const fmt = (usd) => `${currency.symbol}${Math.round(usd * currency.rate).toLocaleString()}`;

  const toggleFeature = (i) => {
    setConfig(prev => ({
      ...prev,
      features: prev.features.includes(i)
        ? prev.features.filter(x => x !== i)
        : [...prev.features, i],
    }));
  };

  const handleContinue = () => {
    const payload = {
      config,
      pricing: { usd: pricing.usd, cost: pricing.cost, margin: pricing.margin },
      createdAt: new Date().toISOString(),
    };
    const customId = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem(customId, JSON.stringify(payload));
    onClose();
    navigate(`/checkout/custom?customId=${customId}&billing=monthly`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl my-8 bg-gradient-to-br from-[#0A0A0A] via-[#0A0A0A] to-[#0F0F14] border border-white/10 rounded-3xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative p-6 sm:p-8 border-b border-white/[0.08]">
            <div className="absolute inset-0 bg-gradient-to-br from-dng-blue/10 via-transparent to-dng-cyan/10 pointer-events-none" />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dng-cyan/10 border border-dng-cyan/20 mb-3">
                  <svg className="w-4 h-4 text-dng-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <span className="text-[10px] font-black text-dng-cyan uppercase tracking-widest">{t('customPage.badge')}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">{t('customPage.title')}</h2>
                <p className="text-sm text-gray-400 mt-1">{t('customPage.subtitle')}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8 space-y-6 max-h-[55vh] overflow-y-auto">
            <div className="p-4 bg-gradient-to-br from-dng-blue/10 to-dng-cyan/5 border border-dng-cyan/20 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-dng-cyan uppercase tracking-wider mb-1">{t('customPage.basePrice')}</p>
                  <p className="text-xs text-gray-400">{t('customPage.baseDesc')}</p>
                </div>
                <div className="text-2xl font-black text-white">{fmt(BASE_USD)}</div>
              </div>
            </div>

            {/* Orders */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white">{t('customPage.ordersLabel')}</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ORDERS.map((o, i) => (
                  <button key={i} onClick={() => setConfig({ ...config, orders: i })}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${config.orders === i ? 'bg-dng-cyan/10 border-dng-cyan/50 text-white' : 'bg-white/[0.02] border-white/[0.08] text-gray-400 hover:border-white/20'}`}>
                    <div className="text-lg font-black">{o.value === -1 ? '∞' : o.value}</div>
                    <div className="text-[10px] mt-0.5">{o.usd > 0 ? `+${fmt(o.usd)}` : t('customPage.included')}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Agents */}
            <div>
              <h3 className="text-sm font-bold text-white mb-3">{t('customPage.agentsLabel')}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {AGENTS.map((a, i) => (
                  <button key={i} onClick={() => setConfig({ ...config, agents: i })}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${config.agents === i ? 'bg-purple-500/10 border-purple-500/50 text-white' : 'bg-white/[0.02] border-white/[0.08] text-gray-400 hover:border-white/20'}`}>
                    <div className="text-lg font-black">{a.value}</div>
                    <div className="text-[10px] mt-0.5">{a.usd > 0 ? `+${fmt(a.usd)}` : t('customPage.included')}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Storage */}
            <div>
              <h3 className="text-sm font-bold text-white mb-3">{t('customPage.storageLabel')}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STORAGE.map((s, i) => (
                  <button key={i} onClick={() => setConfig({ ...config, storage: i })}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${config.storage === i ? 'bg-green-500/10 border-green-500/50 text-white' : 'bg-white/[0.02] border-white/[0.08] text-gray-400 hover:border-white/20'}`}>
                    <div className="text-lg font-black">{s.value}MB</div>
                    <div className="text-[10px] mt-0.5">{s.usd > 0 ? `+${fmt(s.usd)}` : t('customPage.included')}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-sm font-bold text-white mb-3">{t('customPage.featuresLabel')}</h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {FEATURES.map((f, i) => (
                  <button key={f.id} onClick={() => toggleFeature(i)}
                    className={`p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between ${config.features.includes(i) ? 'bg-amber-500/10 border-amber-500/50' : 'bg-white/[0.02] border-white/[0.08] hover:border-white/20'}`}>
                    <span className={`text-sm font-semibold ${config.features.includes(i) ? 'text-white' : 'text-gray-400'}`}>{t(`customPage.${f.key}`)}</span>
                    <span className="text-xs font-bold text-amber-400">+{fmt(f.usd)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/[0.08] p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{t('customPage.totalPrice')}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white">{fmt(pricing.usd)}</span>
                  <span className="text-xs text-gray-500">/ {t('customPage.perMonth')}</span>
                </div>
              </div>
              <div className="text-center sm:text-right">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{t('customPage.lossProtected')}</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">{t('customPage.minPriceNote')}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold text-sm hover:bg-white/10 transition-all">
                {t('customPage.cancelBtn')}
              </button>
              <button onClick={handleContinue} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-dng-blue to-dng-cyan text-white font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_0_30px_-5px_rgba(37,99,235,0.5)]">
                {t('customPage.continueBtn')} →
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}