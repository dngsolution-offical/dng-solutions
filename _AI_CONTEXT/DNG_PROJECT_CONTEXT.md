# DNG Solutions — Full Project Context

**Generated:** 2026-11-13 21:01:24
**Project Path:** C:\Users\tenad\dng-solutions

---

## 🎯 PROJECT OVERVIEW

**DNG Solutions** — AI automation platform for Georgian event businesses.
- **Live URL:** https://dng-solution01.vercel.app (when deployed)
- **Local Dev:** http://localhost:3000 (frontend) + http://localhost:3001 (backend)
- **Language:** Georgian (primary), English, Russian

### Core Value Proposition
Businesses send text/photo orders → AI parses them → calculates prices → stores in Firebase → exports to Excel.

---

## 🛠 TECH STACK

### Frontend
- **React 19** — UI framework
- **Vite 6** — build tool
- **React Router v7** — routing
- **Tailwind CSS 3** — styling
- **Framer Motion 14** — animations
- **i18next** — i18n (ka/en/ru)
- **Firebase SDK 13** — client auth/db
- **react-hot-toast** — notifications

### Backend
- **Node.js 24** — runtime
- **Express 5** — API server
- **firebase-admin 14** — backend Firebase
- **dotenv** — env vars

### Database
- **Firebase Firestore** — NoSQL
- **Firebase Auth** — email + Google
- **Firebase Storage** — files

### AI
- **Anthropic Claude** — \claude-haiku-5-5\ (cheap + fast)
- **API Key:** \sk-ant-api03-X1wx4iI55...\ (valid)
- **Balance:** \ (~500k+ calls with haiku)

---

## 📂 PROJECT STRUCTURE

\\\
C:\Users\tenad\dng-solutions\
├── api/
│   ├── _firebase.cjs          # Shared Firebase Admin init (v14 compatible)
│   ├── admin.js               # Admin: list users + change package
│   ├── agent-chat.js          # Claude chat endpoint
│   ├── agents.js              # AI agents runner
│   ├── cron.js                # Daily cron job
│   ├── parse-order.js         # Order parsing from text
│   ├── public-stats.js        # Public stats for home dashboard
│   ├── quickpay.js            # Payment gateway
│   └── quickpay-callback.js   # Payment callback
├── src/
│   ├── main.jsx               # React root
│   ├── App.jsx                # Router
│   ├── firebase.js            # Firebase client init
│   ├── i18n.js                # i18next config
│   ├── index.css              # Global styles
│   ├── components/
│   │   ├── agents/AgentChat.jsx
│   │   ├── auth/ProtectedRoute.jsx
│   │   ├── layout/Navbar.jsx, Footer.jsx
│   │   ├── sections/HeroSection.jsx, FeaturesSection.jsx, StatsSection.jsx, PackagesPreview.jsx, ReportBanner.jsx, CTASection.jsx
│   │   └── ui/Button.jsx, Card.jsx, CustomCursor.jsx, FreeLimitBanner.jsx, SectionTitle.jsx, CustomPackageModal.jsx
│   ├── config/agents.js, packageFeatures.js, prices.js
│   ├── context/AuthContext.jsx
│   ├── hooks/useFreeTrial.js, useAgents.js
│   ├── locales/ka.json, en.json, ru.json
│   ├── pages/
│   │   ├── Home.jsx, Services.jsx, Packages.jsx, About.jsx, Contact.jsx
│   │   ├── Login.jsx, Register.jsx, Profile.jsx, Settings.jsx
│   │   ├── Dashboard.jsx, Agents.jsx, AgentHistory.jsx, Schedules.jsx
│   │   ├── Admin.jsx, AdminLogin.jsx, AdminAgents.jsx
│   │   ├── Checkout.jsx, Diagnostic.jsx
│   │   └── Privacy.jsx, Terms.jsx, NotFound.jsx
│   └── utils/ (calculator, currency, packageTiers, api, adminSecurity)
├── public/ (favicon, logo, og-banner)
├── api-server.cjs             # Express backend
├── firestore.rules            # Firestore security rules
├── firebase-key.json          # Service Account (SECRET!)
├── .env                       # Environment variables (SECRET!)
├── package.json
├── vite.config.js
└── tailwind.config.js
\\\

---

## 🔑 ENVIRONMENT VARIABLES (.env)

\\\env
# Firebase Client (public, frontend)
VITE_FIREBASE_API_KEY=AIzaSy...              # Web API Key (39 chars)
VITE_FIREBASE_AUTH_DOMAIN=dng-solution01.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dng-solution01
VITE_FIREBASE_STORAGE_BUCKET=dng-solution01.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=1:...:web:...

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-api03-X1wx4iI55...  # Valid
ANTHROPIC_MODEL=claude-haiku-5-5             # Current

# EmailJS (contact form)
VITE_EMAILJS_SERVICE_ID=service_...
VITE_EMAILJS_TEMPLATE_ID=template_...
VITE_EMAILJS_PUBLIC_KEY=...

# Quickpay (payment)
QUICKPAY_API_KEY=qp_...
QUICKPAY_MERCHANT_ID=...

