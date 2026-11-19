import React from 'react';
import { motion } from 'framer-motion';

export default function Loader({ 
  text = 'Loading...', 
  subText = 'DESH Digital Hub',
  size = 'md', 
  fullScreen = false,
  className = '' 
}) {
  // Dimensions based on size
  const config = {
    sm: {
      outerRing: 'w-16 h-16',
      innerRing: 'w-12 h-12',
      logo: 'w-7 h-7',
      textSize: 'text-[11px]',
      dotSize: 'w-1 h-1'
    },
    md: {
      outerRing: 'w-24 h-24',
      innerRing: 'w-18 h-18',
      logo: 'w-11 h-11',
      textSize: 'text-xs sm:text-sm',
      dotSize: 'w-1.5 h-1.5'
    },
    lg: {
      outerRing: 'w-32 h-32',
      innerRing: 'w-24 h-24',
      logo: 'w-14 h-14',
      textSize: 'text-sm sm:text-base',
      dotSize: 'w-2 h-2'
    }
  }[size] || {
    outerRing: 'w-24 h-24',
    innerRing: 'w-18 h-18',
    logo: 'w-11 h-11',
    textSize: 'text-xs sm:text-sm',
    dotSize: 'w-1.5 h-1.5'
  };

  const content = (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      
      {/* Outer Buffering Animation Wrapper */}
      <div className="relative flex items-center justify-center">
        
        {/* Ambient Holographic Glow Halo */}
        <div className="absolute inset-0 bg-sky-500/20 rounded-full blur-2xl animate-pulse pointer-events-none" />

        {/* 1. Primary Outer Buffering Ring (Cyan to Sky Blue Spin) */}
        <div 
          className={`${config.outerRing} rounded-full border-2 sm:border-3 border-transparent border-t-sky-400 border-r-cyan-300 animate-spin shadow-[0_0_25px_rgba(56,189,248,0.45)]`}
          style={{ animationDuration: '1.1s' }}
        />

        {/* 2. Secondary Inner Counter-Spinning Ring (Emerald / Teal) */}
        <div 
          className={`absolute ${config.innerRing} rounded-full border-2 border-transparent border-b-emerald-400 border-l-teal-300 animate-spin opacity-85 shadow-[0_0_15px_rgba(16,185,129,0.35)]`}
          style={{ 
            animationDuration: '1.6s', 
            animationDirection: 'reverse' 
          }}
        />

        {/* 3. Static Center Glass Badge Holding User Logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="rounded-2xl p-1.5 bg-[#050f1f]/85 backdrop-blur-md border border-sky-400/30 shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-center">
            <motion.img 
              src="/pwa-192x192.png" 
              alt="DESH Logo" 
              className={`${config.logo} object-contain drop-shadow-[0_0_10px_rgba(56,189,248,0.7)]`}
              animate={{ 
                scale: [1, 1.06, 1],
                filter: [
                  'drop-shadow(0 0 8px rgba(56,189,248,0.5))',
                  'drop-shadow(0 0 16px rgba(56,189,248,0.9))',
                  'drop-shadow(0 0 8px rgba(56,189,248,0.5))'
                ]
              }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            />
          </div>
        </div>

        {/* 4. Orbiting Quantum Spark Node */}
        <div 
          className={`absolute ${config.outerRing} rounded-full animate-spin pointer-events-none`}
          style={{ animationDuration: '1.1s' }}
        >
          <div className="w-2 h-2 rounded-full bg-cyan-200 shadow-[0_0_10px_#38bdf8] -top-1 left-1/2 -translate-x-1/2 absolute" />
        </div>

      </div>

      {/* Loading Typography with Bouncing Dots */}
      <div className="mt-5 flex flex-col items-center text-center">
        <div className={`flex items-center gap-1.5 font-black tracking-widest uppercase text-white ${config.textSize}`}>
          <span>{text}</span>
          <span className="inline-flex gap-1 ml-1 items-center">
            <span 
              className={`${config.dotSize} rounded-full bg-sky-400 animate-bounce`} 
              style={{ animationDelay: '0ms' }} 
            />
            <span 
              className={`${config.dotSize} rounded-full bg-cyan-400 animate-bounce`} 
              style={{ animationDelay: '150ms' }} 
            />
            <span 
              className={`${config.dotSize} rounded-full bg-emerald-400 animate-bounce`} 
              style={{ animationDelay: '300ms' }} 
            />
          </span>
        </div>

        {subText && (
          <span className="text-[10px] text-sky-400/80 font-mono tracking-wider mt-1 uppercase">
            {subText}
          </span>
        )}
      </div>

    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#040b15]/95 backdrop-blur-xl flex items-center justify-center p-4 min-h-screen">
        {content}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[360px] w-full p-4">
      {content}
    </div>
  );
}
