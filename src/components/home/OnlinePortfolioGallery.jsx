import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ZoomIn 
} from 'lucide-react';
import WhatsAppIcon from '../common/WhatsAppIcon';
import { settingsService } from '../../services/supabaseService';

// ========================================================
// SAMPLE WORKS (FULL-IMAGE CARDS WITH DARK SHADOW OVERLAY)
// ========================================================
export const SAMPLE_WORKS = [
  {
    id: 'sample-cv',
    image: '/images/services/graphic_design.webp',
    title: 'Modern Executive ATS Resume',
    sinhala: 'නවීන ATS-Friendly වෘත්තීය CV ආකෘතිය',
    description: 'විදෙස් හා දේශීය රැකියා සඳහා ATS මෘදුකාංග මඟින් පහසුවෙන් කියවිය හැකි ඉහළ ප්‍රමිතියේ වෘත්තීය CV ආකෘති. සිංහල හෝ ඉංග්‍රීසි භාෂාවෙන් ක්ෂණිකව සකසා දෙනු ලැබේ.'
  },
  {
    id: 'sample-flyer',
    image: '/images/services/media_downloads.webp',
    title: 'Retail & Food Promo Flyer',
    sinhala: 'Social Media ප්‍රවර්ධන දැන්වීම් පෝස්ටරය',
    description: 'Facebook, Instagram සහ WhatsApp Status සඳහා ආකර්ෂණීය commercial promo flyers සහ digital marketing posters.'
  },
  {
    id: 'sample-passport',
    image: '/images/services/online_applications.webp',
    title: 'Passport Online Appointment Slip',
    sinhala: 'පාස්පෝට් ඔන්ලයින් දිනයන් වෙන්කිරීම',
    description: 'ආගමන හා විගමන දෙපාර්තමේන්තුවේ එක්දින හා සාමාන්‍ය සේවා යටතේ නිල ඔන්ලයින් දිනයන් සාර්ථකව වෙන්කර පාරිභෝගිකයාගේ WhatsApp වෙත රිසිට්පත යැවීම.'
  },
  {
    id: 'sample-binding',
    image: '/images/services/book_binding.webp',
    title: 'Project Reports & Spiral Binding',
    sinhala: 'විශ්වවිද්‍යාල නිබන්ධන හා Plastic Spiral Binding',
    description: 'පාසල් සහ විශ්වවිද්‍යාල අධ්‍යයන වාර්තා, Project Thesis සඳහා ඉදිරිපස විනිවිද පෙනෙන Frosted Sheet සහ පිටුපස Leather Grain Board සහිත ශක්තිමත් Spiral Binding.'
  },
  {
    id: 'sample-laminate',
    image: '/images/services/laminating.webp',
    title: 'Laser Printout & Document Lamination',
    sinhala: 'ලේසර් මුද්‍රණය සහ ලැමිනේටින් සේවා',
    description: 'ජාතික හැඳුනුම්පත් (NIC), සහතික සහ වැදගත් ලේඛන 1200 DPI ලේසර් වර්ණ මුද්‍රණයෙන් මුද්‍රණය කර, තෙතමනයෙන් හා දූවිල්ලෙන් ආරක්ෂා වන පරිදි Thermal Lamination කිරීම.'
  },
  {
    id: 'sample-exam',
    image: '/images/services/scan_online_apps.webp',
    title: 'Exam & Gazette Online Applications',
    sinhala: 'රජයේ විභාග ඔන්ලයින් අයදුම්පත්',
    description: 'විභාග දෙපාර්තමේන්තුවේ A/L, O/L හෝ රාජ්‍ය සේවා තරඟ විභාග සඳහා නිවැරදි විෂය සංකලනයෙන් යුතුව ඔන්ලයින් අයදුම් කර, නිල ගෙවීම් රිසිට්පත පාරිභෝගිකයාට ලබා දීම.'
  },
  {
    id: 'sample-book',
    image: '/images/services/laminating_binding.webp',
    title: 'Creative Book Covers & Formatting',
    sinhala: 'පොත් කවර නිර්මාණය හා Formatting',
    description: 'පාසල්, විශ්වවිද්‍යාල සහ කර්තෘ ප්‍රකාශන පොත් සඳහා Spine (පිටකොන්ද), Front සහ Back සහිත සම්පූර්ණ 300 DPI CMYK මුද්‍රණ-සුදානම් පොත් කවර නිර්මාණ.'
  },
  {
    id: 'sample-repair',
    image: '/images/services/computer_repair.webp',
    title: 'Remote Software & AnyDesk Support',
    sinhala: 'දුරස්ථ පරිගණක සහය (AnyDesk Support)',
    description: 'AnyDesk හෝ TeamViewer මඟින් ඔබගේ පරිගණකයට ආරක්ෂිතව සම්බන්ධ වී, නිවසේ සිටම අවශ්‍ය මෘදුකාංග ස්ථාපනය සහ තාක්ෂණික ගැටලු නිරාකරණය කර දීම.'
  }
];

