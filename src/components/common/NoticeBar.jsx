import React, { useState } from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';

export default function NoticeBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <aside aria-label="Announcement" className="bg-gradient-to-r from-[#06172e] via-[#0b2444] to-[#06172e] text-slate-200 border-b border-sky-500/20 py-1.5 px-4 relative z-50 text-xs shadow-sm">
      <div className="container mx-auto flex items-center justify-between gap-3">
        
        {/* Left / Center: Highlight Badge + Notice Message */}
        <div className="flex items-center gap-2.5 mx-auto md:mx-0 overflow-hidden">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-[10px] font-black uppercase tracking-wider shrink-0 shadow-inner">
            <Sparkles className="w-3 h-3 text-sky-400 animate-pulse" />
            <span>Special Offer</span>
          </span>
          
          <p className="font-medium text-slate-300 truncate tracking-wide text-[11px] sm:text-xs">
            <span className="hidden sm:inline">Professional CV & Graphic Designs starting at Rs. 300 | </span>
            <span>Speedy Laser Printing & Online Services Available Today</span>
          </p>
        </div>

        {/* Right: Quick Action & Close */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <a
            href="https://wa.me/94719989000?text=Hi%20DESH%20Digital%20Hub,%20I%20would%20like%20to%20inquire%20about%20your%20services."
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-300 hover:text-white transition-colors group cursor-pointer"
          >
            <span>Inquire on WhatsApp</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </a>

          <button
            onClick={() => setIsVisible(false)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Dismiss Announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </aside>
  );
}
