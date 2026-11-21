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
    linkUrl: 'https://desh.s.gy/edu-hub',
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
            const activeItems = data.items
              .filter((b) => b.active !== false)
              .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
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
      <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition duration-700 pointer-events-none animate-gradient-x"></div>

      {/* Main Carousel Container - Fixed 1:1 Aspect Ratio (Square) */}
      <div className="relative w-full max-w-[380px] sm:max-w-[430px] lg:max-w-[460px] aspect-square mx-auto rounded-3xl overflow-hidden bg-slate-950 border border-white/10 shadow-2xl">
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
            {/* Clickable Banner Wrapper if linkUrl exists */}
            {currentBanner.linkUrl ? (
              <a
                href={currentBanner.linkUrl}
                target={currentBanner.linkUrl.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="block w-full h-full relative cursor-pointer"
              >
                {/* 1:1 Wallpaper Image */}
                <img
                  src={currentBanner.imageUrl}
                  alt={currentBanner.title || 'Promotion Graphic'}
                  className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
                  loading={currentIndex === 0 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={currentIndex === 0 ? "high" : "auto"}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_BANNERS[0].imageUrl;
                  }}
                />

                {/* Scrim Overlay: Only subtle bottom gradient so 1:1 poster graphic art stays vibrant */}
                <div className={`absolute inset-0 pointer-events-none transition-opacity ${
                  currentBanner.title ? 'bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent' : 'bg-gradient-to-t from-slate-950/60 via-transparent to-transparent'
                }`} />

                {/* Content Overlay */}
                <div className="absolute inset-0 p-4 sm:p-5 md:p-6 flex flex-col justify-between z-10 pointer-events-none">
                  
                  {/* Top Badge & Counter */}
                  <div className="flex items-center justify-between gap-2 pointer-events-auto">
                    {currentBanner.badge ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-cyan-500/40 text-cyan-300 shadow-lg">
                        <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
                        <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase">
                          {currentBanner.badge}
                        </span>
                      </div>
                    ) : <div />}

                    <div className="px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-[10px] font-mono text-slate-300">
                      {currentIndex + 1} / {banners.length}
                    </div>
                  </div>

                  {/* Bottom Information (If Title / Subtitle is provided) */}
                  <div className="space-y-1.5 pointer-events-auto">
                    {currentBanner.title && (
                      <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight leading-snug drop-shadow-md">
                        {currentBanner.title}
                      </h3>
                    )}

                    {currentBanner.subtitle && (
                      <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed drop-shadow max-w-[95%]">
                        {currentBanner.subtitle}
                      </p>
                    )}

                    {currentBanner.linkUrl && (
                      <div className="pt-1.5">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md">
                          <span>{currentBanner.linkText || 'View Details'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </a>
            ) : (
              <div className="w-full h-full relative">
                {/* 1:1 Wallpaper Image */}
                <img
                  src={currentBanner.imageUrl}
                  alt={currentBanner.title || 'Promotion Graphic'}
                  className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
                  loading={currentIndex === 0 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={currentIndex === 0 ? "high" : "auto"}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_BANNERS[0].imageUrl;
                  }}
                />

                {/* Scrim Overlay */}
                <div className={`absolute inset-0 pointer-events-none transition-opacity ${
                  currentBanner.title ? 'bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent' : 'bg-gradient-to-t from-slate-950/60 via-transparent to-transparent'
                }`} />

                {/* Content Overlay */}
                <div className="absolute inset-0 p-4 sm:p-5 md:p-6 flex flex-col justify-between z-10 pointer-events-none">
                  {/* Top Badge & Counter */}
                  <div className="flex items-center justify-between gap-2 pointer-events-auto">
                    {currentBanner.badge ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-cyan-500/40 text-cyan-300 shadow-lg">
                        <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
                        <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase">
                          {currentBanner.badge}
                        </span>
                      </div>
                    ) : <div />}

                    <div className="px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-[10px] font-mono text-slate-300">
                      {currentIndex + 1} / {banners.length}
                    </div>
                  </div>

                  {/* Bottom Information */}
                  {currentBanner.title && (
                    <div className="space-y-1.5 pointer-events-auto">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight leading-snug drop-shadow-md">
                        {currentBanner.title}
                      </h3>

                      {currentBanner.subtitle && (
                        <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed drop-shadow max-w-[95%]">
                          {currentBanner.subtitle}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
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
