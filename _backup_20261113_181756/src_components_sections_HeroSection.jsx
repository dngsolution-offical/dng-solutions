import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

const Icons = {
  Users: () => <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  ShoppingCart: () => <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
};

export default function HeroSection() {
  const { t } = useTranslation();
  
  const [stats, setStats] = useState({ users: 0, orders: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRealData() {
      try {
        // ვკითხულობთ users-ს
        const usersSnap = await getDocs(collection(db, 'users'));
        const usersCount = usersSnap.size;
        
        let usersArray = [];
        usersSnap.forEach(doc => {
          usersArray.push({
            id: doc.id,
            name: doc.data().name || doc.data().email?.split('@')[0] || 'User',
            package: doc.data().package || 'Free'
          });
        });

        // პაკეტების რანგირება (Infinity ყველაზე მაღლა)
        const pkgRank = { 'Infinity': 5, 'Diamond': 4, 'Gold': 3, 'Basic': 2, 'Free': 1 };
        usersArray.sort((a, b) => {
          const rankA = pkgRank[a.package] || 0;
          const rankB = pkgRank[b.package] || 0;
          return rankB - rankA;
        });
        
        // ვითვლით შეკვეთებს
        let ordersCount = 0;
        try {
          const ordersSnap = await getDocs(collection(db, 'orders'));
          ordersCount = ordersSnap.size;
        } catch (e) {
          console.log('Orders collection empty or blocked');
        }

        setStats({ users: usersCount, orders: ordersCount });
        setRecentUsers(usersArray.slice(0, 4)); // ვიღებთ ტოპ 4-ს
      } catch (err) {
        console.error('Live stats error:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRealData();
  }, []);

  return (
    <section className="relative min-h-screen pt-32 pb-20 flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.15),transparent_50%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">
        
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-dng-cyan uppercase tracking-wider mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-dng-cyan animate-pulse" />
            {t('hero.badge')}
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6">
            {t('hero.title1')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              {t('hero.title2')}
            </span> <br />
            {t('hero.title3')}
          </h1>
          
          <p className="text-lg text-gray-400 mb-8 max-w-lg leading-relaxed">
            {t('hero.desc')}
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link to="/register" className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 transition-transform">
              {t('hero.btnStart')}
            </Link>
            <Link to="/packages" className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-colors">
              {t('hero.btnPackages')}
            </Link>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 blur-[80px] rounded-full" />
          
          <div className="relative bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
              <div>
                <h3 className="text-white font-bold">{t('hero.dashTitle')}</h3>
                <p className="text-xs text-gray-500">{t('hero.dashSub')}</p>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Icons.Users />
                  <span className="text-xs text-gray-400 font-medium">{t('hero.liveUsers')}</span>
                </div>
                <div className="text-3xl font-black text-white">
                  {loading ? '...' : stats.users}
                </div>
              </div>
              <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Icons.ShoppingCart />
                  <span className="text-xs text-gray-400 font-medium">{t('hero.liveOrders')}</span>
                </div>
                <div className="text-3xl font-black text-white">
                  {loading ? '...' : stats.orders}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-white">{t('hero.recentUsers')}</h4>
              </div>
              <div className="space-y-2">
                {loading ? (
                  <div className="text-xs text-gray-500 text-center py-4">იტვირთება...</div>
                ) : recentUsers.length > 0 ? (
                  recentUsers.map((u, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center text-[10px] font-bold text-blue-400 uppercase">
                          {u.name.charAt(0)}
                        </div>
                        <span className="text-xs font-medium text-gray-300 truncate max-w-[100px]">{u.name}</span>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase ${
                        u.package === 'Infinity' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                        u.package === 'Diamond' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' :
                        u.package === 'Gold' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                        u.package === 'Basic' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                        'bg-white/5 border-white/10 text-gray-400'
                      }`}>
                        {u.package}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-500 text-center py-4">მონაცემები არ არის</div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}