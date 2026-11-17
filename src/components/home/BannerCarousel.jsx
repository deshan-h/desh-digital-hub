import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { settingsService } from '../../services/supabaseService';
import { 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  Sparkles, 
  Layers
} from 'lucide-react';

// Default stylish fallback banners when database has no custom banners yet
const DEFAULT_BANNERS = [
  {
    id: 'default-1',
    title: 'DESH Digital Solutions',
    subtitle: 'Next-Generation POS Systems, Web Development & IT Solutions.',
    badge: 'FEATURED',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    linkUrl: '#services',
    linkText: 'Explore Services',
    active: true
  },
  {
    id: 'default-2',
    title: 'DESH Edu Hub Portal',
    subtitle: 'Free and premium educational resources, exam papers and study guides.',
    badge: 'EDUCATIONAL',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    linkUrl: 'https://deshedublog.blogspot.com',
    linkText: 'Visit Edu Hub',
    active: true
  },
  {
    id: 'default-3',
    title: 'Smart Tech Support & Repairs',
    subtitle: 'Reliable computer repairs, network installation and hardware upgrades.',
    badge: 'HOT DEAL',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
    linkUrl: '#contact',
    linkText: 'Contact Us',
    active: true
  }
];

export default function BannerCarousel() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(1); // 1 = next, -1 = prev

  // Fetch banners from Supabase settings table ('banners' key)
  useEffect(() => {
    let isMounted = true;
    const fetchBanners = async () => {
      try {
        const data = await settingsService.getSetting('banners');
        if (isMounted) {
          if (data && Array.isArray(data.items) && data.items.length > 0) {
            const activeItems = data.items.filter((b) => b.active !== false);
            setBanners(activeItems.length > 0 ? activeItems : DEFAULT_BANNERS);
          } else {
            setBanners(DEFAULT_BANNERS);
          }
        }
      } catch (err) {
        console.error('Failed to load banner settings:', err);
        if (isMounted) setBanners(DEFAULT_BANNERS);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBanners();
    return () => { isMounted = false; };
  }, []);

  // Auto-play timer
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5500);

    return () => clearInterval(interval);
  }, [banners.length, isPaused]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleDotClick = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className="w-full h-[320px] sm:h-[360px] rounded-2xl bg-slate-900/80 border border-slate-800 animate-pulse flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Layers className="w-5 h-5 animate-spin text-cyan-500" />
          <span>Loading banners...</span>
        </div>
      </div>
    );
  }

  const currentBanner = banners[currentIndex] || DEFAULT_BANNERS[0];

  // Slide transition animation variants
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.98
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    exit: (dir) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
      scale: 0.98,
      transition: {
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1]
      }
    })
  };

  return (
    <div 
      className="relative w-full group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Ambient Neon Glow behind the Carousel */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-60 transition duration-700 pointer-events-none animate-gradient-x"></div>

      {/* Main Carousel Container */}
      <div className="relative w-full h-[320px] sm:h-[350px] lg:h-[370px] rounded-2xl overflow-hidden bg-slate-950 border border-white/10 shadow-2xl">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentBanner.id || currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full"
          >
            {/* Wallpaper Image */}
            <img
              src={currentBanner.imageUrl}
              alt={currentBanner.title || 'Promotion Banner'}
              className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                // Fallback to high tech image if URL fails
                e.target.onerror = null;
                e.target.src = DEFAULT_BANNERS[0].imageUrl;
              }}
            />

            {/* Dark Tech Vignette & Gradient Overlays for High Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/30 to-transparent pointer-events-none" />

            {/* Content Overlay */}
            <div className="absolute inset-0 p-5 sm:p-6 md:p-7 flex flex-col justify-between z-10">
              
              {/* Top Badge / Category */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-cyan-500/40 text-cyan-300 shadow-md">
                  <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
                  <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase">
                    {currentBanner.badge || 'PROMOTION'}
                  </span>
                </div>

                {/* Counter indicator */}
                <div className="px-2.5 py-0.5 rounded-full bg-slate-950/70 backdrop-blur-md border border-slate-700/60 text-[10px] font-mono text-slate-400">
                  {currentIndex + 1} / {banners.length}
                </div>
              </div>

              {/* Bottom Information & CTA Button */}
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug drop-shadow-md">
                  {currentBanner.title}
                </h3>

                {currentBanner.subtitle && (
                  <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed drop-shadow max-w-[90%]">
                    {currentBanner.subtitle}
                  </p>
                )}

                {/* Call to action button */}
                {currentBanner.linkUrl && (
                  <div className="pt-2">
                    <a
                      href={currentBanner.linkUrl}
                      target={currentBanner.linkUrl.startsWith('http') ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 hover:text-white transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] group/btn"
                    >
                      <span>{currentBanner.linkText || 'View Details'}</span>
                      <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Previous Button */}
        {banners.length > 1 && (
          <button
            onClick={handlePrev}
            aria-label="Previous Slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-slate-950/60 hover:bg-slate-900/90 text-white border border-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:border-cyan-400 shadow-lg cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Next Button */}
        {banners.length > 1 && (
          <button
            onClick={handleNext}
            aria-label="Next Slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-slate-950/60 hover:bg-slate-900/90 text-white border border-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:border-cyan-400 shadow-lg cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Bottom Indicator Dots / Bars */}
        {banners.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/10">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleDotClick(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === currentIndex 
                    ? 'w-6 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_8px_rgba(34,211,238,0.8)]' 
                    : 'w-2 h-2 bg-slate-600/70 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
