// server/_plan.cjs — პაკეტის ვადის ერთიანი წაკითხვა (სხვადასხვა ველიდან)
function toMs(v) {
  if (!v) return 0;
  if (typeof v.toMillis === 'function') return v.toMillis();
  if (typeof v.toDate === 'function') return v.toDate().getTime();
  const t = new Date(v).getTime();
  return Number.isFinite(t) ? t : 0;
}

// იღებს უახლოეს ვადას ყველა ველიდან, რომელსაც სისტემა წერს
function effectiveExpiry(u) {
  if (!u) return 0;
  return Math.max(toMs(u.expiresAt), toMs(u.subscriptionExpiresAt), toMs(u.packageExpiresAt));
}

module.exports = { toMs, effectiveExpiry };