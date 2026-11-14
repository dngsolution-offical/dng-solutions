// src/pages/About.jsx — ჩვენს შესახებ (ka / en / ru)
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore/lite';
import { db } from '../firebase';

const TEXT = {
  ka: {
    badge: 'DNG Solutions',
    title1: 'ვქმნით ხელოვნურ ინტელექტს,',
    title2: 'რომელიც ბიზნესს ეხმარება',
    tagline: 'ვქმნით ხელოვნურ ინტელექტს, რომელიც ბიზნესს ეხმარება ზრდაში',
    intro: 'DNG Solutions არის AI ავტომატიზაციის პლატფორმა, რომელიც ზოგავს დროს, ამცირებს ხარჯებს და ზრდის შემოსავალს.',
    statsUsers: 'მომხმარებელი', statsRating: 'რეიტინგი', statsSupport: 'AI მხარდაჭერა',
    missionTitle: 'ჩვენი მისია',
    missionDesc: 'გავხადოთ ხელოვნური ინტელექტი ხელმისაწვდომი ყველა ბიზნესისთვის — დიდისა და პატარასთვის. ტექნოლოგია უნდა ეხმარებოდეს ადამიანებს რუტინულ სამუშაოში, რათა მეტი დრო დარჩეთ სტრატეგიულ და კრეატიულ ამოცანებზე.',
    visionTitle: 'ჩვენი ხედვა',
    visionDesc: 'ვიყოთ წამყვანი AI კომპანია საქართველოსა და რეგიონში — სერვისებით, რომლებიც რეალურად ცვლის ბიზნესის ყოველდღიურობას.',
    whyBadge: 'რატომ ჩვენ',
    whyTitle: 'როგორ ეხმარება DNG Solutions თქვენს ბიზნესს',
    whyDesc: 'AI აგენტები მუშაობენ 24/7 და ზოგავენ თქვენს გუნდს ათასობით საათს ყოველთვიურად.',
    b1t: 'დაზოგე დრო', b1d: 'ავტომატიზაცია ათავისუფლებს გუნდს რუტინისგან.',
    b2t: 'შეამცირე ხარჯები', b2d: 'ერთი AI აგენტი ზოგჯერ სამი თანამშრომლის სამუშაოს ასრულებს.',
    b3t: 'გაზარდე შემოსავალი', b3d: 'სწრაფი შეკვეთების დამუშავება = მეტი კმაყოფილი კლიენტი.',
    b4t: 'მოიზიდე კლიენტები', b4d: 'CRM და Email აგენტები ლიდებს 24/7 ამუშავებენ.',
    agentsBadge: 'AI აგენტები',
    agentsTitle: 'სპეციალიზებული AI აგენტები',
    agentsDesc: 'თითოეული აგენტი ერთ კონკრეტულ თემაზე მუშაობს და სხვა თემებზე პასუხს არ იძლევა.',
    agents: [
      ['ტექსტის აგენტი', 'შეკვეთის დეტალების ამოღება ტექსტიდან'],
      ['Excel აგენტი', 'ცხრილების ავტომატური შევსება'],
      ['Email აგენტი', 'პროფესიონალური წერილების წერა'],
      ['Vision აგენტი', 'ინფორმაციის ამოღება ფოტოდან / PDF-დან'],
      ['რეპორტის აგენტი', 'დღიური და თვიური ანგარიშები'],
      ['CRM აგენტი', 'კლიენტებისა და ლიდების მართვა'],
      ['გრაფიკის აგენტი', 'ავტომატური დაგეგმვა'],
      ['ავტომატიზაციის აგენტი', 'სამუშაო პროცესების აწყობა'],
    ],
    tryAgents: 'სცადე AI აგენტები',
    valuesTitle: 'რასაც ვაფასებთ',
    v1t: 'ინოვაცია', v1d: 'მუდმივად ვეძებთ ახალ გზებს, რომ პროდუქტი უფრო ჭკვიანი და სწრაფი იყოს.',
    v2t: 'უსაფრთხოება', v2d: 'თქვენი მონაცემები Google Firebase-ის დაშიფვრით და წვდომის კონტროლით არის დაცული.',
    v3t: 'გამჭვირვალობა', v3d: 'ფასები ნათელია, ფარული გადასახადები არ არსებობს.',
    useTitle: 'ვის ვემსახურებით',
    uc: [
      ['ღონისძიების ორგანიზატორები', 'ათობით შეკვეთის ერთდროულად მართვა.'],
      ['რესტორნები და კაფეები', 'სწრაფი ფასების კალკულაცია და შეკვეთები.'],
      ['მცირე და საშუალო ბიზნესი', 'ავტომატიზაცია ყოველდღიურ სამუშაოში.'],
      ['ონლაინ მაღაზიები', 'შეკვეთების დამუშავება და კლიენტების კომუნიკაცია.'],
      ['საკონსულტაციო კომპანიები', 'ანგარიშები და დოკუმენტების ანალიზი.'],
      ['სასტუმროები', 'ჯავშნების და სტუმრების მოთხოვნების დამუშავება.'],
    ],
    ctaTitle: 'მზად ხარ დასაწყებად?',
    ctaPackages: 'პაკეტები',
    ctaContact: 'დაგვიკავშირდი',
    loadError: '',
  },
  en: {
    badge: 'DNG Solutions',
    title1: 'We build artificial intelligence',
    title2: 'that helps business grow',
    tagline: 'We build artificial intelligence that helps businesses grow',
    intro: 'DNG Solutions is an AI automation platform that saves time, cuts costs and increases revenue.',
    statsUsers: 'Users', statsRating: 'Rating', statsSupport: 'AI support',
    missionTitle: 'Our mission',
    missionDesc: 'Make artificial intelligence accessible to every business, big or small. Technology should take over routine work so people can focus on strategy and creativity.',
    visionTitle: 'Our vision',
    visionDesc: 'Be the leading AI company in Georgia and the region, with services that truly change daily business operations.',
    whyBadge: 'Why us',
    whyTitle: 'How DNG Solutions helps your business',
    whyDesc: 'AI agents work 24/7 and save your team thousands of hours every month.',
    b1t: 'Save time', b1d: 'Automation frees your team from routine work.',
    b2t: 'Cut costs', b2d: 'One AI agent can do the work of three employees.',
    b3t: 'Grow revenue', b3d: 'Fast order processing means happier clients and more sales.',
    b4t: 'Attract clients', b4d: 'CRM and Email agents process leads 24/7.',
    agentsBadge: 'AI agents',
    agentsTitle: 'Specialized AI agents',
    agentsDesc: 'Each agent works on one specific topic and does not answer outside its expertise.',
    agents: [
      ['Text agent', 'Extracts order details from text'],
      ['Excel agent', 'Automatically fills spreadsheets'],
      ['Email agent', 'Writes professional emails'],
      ['Vision agent', 'Extracts information from photos / PDFs'],
      ['Report agent', 'Daily and monthly reports'],
      ['CRM agent', 'Manages clients and leads'],
      ['Schedule agent', 'Automatic scheduling'],
      ['Automation agent', 'Builds workflows'],
    ],
    tryAgents: 'Try AI agents',
    valuesTitle: 'What we value',
    v1t: 'Innovation', v1d: 'We constantly look for new ways to make our product smarter and faster.',
    v2t: 'Security', v2d: 'Your data is protected with Firebase encryption and access control.',
    v3t: 'Transparency', v3d: 'Prices are clear and there are no hidden fees.',
    useTitle: 'Who we serve',
    uc: [
      ['Event organizers', 'Manage dozens of orders at once.'],
      ['Restaurants and cafés', 'Fast price calculation and orders.'],
      ['Small and medium business', 'Automation in everyday work.'],
      ['Online stores', 'Order processing and customer communication.'],
      ['Consulting firms', 'Reports and document analysis.'],
      ['Hotels', 'Reservations and guest requests.'],
    ],
    ctaTitle: 'Ready to get started?',
    ctaPackages: 'Plans',
    ctaContact: 'Contact us',
  },
  ru: {
    badge: 'DNG Solutions',
    title1: 'Создаем искусственный интеллект,',
    title2: 'который помогает бизнесу расти',
    tagline: 'Мы создаем искусственный интеллект, который помогает бизнесу расти',
    intro: 'DNG Solutions — AI-платформа автоматизации, которая экономит время, снижает расходы и увеличивает доход.',
    statsUsers: 'Пользователи', statsRating: 'Рейтинг', statsSupport: 'AI поддержка',
    missionTitle: 'Наша миссия',
    missionDesc: 'Сделать искусственный интеллект доступным для каждого бизнеса — большого и малого. Технологии должны брать на себя рутину, чтобы люди занимались стратегией и творчеством.',
    visionTitle: 'Наше видение',
    visionDesc: 'Стать ведущей AI-компанией в Грузии и регионе, с сервисами, которые реально меняют ежедневную работу бизнеса.',
    whyBadge: 'Почему мы',
    whyTitle: 'Как DNG Solutions помогает вашему бизнесу',
    whyDesc: 'AI-агенты работают 24/7 и экономят вашей команде тысячи часов каждый месяц.',
    b1t: 'Экономьте время', b1d: 'Автоматизация освобождает команду от рутины.',
    b2t: 'Снижайте расходы', b2d: 'Один AI-агент может заменить работу трех сотрудников.',
    b3t: 'Растите доход', b3d: 'Быстрая обработка заказов — довольные клиенты и больше продаж.',
    b4t: 'Привлекайте клиентов', b4d: 'CRM и Email агенты обрабатывают лиды 24/7.',
    agentsBadge: 'AI агенты',
    agentsTitle: 'Специализированные AI агенты',
    agentsDesc: 'Каждый агент работает над одной конкретной темой и не отвечает за пределами своей компетенции.',
    agents: [
      ['Текстовый агент', 'Извлекает детали заказа из текста'],
      ['Excel агент', 'Автоматически заполняет таблицы'],
      ['Email агент', 'Пишет профессиональные письма'],
      ['Vision агент', 'Извлекает данные из фото / PDF'],
      ['Агент отчетов', 'Ежедневные и ежемесячные отчеты'],
      ['CRM агент', 'Управляет клиентами и лидами'],
      ['Агент расписания', 'Автоматическое планирование'],
      ['Агент автоматизации', 'Строит рабочие процессы'],
    ],
    tryAgents: 'Попробовать AI агентов',
    valuesTitle: 'Что мы ценим',
    v1t: 'Инновации', v1d: 'Мы постоянно ищем новые способы сделать продукт умнее и быстрее.',
    v2t: 'Безопасность', v2d: 'Ваши данные защищены шифрованием Firebase и контролем доступа.',
    v3t: 'Прозрачность', v3d: 'Цены понятны, скрытых комиссий нет.',
    useTitle: 'Кого мы обслуживаем',
    uc: [
      ['Организаторы мероприятий', 'Десятки заказов одновременно.'],
      ['Рестораны и кафе', 'Быстрый расчет цен и заказы.'],
      ['Малый и средний бизнес', 'Автоматизация повседневной работы.'],
      ['Интернет-магазины', 'Обработка заказов и коммуникация с клиентами.'],
      ['Консалтинговые компании', 'Отчеты и анализ документов.'],
      ['Отели', 'Бронирования и запросы гостей.'],
    ],
    ctaTitle: 'Готовы начать?',
    ctaPackages: 'Пакеты',
    ctaContact: 'Связаться с нами',
  },
};

