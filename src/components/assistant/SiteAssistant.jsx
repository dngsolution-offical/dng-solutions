// src/components/assistant/SiteAssistant.jsx — მარჯვენა მხარის AI ასისტენტი ყველა გვერდზე
import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const HIDDEN_PREFIXES = ['/admin'];
const ALLOWED_PATHS = [
  '/', '/services', '/packages', '/about', '/contact', '/report',
  '/register', '/login', '/profile', '/settings', '/dashboard',
  '/ai', '/agents', '/agents/history', '/agents/schedules',
  '/telegram', '/checkout', '/privacy', '/terms',
];
const MAX_LEN = 2000;
const MAX_HISTORY = 8;

const T = {
  ka: {
    title: 'DNG AI ასისტენტი',
    online: 'ონლაინ',
    open: 'ასისტენტის გახსნა',
    close: 'დახურვა',
    placeholder: 'დაწერეთ შეკითხვა...',
    send: 'გაგზავნა',
    quick: 'სწრაფი კითხვები',
    greeting:
      'გამარჯობა! მე ვარ DNG AI ასისტენტი. დაგეხმარებით საიტის გაცნობაში, პაკეტის არჩევაში და საჭირო გვერდის მოძებნაში. თუ საიტზე ხარვეზს წააწყდებით, გეტყვით, ვის დაუკავშირდეთ.',
    error: 'ახლა ვერ ვუპასუხებ. სცადეთ ხელახლა.',
  },
  en: {
    title: 'DNG AI Assistant',
    online: 'Online',
    open: 'Open assistant',
    close: 'Close',
    placeholder: 'Type your question...',
    send: 'Send',
    quick: 'Quick questions',
    greeting:
      "Hi! I'm the DNG AI Assistant. I can help you explore the site, choose a plan and find the right page. If you run into a problem, I'll tell you who to contact.",
    error: 'I cannot answer right now. Please try again.',
  },
  ru: {
    title: 'DNG AI Ассистент',
    online: 'Онлайн',
    open: 'Открыть ассистента',
    close: 'Закрыть',
    placeholder: 'Напишите вопрос...',
    send: 'Отправить',
    quick: 'Быстрые вопросы',
    greeting:
      'Здравствуйте! Я AI-ассистент DNG. Помогу разобраться с сайтом, выбрать тариф и найти нужную страницу. Если возникнет проблема, подскажу, с кем связаться.',
    error: 'Сейчас не могу ответить. Попробуйте ещё раз.',
  },
};

