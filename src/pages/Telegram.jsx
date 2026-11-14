// src/pages/Telegram.jsx — ტელეგრამ-ბოტის მიბმა (ka / en / ru)
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';

const T = {
  ka: {
    title: 'ტელეგრამ-ბოტი', sub: 'დააკავშირე DNG AI შენს ტელეგრამთან და ისარგებლე აგენტებით ნებისმიერ დროს.',
    needLogin: 'ამ გვერდისთვის საჭიროა შესვლა.', login: 'შესვლა', loading: 'იტვირთება...',
    noPkgTitle: 'ტელეგრამ-ბოტი თქვენს პაკეტში არ შედის',
    noPkgDesc: 'ბოტი ხელმისაწვდომია Gold (1), Diamond (3) და Infinity (10) პაკეტებში.',
    viewPkgs: 'პაკეტების ნახვა',
    usage: 'გამოყენება', bots: 'ბოტი', getCode: 'ახალი კოდის მიღება', getting: 'მუშავდება...',
    limitReached: 'ბოტების ლიმიტი ამოიწურა',
    codeTitle: 'შენი კოდი', codeHint: 'მოქმედებს 15 წუთი', copy: 'კოპირება', copied: 'დაკოპირდა',
    openBot: 'ბოტის გახსნა ტელეგრამში', sendStart: 'ბოტში გაუგზავნე:',
    steps: ['მიიღე კოდი ამ გვერდზე', 'გახსენი ბოტი ტელეგრამში', 'გაუგზავნე /start და კოდი', 'დაიწყე ჩატი ან აირჩიე აგენტი'],
    linkedTitle: 'დაკავშირებული ჩატები', none: 'ჯერ არცერთი ჩატი არ არის დაკავშირებული.',
    agent: 'აგენტი', unlink: 'გათიშვა', confirmUnlink: 'ბოტი გაითიშოს?', unlinked: 'ბოტი გაითიშა',
    commandsTitle: 'ბრძანებები ბოტში', commands: ['/agents — აგენტების სია', '/agent <სახელი> — აგენტის არჩევა', '/help — დახმარება'],
    errCode: 'კოდის მიღება ვერ მოხერხდა', errLoad: 'მონაცემები ვერ ჩაიტვირთა', copyErr: 'კოპირება ვერ მოხერხდა',
    codeReady: 'კოდი მზადაა',
  },
  en: {
    title: 'Telegram bot', sub: 'Connect DNG AI to your Telegram and use the agents anytime.',
    needLogin: 'You need to sign in to view this page.', login: 'Sign in', loading: 'Loading...',
    noPkgTitle: 'Telegram bot is not included in your plan',
    noPkgDesc: 'The bot is available on Gold (1), Diamond (3) and Infinity (10) plans.',
    viewPkgs: 'View plans',
    usage: 'Usage', bots: 'bots', getCode: 'Get a new code', getting: 'Please wait...',
    limitReached: 'Bot limit reached',
    codeTitle: 'Your code', codeHint: 'Valid for 15 minutes', copy: 'Copy', copied: 'Copied',
    openBot: 'Open the bot in Telegram', sendStart: 'Send to the bot:',
    steps: ['Get a code on this page', 'Open the bot in Telegram', 'Send /start and the code', 'Start chatting or pick an agent'],
    linkedTitle: 'Connected chats', none: 'No chats are connected yet.',
    agent: 'Agent', unlink: 'Disconnect', confirmUnlink: 'Disconnect this bot?', unlinked: 'Bot disconnected',
    commandsTitle: 'Bot commands', commands: ['/agents — list agents', '/agent <name> — choose an agent', '/help — help'],
    errCode: 'Could not get a code', errLoad: 'Could not load data', copyErr: 'Copy failed',
    codeReady: 'Code is ready',
  },
  ru: {
    title: 'Telegram-бот', sub: 'Подключите DNG AI к вашему Telegram и используйте агентов в любое время.',
    needLogin: 'Для этой страницы нужно войти.', login: 'Войти', loading: 'Загрузка...',
    noPkgTitle: 'Telegram-бот не входит в ваш пакет',
    noPkgDesc: 'Бот доступен в пакетах Gold (1), Diamond (3) и Infinity (10).',
    viewPkgs: 'Смотреть пакеты',
    usage: 'Использовано', bots: 'бот.', getCode: 'Получить новый код', getting: 'Подождите...',
    limitReached: 'Лимит ботов исчерпан',
    codeTitle: 'Ваш код', codeHint: 'Действует 15 минут', copy: 'Копировать', copied: 'Скопировано',
    openBot: 'Открыть бота в Telegram', sendStart: 'Отправьте боту:',
    steps: ['Получите код на этой странице', 'Откройте бота в Telegram', 'Отправьте /start и код', 'Начните чат или выберите агента'],
    linkedTitle: 'Подключенные чаты', none: 'Пока нет подключенных чатов.',
    agent: 'Агент', unlink: 'Отключить', confirmUnlink: 'Отключить этого бота?', unlinked: 'Бот отключен',
    commandsTitle: 'Команды бота', commands: ['/agents — список агентов', '/agent <имя> — выбрать агента', '/help — помощь'],
    errCode: 'Не удалось получить код', errLoad: 'Не удалось загрузить данные', copyErr: 'Не удалось скопировать',
    codeReady: 'Код готов',
  },
};

async function api(path, method = 'GET', body) {
  const user = auth.currentUser;
  if (!user) throw new Error('auth');
  const token = await user.getIdToken();
  const r = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.message || d.error || 'error');
  return d;
}

