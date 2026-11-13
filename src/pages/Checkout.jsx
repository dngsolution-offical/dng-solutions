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

export default function Checkout() {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const pkgData = PACKAGES[packageId?.toLowerCase()] || PACKAGES.basic;

  const handleSubmit = async () => {
    if (!currentUser) { navigate('/login'); return; }
    setLoading(true);

    try {
      const res = await fetch('/api/quickpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: packageId.toLowerCase(),
          billingCycle: 'monthly',
          userId: currentUser.uid,
          userEmail: currentUser.email,
          amount: pkgData.priceGEL,
          paymentMethod: 'bank_transfer'
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

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <Toaster position="top-center" />
      <div className="max-w-md w-full bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{pkgData.icon}</div>
          <h1 className="text-3xl font-black text-white">{pkgData.name}</h1>
          <p className={`text-xl font-bold ${pkgData.color}`}>{pkgData.priceGEL} ₾ / თვე</p>
        </div>

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

        <button
          onClick={handleSubmit}
          disabled={loading || !showDetails}
          className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
            loading || !showDetails ? 'bg-gray-700 opacity-50 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90'
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