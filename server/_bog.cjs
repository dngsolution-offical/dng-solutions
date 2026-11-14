// server/_bog.cjs — Bank of Georgia (BOG) Payments API helper
// დოკუმენტაცია: https://api.bog.ge/docs/en/payments/introduction
'use strict';

const crypto = require('crypto');

const BOG_CLIENT_ID = process.env.BOG_CLIENT_ID;
const BOG_CLIENT_SECRET = process.env.BOG_CLIENT_SECRET;
const BOG_TOKEN_URL = 'https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token';
const BOG_ORDERS_URL = 'https://api.bog.ge/payments/v1/ecommerce/orders';

// BOG-ის callback-ის ხელმოწერის შესამოწმებელი საჯარო RSA გასაღები (დოკუმენტაციიდან, სტატიკური)
const BOG_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu4RUyAw3+CdkS3ZNILQh
zHI9Hemo+vKB9U2BSabppkKjzjjkf+0Sm76hSMiu/HFtYhqWOESryoCDJoqffY0Q
1VNt25aTxbj068QNUtnxQ7KQVLA+pG0smf+EBWlS1vBEAFbIas9d8c9b9sSEkTrr
TYQ90WIM8bGB6S/KLVoT1a7SnzabjoLc5Qf/SLDG5fu8dH8zckyeYKdRKSBJKvhx
tcBuHV4f7qsynQT+f2UYbESX/TLHwT5qFWZDHZ0YUOUIvb8n7JujVSGZO9/+ll/g
4ZIWhC1MlJgPObDwRkRd8NFOopgxMcMsDIZIoLbWKhHVq67hdbwpAq9K9WMmEhPn
PwIDAQAB
-----END PUBLIC KEY-----`;

let cachedToken = null; // { access_token, expiresAt }

/**
 * OAuth2 client_credentials ტოკენის მიღება (ქეშირებით, ვადის ამოწურვამდე 60 წმ-ით ადრე განახლებით)
 */
async function getAccessToken() {
  if (!BOG_CLIENT_ID || !BOG_CLIENT_SECRET) {
    throw new Error('BOG_CLIENT_ID / BOG_CLIENT_SECRET არ არის კონფიგურირებული');
  }
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60_000) {
    return cachedToken.access_token;
  }

  const basic = Buffer.from(`${BOG_CLIENT_ID}:${BOG_CLIENT_SECRET}`).toString('base64');
  const res = await fetch(BOG_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basic}`,
    },
    body: 'grant_type=client_credentials',
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`BOG auth: invalid JSON response (${res.status}): ${text.slice(0, 300)}`);
  }
  if (!res.ok || !json.access_token) {
    throw new Error(`BOG auth failed (${res.status}): ${text.slice(0, 300)}`);
  }

  // expires_in ზოგჯერ მილიწამებშია, ზოგჯერ წამებში — ორივეს ვამუშავებთ უსაფრთხოდ
  const expiresInMs = json.expires_in > 100000 ? json.expires_in : json.expires_in * 1000;
  cachedToken = {
    access_token: json.access_token,
    expiresAt: now + (Number.isFinite(expiresInMs) ? expiresInMs : 5 * 60 * 1000),
  };
  return cachedToken.access_token;
}

/**
 * BOG-ზე გადახდის ორდერის შექმნა.
 * @param {Object} params
 * @param {string} params.externalOrderId - ჩვენი შიდა ორდერის ID (Firestore doc id)
 * @param {number} params.amountGel - თანხა ლარში (მთელი ან ათწილადი, მაგ. 79, 399.5)
 * @param {string} params.description - ბაზრის აღწერა (მაგ. "Diamond პაკეტი — 1 თვე")
 * @param {string} params.callbackUrl - ჩვენი webhook URL
 * @param {string} params.successUrl
 * @param {string} params.failUrl
 * @param {string} [params.lang] - 'ka' | 'en' | 'ru'(არ არის მხარდაჭერილი BOG-ის მიერ, 'en'-ზე ვაფოლბექებთ)
 */
async function createOrder({ externalOrderId, amountGel, description, callbackUrl, successUrl, failUrl, lang }) {
  const token = await getAccessToken();
  const acceptLanguage = lang === 'ka' ? 'ka' : 'en';
  const amount = Math.round(Number(amountGel) * 100) / 100;

  const body = {
    callback_url: callbackUrl,
    external_order_id: externalOrderId,
    purchase_units: {
      currency: 'GEL',
      total_amount: amount,
      basket: [
        {
          product_id: externalOrderId,
          quantity: 1,
          unit_price: amount,
          description: description || 'DNG Solutions — პაკეტის შეძენა',
        },
      ],
    },
    redirect_urls: {
      success: successUrl,
      fail: failUrl,
    },
    ttl: 20,
  };

  const res = await fetch(BOG_ORDERS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'Accept-Language': acceptLanguage,
      'Idempotency-Key': crypto.randomUUID(),
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`BOG create-order: invalid JSON (${res.status}): ${text.slice(0, 300)}`);
  }
  if (!res.ok) {
    throw new Error(`BOG create-order failed (${res.status}): ${text.slice(0, 500)}`);
  }

  const redirectUrl = json?._links?.redirect?.href;
  if (!json.id || !redirectUrl) {
    throw new Error(`BOG create-order: unexpected response shape: ${text.slice(0, 500)}`);
  }

  return { orderId: json.id, redirectUrl };
}

/**
 * ორდერის დეტალების/სტატუსის წამოღება BOG-იდან (callback-ის სარეზერვო გზა,
 * ან callback-ზე დასტური — ყოველთვის ვამოწმებთ BOG-იდან დაბრუნებით, callback body-ს ნაცვლად)
 */
async function getOrderDetails(orderId) {
  const token = await getAccessToken();
  const res = await fetch(`https://api.bog.ge/payments/v1/receipt/${encodeURIComponent(orderId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`BOG get-order: invalid JSON (${res.status}): ${text.slice(0, 300)}`);
  }
  if (!res.ok) {
    throw new Error(`BOG get-order failed (${res.status}): ${text.slice(0, 300)}`);
  }
  return json;
}

/**
 * Callback-Signature ჰედერის ვერიფიკაცია (SHA256withRSA, BOG-ის საჯარო გასაღებით)
 * @param {Buffer|string} rawBody - დაუმუშავებელი request body (JSON.stringify-მდე/parse-მდე ზუსტად ის bytes, რაც მოვიდა)
 * @param {string} signatureHeader - base64 ხელმოწერა Callback-Signature ჰედერიდან
 */
function verifyCallbackSignature(rawBody, signatureHeader) {
  if (!signatureHeader) return false;
  try {
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(rawBody);
    verifier.end();
    return verifier.verify(BOG_PUBLIC_KEY, signatureHeader, 'base64');
  } catch {
    return false;
  }
}

module.exports = { getAccessToken, createOrder, getOrderDetails, verifyCallbackSignature };