const card = 'relative bg-[#0A0A0C]/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8';

export default function Telegram() {
  const { i18n } = useTranslation();
  const lang = ['ka', 'en', 'ru'].includes((i18n.language || 'ka').split('-')[0]) ? (i18n.language || 'ka').split('-')[0] : 'ka';
  const L = T[lang];
  const { currentUser, loading } = useAuth();

  const [status, setStatus] = useState(null);
  const [linkInfo, setLinkInfo] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setStatus(await api('/api/telegram-status'));
    } catch {
      toast.error(L.errLoad);
    }
  }, [L.errLoad]);

  useEffect(() => {
    if (currentUser) load();
  }, [currentUser, load]);

  async function getCode() {
    setBusy(true);
    try {
      const d = await api('/api/telegram-link', 'POST');
      setLinkInfo(d);
      toast.success(L.codeReady);
    } catch (e) {
      toast.error(e.message === 'limit_reached' ? L.limitReached : L.errCode);
    } finally {
      setBusy(false);
    }
  }

  async function unlink(chatId) {
    if (!window.confirm(L.confirmUnlink)) return;
    try {
      await api('/api/telegram-unlink', 'POST', { chatId });
      toast.success(L.unlinked);
      load();
    } catch {
      toast.error(L.errLoad);
    }
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(L.copied);
    } catch {
      toast.error(L.copyErr);
    }
  }

  const fade = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-[#050505] pt-28 pb-24 px-4 relative overflow-hidden">
      <motion.div animate={{ x: [0, 40, 0], y: [0, -20, 0] }} transition={{ duration: 14, repeat: Infinity }}
        className="absolute top-10 -left-32 w-[460px] h-[460px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <motion.div animate={{ x: [0, -40, 0], y: [0, 20, 0] }} transition={{ duration: 16, repeat: Infinity }}
        className="absolute bottom-10 -right-32 w-[460px] h-[460px] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-2xl mx-auto space-y-6">
        <motion.div {...fade}>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">{L.title}</h1>
          <p className="text-gray-400 text-sm">{L.sub}</p>
        </motion.div>

        {loading ? (
          <div className={card}><p className="text-gray-400">{L.loading}</p></div>
        ) : !currentUser ? (
          <div className={card}>
            <p className="text-gray-400 mb-4">{L.needLogin}</p>
            <Link to="/login" className="inline-block px-6 py-3 rounded-xl bg-white text-black font-bold">{L.login}</Link>
          </div>
        ) : !status ? (
          <div className={card}><p className="text-gray-400">{L.loading}</p></div>
        ) : status.limit === 0 ? (
          <div className={card}>
            <p className="text-white font-bold mb-2">{L.noPkgTitle}</p>
            <p className="text-gray-400 text-sm mb-5">{L.noPkgDesc}</p>
            <Link to="/packages" className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold">{L.viewPkgs}</Link>
          </div>
        ) : (
          <>
            <motion.div {...fade} transition={{ delay: 0.05 }} className={card}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{L.usage}</p>
                  <p className="text-2xl font-black text-white">{status.used} / {status.limit} <span className="text-sm text-gray-500 font-medium">{L.bots}</span></p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-xs font-bold uppercase">{status.package}</span>
              </div>

              <button onClick={getCode} disabled={busy || status.used >= status.limit}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 disabled:opacity-40 hover:opacity-90 transition-opacity">
                {busy ? L.getting : L.getCode}
              </button>

              {linkInfo && (
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="mt-5 p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                  <p className="text-xs text-gray-500 mb-2">{L.codeTitle} · {L.codeHint}</p>
                  <div className="flex items-center justify-between gap-3">
                    <code className="text-2xl font-black tracking-widest text-cyan-300">{linkInfo.code}</code>
                    <button onClick={() => copy(linkInfo.code)} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white">{L.copy}</button>
                  </div>
                  {linkInfo.deepLink ? (
                    <a href={linkInfo.deepLink} target="_blank" rel="noreferrer" className="mt-4 block text-center py-3 rounded-xl bg-white text-black font-bold">{L.openBot}</a>
                  ) : (
                    <p className="mt-4 text-sm text-gray-400">{L.sendStart} /start {linkInfo.code}</p>
                  )}
                </motion.div>
              )}
            </motion.div>

            <motion.div {...fade} transition={{ delay: 0.1 }} className={card}>
              <ol className="space-y-3">
                {L.steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <span className="w-6 h-6 shrink-0 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </motion.div>

            <motion.div {...fade} transition={{ delay: 0.15 }} className={card}>
              <h2 className="text-lg font-bold text-white mb-4">{L.linkedTitle}</h2>
              {status.links.length === 0 ? (
                <p className="text-gray-500 text-sm">{L.none}</p>
              ) : (
                <ul className="space-y-3">
                  {status.links.map((l) => (
                    <li key={l.chatId} className="flex items-center justify-between gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div>
                        <p className="text-sm text-white font-semibold">Chat: {l.chatId}</p>
                        <p className="text-xs text-gray-500">{L.agent}: {l.agent}</p>
                      </div>
                      <button onClick={() => unlink(l.chatId)} className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">{L.unlink}</button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-6 pt-5 border-t border-white/5">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{L.commandsTitle}</p>
                <ul className="text-xs text-gray-400 space-y-1">
                  {L.commands.map((c) => <li key={c}>{c}</li>)}
                </ul>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}