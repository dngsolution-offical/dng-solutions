import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';

const PACKAGES = ['Free', 'Basic', 'Gold', 'Diamond', 'Infinity'];
const PKG_COLORS = {
  Free: 'bg-gray-500/20 text-gray-400',
  Basic: 'bg-blue-500/20 text-blue-400',
  Gold: 'bg-amber-500/20 text-amber-400',
  Diamond: 'bg-purple-500/20 text-purple-400',
  Infinity: 'bg-emerald-500/20 text-emerald-400',
};

function getAdminToken() {
  const token = localStorage.getItem('adminToken');
  const expires = Number(localStorage.getItem('adminExpires') || 0);
  if (!token || expires < Date.now()) return null;
  return token;
}

async function apiCall(method, body = null) {
  const token = getAdminToken();
  if (!token) throw new Error('Session expired — login again');

  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch('/api/admin', options);
  
  if (res.status === 401) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminExpires');
    localStorage.removeItem('isAdmin');
    throw new Error('Session expired — login again');
  }

  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.error || data.detail || `HTTP ${res.status}`);
  }
  return data;
}

export default function Admin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [selPkg, setSelPkg] = useState('Free');
  const [days, setDays] = useState(30);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  async function loadUsers() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiCall('GET');
      setUsers(data.users || []);
    } catch (e) {
      setError(e.message);
      if (e.message.includes('expired')) {
        setTimeout(() => navigate('/admin-login'), 1500);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!getAdminToken()) {
      navigate('/admin-login');
      return;
    }
    loadUsers();
  }, []);

  async function save() {
    if (!editing) return;
    setSaving(true);
    try {
      await apiCall('POST', {
        userId: editing.uid,
        packageName: selPkg,
        days: Number(days),
      });
      toast.success('✅ შენახულია');
      setEditing(null);
      await loadUsers();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    const token = getAdminToken();
    if (token) {
      fetch('/api/admin-login', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminExpires');
    localStorage.removeItem('isAdmin');
    navigate('/admin-login');
  }

  const filtered = users.filter(u => 
    !search || 
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-dng-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6">
        <Toaster position="top-center" />
        <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
        <p className="text-gray-400 mb-6 text-center max-w-md">{error}</p>
        <button onClick={() => navigate('/admin-login')} className="px-6 py-3 bg-gradient-to-r from-dng-blue to-dng-cyan text-white font-bold rounded-xl">
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-20 px-4">
      <Toaster position="top-center" />
      
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">Admin Panel</h1>
            <p className="text-gray-400">{users.length} users</p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadUsers} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold hover:bg-white/10">
              Refresh
            </button>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-bold hover:bg-red-500/20">
              Logout
            </button>
          </div>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email or name..."
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-dng-cyan/50"
          />
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/[0.03] border-b border-white/10">
              <tr>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">User</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Package</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Role</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Expires</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(u => (
                <tr key={u.uid} className="hover:bg-white/[0.02]">
                  <td className="p-4">
                    <div className="font-bold text-white text-sm">{u.name || 'User'}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-2 py-1 rounded-lg text-xs font-bold ${PKG_COLORS[u.package] || PKG_COLORS.Free}`}>
                      {u.package}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-gray-400">{u.role || 'user'}</td>
                  <td className="p-4 text-xs text-gray-400">
                    {u.expiresAt ? new Date(u.expiresAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => { setEditing(u); setSelPkg(u.package); setDays(30); }}
                      className="px-3 py-1.5 bg-gradient-to-r from-dng-blue to-dng-cyan text-white text-xs font-bold rounded-lg"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div onClick={() => !saving && setEditing(null)} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div onClick={(e) => e.stopPropagation()} className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 max-w-md w-full">
            <h3 className="text-xl font-black text-white mb-1">Change Package</h3>
            <p className="text-xs text-gray-500 mb-4">{editing.email}</p>

            <div className="space-y-2 mb-4">
              {PACKAGES.map(pkg => (
                <button
                  key={pkg}
                  onClick={() => setSelPkg(pkg)}
                  className={`w-full p-3 rounded-xl border-2 text-left flex justify-between ${
                    selPkg === pkg ? `${PKG_COLORS[pkg]} border-current` : 'bg-white/[0.02] border-white/10 text-gray-300'
                  }`}
                >
                  <span className="font-bold text-sm">{pkg}</span>
                  {selPkg === pkg && <span>✓</span>}
                </button>
              ))}
            </div>

            {selPkg !== 'Free' && (
              <div className="mb-4">
                <label className="text-xs text-gray-400 uppercase mb-2 block">Days</label>
                <input
                  type="number"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  min="1"
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setEditing(null)} disabled={saving} className="flex-1 py-3 bg-white/5 border border-white/10 text-gray-300 rounded-xl disabled:opacity-50">
                Cancel
              </button>
              <button onClick={save} disabled={saving} className="flex-1 py-3 bg-gradient-to-r from-dng-blue to-dng-cyan text-white font-bold rounded-xl disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}