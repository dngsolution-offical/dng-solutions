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
  console.log('=================================================');
  console.log('  FULL DIAGNOSTIC');
  console.log('=================================================');
  console.log('');

  // 1) List ALL usernames
  console.log('[1/4] ALL usernames in collection:');
  const usernamesSnap = await db.collection('usernames').get();
  if (usernamesSnap.empty) {
    console.log('  EMPTY! No usernames saved.');
  } else {
    usernamesSnap.forEach((doc) => {
      const d = doc.data();
      console.log('  Key: "' + doc.id + '"');
      console.log('    username: "' + d.username + '"');
      console.log('    uid: "' + d.uid + '"');
      console.log('    internalEmail: "' + d.internalEmail + '"');
      console.log('    isAdmin: ' + d.isAdmin);
    });
  }

  // 2) List ALL Firebase Auth users
  console.log('');
  console.log('[2/4] ALL Firebase Auth users:');
  const listResult = await auth.listUsers(100);
  if (listResult.users.length === 0) {
    console.log('  EMPTY! No users.');
  } else {
    listResult.users.forEach((u) => {
      console.log('  Email: "' + (u.email || 'N/A') + '"');
      console.log('    UID: "' + u.uid + '"');
      console.log('    DisplayName: "' + (u.displayName || 'N/A') + '"');
      console.log('    Admin claim: ' + (u.customClaims?.admin === true));
      console.log('    Disabled: ' + u.disabled);
      console.log('    Email verified: ' + u.emailVerified);
    });
  }

  // 3) Check admin_attempts (lockout status)
  console.log('');
  console.log('[3/4] admin_attempts (lockouts):');
  const attemptsSnap = await db.collection('admin_attempts').get();
  if (attemptsSnap.empty) {
    console.log('  EMPTY (no failed attempts)');
  } else {
    attemptsSnap.forEach((doc) => {
      const d = doc.data();
      console.log('  Key: "' + doc.id + '"');
      console.log('    attempts: ' + d.attempts);
      const lockedUntil = d.lockedUntil?.toMillis ? d.lockedUntil.toMillis() : (d.lockedUntil ? new Date(d.lockedUntil).getTime() : 0);
      if (lockedUntil > Date.now()) {
        console.log('    LOCKED UNTIL: ' + new Date(lockedUntil).toISOString());
      } else {
        console.log('    lockedUntil: not locked');
      }
    });
  }

  // 4) Test specific username
  console.log('');
  console.log('[4/4] Testing username lookup:');
  const testUsername = 'dng_adminmaster_2026';
  console.log('  Looking for key: "' + testUsername + '"');
  const testDoc = await db.collection('usernames').doc(testUsername).get();
  if (testDoc.exists) {
    console.log('  FOUND!');
    const d = testDoc.data();
    console.log('    uid: "' + d.uid + '"');
    console.log('    internalEmail: "' + d.internalEmail + '"');

    // Try to fetch the Firebase user
    try {
      const u = await auth.getUser(d.uid);
      console.log('    Firebase user exists: YES');
      console.log('    Admin claim: ' + (u.customClaims?.admin === true));
      console.log('    Disabled: ' + u.disabled);
    } catch (e) {
      console.log('    Firebase user exists: NO — ' + e.message);
    }
  } else {
    console.log('  NOT FOUND! This is why login fails.');
  }

  console.log('');
  console.log('=================================================');
  process.exit(0);
})();