// სწრაფი კითხვები: პასუხი ლოკალურად იწერება, API-ს არ ეძახის (კრედიტს არ ხარჯავს)
const QA = [
  {
    id: 'about',
    q: {
      ka: 'რა არის DNG Solutions?',
      en: 'What is DNG Solutions?',
      ru: 'Что такое DNG Solutions?',
    },
    a: {
      ka: 'DNG Solutions არის AI ავტომატიზაციის სტუდია თბილისიდან. ვაძლევთ ბიზნესებს AI აგენტებს, რომლებიც პასუხობენ კლიენტებს, ამუშავებენ შეკვეთებს და ამარტივებენ სამუშაო პროცესებს. დეტალები: [სერვისები](/services)',
      en: 'DNG Solutions is an AI automation studio based in Tbilisi. We give businesses AI agents that answer clients, process orders and simplify daily workflows. Details: [Services](/services)',
      ru: 'DNG Solutions — студия AI-автоматизации из Тбилиси. Мы даём бизнесу AI-агентов, которые отвечают клиентам, обрабатывают заказы и упрощают рабочие процессы. Подробнее: [Услуги](/services)',
    },
  },
  {
    id: 'packages',
    q: {
      ka: 'რა პაკეტები არსებობს?',
      en: 'What plans are available?',
      ru: 'Какие есть тарифы?',
    },
    a: {
      ka: 'გვაქვს ოთხი პაკეტი: Basic, Gold, Diamond და Infinity. Basic და Gold-ზე შეგიძლიათ უფასო 7-დღიანი ტრიალი. ზუსტი ფასები და დეტალები: [პაკეტები](/packages)',
      en: 'We offer four plans: Basic, Gold, Diamond and Infinity. Basic and Gold include a free 7-day trial. Exact prices and details: [Plans](/packages)',
      ru: 'У нас четыре тарифа: Basic, Gold, Diamond и Infinity. На Basic и Gold есть бесплатный пробный период на 7 дней. Точные цены и детали: [Тарифы](/packages)',
    },
  },
  {
    id: 'trial',
    q: {
      ka: 'როგორ მივიღო უფასო 7 დღე?',
      en: 'How do I get the free 7-day trial?',
      ru: 'Как получить бесплатные 7 дней?',
    },
    a: {
      ka: 'უფასო 7-დღიანი ტრიალი ხელმისაწვდომია Basic და Gold პაკეტებზე, ერთხელ თითო ანგარიშზე. საჭიროა ანგარიშით შესვლა და გააქტიურება გვერდიდან: [პაკეტები](/packages)',
      en: 'The free 7-day trial is available on Basic and Gold plans, once per account. Sign in and activate it on the plans page: [Plans](/packages)',
      ru: 'Бесплатный 7-дневный период доступен на тарифах Basic и Gold, один раз на аккаунт. Войдите в аккаунт и активируйте его на странице тарифов: [Тарифы](/packages)',
    },
  },
  {
    id: 'contact',
    q: {
      ka: 'როგორ დავუკავშირდე გუნდს?',
      en: 'How can I contact the team?',
      ru: 'Как связаться с командой?',
    },
    a: {
      ka: 'დაგვირეკეთ: [+995 551 071 451](tel:+995551071451). სრული საკონტაქტო ინფორმაცია და ფორმა: [კონტაქტი](/contact). სოციალურ ქსელებში: [Instagram](https://www.instagram.com/dng.solutions), [TikTok](https://www.tiktok.com/@dng_solution), [Facebook](https://www.facebook.com/profile.php?id=61596586850292)',
      en: 'Call us: [+995 551 071 451](tel:+995551071451). Full contact details and form: [Contact](/contact). On social media: [Instagram](https://www.instagram.com/dng.solutions), [TikTok](https://www.tiktok.com/@dng_solution), [Facebook](https://www.facebook.com/profile.php?id=61596586850292)',
      ru: 'Позвоните нам: [+995 551 071 451](tel:+995551071451). Все контакты и форма: [Контакты](/contact). В соцсетях: [Instagram](https://www.instagram.com/dng.solutions), [TikTok](https://www.tiktok.com/@dng_solution), [Facebook](https://www.facebook.com/profile.php?id=61596586850292)',
    },
  },
  {
    id: 'payment',
    q: {
      ka: 'როგორ შევიძინო პაკეტი?',
      en: 'How do I buy a plan?',
      ru: 'Как купить тариф?',
    },
    a: {
      ka: 'პაკეტს ირჩევთ გვერდიდან: [პაკეტები](/packages). თუ შეძენასთან ან გადახდასთან დაკავშირებით კითხვა გაქვთ, მიმართეთ: [კონტაქტი](/contact)',
      en: 'You choose a plan on the plans page: [Plans](/packages). If you have a question about purchase or payment, contact us: [Contact](/contact)',
      ru: 'Тариф выбирается на странице тарифов: [Тарифы](/packages). Если у вас вопрос по покупке или оплате, свяжитесь с нами: [Контакты](/contact)',
    },
  },
  {
    id: 'bug',
    q: {
      ka: 'საიტზე ხარვეზი მაქვს',
      en: 'I found a bug on the site',
      ru: 'Я нашёл ошибку на сайте',
    },
    a: {
      ka: 'მოგვწერეთ, რა მოხდა: რომელ გვერდზე იყავით, რას ცდილობდით და რა შეცდომა გამოჩნდა. შეტყობინებას გუნდს ემაილით გავუგზავნი.',
      en: 'Tell me what happened: which page you were on, what you were trying to do and what error you saw. I will send the report to the team by email.',
      ru: 'Опишите, что произошло: на какой странице вы были, что пытались сделать и какая ошибка появилась. Я отправлю отчёт команде на почту.',
    },
  },
];

function normalizeLang(value) {
  const code = String(value || 'ka').toLowerCase().split('-')[0];
  return T[code] ? code : 'ka';
}

function isAllowedPath(href) {
  const path = href.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  if (HIDDEN_PREFIXES.some((p) => path.startsWith(p)) || path.startsWith('/diagnostic')) return false;
  return ALLOWED_PATHS.includes(path);
}

