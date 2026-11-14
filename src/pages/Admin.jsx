// src/pages/Admin.jsx — ადმინ პანელი: მომხმარებლები, პაკეტები, ვადები, ვიზიტები
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const PACKAGES = ['Free', 'Basic', 'Gold', 'Diamond', 'Infinity'];
const PAID = PACKAGES.filter((p) => p !== 'Free');
const QUICK_DAYS = [7, 30, 90, 180, 365];
const DAY = 86400000;
const TOKEN_KEY = 'adminToken';
const EXP_KEY = 'adminExpires';

const PKG_STYLE = {
  Free: 'bg-gray-500/15 text-gray-300 border-gray-500/30',
  Basic: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30',
  Gold: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
  Diamond: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
  Infinity: 'bg-violet-500/15 text-violet-300 border-violet-400/30',
};

const STATUS_META = {
  active: { label: 'აქტიური', cls: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/30' },
  expired: { label: 'ვადაგასული', cls: 'text-red-300 bg-red-400/10 border-red-400/30' },
  free: { label: 'უფასო', cls: 'text-gray-400 bg-white/5 border-white/10' },
};

const ERR = {
  SESSION_EXPIRED: 'სესია ამოიწურა, გთხოვთ თავიდან შეხვიდეთ',
  invalid_package: 'არასწორი პაკეტი',
  invalid_days: 'დღეების რაოდენობა უნდა იყოს 1-დან 3650-მდე',
  invalid_role: 'არასწორი როლი',
  no_active_package_to_extend: 'ჯერ აირჩიეთ პაკეტი',
  missing_userId: 'მომხმარებელი არ არის არჩეული',
  admin_not_configured: 'სერვერზე ადმინის პარამეტრები არ არის დაყენებული',
  too_many_attempts: 'ზედმეტად ბევრი მცდელობა. სცადეთ მოგვიანებით',
};

const ACT_ON = 'rounded-xl border border-cyan-400/60 bg-cyan-400/10 text-white font-bold text-sm py-2.5';
const ACT_OFF = 'rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/25 font-bold text-sm py-2.5 transition-colors';

function getAdminToken() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const exp = Number(localStorage.getItem(EXP_KEY) || 0);
    if (!token || exp < Date.now()) return null;
    return token;
  } catch (e) {
    return null;
  }
}

function clearAdminSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXP_KEY);
    localStorage.removeItem('isAdmin');
  } catch (e) {
    /* ignore */
  }
}

async function api(method, body) {
  const token = getAdminToken();
  if (!token) throw new Error('SESSION_EXPIRED');
  const res = await fetch('/api/admin', {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) {
    clearAdminSession();
    throw new Error('SESSION_EXPIRED');
  }
  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    /* empty body */
  }
  if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

function errorText(e) {
  return ERR[e.message] || e.message;
}

function fmtDate(iso) {
  return iso ? new Date(iso).toLocaleDateString('ka-GE') : '—';
}

function daysLeft(iso) {
  return iso ? Math.ceil((new Date(iso).getTime() - Date.now()) / DAY) : null;
}

function timeAgo(iso) {
  if (!iso) return 'არ შესულა';
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'ახლახან';
  if (mins < 60) return `${mins} წთ წინ`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} სთ წინ`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} დღის წინ`;
  return fmtDate(iso);
}

function statusOf(u) {
  if (u.package === 'Free') return 'free';
  return u.active ? 'active' : 'expired';
}

function previewExpiry(days) {
  return new Date(Date.now() + Number(days) * DAY).toISOString();
}

