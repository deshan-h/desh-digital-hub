import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Menu, X, Lock, ChevronRight, Phone, Sparkles } from 'lucide-react';
import BannerCarousel from '../home/BannerCarousel';
import WhatsAppIcon from './WhatsAppIcon';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPromotionsModalOpen, setIsPromotionsModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isPromotionsModalOpen) {
        setIsPromotionsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPromotionsModalOpen]);

  const handleNavLinkClick = (e, item) => {
    if (item.label === 'ප්‍රවර්ධන' || item.href === '#promotions') {
      e.preventDefault();
      setIsPromotionsModalOpen(true);
      setIsMobileMenuOpen(false);
    } else {
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'මුල් පිටුව', href: '#home' },
    { label: 'සාම්පල', href: '#our-works' },
    { label: 'ඔන්ලයින් සේවා', href: '#online-services' },
    { label: 'සේවාවන්', href: '#services' },
    { label: 'ප්‍රවර්ධන', href: '#promotions' },
    { label: 'අප ගැන', href: '#about' },
    { label: 'සම්බන්ධ වන්න', href: '#contact' }
  ];

  return (
    <header className={`sticky top-0 z-40 w-full transition-all duration-300 bg-[#0c2340]/95 backdrop-blur-xl border-b-0 sm:border-b sm:border-sky-500/15 ${
      scrolled 
        ? 'shadow-lg shadow-black/30 py-2 sm:py-3 px-3 sm:px-8' 
        : 'shadow-none py-2.5 sm:py-4 px-3 sm:px-8'
    }`}>
      <nav 
        aria-label="Main Navigation"
        className="max-w-7xl mx-auto"
      >
        <div className="flex justify-between items-center">
            
            {/* Brand Logo & Name */}
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group z-50">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 p-1 border border-white/15 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner group-hover:border-sky-400/40 transition-colors">
                <img 
                  src="/pwa-192x192.png" 
                  alt="DESH Digital Hub Logo" 
                  className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform" 
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[14px] sm:text-lg font-black tracking-tight text-white group-hover:text-sky-300 transition-colors leading-tight pb-0.5">
                  DESH Digital Hub
                </span>
                <span className="text-[8.5px] sm:text-[10px] text-sky-300/80 font-semibold tracking-wider uppercase leading-tight">
                  Your One Step Digital Solution
                </span>
              </div>
            </Link>
            
            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((item) => (
                <a 
                  key={item.label}
                  href={item.href} 
                  onClick={(e) => handleNavLinkClick(e, item)}
                  className="group relative px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white transition-all duration-200 rounded-xl hover:bg-white/[0.06] cursor-pointer"
                >
                  <span className="relative z-10 tracking-wide">{item.label}</span>
                  {/* Sleek Neon Glow Indicator on Hover */}
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-sky-400 to-cyan-300 rounded-full group-hover:w-3/5 transition-all duration-300 shadow-[0_0_8px_#38bdf8]" />
                </a>
              ))}
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden sm:flex items-center gap-2.5">
              
              {/* WhatsApp Button */}
              <a 
                href="https://wa.me/94719989000?text=Hello%20DESH%20Digital%20Hub,%20I%20would%20like%20to%20order%20or%20inquire." 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 text-xs font-bold font-mono transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 cursor-pointer"
                title="WhatsApp: +94 (71) 998 9000"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 shrink-0" />
                <span>+94 (71) 998 9000</span>
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
                href="https://wa.me/94719989000?text=Hello%20DESH%20Digital%20Hub,%20I%20would%20like%20to%20order%20or%20inquire." 
                target="_blank" 
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 flex items-center justify-center transition-all shadow-sm"
                title="WhatsApp (+94 71 998 9000)"
              >
                <WhatsAppIcon className="w-4 h-4 shrink-0" />
              </a>

              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-1.5 text-slate-300 hover:text-sky-400 focus:outline-none transition-colors"
                title="Toggle Menu"
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>

          </div>

        {/* Mobile Dropdown Drawer */}
        <div 
          className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden bg-[#071322]/95 backdrop-blur-3xl ${
            isMobileMenuOpen 
              ? 'max-h-[420px] py-4 border-b border-sky-500/20 mt-2' 
              : 'max-h-0 py-0 border-none pointer-events-none'
          }`}
        >
          <div className="flex flex-col px-6 space-y-3">
            {navLinks.map((item) => (
              <a 
                key={item.label}
                href={item.href} 
                onClick={(e) => handleNavLinkClick(e, item)}
                className="flex items-center justify-between text-sm font-semibold text-slate-300 hover:text-sky-300 border-b border-white/5 pb-2 transition-colors cursor-pointer"
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

      {/* Promotional Banners & Carousel Lightbox Modal */}
      {isPromotionsModalOpen && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsPromotionsModalOpen(false)}
        >
          <div 
            className="bg-[#071326] border border-sky-500/30 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-[0_0_60px_rgba(14,165,233,0.25)] overflow-hidden slide-in-from-bottom-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-sky-500/20 bg-gradient-to-r from-[#0a1e38] via-[#09182d] to-[#071326] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20 text-white shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2">
                    <span>විශේෂ ප්‍රවර්ධන හා දීමනා</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase font-bold">
                      Promotions
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Latest marketing flyers, special offers and digital wallpapers
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPromotionsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with Carousel */}
            <div className="p-4 sm:p-6 overflow-y-auto flex items-center justify-center bg-slate-950/60 custom-scrollbar">
              <div className="w-full max-w-[440px]">
                <BannerCarousel />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-800/80 bg-[#071326] flex items-center justify-between text-[11px] text-slate-400 shrink-0">
              <span className="font-mono text-cyan-400/90 text-[10px] sm:text-[11px]">✨ Auto-sliding active • Hover to pause</span>
              <button
                type="button"
                onClick={() => setIsPromotionsModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors cursor-pointer text-xs"
              >
                Close (වසන්න)
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
