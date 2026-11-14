import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore/lite';
import { formatCurrency } from '../utils/currency';

const Icons = {
  ArrowLeft: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  History: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Download: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
};

export default function AgentHistory() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agentFilter, setAgentFilter] = useState('all');

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      try {
        const q = query(collection(db, 'orders'), where('uid', '==', currentUser.uid), orderBy('createdAt', 'desc'), limit(100));
        const snap = await getDocs(q);
        setOrders(snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate?.() || null })));
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [currentUser]);

  const filtered = agentFilter === 'all' ? orders : orders.filter(o => o.agentId === agentFilter);

  const handleExport = () => {
    if (filtered.length === 0) return;
    const headers = ['Date', 'Client', 'Celebrant', 'Guests', 'Menu', 'Program', 'Total', 'Paid', 'Balance', 'Status', 'Agent'];
    const rows = filtered.map(o => [o.orderDate || '', o.clientName || '', o.celebrantName || '', o.guests || 0, o.menuSummary || '', o.programSummary || '', o.totalAmount || 0, o.paidAmount || 0, o.balance || 0, o.status || '', o.agentId || 'text'].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csv = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `DNG_History_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const agentLabels = {
    all: t('historyPage.filterAll'),
    text: 'Text',
    excel: 'Excel',
    file: 'File',
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.06),transparent_50%)] pointer-events-none" />
      <div className="relative max-w-6xl mx-auto">
        <Link to="/agents" className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-6 transition-colors">
          <Icons.ArrowLeft /> {t('agentsPage.backToAgents')}
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">{t('historyPage.title')}</h1>
            <p className="text-gray-400">{t('historyPage.subtitle', { count: filtered.length })}</p>
          </div>
          <button onClick={handleExport} disabled={filtered.length === 0} className="px-5 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl disabled:opacity-40 flex items-center gap-2">
            <Icons.Download /> {t('historyPage.exportCsv')}
          </button>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'text', 'excel', 'file'].map(a => (
            <button key={a} onClick={() => setAgentFilter(a)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${agentFilter === a ? 'bg-dng-cyan/10 text-dng-cyan border border-dng-cyan/30' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
              {agentLabels[a]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">{t('historyPage.loading')}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center text-gray-500"><Icons.History /></div>
            <p className="text-gray-500">{t('historyPage.empty')}</p>
          </div>
        ) : (
          <div className="bg-[#0A0A0C] border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/[0.03] border-b border-white/10">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">{t('historyPage.date')}</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">{t('historyPage.client')}</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">{t('historyPage.celebrant')}</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">{t('historyPage.guests')}</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">{t('historyPage.total')}</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">{t('historyPage.balance')}</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase">{t('historyPage.agent')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map(o => (
                    <motion.tr key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-400">{o.orderDate || o.createdAt?.toLocaleDateString() || '—'}</td>
                      <td className="px-4 py-3 text-sm text-white">{o.clientName || '—'}</td>
                      <td className="px-4 py-3 text-sm text-white">{o.celebrantName || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{o.guests || 0}</td>
                      <td className="px-4 py-3 text-sm text-dng-cyan font-bold text-right">{formatCurrency(o.totalAmount || 0)}</td>
                      <td className="px-4 py-3 text-sm text-red-400 font-bold text-right">{formatCurrency(o.balance || 0)}</td>
                      <td className="px-4 py-3 text-center"><span className="px-2 py-1 rounded-md bg-dng-cyan/10 text-dng-cyan text-xs font-bold uppercase">{o.agentId || 'text'}</span></td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}