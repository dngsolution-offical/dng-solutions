import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore/lite';

const Icons = {
  ArrowLeft: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Chart: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
};

const AGENT_COLORS = {
  text: 'bg-blue-500/20 text-blue-400',
  excel: 'bg-green-500/20 text-green-400',
  email: 'bg-cyan-500/20 text-cyan-400',
  vision: 'bg-purple-500/20 text-purple-400',
  report: 'bg-yellow-500/20 text-yellow-400',
  crm: 'bg-pink-500/20 text-pink-400',
  schedule: 'bg-orange-500/20 text-orange-400',
  automation: 'bg-red-500/20 text-red-400',
  api: 'bg-cyan-500/20 text-cyan-400',
};

export default function AdminAgents() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (localStorage.getItem('isAdmin') !== 'true') {
      navigate('/admin/login');
      return;
    }

    (async () => {
      try {
        const q = query(collection(db, 'agent_usage'), orderBy('createdAt', 'desc'), limit(200));
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate?.() || null,
        }));
        setLogs(list);

        const counts = {};
        list.forEach(l => {
          counts[l.agentId] = (counts[l.agentId] || 0) + 1;
        });
        setStats(counts);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-dng-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <Link to="/admin" className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-6">
          <Icons.ArrowLeft /> Admin
        </Link>

        <h1 className="text-4xl font-black text-white mb-2">Agent Analytics</h1>
        <p className="text-gray-500 mb-8">ბოლო 200 გამოყენება</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {Object.entries(stats).map(([agent, count]) => (
            <motion.div
              key={agent}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0A0A0C] border border-white/10 rounded-2xl p-4"
            >
              <div className={`w-8 h-8 rounded-lg ${AGENT_COLORS[agent] || 'bg-gray-500/20 text-gray-400'} flex items-center justify-center mb-3`}>
                <Icons.Chart />
              </div>
              <p className="text-white font-bold text-xl">{count}</p>
              <p className="text-xs text-gray-500 uppercase">{agent}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-[#0A0A0C] border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/[0.03] border-b border-white/10">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">User ID</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Agent</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Package</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map(l => (
                  <tr key={l.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{l.uid?.slice(0, 12)}...</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${AGENT_COLORS[l.agentId] || 'bg-gray-500/20'}`}>
                        {l.agentId}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">{l.package}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{l.createdAt?.toLocaleString() || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}