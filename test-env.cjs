const dotenv = require('dotenv');
dotenv.config();

const admin = require('firebase-admin');
const Anthropic = require('@anthropic-ai/sdk');

async function testEnv() {
  console.log('\n🔍 .ENV ფაილის შემოწმება...\n');

  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_PROJECT_ID',
    'ANTHROPIC_API_KEY',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
    'VITE_EMAILJS_PUBLIC_KEY',
    'CLAUDE_MODEL'
  ];

  required.forEach(k => {
    if (!process.env[k] || process.env[k].trim() === '') {
      console.log(`❌ ${k} - აკლია`);
    } else {
      console.log(`✅ ${k} - არსებობს`);
    }
  });

  // Private Key Format
  console.log('\n🛡️ FIREBASE_PRIVATE_KEY ფორმატის შემოწმება...');
  const pk = process.env.FIREBASE_PRIVATE_KEY || '';
  if (pk.startsWith('"') && pk.endsWith('"')) console.log('✅ ბრჭყალებშია');
  if (pk.includes('\\n')) console.log('✅ \\n სიმბოლოები აქვს');

  // Firebase Test
  console.log('\n🔥 Firebase Admin-ის ტესტირება...');
  try {
    const privateKey = pk.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
    }
    console.log('✅ Firebase Admin წარმატებით დაუკავშირდა!');
  } catch (err) {
    console.log('❌ Firebase Admin შეცდომა: ' + err.message);
  }

  // Claude Haiku Test
  const model = process.env.CLAUDE_MODEL || 'claude-3-5-haiku-latest';
  console.log(`\n🤖 Claude AI-ს ტესტირება (${model})...`);
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await anthropic.messages.create({
      model: model,
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Say OK' }],
    });
    console.log('✅ Claude API მუშაობს! პასუხი: ' + msg.content[0].text);
    console.log(`   📊 Tokens: Input ${msg.usage.input_tokens}, Output ${msg.usage.output_tokens}`);
    console.log(`   💰 Estimated cost: $${((msg.usage.input_tokens * 0.8 + msg.usage.output_tokens * 4) / 1000000).toFixed(6)}`);
  } catch (err) {
    console.log('❌ Claude API შეცდომა: ' + err.message);
  }
  
  console.log('\n════════════════════════════════════════════════════════');
}

testEnv();
