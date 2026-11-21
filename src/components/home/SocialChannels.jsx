import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { GraduationCap, ArrowRight, Sparkles, Star } from 'lucide-react';

// Smooth counting component with requestAnimationFrame & ease-out
function AnimatedCounter({ end, duration = 1800, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  useEffect(() => {
    if (!isInView) return;
    let startTime = null;
    let animationFrame;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function SocialChannels() {
  return (
    <section id="community" className="py-20 md:py-24 relative overflow-hidden bg-[#060a14] border-t border-sky-500/10">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-[-10%] w-[35rem] h-[35rem] bg-rose-600/10 rounded-full blur-[150px] pointer-events-none -z-10 mix-blend-screen" />
      <div className="absolute top-1/2 right-[-10%] w-[35rem] h-[35rem] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none -z-10 mix-blend-screen" />

      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Community, Education & Feedback • අපේ ඩිජිටල් අවකාශය</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Connect, Learn & Share Your Feedback
          </h2>

          <p className="text-sm sm:text-base text-slate-300 mt-3 font-medium">
            නවතම තාක්ෂණික දැනුම සහ අධ්‍යාපනික සම්පත් ලබාගැනීමට අප හා එක්වන්න. ඔබගේ වටිනා අත්දැකීම Google Review එකක් මඟින් සටහන් කරන්න.
          </p>
        </div>

        {/* 1. TOP ROW: 3 Social Media Channels (YouTube, TikTok, Facebook) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 mb-6 sm:mb-7">
          
          {/* ======================================================== */}
          {/* 1. YOUTUBE CARD                                          */}
          {/* ======================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45 }}
            className="group relative rounded-[28px] p-6 sm:p-7 bg-[#10141d]/90 border border-white/5 hover:border-red-500/40 shadow-[0_15px_40px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_50px_rgba(239,68,68,0.18)] hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col justify-between items-center text-center select-none"
          >
            {/* Watermark YouTube Icon in Bottom-Right */}
            <div className="absolute -bottom-8 -right-8 w-44 h-44 text-red-500/[0.04] group-hover:text-red-500/[0.07] transition-colors pointer-events-none select-none">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>

            {/* Top Area: Icon, Title & Handle */}
            <div className="w-full flex flex-col items-center relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 flex items-center justify-center mb-5 shadow-[0_0_25px_rgba(239,68,68,0.2)] group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Tech Content Creator
              </h3>
              <p className="text-xs font-semibold text-red-400 mt-1">
                @desh_digital_hub
              </p>

              {/* Stat */}
              <div className="mt-5 mb-1">
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center justify-center">
                  <AnimatedCounter end={340000} />
                  <span className="text-red-500 font-bold ml-1">+</span>
                </div>
                <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mt-1">
                  TOTAL VIEWS
                </div>
              </div>

              {/* Scannable YouTube QR Code */}
              <a
                href="https://youtube.com/@desh_digital_hub"
                target="_blank"
                rel="noopener noreferrer"
                className="my-3 p-2.5 bg-white rounded-2xl shadow-xl border-2 border-white/90 flex flex-col items-center group-hover:scale-105 transition-transform cursor-pointer"
                title="Click or Scan QR to Subscribe on YouTube"
              >
                <img
                  src="/images/youtube_qr.webp"
                  alt="Scan to Subscribe on YouTube"
                  className="w-20 h-20 sm:w-22 sm:h-22 object-contain block select-none"
                  loading="lazy"
                />
                <span className="text-[9px] font-black text-slate-900 uppercase tracking-wider mt-1 flex items-center gap-1">
                  Scan to Subscribe
                </span>
              </a>

              {/* Description */}
              <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed max-w-xs">
                Sharing comprehensive tech guides, tutorials, and industry insights for the local IT community.
              </p>
            </div>

            {/* Bottom Button */}
            <div className="w-full pt-6 relative z-10 flex justify-center">
              <a
                href="https://youtube.com/@desh_digital_hub"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-red-500/40 text-red-300 hover:text-white hover:bg-red-500/20 hover:border-red-400 text-xs font-bold transition-all group/btn"
              >
                <span>Subscribe</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </a>
            </div>
          </motion.div>

          {/* ======================================================== */}
          {/* 2. TIKTOK CARD                                           */}
          {/* ======================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="group relative rounded-[28px] p-6 sm:p-7 bg-[#10141d]/90 border border-white/5 hover:border-cyan-500/40 shadow-[0_15px_40px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_50px_rgba(6,182,212,0.18)] hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col justify-between items-center text-center select-none"
          >
            {/* Watermark TikTok Icon in Bottom-Left */}
            <div className="absolute -bottom-8 -left-8 w-44 h-44 text-cyan-500/[0.04] group-hover:text-cyan-500/[0.07] transition-colors pointer-events-none select-none">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
            </div>

            {/* Top Area: Icon, Title & Handle */}
            <div className="w-full flex flex-col items-center relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-5 shadow-[0_0_25px_rgba(6,182,212,0.2)] group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Tech Educator
              </h3>
              <p className="text-xs font-semibold text-cyan-400 mt-1">
                @desh_digital_hub
              </p>

              {/* Stat */}
              <div className="mt-5 mb-1">
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center justify-center">
                  <AnimatedCounter end={14100} />
                  <span className="text-pink-500 font-bold ml-1">+</span>
                </div>
                <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mt-1">
                  FOLLOWERS
                </div>
              </div>

              {/* Scannable TikTok QR Code */}
              <a
                href="https://tiktok.com/@desh_digital_hub"
                target="_blank"
                rel="noopener noreferrer"
                className="my-3 p-2.5 bg-white rounded-2xl shadow-xl border-2 border-white/90 flex flex-col items-center group-hover:scale-105 transition-transform cursor-pointer"
                title="Click or Scan QR to Follow on TikTok"
              >
                <img
                  src="/images/tiktok_qr.webp"
                  alt="Scan to Follow on TikTok"
                  className="w-20 h-20 sm:w-22 sm:h-22 object-contain block select-none"
                  loading="lazy"
                />
                <span className="text-[9px] font-black text-slate-900 uppercase tracking-wider mt-1 flex items-center gap-1">
                  Scan to Follow
                </span>
              </a>

              {/* Description */}
              <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed max-w-xs">
                Educating tech enthusiasts through bite-sized, practical tech tips and development hacks.
              </p>
            </div>

            {/* Bottom Button */}
            <div className="w-full pt-6 relative z-10 flex justify-center">
              <a
                href="https://tiktok.com/@desh_digital_hub"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-cyan-400 text-xs font-bold transition-all group/btn"
              >
                <span>Follow</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </a>
            </div>
          </motion.div>

          {/* ======================================================== */}
          {/* 3. FACEBOOK CARD                                         */}
          {/* ======================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="group relative rounded-[28px] p-6 sm:p-7 bg-[#10141d]/90 border border-white/5 hover:border-blue-500/40 shadow-[0_15px_40px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.18)] hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col justify-between items-center text-center select-none"
          >
            {/* Watermark Facebook Icon in Bottom-Right */}
            <div className="absolute -bottom-8 -right-8 w-44 h-44 text-blue-500/[0.04] group-hover:text-blue-500/[0.07] transition-colors pointer-events-none select-none">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>

            {/* Top Area: Icon, Title & Handle */}
            <div className="w-full flex flex-col items-center relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-5 shadow-[0_0_25px_rgba(37,99,235,0.2)] group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Facebook Community
              </h3>
              <p className="text-xs font-semibold text-blue-400 mt-1">
                @desh_digital_hub
              </p>

              {/* Official Page Badge (No follower count) */}
              <div className="mt-5 mb-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[11px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  <span>Official Page & Updates</span>
                </div>
              </div>

              {/* Scannable Facebook QR Code */}
              <a
                href="https://desh.s.gy/desh-digital-hub-fb"
                target="_blank"
                rel="noopener noreferrer"
                className="my-3 p-2.5 bg-white rounded-2xl shadow-xl border-2 border-white/90 flex flex-col items-center group-hover:scale-105 transition-transform cursor-pointer"
                title="Click or Scan QR to Follow on Facebook"
              >
                <img
                  src="/images/facebook_qr.webp"
                  alt="Scan to Follow on Facebook"
                  className="w-20 h-20 sm:w-22 sm:h-22 object-contain block select-none"
                  loading="lazy"
                />
                <span className="text-[9px] font-black text-slate-900 uppercase tracking-wider mt-1 flex items-center gap-1">
                  Scan to Follow
                </span>
              </a>

              {/* Description */}
              <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed max-w-xs">
                නවතම සේවාවන්, තාක්ෂණික තොරතුරු සහ විශේෂ නිවේදන දැනගැනීමට අපගේ නිල Facebook පිටුව හා එක්වන්න.
              </p>
            </div>

            {/* Bottom Button */}
            <div className="w-full pt-6 relative z-10 flex justify-center">
              <a
                href="https://desh.s.gy/desh-digital-hub-fb"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-blue-500/40 text-blue-300 hover:text-white hover:bg-blue-600/20 hover:border-blue-400 text-xs font-bold transition-all group/btn"
              >
                <span>Follow on Facebook</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </a>
            </div>
          </motion.div>

        </div>

        {/* 2. BOTTOM ROW: Dedicated Learning & Google Review Hubs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7 max-w-5xl mx-auto">

          {/* ======================================================== */}
          {/* 4. EDUHUB PLATFORM CARD                                  */}
          {/* ======================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: 0.25 }}
            className="group relative rounded-[28px] p-6 sm:p-8 bg-[#10141d]/90 border border-white/5 hover:border-emerald-500/40 shadow-[0_15px_40px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.18)] hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col justify-between items-center text-center select-none"
          >
            {/* Watermark Graduation Cap in Bottom-Right */}
            <div className="absolute -bottom-8 -right-8 w-44 h-44 text-emerald-500/[0.04] group-hover:text-emerald-500/[0.07] transition-colors pointer-events-none select-none">
              <GraduationCap className="w-full h-full stroke-[1]" />
            </div>

            {/* Top Area: Icon, Title & Handle */}
            <div className="w-full flex flex-col items-center relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-5 shadow-[0_0_25px_rgba(16,185,129,0.2)] group-hover:scale-110 transition-transform">
                <GraduationCap className="w-7 h-7" />
              </div>

              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Educational Platform
              </h3>
              <p className="text-xs font-semibold text-emerald-400 mt-1">
                DESH EduHub (PWA)
              </p>

              {/* Stat */}
              <div className="mt-3 mb-1">
                <div className="text-3xl sm:text-4xl font-black tracking-tight flex items-center justify-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  100% Free
                </div>
                <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mt-1">
                  AD-FREE ACCESS
                </div>
              </div>

              {/* High-Resolution Uncropped Scannable EduHub QR Code */}
              <a
                href="https://desh.s.gy/edu-hub"
                target="_blank"
                rel="noopener noreferrer"
                className="my-3 p-3 bg-white rounded-2xl shadow-xl border-2 border-white/90 flex flex-col items-center group-hover:scale-105 transition-transform cursor-pointer"
                title="Click or Scan QR to Visit EduHub"
              >
                <img
                  src="/images/eduhub_qr.webp"
                  alt="Scan to Visit EduHub"
                  className="w-24 h-24 sm:w-28 sm:h-28 object-contain block select-none"
                  loading="lazy"
                />
                <span className="text-[9px] sm:text-[10px] font-black text-slate-900 uppercase tracking-wider mt-1.5 flex items-center gap-1">
                  Scan to Visit EduHub
                </span>
              </a>

              {/* Description */}
              <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed max-w-sm">
                Providing Sri Lankan students with 1-click access to past papers, revision notes, and exam materials with fast cloud downloads.
              </p>
            </div>

            {/* Bottom Button */}
            <div className="w-full pt-6 relative z-10 flex justify-center">
              <a
                href="https://desh.s.gy/edu-hub"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-emerald-500/40 text-emerald-400 hover:text-white hover:bg-emerald-500/20 hover:border-emerald-300 text-xs font-bold transition-all group/btn"
              >
                <span>Visit EduHub</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </a>
            </div>
          </motion.div>

          {/* ======================================================== */}
          {/* 5. GOOGLE REVIEW CARD (Uncropped, Scannable QR Code)     */}
          {/* ======================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: 0.3 }}
            className="group relative rounded-[28px] p-6 sm:p-8 bg-[#10141d]/90 border border-white/5 hover:border-amber-500/40 shadow-[0_15px_40px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_50px_rgba(245,158,11,0.18)] hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col justify-between items-center text-center select-none"
          >
            {/* Watermark Star in Bottom-Right */}
            <div className="absolute -bottom-8 -right-8 w-44 h-44 text-amber-500/[0.04] group-hover:text-amber-500/[0.07] transition-colors pointer-events-none select-none">
              <Star className="w-full h-full fill-current stroke-[1]" />
            </div>

            {/* Top Area: Icon, Title & Handle */}
            <div className="w-full flex flex-col items-center relative z-10">
              {/* Google App Icon */}
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(251,191,36,0.15)] group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Rate & Review Us
              </h3>
              <p className="text-xs font-semibold text-amber-400 mt-1">
                Google Business Reviews
              </p>

              {/* 5 Stars Rating Display */}
              <div className="mt-3 mb-1 flex flex-col items-center">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                  ))}
                </div>
                <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mt-1">
                  5-STAR EXPERIENCE
                </div>
              </div>

              {/* High-Resolution Uncropped Scannable QR Code */}
              <a
                href="https://desh.s.gy/google-review"
                target="_blank"
                rel="noopener noreferrer"
                className="my-3 p-3 bg-white rounded-2xl shadow-xl border-2 border-white/90 flex flex-col items-center group-hover:scale-105 transition-transform cursor-pointer"
                title="Click or Scan QR to Review on Google"
              >
                <img
                  src="/images/google_review_qr.webp"
                  alt="Scan to Review on Google"
                  className="w-24 h-24 sm:w-28 sm:h-28 object-contain block select-none"
                  loading="lazy"
                />
                <span className="text-[9px] sm:text-[10px] font-black text-slate-900 uppercase tracking-wider mt-1.5 flex items-center gap-1">
                  Scan QR to Review
                </span>
              </a>

              {/* Description */}
              <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed max-w-sm">
                අපෙන් ලබාගත් සේවාව පිළිබඳ ඔබගේ වටිනා අදහස් Google Review එකක් මඟින් සටහන් කර අප දිරිමත් කරන්න.
              </p>
            </div>

            {/* Bottom Button */}
            <div className="w-full pt-6 relative z-10 flex justify-center">
              <a
                href="https://desh.s.gy/google-review"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-amber-500/40 text-amber-300 hover:text-white hover:bg-amber-500/20 hover:border-amber-400 text-xs font-bold transition-all group/btn"
              >
                <span>Write a Review</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </a>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
