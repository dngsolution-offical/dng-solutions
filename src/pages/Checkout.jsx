import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';

const PACKAGES = {
  basic: { name: 'Basic', priceGEL: 79, icon: '⚡', color: 'text-blue-400' },
  gold: { name: 'Gold', priceGEL: 249, icon: '👑', color: 'text-amber-400' },
  diamond: { name: 'Diamond', priceGEL: 799, icon: '💎', color: 'text-purple-400' },
  infinity: { name: 'Infinity', priceGEL: 1499, icon: '♾️', color: 'text-emerald-400' },
};

// ⚠️ შენი საბანკო რეკვიზიტები აქ ჩაწერე:
const BANK_DETAILS = {
  bankName: 'TBC Bank',
  accountNumber: 'GE00TB0000000000000000',
  receiverName: 'DNG Solutions',
  phone: '+995 555 000 000'
};

// ⚠️ Western Union მიმღების მონაცემები (უნდა ემთხვეოდეს ID-ს / ბანკის ანგარიშს):
const WESTERN_UNION_DETAILS = {
  receiverName: 'DNG Solutions', // ← ზუსტად ისე, როგორც პირადობაში / ბანკშია
  country: 'Georgia',
  city: 'Tbilisi',
  phone: '+995 551 222 098',
};

const Icons = {
  Bank: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11m16-11v11M8 14v3m4-3v3m4-3v3" /></svg>,
  Globe: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Copy: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
};

