// ═══════════════════════════════════════════════════════════════════════════
// src/components/agents/AgentChat.jsx
// DNG AI v4.0 — Advanced Features, Clean Design (NO EMOJIS)
// ═══════════════════════════════════════════════════════════════════════════
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useFreeTrial } from '../../hooks/useFreeTrial';
import { auth } from '../../firebase';

// ───────────────────────────────────────────────────────────────────────────
// SVG ICONS (NO EMOJIS)
// ───────────────────────────────────────────────────────────────────────────
const Icon = ({ d, className = 'w-5 h-5', sw = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Icons = {
  Send: () => <Icon d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />,
  Paperclip: () => <Icon d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />,
  Menu: () => <Icon d="M4 6h16M4 12h16M4 18h16" />,
  Grid: () => <Icon d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />,
  X: () => <Icon d="M6 18L18 6M6 6l12 12" />,
  Lock: () => <Icon d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" className="w-3 h-3" />,
  Check: () => <Icon d="M5 13l4 4L19 7" className="w-4 h-4" sw={2.5} />,
  Sparkles: () => <Icon d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />,
  Brain: () => <Icon d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />,
  Zap: () => <Icon d="M13 10V3L4 14h7v7l9-11h-7z" />,
  Bot: () => <Icon d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
  ArrowLeft: () => <Icon d="M10 19l-7-7m0 0l7-7m-7 7h18" />,
  Loader: () => (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  ),
  Alert: () => <Icon d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />,
  Download: () => <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" className="w-4 h-4" />,
  Copy: () => <Icon d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" className="w-4 h-4" />,
  Eye: () => <Icon d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />,
  Code: () => <Icon d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />,
  FileText: () => <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
  Trash: () => <Icon d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
  Money: () => <Icon d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  Chart: () => <Icon d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
  Scale: () => <Icon d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />,
  Megaphone: () => <Icon d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />,
  Users: () => <Icon d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
  Coin: () => <Icon d="M12 8c-2.21 0-4 1.343-4 3s1.79 3 4 3 4 1.343 4 3-1.79 3-4 3m0-12c2.21 0 4 1.343 4 3M12 8V6m0 12v2M8 9h8M8 15h8" />,
  Rocket: () => <Icon d="M5 3l3 3m0 0l3-3M8 6v6m0 0l-3 3m3-3l3 3M9 17a2 2 0 11-4 0 2 2 0 014 0z" />,
  Trending: () => <Icon d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />,
  Package: () => <Icon d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
  Target: () => <Icon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
  Table: () => <Icon d="M3 10h18M3 14h18M10 10v8M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" />,
  Search: () => <Icon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
  Compare: () => <Icon d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />,
  Document: () => <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
  Presentation: () => <Icon d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />,
  Contract: () => <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2zM9 7h1" />,
  Meeting: () => <Icon d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
  Calculator: () => <Icon d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />,
  ChevronRight: () => <Icon d="M9 5l7 7-7 7" />,
  ArrowRight: () => <Icon d="M14 5l7 7m0 0l-7 7m7-7H3" />,
  Star: () => <Icon d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
};

const ICON_MAP = {
  Zap: Icons.Zap, Brain: Icons.Brain, FileText: Icons.FileText,
  Eye: Icons.Eye, Code: Icons.Code, ClipboardList: Icons.Document,
  Money: Icons.Money, Chart: Icons.Chart, Scale: Icons.Scale,
  Megaphone: Icons.Megaphone, Users: Icons.Users, Coin: Icons.Coin,
  Rocket: Icons.Rocket, Trending: Icons.Trending, Package: Icons.Package,
  Target: Icons.Target, Table: Icons.Table, Search: Icons.Search,
  Compare: Icons.Compare, Document: Icons.Document, Presentation: Icons.Presentation,
  Contract: Icons.Contract, Meeting: Icons.Meeting, Calculator: Icons.Calculator,
};

// ───────────────────────────────────────────────────────────────────────────
// 21 BUSINESS AGENTS (NO EMOJIS)
// ───────────────────────────────────────────────────────────────────────────
const AI_AGENTS = [
  { id: 'thinking', icon: 'Brain', label: 'Deep Thinking', desc: 'Strategic reasoning', minPackage: 'Gold', gradient: 'from-amber-500 to-orange-500', color: 'text-amber-400', bg: 'bg-amber-500/10', category: 'core' },
  { id: 'business', icon: 'Trending', label: 'Business', desc: 'Strategy & growth', minPackage: 'Basic', gradient: 'from-emerald-500 to-teal-500', color: 'text-emerald-400', bg: 'bg-emerald-500/10', category: 'business' },
  { id: 'startup', icon: 'Rocket', label: 'Startup', desc: 'Ideas, MVP, funding', minPackage: 'Gold', gradient: 'from-indigo-500 to-purple-500', color: 'text-indigo-400', bg: 'bg-indigo-500/10', category: 'business' },
  { id: 'finance', icon: 'Money', label: 'Finance', desc: 'Cash flow, P&L, taxes', minPackage: 'Gold', gradient: 'from-yellow-500 to-amber-500', color: 'text-yellow-400', bg: 'bg-yellow-500/10', category: 'business' },
  { id: 'crypto', icon: 'Coin', label: 'Crypto', desc: 'Bitcoin, Ethereum, Web3', minPackage: 'Gold', gradient: 'from-orange-500 to-red-500', color: 'text-orange-400', bg: 'bg-orange-500/10', category: 'business' },
  { id: 'marketing', icon: 'Megaphone', label: 'Marketing', desc: 'Ads, social, content', minPackage: 'Gold', gradient: 'from-fuchsia-500 to-pink-500', color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', category: 'business' },
  { id: 'sales', icon: 'Target', label: 'Sales', desc: 'Scripts, outreach, closing', minPackage: 'Gold', gradient: 'from-rose-500 to-red-500', color: 'text-rose-400', bg: 'bg-rose-500/10', category: 'business' },
  { id: 'investing', icon: 'Chart', label: 'Investing', desc: 'Portfolio, stocks, wealth', minPackage: 'Gold', gradient: 'from-cyan-500 to-blue-500', color: 'text-cyan-400', bg: 'bg-cyan-500/10', category: 'business' },
  { id: 'product', icon: 'Package', label: 'Product', desc: 'PM, UX, roadmap', minPackage: 'Gold', gradient: 'from-violet-500 to-purple-500', color: 'text-violet-400', bg: 'bg-violet-500/10', category: 'business' },
  { id: 'legal', icon: 'Scale', label: 'Legal', desc: 'Contracts, compliance', minPackage: 'Gold', gradient: 'from-slate-500 to-gray-500', color: 'text-slate-300', bg: 'bg-slate-500/10', category: 'business' },
  { id: 'research', icon: 'Search', label: 'Deep Research', desc: 'Multi-step analysis', minPackage: 'Gold', gradient: 'from-blue-500 to-indigo-500', color: 'text-blue-400', bg: 'bg-blue-500/10', category: 'advanced' },
  { id: 'competitor', icon: 'Compare', label: 'Competitor Analysis', desc: 'Market intelligence', minPackage: 'Gold', gradient: 'from-teal-500 to-cyan-500', color: 'text-teal-400', bg: 'bg-teal-500/10', category: 'advanced' },
  { id: 'businessplan', icon: 'Document', label: 'Business Plan', desc: 'Full plan generator', minPackage: 'Gold', gradient: 'from-purple-500 to-pink-500', color: 'text-purple-400', bg: 'bg-purple-500/10', category: 'advanced' },
  { id: 'pitchdeck', icon: 'Presentation', label: 'Pitch Deck', desc: 'Investor presentation', minPackage: 'Gold', gradient: 'from-pink-500 to-rose-500', color: 'text-pink-400', bg: 'bg-pink-500/10', category: 'advanced' },
  { id: 'contract', icon: 'Contract', label: 'Contract Template', desc: 'Legal documents', minPackage: 'Gold', gradient: 'from-slate-500 to-zinc-500', color: 'text-slate-400', bg: 'bg-slate-500/10', category: 'advanced' },
  { id: 'meeting', icon: 'Meeting', label: 'Meeting Notes', desc: 'Summarize & action items', minPackage: 'Gold', gradient: 'from-orange-500 to-amber-500', color: 'text-orange-400', bg: 'bg-orange-500/10', category: 'advanced' },
  { id: 'calculator', icon: 'Calculator', label: 'Financial Calculator', desc: 'ROI, break-even, NPV', minPackage: 'Gold', gradient: 'from-emerald-500 to-green-500', color: 'text-emerald-400', bg: 'bg-emerald-500/10', category: 'advanced' },
  { id: 'excel', icon: 'Table', label: 'Excel Generator', desc: 'Create .xlsx files', minPackage: 'Gold', gradient: 'from-green-500 to-emerald-500', color: 'text-green-400', bg: 'bg-green-500/10', category: 'tools' },
  { id: 'file', icon: 'FileText', label: 'File Generator', desc: 'CSV, JSON, MD, TXT', minPackage: 'Gold', gradient: 'from-teal-500 to-cyan-500', color: 'text-teal-400', bg: 'bg-teal-500/10', category: 'tools' },
  { id: 'code', icon: 'Code', label: 'Code Generator', desc: 'React, Python, HTML', minPackage: 'Diamond', gradient: 'from-pink-500 to-rose-500', color: 'text-pink-400', bg: 'bg-pink-500/10', category: 'tools' },
];

// ───────────────────────────────────────────────────────────────────────────
// SUGGESTIONS (NO EMOJIS — using icon components)
// ───────────────────────────────────────────────────────────────────────────
const SUGGESTIONS = {
  standard: [
    { icon: Icons.Sparkles, text: 'What can you help me with as a business owner?' },
    { icon: Icons.Chart, text: 'Show me the difference between Free and Gold packages' },
    { icon: Icons.Trending, text: 'Give me 3 ideas to improve my business processes' },
  ],
  business: [
    { icon: Icons.Trending, text: 'How do I grow my business from $10K to $100K monthly?' },
    { icon: Icons.Target, text: 'Do a SWOT analysis for a small event planning company' },
    { icon: Icons.Money, text: 'How should I price my services for maximum profit?' },
  ],
  startup: [
    { icon: Icons.Rocket, text: 'Validate my SaaS idea: AI for small restaurants' },
    { icon: Icons.Presentation, text: 'Create a pitch deck outline for seed funding' },
    { icon: Icons.Chart, text: 'What metrics should I track for my startup?' },
  ],
  finance: [
    { icon: Icons.Money, text: 'How do I calculate my business break-even point?' },
    { icon: Icons.Chart, text: 'Create a 12-month financial forecast' },
    { icon: Icons.Trending, text: 'How can I optimize my taxes legally?' },
  ],
  crypto: [
    { icon: Icons.Coin, text: 'What are the current trends in Bitcoin and Ethereum?' },
    { icon: Icons.Chart, text: 'Explain the risks of crypto investing to a beginner' },
    { icon: Icons.Lock, text: 'How do I secure my crypto wallet properly?' },
  ],
  marketing: [
    { icon: Icons.Megaphone, text: 'Write 5 Instagram posts for a coffee shop' },
    { icon: Icons.Send, text: 'Create an email campaign for Black Friday' },
    { icon: Icons.Target, text: 'Build a Facebook Ads strategy for $500 budget' },
  ],
  sales: [
    { icon: Icons.Send, text: 'Write a cold email to potential B2B clients' },
    { icon: Icons.Target, text: 'How do I handle the "too expensive" objection?' },
    { icon: Icons.Meeting, text: 'Give me a sales script for selling software' },
  ],
  investing: [
    { icon: Icons.Chart, text: 'How should I allocate $10,000 for long-term growth?' },
    { icon: Icons.Money, text: 'Explain dollar-cost averaging vs lump sum investing' },
    { icon: Icons.Trending, text: 'Is real estate better than stocks for wealth?' },
  ],
  product: [
    { icon: Icons.Package, text: 'Help me prioritize features for my mobile app' },
    { icon: Icons.Users, text: 'Create user personas for a B2B SaaS product' },
    { icon: Icons.Target, text: 'How do I find product-market fit?' },
  ],
  legal: [
    { icon: Icons.Contract, text: 'Write a freelance service agreement template' },
    { icon: Icons.Scale, text: 'What should be in an NDA for my startup?' },
    { icon: Icons.Document, text: 'How do I register an LLC in my country?' },
  ],
  research: [
    { icon: Icons.Search, text: 'Research the future of AI in small business (2026-2030)' },
    { icon: Icons.Chart, text: 'Analyze the Georgian event industry market' },
    { icon: Icons.Brain, text: 'Deep dive: How do successful SaaS companies scale?' },
  ],
  competitor: [
    { icon: Icons.Compare, text: 'Analyze competitors for my coffee shop in Tbilisi' },
    { icon: Icons.Chart, text: 'Compare Notion, Airtable, and Coda for team management' },
    { icon: Icons.Target, text: 'Find gaps in the restaurant booking market' },
  ],
  businessplan: [
    { icon: Icons.Document, text: 'Create a business plan for an online clothing store' },
    { icon: Icons.Presentation, text: 'Write a business plan for a SaaS startup' },
    { icon: Icons.Chart, text: 'Business plan for a small bakery with 3-year projections' },
  ],
  pitchdeck: [
    { icon: Icons.Presentation, text: 'Create a 10-slide pitch deck for a fintech startup' },
    { icon: Icons.Target, text: 'Write investor pitch for an AI automation platform' },
    { icon: Icons.Rocket, text: 'Pitch deck for a food delivery app' },
  ],
  contract: [
    { icon: Icons.Contract, text: 'Create a service agreement for freelance web design' },
    { icon: Icons.Scale, text: 'Write an NDA for a software development partnership' },
    { icon: Icons.Document, text: 'Employment contract template for a small business' },
  ],
  meeting: [
    { icon: Icons.Meeting, text: 'Summarize these meeting notes: [paste your notes]' },
    { icon: Icons.Document, text: 'Extract action items from a project kickoff call' },
    { icon: Icons.Target, text: 'Create follow-up email after a client meeting' },
  ],
  calculator: [
    { icon: Icons.Calculator, text: 'Calculate ROI: invest $10,000, return $18,000 in 3 years' },
    { icon: Icons.Money, text: 'Break-even analysis: $5K fixed costs, $25 price, $10 variable' },
    { icon: Icons.Chart, text: 'Loan amortization: $50K at 8% for 5 years' },
  ],
  excel: [
    { icon: Icons.Table, text: 'Create a monthly sales report with 20 rows' },
    { icon: Icons.Money, text: 'Build a personal budget spreadsheet' },
    { icon: Icons.Users, text: 'Create a customer list Excel with 15 entries' },
  ],
  file: [
    { icon: Icons.FileText, text: 'Create a CSV file with 5 customers' },
    { icon: Icons.Document, text: 'Create a JSON config for my website' },
    { icon: Icons.FileText, text: 'Write a business plan in Markdown' },
  ],
  code: [
    { icon: Icons.Code, text: 'Write a React counter component with hooks' },
    { icon: Icons.Code, text: 'Write a Python script to analyze CSV sales data' },
    { icon: Icons.Code, text: 'Create a responsive landing page in HTML' },
  ],
  file: [
    { icon: Icons.Eye, text: 'Upload a photo of a table and make a CSV from it' },
    { icon: Icons.Document, text: 'Upload an invoice and make a JSON with all details' },
    { icon: Icons.FileText, text: 'Upload a handwritten note and make a Markdown file' },
  ],
  thinking: [
    { icon: Icons.Brain, text: 'Should I bootstrap or raise VC funding? Think deeply.' },
    { icon: Icons.Compare, text: 'Compare B2B vs B2C business models strategically' },
    { icon: Icons.Target, text: 'Help me decide on the right pricing strategy' },
  ],
};

// ─── FOLLOW-UP SUGGESTIONS per mode ───
const FOLLOW_UPS = {
  business: ['Give me a 90-day plan', 'What are the biggest risks?', 'Show me a SWOT analysis'],
  startup: ['Create a pitch deck', 'What is my TAM?', 'How do I find co-founders?'],
  finance: ['Show me a cash flow projection', 'Calculate my burn rate', 'Create a budget'],
  marketing: ['Write 5 social posts', 'Design an email campaign', 'Build ad strategy'],
  default: ['Tell me more', 'Give me examples', 'Create a file with this info'],
};

const PKG_LEVELS = { Free: 0, Basic: 1, Gold: 2, Diamond: 3, Infinity: 4 };
const canUse = (agent, pkg) => (PKG_LEVELS[pkg] ?? 0) >= (PKG_LEVELS[agent.minPackage] ?? 0);

// ─── Helpers ───
const formatSize = (bytes) => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
};

const fileIconFor = (name = '', mime = '', type = '') => {
  if (type === 'excel') return 'xlsx';
  const n = name.toLowerCase();
  if (n.endsWith('.xlsx')) return 'xlsx';
  if (mime.includes('csv') || n.endsWith('.csv')) return 'csv';
  if (mime.includes('json') || n.endsWith('.json')) return 'json';
  if (mime.includes('markdown') || n.endsWith('.md')) return 'md';
  if (mime.includes('html') || n.endsWith('.html')) return 'html';
  if (n.match(/\.(jsx?|tsx?)$/)) return 'js';
  if (mime.includes('python') || n.endsWith('.py')) return 'py';
  if (n.endsWith('.sql')) return 'sql';
  return 'file';
};

const fileExtFor = (name = '') => {
  const parts = name.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'TXT';
};

// ─── Download Excel ───
async function downloadExcelFile(file) {
  try {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    for (const sheet of file.excelData?.sheets || []) {
      const rows = [sheet.headers, ...sheet.rows];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const colWidths = sheet.headers.map((h, i) => {
        const maxLen = Math.max(String(h).length, ...sheet.rows.map(row => String(row[i] || '').length));
        return { wch: Math.min(maxLen + 2, 40) };
      });
      ws['!cols'] = colWidths;
      XLSX.utils.book_append_sheet(wb, ws, sheet.name || 'Sheet1');
    }
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  } catch (err) {
    console.error('[excel]', err);
    alert('Excel download failed: ' + err.message);
  }
}

const downloadTextFile = (file) => {
  try {
    const blob = new Blob([file.content], { type: file.mime || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  } catch (err) {
    alert('Download failed: ' + err.message);
  }
};

const downloadFile = async (file) => {
  if (file.type === 'excel' || file.name.endsWith('.xlsx')) {
    await downloadExcelFile(file);
  } else {
    downloadTextFile(file);
  }
};

// ─── Voice input hook ───
function useVoiceInput(onResult) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const start = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input not supported in this browser. Use Chrome or Edge.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  }, [onResult]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  return { isListening, start, stop };
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function AgentChat({ agent, onClose, onHome }) {
  const { currentUser } = useAuth();
  const { trialData } = useFreeTrial(currentUser?.uid);
  const pkg = trialData?.package || 'Free';

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('dng_ai_chat_v4');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [activeMode, setActiveMode] = useState('business');
  const [isSending, setIsSending] = useState(false);
  const [showModes, setShowModes] = useState(false);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const modesRef = useRef(null);
  const textareaRef = useRef(null);

  const activeAgent = AI_AGENTS.find(a => a.id === activeMode) || AI_AGENTS[0];
  const ActiveIcon = ICON_MAP[activeAgent.icon] || Icons.Zap;
  const suggestions = SUGGESTIONS[activeMode] || SUGGESTIONS.standard;
  const followUps = FOLLOW_UPS[activeMode] || FOLLOW_UPS.default;

    useEffect(() => {
    document.body.classList.add('no-custom-cursor');
    return () => document.body.classList.remove('no-custom-cursor');
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  useEffect(() => {
    try {
      localStorage.setItem('dng_ai_chat_v4', JSON.stringify(messages.slice(-40)));
    } catch {}
  }, [messages]);

  useEffect(() => {
    if (!showModes) return;
    const onClick = (e) => {
      if (modesRef.current && !modesRef.current.contains(e.target)) setShowModes(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [showModes]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }, [input]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      setError('Image too large (max 2.5MB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      setImageFile({
        base64,
        mediaType: file.type,
        name: file.name,
        size: file.size,
        previewUrl: reader.result,
      });
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (customText = null) => {
    const textToSend = customText ?? input.trim();
    if ((!textToSend && !imageFile) || isSending) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: textToSend || '[Image]',
      image: imageFile?.previewUrl || null,
      mode: activeMode,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const currentImage = imageFile;
    setImageFile(null);
    setIsSending(true);
    setError(null);

    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error('Please sign in');

      const body = {
        text: textToSend,
        mode: activeMode,
        idToken,
        history: messages.slice(-5).map(m => ({ role: m.role, content: m.content })),
      };

      if (currentImage) {
        body.image = { data: currentImage.base64, mediaType: currentImage.mediaType };
      }

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.message || data.error || 'AI error');

      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.reply || (data.files?.length ? `Created ${data.files.length} file(s).` : ''),
        files: data.files || [],
        mode: data.mode || activeMode,
      };

      setMessages(prev => [...prev, aiMsg]);

      if (data.files?.length) {
        for (let i = 0; i < data.files.length; i++) {
          setTimeout(() => downloadFile(data.files[i]), i * 500);
        }
      }
    } catch (err) {
      setError(err.message || 'Error');
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = async (msg) => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopiedId(msg.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {}
  };

  const handleExportChat = () => {
    if (messages.length === 0) return;
    let content = '# DNG AI Chat Export\n\n';
    content += `Exported: ${new Date().toLocaleString()}\n\n---\n\n`;
    for (const msg of messages) {
      content += `## ${msg.role === 'user' ? 'User' : 'AI'}\n\n${msg.content}\n\n`;
      if (msg.files?.length) {
        content += `**Files:** ${msg.files.map(f => f.name).join(', ')}\n\n`;
      }
      content += '---\n\n';
    }
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dng_chat_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (!confirm('Clear chat history?')) return;
    setMessages([]);
    localStorage.removeItem('dng_ai_chat_v4');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Filter agents by search
  const filteredAgents = searchQuery.trim()
    ? AI_AGENTS.filter(a =>
        a.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : AI_AGENTS;

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[200px]" />
      </div>

      {/* TOP BAR */}
      {/* ═══ FLOATING HOME BUTTON (always visible) ═══ */}
      <button
        onClick={onHome}
        className="fixed top-4 left-4 z-50 w-11 h-11 rounded-xl bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 hover:border-white/30 text-gray-400 hover:text-white flex items-center justify-center transition-all shadow-2xl active:scale-95"
        title="Back to Home"
        aria-label="Back to Home"
      >
        <Icons.ArrowLeft />
      </button>

      {/* ═══ FLOATING AGENT INFO ═══ */}
      <button
        onClick={() => setShowProfile(!showProfile)}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all shadow-2xl active:scale-95"
        title="View profile"
      >
        <div className="relative">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
            <div className="scale-75 text-white"><Icons.Bot /></div>
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-400 border-2 border-[#0a0a0a]" />
        </div>
        <div className="text-left">
          <p className="text-white font-bold text-xs leading-tight">DNG AI</p>
          <p className={`text-[9px] font-bold uppercase tracking-wider ${activeAgent.color}`}>{activeAgent.label}</p>
        </div>
      </button>

      {/* ═══ FLOATING CLEAR BUTTON ═══ */}
      {messages.length > 0 && (
        <button
          onClick={handleClear}
          className="fixed top-4 right-4 z-50 w-11 h-11 rounded-xl bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 hover:border-red-500/30 text-gray-500 hover:text-red-400 flex items-center justify-center transition-all shadow-2xl active:scale-95"
          title="Clear history"
          aria-label="Clear history"
        >
          <Icons.Trash />
        </button>
      )}

      {/* Profile Panel */}
      <AnimatePresence>
        {showProfile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative z-20 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5 overflow-hidden"
          >
            <div className="max-w-4xl mx-auto px-4 py-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shrink-0 shadow-lg">
                  <Icons.Bot />
                </div>
                <div className="flex-1">
                  <h2 className="text-white font-bold text-lg">DNG AI</h2>
                  <p className="text-gray-400 text-xs mt-1">Business Intelligence Assistant - v4.0</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-bold">{AI_AGENTS.length} Agents</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">Excel</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[10px] font-bold">Research</span>
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[10px] font-bold">Photo → File</span>
                    <span className="px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-400 text-[10px] font-bold">Code</span>
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 text-[10px] font-bold">Voice</span>
                  </div>
                </div>
                <button onClick={() => setShowProfile(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white">
                  <Icons.X />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MESSAGES */}
      <main className="flex-1 relative z-10 overflow-y-auto px-4 pb-48 pt-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-8 pb-4">
              <div className="text-center mb-10">
                <div className={`w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br ${activeAgent.gradient} flex items-center justify-center mb-6 shadow-2xl`}>
                  <div className="text-white">
                    <ActiveIcon />
                  </div>
                </div>
                <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                  How can I help your business today?
                </h2>
                <p className="text-gray-400 text-sm max-w-md mx-auto">
                  {activeAgent.desc} — choose a suggestion or ask anything
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {suggestions.map((s, i) => {
                  const SugIcon = s.icon;
                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      onClick={() => handleSend(s.text)}
                      className="group relative flex items-start gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/20 transition-all text-left"
                    >
                      <div className={`w-8 h-8 rounded-lg ${activeAgent.bg} ${activeAgent.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                        <SugIcon />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-300 group-hover:text-white transition-colors leading-relaxed">{s.text}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-gray-700 to-gray-800 text-white'
                    : 'bg-gradient-to-br from-blue-500 to-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                }`}>
                  {msg.role === 'user' ? (
                    <span className="text-xs font-bold uppercase">
                      {currentUser?.displayName?.[0] || currentUser?.email?.[0] || 'U'}
                    </span>
                  ) : (
                    <Icons.Sparkles />
                  )}
                </div>

                <div className={`flex-1 max-w-[85%] min-w-0 ${msg.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                  {msg.image && (
                    <div className="mb-2 rounded-xl overflow-hidden border border-white/10 max-w-xs">
                      <img src={msg.image} alt="attachment" className="w-full h-auto" />
                    </div>
                  )}

                  {msg.content && (
                    <div className={`group relative rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap break-words ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-white border border-blue-500/30'
                        : 'bg-white/[0.03] text-gray-100 border border-white/10'
                    }`}>
                      {msg.content}

                      {msg.role === 'assistant' && (
                        <button
                          onClick={() => handleCopy(msg)}
                          className="absolute -bottom-3 right-2 p-1.5 rounded-lg bg-[#0a0a0a] border border-white/10 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                          title="Copy"
                        >
                          {copiedId === msg.id ? <Icons.Check /> : <Icons.Copy />}
                        </button>
                      )}
                    </div>
                  )}

                  {msg.files && msg.files.length > 0 && (
                    <div className="mt-3 space-y-2 w-full">
                      {msg.files.map((file, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-500/30 hover:border-emerald-500/50 transition-all"
                        >
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 font-bold text-[10px] uppercase">
                            {fileIconFor(file.name, file.mime, file.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{file.name}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">
                              {fileExtFor(file.name)} / {formatSize(file.size || file.content?.length || 0)}
                            </p>
                          </div>
                          <button
                            onClick={() => downloadFile(file)}
                            className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all shrink-0"
                            title="Download"
                          >
                            <Icons.Download />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Follow-up suggestions */}
                  {msg.role === 'assistant' && msg.id === messages[messages.length - 1]?.id && !isSending && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {followUps.map((fu, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(fu)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all"
                        >
                          <Icons.ChevronRight />
                          {fu}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isSending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
                <Icons.Sparkles />
              </div>
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
              <div className="text-red-400 mt-0.5 shrink-0"><Icons.Alert /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-red-400 font-semibold">Error</p>
                <p className="text-xs text-red-300/80 mt-0.5 break-words">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="p-1 rounded-lg hover:bg-red-500/20 text-red-400 shrink-0">
                <Icons.X />
              </button>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* INPUT */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent pt-12 pb-4 px-4">
        <div className="max-w-4xl mx-auto" ref={modesRef}>
          <AnimatePresence>
            {showModes && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full mb-3 left-4 right-4 max-w-3xl mx-auto rounded-2xl bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 shadow-[0_-10px_60px_rgba(0,0,0,0.8)] overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <Icons.Search className="w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={`Search ${AI_AGENTS.length} agents...`}
                      className="flex-1 bg-transparent text-white text-xs outline-none placeholder-gray-600"
                    />
                  </div>
                  <button onClick={() => setShowModes(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white">
                    <Icons.X />
                  </button>
                </div>
                <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[450px] overflow-y-auto">
                  {filteredAgents.map((m) => {
                    const unlocked = canUse(m, pkg);
                    const isActive = m.id === activeMode;
                    const IconCmp = ICON_MAP[m.icon] || Icons.Zap;

                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          if (!unlocked) {
                            setError(`${m.label} requires ${m.minPackage} package`);
                            return;
                          }
                          setActiveMode(m.id);
                          setShowModes(false);
                          setSearchQuery('');
                          setError(null);
                        }}
                        disabled={!unlocked}
                        className={`relative flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                          isActive
                            ? `bg-gradient-to-br ${m.gradient}/10 border border-white/20`
                            : unlocked
                            ? 'hover:bg-white/5 border border-transparent'
                            : 'opacity-50 cursor-not-allowed border border-transparent'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive ? `bg-gradient-to-br ${m.gradient} text-white` : `${m.bg} ${m.color}`
                        }`}>
                          <IconCmp />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-200'}`}>{m.label}</span>
                            {!unlocked && <Icons.Lock />}
                            {isActive && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded ${m.bg} ${m.color} font-bold`}>ACTIVE</span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{m.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="px-4 py-2 bg-white/[0.02] border-t border-white/5 text-center">
                  <p className="text-[10px] text-gray-600">Your package: <span className="text-gray-400 font-bold">{pkg}</span></p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {imageFile && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mb-2 p-2 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
                <img src={imageFile.previewUrl} alt="preview" className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white font-medium truncate">{imageFile.name}</p>
                  <p className="text-[10px] text-gray-500">{formatSize(imageFile.size)}</p>
                </div>
                <button onClick={() => setImageFile(null)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400">
                  <Icons.X />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-2 flex items-center gap-2 px-1">
            <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${activeAgent.gradient} flex items-center justify-center`}>
              <div className="scale-50"><ActiveIcon /></div>
            </div>
            <span className={`text-[11px] font-bold uppercase tracking-wider ${activeAgent.color}`}>{activeAgent.label}</span>
          </div>

          <div className={`relative rounded-3xl bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 focus-within:border-white/30 transition-colors shadow-2xl ${isSending ? 'opacity-60' : ''}`}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={
                activeMode === 'file' ? 'Upload a photo and say what file to make...' :
                activeMode === 'code' ? 'Describe the code you need...' :
                activeMode === 'excel' ? 'Describe the spreadsheet you need...' :
                activeMode === 'businessplan' ? 'Describe your business for a full plan...' :
                activeMode === 'pitchdeck' ? 'Describe your startup for a pitch deck...' :
                'Ask anything about business, finance, marketing...'
              }
              rows={1}
              disabled={isSending}
              className="w-full bg-transparent text-white placeholder-gray-500 resize-none px-5 pt-4 pb-2 outline-none text-sm sm:text-base max-h-[200px]"
            />

            <div className="flex items-center justify-between gap-2 px-3 pb-3">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (activeMode !== 'file' && activeMode !== 'thinking') {
                      setError('Photo upload is available in File Generator');
                      return;
                    }
                    fileInputRef.current?.click();
                  }}
                  className={`p-2.5 rounded-xl transition-colors ${
                    activeMode === 'file' || activeMode === 'thinking'
                      ? 'text-gray-400 hover:text-white hover:bg-white/10'
                      : 'text-gray-600 hover:bg-white/5'
                  }`}
                  title="Upload image"
                >
                  <Icons.Paperclip />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
<button
                  type="button"
                  onClick={() => setShowModes(v => !v)}
                  className={`p-2.5 rounded-xl transition-colors flex items-center gap-1.5 ${
                    showModes ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                  title="AI Agents"
                >
                  <Icons.Grid />
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleSend()}
                disabled={isSending || (!input.trim() && !imageFile)}
                className={`p-3 rounded-2xl bg-gradient-to-r ${activeAgent.gradient} text-white disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-all active:scale-95`}
              >
                {isSending ? <Icons.Loader /> : <Icons.Send />}
              </button>
            </div>
          </div>

          <p className="text-center text-[10px] text-gray-600 mt-2">
            Enter — send / Shift+Enter — new line / {AI_AGENTS.length} business agents
          </p>
        </div>
      </div>
    </div>
  );
}