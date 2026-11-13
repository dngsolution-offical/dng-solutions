// src/utils/firestorePolling.js
// Replaces onSnapshot() with polling (Brave-friendly with Firestore Lite)

import { doc, getDoc, collection, query, getDocs } from 'firebase/firestore/lite';

/**
 * Poll a single document
 * @param {Firestore} db
 * @param {string} docPath - "collection/docId"
 * @param {Function} callback - (data | null) => void
 * @param {number} intervalMs - default 5000 (5s)
 * @returns {Function} unsubscribe
 */
export function pollDoc(db, docPath, callback, intervalMs = 5000) {
  let cancelled = false;
  let lastData = null;

  async function fetchOnce() {
    if (cancelled) return;
    try {
      const snap = await getDoc(doc(db, docPath));
      const data = snap.exists() ? { ...snap.data(), id: snap.id } : null;
      
      // Only call callback if data changed
      const jsonNew = JSON.stringify(data);
      if (jsonNew !== lastData) {
        lastData = jsonNew;
        callback(data);
      }
    } catch (e) {
      console.warn('[pollDoc]', docPath, e.message);
    }
  }

  fetchOnce();
  const timer = setInterval(fetchOnce, intervalMs);

  return () => {
    cancelled = true;
    clearInterval(timer);
  };
}

/**
 * Poll a collection with query
 * @param {Firestore} db
 * @param {Query} q - Firestore query
 * @param {Function} callback - (docs[]) => void
 * @param {number} intervalMs - default 5000
 * @returns {Function} unsubscribe
 */
export function pollQuery(db, q, callback, intervalMs = 5000) {
  let cancelled = false;
  let lastData = null;

  async function fetchOnce() {
    if (cancelled) return;
    try {
      const snap = await getDocs(q);
      const docs = [];
      snap.forEach(d => docs.push({ ...d.data(), id: d.id }));

      const jsonNew = JSON.stringify(docs);
      if (jsonNew !== lastData) {
        lastData = jsonNew;
        callback(docs);
      }
    } catch (e) {
      console.warn('[pollQuery]', e.message);
    }
  }

  fetchOnce();
  const timer = setInterval(fetchOnce, intervalMs);

  return () => {
    cancelled = true;
    clearInterval(timer);
  };
}