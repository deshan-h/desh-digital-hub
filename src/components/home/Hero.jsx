import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ExternalLink, Zap, ShieldCheck, Printer, Wrench, MessageCircle } from 'lucide-react';
import eduHubLogo from '../../assets/edu-hub-logo.jpg';

export default function Hero() {
  const valueBadges = [
    { icon: Zap, label: 'ක්ෂණික මුද්‍රණ', sub: 'Ultra-Fast Printing', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { icon: Printer, label: 'උසස් තත්ත්වය', sub: 'High DPI Quality', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
    { icon: ShieldCheck, label: 'විශ්වාසදායී සේවය', sub: '100% Guaranteed', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { icon: Wrench, label: 'පරිගණක Lab', sub: 'Expert Diagnostics', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' }
  ];

  return (
    <div className="container mx-auto px-4 md:px-6 relative z-10 w-full pt-2 pb-10 text-center flex flex-col items-center">
      
      {/* Top Tagline Pill */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/25 backdrop-blur-md mb-6 shadow-sm"
      >
        <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
        <span className="text-xs font-bold text-sky-200 tracking-wide">
          Next-Gen Digital Printing, Online Services & IT Solutions
        </span>
      </motion.div>

      {/* Main Hero Headline */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="max-w-4xl mx-auto mb-5 relative"
      >
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-none drop-shadow-2xl">
          <span>DESH</span>{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-400 inline-block">
            Digital Hub
          </span>
        </h1>
        
        <p className="text-base sm:text-xl md:text-2xl text-slate-300 font-medium tracking-wide mt-4 max-w-2xl mx-auto leading-relaxed">
          ඔබේ සියලුම ඩිජිටල්, මුද්‍රණ සහ පරිගණක සේවා{' '}
          <span className="text-sky-400 font-bold underline decoration-sky-500/40 underline-offset-4">
            එකම වහලක් යටින්
          </span>
        </p>
      </motion.div>

      {/* 4 Value Proposition Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 max-w-3xl w-full my-6"
      >
        {valueBadges.map((badge, idx) => {
          const Icon = badge.icon;
          return (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-[#09172c]/70 backdrop-blur-xl border border-sky-500/10 hover:border-sky-500/30 transition-all duration-300 flex items-center gap-3 shadow-lg group hover:-translate-y-0.5"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${badge.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-left min-w-0">
                <span className="text-xs font-bold text-slate-100 block truncate group-hover:text-sky-300 transition-colors">
                  {badge.label}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  {badge.sub}
                </span>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Call to Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md mt-2"
      >
        <a
          href="#services"
          className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-[0_0_25px_rgba(37,99,235,0.35)] hover:shadow-[0_0_35px_rgba(37,99,235,0.6)] hover:-translate-y-0.5 flex items-center justify-center gap-2 group cursor-pointer"
        >
          <span>සේවාවන් බලන්න (Explore Services)</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>

        <a
          href="https://wa.me/94719989000?text=Hello%20DESH%20Digital%20Hub,%20I%20would%20like%20to%20place%20an%20order."
          target="_blank"
          rel="noreferrer"
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#091a32]/80 hover:bg-[#0c2242] text-slate-200 hover:text-white border border-sky-500/20 hover:border-sky-400/40 font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 text-emerald-400" />
          <span>WhatsApp ඇණවුම්</span>
        </a>
      </motion.div>

      {/* DESH Edu Hub Gateway Card */}
      <motion.a
        href="https://desh.s.gy/edu-hub"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="group relative mt-8 w-full max-w-xl p-3.5 rounded-2xl bg-[#081528]/80 hover:bg-[#0b1c36] backdrop-blur-xl border border-sky-500/20 hover:border-sky-400/50 shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-between gap-4 overflow-hidden"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl overflow-hidden p-0.5 bg-gradient-to-br from-sky-400/40 via-blue-500/20 to-indigo-500/40 border border-sky-400/30 shrink-0 group-hover:scale-105 transition-transform shadow-md">
            <img 
              src={eduHubLogo} 
              alt="DESH Edu Hub Logo" 
              className="w-full h-full object-cover rounded-lg" 
            />
          </div>

          <div className="text-left min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors truncate">
                DESH Edu Hub Educational Portal
              </h4>
              <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-full shrink-0">
                Study Free
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              Exam papers, past papers, notes & study guides නොමිලේ ලබාගන්න
            </p>
          </div>
        </div>

        <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 group-hover:bg-sky-500 group-hover:text-slate-950 transition-all flex items-center justify-center shrink-0">
          <ExternalLink className="w-4 h-4" />
        </div>
      </motion.a>

    </div>
  );
}
