const fs = require('fs');
const path = require('path');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

const newUsername = process.argv[2];
const newPassword = process.argv[3];

if (!newUsername || !newPassword) {
  console.error('Usage: node create-fresh-admin.cjs <username> <password>');
  process.exit(1);
}

const sa = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-key.json'), 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(sa) });
const auth = getAuth();
const db = getFirestore();

(async () => {
  try {
    console.log('');
    console.log('=================================================');
    console.log('  CLEANUP + CREATE NEW ADMIN');
    console.log('=================================================');
    console.log('');
    console.log('New username: ' + newUsername);
    console.log('');

    // ============================================
    // STEP 1: Delete ALL old usernames mappings
    // ============================================
    console.log('[1/6] Deleting ALL old usernames...');
    const oldUsernames = await db.collection('usernames').get();
    for (const doc of oldUsernames.docs) {
      console.log('  Deleting: ' + doc.id);
      await doc.ref.delete();
    }
    console.log('  Done. ' + oldUsernames.size + ' old usernames removed.');

    // ============================================
    // STEP 2: Delete ALL old admin_attempts
    // ============================================
    console.log('');
    console.log('[2/6] Clearing ALL admin_attempts (lockouts)...');
    const oldAttempts = await db.collection('admin_attempts').get();
    for (const doc of oldAttempts.docs) {
      console.log('  Deleting: ' + doc.id);
      await doc.ref.delete();
    }
    console.log('  Done. ' + oldAttempts.size + ' lockouts cleared.');

    // ============================================
    // STEP 3: Find and delete old admin users
    // ============================================
    console.log('');
    console.log('[3/6] Finding old admin Firebase users...');
    const allUsers = await auth.listUsers(1000);
    const oldAdminUsers = allUsers.users.filter(u => {
      const claims = u.customClaims || {};
      return claims.admin === true && u.email && u.email.includes('@admin.dngmind.internal');
    });

    for (const u of oldAdminUsers) {
      console.log('  Deleting user: ' + u.email + ' (UID: ' + u.uid + ')');
      await auth.deleteUser(u.uid);
    }
    console.log('  Done. ' + oldAdminUsers.length + ' old admin users removed.');

    // ============================================
    // STEP 4: Create new Firebase user
    // ============================================
    console.log('');
    console.log('[4/6] Creating new Firebase user...');
    const newInternalEmail = (newUsername.toLowerCase().replace(/[^a-z0-9]/g, '_')) + '@admin.dngmind.internal';
    console.log('  Internal email: ' + newInternalEmail);

    const newUser = await auth.createUser({
      email: newInternalEmail,
      password: newPassword,
      emailVerified: true,
      displayName: newUsername,
    });
    console.log('  Created UID: ' + newUser.uid);

    // ============================================
    // STEP 5: Set admin claim
    // ============================================
    console.log('');
    console.log('[5/6] Setting admin claim...');
    await auth.setCustomUserClaims(newUser.uid, { admin: true });
    console.log('  Admin claim set.');

    // ============================================
    // STEP 6: Save username mapping + user profile
    // ============================================
    console.log('');
    console.log('[6/6] Saving username mapping + profile...');
    const usernameKey = newUsername.toLowerCase();
    await db.collection('usernames').doc(usernameKey).set({
      username: usernameKey,
      originalUsername: newUsername,
      uid: newUser.uid,
      internalEmail: newInternalEmail,
      isAdmin: true,
      createdAt: new Date().toISOString(),
    });
    console.log('  Mapping saved: ' + usernameKey);

    await db.collection('users').doc(newUser.uid).set({
      name: newUsername,
      email: newInternalEmail,
      username: newUsername,
      package: 'Infinity',
      ordersUsed: 0,
      isAdminAccount: true,
      createdAt: new Date().toISOString(),
    }, { merge: true });
    console.log('  Profile saved.');

    // ============================================
    // SUCCESS
    // ============================================
    console.log('');
    console.log('=================================================');
    console.log('  SUCCESS!');
    console.log('=================================================');
    console.log('');
    console.log('Login at: http://localhost:3000/admin/login');
    console.log('');
    console.log('  Username: ' + newUsername);
    console.log('  Password: ' + newPassword);
    console.log('');
    console.log('5 attempts before lockout (15 minutes).');
    console.log('');
    process.exit(0);
  } catch (err) {
    console.error('');
    console.error('ERROR: ' + err.message);
    console.error('');
    process.exit(1);
  }
})();