# Cron
CRON_SECRET=...
\\\

**⚠️ DO NOT COMMIT .env or firebase-key.json to git!**

---

## 🎯 FEATURES — CURRENT STATUS

### ✅ WORKING
- Frontend (Home, Services, Packages, About, Contact)
- Firebase Auth (email registration works, Google has issues with Brave)
- Backend API server (\localhost:3001\)
- Claude API integration (\claude-haiku-5-5\ — verified working, cost ~\.00004/call)
- Home dashboard with LIVE Firebase stats (8 users: 6 Free, 1 Diamond, 1 Infinity)
- Package Distribution chart (real-time)
- Recent Users list
- Admin Panel — user management (list users, change package)
- i18n: Georgian, English, Russian (all pages)
- Custom Package builder (on /packages page)
- Diagnostic page (86-100% score)

### ⚠️ PARTIALLY WORKING
- Google Auth (works without Brave Shields)
- Admin login (needs admin custom claim setup)
- AI Agent Chat (needs valid Firebase token)
- Checkout (Quickpay payment gateway — backend needs API keys)
- Firestore rules (need Publish in Firebase Console)

### ❌ NOT YET IMPLEMENTED
- Email verification flow
- Password reset flow
- 2FA
- Admin analytics (charts of revenue, etc.)
- Schedules (automated tasks) — UI exists but no cron
- Reports export (Excel/CSV) — skeleton exists
- Production deploy to Vercel

---

## 🚨 KNOWN ISSUES (ACTIVE)

| # | Issue | Cause | Status |
|---|---|---|---|
| 1 | \ERR_BLOCKED_BY_CLIENT\ (Firestore) | Brave Shields | TODO: toggle OFF |
| 2 | \pi/admin 401\ | Admin token not sent | TODO: fix Admin.jsx |
| 3 | \Missing or insufficient permissions\ | Firestore rules not published | TODO: Publish |
| 4 | \createRoot() double\ | main.jsx double init | TODO: fix |
| 5 | Google Auth fails | Brave Shields + wrong VITE_FIREBASE_API_KEY | Partially fixed |

---

## 🎯 NEXT STEPS (PRIORITY)

### IMMEDIATE (Today)
1. **Brave Shields OFF** — for localhost
2. **Publish firestore.rules** — Firebase Console
3. **main.jsx** — fix double createRoot
4. **Admin token** — verify Admin.jsx sends getIdToken()
5. **Test all flows** — register, login, admin, AI chat

### SHORT TERM (This week)
6. **Quickpay** — real payment flow
7. **Deploy to Vercel** — production
8. **Firestore rules** — test in production
9. **Admin analytics** — user growth chart, revenue

### MEDIUM TERM (Next month)
10. **Excel export** — real XLSX generation
11. **Email reports** — daily/weekly summary
12. **Schedules** — automated agent runs
13. **CRM integration** — customer management

---

## 📝 IMPORTANT NOTES FOR AI

When continuing work on this project:

1. **Firebase Admin v14** — uses \dmin.cert()\, \getFirestore()\, \getAuth()\ (NOT \dmin.credential.cert()\, \dmin.firestore()\, \dmin.auth()\)
2. **\_firebase.cjs\** — shared helper with v13/v14 fallback chain
3. **Claude model** — \claude-haiku-5-5\ (not \claude-3-5-haiku-latest\ — that's deprecated)
4. **API key vs Private Key** — \.env\ uses \AIzaSy...\ (Web API Key), \irebase-key.json\ uses \BEGIN PRIVATE KEY\
5. **Brave Shields** — must be OFF for localhost during dev
6. **Node \"type": "module"\** — REMOVED from package.json (allows \equire()\ in api/*.js)
7. **i18n keys** — all UI text must use \	('key')\, never hardcode Georgian
8. **Package names** — Free, Basic, Gold, Diamond, Infinity (in order)
9. **Test flow** — register → login → dashboard → admin panel

---

## 🔗 IMPORTANT URLS

- **Firebase Console:** https://console.firebase.google.com/project/dng-solution01
- **Firestore Rules:** https://console.firebase.google.com/project/dng-solution01/firestore/rules
- **Firestore Data:** https://console.firebase.google.com/project/dng-solution01/firestore/data
- **Auth Providers:** https://console.firebase.google.com/project/dng-solution01/authentication/providers
- **Anthropic Console:** https://console.anthropic.com/settings/keys
- **Anthropic Billing:** https://console.anthropic.com/settings/billing

## 💾 BACKUP COMMANDS

\\\powershell
# Full project backup
Compress-Archive -Path C:\Users\tenad\dng-solutions -DestinationPath "C:\Users\tenad\dng-solutions-backup-20261113.zip" -Force

# Env backup
Copy-Item C:\Users\tenad\dng-solutions\.env "C:\Users\tenad\.env.backup"
Copy-Item C:\Users\tenad\dng-solutions\firebase-key.json "C:\Users\tenad\firebase-key.backup.json"
\\\

---

**End of context file. Continue from NEXT STEPS above.**