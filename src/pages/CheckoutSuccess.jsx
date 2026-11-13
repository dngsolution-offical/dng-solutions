import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const orderId = searchParams.get('order_id');
  const [status, setStatus] = useState('checking');
  const [attempts, setAttempts] = useState(0);

  // Check order status with BOG
  useEffect(() => {
    if (!orderId) { setStatus('error'); return; }

    const checkStatus = async () => {
      try {
        const res = await fetch('/api/bog-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });
        const data = await res.json();

        if (data.ok && data.status === 'paid') {
          setStatus('success');
          setTimeout(() => navigate('/agents'), 3000);
          return;
        }

        if (data.ok && (data.status === 'failed' || data.status === 'cancelled')) {
          setStatus('failed');
          return;
        }

        // Still pending — retry (up to 10 attempts, 3s interval)
        if (attempts < 10) {
          setTimeout(() => setAttempts(a => a + 1), 3000);
        } else {
          setStatus('pending_long');
        }
      } catch (err) {
        console.error('Status check error:', err);
      }
    };

    checkStatus();
  }, [orderId, attempts, navigate]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-[#0a0a0a] border border-white/10 rounded-3xl p-10 text-center"
      >
        {status === 'checking' && (
          <>
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-black text-white mb-2">Checking payment...</h1>
            <p className="text-gray-400 text-sm">Please wait, verifying with BOG...</p>
            <p className="text-gray-600 text-xs mt-4">Attempt {attempts + 1}/10</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-white mb-3">Payment Successful!</h1>
            <p className="text-gray-400 mb-6">Your package has been activated. Redirecting...</p>
            <Link to="/agents" className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl">
              Go to AI Agents
            </Link>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-white mb-3">Payment Failed</h1>
            <p className="text-gray-400 mb-6">The payment was declined or cancelled.</p>
            <Link to="/packages" className="inline-block px-6 py-3 bg-white text-black font-bold rounded-xl">
              Try Again
            </Link>
          </>
        )}

        {status === 'pending_long' && (
          <>
            <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-white mb-3">Payment Processing</h1>
            <p className="text-gray-400 mb-6">Your payment is being processed. Package will activate automatically within a few minutes.</p>
            <Link to="/agents" className="inline-block px-6 py-3 bg-white/10 border border-white/10 text-white font-bold rounded-xl">
              Continue
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-2xl font-black text-white mb-3">Something went wrong</h1>
            <p className="text-gray-400 mb-6">Order ID missing.</p>
            <Link to="/packages" className="inline-block px-6 py-3 bg-white text-black font-bold rounded-xl">
              Back to Packages
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}