// src/config/packagePrices.js — ცენტრალური წყარო პაკეტების ფასებისთვის
export const RATE = { en: 1, ka: 2.7, ru: 90 };

export const PACKAGES = [
  {
    key: 'Basic',
    prices: { monthly: 79, semiannual: 399, yearly: 699 },
    orders: '500 შეკვეთა თვეში',
    agents: 4,
    storage: '10MB',
    telegram: 0,
    popular: false,
  },
  {
    key: 'Gold',
    prices: { monthly: 249, semiannual: 1299, yearly: 2199 },
    orders: '2000 შეკვეთა თვეში',
    agents: 7,
    storage: '25MB',
    telegram: 0,
    popular: true,
  },
  {
    key: 'Diamond',
    prices: { monthly: 799, semiannual: 3999, yearly: 6999 },
    orders: 'შეუზღუდავი შეკვეთა',
    agents: 21,
    storage: '100MB',
    telegram: 3,
    popular: false,
  },
  {
    key: 'Infinity',
    prices: { monthly: 2499, semiannual: 12999, yearly: 19999 },
    orders: 'შეუზღუდავი შეკვეთა',
    agents: 21,
    storage: 'შეუზღუდავი',
    telegram: 10,
    popular: false,
    premium: true,
  },
];

export const SAVINGS = {
  semiannual: { Basic: 16, Gold: 13, Diamond: 17, Infinity: 13 },
  yearly: { Basic: 26, Gold: 26, Diamond: 27, Infinity: 33 },
};

export function formatPrice(usd, lang) {
  const rate = RATE[lang] || 1;
  const val = Math.round(usd * rate);
  const symbol = lang === 'ka' ? '₾' : lang === 'ru' ? '₽' : '$';
  return `${symbol}${val.toLocaleString()}`;
}