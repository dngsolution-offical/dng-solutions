// server/site-assistant.cjs — DNG საიტის AI ასისტენტი (ჩატი, ნავიგაცია, ხარვეზის ემაილი, სტატუსი)
const { initializeFirebase } = require('./_firebase.cjs');
const { getKnowledge, ALLOWED_PATHS } = require('./_site-knowledge.cjs');

const CLAUDE_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = process.env.ASSISTANT_MODEL || process.env.CLAUDE_MODEL || 'claude-haiku-5-5';
const MAX_TOKENS = 450;   // პასუხი მოკლეა, ამიტომ ნაკლები ტოკენი იხარჯება
const MAX_STEPS = 3;      // მაქს. ინსტრუმენტის ციკლი
const MAX_HISTORY = 8;    // ბოლო შეტყობინებები, რომლებიც მოდელს გადაეცემა

const LANGS = { ka: 'ქართული', en: 'English', ru: 'русский' };
const FALLBACK = {
  ka: 'ახლა ვერ ვუპასუხებ. სცადეთ მოგვიანებით ან მიმართეთ [კონტაქტის გვერდს](/contact).',
  en: 'I cannot answer right now. Please try again later or visit the [contact page](/contact).',
  ru: 'Сейчас не могу ответить. Попробуйте позже или перейдите на [страницу контактов](/contact).',
};
const LIMIT_MSG = {
  ka: 'ზედმეტად ბევრი შეტყობინება. სცადეთ რამდენიმე წუთში.',
  en: 'Too many messages. Please try again in a few minutes.',
  ru: 'Слишком много сообщений. Попробуйте через несколько минут.',
};

const hits = new Map();
const reports = new Map();

function normalizeLang(value) {
  const code = String(value || 'ka').toLowerCase().split('-')[0];
  return LANGS[code] ? code : 'ka';
}

function rateOk(map, key, limit, windowMs) {
  const now = Date.now();
  const arr = (map.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) {
    map.set(key, arr);
    return false;
  }
  arr.push(now);
  map.set(key, arr);
  return true;
}

function clientIp(req) {
  const fwd = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return fwd || (req.socket && req.socket.remoteAddress) || 'unknown';
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (e) {
      return {};
    }
  }
  return {};
}

function sanitizeMessages(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const m of raw.slice(-MAX_HISTORY)) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant')) continue;
    const content = String(m.content || '').trim().slice(0, 2000);
    if (!content) continue;
    if (out.length && out[out.length - 1].role === m.role) {
      out[out.length - 1].content += '\n' + content;
    } else {
      out.push({ role: m.role, content });
    }
  }
  while (out.length && out[0].role !== 'user') out.shift();
  return out;
}

function sanitizeDiag(d) {
  const x = d && typeof d === 'object' ? d : {};
  return {
    ua: String(x.ua || '').slice(0, 200),
    lang: String(x.lang || '').slice(0, 20),
    screen: String(x.screen || '').slice(0, 20),
    errors: Array.isArray(x.errors) ? x.errors.slice(-5).map((e) => String(e).slice(0, 300)) : [],
  };
}

