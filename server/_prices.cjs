// server/_prices.cjs — ცენტრალური წყარო პაკეტების ფასებისთვის (USD)
const PACKAGES = {
  Basic:    { monthly: 79,   semiannual: 399,   yearly: 699,   telegram: 0,  agents: 4 },
  Gold:     { monthly: 249,  semiannual: 1299,  yearly: 2199,  telegram: 0,  agents: 7 },
  Diamond:  { monthly: 799,  semiannual: 3999,  yearly: 6999,  telegram: 3,  agents: 21 },
  Infinity: { monthly: 2499, semiannual: 12999, yearly: 19999, telegram: 10, agents: 21 },
};

const USD_TO_GEL = 2.7;

function priceFor(pkg, cycle) {
  const p = PACKAGES[pkg];
  if (!p) return null;
  return p[cycle] ?? null;
}

module.exports = { PACKAGES, USD_TO_GEL, priceFor };