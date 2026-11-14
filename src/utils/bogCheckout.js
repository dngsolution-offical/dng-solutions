// src/utils/bogCheckout.js — BOG გადახდის დაწყება
import { auth } from '../firebase';

export async function startBogCheckout(packageId, billingCycle) {
  const user = auth.currentUser;
  if (!user) throw new Error('not_signed_in');

  const idToken = await user.getIdToken(true);
  const res = await fetch('/api/bog-create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ packageId, billingCycle }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.redirectUrl) {
    throw new Error(data.message || data.error || 'გადახდის დაწყება ვერ მოხერხდა');
  }

  sessionStorage.setItem('dng_bog_order', data.orderId);
  window.location.href = data.redirectUrl;
}