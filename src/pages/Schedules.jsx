import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useFreeTrial } from '../hooks/useFreeTrial';
import { db } from '../firebase';
import { 
  collection, query, where, orderBy, getDocs, 
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp 
} from 'firebase/firestore/lite';

const Icons = {
  ArrowLeft: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
  Clock: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>,
  Play: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Pause: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Lock: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
};

const SCHEDULE_LIMITS = { Free: 0, Basic: 0, Gold: 0, Diamond: 10, Infinity: 100 };

export default function Schedules() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { trialData } = useFreeTrial(currentUser?.uid);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newSchedule, setNewSchedule] = useState({ 
    task: '', agentToRun: 'text', frequency: 'daily', 
    scheduledTime: '', dayOfWeek: 1, dayOfMonth: 1 
  });

  const pkg = trialData?.package || 'Free';
  const canUseSchedule = ['Diamond', 'Infinity'].includes(pkg);
  const scheduleLimit = SCHEDULE_LIMITS[pkg] || 0;

  // Load schedules (no onSnapshot — use polling)
  useEffect(() => {
    if (!currentUser) return;
    
    let cancelled = false;
    
    async function loadSchedules() {
      try {
        const q = query(
          collection(db, 'schedules'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        if (cancelled) return;
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setSchedules(list);
        setLoading(false);
      } catch (e) {
        if (!cancelled) setLoading(false);
      }
    }
    
    loadSchedules();
    const timer = setInterval(loadSchedules, 10000);  // poll every 10s
    
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [currentUser]);

  const handleCreate = async () => {
    if (!currentUser) return;
    if (!newSchedule.task.trim()) { 
      toast.error('Task is required'); 
      return; 
    }
    if (schedules.length >= scheduleLimit) { 
      toast.error(`Limit reached (${scheduleLimit})`); 
      return; 
    }
    try {
      await addDoc(collection(db, 'schedules'), {
        userId: currentUser.uid,
        task: newSchedule.task.trim(),
        agentToRun: newSchedule.agentToRun,
        frequency: newSchedule.frequency,
        scheduledTime: newSchedule.scheduledTime 
          ? new Date(newSchedule.scheduledTime).toISOString() 
          : null,
        dayOfWeek: newSchedule.frequency === 'weekly' ? Number(newSchedule.dayOfWeek) : null,
        dayOfMonth: newSchedule.frequency === 'monthly' ? Number(newSchedule.dayOfMonth) : null,
        status: 'pending',
        lastRun: null,
        createdAt: serverTimestamp(),
      });
      setShowCreate(false);
      setNewSchedule({ 
        task: '', agentToRun: 'text', frequency: 'daily', 
        scheduledTime: '', dayOfWeek: 1, dayOfMonth: 1 
      });
      toast.success('Schedule created');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleToggle = async (schedule) => {
    try {
      await updateDoc(doc(db, 'schedules', schedule.id), { 
        status: schedule.status === 'pending' ? 'paused' : 'pending' 
      });
      toast.success('Status changed');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (schedule) => {
    if (!confirm('Delete this schedule?')) return;
    try { 
      await deleteDoc(doc(db, 'schedules', schedule.id)); 
      toast.success('Deleted'); 
    } catch (e) { 
      toast.error(e.message); 
    }
  };

  if (!currentUser) return null;

  if (!canUseSchedule) {
    return (
      <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Icons.Lock />
          </div>
          <h1 className="text-3xl font-black text-white mb-3">Schedules Locked</h1>
          <p className="text-gray-400 mb-8">Schedules require Diamond or Infinity package</p>
          <Link to="/packages" className="inline-block px-8 py-3 bg-gradient-to-r from-dng-blue to-dng-cyan text-white font-bold rounded-xl">
            View Packages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4">
      <Toaster position="top-right" />
      
      <div className="max-w-5xl mx-auto">
        <Link to="/agents" className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-6">
          <Icons.ArrowLeft /> Back to Agents
        </Link>

        <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">Schedules</h1>
            <p className="text-gray-400">
              {schedules.length} / {scheduleLimit} schedules ({pkg})
            </p>
          </div>
          <button 
            onClick={() => setShowCreate(true)} 
            disabled={schedules.length >= scheduleLimit}
            className="px-5 py-3 bg-gradient-to-r from-dng-blue to-dng-cyan text-white font-bold rounded-xl disabled:opacity-40 flex items-center gap-2"
          >
            <Icons.Plus /> New Schedule
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading...</div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
              <Icons.Clock />
            </div>
            <p className="text-gray-500 mb-4">No schedules yet</p>
            <button onClick={() => setShowCreate(true)} className="text-dng-cyan hover:underline">
              Create first schedule
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map(schedule => (
              <motion.div 
                key={schedule.id} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0A0A0C] border border-white/10 rounded-2xl p-5 flex items-start gap-4"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  schedule.status === 'pending' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'
                }`}>
                  <Icons.Clock />
                </div>
                <div className="flex-grow">
                  <p className="text-white font-semibold mb-1">{schedule.task}</p>
                  <p className="text-xs text-gray-500">
                    {schedule.frequency} · Agent: <span className="text-dng-cyan">{schedule.agentToRun}</span>
                  </p>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleToggle(schedule)} 
                    className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white"
                  >
                    {schedule.status === 'pending' ? <Icons.Pause /> : <Icons.Play />}
                  </button>
                  <button 
                    onClick={() => handleDelete(schedule)} 
                    className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-red-400"
                  >
                    <Icons.Trash />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {showCreate && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
              onClick={() => setShowCreate(false)}
            >
              <motion.div 
                initial={{ scale: 0.9 }} 
                animate={{ scale: 1 }} 
                exit={{ scale: 0.9 }} 
                className="bg-[#0A0A0C] border border-white/10 rounded-2xl p-6 max-w-md w-full" 
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold text-white mb-4">New Schedule</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 uppercase mb-2">Task</label>
                    <input 
                      type="text" 
                      value={newSchedule.task} 
                      onChange={(e) => setNewSchedule({ ...newSchedule, task: e.target.value })}
                      placeholder="What to do?" 
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 uppercase mb-2">Agent</label>
                    <select 
                      value={newSchedule.agentToRun} 
                      onChange={(e) => setNewSchedule({ ...newSchedule, agentToRun: e.target.value })}
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                    >
                      <option value="text">Text Agent</option>
                      <option value="excel">Excel Agent</option>
                      <option value="report">Report Agent</option>
                      <option value="email">Email Agent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 uppercase mb-2">Frequency</label>
                    <select 
                      value={newSchedule.frequency} 
                      onChange={(e) => setNewSchedule({ ...newSchedule, frequency: e.target.value })}
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                    >
                      <option value="once">Once</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <button onClick={() => setShowCreate(false)} className="flex-1 py-3 bg-white/5 text-gray-300 rounded-xl">Cancel</button>
                  <button onClick={handleCreate} className="flex-1 py-3 bg-gradient-to-r from-dng-blue to-dng-cyan text-white font-bold rounded-xl">Create</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}