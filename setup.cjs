const fs = require('fs');
const path = require('path');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
  console.error('Usage: node setup.cjs <username> <password>');
  process.exit(1);
}

const internalEmail = (username.toLowerCase() -replace '[^a-z0-9]', '_') + '@admin.dngmind.internal';

const sa = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-key.json'), 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(sa) });
const auth = getAuth();
const db = getFirestore();

(async () => {
  try {
    console.log('');
    console.log('=================================================');
    console.log('  Creating admin account');
    console.log('=================================================');
    console.log('');
    console.log('Username:       ' + username);
    console.log('Internal email: ' + internalEmail);
    console.log('');

    // 1) Try to find existing user by email
    let user = null;
    try {
      user = await auth.getUserByEmail(internalEmail);
      console.log('[1/4] User already exists: ' + user.uid);
      console.log('      Updating password...');
      await auth.updateUser(user.uid, {
        password,
        emailVerified: true,
        disabled: false,
      });
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        console.log('[1/4] Creating new Firebase user...');
        user = await auth.createUser({
          email: internalEmail,
          password,
          emailVerified: true,
          displayName: username,
        });
        console.log('      Created: ' + user.uid);
      } else {
        throw err;
      }
    }

    // 2) Set admin claim
    console.log('[2/4] Setting admin claim...');
    await auth.setCustomUserClaims(user.uid, { admin: true });
    console.log('      Admin claim set');

    // 3) Save username -> uid mapping
    console.log('[3/4] Saving username mapping...');
    const usernameKey = username.toLowerCase();
    await db.collection('usernames').doc(usernameKey).set({
      username: usernameKey,
      originalUsername: username,
      uid: user.uid,
      internalEmail,
      isAdmin: true,
      createdAt: new Date().toISOString(),
    }, { merge: true });
    console.log('      Mapping saved: ' + usernameKey + ' -> ' + user.uid);

    // 4) Create user profile
    console.log('[4/4] Creating user profile...');
    await db.collection('users').doc(user.uid).set({
      name: username,
      email: internalEmail,
      username: username,
      package: 'Infinity',
      ordersUsed: 0,
      isAdminAccount: true,
      createdAt: new Date().toISOString(),
    }, { merge: true });
    console.log('      Profile created');

    // 5) Reset any existing lockout
    console.log('');
    console.log('[5/5] Resetting lockout status...');
    try {
      await db.collection('admin_attempts').doc(usernameKey).delete();
      console.log('      Lockout cleared');
    } catch (e) {
      console.log('      No lockout to clear');
    }

    console.log('');
    console.log('=================================================');
    console.log('  SUCCESS!');
    console.log('=================================================');
    console.log('');
    console.log('Login at: /admin/login');
    console.log('  Username: ' + username);
    console.log('  Password: ' + password);
    console.log('');
    process.exit(0);
  } catch (err) {
    console.error('');
    console.error('ERROR: ' + err.message);
    console.error('');
    process.exit(1);
  }
})();