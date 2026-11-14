// api/_firebase.cjs — Robust Firebase Admin init
const fs = require('fs');
const path = require('path');

let initialized = false;
let admin = null;
let db = null;
let auth = null;
let initError = null;

function initializeFirebase() {
  if (initialized) {
    if (initError) throw new Error(initError);
    return { admin, db, auth, FieldValue: admin.firestore.FieldValue };
  }
  initialized = true;

  try {
    // Load firebase-admin
    let adminModule;
    try {
      adminModule = require('firebase-admin');
    } catch (e) {
      initError = 'firebase-admin not installed: ' + e.message;
      throw new Error(initError);
    }

    admin = adminModule.default || adminModule;

    if (!admin || typeof admin.initializeApp !== 'function') {
      initError = 'firebase-admin.initializeApp missing';
      throw new Error(initError);
    }

    // Try to load service account
    let sa = null;

    // 1. Try firebase-key.json file
    const keyPath = path.join(process.cwd(), 'firebase-key.json');
    if (fs.existsSync(keyPath)) {
      try {
        sa = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
        console.log('[fb-init] Loaded from firebase-key.json');
      } catch (e) {
        console.error('[fb-init] firebase-key.json parse error:', e.message);
      }
    }

    // 2. Try env FIREBASE_SERVICE_ACCOUNT
    if (!sa && process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log('[fb-init] Loaded from FIREBASE_SERVICE_ACCOUNT env');
      } catch (e) {
        console.error('[fb-init] FIREBASE_SERVICE_ACCOUNT parse error:', e.message);
      }
    }

    // 3. Try individual env vars
    if (!sa && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      sa = {
        project_id: process.env.FIREBASE_PROJECT_ID,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      };
      console.log('[fb-init] Loaded from individual env vars');
    }

    if (!sa || !sa.project_id) {
      initError = 'No Firebase credentials found. Set FIREBASE_SERVICE_ACCOUNT env or firebase-key.json';
      throw new Error(initError);
    }

    // Initialize app
    if (!admin.apps || admin.apps.length === 0) {
      const credential = admin.credential.cert(sa);
      admin.initializeApp({ credential });
      console.log('[fb-init] App initialized for project:', sa.project_id);
    }

    // Get Firestore
    try {
      const firestoreModule = require('firebase-admin/firestore');
      if (typeof firestoreModule.getFirestore === 'function') {
        db = firestoreModule.getFirestore();
      } else {
        db = admin.firestore();
      }
      console.log('[fb-init] Firestore ready');
    } catch (e) {
      db = admin.firestore();
      console.log('[fb-init] Firestore via admin.firestore()');
    }

    // Get Auth
    try {
      const authModule = require('firebase-admin/auth');
      if (typeof authModule.getAuth === 'function') {
        auth = authModule.getAuth();
      } else {
        auth = admin.auth();
      }
      console.log('[fb-init] Auth ready');
    } catch (e) {
      auth = admin.auth();
      console.log('[fb-init] Auth via admin.auth()');
    }

    console.log('[fb-init] All services ready');
    return { admin, db, auth, FieldValue: admin.firestore.FieldValue };
  } catch (e) {
    initError = e.message;
    console.error('[fb-init] FAILED:', e.message);
    throw e;
  }
}

module.exports = { initializeFirebase };