export default function OnlinePortfolioGallery() {
  const [works, setWorks] = useState(() => {
    try {
      const cached = localStorage.getItem('desh_our_works');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const activeOnly = parsed.filter(w => w.active !== false);
          if (activeOnly.length > 0) return activeOnly;
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached works:', e);
    }
    return SAMPLE_WORKS;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSample, setSelectedSample] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch dynamic works from Supabase settings
  useEffect(() => {
    let isMounted = true;
    const fetchWorks = async () => {
      try {
        const data = await settingsService.getSetting('our_works');
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          const sorted = [...data.items].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
          if (isMounted) {
            const activeOnly = sorted.filter(w => w.active !== false);
            setWorks(activeOnly.length > 0 ? activeOnly : sorted);
          }
          localStorage.setItem('desh_our_works', JSON.stringify(sorted));
        }
      } catch (err) {
        console.warn('Failed to load our_works from Supabase:', err);
      }
    };
    fetchWorks();
    return () => { isMounted = false; };
  }, []);

  const displayWorks = works && works.length > 0 ? works : SAMPLE_WORKS;
  const total = displayWorks.length;
  const safeCurrentIndex = total > 0 ? currentIndex % total : 0;

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + total) % total);
  }, [total]);

  // Auto-play carousel every 3.8s (pauses on hover)
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const interval = setInterval(() => {
      handleNext();
    }, 3800);
    return () => clearInterval(interval);
  }, [isPaused, total, handleNext]);

  const handleZoomNext = useCallback(() => {
    if (total <= 1) return;
    const currentIdx = selectedSample ? displayWorks.findIndex(w => w.id === selectedSample.id) : 0;
    const nextIdx = (currentIdx + 1) % total;
    setSelectedSample(displayWorks[nextIdx]);
  }, [displayWorks, selectedSample, total]);

  const handleZoomPrev = useCallback(() => {
    if (total <= 1) return;
    const currentIdx = selectedSample ? displayWorks.findIndex(w => w.id === selectedSample.id) : 0;
    const prevIdx = (currentIdx - 1 + total) % total;
    setSelectedSample(displayWorks[prevIdx]);
  }, [displayWorks, selectedSample, total]);

  // Keyboard navigation & Escape to close zoom
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedSample(null);
      if (e.key === 'ArrowRight') {
        if (selectedSample) handleZoomNext();
        else handleNext();
      }
      if (e.key === 'ArrowLeft') {
        if (selectedSample) handleZoomPrev();
        else handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, selectedSample, handleZoomNext, handleZoomPrev]);

  const handleWhatsAppForSample = (sample) => {
    const text = encodeURIComponent(
      `Hi DESH Digital Hub! මම website එකේ ඔබගේ [${sample.title} - ${sample.sinhala}] සාම්පලය බැලුවා. මටත් ඒ හා සමාන නිර්මාණයක් / සේවාවක් කරගැනීමට අවශ්‍යයි.`
    );
    window.open(`https://wa.me/94719989000?text=${text}`, '_blank');
  };

  // 3D Cover-Flow Style calculation (5 Cards on PC/Desktop, 3 Cards on Mobile)
  const getCardStyle = (index) => {
    const diff = (index - safeCurrentIndex + total) % total;

    if (diff === 0) {
      // Center card (In Front, elevated, prominent, overlapping flanking cards)
      return {
        zIndex: 30,
        x: '0%',
        scale: 1,
        opacity: 1,
        cursor: 'pointer',
        isCenter: true
      };
    } else if (diff === total - 1 || (total === 2 && diff === 1)) {
      // Mid Left card (Behind, shifted left, scaled down, clickable)
      return {
        zIndex: 20,
        x: isDesktop ? '-50%' : '-56%',
        scale: 0.86,
        opacity: isDesktop ? 0.85 : 0.65,
        cursor: 'pointer',
        isLeft: true
      };
    } else if (diff === 1) {
      // Mid Right card (Behind, shifted right, scaled down, clickable)
      return {
        zIndex: 20,
        x: isDesktop ? '50%' : '56%',
        scale: 0.86,
        opacity: isDesktop ? 0.85 : 0.65,
        cursor: 'pointer',
        isRight: true
      };
    } else if (isDesktop && total >= 5 && diff === total - 2) {
      // Far Left card (5-Card Coverflow on PC/Desktop)
      return {
        zIndex: 10,
        x: '-95%',
        scale: 0.72,
        opacity: 0.45,
        cursor: 'pointer',
        isFarLeft: true
      };
    } else if (isDesktop && total >= 5 && diff === 2) {
      // Far Right card (5-Card Coverflow on PC/Desktop)
      return {
        zIndex: 10,
        x: '95%',
        scale: 0.72,
        opacity: 0.45,
        cursor: 'pointer',
        isFarRight: true
      };
    } else {
      // Hidden offscreen
      return {
        zIndex: 1,
        x: diff < total / 2 ? '150%' : '-150%',
        scale: 0.5,
        opacity: 0,
        pointerEvents: 'none'
      };
    }
  };

  return (
    <section id="our-works" className="py-14 sm:py-20 relative overflow-hidden bg-[#050c18] border-b border-sky-500/10">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55rem] h-[28rem] bg-sky-600/10 rounded-full blur-[170px] pointer-events-none -z-10 mix-blend-screen" />

      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        
        {/* ======================================================== */}
        {/* HEADER: CENTER ALIGNED AS IN USER SKETCH                 */}
        {/* ======================================================== */}
        <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Our Works
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-slate-300 mt-2.5 font-medium leading-relaxed max-w-2xl mx-auto">
            අප විසින් උසස් තාක්ෂණයෙන් හා නිරවද්‍යතාවයෙන් යුතුව නිමවා ලබාදුන් වෘත්තීය CV, ග්‍රැෆික් නිර්මාණ, පොත් බයින්ඩින්, පරිගණක අලුත්වැඩියා හා දෘඩාංග/මෘදුකාංග නඩත්තු (Computer Repairing & Support) මෙන්ම ඔන්ලයින් අයදුම්පත් සාම්පල.
          </p>
        </div>

        {/* ======================================================== */}
        {/* 3D COVER-FLOW LAYERED CAROUSEL (5 CARDS ON DESKTOP, 3 ON MOBILE) */}
        {/* Touch Swipe Gesture Enabled for Mobile & Tablet           */}
        {/* ======================================================== */}
        <div 
          className="relative max-w-7xl mx-auto py-3 sm:py-6"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={(e) => {
            setTouchStartX(e.targetTouches[0].clientX);
            setTouchEndX(null);
            setIsPaused(true);
          }}
          onTouchMove={(e) => {
            setTouchEndX(e.targetTouches[0].clientX);
          }}
          onTouchEnd={() => {
            if (touchStartX !== null && touchEndX !== null) {
              const diff = touchStartX - touchEndX;
              if (diff > 45) {
                handleNext();
              } else if (diff < -45) {
                handlePrev();
              }
            }
            setTouchStartX(null);
            setTouchEndX(null);
            setIsPaused(false);
          }}
        >
          {/* Main 3D Card Stage */}
          <div className="relative h-[430px] sm:h-[480px] md:h-[520px] lg:h-[560px] w-full flex items-center justify-center overflow-visible">
            {displayWorks.map((work, idx) => {
              const style = getCardStyle(idx);
              if (style.opacity === 0 && !style.isCenter) return null;

              return (
                <motion.div
                  key={work.id}
                  animate={{
                    x: style.x,
                    scale: style.scale,
                    opacity: style.opacity,
                    zIndex: style.zIndex
                  }}
                  transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
                  onClick={() => {
                    if (style.isFarLeft) setCurrentIndex(prev => (prev - 2 + total) % total);
                    else if (style.isLeft) handlePrev();
                    else if (style.isFarRight) setCurrentIndex(prev => (prev + 2) % total);
                    else if (style.isRight) handleNext();
                    else if (style.isCenter) setSelectedSample(work);
                  }}
                  className={`absolute w-[76vw] max-w-[285px] sm:w-[320px] md:w-[350px] lg:w-[370px] xl:w-[390px] h-[395px] sm:h-[450px] md:h-[490px] lg:h-[530px] rounded-3xl sm:rounded-[36px] overflow-hidden select-none isolate transition-all duration-300 bg-[#071326] ${
                    style.isCenter 
                      ? 'border-2 border-sky-400 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(56,189,248,0.35)] ring-2 ring-sky-400/20' 
                      : 'border border-sky-500/25 shadow-xl hover:border-sky-400/50 hover:opacity-85'
                  }`}
                  style={{ cursor: style.cursor }}
                >
                  {/* Subtle Shimmer Skeleton while image loads */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-sky-950/40 to-slate-900 animate-pulse pointer-events-none -z-10" />

                  {/* Full Card Edge-to-Edge Image (Fills the entire card) */}
                  <img 
                    src={work.image} 
                    alt={work.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                    fetchPriority={style.isCenter ? "high" : "low"}
                  />

                  {/* Top Subtle Vignette */}
                  <div className="absolute inset-x-0 top-0 h-20 sm:h-24 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none z-10" />

                  {/* Zoom indicator on active center card */}
                  {style.isCenter && (
                    <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-20 pointer-events-none">
                      <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-sky-300 text-[10px] sm:text-[11px] font-bold shadow-lg">
                        <ZoomIn className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-sky-400" />
                        <span>Click to Zoom</span>
                      </span>
                    </div>
                  )}

                  {/* Bottom Dark Gradient Shadow covering description area */}
                  <div className="absolute inset-x-0 bottom-0 pt-20 sm:pt-28 pb-4 sm:pb-6 px-4 sm:px-6 bg-gradient-to-t from-black via-black/90 to-transparent z-20 flex flex-col justify-end text-left pointer-events-none">
                    <h3 className="text-base sm:text-lg md:text-xl font-black text-white leading-tight drop-shadow-md">
                      {work.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs md:text-sm text-slate-300 mt-1 line-clamp-2 leading-relaxed font-normal">
                      {work.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Navigation Controls: Left & Right Arrows */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-1 sm:left-3 lg:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-[#08162e]/90 hover:bg-sky-600 text-white border border-sky-400/30 shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer z-40 backdrop-blur-md"
            title="Previous"
            aria-label="Previous Work"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="absolute right-1 sm:right-3 lg:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-[#08162e]/90 hover:bg-sky-600 text-white border border-sky-400/30 shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer z-40 backdrop-blur-md"
            title="Next"
            aria-label="Next Work"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* ======================================================== */}
          {/* DOTS PAGINATION (MATCHING USER'S 4-DOT SKETCH)           */}
          {/* ======================================================== */}
          <div className="flex items-center justify-center gap-3 mt-6 sm:mt-8">
            {displayWorks.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setCurrentIndex(dotIdx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  safeCurrentIndex === dotIdx
                    ? 'w-7 h-2.5 bg-gradient-to-r from-sky-400 to-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.8)]'
                    : 'w-2.5 h-2.5 bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Go to slide ${dotIdx + 1}`}
                aria-label={`Slide ${dotIdx + 1}`}
              />
            ))}
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* IMAGE ZOOM LIGHTBOX MODAL (CLEAN IMAGE ZOOM & SMALL DESC)*/}
      {/* ======================================================== */}
      <AnimatePresence>
        {selectedSample && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md"
            onClick={() => setSelectedSample(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="relative max-w-4xl w-full flex flex-col items-center max-h-[94vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button Top Right */}
              <button
                type="button"
                onClick={() => setSelectedSample(null)}
                className="absolute -top-3 -right-2 sm:-top-4 sm:-right-4 z-50 w-10 h-10 rounded-full bg-slate-900/95 hover:bg-rose-600 text-white border border-white/20 shadow-2xl flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Main Zoomed Image Container with Next/Prev Arrow Controls */}
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-sky-400/30 shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_40px_rgba(56,189,248,0.25)] bg-[#071326] flex items-center justify-center max-h-[72vh] w-full">
                <img 
                  src={selectedSample.image} 
                  alt={selectedSample.title} 
                  className="max-h-[72vh] w-auto max-w-full object-contain select-none"
                />

                {/* Left (Previous) Navigation Arrow Button */}
                {total > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleZoomPrev();
                    }}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/80 hover:bg-sky-500 hover:text-slate-950 text-white border border-white/20 shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer z-30 backdrop-blur-md"
                    title="Previous Image (Left Arrow)"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                )}

                {/* Right (Next) Navigation Arrow Button */}
                {total > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleZoomNext();
                    }}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/80 hover:bg-sky-500 hover:text-slate-950 text-white border border-white/20 shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer z-30 backdrop-blur-md"
                    title="Next Image (Right Arrow)"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                )}

                {/* Counter Tag */}
                {total > 1 && (
                  <div className="absolute top-3 left-3 z-30 pointer-events-none">
                    <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-sky-300 border border-white/20 shadow-md">
                      {(displayWorks.findIndex(w => w.id === selectedSample.id) + 1)} / {total}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Small Description Bar */}
              <div className="w-full mt-3 sm:mt-4 p-4 sm:p-5 rounded-2xl bg-[#071326]/95 border border-sky-500/20 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
                <div className="min-w-0 flex-1 text-left">
                  <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                    {selectedSample.title}
                  </h3>
                  {selectedSample.sinhala && (
                    <p className="text-xs font-bold text-sky-400 mt-0.5">
                      {selectedSample.sinhala}
                    </p>
                  )}
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed font-normal">
                    {selectedSample.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleWhatsAppForSample(selectedSample)}
                    className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 text-xs font-black transition-all shadow-lg flex items-center gap-1.5 cursor-pointer"
                    title="Inquire via WhatsApp"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                    <span>WhatsApp විමසන්න</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
