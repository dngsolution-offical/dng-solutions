// src/hooks/useFreeTrial.js
// Firebase Lite compatible — uses getDoc + polling instead of onSnapshot
import { useState, useEffect, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore/lite';
import { db } from '../firebase';

export const PACKAGE_LIMITS = {
  Free: { maxOrders: 10, maxFiles: 0, maxAgents: 1 },
  Basic: { maxOrders: 100, maxFiles: 1, maxAgents: 2 },
  Gold: { maxOrders: 500, maxFiles: 3, maxAgents: 4 },
  Diamond: { maxOrders: 2000, maxFiles: 5, maxAgents: 7 },
  Infinity: { maxOrders: -1, maxFiles: 10, maxAgents: 9 },
};

const POLL_INTERVAL = 15000; // 15s — user data rarely changes

export function useFreeTrial(uid) {
  const [trialData, setTrialData] = useState({
    package: 'Free',
    expiresAt: null,
    ordersUsed: 0,
    isExpired: false,
  });
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const cancelledRef = useRef(false);

  // Load user data (polling)
  useEffect(() => {
    cancelledRef.current = false;

    if (!uid) {
      setLoading(false);
      return;
    }

    async function loadUserData() {
      try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (cancelledRef.current) return;

        if (snap.exists()) {
          const data = snap.data();
          let pkg = data.package || 'Free';
          let expiresAt = data.expiresAt?.toDate ? data.expiresAt.toDate() : null;
          let isExpired = false;

          if (pkg !== 'Free' && expiresAt) {
            if (new Date() > expiresAt) {
              isExpired = true;
              pkg = 'Free';
            }
          }

          setTrialData({
            ...data,
            package: pkg,
            expiresAt,
            isExpired,
            ordersUsed: data.ordersUsed || 0,
          });
        } else {
          setTrialData({
            package: 'Free',
            expiresAt: null,
            ordersUsed: 0,
            isExpired: false,
          });
        }
        setLoading(false);
      } catch (e) {
        console.warn('[useFreeTrial]', e.message);
        if (!cancelledRef.current) setLoading(false);
      }
    }

    loadUserData();
    const timer = setInterval(loadUserData, POLL_INTERVAL);

    return () => {
      cancelledRef.current = true;
      clearInterval(timer);
    };
  }, [uid]);

  // Live countdown timer
  useEffect(() => {
    if (!trialData.expiresAt || trialData.isExpired) {
      setTimeLeft(null);
      return;
    }

    const timer = setInterval(() => {
      const distance = trialData.expiresAt.getTime() - Date.now();
      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [trialData.expiresAt, trialData.isExpired]);

  // Deprecated — activation via backend only
  const activatePackage = async () => {
    console.error('[useFreeTrial] activatePackage disabled — use backend payment');
    return { ok: false, error: 'Use /checkout payment flow' };
  };

  return { trialData, timeLeft, loading, activatePackage };
}