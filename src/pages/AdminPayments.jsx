import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';

const Icons = {
  Bank: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11m16-11v11" /></svg>,
  Globe: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" /></svg>,
  External: () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>,
};

export default function AdminPayments() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = auth.currentUser?.email === 'dng.solution01@gmail.com';

  useEffect(() => {
    if (!isAdmin) return;

    const q = query(collection(db, 'payment_requests'), where('status', '==', 'pending'));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort newest first
      list.sort((a, b) => {
        const ta = a.createdAt?.toMillis?.() ?? 0;
        const tb = b.createdAt?.toMillis?.() ?? 0;
        return tb - ta;
      });
      setRequests(list);
      setLoading(false);
    }, () => setLoading(false));

    return () => unsub();
  }, [isAdmin]);

  const approve = async (req) => {
    try {
      const res = await fetch('/api/quickpay-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: req.id, action: 'approve' }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Error');
      toast.success(`✅ დამტკიცდა: ${req.userEmail} → ${req.packageId}`);
    } catch (err) {
      toast.error('შეცდომა: ' + err.message);
    }
  };

  const reject = async (req) => {
    try {
      const res = await fetch('/api/quickpay-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: req.id, action: 'reject' }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Error');
      toast.error(`❌ უარყოფილია: ${req.userEmail}`);
    } catch (err) {
      toast.error('შეცდომა: ' + err.message);
    }
  };

  if (!isAdmin) {
    return <div className="min-h-screen bg-[#050505] text-white p-8 text-center">Access Denied</div>;
  }

  if (loading) {
    return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#050505] p-8">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-white mb-2">💰 Payment Requests</h1>
        <p className="text-gray-500 text-sm mb-8">{requests.length} pending</p>

        {requests.length === 0 ? (
          <div className="text-center text-gray-500 py-20">No pending requests</div>
        ) : (
          <div className="space-y-4">
            {requests.map(r => {
              const isWU = r.paymentMethod === 'western_union';
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                          isWU ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {isWU ? <Icons.Globe /> : <Icons.Bank />}
                          {isWU ? 'Western Union' : 'Bank Transfer'}
                        </span>
                      </div>
                      <p className="text-white font-bold">{r.userEmail}</p>
                      <p className="text-xs text-gray-500">UID: {(r.userId || '').slice(0, 12)}...</p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-bold text-lg">{r.amount} ₾</p>
                      <p className="text-xs text-gray-500 uppercase">{r.packageId}</p>
                    </div>
                  </div>

                  {/* Western Union MTCN */}
                  {isWU && r.mtcn && (
                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3 mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">MTCN (Western Union)</span>
                        <a
                          href="https://www.westernunion.com/us/en/track-transfer.html"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-white underline"
                        >
                          Track <Icons.External />
                        </a>
                      </div>
                      <p className="text-white font-mono text-lg font-bold select-all tracking-wider">{r.mtcn}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => approve(r)}
                      className="flex-1 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl hover:bg-emerald-500/30 transition-all"
                    >
                      ✅ დამტკიცება
                    </button>
                    <button
                      onClick={() => reject(r)}
                      className="flex-1 py-2 bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-xl hover:bg-red-500/30 transition-all"
                    >
                      ❌ უარყოფა
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}