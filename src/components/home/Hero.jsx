import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import BannerCarousel from './BannerCarousel';

export default function Hero() {
  const [isOpenNow, setIsOpenNow] = useState(true);

  // Typewriter sequence states
  const [deshText, setDeshText] = useState('');
  const [digitalHubText, setDigitalHubText] = useState('');
  const [sloganText, setSloganText] = useState('');
  const [taglineText, setTaglineText] = useState('');
  const [activeCursor, setActiveCursor] = useState('desh'); // 'desh' | 'digital' | 'slogan' | 'tagline' | 'done'

  useEffect(() => {
    let isMounted = true;
    const fullDesh = 'DESH';
    const fullDigitalHub = 'Digital Hub';
    const fullSlogan = 'Your One Step Digital Solution';
    const fullTagline = 'ඔබේ සියලුම ඩිජිටල් හා පරිගණක අවශ්‍යතා එකම වහලක් යටින්';

    // Segmenter for Sinhala to prevent broken combining characters
    const getGraphemes = (str) => {
      if (typeof Intl !== 'undefined' && Intl.Segmenter) {
        try {
          const segmenter = new Intl.Segmenter('si', { granularity: 'grapheme' });
          return Array.from(segmenter.segment(str), s => s.segment);
        } catch {
          return Array.from(str);
        }
      }
      return Array.from(str);
    };

    const taglineGraphemes = getGraphemes(fullTagline);

    const typeWriterSequence = async () => {
      // 1. Type DESH
      for (let i = 1; i <= fullDesh.length; i++) {
        if (!isMounted) return;
        setDeshText(fullDesh.slice(0, i));
        await new Promise(r => setTimeout(r, 60));
      }

      if (!isMounted) return;
      setActiveCursor('digital');
      await new Promise(r => setTimeout(r, 100));

      // 2. Type Digital Hub
      for (let i = 1; i <= fullDigitalHub.length; i++) {
        if (!isMounted) return;
        setDigitalHubText(fullDigitalHub.slice(0, i));
        await new Promise(r => setTimeout(r, 65));
      }

      if (!isMounted) return;
      setActiveCursor('slogan');
      await new Promise(r => setTimeout(r, 120));

      // 3. Type Slogan
      for (let i = 1; i <= fullSlogan.length; i++) {
        if (!isMounted) return;
        setSloganText(fullSlogan.slice(0, i));
        await new Promise(r => setTimeout(r, 30));
      }

      if (!isMounted) return;
      setActiveCursor('tagline');
      await new Promise(r => setTimeout(r, 100));

      // 4. Type Sinhala Tagline
      for (let i = 1; i <= taglineGraphemes.length; i++) {
        if (!isMounted) return;
        setTaglineText(taglineGraphemes.slice(0, i).join(''));
        await new Promise(r => setTimeout(r, 35));
      }

      if (!isMounted) return;
      setActiveCursor('done');
    };

    // Small delay before starting typewriter animation
    const timer = setTimeout(() => {
      typeWriterSequence();
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    try {
      const now = new Date();
      const slTimeString = now.toLocaleString("en-US", { timeZone: "Asia/Colombo" });
      const slDate = new Date(slTimeString);
      const day = slDate.getDay();
      const currentMinuteOfDay = slDate.getHours() * 60 + slDate.getMinutes();

      // Schedule:
      // Mon (1), Tue (2), Wed (3): 7:00 AM (420) - 5:00 PM (1020)
      // Thu (4): 7:00 AM (420) - 8:00 PM (1200)
      // Fri (5): 7:00 AM (420) - 5:00 PM (1020)
      // Sat (6): 7:00 AM (420) - 4:00 PM (960)
      // Sun (0): 7:00 AM (420) - 9:00 PM (1260)
      let openMin = 420; // 7:00 AM
      let closeMin = 1020; // 5:00 PM

      if (day >= 1 && day <= 3) {
        closeMin = 1020;
      } else if (day === 4) {
        closeMin = 1200;
      } else if (day === 5) {
        closeMin = 1020;
      } else if (day === 6) {
        closeMin = 960;
      } else if (day === 0) {
        closeMin = 1260;
      }

      setIsOpenNow(currentMinuteOfDay >= openMin && currentMinuteOfDay < closeMin);
    } catch (e) {
      setIsOpenNow(true);
    }
  }, []);

  return (
    <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col lg:flex-row items-center justify-between w-full mt-0 mb-12 sm:mb-16 md:mb-20 gap-8 lg:gap-12">
      
      {/* Left Column (Hero Content) */}
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left w-full lg:w-[54%]">
        
        {/* Live Status Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0a1832] border border-sky-500/25 mb-4 sm:mb-6 shadow-md backdrop-blur-md"
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
          className="mb-3 relative w-full flex flex-col items-center lg:items-start"
        >
          <h1 
            aria-label="DESH Digital Hub"
            className="font-black tracking-tight text-white drop-shadow-2xl flex flex-col items-center lg:items-start leading-tight"
          >
            <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight inline-flex items-center min-h-[1.1em]">
              <span>{deshText}</span>
              {activeCursor === 'desh' && (
                <span className="inline-block w-2 sm:w-3 h-[0.75em] bg-white ml-2 animate-pulse shadow-[0_0_12px_rgba(255,255,255,0.8)] rounded-xs" />
              )}
            </span>
            <div className="flex items-center min-h-[1.25em]">
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400 animate-gradient-x text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight mt-0.5 pb-2.5 sm:pb-4 pt-0.5 leading-normal overflow-visible">
                {digitalHubText}
              </span>
              {(activeCursor === 'digital' || activeCursor === 'done') && (
                <span className="inline-block w-2 sm:w-2.5 h-[0.7em] bg-cyan-400 ml-2 animate-pulse shadow-[0_0_12px_#22d3ee] rounded-xs shrink-0 self-center" />
              )}
            </div>
          </h1>

          {/* Animated Futuristic Circuit Board Under DESH Digital Hub */}
          <div className="relative w-full max-w-[290px] sm:max-w-[420px] h-6 mt-1 mb-3.5 flex items-center justify-center lg:justify-start overflow-visible pointer-events-none select-none">
            <svg viewBox="0 0 420 26" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="heroCircuitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                  <stop offset="30%" stopColor="#38bdf8" stopOpacity="0.95" />
                  <stop offset="60%" stopColor="#06b6d4" stopOpacity="1" />
                  <stop offset="85%" stopColor="#10b981" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
                </linearGradient>

                <filter id="circuitNeonGlow" x="-20%" y="-40%" width="140%" height="180%">
                  <feGaussianBlur stdDeviation="2.5" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Static Background Circuit Traces */}
              <path
                d="M 5 13 L 110 13 L 125 5 L 210 5 L 222 13 L 310 13 L 322 21 L 390 21 L 400 13 L 415 13"
                fill="none"
                stroke="rgba(56, 189, 248, 0.2)"
                strokeWidth="1.5"
              />
              <path
                d="M 35 21 L 80 21 L 92 13 L 160 13 L 172 21 L 260 21 L 272 13 L 350 13"
                fill="none"
                stroke="rgba(6, 182, 212, 0.15)"
                strokeWidth="1.2"
              />

              {/* Animated Glowing Electric Circuit Stream 1 */}
              <motion.path
                d="M 5 13 L 110 13 L 125 5 L 210 5 L 222 13 L 310 13 L 322 21 L 390 21 L 400 13 L 415 13"
                fill="none"
                stroke="url(#heroCircuitGrad)"
                strokeWidth="2"
                filter="url(#circuitNeonGlow)"
                strokeDasharray="60 160"
                animate={{ strokeDashoffset: [-220, 0] }}
                transition={{ repeat: Infinity, duration: 3.2, ease: "linear" }}
              />

              {/* Animated Glowing Electric Circuit Stream 2 (Opposite direction pulse) */}
              <motion.path
                d="M 35 21 L 80 21 L 92 13 L 160 13 L 172 21 L 260 21 L 272 13 L 350 13"
                fill="none"
                stroke="url(#heroCircuitGrad)"
                strokeWidth="1.5"
                filter="url(#circuitNeonGlow)"
                strokeDasharray="40 120"
                animate={{ strokeDashoffset: [160, -40] }}
                transition={{ repeat: Infinity, duration: 3.8, ease: "linear" }}
              />

              {/* Micro Circuit Terminals & Solder Pads */}
              <circle cx="5" cy="13" r="2.5" fill="#38bdf8" />
              <circle cx="125" cy="5" r="2" fill="#38bdf8" />
              <circle cx="210" cy="5" r="2" fill="#06b6d4" />
              <circle cx="222" cy="13" r="2" fill="#06b6d4" />
              <circle cx="310" cy="13" r="2" fill="#10b981" />
              <circle cx="322" cy="21" r="2" fill="#10b981" />
              <circle cx="390" cy="21" r="2" fill="#10b981" />
              <circle cx="415" cy="13" r="2.5" fill="#10b981" />

              {/* Pulsing Energy Quantum Nodes */}
              <motion.circle
                cx="125"
                cy="5"
                r="3.5"
                fill="#38bdf8"
                animate={{ scale: [1, 2.2, 1], opacity: [0.3, 0.95, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              />
              <motion.circle
                cx="222"
                cy="13"
                r="3.5"
                fill="#06b6d4"
                animate={{ scale: [1, 2.2, 1], opacity: [0.3, 0.95, 0.3] }}
                transition={{ repeat: Infinity, duration: 2.1, delay: 0.4, ease: "easeInOut" }}
              />
              <motion.circle
                cx="322"
                cy="21"
                r="3.5"
                fill="#10b981"
                animate={{ scale: [1, 2.2, 1], opacity: [0.3, 0.95, 0.3] }}
                transition={{ repeat: Infinity, duration: 2.3, delay: 0.8, ease: "easeInOut" }}
              />
            </svg>
          </div>

          {/* Slogan */}
          <span className="text-xs sm:text-sm font-bold tracking-wider text-sky-300 uppercase block min-h-[1.3em] flex items-center justify-center lg:justify-start">
            <span>{sloganText}</span>
            {activeCursor === 'slogan' && (
              <span className="inline-block w-1.5 h-3 bg-sky-300 ml-1.5 animate-pulse align-middle" />
            )}
          </span>
        </motion.div>
        
        {/* Bilingual Tagline - Fully Responsive Wrap */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xs sm:text-sm md:text-base text-slate-200 font-medium tracking-wide mb-5 sm:mb-6 drop-shadow-lg max-w-xl text-center lg:text-left min-h-[2.4em] sm:min-h-[1.5em] leading-relaxed px-2 sm:px-0"
        >
          {taglineText.startsWith('ඔබේ සියලුම ඩිජිටල් හා පරිගණක අවශ්‍යතා') ? (
            <span>
              ඔබේ සියලුම ඩිජිටල් හා පරිගණක අවශ්‍යතා{' '}
              <span className="text-sky-400 font-bold">
                {taglineText.slice('ඔබේ සියලුම ඩිජිටල් හා පරිගණක අවශ්‍යතා '.length)}
              </span>
            </span>
          ) : (
            <span>{taglineText}</span>
          )}
          {activeCursor === 'tagline' && (
            <span className="inline-block w-1.5 h-3.5 bg-sky-400 ml-1.5 animate-pulse align-middle" />
          )}
        </motion.p>

        {/* Feature Badges - Balanced 2x2 Grid on Mobile, Row on Tablet/Desktop */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-2.5 mb-6 sm:mb-8 w-full sm:w-auto px-1 sm:px-0"
        >
          {[
            { icon: '⚡', text: 'වේගවත් සේවාව' },
            { icon: '💎', text: 'උසස් ප්‍රමිතිය' },
            { icon: '🛡️', text: 'විශ්වාසදායී' },
            { icon: '✨', text: 'සාධාරණ මිල' },
          ].map((badge, idx) => (
            <div 
              key={idx} 
              className="px-2.5 py-1.5 sm:px-3.5 bg-slate-900/70 backdrop-blur-xl border border-sky-500/20 rounded-xl text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span className="text-sm shrink-0">{badge.icon}</span> 
              <span className="font-bold tracking-tight whitespace-nowrap">{badge.text}</span>
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
            className="group px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <span>Explore Services (සේවාවන්)</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>

          {/* Button 2: Message via WhatsApp / Quick Inquiry */}
          <a 
            href="#inquiry"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('inquiry');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => {
                  const input = el.querySelector('input[type="text"]');
                  if (input) input.focus({ preventScroll: true });
                }, 650);
              }
            }}
            className="px-7 py-3.5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-sm transition-all shadow-md hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Send Message (පණිවිඩයක් එවන්න)</span>
          </a>
        </motion.div>

      </div>

      {/* Right Column: 1:1 Social Media Post Flyers Carousel (Header removed as requested) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full lg:w-[46%] flex flex-col items-center"
      >
        <div className="w-full relative">
          <BannerCarousel />
        </div>
      </motion.div>

    </div>
  );
}
