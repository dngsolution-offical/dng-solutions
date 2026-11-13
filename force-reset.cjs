const fs = require('fs');
const path = require('path');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const password = process.argv[2];
const uid = 'zglIipHDthQ52xzNTctkgzuq9Ml1'; // from your Firestore

if (!password) {
  console.error('Usage: node force-reset.cjs <password>');
  process.exit(1);
}

const sa = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-key.json'), 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(sa) });
const auth = getAuth();

(async () => {
  try {
    console.log('');
    console.log('[1/2] Updating password for UID: ' + uid);
    await auth.updateUser(uid, {
      password,
      emailVerified: true,
      disabled: false,
    });
    console.log('  Password updated');

    console.log('');
    console.log('[2/2] Verifying admin claim...');
    const user = await auth.getUser(uid);
    if (user.customClaims?.admin !== true) {
      console.log('  Admin claim missing — setting it...');
      await auth.setCustomUserClaims(uid, { admin: true });
      console.log('  Admin claim set');
    } else {
      console.log('  Admin claim OK');
    }

    console.log('');
    console.log('=================================================');
    console.log('  PASSWORD RESET SUCCESSFUL');
    console.log('=================================================');
    console.log('');
    console.log('Email (internal): ' + user.email);
    console.log('UID:              ' + user.uid);
    console.log('Password:         ' + password);
    console.log('Admin claim:      ' + (user.customUserClaims?.admin === true || 'set now'));
    console.log('');
    console.log('NOW TRY LOGIN AT: /admin/login');
    console.log('  Username: dng_mastercontrol_2026_x9k7');
    console.log('  Password: ' + password);
    console.log('');
    process.exit(0);
  } catch (err) {
    console.error('ERROR: ' + err.message);
    process.exit(1);
  }
})();