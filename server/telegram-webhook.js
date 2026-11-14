// server/telegram-webhook.js — Telegram ბოტის webhook (ka ტექსტები, სუფთა UTF-8)
const { initializeFirebase } = require('./_firebase.cjs');
const { sendMessage, sendDocument } = require('./_telegram.cjs');
const { runAgent, TELEGRAM_LIMITS, ApiError } = require('./_ai-core.cjs');
const { AGENTS } = require('./_agents.cjs');
const { buildXlsxBuffer } = require('./_files.cjs');

const HELP = [
  'გამარჯობა! მე ვარ DNG AI ასისტენტი.',
  '',
  'რითი შემიძლია დაგეხმაროთ? დამისვით კითხვა ჩვეულებრივი ტექსტით, ან მითხარით',
  'რა თემაზე გსურთ საუბარი — ბიზნესი, ფინანსები, მარკეტინგი თუ სხვა.',
  '',
  'თუ გჭირდებათ ფაილი (მაგალითად Excel ცხრილი), უბრალოდ დამიწერეთ რა',
  'ინფორმაცია გჭირდებათ შიგნით, და მე თავად მოვამზადებ და გამოგიგზავნით.',
  '',
  'შეგიძლიათ მომწეროთ ნებისმიერ ენაზე — ქართულად, ინგლისურად, რუსულად თუ სხვა.',
  'You can write to me in any language — I will reply in the same language you use.',
  '',
  'ბრძანებები: /agents (აგენტების სია), /agent <სახელი> (აგენტის არჩევა)',
].join('\n');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && req.headers['x-telegram-bot-api-secret-token'] !== secret) {
    return res.status(401).end();
  }

  const update = req.body || {};
  const msg = update.message || update.edited_message;
  if (!msg || !msg.chat) return res.json({ ok: true });

  const chatId = msg.chat.id;
  const text = String(msg.text || msg.caption || '').trim();

  try {
    const { db, FieldValue } = initializeFirebase();
    const linkRef = db.collection('telegram_links').doc(String(chatId));

    if (!text) {
      await sendMessage(chatId, 'გთხოვთ, გამომიგზავნოთ ტექსტური შეტყობინება.');
      return res.json({ ok: true });
    }

    if (text === '/start' || text.startsWith('/start ')) {
      const code = text.split(/\s+/)[1];

      if (!code) {
        await sendMessage(
          chatId,
          [
            'მოგესალმებით DNG AI-ში!',
            '',
            'ანგარიშის დასაკავშირებლად საჭიროა ვერიფიკაციის კოდი.',
            'კოდის მისაღებად გახსენით საიტი, შედით თქვენს ანგარიშზე და',
            'გვერდზე "Telegram" დააჭირეთ ღილაკს "ახალი კოდის მიღება".',
            '',
            'შემდეგ გამომიგზავნეთ: /start <თქვენი კოდი>',
          ].join('\n')
        );
        return res.json({ ok: true });
      }

      const codeRef = db.collection('telegram_codes').doc(code.toUpperCase());
      const codeSnap = await codeRef.get();
      const data = codeSnap.exists ? codeSnap.data() : null;

      if (!data || data.expiresAt.toMillis() < Date.now()) {
        await sendMessage(chatId, 'კოდი არასწორია ან ვადა გაუვიდა. გთხოვთ, საიტიდან მიიღოთ ახალი კოდი.');
        return res.json({ ok: true });
      }

      const userSnap = await db.collection('users').doc(data.uid).get();
      const pkg = (userSnap.exists && userSnap.data().package) || 'Free';
      const limit = TELEGRAM_LIMITS[pkg] || 0;

      if (!limit) {
        await sendMessage(chatId, 'სამწუხაროდ, Telegram ბოტი თქვენს მიმდინარე პაკეტში არ შედის.');
        return res.json({ ok: true });
      }

      const linked = await db.collection('telegram_links').where('uid', '==', data.uid).get();
      const alreadyHere = linked.docs.some((d) => d.id === String(chatId));
      if (!alreadyHere && linked.size >= limit) {
        await sendMessage(chatId, `თქვენი პაკეტის ბოტების ლიმიტი (${limit}) უკვე ამოწურულია.`);
        return res.json({ ok: true });
      }

      await linkRef.set(
        {
          uid: data.uid,
          chatId: String(chatId),
          agent: 'standard',
          linkedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      await codeRef.delete();

      await sendMessage(
        chatId,
        [
          'ანგარიში წარმატებით დაკავშირდა!',
          '',
          HELP,
        ].join('\n')
      );
      return res.json({ ok: true });
    }

    if (text === '/help') {
      await sendMessage(chatId, HELP);
      return res.json({ ok: true });
    }

    if (text === '/agents') {
      const list = Object.entries(AGENTS)
        .map(([k, a]) => `${k} — ${a.label} (${a.minPkg}+)`)
        .join('\n');
      await sendMessage(chatId, `ხელმისაწვდომი აგენტები:\n\n${list}\n\nაირჩევისთვის: /agent <სახელი>`);
      return res.json({ ok: true });
    }

    const linkSnap = await linkRef.get();
    if (!linkSnap.exists) {
      await sendMessage(
        chatId,
        'ჯერ არ ხართ დაკავშირებული. გთხოვთ, გაუგზავნოთ /start და ვერიფიკაციის კოდი, რომელსაც საიტზე "Telegram" გვერდზე მიიღებთ.'
      );
      return res.json({ ok: true });
    }
    const link = linkSnap.data();

    if (text.startsWith('/agent ')) {
      const key = text.split(/\s+/)[1];
      if (!AGENTS[key]) {
        await sendMessage(chatId, 'ასეთი აგენტი ვერ მოიძებნა. სრული სია: /agents');
        return res.json({ ok: true });
      }
      await linkRef.set({ agent: key }, { merge: true });
      await sendMessage(chatId, `აგენტი შეიცვალა: ${AGENTS[key].label}. ახლა დამისვით კითხვა.`);
      return res.json({ ok: true });
    }

    const result = await runAgent({
      uid: link.uid,
      agentKey: link.agent || 'standard',
      text,
      source: 'telegram',
    });

    await sendMessage(chatId, result.reply || 'პასუხის მომზადება ვერ მოხერხდა, სცადეთ ხელახლა.');

    for (const f of result.files || []) {
      const buf = f.excelData ? await buildXlsxBuffer(f.excelData.sheets) : Buffer.from(f.content || '', 'utf8');
      await sendDocument(chatId, buf, f.name, 'DNG AI-მ მოამზადა თქვენი ფაილი');
    }
  } catch (e) {
    const userText = e instanceof ApiError ? e.message : 'მოხდა შეცდომა, გთხოვთ სცადოთ ხელახლა.';
    console.error('[telegram]', e.message);
    await sendMessage(chatId, userText).catch(() => {});
  }

  return res.json({ ok: true });
};