// ბმულები: [ტექსტი](/path). მხოლოდ დაშვებული გვერდები და გარე DNG/კონტაქტის ბმულები
function renderText(text) {
  const parts = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let key = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const label = m[1];
    const href = m[2];
    if (href.startsWith('/') && !href.startsWith('//') && isAllowedPath(href)) {
      parts.push(
        <Link key={key++} to={href} className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
          {label}
        </Link>
      );
    } else if (/^(mailto:|tel:|https:\/\/)/.test(href)) {
      parts.push(
        <a key={key++} href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
          {label}
        </a>
      );
    } else {
      parts.push(label);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

// ბრაუზერის ბოლო შეცდომები დიაგნოსტიკისთვის (მოდულის დონეზე, ერთხელ)
const errorLog = [];
let listening = false;

function pushError(msg) {
  errorLog.push(String(msg).slice(0, 300));
  if (errorLog.length > 5) errorLog.shift();
}

function ensureErrorListeners() {
  if (listening || typeof window === 'undefined') return;
  listening = true;
  window.addEventListener('error', (e) => pushError(`${e.message || 'error'} (${e.filename || ''}:${e.lineno || ''})`));
  window.addEventListener('unhandledrejection', (e) =>
    pushError(`unhandled: ${(e.reason && (e.reason.message || e.reason)) || ''}`)
  );
}

function Bubble({ role, content, error }) {
  const isUser = role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-br-md'
            : error
            ? 'bg-red-500/10 border border-red-400/20 text-red-200 rounded-bl-md'
            : 'bg-white/[0.05] border border-white/10 text-gray-200 rounded-bl-md'
        }`}
      >
        {isUser ? content : renderText(content)}
      </div>
    </motion.div>
  );
}

function TypingDots() {
  return (
    <div className="flex justify-start">
      <div className="flex gap-1.5 rounded-2xl rounded-bl-md bg-white/[0.05] border border-white/10 px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-cyan-300"
            animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </div>
  );
}

export default function SiteAssistant() {
  const location = useLocation();
  const { i18n } = useTranslation();
  const lang = normalizeLang(i18n.language);
  const t = T[lang];
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);

  ensureErrorListeners();

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy, open]);

  if (HIDDEN_PREFIXES.some((p) => location.pathname.startsWith(p))) return null;

  const items = QA.map((it) => ({ id: it.id, q: it.q[lang], a: it.a[lang] }));
  const typed = input.trim().toLowerCase();
  // წერისას სწრაფი კითხვები ფილტრდება; ცარიელ ველზე ყველა ჩანს
  const shown = typed ? items.filter((it) => it.q.toLowerCase().includes(typed)) : items;

  // სწრაფი კითხვა: პასუხი ლოკალურად, API-ს გარეშე
  function answerLocally(item) {
    setMessages((m) => [...m, { role: 'user', content: item.q }, { role: 'assistant', content: item.a }]);
    setInput('');
  }

  async function send(raw) {
    const text = String(raw || '').trim().slice(0, MAX_LEN);
    if (!text || busy) return;
    // თუ ტექსტი სწრაფი კითხვის ზუსტი ტექსტია, ისევ ლოკალური პასუხი მოდის
    const exact = items.find((it) => it.q.toLowerCase() === text.toLowerCase());
    if (exact) return answerLocally(exact);

    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setBusy(true);
    try {
      const res = await fetch('/api/site-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lang,
          messages: next.slice(-MAX_HISTORY).map(({ role, content }) => ({ role, content })),
          page: location.pathname,
          diag: {
            ua: navigator.userAgent,
            lang: navigator.language,
            screen: `${window.innerWidth}x${window.innerHeight}`,
            errors: [...errorLog],
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      setMessages((m) => [...m, { role: 'assistant', content: data.reply || t.error, error: !res.ok }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: t.error, error: true }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <motion.button
        type="button"
        aria-label={t.open}
        onClick={() => setOpen(true)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: open ? 0 : 1, opacity: open ? 0 : 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 380, damping: 24 }}
        style={{ pointerEvents: open ? 'none' : 'auto' }}
        className="fixed bottom-5 right-5 z-[60] w-14 h-14 rounded-2xl bg-[#0A0A0A] border border-cyan-400/30 shadow-[0_0_30px_-6px_rgba(34,211,238,0.6)] flex items-center justify-center"
      >
        <span className="absolute inset-0 rounded-2xl ring-2 ring-cyan-400/30 animate-ping opacity-30" aria-hidden="true" />
        <img src="/logo8.webp" alt="" className="relative w-8 h-8 object-contain" />
        <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-gradient-to-r from-blue-500 to-cyan-400 text-black">
          AI
        </span>
      </motion.button>

      <motion.div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        initial={false}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        style={{ pointerEvents: open ? 'auto' : 'none' }}
        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-[2px] sm:hidden"
      />

      <motion.aside
        role="dialog"
        aria-label={t.title}
        aria-hidden={!open}
        initial={false}
        animate={{ x: open ? 0 : '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        style={{ pointerEvents: open ? 'auto' : 'none' }}
        className="fixed top-0 right-0 z-[80] h-[100dvh] w-full sm:w-1/2 sm:min-w-[380px] bg-[#070709] border-l border-white/10 flex flex-col shadow-2xl shadow-black/80"
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-[#0A0A0A] border border-cyan-400/30 flex items-center justify-center shrink-0">
            <img src="/logo8.webp" alt="" className="w-6 h-6 object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-white text-sm">{t.title}</p>
            <p className="text-[11px] text-emerald-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {t.online}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t.close}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
          <Bubble role="assistant" content={t.greeting} />
          {messages.map((m, i) => (
            <Bubble key={i} role={m.role} content={m.content} error={m.error} />
          ))}
          {busy && <TypingDots />}
        </div>

        <div className="border-t border-white/10">
          {shown.length > 0 && (
            <div className="px-3 pt-3">
              {!typed && <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">{t.quick}</p>}
              <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto pb-1">
                {shown.map((it) => (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => answerLocally(it)}
                    className="px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs text-gray-300 hover:text-white hover:border-cyan-400/40 transition-colors text-left"
                  >
                    {it.q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="p-3 flex items-end gap-2"
          >
            <textarea
              rows={1}
              value={input}
              maxLength={MAX_LEN}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder={t.placeholder}
              className="flex-1 resize-none max-h-32 bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-400/50"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-black font-black text-sm disabled:opacity-40 transition-opacity"
            >
              {t.send}
            </button>
          </form>
        </div>
      </motion.aside>
    </>
  );
}