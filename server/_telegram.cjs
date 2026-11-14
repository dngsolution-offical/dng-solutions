// api/_telegram.cjs — Telegram Bot API გამოძახებები
function token() {
  const t = process.env.TELEGRAM_BOT_TOKEN;
  if (!t) throw new Error('TELEGRAM_BOT_TOKEN არ არის დაყენებული');
  return t;
}

async function tg(method, payload, asForm = false) {
  const r = await fetch(`https://api.telegram.org/bot${token()}/${method}`, {
    method: 'POST',
    headers: asForm ? undefined : { 'content-type': 'application/json' },
    body: asForm ? payload : JSON.stringify(payload),
  });
  const d = await r.json().catch(() => ({ ok: false }));
  if (!d.ok) throw new Error(`telegram_${method}: ${d.description || r.status}`);
  return d.result;
}

async function sendMessage(chatId, text) {
  const s = String(text || '');
  for (let i = 0; i < s.length; i += 4000) {
    await tg('sendMessage', { chat_id: chatId, text: s.slice(i, i + 4000) });
  }
}

async function sendDocument(chatId, buffer, filename, caption) {
  const form = new FormData();
  form.append('chat_id', String(chatId));
  if (caption) form.append('caption', String(caption).slice(0, 1000));
  form.append('document', new Blob([buffer]), filename);
  return tg('sendDocument', form, true);
}

module.exports = { sendMessage, sendDocument };