const ICONS = {
  clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  money: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  trend: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  target: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  eye: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  shield: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  bot: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  check: 'M5 13l4 4L19 7',
  arrow: 'M14 5l7 7m0 0l-7 7m7-7H3',
};

const Icon = ({ d, className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={d} />
  </svg>
);

const BENEFIT_ICONS = [ICONS.clock, ICONS.money, ICONS.trend, ICONS.users];
const BENEFIT_COLORS = [
  'bg-blue-500/15 text-blue-400',
  'bg-emerald-500/15 text-emerald-400',
  'bg-purple-500/15 text-purple-400',
  'bg-amber-500/15 text-amber-400',
];
const VALUE_ICONS = [ICONS.target, ICONS.shield, ICONS.eye];
const VALUE_COLORS = [
  'bg-blue-500/15 text-blue-400',
  'bg-emerald-500/15 text-emerald-400',
  'bg-amber-500/15 text-amber-400',
];

function Section({ children, className = '' }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5 }}
      className={`mb-20 ${className}`}
    >
      {children}
    </motion.section>
  );
}

export default function About() {
  const { i18n } = useTranslation();
  const lang = ['ka', 'en', 'ru'].includes((i18n.language || 'ka').split('-')[0])
    ? (i18n.language || 'ka').split('-')[0]
    : 'ka';
  const L = TEXT[lang];

  const [stats, setStats] = useState({ users: null, rating: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [usersSnap, ratingsSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'ratings')),
        ]);
        let avg = null;
        if (ratingsSnap.size > 0) {
          let total = 0;
          ratingsSnap.forEach((d) => { total += Number(d.data().rating) || 0; });
          avg = Number((total / ratingsSnap.size).toFixed(1));
        }
        if (!cancelled) setStats({ users: usersSnap.size, rating: avg });
      } catch (e) {
        console.warn('[About] stats:', e.message);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const statCards = [
    { value: stats.users ?? '—', label: L.statsUsers },
    { value: stats.rating ?? '—', label: L.statsRating },
    { value: '24/7', label: L.statsSupport },
  ];

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 pt-28 pb-20">
        {/* HERO */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-400/10 border border-cyan-400/20 mb-6">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-widest">{L.badge}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-5 leading-tight">
            {L.title1}{' '}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              {L.title2}
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-medium mb-3">{L.tagline}</p>
          <p className="text-gray-500 max-w-2xl mx-auto text-base leading-relaxed">{L.intro}</p>
        </motion.div>

        {/* MISSION & VISION */}
        <div className="grid md:grid-cols-2 gap-5 mb-20">
          <Section className="mb-0">
            <div className="h-full bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-3xl p-8">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-5"><Icon d={ICONS.target} /></div>
              <h3 className="text-2xl font-bold text-white mb-3">{L.missionTitle}</h3>
              <p className="text-gray-400 leading-relaxed">{L.missionDesc}</p>
            </div>
          </Section>
          <Section className="mb-0">
            <div className="h-full bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20 rounded-3xl p-8">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-5"><Icon d={ICONS.eye} /></div>
              <h3 className="text-2xl font-bold text-white mb-3">{L.visionTitle}</h3>
              <p className="text-gray-400 leading-relaxed">{L.visionDesc}</p>
            </div>
          </Section>
        </div>

        {/* WHY US */}
        <Section>
          <div className="text-center mb-12">
            <p className="text-xs text-cyan-300 uppercase tracking-widest font-bold mb-3">{L.whyBadge}</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">{L.whyTitle}</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">{L.whyDesc}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[L.b1t, L.b2t, L.b3t, L.b4t].map((title, i) => {
              const desc = [L.b1d, L.b2d, L.b3d, L.b4d][i];
              return (
                <div key={i} className="bg-[#0A0A0C] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${BENEFIT_COLORS[i]}`}>
                    <Icon d={BENEFIT_ICONS[i]} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
        </Section>

        {/* AI AGENTS */}
        <Section>
          <div className="text-center mb-12">
            <p className="text-xs text-cyan-300 uppercase tracking-widest font-bold mb-3">{L.agentsBadge}</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">{L.agentsTitle}</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">{L.agentsDesc}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {L.agents.map(([name, desc], i) => (
              <div key={i} className="bg-[#0A0A0C] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/15 text-cyan-300 flex items-center justify-center mb-3">
                  <Icon d={ICONS.bot} className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{name}</h4>
                <p className="text-[11px] text-gray-500 leading-snug">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/agents" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity">
              {L.tryAgents} <Icon d={ICONS.arrow} className="w-4 h-4" />
            </Link>
          </div>
        </Section>

        {/* VALUES */}
        <Section>
          <h2 className="text-3xl font-black text-white text-center mb-12">{L.valuesTitle}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              [L.v1t, L.v1d],
              [L.v2t, L.v2d],
              [L.v3t, L.v3d],
            ].map(([title, desc], i) => (
              <div key={i} className="bg-[#0A0A0C] border border-white/10 rounded-2xl p-6 text-center hover:border-white/20 transition-colors">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${VALUE_COLORS[i]}`}>
                  <Icon d={VALUE_ICONS[i]} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* USE CASES */}
        <Section>
          <div className="bg-[#0A0A0C] border border-white/10 rounded-3xl p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-10">{L.useTitle}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {L.uc.map(([title, desc], i) => (
                <div key={i} className="flex items-start gap-3 bg-white/[0.03] border border-white/10 rounded-xl p-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <Icon d={ICONS.check} className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">{title}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* CTA */}
        <Section className="text-center mb-0">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-6">{L.ctaTitle}</h2>
          <div className="inline-flex flex-col sm:flex-row gap-3">
            <Link to="/packages" className="px-8 py-3.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">{L.ctaPackages}</Link>
            <Link to="/contact" className="px-8 py-3.5 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-colors">{L.ctaContact}</Link>
          </div>
        </Section>
      </div>
    </div>
  );
}