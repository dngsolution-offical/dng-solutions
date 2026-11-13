import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        toast.error(data.error === 'invalid_credentials' 
          ? 'არასწორი სახელი ან პაროლი' 
          : data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Save token
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminExpires', String(data.expiresAt));
      localStorage.setItem('isAdmin', 'true');

      toast.success('კეთილი იყოს თქვენი დაბრუნება!');
      setTimeout(() => navigate('/admin'), 500);
    } catch (err) {
      console.error('[AdminLogin]', err);
      toast.error('Network error: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 relative overflow-hidden">
      <Toaster position="top-center" toastOptions={{
        style: { background: '#0A0A0A', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
      }} />
      
      {/* Background glow */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-dng-blue/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-dng-cyan/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="bg-[#0A0A0A]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.6)]">
          
          {/* Icon */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-dng-blue to-dng-cyan rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Admin Access</h1>
            <p className="text-gray-400 text-sm">შეიყვანეთ ადმინის მონაცემები</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                autoFocus
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-dng-cyan focus:ring-2 focus:ring-dng-cyan/20 transition-all font-mono"
                placeholder="dng_master_admin..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-5 pr-12 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-dng-cyan focus:ring-2 focus:ring-dng-cyan/20 transition-all font-mono"
                  placeholder="••••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-dng-blue to-dng-cyan text-white font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'შესვლა...' : 'შესვლა'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] text-gray-600 uppercase tracking-wider">
              🔒 Admin area — authorized access only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}