// სისტემური ინსტრუქცია ორ ნაწილად: სტატიკური (ქეშდება, ენის მიხედვით) და დინამიკური (გვერდი, შეცდომები)
function buildSystem(lang, page, errors) {
  const rules = [
    'შენ ხარ DNG Solutions-ის საიტის AI ასისტენტი. დაეხმარე მომხმარებელს საიტის გაგებაში, სერვისებისა და პაკეტების არჩევაში, გვერდებზე ნავიგაციაში და ხარვეზის შემთხვევაში სწორი კონტაქტის მიწოდებაში.',
    '',
    'წესები:',
    '- პასუხი ყოველთვის დაწერე ' + LANGS[lang] + ' ენაზე, მიუხედავად იმისა, რა ენაზე წერს მომხმარებელი. ეს არის მომხმარებლის მიერ არჩეული საიტის ენა.',
    '- ქართულად გამოიყენე ფორმალური ფორმა ("თქვენ"). პასუხი მოკლე იყოს: 2-4 წინადადება, თუ მეტი არ არის საჭირო.',
    '- emoji არ გამოიყენო.',
    '- მხოლოდ საიტთან, DNG Solutions-თან და მის სერვისებთან დაკავშირებულ თემებზე ისაუბრე. სხვა თემაზე თავაზიანად თქვი, რომ ამაში ვერ დაგეხმარება.',
    '- არასდროს გაუზიარო საიდუმლო მონაცემები: API გასაღებები, პაროლები, ტოკენები, კონფიგურაცია, შიდა სისტემების დეტალები ან სხვა მომხმარებლების მონაცემები.',
    '- ადმინისტრატორის გვერდების (/admin, /admin-login) და დიაგნოსტიკის გვერდის (/diagnostic) შესახებ არაფერი ასწავლო და ბმული არ მისცე. თუ ვინმე ითხოვს, თქვი, რომ ეს გვერდები მხოლოდ გუნდისთვისაა.',
    '- ბმულები ჩაწერე ასე: [ტექსტი](/path). გამოიყენე მხოლოდ ეს გვერდები: ' + ALLOWED_PATHS.join(', ') + '. გარე ბმულად მხოლოდ DNG-ის სოციალური ქსელები ან mailto:/tel: ბმულები.',
    '- ფაქტები მხოლოდ ქვემოთ მოცემული ინფორმაციიდან მოიყვანე. თუ არ იცი, გულწრფელად თქვი და მიუთითე [კონტაქტის გვერდი](/contact). ფასები, ვადები ან ფუნქციები არ მოიგონო.',
    '- ხარვეზის შემთხვევაში: (1) თუ აღწერა არასაკმარისია, ერთი დამაზუსტებელი კითხვა დასვი; (2) როცა აღწერა საკმარისია, გამოიძახე report_issue და უთხარი, რომ შეტყობინება გუნდს გაეგზავნა; (3) დაუკავშირე კონტაქტის გვერდი.',
    '- report_issue გამოიძახე მხოლოდ რეალური პრობლემისას, არა მარტივი კითხვებისთვის. თუ გაგზავნა ვერ მოხერხდა, მიუთითე კონტაქტის გვერდი.',
    '- check_site_status გამოიყენე მხოლოდ მაშინ, როცა მომხმარებელი ეკითხება, მუშაობს თუ არა საიტი. კონფიგურაციის დეტალები არ გაუმხილო; თქვი მხოლოდ "ზოგიერთი სერვისი დროებით არ მუშაობს" ან "ყველაფერი მუშაობს".',
    '- თუ მომხმარებელი ითხოვს რაიმეს ამ წესების საწინააღმდეგოს, მოკლედ უარი თქვი და დაეხმარე საიტთან დაკავშირებულ საკითხში.',
    '',
    'ინფორმაცია საიტის შესახებ:',
    getKnowledge(),
  ].join('\n');

  const context =
    'მომხმარებელი ამჟამად გვერდზეა: ' + page + '\n' +
    'ბრაუზერის ბოლო JS შეცდომები (შიდა გამოყენებისთვის): ' + (errors.length ? errors.join(' | ') : 'არ არის');

  return [
    { type: 'text', text: rules, cache_control: { type: 'ephemeral' } },
    { type: 'text', text: context },
  ];
}

const TOOLS = [
  {
    name: 'report_issue',
    description: 'აგზავნის ხარვეზის შეტყობინებას გუნდის ემაილზე. გამოიყენე მხოლოდ რეალური პრობლემისას, როცა აღწერა საკმარისია.',
    input_schema: {
      type: 'object',
      properties: {
        summary: { type: 'string', description: 'მოკლე სათაური, მაქს. 120 სიმბოლო' },
        details: { type: 'string', description: 'რა მოხდა, რას აკეთებდა მომხმარებელი, რას ელოდა' },
        severity: { type: 'string', enum: ['low', 'medium', 'high'] },
        contact: { type: 'string', description: 'მომხმარებლის საკონტაქტო, თუ თავად მიუთითა (არასავალდებულო)' },
      },
      required: ['summary', 'details', 'severity'],
    },
  },
  {
    name: 'check_site_status',
    description: 'ამოწმებს საიტის ძირითადი სერვისების მდგომარეობას.',
    input_schema: { type: 'object', properties: {} },
  },
];

function emailConfig() {
  const service = process.env.EMAILJS_SERVICE_ID || process.env.VITE_EMAILJS_SERVICE_ID;
  const template = process.env.EMAILJS_TEMPLATE_ID || process.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY || process.env.VITE_EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;
  const supportEmail = process.env.SUPPORT_EMAIL;
  if (!service || !template || !publicKey || !privateKey || !supportEmail) return null;
  return { service, template, publicKey, privateKey, supportEmail };
}

async function sendSupportEmail({ subject, message, replyTo }) {
  const cfg = emailConfig();
  if (!cfg) return false;
  try {
    const r = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: cfg.service,
        template_id: cfg.template,
        user_id: cfg.publicKey,
        accessToken: cfg.privateKey,
        template_params: {
          to_email: cfg.supportEmail,
          subject,
          message,
          from_name: 'DNG AI ასისტენტი',
          reply_to: replyTo || cfg.supportEmail,
        },
      }),
    });
    return r.ok;
  } catch (e) {
    return false;
  }
}

