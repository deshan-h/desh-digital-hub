import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { settingsService } from '../../services/supabaseService';
import { 
  Sparkles, 
  CheckCircle2, 
  X, 
  MessageCircle, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';

// ========================================================
// THE 7 CORE SERVICES DEFINED BY USER WITH AI 3D ISOMETRIC ART
// ========================================================
const DEFAULT_SERVICES = [
  {
    id: 'pc-repair',
    title: 'PC & Laptop Repair',
    sinhala: 'පරිගණක අලුත්වැඩියා',
    image: '/images/services/computer_repair.jpg',
    description: 'දෝෂ හඳුනාගැනීම, Windows OS Formatting, High-Speed SSD & RAM upgrades, motherboard servicing සහ ගැඹුරු පිරිසිදු කිරීම්.',
    items: [
      { name: 'Hardware Diagnostics & Fault Checking' },
      { name: 'Windows OS Formatting & Essential Setup' },
      { name: 'High-Speed SSD & RAM Installation' },
      { name: 'Thermal Paste Servicing & Deep Fan Cleaning' },
      { name: 'Motherboard & Power Circuit Troubleshooting' }
    ]
  },
  {
    id: 'print-photocopy',
    title: 'Printout & Photocopy',
    sinhala: 'ප්‍රින්ට් අවුට් , ෆොටොකොපි (වර්ණ / කලුසුදු)',
    image: '/images/services/print_photocopy.jpg',
    description: 'අධිවේගී ලේසර් කළු-සුදු සහ වර්ණ මුද්‍රණ, ෆොටෝකොපි සහ උසස් පැහැදිලි ලේඛන පිටපත් කිරීම.',
    items: [
      { name: 'Laser Printout [B/W & Full Color]' },
      { name: 'Fast Photocopy [A4, Legal, A3]' },
      { name: 'Bulk Printing & Exam Document Duplication' },
      { name: 'High-DPI Photo & Certificate Printing' },
      { name: 'Both Side (Duplex) Double-Sided Printing' }
    ]
  },
  {
    id: 'laminating-binding',
    title: 'Laminating & Book Binding',
    sinhala: 'ලැමිනේට්, පොත් බයින්ඩින්',
    image: '/images/services/laminating_binding.jpg',
    description: 'NIC, A4, Legal, A3 Thermal Laminating සහ Spiral, Tape, Hardcover කල්පවත්නා පොත් බයින්ඩින්.',
    items: [
      { name: 'Thermal Laminating [NIC, A4, Legal, A3]' },
      { name: 'Plastic Spiral & Comb Coil Binding' },
      { name: 'Tape Binding & Report Protection Covers' },
      { name: 'Hardcover Thesis, Project & Book Binding' }
    ]
  },
  {
    id: 'scan-online-apps',
    title: 'Scan, Email & Online Apps',
    sinhala: 'ස්කෑන්, ඊ-මේල්, ඔන්ලයින් අයදුම් පත්‍ර',
    image: '/images/services/scan_online_apps.jpg',
    description: 'උසස් තත්ත්වයේ ලේඛන ස්කෑන් කිරීම, ඊ-මේල් සේවා, විශ්වවිද්‍යාල සහ රජයේ සියලුම මාර්ගගත අයදුම්පත් පිරවීම.',
    items: [
      { name: 'High-DPI Document & Signature Scanning' },
      { name: 'Email & Secure Online Document Dispatch' },
      { name: 'University & Exam Online Applications' },
      { name: 'Vehicle Revenue License Renewals' },
      { name: 'Passport & Driving License Appointment Forms' }
    ]
  },
  {
    id: 'media-downloads',
    title: 'Entertainment & Downloads',
    sinhala: 'චිත්‍රපට, ගීත, වීඩියෝ, සොෆ්ට්වෙයාර්, ගේම්ස් ඩවුන්ලෝඩ්',
    image: '/images/services/media_downloads.jpg',
    description: 'චිත්‍රපට, ගීත ඇල්බම්, වීඩියෝ, අත්‍යවශ්‍ය පරිගණක මෘදුකාංග සහ ක්‍රීඩා අධිවේගී ඩවුන්ලෝඩ්.',
    items: [
      { name: 'Sinhala, Tamil & English MP3 Songs & Tracks' },
      { name: 'HD Movies & High-Quality Video Collections' },
      { name: 'Essential Windows PC & Office Software' },
      { name: 'Offline PC Games & High-Speed Media Loading' },
      { name: 'Past Examination Papers & Study Worksheets' }
    ]
  },
  {
    id: 'graphic-design',
    title: 'Graphic Design',
    sinhala: 'Graphic Design & නිර්මාණ',
    image: '/images/services/graphic_design.jpg',
    description: 'වෘත්තීය මට්ටමේ CV නිර්මාණය, ව්‍යාපාරික කාඩ්පත්, පෝස්ටර්, බැනර් සහ සමාජ මාධ්‍ය ප්‍රවර්ධන දැන්වීම්.',
    items: [
      { name: 'Professional CV & Modern ATS Resumes' },
      { name: 'Business Cards & Identity Tags (ID Cards)' },
      { name: 'Flyers, Posters & Leaflet Graphic Design' },
      { name: 'Social Media Post & Banner Graphics' },
      { name: 'Book Covers, Labels & Package Stickers' }
    ]
  },
  {
    id: 'bill-payments',
    title: 'Bill Payments & Reloads',
    sinhala: 'බිල්පත් ගෙවීම්, පැකේජ සක්‍රිය කිරීම්',
    image: '/images/services/bill_payments.jpg',
    description: 'විදුලි, ජල, දුරකථන බිල්පත් ගෙවීම්, සියලුම ජංගම දුරකථන Reloads, Data පැකේජ සහ DTV සක්‍රිය කිරීම්.',
    items: [
      { name: 'CEB Electricity & Water Board Bill Payments' },
      { name: 'SLT, Mobitel, Dialog, Airtel, Hutch Postpaid Bills' },
      { name: 'Instant Mobile Reloads & Card Top-ups' },
      { name: 'Broadband Data & Router Package Activations' },
      { name: 'Dialog Television & DTV Channel Activations' }
    ]
  }
];

export default function Services() {
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [loading, setLoading] = useState(true);
  const [selectedServiceModal, setSelectedServiceModal] = useState(null);

  useEffect(() => {
    async function loadVisibility() {
      try {
        const hiddenIds = await settingsService.getPublicCategoryVisibility().catch(() => []);
        if (Array.isArray(hiddenIds) && hiddenIds.length > 0) {
          const visible = DEFAULT_SERVICES.filter(
            s => !hiddenIds.includes(s.id) && !hiddenIds.includes(s.title) && !hiddenIds.includes(s.sinhala)
          );
          setServices(visible);
        } else {
          setServices(DEFAULT_SERVICES);
        }
      } catch (err) {
        console.error('Error loading service visibility:', err);
      } finally {
        setLoading(false);
      }
    }
    loadVisibility();
  }, []);

  const handleWhatsAppInquiry = (serviceName) => {
    const text = encodeURIComponent(`Hi DESH Digital Hub! I would like to inquire about your ${serviceName} service.`);
    window.open(`https://wa.me/94719989000?text=${text}`, '_blank');
  };

  return (
    <section id="services" className="py-16 md:py-24 relative overflow-hidden bg-transparent">
      
      {/* Ambient background lighting */}
      <div className="absolute top-1/4 left-[-10%] w-[35rem] h-[35rem] bg-sky-600/10 rounded-full blur-[150px] pointer-events-none -z-10 mix-blend-screen" />
      <div className="absolute bottom-10 right-[-10%] w-[35rem] h-[35rem] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none -z-10 mix-blend-screen" />

      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Comprehensive Solutions • අපගේ සේවාවන්</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Our Services
          </h2>

          <p className="text-sm sm:text-base text-slate-300 mt-3 font-medium">
            ඔබේ සියලුම ලේඛන මුද්‍රණ, පරිගණක නඩත්තු සහ ඔන්ලයින් සේවා අවශ්‍යතා සඳහා උසස්ම ප්‍රමිතියෙන් යුතු විශ්වාසනීය සේවාව.
          </p>
        </div>

        {/* ======================================================== */}
        {/* MAIN CATEGORIES: 1:1 SQUARE TILES (HATHARES TILES)       */}
        {/* Powered by AI-generated 3D Isometric Renders             */}
        {/* ======================================================== */}
        {loading ? (
          <div className="py-20 text-center text-sky-400 font-semibold text-sm">
            සේවා තොරතුරු පූරණය වෙමින් පවතී...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {services.map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: idx * 0.05 }}
                onClick={() => setSelectedServiceModal(service)}
                className="group relative aspect-square rounded-[26px] sm:rounded-[34px] p-3.5 sm:p-5 bg-gradient-to-b from-[#0a52a3] via-[#043372] to-[#011a40] border border-sky-400/35 hover:border-sky-300 shadow-[0_14px_35px_rgba(2,24,56,0.7),inset_0_1px_1.5px_rgba(255,255,255,0.4)] hover:shadow-[0_20px_50px_rgba(14,165,233,0.35),inset_0_1px_2px_rgba(255,255,255,0.6)] hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between select-none"
              >
                {/* Subtle Cyber Circuit Grid Background Pattern */}
                <div className="absolute inset-0 opacity-15 group-hover:opacity-25 transition-opacity pointer-events-none">
                  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id={`circuit-${service.id}`} width="50" height="50" patternUnits="userSpaceOnUse">
                        <path d="M 50 0 L 35 15 L 15 15 L 0 0" fill="none" stroke="#38bdf8" strokeWidth="0.8" opacity="0.6" />
                        <circle cx="35" cy="15" r="1.5" fill="#38bdf8" />
                        <path d="M 0 50 L 20 30 L 40 30" fill="none" stroke="#38bdf8" strokeWidth="0.8" opacity="0.6" />
                        <circle cx="20" cy="30" r="1.5" fill="#38bdf8" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#circuit-${service.id})`} />
                  </svg>
                </div>

                {/* Top Glowing Ambient Highlight */}
                <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-sky-300 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>

                {/* 3D Isometric Artwork (Takes 65% of Tile Height) */}
                <div className="relative z-10 flex-1 flex items-center justify-center pt-1 group-hover:scale-105 transition-transform duration-300">
                  <div className="w-[84%] sm:w-[88%] aspect-square flex items-center justify-center">
                    <img 
                      src={service.image} 
                      alt={service.title} 
                      className="w-full h-full object-contain rounded-2xl drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)]"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Bottom Text Area (English Title + Sinhala Subtitle) */}
                <div className="relative z-10 pt-2 pb-0.5 text-center">
                  <h3 className="text-xs sm:text-sm md:text-base font-black text-white tracking-tight leading-snug drop-shadow-md group-hover:text-sky-200 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs font-semibold text-sky-200/90 mt-0.5 sm:mt-1 truncate drop-shadow-sm">
                    {service.sinhala}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>

      {/* Service Details Modal (Opened on clicking any Square Tile) */}
      <AnimatePresence>
        {selectedServiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: 0.25 }}
              className="bg-[#0b1c36] border border-sky-400/30 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-[0_25px_60px_rgba(0,0,0,0.85)] relative max-h-[85vh] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between pb-4 border-b border-slate-700/80">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-400/30 p-1 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
                      <img 
                        src={selectedServiceModal.image} 
                        alt={selectedServiceModal.title} 
                        className="w-full h-full object-contain rounded-xl"
                      />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white">
                        {selectedServiceModal.title}
                      </h3>
                      <p className="text-xs text-sky-300 font-semibold">
                        {selectedServiceModal.sinhala}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedServiceModal(null)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="py-4 space-y-2.5 overflow-y-auto max-h-[48vh] no-scrollbar">
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {selectedServiceModal.description}
                  </p>

                  <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider mb-2">
                    ලබාගත හැකි ප්‍රධාන සේවාවන්:
                  </div>

                  {selectedServiceModal.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/70 border border-white/5 text-xs text-slate-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-semibold">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Bottom Actions */}
              <div className="pt-4 border-t border-slate-700/80 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedServiceModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
                >
                  Close (වසන්න)
                </button>

                <button
                  onClick={() => handleWhatsAppInquiry(selectedServiceModal.title)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all shadow-lg shadow-emerald-500/25 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-slate-950" />
                  <span>Order via WhatsApp (විමසන්න)</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
