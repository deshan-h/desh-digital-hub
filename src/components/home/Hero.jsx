import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, MessageCircle, Sparkles, Clock, MapPin, Phone } from 'lucide-react';
import BannerCarousel from './BannerCarousel';

export default function Hero() {
  const [isOpenNow, setIsOpenNow] = useState(true);

  useEffect(() => {
    try {
      const now = new Date();
      const slTimeString = now.toLocaleString("en-US", { timeZone: "Asia/Colombo" });
      const slDate = new Date(slTimeString);
      const day = slDate.getDay();
      const currentMinuteOfDay = slDate.getHours() * 60 + slDate.getMinutes();

      // Mon-Sat: 8:00 AM (480) - 8:30 PM (1230) | Sun: 8:00 AM - 2:00 PM (840)
      if (day === 0) {
        setIsOpenNow(currentMinuteOfDay >= 480 && currentMinuteOfDay <= 840);
      } else {
        setIsOpenNow(currentMinuteOfDay >= 480 && currentMinuteOfDay <= 1230);
      }
    } catch (e) {
      setIsOpenNow(true);
    }
  }, []);

  return (
    <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col lg:flex-row items-center justify-between w-full mt-2 mb-16 md:mb-20 gap-10 lg:gap-12">
      
      {/* Left Column (Hero Content) */}
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left w-full lg:w-[54%]">
        
        {/* Live Status Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0a1832] border border-sky-500/25 mb-6 shadow-md backdrop-blur-md"
        >
          <span className={`w-2.5 h-2.5 rounded-full ${isOpenNow ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-xs font-bold text-slate-200">
            {isOpenNow ? 'Store Open Now (දැන් විවෘතයි)' : 'Store Closed (දැනට වසා ඇත)'}
          </span>
          <span className="text-[10px] text-slate-400 border-l border-slate-700 pl-2">
            Melsiripura
          </span>
        </motion.div>

        {/* Main Headings */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="mb-5 relative"
        >
          <div className="absolute -inset-6 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 blur-[80px] opacity-25 -z-10 rounded-full" />
          <h1 className="font-black tracking-tight text-white drop-shadow-2xl flex flex-col items-center lg:items-start leading-[1.05]">
            <span className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tighter">
              DESH
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400 animate-gradient-x text-2xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight mt-1">
              Digital Hub
            </span>
          </h1>
        </motion.div>
        
        {/* Bilingual Tagline */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-slate-300 font-medium tracking-wide mb-6 drop-shadow-lg max-w-xl leading-relaxed"
        >
          ඔබේ සියලුම ඩිජිටල් හා පරිගණක අවශ්‍යතා <span className="text-sky-400 font-bold">එකම වහලක් යටින්</span>
        </motion.p>

        {/* Feature Badges */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-2.5 mb-8 max-w-xl"
        >
          {[
            { icon: '⚡', text: 'වේගවත් සේවාව', sub: 'Instant Turnaround' },
            { icon: '💎', text: 'උසස් ප්‍රමිතිය', sub: 'Premium Quality' },
            { icon: '🛡️', text: 'විශ්වාසදායී', sub: 'Trusted Guarantee' },
            { icon: '✨', text: 'සාධාරණ මිල', sub: 'Best Value' },
          ].map((badge, idx) => (
            <div 
              key={idx} 
              className="px-3.5 py-1.5 bg-slate-900/60 backdrop-blur-xl border border-sky-500/15 rounded-xl text-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-lg shadow-black/20"
            >
              <span className="text-sm">{badge.icon}</span> 
              <span className="font-bold tracking-tight">{badge.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start w-full sm:w-auto"
        >
          {/* Button 1: Explore Services */}
          <a 
            href="#services" 
            className="group px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Explore Services (සේවාවන්)</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>

          {/* Button 2: Message via WhatsApp */}
          <a 
            href="#inquiry" 
            className="px-7 py-3.5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-sm transition-all shadow-md hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Send Message (පණිවිඩයක් එවන්න)</span>
          </a>
        </motion.div>

      </div>

      {/* Right Column: 1:1 Social Media Post Flyers Carousel */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full lg:w-[46%] flex flex-col items-center"
      >
        <div className="w-full relative">
          {/* Carousel Badge Header */}
          <div className="flex items-center justify-between px-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Service Flyers & Offers</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">1:1 Square Posts</span>
          </div>

          <BannerCarousel />
        </div>
      </motion.div>

    </div>
  );
}
