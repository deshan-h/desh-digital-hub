import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { GraduationCap, ArrowRight, Sparkles } from 'lucide-react';

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
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital Community & Education • අපේ ඩිජිටල් අවකාශය</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Connect & Learn With Us
          </h2>

          <p className="text-sm sm:text-base text-slate-300 mt-3 font-medium">
            නවතම තාක්ෂණික දැනුම, මඟපෙන්වීම් සහ නොමිලේ අධ්‍යාපනික ප්‍රශ්න පත්‍ර ලබාගැනීමට අප සමඟ එක්වන්න.
          </p>
        </div>

        {/* 3-Column Unified Cards Grid Matching Reference Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
          
          {/* ======================================================== */}
          {/* 1. YOUTUBE CARD                                          */}
          {/* ======================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45 }}
            className="group relative rounded-[28px] p-7 sm:p-8 bg-[#10141d]/90 border border-white/5 hover:border-red-500/40 shadow-[0_15px_40px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_50px_rgba(239,68,68,0.18)] hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col justify-between items-center text-center select-none"
          >
            {/* Watermark YouTube Icon in Bottom-Right */}
            <div className="absolute -bottom-8 -right-8 w-44 h-44 text-red-500/[0.04] group-hover:text-red-500/[0.07] transition-colors pointer-events-none select-none">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>

            {/* Top Area: Icon, Title & Handle */}
            <div className="w-full flex flex-col items-center relative z-10">
              {/* App Icon */}
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

              {/* Big Animated Counter Stat */}
              <div className="mt-6 mb-2">
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center justify-center">
                  <AnimatedCounter end={340000} />
                  <span className="text-red-500 font-bold ml-1">+</span>
                </div>
                <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mt-1">
                  TOTAL VIEWS
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed mt-4 max-w-xs">
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
            className="group relative rounded-[28px] p-7 sm:p-8 bg-[#10141d]/90 border border-white/5 hover:border-cyan-500/40 shadow-[0_15px_40px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_50px_rgba(6,182,212,0.18)] hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col justify-between items-center text-center select-none"
          >
            {/* Watermark TikTok Icon in Bottom-Left */}
            <div className="absolute -bottom-8 -left-8 w-44 h-44 text-cyan-500/[0.04] group-hover:text-cyan-500/[0.07] transition-colors pointer-events-none select-none">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
            </div>

            {/* Top Area: Icon, Title & Handle */}
            <div className="w-full flex flex-col items-center relative z-10">
              {/* App Icon */}
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

              {/* Big Animated Counter Stat */}
              <div className="mt-6 mb-2">
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center justify-center">
                  <AnimatedCounter end={14100} />
                  <span className="text-pink-500 font-bold ml-1">+</span>
                </div>
                <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mt-1">
                  FOLLOWERS
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed mt-4 max-w-xs">
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
          {/* 3. EDUHUB PLATFORM CARD                                  */}
          {/* ======================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="group relative rounded-[28px] p-7 sm:p-8 bg-[#10141d]/90 border border-white/5 hover:border-emerald-500/40 shadow-[0_15px_40px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.18)] hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col justify-between items-center text-center select-none"
          >
            {/* Watermark Graduation Cap in Bottom-Right */}
            <div className="absolute -bottom-8 -right-8 w-44 h-44 text-emerald-500/[0.04] group-hover:text-emerald-500/[0.07] transition-colors pointer-events-none select-none">
              <GraduationCap className="w-full h-full stroke-[1]" />
            </div>

            {/* Top Area: Icon, Title & Handle */}
            <div className="w-full flex flex-col items-center relative z-10">
              {/* App Icon */}
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-5 shadow-[0_0_25px_rgba(16,185,129,0.2)] group-hover:scale-110 transition-transform">
                <GraduationCap className="w-7 h-7" />
              </div>

              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Educational Platform
              </h3>
              <p className="text-xs font-semibold text-emerald-400 mt-1">
                DESH EduHub (PWA)
              </p>

              {/* Big Stat */}
              <div className="mt-6 mb-2">
                <div className="text-3xl sm:text-4xl font-black tracking-tight flex items-center justify-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  100% Free
                </div>
                <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mt-1">
                  AD-FREE ACCESS
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed mt-4 max-w-xs">
                Providing Sri Lankan students with 1-click access to past papers and revision materials with fast cloud downloads.
              </p>
            </div>

            {/* Bottom Button */}
            <div className="w-full pt-6 relative z-10 flex justify-center">
              <a
                href="https://deshedublog.blogspot.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-emerald-500/40 text-emerald-400 hover:text-white hover:bg-emerald-500/20 hover:border-emerald-300 text-xs font-bold transition-all group/btn"
              >
                <span>Visit EduHub</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </a>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
