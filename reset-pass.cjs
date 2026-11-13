const fs = require('fs');
const path = require('path');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const uid = 'NDrP0fb0DbdzjFzIP7TaDcTNB9C3';
const password = process.argv[2];

const sa = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-key.json'), 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(sa) });
const auth = getAuth();

(async () => {
  try {
    console.log('');
    console.log('Setting password (exact): "' + password + '"');
    console.log('Length: ' + password.length + ' chars');
    console.log('');

    await auth.updateUser(uid, {
      password: password,
      emailVerified: true,
      disabled: false,
    });

    console.log('SUCCESS - password updated');
    console.log('');
    console.log('=================================================');
    console.log('  LOGIN WITH EXACTLY THESE:');
    console.log('=================================================');
    console.log('');
    console.log('  Username: DNG_AdminMaster_2026');
    console.log('  Password: ' + password);
    console.log('');
    console.log('  Password length: ' + password.length);
    console.log('');
    process.exit(0);
  } catch (err) {
    console.error('ERROR: ' + err.message);
    process.exit(1);
  }
})();