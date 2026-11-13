import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';

export default function AdminPayments() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = auth.currentUser?.email === 'dng.solution01@gmail.com';

  useEffect(() => {
    if (!isAdmin) return;

    const q = query(collection(db, 'payment_requests'), where('status', '==', 'pending'));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
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
        <h1 className="text-3xl font-black text-white mb-8">💰 Payment Requests</h1>
        
        {requests.length === 0 ? (
          <div className="text-center text-gray-500 py-20">No pending requests</div>
        ) : (
          <div className="space-y-4">
            {requests.map(r => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-white font-bold">{r.userEmail}</p>
                    <p className="text-xs text-gray-500">UID: {r.userId.slice(0, 12)}...</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold text-lg">{r.amount} ₾</p>
                    <p className="text-xs text-gray-500 uppercase">{r.packageId}</p>
                  </div>
                </div>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}