// src/utils/adminSecurity.js
// 3-attempt lockout logic with email alert (EmailJS)
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore/lite';
import { db } from '../firebase';
import emailjs from '@emailjs/browser';

const MAX_ATTEMPTS = 3;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

const DOC_REF = (email) =>
  doc(db, 'admin_attempts', email.toLowerCase().replace(/[^a-z0-9]/g, '_'));

/**
 * Get current lock status for an email.
 * Returns { locked: boolean, attemptsLeft: number, lockedUntil: Date|null, reason: string }
 */
export async function getLockStatus(email) {
  try {
    const ref = DOC_REF(email);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return { locked: false, attemptsLeft: MAX_ATTEMPTS, lockedUntil: null, reason: 'ok' };
    }

    const data = snap.data();
    const now = Date.now();

    // Check permanent lock (from admin action)
    if (data.permanentLock === true) {
      return {
        locked: true,
        attemptsLeft: 0,
        lockedUntil: null,
        reason: 'permanent',
      };
    }

    // Check temporary lock
    if (data.lockedUntil) {
      const lockedUntilMs = data.lockedUntil.toMillis
        ? data.lockedUntil.toMillis()
        : new Date(data.lockedUntil).getTime();

      if (lockedUntilMs > now) {
        return {
          locked: true,
          attemptsLeft: 0,
          lockedUntil: new Date(lockedUntilMs),
          reason: 'temporary',
        };
      }

      // Lock expired — reset attempts
      await updateDoc(ref, {
        attempts: 0,
        lockedUntil: null,
        lastResetAt: serverTimestamp(),
      });
      return { locked: false, attemptsLeft: MAX_ATTEMPTS, lockedUntil: null, reason: 'expired' };
    }

    const attempts = data.attempts || 0;
    return {
      locked: false,
      attemptsLeft: Math.max(0, MAX_ATTEMPTS - attempts),
      lockedUntil: null,
      reason: 'ok',
    };
  } catch (err) {
    console.error('getLockStatus error:', err);
    return { locked: false, attemptsLeft: MAX_ATTEMPTS, lockedUntil: null, reason: 'error' };
  }
}

/**
 * Record a failed login attempt. If attempts >= 3, lock for 15 min + send email.
 * Returns updated status.
 */
export async function recordFailedAttempt(email) {
  const ref = DOC_REF(email);
  const snap = await getDoc(ref);
  const now = Date.now();

  let attempts = 1;
  let lockedUntil = null;
  let justLocked = false;

  if (snap.exists()) {
    const data = snap.data();
    attempts = (data.attempts || 0) + 1;

    if (attempts >= MAX_ATTEMPTS) {
      lockedUntil = new Date(now + LOCK_DURATION_MS);
      justLocked = true;
    }

    await updateDoc(ref, {
      attempts,
      lockedUntil: lockedUntil ? lockedUntil : null,
      lastAttemptAt: serverTimestamp(),
      lastAttemptIp: 'client', // browser cannot reliably get real IP without a server
    });
  } else {
    await setDoc(ref, {
      email: email.toLowerCase(),
      attempts: 1,
      lockedUntil: null,
      permanentLock: false,
      createdAt: serverTimestamp(),
      lastAttemptAt: serverTimestamp(),
    });
  }

  // Send email alert on lock
  if (justLocked) {
    await sendLockAlertEmail(email, attempts);
  }

  return {
    locked: justLocked,
    attemptsLeft: Math.max(0, MAX_ATTEMPTS - attempts),
    lockedUntil,
    justLocked,
  };
}

/**
 * Reset attempts on successful login.
 */
export async function resetAttempts(email) {
  try {
    const ref = DOC_REF(email);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, {
        attempts: 0,
        lockedUntil: null,
        lastSuccessAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.error('resetAttempts error:', err);
  }
}

/**
 * Send lock alert email via EmailJS.
 * Requires VITE_EMAILJS_* env vars to be set.
 */
async function sendLockAlertEmail(email, attempts) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.warn('EmailJS env vars not set — skipping lock alert email.');
    return;
  }

  const now = new Date();
  const unlockAt = new Date(now.getTime() + LOCK_DURATION_MS);

  const payload = {
    to_email: email,
    subject: 'SECURITY ALERT: Admin account locked',
    message: [
      'Your admin account has been locked after 3 failed login attempts.',
      '',
      'Account: ' + email,
      'Attempts: ' + attempts,
      'Time: ' + now.toISOString(),
      'Unlocks automatically at: ' + unlockAt.toISOString(),
      '',
      'If this was NOT you, someone is trying to access your admin panel.',
      'Immediately:',
      '  1. Change your password at /login',
      '  2. Enable 2FA on your Gmail',
      '  3. Check Firebase Console for unusual activity',
      '',
      'DNG Solutions Security',
    ].join('\n'),
    from_name: 'DNG Security',
    from_email: email,
  };

  try {
    await emailjs.send(serviceId, templateId, payload, publicKey);
    console.log('Lock alert email sent to', email);
  } catch (err) {
    console.error('Failed to send lock alert email:', err);
  }
}

export { MAX_ATTEMPTS, LOCK_DURATION_MS };