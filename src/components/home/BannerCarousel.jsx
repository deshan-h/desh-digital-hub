import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { settingsService } from '../../services/supabaseService';
import { 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  Sparkles, 
  Layers,
  ArrowRight
} from 'lucide-react';

const DEFAULT_BANNERS = [
  {
    id: 'default-1',
    title: 'DESH Digital Solutions',
    subtitle: 'Next-Generation POS Systems, Web Development & IT Solutions for modern businesses.',
    badge: 'FEATURED SERVICE',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    linkUrl: '#services',
    linkText: 'Explore Services',
    active: true
  },
  {
    id: 'default-2',
    title: 'DESH Edu Hub Portal',
    subtitle: 'Free and premium educational resources, school exam papers and O/L A/L study guides.',
    badge: 'EDUCATIONAL',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    linkUrl: 'https://deshedublog.blogspot.com',
    linkText: 'Visit Edu Hub',
    active: true
  },
  {
    id: 'default-3',
    title: 'Smart Tech Support & Repairs',
    subtitle: 'Fast and reliable PC & laptop repairs, motherboard diagnostics, and OS formatting.',
    badge: 'HOT DEAL',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
    linkUrl: 'https://wa.me/94719989000',
    linkText: 'Inquire on WhatsApp',
    active: true
  }
];

export default function BannerCarousel() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);

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
        console.error('Failed to load banners:', err);
        if (isMounted) setBanners(DEFAULT_BANNERS);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBanners();
    return () => { isMounted = false; };
  }, []);

  // Auto-play timer (5 seconds)
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length, isPaused]);

  if (loading || banners.length === 0) return null;

  const currentBanner = banners[currentIndex] || banners[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <section id="promotions" className="py-12 relative z-10 w-full">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Featured Highlights & Deals</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            විශේෂ ප්‍රවර්ධන සහ සේවාවන්
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg mx-auto">
            DESH Digital Hub වෙතින් ඔබ වෙනුවෙන්ම ලබාදෙන සුවිශේෂී වට්ටම් සහ නවතම සේවා තොරතුරු.
          </p>
        </div>

        {/* Panoramic Luxury Display Card */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative bg-[#081528]/85 backdrop-blur-2xl border border-sky-500/20 rounded-3xl p-5 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden group"
        >
          {/* Subtle Ambient Corner Light */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
            
            {/* Left: 1:1 High-Res Flyer Graphic */}
            <div className="md:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-square rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950 group/img">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentBanner.imageUrl}
                    src={currentBanner.imageUrl}
                    alt={currentBanner.title || 'Promotional Flyer'}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                </AnimatePresence>

                {/* Badge Overlay on Image */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider shadow-md">
                    {currentBanner.badge || 'PROMOTION'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Promotion Details & Interactive Actions */}
            <div className="md:col-span-7 flex flex-col justify-between text-left space-y-5">
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-sky-400 uppercase tracking-widest font-bold">
                    Official Announcement • 0{currentIndex + 1} / 0{banners.length}
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentBanner.id || currentIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2.5"
                  >
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug">
                      {currentBanner.title || 'DESH Special Announcement'}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                      {currentBanner.subtitle || 'Visit our center or contact us online to take advantage of this special service offering.'}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Action Buttons & Navigation Indicators */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-800/80">
                
                {/* CTA Link */}
                {currentBanner.linkUrl ? (
                  <a
                    href={currentBanner.linkUrl}
                    target={currentBanner.linkUrl.startsWith('http') ? '_blank' : '_self'}
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all self-start sm:self-auto cursor-pointer"
                  >
                    <span>{currentBanner.linkText || 'Learn More'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <a
                    href="https://wa.me/94719989000"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/30 font-bold text-xs transition-all self-start sm:self-auto"
                  >
                    <span>Contact via WhatsApp</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                )}

                {/* Slider Nav Controls */}
                <div className="flex items-center gap-3">
                  {/* Dot Indicators */}
                  <div className="flex items-center gap-1.5">
                    {banners.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        onClick={() => setCurrentIndex(dotIdx)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          currentIndex === dotIdx ? 'w-6 bg-sky-400' : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                        }`}
                        title={`Slide ${dotIdx + 1}`}
                      />
                    ))}
                  </div>

                  {/* Arrow Buttons */}
                  <div className="flex items-center gap-1.5 pl-2">
                    <button
                      onClick={handlePrev}
                      className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                      title="Previous"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                      title="Next"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