function exportCsv(rows) {
  const head = ['uid', 'name', 'email', 'package', 'status', 'expiresAt', 'createdAt', 'lastLoginAt', 'role'];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [head.join(',')];
  rows.forEach((u) =>
    lines.push(
      [u.uid, u.name, u.email, u.package, statusOf(u), u.expiresAt, u.createdAt, u.lastLoginAt, u.role]
        .map(esc)
        .join(',')
    )
  );
  const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Admin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [pkgFilter, setPkgFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selPkg, setSelPkg] = useState('Basic');
  const [days, setDays] = useState(30);
  const [mode, setMode] = useState('grant');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api('GET');
      setUsers(data.users || []);
    } catch (e) {
      setError(errorText(e));
      if (e.message === 'SESSION_EXPIRED') setTimeout(() => navigate('/admin-login'), 1500);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!getAdminToken()) {
      navigate('/admin-login');
      return;
    }
    loadUsers();
  }, [loadUsers, navigate]);

  const stats = useMemo(() => {
    const now = Date.now();
    const paid = users.filter((u) => u.package !== 'Free' && u.active);
    const expired = users.filter((u) => statusOf(u) === 'expired').length;
    const within = (ms) => users.filter((u) => u.lastLoginAt && now - new Date(u.lastLoginAt).getTime() < ms).length;
    const expiring = paid.filter((u) => u.expiresAt && daysLeft(u.expiresAt) <= 7).length;
    return {
      total: users.length,
      paid: paid.length,
      expired,
      expiring,
      day: within(DAY),
      week: within(7 * DAY),
    };
  }, [users]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (pkgFilter !== 'all' && u.package !== pkgFilter) return false;
      if (statusFilter !== 'all' && statusOf(u) !== statusFilter) return false;
      if (!q) return true;
      return [u.name, u.email, u.uid].some((f) => String(f || '').toLowerCase().includes(q));
    });
  }, [users, search, pkgFilter, statusFilter]);

  function openEditor(u) {
    setEditing(u);
    setSelPkg(u.package === 'Free' ? 'Basic' : u.package);
    setDays(30);
    setMode('grant');
  }

  async function run(action, payload, okText) {
    setSaving(true);
    try {
      await api('POST', { action, userId: editing.uid, ...payload });
      toast.success(okText);
      setEditing(null);
      await loadUsers();
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setSaving(false);
    }
  }

  function submitGrant() {
    const n = Number(days);
    if (!Number.isInteger(n) || n < 1 || n > 3650) {
      toast.error(ERR.invalid_days);
      return;
    }
    if (mode === 'extend') return run('extend', { packageName: selPkg, days: n }, 'ვადა გაგრძელდა');
    return run('grant', { packageName: selPkg, days: n }, 'პაკეტი მიენიჭა');
  }

  function revoke() {
    if (!window.confirm('პაკეტი გადავიდეს უფასოზე?')) return;
    run('revoke', {}, 'პაკეტი მოიხსნა');
  }

  function handleLogout() {
    const token = getAdminToken();
    if (token) {
      fetch('/api/admin-login', { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    }
    clearAdminSession();
    navigate('/admin-login');
  }

  if (loading && !users.length) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">იტვირთება...</p>
        </div>
      </div>
    );
  }

  if (error && !users.length) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6">
        <Toaster position="top-center" />
        <h1 className="text-2xl font-black text-red-400 mb-3">შეცდომა</h1>
        <p className="text-gray-400 mb-6 text-center max-w-md">{error}</p>
        <div className="flex gap-2">
          <button onClick={loadUsers} className="px-5 py-3 rounded-xl border border-white/10 text-gray-200 font-bold">
            თავიდან ცდა
          </button>
          <button
            onClick={() => navigate('/admin-login')}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-black font-black"
          >
            შესვლა
          </button>
        </div>
      </div>
    );
  }

  const previewIso = previewExpiry(Number(days) || 0);

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-20 px-4 relative overflow-hidden">
      <Toaster
        position="top-center"
        toastOptions={{ style: { background: '#0A0A0A', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-cyan-600/10 blur-[140px]"
      />

      <div className="relative max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] font-bold tracking-widest uppercase text-cyan-300/80 mb-2">ადმინისტრირება</p>
            <h1 className="text-3xl sm:text-4xl font-black text-white">მომხმარებლების მართვა</h1>
            <p className="text-gray-500 text-sm mt-1">სულ {users.length} ანგარიში</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => exportCsv(filtered)}
              disabled={!filtered.length}
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-gray-200 text-sm font-bold hover:bg-white/[0.07] disabled:opacity-40"
            >
              CSV ექსპორტი
            </button>
            <button
              onClick={loadUsers}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-gray-200 text-sm font-bold hover:bg-white/[0.07] disabled:opacity-40"
            >
              {loading ? 'იტვირთება...' : 'განახლება'}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm font-bold hover:bg-red-500/20"
            >
              გასვლა
            </button>
          </div>
        </header>

        <section className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
          {[
            { label: 'სულ მომხმარებელი', value: stats.total, tone: 'text-white' },
            { label: 'აქტიური პაკეტი', value: stats.paid, tone: 'text-emerald-300' },
            { label: 'ვადა იწურება 7 დღეში', value: stats.expiring, tone: 'text-amber-300' },
            { label: 'ვადაგასული', value: stats.expired, tone: 'text-red-300' },
            { label: 'შემოვიდა 24 სთ-ში', value: stats.day, tone: 'text-cyan-300' },
            { label: 'შემოვიდა 7 დღეში', value: stats.week, tone: 'text-sky-300' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-4"
            >
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold leading-snug">{s.label}</p>
              <p className={`mt-2 text-2xl font-black ${s.tone}`}>{s.value}</p>
            </motion.div>
          ))}
        </section>

        <section className="flex flex-col md:flex-row gap-3 mb-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ძებნა: სახელი, ემაილი ან UID"
            className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-400/50"
          />
          <select
            value={pkgFilter}
            onChange={(e) => setPkgFilter(e.target.value)}
            className="bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/50"
          >
            <option value="all">ყველა პაკეტი</option>
            {PACKAGES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/50"
          >
            <option value="all">ყველა სტატუსი</option>
            <option value="active">აქტიური</option>
            <option value="expired">ვადაგასული</option>
            <option value="free">უფასო</option>
          </select>
        </section>
        <p className="text-xs text-gray-500 mb-3">ნაპოვნია: {filtered.length}</p>

        <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-white/[0.03] border-b border-white/10">
                <tr>
                  {['მომხმარებელი', 'პაკეტი', 'სტატუსი', 'ვადა', 'რეგისტრაცია', 'ბოლო შესვლა', 'როლი', ''].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((u) => {
                  const st = statusOf(u);
                  const left = daysLeft(u.expiresAt);
                  return (
                    <tr key={u.uid} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-white text-sm">{u.name || 'უსახელო'}</div>
                        <div className="text-xs text-gray-500 break-all">{u.email || '—'}</div>
                        {u.disabled && <div className="text-[10px] text-red-400 mt-0.5">დაბლოკილი</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg border text-xs font-bold ${
                            PKG_STYLE[u.package] || PKG_STYLE.Free
                          }`}
                        >
                          {u.package}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-1 rounded-lg border text-xs font-bold ${STATUS_META[st].cls}`}>
                          {STATUS_META[st].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {u.expiresAt ? (
                          <>
                            <div>{fmtDate(u.expiresAt)}</div>
                            {st === 'active' && left !== null && (
                              <div className={left <= 7 ? 'text-amber-300' : 'text-gray-600'}>{left} დღე დარჩა</div>
                            )}
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{fmtDate(u.createdAt)}</td>
                      <td className="px-4 py-3 text-xs">
                        <span className={u.lastLoginAt ? 'text-gray-300' : 'text-gray-600'}>{timeAgo(u.lastLoginAt)}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{u.role === 'admin' ? 'ადმინი' : 'მომხმარებელი'}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openEditor(u)}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 text-black text-xs font-black hover:opacity-90"
                        >
                          მართვა
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!filtered.length && <div className="p-10 text-center text-gray-500 text-sm">მომხმარებელი ვერ მოიძებნა</div>}
        </div>
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !saving && setEditing(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0A0A0A] p-6 shadow-2xl"
            >
              <h3 className="text-xl font-black text-white">მომხმარებლის მართვა</h3>
              <p className="text-xs text-gray-500 mt-1 break-all">
                {editing.name || 'უსახელო'} · {editing.email || editing.uid}
              </p>

              <div className="mt-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">მოქმედება</p>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setMode('grant')} className={mode === 'grant' ? ACT_ON : ACT_OFF}>
                    ახალი ვადა
                  </button>
                  <button type="button" onClick={() => setMode('extend')} className={mode === 'extend' ? ACT_ON : ACT_OFF}>
                    ვადის დამატება
                  </button>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">პაკეტი</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PAID.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setSelPkg(p)}
                      className={`rounded-xl border py-2.5 text-sm font-bold transition-colors ${
                        selPkg === p ? PKG_STYLE[p] : 'border-white/10 text-gray-400 hover:text-white hover:border-white/25'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">დღეები</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {QUICK_DAYS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDays(d)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        Number(days) === d
                          ? 'border-cyan-400/60 text-cyan-200 bg-cyan-400/10'
                          : 'border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max="3650"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/50"
                />
                <p className="mt-2 text-xs text-gray-500">
                  {mode === 'grant'
                    ? `ვადა გავა: ${fmtDate(previewIso)}`
                    : 'ვადა დაემატება მიმდინარე ვადას. თუ ვადა გასულია, დათვლა დღევანდელი დღიდან მოხდება.'}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-xl border border-white/10 p-3">
                <div>
                  <p className="text-sm text-white font-bold">როლი</p>
                  <p className="text-xs text-gray-500">{editing.role === 'admin' ? 'ადმინი' : 'მომხმარებელი'}</p>
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    run('role', { role: editing.role === 'admin' ? 'user' : 'admin' }, 'როლი შეიცვალა')
                  }
                  className="px-3 py-1.5 rounded-lg border border-white/15 text-xs font-bold text-gray-200 hover:bg-white/5 disabled:opacity-50"
                >
                  {editing.role === 'admin' ? 'ადმინობის მოხსნა' : 'ადმინად დანიშვნა'}
                </button>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-2">
                {editing.package !== 'Free' && (
                  <button
                    type="button"
                    onClick={revoke}
                    disabled={saving}
                    className="sm:mr-auto py-3 px-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm font-bold disabled:opacity-50"
                  >
                    პაკეტის მოხსნა
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl border border-white/10 bg-white/5 text-gray-300 font-bold disabled:opacity-50"
                >
                  გაუქმება
                </button>
                <button
                  type="button"
                  onClick={submitGrant}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-black font-black disabled:opacity-50"
                >
                  {saving ? 'ინახება...' : 'შენახვა'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}