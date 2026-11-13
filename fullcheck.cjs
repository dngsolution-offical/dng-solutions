const fs = require('fs');
const path = require('path');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

const sa = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-key.json'), 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(sa) });
const auth = getAuth();
const db = getFirestore();

(async () => {
  console.log('');
  console.log('=== FULL USERNAME DOC ===');
  const doc = await db.collection('usernames').doc('dng_adminmaster_2026').get();
  if (doc.exists) {
    console.log(JSON.stringify(doc.data(), null, 2));
  } else {
    console.log('DOC DOES NOT EXIST');
  }

  console.log('');
  console.log('=== FIREBASE AUTH USER (UID: NDrP0fb0DbdzjFzIP7TaDcTNB9C3) ===');
  try {
    const user = await auth.getUser('NDrP0fb0DbdzjFzIP7TaDcTNB9C3');
    console.log('  Email: ' + user.email);
    console.log('  DisplayName: ' + user.displayName);
    console.log('  Disabled: ' + user.disabled);
    console.log('  EmailVerified: ' + user.emailVerified);
    console.log('  AdminClaim: ' + (user.customClaims?.admin === true));
  } catch (e) {
    console.log('  ERROR: ' + e.message);
  }

  console.log('');
  process.exit(0);
})();