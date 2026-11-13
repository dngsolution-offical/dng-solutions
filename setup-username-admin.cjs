const fs = require('fs');
const path = require('path');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

const username = process.argv[2];
const password = process.argv[3];
const internalEmail = process.argv[4];

if (!username || !password || !internalEmail) {
  console.error('Usage: node setup-username-admin.cjs <username> <password> <internal-email>');
  process.exit(1);
}

const sa = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-key.json'), 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(sa) });
const auth = getAuth();
const db = getFirestore();

(async () => {
  try {
    console.log('');
    console.log('[1/5] Checking if username already exists...');

    // 1) Check if username is already taken
    const usernameDocRef = db.collection('usernames').doc(username.toLowerCase());
    const usernameDoc = await usernameDocRef.get();

    if (usernameDoc.exists) {
      console.log('  Username already exists. Will update password.');

      const existingUid = usernameDoc.data().uid;
      await auth.updateUser(existingUid, {
        password,
        emailVerified: true,
      });
      console.log('  Password updated for UID: ' + existingUid);

      // Update admin claim
      await auth.setCustomUserClaims(existingUid, { admin: true });
      console.log('  Admin claim set');
      console.log('');
      console.log('DONE. Use these credentials on /admin/login:');
      console.log('  Username: ' + username);
      console.log('  Password: ' + password);
      process.exit(0);
    }

    // 2) Create Firebase user with internal email
    console.log('');
    console.log('[2/5] Creating Firebase user...');
    let user;
    try {
      user = await auth.createUser({
        email: internalEmail,
        password,
        emailVerified: true,
        displayName: username,
      });
      console.log('  Created UID: ' + user.uid);
    } catch (err) {
      if (err.code === 'auth/email-already-exists') {
        const existing = await auth.getUserByEmail(internalEmail);
        user = existing;
        console.log('  User already existed: ' + user.uid);
        await auth.updateUser(user.uid, { password, emailVerified: true });
      } else {
        throw err;
      }
    }

    // 3) Set admin claim
    console.log('');
    console.log('[3/5] Setting admin claim...');
    await auth.setCustomUserClaims(user.uid, { admin: true });
    console.log('  Admin claim set');

    // 4) Save username → uid mapping
    console.log('');
    console.log('[4/5] Saving username mapping...');
    await usernameDocRef.set({
      username: username.toLowerCase(),
      uid: user.uid,
      internalEmail,
      createdAt: new Date().toISOString(),
      isAdmin: true,
    });
    console.log('  Mapping saved: ' + username + ' -> ' + user.uid);

    // 5) Save to users collection (so it appears in Admin panel)
    console.log('');
    console.log('[5/5] Creating user profile...');
    await db.collection('users').doc(user.uid).set({
      name: username,
      email: internalEmail,
      username: username,
      package: 'Infinity',
      ordersUsed: 0,
      isAdminAccount: true,
      createdAt: new Date().toISOString(),
    }, { merge: true });
    console.log('  User profile created');

    console.log('');
    console.log('=================================================');
    console.log('  SUCCESS');
    console.log('=================================================');
    console.log('');
    console.log('Login at /admin/login with:');
    console.log('  Username: ' + username);
    console.log('  Password: ' + password);
    console.log('');
    console.log('Internal email (do not use anywhere): ' + internalEmail);
    console.log('');
    process.exit(0);
  } catch (err) {
    console.error('');
    console.error('ERROR: ' + err.message);
    console.error('');
    process.exit(1);
  }
})();