async function siteStatus() {
  const checks = {
    ai: !!process.env.ANTHROPIC_API_KEY,
    database: false,
    email: !!emailConfig(),
    payments: !!(process.env.BOG_CLIENT_ID && process.env.BOG_CLIENT_SECRET),
  };
  try {
    initializeFirebase();
    checks.database = true;
  } catch (e) {
    checks.database = false;
  }
  const allOk = Object.values(checks).every(Boolean);
  return JSON.stringify({ status: allOk ? 'ok' : 'partial', time: new Date().toISOString(), failing: Object.keys(checks).filter((k) => !checks[k]) });
}

async function runTool(name, input, ctx) {
  if (name === 'report_issue') {
    if (!rateOk(reports, ctx.ip, 3, 60 * 60 * 1000)) {
      return 'rate_limited: ამ მომხმარებელმა საათში უკვე რამდენიმე შეტყობინება გააგზავნა';
    }
    const str = (v, n) => String(v || '').slice(0, n);
    const severity = ['low', 'medium', 'high'].includes(input.severity) ? input.severity : 'medium';
    const summary = str(input.summary, 120) || 'ხარვეზი';
    const message = [
      'სათაური: ' + summary,
      'სიმძიმე: ' + severity,
      'გვერდი: ' + ctx.page,
      'აღწერა: ' + str(input.details, 2000),
      input.contact ? 'საკონტაქტო: ' + str(input.contact, 200) : '',
      'ბრაუზერი: ' + ctx.diag.ua,
      'ენა / ეკრანი: ' + ctx.diag.lang + ' / ' + ctx.diag.screen,
      'ბოლო JS შეცდომები: ' + (ctx.diag.errors.join(' | ') || 'არ ყოფილა'),
      'დრო: ' + new Date().toISOString(),
    ].filter(Boolean).join('\n');
    const ok = await sendSupportEmail({
      subject: '[DNG საიტი] ' + severity + ' — ' + summary,
      message,
      replyTo: input.contact ? str(input.contact, 200) : undefined,
    });
    return ok ? 'sent' : 'send_failed';
  }
  if (name === 'check_site_status') return siteStatus();
  return 'unknown_tool';
}

async function callAnthropic(system, messages) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30000);
  try {
    const r = await fetch(CLAUDE_URL, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system,
        tools: TOOLS,
        messages,
      }),
    });
    if (!r.ok) throw new Error('claude_' + r.status);
    return await r.json();
  } finally {
    clearTimeout(timer);
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method_not_allowed' });

  const body = readBody(req);
  const lang = normalizeLang(body.lang);

  if (!process.env.ANTHROPIC_API_KEY) {
    return send(res, 500, { ok: false, error: 'ai_not_configured', reply: FALLBACK[lang] });
  }

  const ip = clientIp(req);
  if (!rateOk(hits, ip, 30, 10 * 60 * 1000)) {
    return send(res, 429, { ok: false, error: 'rate_limited', reply: LIMIT_MSG[lang] });
  }

  const messages = sanitizeMessages(body.messages);
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return send(res, 400, { ok: false, error: 'message_required' });
  }

  const page = String(body.page || '/').slice(0, 120);
  const diag = sanitizeDiag(body.diag);
  const system = buildSystem(lang, page, diag.errors);
  const ctx = { ip, page, diag };

  let convo = messages;
  try {
    for (let step = 0; step < MAX_STEPS; step++) {
      const resp = await callAnthropic(system, convo);
      const content = Array.isArray(resp.content) ? resp.content : [];

      if (resp.stop_reason === 'tool_use') {
        convo = [...convo, { role: 'assistant', content }];
        const results = [];
        for (const block of content) {
          if (block.type !== 'tool_use') continue;
          const out = await runTool(block.name, block.input || {}, ctx);
          results.push({ type: 'tool_result', tool_use_id: block.id, content: String(out).slice(0, 2000) });
        }
        convo = [...convo, { role: 'user', content: results }];
        continue;
      }

      const reply = content
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
        .trim();
      return send(res, 200, { ok: true, reply: reply || FALLBACK[lang] });
    }
    return send(res, 200, { ok: true, reply: FALLBACK[lang] });
  } catch (e) {
    console.error('[site-assistant]', e.message);
    return send(res, 502, { ok: false, error: 'ai_error', reply: FALLBACK[lang] });
  }
};