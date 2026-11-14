import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore/lite';
import emailjs from '@emailjs/browser';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Icons = {
  Star: ({ filled }) => (
    <svg className={`w-10 h-10 transition-all ${filled ? 'text-yellow-400' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  Send: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
  ArrowLeft: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
};

const Report = () => {
  const { t } = useTranslation();
  const formRef = useRef();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error(t('report.ratingRequired') || 'გთხოვთ აირჩიოთ შეფასება');
      return;
    }
    setLoading(true);

    const formData = new FormData(formRef.current);
    const user_name = formData.get('user_name');
    const user_email = formData.get('user_email');
    const message = formData.get('message');

    try {
      // 1. Firebase-ში შენახვა
      try {
        await addDoc(collection(db, 'ratings'), {
          name: user_name,
          email: user_email,
          message: message,
          rating: rating,
          createdAt: serverTimestamp(),
          userId: auth.currentUser?.uid || null,
        });
      } catch (fbErr) {
        console.error('Firebase error:', fbErr);
      }

      // 2. EmailJS-ით გაგზავნა
      try {
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          {
            user_name: user_name,
            user_email: user_email,
            message: `⭐ შეფასება: ${rating}/5\n\n${message}`,
            subject: `ახალი შეფასება: ${rating}/5`,
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );
      } catch (emailErr) {
        console.error('EmailJS error:', emailErr);
        // თუ Firebase-ში შეინახა, მაგრამ მეილი ვერ გაიგზავნა — მაინც წარმატებულად ჩავთვალოთ
      }

      setSubmitted(true);
      toast.success(t('report.success'));
    } catch (err) {
      console.error(err);
      toast.error(t('report.error') || 'შეცდომა. სცადეთ მოგვიანებით.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-3xl font-black text-white mb-3">{t('report.thanks') || 'გმადლობთ!'}</h1>
          <p className="text-gray-400 mb-8 max-w-md">{t('report.success')}</p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all">
            <Icons.ArrowLeft />
            {t('profilePage.backHome')}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4 relative overflow-hidden font-sans">
      
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.08),transparent_50%)] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-dng-cyan/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-8 transition-colors">
            <Icons.ArrowLeft /> {t('profilePage.backHome')}
          </Link>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            {t('report.title')}
          </h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sm:p-8">
          
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            {/* Stars Rating */}
            <div className="text-center pb-6 border-b border-white/5">
              <label className="block text-sm text-gray-400 uppercase tracking-wider mb-4">{t('report.rate')}</label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="hover:scale-110 transition-transform"
                  >
                    <Icons.Star filled={star <= (hoveredRating || rating)} />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-yellow-400 mt-3 font-semibold">
                  {rating} / 5
                </motion.p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">{t('report.name')}</label>
              <input
                type="text"
                name="user_name"
                required
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-dng-cyan/50 transition-all text-sm"
                placeholder={t('contactPage.namePlaceholder')}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">{t('report.email')}</label>
              <input
                type="email"
                name="user_email"
                required
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-dng-cyan/50 transition-all text-sm"
                placeholder={t('contactPage.emailPlaceholder')}
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">{t('report.message')}</label>
              <textarea
                name="message"
                required
                rows={5}
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-dng-cyan/50 transition-all text-sm resize-none"
                placeholder={t('contactPage.messagePlaceholder')}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="w-full py-4 bg-gradient-to-r from-dng-blue to-dng-cyan text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('contactPage.sending')}
                </>
              ) : (
                <>
                  <Icons.Send />
                  {t('report.submit')}
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Report;