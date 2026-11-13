export const PACKAGE_PRICES = {
  ka: { Basic: 210, Gold: 660, Diamond: 2100, Infinity: 4047 },
  en: { Basic: 79,  Gold: 249, Diamond: 799,  Infinity: 1499 },
  ru: { Basic: 7000, Gold: 22000, Diamond: 70000, Infinity: 134910 },
};

export const getPrice = (pkgId, lang = 'ka') => (PACKAGE_PRICES[lang] || PACKAGE_PRICES.ka)[pkgId] || 0;

export function getCurrencySymbol(lang = 'ka') {
  const l = (lang || 'ka').split('-')[0];
  if (l === 'en') return '$';
  if (l === 'ru') return '₽';
  return '₾';
}

export function getCurrencyCode(lang = 'ka') {
  const l = (lang || 'ka').split('-')[0];
  if (l === 'en') return 'USD';
  if (l === 'ru') return 'RUB';
  return 'GEL';
}

export function formatCurrency(amount, lang = 'ka') {
  const num = Number(amount);
  if (!Number.isFinite(num)) return '—';
  const symbol = getCurrencySymbol(lang);
  const code = (lang || 'ka').split('-')[0];
  const locale = code === 'ru' ? 'ru-RU' : code === 'en' ? 'en-US' : 'ka-GE';
  return `${num.toLocaleString(locale)} ${symbol}`;
}

export const BILLING_MULTIPLIERS = { monthly: 1, sixMonths: 5, yearly: 10 };