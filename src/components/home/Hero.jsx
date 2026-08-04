import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Megaphone, ChevronRight } from 'lucide-react';
import logo from '../../assets/logo.webp';

export default function Hero() {
  const [news, setNews] = useState([]);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const docRef = doc(db, 'settings', 'news');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().items?.length > 0) {
          setNews(docSnap.data().items);
        } else {
          setNews(['ඩිජිටල් ලෝකයේ නවතම වෙනස්කම් සමඟින් අපි ඔබ වෙතට...']);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
        setNews(['ඩිජිටල් ලෝකයේ නවතම වෙනස්කම් සමඟින් අපි ඔබ වෙතට...']);
      }
    };
    fetchNews();
  }, []);

  useEffect(() => {
    if (news.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % news.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [news]);

  return (
    <div className="container mx-auto px-4 relative z-10 flex flex-col lg:flex-row items-center justify-between w-full mt-0 mb-16 md:mb-24 gap-12 lg:gap-8">
      
      {/* Left Column (Hero Content) */}
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left w-full lg:w-[60%]">
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-10 relative"
        >
          <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 blur-[60px] opacity-20 -z-10 rounded-full transform scale-110"></div>
          <h1 className="font-black tracking-tighter text-white drop-shadow-2xl flex flex-col items-center lg:items-start leading-[1.0]">
            <motion.span 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1, type: "spring", stiffness: 100 }}
              className="inline-block text-6xl sm:text-7xl md:text-8xl lg:text-9xl"
            >
              DESH
            </motion.span>
            <motion.span 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 100 }}
              className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 animate-gradient-x inline-block mt-2 relative text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight pb-4"
            >
              Digital Hub
            </motion.span>
          </h1>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-lg sm:text-2xl md:text-3xl text-slate-300 font-medium tracking-wide mb-10 drop-shadow-lg max-w-2xl"
        >
          ඔබේ සියලුම ඩිජිටල් අවශ්‍යතා <span className="text-cyan-400 font-bold">එකම තැනකින්</span>
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-wrap justify-center lg:justify-start gap-3 md:gap-4 mb-12 max-w-2xl"
        >
          {[
            { icon: '⚡', text: 'වේගවත්', color: 'text-yellow-400', border: 'hover:border-yellow-500/50', shadow: 'hover:shadow-yellow-500/20' },
            { icon: '💎', text: 'උසස් තත්ත්වය', color: 'text-emerald-400', border: 'hover:border-emerald-500/50', shadow: 'hover:shadow-emerald-500/20' },
            { icon: '🛡️', text: 'විශ්වාසදායී', color: 'text-blue-400', border: 'hover:border-blue-500/50', shadow: 'hover:shadow-blue-500/20' },
            { icon: '✨', text: 'නවීන සේවා', color: 'text-purple-400', border: 'hover:border-purple-500/50', shadow: 'hover:shadow-purple-500/20' },
          ].map((badge, idx) => (
            <div 
              key={idx} 
              className={`px-4 py-2.5 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl text-slate-200 text-sm md:text-base font-semibold flex items-center gap-2 shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-default ${badge.border} ${badge.shadow}`}
            >
              <span className={`${badge.color} text-lg drop-shadow-md`}>{badge.icon}</span> 
              <span className="tracking-wide">{badge.text}</span>
            </div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start w-full sm:w-auto"
        >
          <a href="#services" className="group relative w-full sm:w-auto px-8 md:px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:shadow-[0_0_40px_rgba(8,145,178,0.6)] hover:-translate-y-1 overflow-hidden text-center">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out rounded-2xl"></div>
            <span className="relative z-10 flex items-center justify-center gap-2">
              සේවාවන් බලන්න
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </a>
          <a href="#contact" className="w-full sm:w-auto px-8 md:px-10 py-4 rounded-2xl bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 text-slate-200 font-bold text-lg hover:bg-slate-800 hover:text-white transition-all shadow-lg hover:shadow-2xl hover:border-slate-600 hover:-translate-y-1 text-center">
            අපව අමතන්න
          </a>
        </motion.div>
      </div>

      {/* Right Column (News Carousel) */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="w-full lg:w-[35%] relative group"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-blue-500 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-gradient-x pointer-events-none"></div>
        <div className="relative bg-slate-900/80 backdrop-blur-2xl border border-white/10 p-6 md:p-8 rounded-[2rem] shadow-2xl h-[320px] md:h-[400px] flex flex-col">
          
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-700/50">
            <div className="p-3 bg-cyan-500/20 rounded-xl">
              <Megaphone className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-white tracking-wide">Latest News</h3>
              <p className="text-cyan-400 text-xs font-semibold uppercase tracking-widest mt-1">Announcements</p>
            </div>
          </div>
          
          <div className="flex-1 relative overflow-hidden flex items-center justify-center text-center">
            <AnimatePresence mode="wait">
              {news.length > 0 && (
                <motion.div
                  key={currentNewsIndex}
                  initial={{ opacity: 0, y: 20, filter: 'blur(5px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(5px)' }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute w-full px-2"
                >
                  <p className="text-lg md:text-xl lg:text-2xl text-slate-200 font-medium leading-relaxed drop-shadow-md">
                    {news[currentNewsIndex]}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 flex justify-center gap-2">
            {news.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentNewsIndex ? 'w-8 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'w-2 bg-slate-700'}`}
              ></div>
            ))}
          </div>
        </div>
      </motion.div>

    </div>
  );
}
