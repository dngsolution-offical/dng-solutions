// src/pages/CheckoutSuccess.jsx — BOG-ის დაბრუნების შემდეგ სტატუსის შემოწმება
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { auth } from '../firebase';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id') || sessionStorage.getItem('dng_bog_order');
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    if (!orderId) { setStatus('error'); return; }
    let cancelled = false;

    (async () => {
      const token = await auth.currentUser?.getIdToken();
      if (!token) { setStatus('login'); return; }

      for (let i = 0; i < 10 && !cancelled; i++) {
        try {
          const r = await fetch('/api/bog-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ orderId }),
          });
          const d = await r.json().catch(() => ({}));
          if (d.status === 'paid') {
            sessionStorage.removeItem('dng_bog_order');
            if (!cancelled) setStatus('paid');
            return;
          }
          if (d.status === 'failed') { if (!cancelled) setStatus('failed'); return; }
        } catch { /* ხელახლა ვცდით */ }
        await sleep(3000);
      }
      if (!cancelled) setStatus('pending');
    })();

    return () => { cancelled = true; };
  }, [orderId]);

  useEffect(() => {
    if (status !== 'paid') return;
    const t = setTimeout(() => navigate('/agents'), 3000);
    return () => clearTimeout(t);
  }, [status, navigate]);

  const box = 'min-h-screen bg-[#050505] flex items-center justify-center px-4 text-white';
  const card = 'max-w-md w-full bg-[#0a0a0a] border border-white/10 rounded-3xl p-10 text-center';

  return (
    <div className={box}>
      <div className={card}>
        {status === 'checking' && (<><h1 className="text-2xl font-black mb-2">მოწმდება გადახდა...</h1><p className="text-gray-400 text-sm">ერთი წუთი დაელოდე.</p></>)}
        {status === 'paid' && (<><h1 className="text-3xl font-black mb-3">გადახდა წარმატებულია!</h1><p className="text-gray-400 mb-6">პაკეტი გააქტიურდა. გადამისამართება...</p><Link to="/agents" className="inline-block px-6 py-3 bg-white text-black font-bold rounded-xl">AI აგენტებთან</Link></>)}
        {status === 'failed' && (<><h1 className="text-2xl font-black mb-3">გადახდა ვერ შესრულდა</h1><Link to="/packages" className="inline-block px-6 py-3 bg-white text-black font-bold rounded-xl">თავიდან ცდა</Link></>)}
        {status === 'pending' && (<><h1 className="text-2xl font-black mb-3">გადახდა მუშავდება</h1><p className="text-gray-400 mb-6">პაკეტი რამდენიმე წუთში ავტომატურად გააქტიურდება.</p><Link to="/agents" className="inline-block px-6 py-3 bg-white/10 border border-white/10 font-bold rounded-xl">პანელზე</Link></>)}
        {status === 'login' && (<><h1 className="text-2xl font-black mb-3">საჭიროა შესვლა</h1><Link to="/login" className="inline-block px-6 py-3 bg-white text-black font-bold rounded-xl">შესვლა</Link></>)}
        {status === 'error' && (<><h1 className="text-2xl font-black mb-3">შეკვეთის ნომერი ვერ მოიძებნა</h1><Link to="/packages" className="inline-block px-6 py-3 bg-white text-black font-bold rounded-xl">პაკეტები</Link></>)}
      </div>
    </div>
  );
}