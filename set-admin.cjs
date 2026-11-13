// set-admin.cjs — Firebase Admin Custom Claims Setup
const fs = require('fs');
const path = require('path');

const email = process.argv[2];
if (!email) {
  console.error('❌ Usage: node set-admin.cjs <email>');
  process.exit(1);
}

let fbVersion = 'unknown';
try { fbVersion = require('firebase-admin/package.json').version; } catch (e) {}
console.log(`📦 firebase-admin version: ${fbVersion}`);

let serviceAccount;
try {
  const candidates = ['firebase-key.json', 'firebase-service-account.json'];
  let foundPath = null;
  for (const name of candidates) {
    const p = path.join(__dirname, name);
    if (fs.existsSync(p)) { foundPath = p; break; }
  }
  if (foundPath) {
    serviceAccount = JSON.parse(fs.readFileSync(foundPath, 'utf8'));
    console.log(`📁 Loaded service account: ${path.basename(foundPath)}`);
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log('📁 Loaded service account: from env var');
  } else {
    console.error('❌ Service account not found (firebase-key.json missing)');
    process.exit(1);
  }
} catch (err) {
  console.error(`❌ Failed to load service account: ${err.message}`);
  process.exit(1);
}

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}
const auth = getAuth();
console.log('✅ Firebase Admin initialized');

(async () => {
  try {
    console.log(`\n🔍 Looking up user: ${email}`);
    const user = await auth.getUserByEmail(email);
    console.log(`✅ Found user: ${user.uid}`);

    const currentClaims = user.customClaims || {};
    if (currentClaims.admin === true) {
      console.log('ℹ️  User already has admin claim. Re-applying...');
    }

    console.log('🔧 Setting admin custom claim...');
    await auth.setCustomUserClaims(user.uid, { ...currentClaims, admin: true });

    console.log('\n✅ Admin claim set successfully!');
    console.log('\n⚠️  IMPORTANT:');
    console.log('   1. Log out of the website');
    console.log('   2. Log back in via /admin/login');
    console.log('   3. Their ID token will now include admin:true\n');
    process.exit(0);
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      console.error(`\n❌ User not found: ${email}`);
      console.error('   Register this email on the website first, then run again.\n');
    } else {
      console.error(`\n❌ Error: ${err.message}\n`);
    }
    process.exit(1);
  }
})();
