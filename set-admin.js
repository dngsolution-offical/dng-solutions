// set-admin.js — Set admin claim
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const email = process.argv[2] || 'admin@dng-solutions.com';

if (!admin.apps.length) {
  const sa = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'firebase-key.json'), 'utf8'));
  admin.initializeApp({ credential: admin.cert(sa) });
}

(async () => {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log('');
    console.log('✅ Admin claim set!');
    console.log('   Email:', email);
    console.log('   UID:', user.uid);
    console.log('');
    console.log('NEXT:');
    console.log('   1. Logout: http://localhost:3000/login');
    console.log('   2. Login again (refresh token)');
    console.log('   3. Open: http://localhost:3000/admin');
    console.log('');
    process.exit(0);
  } catch (e) {
    console.error('❌ Failed:', e.message);
    if (e.code === 'auth/user-not-found') {
      console.log('');
      console.log('→ User not registered. First register:');
      console.log('  http://localhost:3000/register');
      console.log('  Email:', email);
      console.log('  Password: Test1234');
    }
    process.exit(1);
  }
})();