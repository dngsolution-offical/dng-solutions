import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore/lite';
import { auth, db } from '../firebase';

const Icons = {
  CheckCircle: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  XCircle: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  AlertCircle: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Info: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Refresh: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
};

export default function Diagnostic() {
  const { t } = useTranslation();
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [score, setScore] = useState(0);
  const [activeTab, setActiveTab] = useState('status');

  const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message, type, time: new Date().toLocaleTimeString() }]);
  };

  const runDiagnostics = async () => {
    setLoading(true);
    setChecks([]);
    setLogs([]);
    addLog(t('diagnostic.starting'), 'info');

    const results = [];
    let successCount = 0;
    let totalChecks = 0;

    // ═══════════════ 1. Firebase Config ═══════════════
    totalChecks++;
    const requiredFirebaseVars = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID'];
    const missingFirebase = requiredFirebaseVars.filter(v => !import.meta.env[v]);
    const fbOk = missingFirebase.length === 0;
    if (fbOk) successCount++;
    results.push({ name: 'Firebase Config', status: fbOk ? 'success' : 'error', message: fbOk ? t('diagnostic.firebaseOk') : `Missing: ${missingFirebase.join(', ')}` });
    addLog(`Firebase Config: ${fbOk ? 'OK' : 'ERROR'}`, fbOk ? 'success' : 'error');

    // ═══════════════ 2. EmailJS Config ═══════════════
    totalChecks++;
    const requiredEmailVars = ['VITE_EMAILJS_SERVICE_ID', 'VITE_EMAILJS_TEMPLATE_ID', 'VITE_EMAILJS_PUBLIC_KEY'];
    const missingEmail = requiredEmailVars.filter(v => !import.meta.env[v]);
    const emailOk = missingEmail.length === 0;
    if (emailOk) successCount++;
    results.push({ name: 'EmailJS Config', status: emailOk ? 'success' : 'error', message: emailOk ? t('diagnostic.emailOk') : `Missing: ${missingEmail.join(', ')}` });
    addLog(`EmailJS: ${emailOk ? 'OK' : 'ERROR'}`, emailOk ? 'success' : 'error');

    // ═══════════════ 3. Firebase Auth ═══════════════
    totalChecks++;
    if (auth) {
      successCount++;
      results.push({ name: 'Firebase Auth', status: 'success', message: t('diagnostic.authOk') });
      addLog('Firebase Auth: OK', 'success');
    } else {
      results.push({ name: 'Firebase Auth', status: 'error', message: t('diagnostic.authFail') });
      addLog('Firebase Auth: ERROR', 'error');
    }

    // ═══════════════ 4. Firestore — public_stats (public read) ═══════════════
    totalChecks++;
    try {
      addLog(t('diagnostic.fsConnecting'), 'info');
      const snap = await getDoc(doc(db, 'public_stats', 'main'));
      if (snap.exists()) {
        successCount++;
        const d = snap.data();
        results.push({
          name: 'Firestore (public_stats)',
          status: 'success',
          message: `Connected. Users: ${d.users ?? 0}, Orders: ${d.orders ?? 0}`,
        });
        addLog('Firestore public_stats: OK', 'success');
      } else {
        successCount++;
        results.push({
          name: 'Firestore (public_stats)',
          status: 'warning',
          message: 'Connected, but "public_stats/main" doc is missing. Create it in Firebase Console → Firestore → Data.',
        });
        addLog('Firestore: Connected, doc missing', 'warning');
      }
    } catch (e) {
      results.push({
        name: 'Firestore (public_stats)',
        status: 'error',
        message: `${e.message} — Check Firebase Rules are published!`,
      });
      addLog(`Firestore: ERROR — ${e.message}`, 'error');
    }

    // ═══════════════ 5. Firestore — user doc (own) ═══════════════
    totalChecks++;
    if (auth.currentUser) {
      try {
        await getDoc(doc(db, 'users', auth.currentUser.uid));
        successCount++;
        results.push({ name: 'Firestore (your profile)', status: 'success', message: 'Your user doc is accessible.' });
        addLog('Firestore user doc: OK', 'success');
      } catch (e) {
        results.push({ name: 'Firestore (your profile)', status: 'error', message: `${e.message}` });
        addLog(`Firestore user doc: ERROR — ${e.message}`, 'error');
      }
    } else {
      results.push({ name: 'Firestore (your profile)', status: 'info', message: 'Sign in to test own profile access.' });
      addLog('Firestore user doc: SKIPPED (not signed in)', 'info');
    }

    // ═══════════════ 6. Claude API (backend) ═══════════════
    totalChecks++;
    addLog(t('diagnostic.apiTesting'), 'info');
    try {
      const res = await fetch('/api/parse-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'test', idToken: 'test' }),
      });

      if (res.ok || res.status === 400 || res.status === 401 || res.status === 422) {
        // Backend is responding (auth/validation errors = server works)
        successCount++;
        results.push({ name: 'Claude API', status: 'success', message: t('diagnostic.apiOk') });
        addLog('Claude API: OK (server responding)', 'success');
      } else if (res.status === 404) {
        if (isLocalhost) {
          results.push({
            name: 'Claude API',
            status: 'warning',
            message: 'Backend not running on localhost. Open a second terminal and run: npm run dev:api',
          });
          addLog('Claude API: WARNING — dev backend not running', 'warning');
        } else {
          results.push({
            name: 'Claude API',
            status: 'error',
            message: 'API endpoint missing in production! Check Vercel deployment.',
          });
          addLog('Claude API: ERROR — endpoint missing on production', 'error');
        }
      } else if (res.status === 405) {
        successCount++;
        results.push({ name: 'Claude API', status: 'warning', message: 'API responding, method not allowed (check route).' });
        addLog(`Claude API: 405`, 'warning');
      } else {
        results.push({ name: 'Claude API', status: 'warning', message: `Status: ${res.status}` });
        addLog(`Claude API: ${res.status}`, 'warning');
      }
    } catch (e) {
      if (isLocalhost) {
        results.push({
          name: 'Claude API',
          status: 'warning',
          message: 'Backend not running. Run: npm run dev:api (in second terminal)',
        });
        addLog('Claude API: WARNING — backend not running', 'warning');
      } else {
        results.push({ name: 'Claude API', status: 'error', message: `Cannot reach API: ${e.message}` });
        addLog(`Claude API: ERROR — ${e.message}`, 'error');
      }
    }

    // ═══════════════ 7. Browser ═══════════════
    totalChecks++;
    results.push({
      name: 'Browser',
      status: 'info',
      message: `Language: ${navigator.language} | Online: ${navigator.onLine ? 'yes' : 'no'} | Domain: ${window.location.hostname}`,
    });
    addLog(`Browser: ${navigator.userAgent.split(' ')[0]}`, 'info');

    const percentage = Math.round((successCount / totalChecks) * 100);
    setScore(percentage);
    setChecks(results);
    setLoading(false);
    addLog(`${t('diagnostic.finished')} ${percentage}%`, percentage >= 80 ? 'success' : percentage >= 50 ? 'warning' : 'error');
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusColor = (status) => {
    if (status === 'success') return 'text-green-400 bg-green-500/5 border-green-500/20';
    if (status === 'error') return 'text-red-400 bg-red-500/5 border-red-500/20';
    if (status === 'warning') return 'text-yellow-400 bg-yellow-500/5 border-yellow-500/20';
    return 'text-blue-400 bg-blue-500/5 border-blue-500/20';
  };

  const getStatusIcon = (status) => {
    if (status === 'success') return <Icons.CheckCircle />;
    if (status === 'error') return <Icons.XCircle />;
    if (status === 'warning') return <Icons.AlertCircle />;
    return <Icons.Info />;
  };

  const getScoreColor = (s) => (s >= 80 ? 'text-green-400' : s >= 50 ? 'text-yellow-400' : 'text-red-400');
  const getScoreBg = (s) => (s >= 80 ? 'bg-green-500/10 border-green-500/20' : s >= 50 ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-red-500/10 border-red-500/20');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-dng-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">{t('diagnostic.running')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.05),transparent_50%)] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <h1 className="text-3xl font-black text-white mb-2">{t('diagnostic.title')}</h1>
              <p className="text-gray-500">{t('diagnostic.subtitle')}</p>
            </div>
            <div className={`flex items-center gap-6 px-8 py-4 rounded-2xl border ${getScoreBg(score)}`}>
              <div className="text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t('diagnostic.score')}</p>
                <p className={`text-4xl font-black ${getScoreColor(score)}`}>{score}%</p>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t('diagnostic.status')}</p>
                <p className={`text-lg font-bold ${getScoreColor(score)}`}>
                  {score >= 80 ? t('diagnostic.excellent') : score >= 50 ? t('diagnostic.average') : t('diagnostic.needsAttention')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <button onClick={() => setActiveTab('status')} className={`px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === 'status' ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}>{t('diagnostic.tabStatus')}</button>
            <button onClick={() => setActiveTab('logs')} className={`px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === 'logs' ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}>{t('diagnostic.tabLogs')}</button>
            <button onClick={runDiagnostics} className="ml-auto px-4 py-2 rounded-lg font-semibold bg-dng-cyan/10 text-dng-cyan border border-dng-cyan/20 hover:bg-dng-cyan/20 transition-all flex items-center gap-2">
              <Icons.Refresh /> {t('diagnostic.refresh')}
            </button>
          </div>

          {activeTab === 'status' && (
            <div className="grid md:grid-cols-2 gap-4">
              {checks.map((check, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className={`p-4 rounded-2xl border ${getStatusColor(check.status)}`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getStatusIcon(check.status)}</div>
                    <div>
                      <h3 className="font-bold text-sm">{check.name}</h3>
                      <p className="text-xs opacity-80 mt-0.5">{check.message}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 font-mono text-sm space-y-2 max-h-[500px] overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i} className={`flex gap-3 ${log.type === 'success' ? 'text-green-400' : log.type === 'error' ? 'text-red-400' : log.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'}`}>
                  <span className="text-gray-600 flex-shrink-0">[{log.time}]</span>
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 p-6 bg-[#0A0A0A] border border-white/5 rounded-2xl">
            <h3 className="text-white font-bold mb-4">{t('diagnostic.recommendations')}</h3>
            <ul className="text-gray-400 text-sm space-y-2 list-disc list-inside">
              <li>{t('diagnostic.rec1')}</li>
              <li>{t('diagnostic.rec2')}</li>
              <li>{t('diagnostic.rec3')}</li>
              <li>{t('diagnostic.rec4')}</li>
              <li>{t('diagnostic.rec5')}</li>
            </ul>
          </div>

          <div className="mt-8 text-center">
            <Link to="/" className="inline-block px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all">
              {t('diagnostic.backHome')}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}