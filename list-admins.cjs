const fs = require('fs');
const path = require('path');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const sa = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-key.json'), 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(sa) });
const auth = getAuth();

(async () => {
  console.log('');
  console.log('=== ALL ADMINS ===');
  const listResult = await auth.listUsers(1000);
  const admins = listResult.users.filter(u => (u.customClaims || {}).admin === true);
  admins.forEach((u, i) => {
    console.log('[' + (i + 1) + '] ' + u.email);
    console.log('    UID: ' + u.uid);
    console.log('    DisplayName: ' + (u.displayName || 'N/A'));
    console.log('    Created: ' + u.metadata.creationTime);
    console.log('');
  });
  console.log('Total: ' + admins.length);
  process.exit(0);
})();