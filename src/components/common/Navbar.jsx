import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, MessageCircle, Lock, ChevronRight, Phone } from 'lucide-react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'මුල් පිටුව', href: '#home' },
    { label: 'සේවාවන්', href: '#services' },
    { label: 'ප්‍රවර්ධන', href: '#promotions' },
    { label: 'අප ගැන', href: '#about' },
    { label: 'සම්බන්ධ වන්න', href: '#contact' }
  ];

  return (
    <header className="fixed w-full z-40 top-0 left-0 right-0 px-2 sm:px-6 pt-0 sm:pt-1.5 pointer-events-none">
      <nav 
        aria-label="Main Navigation"
        className={`max-w-7xl mx-auto pointer-events-auto rounded-b-[24px] sm:rounded-b-[30px] border-b border-l border-r border-sky-400/20 bg-gradient-to-b from-[#0c2340]/95 via-[#0a1e36]/95 to-[#061424]/95 backdrop-blur-2xl shadow-[0_18px_45px_rgba(0,0,0,0.75)] transition-all duration-300 ${
          scrolled ? 'py-2 sm:py-2.5' : 'py-2.5 sm:py-3.5'
        }`}
      >
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center">
            
            {/* Brand Logo & Name */}
            <Link to="/" className="flex items-center gap-3 group z-50">
              <div className="w-9 h-9 rounded-xl bg-white/10 p-1 border border-white/15 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner group-hover:border-sky-400/40 transition-colors">
                <img 
                  src="/pwa-192x192.png" 
                  alt="DESH Digital Hub Logo" 
                  className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform" 
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-sky-300 transition-colors leading-tight">
                  DESH Digital Hub
                </span>
                <span className="text-[10px] text-sky-300/80 font-semibold tracking-wider uppercase">
                  Your One Step Digital Solution
                </span>
              </div>
            </Link>
            
            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1">
              <div className="flex items-center p-1 bg-[#091a32]/70 backdrop-blur-md rounded-full border border-sky-500/15 shadow-inner">
                {navLinks.map((item) => (
                  <a 
                    key={item.label}
                    href={item.href} 
                    className="px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden sm:flex items-center gap-2.5">
              
              {/* WhatsApp Button */}
              <a 
                href="https://wa.me/94719989000?text=Hello%20DESH%20Digital%20Hub,%20I%20would%20like%20to%20order%20or%20inquire." 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 text-xs font-black transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>WhatsApp Order</span>
              </a>

              {/* Admin Portal Shortcut Link */}
              <Link
                to="/admin"
                className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-sky-300 border border-slate-800 transition-colors cursor-pointer"
                title="Management Portal"
              >
                <Lock className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Mobile Hamburger Toggle Button */}
            <div className="flex lg:hidden items-center gap-2 z-50">
              <a 
                href="https://wa.me/94719989000" 
                target="_blank" 
                rel="noreferrer"
                className="sm:hidden px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>WhatsApp</span>
              </a>

              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-300 hover:text-sky-400 focus:outline-none transition-colors"
                title="Toggle Menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        <div 
          className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden bg-[#071322]/95 backdrop-blur-3xl border-b border-sky-500/20 ${
            isMobileMenuOpen ? 'max-h-[420px] py-4' : 'max-h-0 py-0 border-transparent'
          }`}
        >
          <div className="flex flex-col px-6 space-y-3">
            {navLinks.map((item) => (
              <a 
                key={item.label}
                href={item.href} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between text-sm font-semibold text-slate-300 hover:text-sky-300 border-b border-white/5 pb-2 transition-colors"
              >
                <span>{item.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </a>
            ))}
            
            <div className="pt-3 flex flex-col gap-2.5">
              <a 
                href="tel:0719989000"
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold"
              >
                <Phone className="w-4 h-4 text-sky-400" />
                <span>Call Us: 071 998 9000</span>
              </a>

              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-white text-xs font-semibold"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Staff & Admin Portal Login</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
