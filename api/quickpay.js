// api/quickpay.js — CommonJS
module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method_not_allowed' });

  let body = req.body;
  if (!body || typeof body !== 'object') {
    try {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
    } catch { body = {}; }
  }

  const { packageId, billingCycle, userId } = body || {};

  const prices = {
    basic: { monthly: 29, semiannual: 79, yearly: 350 },
    gold: { monthly: 99, semiannual: 249, yearly: 1500 },
    diamond: { monthly: 279, semiannual: 799, yearly: 5000 },
    infinity: { monthly: 499, semiannual: 1499, yearly: 9999 },
  };

  const pkgKey = String(packageId || '').toLowerCase();
  const amountUSD = prices[pkgKey]?.[billingCycle];

  if (!amountUSD) {
    return res.status(400).json({ ok: false, error: 'invalid_package' });
  }

  const QUICKPAY_KEY = process.env.QUICKPAY_API_KEY;
  const QUICKPAY_MERCHANT = process.env.QUICKPAY_MERCHANT_ID;

  if (!QUICKPAY_KEY || !QUICKPAY_MERCHANT) {
    return res.status(200).json({
      ok: true,
      demo: true,
      message: 'Quickpay not configured. Demo mode.',
      amountUSD,
      amountGEL: Math.round(amountUSD * 2.7),
    });
  }

  // Real Quickpay call (if configured)
  try {
    const callbackUrl = process.env.VITE_SITE_URL
      ? `${process.env.VITE_SITE_URL}/api/quickpay-callback`
      : 'https://dngmind.com/api/quickpay-callback';

    const response = await fetch('https://api.quickpay.ge/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${QUICKPAY_KEY}`,
      },
      body: JSON.stringify({
        merchant_id: QUICKPAY_MERCHANT,
        amount: Math.round(amountUSD * 2.7),
        currency: 'GEL',
        description: `DNG ${packageId} - ${billingCycle}`,
        callback_url: callbackUrl,
        metadata: { userId, packageId, billingCycle },
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return res.status(502).json({ ok: false, error: 'quickpay_error', detail: errText.slice(0, 200) });
    }

    const data = await response.json();
    return res.status(200).json({
      ok: true,
      paymentUrl: data.payment_url || data.url,
      amountUSD,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'quickpay_exception', message: err.message });
  }
};