export default function Checkout() {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('bank_transfer'); // 'bank_transfer' | 'western_union'
  const [showDetails, setShowDetails] = useState(false);
  const [mtcn, setMtcn] = useState('');

  const safePackageId = (packageId || 'basic').toLowerCase();
  const pkgData = PACKAGES[safePackageId] || PACKAGES.basic;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('დაკოპირდა!');
  };

  const handleSubmit = async () => {
    if (!currentUser) { navigate('/login'); return; }
    if (method === 'western_union' && !mtcn.trim()) {
      toast.error('შეიყვანეთ MTCN კოდი');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/quickpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: safePackageId,
          billingCycle: 'monthly',
          userId: currentUser.uid,
          userEmail: currentUser.email,
          amount: pkgData.priceGEL,
          paymentMethod: method,
          mtcn: method === 'western_union' ? mtcn.trim() : null,
        }),
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.message || 'Error');

      toast.success('მოთხოვნა გაგზავნილია! ადმინი მალე დაამტკიცებს.');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      toast.error('შეცდომა: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const isReady = showDetails && (method === 'bank_transfer' || (method === 'western_union' && mtcn.trim().length >= 8));

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 py-12">
      <Toaster position="top-center" />
      <div className="max-w-md w-full bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{pkgData.icon}</div>
          <h1 className="text-3xl font-black text-white">{pkgData.name}</h1>
          <p className={`text-xl font-bold ${pkgData.color}`}>{pkgData.priceGEL} ₾ / თვე</p>
        </div>

        {/* Payment Method Tabs */}
        <div className="grid grid-cols-2 gap-1.5 mb-6 p-1.5 bg-white/[0.03] rounded-2xl border border-white/10">
          <button
            onClick={() => { setMethod('bank_transfer'); setShowDetails(false); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              method === 'bank_transfer' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icons.Bank /> ბანკი
          </button>
          <button
            onClick={() => { setMethod('western_union'); setShowDetails(false); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              method === 'western_union' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icons.Globe /> Western Union
          </button>
        </div>

        {/* ─── BANK TRANSFER ─── */}
        {method === 'bank_transfer' && (
          <>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 mb-6 text-sm">
              <p className="text-gray-400 mb-2 font-bold">გადახდის ინსტრუქცია:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-300">
                <li>გადარიცხე <strong className="text-white">{pkgData.priceGEL} ₾</strong> ქვემოთ მოცემულ ანგარიშზე.</li>
                <li>დაუბრუნდი ამ გვერდს და დააჭირე <strong>"გადავიხადე"</strong>.</li>
                <li>ადმინი შეამოწმებს გადარიცხვას და გაააქტიურებს პაკეტს 24 საათში.</li>
              </ol>
            </div>

            {!showDetails ? (
              <button onClick={() => setShowDetails(true)} className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all mb-4">
                რეკვიზიტების ნახვა
              </button>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 mb-6 space-y-2 text-sm">
                <p><span className="text-gray-400">ბანკი:</span> <strong className="text-white">{BANK_DETAILS.bankName}</strong></p>
                <p><span className="text-gray-400">ანგარიში:</span> <strong className="text-white select-all">{BANK_DETAILS.accountNumber}</strong></p>
                <p><span className="text-gray-400">მიმღები:</span> <strong className="text-white">{BANK_DETAILS.receiverName}</strong></p>
                <p><span className="text-gray-400">ტელეფონი:</span> <strong className="text-white">{BANK_DETAILS.phone}</strong></p>
              </div>
            )}
          </>
        )}

        {/* ─── WESTERN UNION ─── */}
        {method === 'western_union' && (
          <>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 mb-6 text-sm">
              <p className="text-gray-400 mb-2 font-bold">Western Union ინსტრუქცია:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-300">
                <li>გახსენი <a href="https://www.westernunion.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">westernunion.com</a> ან აპი.</li>
                <li>გაგზავნე <strong className="text-white">{pkgData.priceGEL} ₾</strong> საქართველოში (Bank account ან Cash pickup).</li>
                <li>მიიღე <strong className="text-white">MTCN კოდი</strong> ელ-ფოსტაზე.</li>
                <li>შეიყვანე MTCN ქვემოთ და დააჭირე "გადავიხადე".</li>
              </ol>
            </div>

            {!showDetails ? (
              <button onClick={() => setShowDetails(true)} className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all mb-4">
                მიმღების რეკვიზიტების ნახვა
              </button>
            ) : (
              <>
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-5 mb-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">მიმღები:</span>
                    <span className="flex items-center gap-2">
                      <strong className="text-white">{WESTERN_UNION_DETAILS.receiverName}</strong>
                      <button onClick={() => copyToClipboard(WESTERN_UNION_DETAILS.receiverName)} className="text-cyan-400 hover:text-white transition-colors">
                        <Icons.Copy />
                      </button>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">ქვეყანა:</span>
                    <strong className="text-white">{WESTERN_UNION_DETAILS.country}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">ქალაქი:</span>
                    <strong className="text-white">{WESTERN_UNION_DETAILS.city}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">ტელეფონი:</span>
                    <span className="flex items-center gap-2">
                      <strong className="text-white">{WESTERN_UNION_DETAILS.phone}</strong>
                      <button onClick={() => copyToClipboard(WESTERN_UNION_DETAILS.phone)} className="text-cyan-400 hover:text-white transition-colors">
                        <Icons.Copy />
                      </button>
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 font-bold">
                    MTCN კოდი (10 ნიშნა)
                  </label>
                  <input
                    type="text"
                    value={mtcn}
                    onChange={(e) => setMtcn(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="მაგ: 1234567890"
                    inputMode="numeric"
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all text-sm font-mono tracking-wider"
                  />
                  <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
                    MTCN არის 10-ნიშნა კოდი, რომელსაც Western Union გიგზავნით ელ-ფოსტაზე გადარიცხვის შემდეგ.
                  </p>
                </div>
              </>
            )}
          </>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !isReady}
          className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
            loading || !isReady
              ? 'bg-gray-700 opacity-50 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90'
          }`}
        >
          {loading ? 'მუშავდება...' : '✅ გადავიხადე (ადმინისთვის)'}
        </button>

        <Link to="/packages" className="block text-center text-xs text-gray-500 mt-4 hover:text-white">
          გაუქმება
        </Link>
      </div>
    </div>
  );
}