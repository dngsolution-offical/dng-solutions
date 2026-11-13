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
  console.log('=== USERNAMES IN FIRESTORE ===');
  const snap = await db.collection('usernames').get();
  if (snap.empty) {
    console.log('  (EMPTY — no usernames exist!)');
  } else {
    snap.forEach(doc => {
      const d = doc.data();
      console.log('  Key: "' + doc.id + '"');
      console.log('    username: "' + d.username + '"');
      console.log('    uid: "' + d.uid + '"');
    });
  }

  console.log('');
  console.log('=== ADMIN ATTEMPTS (lockouts) ===');
  const att = await db.collection('admin_attempts').get();
  if (att.empty) {
    console.log('  (EMPTY — no lockouts)');
  } else {
    att.forEach(doc => {
      const d = doc.data();
      console.log('  Key: "' + doc.id + '" | attempts: ' + d.attempts + ' | lockedUntil: ' + (d.lockedUntil || 'none'));
    });
  }

  console.log('');
  process.exit(0);
})();