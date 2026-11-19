import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Send } from 'lucide-react';

export default function FloatingInquiryButton() {
  const [showBubble, setShowBubble] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Auto-trigger the support agent speech bubble shortly after page load
  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem('desh_support_bubble_dismissed');
      if (dismissed === 'true') {
        setIsDismissed(true);
        return;
      }
    } catch (e) {
      console.warn(e);
    }

    const timer = setTimeout(() => {
      setShowBubble(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const handleScrollToInquiry = (e) => {
    e?.stopPropagation?.();
    setShowBubble(false);
    const formElement = document.getElementById('inquiry');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Focus name input after scrolling
      setTimeout(() => {
        const nameInput = formElement.querySelector('input[type="text"]');
        if (nameInput) nameInput.focus({ preventScroll: true });
      }, 700);
    } else {
      window.location.href = '/#inquiry';
    }
  };

  // Listen for global open inquiry event (e.g. from Hero buttons)
  useEffect(() => {
    const handleOpen = () => {
      handleScrollToInquiry();
    };

    window.addEventListener('open-inquiry-modal', handleOpen);
    return () => window.removeEventListener('open-inquiry-modal', handleOpen);
  }, []);

  const handleDismissBubble = (e) => {
    e?.stopPropagation?.();
    setShowBubble(false);
    setIsDismissed(true);
    try {
      sessionStorage.setItem('desh_support_bubble_dismissed', 'true');
    } catch (err) {
      console.warn(err);
    }
  };

  const handleDirectWhatsApp = (e) => {
    e?.stopPropagation?.();
    setShowBubble(false);
    const text = encodeURIComponent('Hello DESH Digital Hub, I need some information about your services.');
    window.open(`https://wa.me/94719989000?text=${text}`, '_blank');
  };

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end pointer-events-none">
      
      {/* Support Agent Proactive Speech Bubble */}
      <AnimatePresence>
        {showBubble && !isDismissed && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="pointer-events-auto relative mb-3.5 w-72 sm:w-80 bg-[#08162d]/95 backdrop-blur-xl rounded-2xl p-3.5 sm:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_25px_rgba(56,189,248,0.25)] border border-sky-400/40 ring-1 ring-sky-500/20"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-sky-500/20">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full overflow-hidden border border-sky-400/80 shrink-0 bg-slate-900/80 p-0.5 flex items-center justify-center">
                  <img
                    src="/pwa-192x192.png"
                    alt="DESH Support"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-black text-white flex items-center gap-1.5 leading-none">
                    <span>Desh Hub Support</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </span>
                  <span className="text-[9px] font-semibold text-emerald-400 block mt-0.5">
                    Online • Help Desk
                  </span>
                </div>
              </div>

              {/* Dismiss Button */}
              <button
                type="button"
                onClick={handleDismissBubble}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition cursor-pointer"
                title="Close notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Message Content */}
            <div className="space-y-1.5 text-xs text-slate-200">
              <p className="font-bold text-sky-400 flex items-center gap-1.5">
                <span>👋 ඔබට අවශ්‍ය සේවාවක් හෝ විමසීමක් තිබේද?</span>
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                ඔබට අවශ්‍ය සේවාව ගැන විමසීමට <b>Send Message</b> කරන්න හෝ <b>WhatsApp</b> හරහා අපට එවන්න!
              </p>
            </div>

            {/* Quick Action Pills */}
            <div className="mt-3 pt-2.5 border-t border-sky-500/20 flex items-center gap-2">
              <button
                type="button"
                onClick={handleScrollToInquiry}
                className="flex-1 py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white text-[11px] font-bold shadow-md transition-all active:scale-95 cursor-pointer text-center flex items-center justify-center gap-1.5 truncate"
              >
                <Send className="w-3.5 h-3.5 shrink-0" />
                <span>Send Message</span>
              </button>
              <button
                type="button"
                onClick={handleDirectWhatsApp}
                className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white text-[11px] font-bold transition-all active:scale-95 cursor-pointer text-center border border-slate-700/80 flex items-center justify-center gap-1.5 truncate"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>WhatsApp</span>
              </button>
            </div>

            {/* Chat Bubble Tail pointing directly to the round button */}
            <div className="absolute -bottom-1.5 right-6 w-3.5 h-3.5 bg-[#08162d] border-r border-b border-sky-400/40 rotate-45 transform" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Round Support Agent Button (රවුම) */}
      <div className="pointer-events-auto relative group">
        <button
          type="button"
          onClick={handleScrollToInquiry}
          className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#08162d]/95 p-1 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(56,189,248,0.4)] border-2 border-sky-400 hover:border-sky-300 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer group-hover:ring-4 group-hover:ring-sky-500/20"
          title="Go to Message Form (පණිවිඩයක් එවන්න)"
          aria-label="DESH Support Agent"
        >
          {/* Logo inside Circle */}
          <div className="w-full h-full rounded-full overflow-hidden bg-slate-900/60 backdrop-blur-md border border-white/10 flex items-center justify-center p-1.5 sm:p-2 shadow-inner">
            <img
              src="/pwa-192x192.png"
              alt="DESH Support"
              className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(56,189,248,0.5)] transition-transform duration-300 group-hover:scale-110 pointer-events-none"
            />
          </div>

          {/* Active Online Indicator Beacon */}
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#08162d] shadow-xs" />
          </span>
        </button>
      </div>

    </div>
  );
}
