import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.7, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={scrollToTop}
          aria-label="Scroll to top"
          title="Back to top (ඉහළට යන්න)"
          className="fixed bottom-21 right-5 sm:bottom-23 sm:right-6 z-50 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#07152b]/90 backdrop-blur-md border border-sky-400/40 text-sky-400 hover:text-white hover:bg-sky-500 hover:border-sky-300 shadow-[0_10px_30px_rgba(0,0,0,0.7),0_0_20px_rgba(56,189,248,0.35)] transition-all duration-300 flex items-center justify-center group cursor-pointer select-none active:scale-95"
        >
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform stroke-[2.5]" />
          
          {/* Subtle Ambient Pulse Ring */}
          <span className="absolute inset-0 rounded-2xl border border-sky-400/30 animate-ping opacity-25 pointer-events-none" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
