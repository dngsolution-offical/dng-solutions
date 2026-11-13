// api/quickpay.js — REAL BOG INTEGRATION (0.01 GEL test mode)
// All packages = 0.01 GEL for testing. Change to real prices later.

const PACKAGE_PRICES_USD = {
  basic: { monthly: 29, semiannual: 79, yearly: 350 },
  gold: { monthly: 99, semiannual: 249, yearly: 1500 },
  diamond: { monthly: 279, semiannual: 799, yearly: 5000 },
  infinity: { monthly: 499, semiannual: 1499, yearly: 9999 },
};

const TEST_PRICE_GEL = 0.01;  // ← 0.01 GEL for all packages (test)
const USE_REAL_PRICES = false; // ← Change to true when ready for real prices

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

  const { packageId, billingCycle, userId, userEmail } = body || {};

  if (!packageId || !billingCycle || !userId) {
    return res.status(400).json({ ok: false, error: 'missing_fields' });
  }

  const pkgKey = String(packageId).toLowerCase();
  const priceUSD = PACKAGE_PRICES_USD[pkgKey]?.[billingCycle];

  if (!priceUSD) {
    return res.status(400).json({ ok: false, error: 'invalid_package' });
  }

  // ─── Calculate amount ───
  let amountGEL;
  if (USE_REAL_PRICES) {
    amountGEL = Math.round(priceUSD * 2.7 * 100) / 100;
  } else {
    amountGEL = TEST_PRICE_GEL; // 0.01 GEL for testing
  }

  console.log('[quickpay] Package:', pkgKey, '| Billing:', billingCycle, '| Amount:', amountGEL, 'GEL');

  // ─── Get BOG credentials ───
  const clientId = process.env.BOG_CLIENT_ID;
  const clientSecret = process.env.BOG_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('[quickpay] BOG credentials missing');
    return res.status(500).json({
      ok: false,
      error: 'bog_credentials_missing',
      message: 'Set BOG_CLIENT_ID and BOG_CLIENT_SECRET in .env',
    });
  }

  // ─── Step 1: Get Access Token from BOG ───
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const tokenUrl = 'https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token';

  let accessToken;
  try {
    console.log('[quickpay] Getting BOG access token...');
    
    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('[quickpay] BOG token error:', tokenRes.status, errText.slice(0, 300));
      return res.status(502).json({
        ok: false,
        error: 'bog_token_error',
        status: tokenRes.status,
        detail: errText.slice(0, 300),
      });
    }

    const tokenData = await tokenRes.json();
    accessToken = tokenData.access_token;
    console.log('[quickpay] ✅ Access token received');
  } catch (err) {
    console.error('[quickpay] Token exception:', err.message);
    return res.status(500).json({ ok: false, error: 'bog_token_exception', message: err.message });
  }

  // ─── Step 2: Create Payment ───
  const siteUrl = process.env.VITE_SITE_URL || 'http://localhost:3000';
  const orderId = `DNG_${userId}_${pkgKey}_${billingCycle}_${Date.now()}`;

  try {
    console.log('[quickpay] Creating BOG payment...');
    
    const paymentRes = await fetch('https://api.bog.ge/payments/v1/ecommerce/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        callback_url: `${siteUrl}/api/quickpay-callback`,
        external_order_id: orderId,
        purchase_units: {
          currency: 'GEL',
          total_amount: amountGEL,
          basket: [{
            product_id: pkgKey,
            name: `DNG ${pkgKey} - ${billingCycle}`,
            quantity: 1,
            unit_price: amountGEL,
          }],
        },
        redirect_urls: {
          success: `${siteUrl}/dashboard?payment=success`,
          fail: `${siteUrl}/packages?payment=failed`,
        },
      }),
    });

    if (!paymentRes.ok) {
      const errText = await paymentRes.text();
      console.error('[quickpay] BOG payment error:', paymentRes.status, errText.slice(0, 500));
      return res.status(502).json({
        ok: false,
        error: 'bog_payment_error',
        status: paymentRes.status,
        detail: errText.slice(0, 500),
      });
    }

    const paymentData = await paymentRes.json();
    console.log('[quickpay] ✅ Payment created:', paymentData.order_id);

    return res.status(200).json({
      ok: true,
      paymentUrl: paymentData.redirect_url,
      paymentId: paymentData.order_id,
      orderId: orderId,
      amountGEL: amountGEL,
      package: pkgKey,
      billingCycle: billingCycle,
      testMode: !USE_REAL_PRICES,
    });
  } catch (err) {
    console.error('[quickpay] Payment exception:', err.message);
    return res.status(500).json({ ok: false, error: 'bog_payment_exception', message: err.message });
  }
};