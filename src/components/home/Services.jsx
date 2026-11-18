import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { settingsService } from '../../services/supabaseService';
import { 
  Sparkles, 
  CheckCircle2, 
  X, 
  MessageCircle, 
  ArrowRight
} from 'lucide-react';

// ========================================================
// THE 12 CORE SERVICES (SPLIT & ENRICHED WITH 3D ISOMETRIC ART)
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
      { name: 'Thermal Paste Servicing & Fan Cleaning' },
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
      { name: 'Double-Sided (Duplex) Duplication' }
    ]
  },
  {
    id: 'laminating',
    title: 'Document Laminating',
    sinhala: 'ලැමිනේටින් සේවා',
    image: '/images/services/laminating.jpg',
    description: 'ජාතික හැඳුනුම්පත් (NIC), A4, Legal, A3 ප්‍රමාණයේ වැදගත් සහතික සහ ලේඛන කල්පවත්නා ලෙස Thermal Laminating කිරීම.',
    items: [
      { name: 'NIC & Driving License Thermal Lamination' },
      { name: 'A4 & Legal Document Heavy Protection' },
      { name: 'A3 Certificate & Chart Lamination' },
      { name: 'High Gloss Crystal-Clear Pouch Sealing' },
      { name: 'Moisture, Dust & UV Fade Proof Coating' }
    ]
  },
  {
    id: 'book-binding',
    title: 'Book Binding',
    sinhala: 'පොත් බයින්ඩින් සේවා',
    image: '/images/services/book_binding.jpg',
    description: 'පාසල් හා විශ්වවිද්‍යාල නිබන්ධන, ව්‍යාපෘති වාර්තා සහ පොත් සඳහා Plastic Spiral, Comb, Tape සහ Hardcover බයින්ඩින්.',
    items: [
      { name: 'Plastic Spiral & Wire-O Metal Binding' },
      { name: 'Executive Comb & Tape Binding' },
      { name: 'Project Reports & Thesis Hardcover Binding' },
      { name: 'Transparent Frosted/Gloss Cover Sheets' },
      { name: 'Gold & Silver Foil Title Embossing' }
    ]
  },
  {
    id: 'document-scanning',
    title: 'Document Scanning',
    sinhala: 'ලේඛන ස්කෑන් කිරීම',
    image: '/images/services/document_scanning.jpg',
    description: 'ඔබගේ සහතික, අත්සන්, ඡායාරූප සහ වැදගත් ලේඛන 600+ DPI උසස් පැහැදිලි බවකින් යුතුව PDF හෝ JPG ලෙස ඩිජිටල්කරණය කිරීම.',
    items: [
      { name: 'High-Resolution Optical Scanning (600+ DPI)' },
      { name: 'Multi-Page Merged PDF Document Creation' },
      { name: 'Biometric Photos & Signature Digitalization' },
      { name: 'OCR Searchable PDF File Generation' },
      { name: 'Immediate Cloud & USB Storage Loading' }
    ]
  },
  {
    id: 'email-services',
    title: 'Email & Internet Services',
    sinhala: 'ඊ-මේල් සේවා',
    image: '/images/services/email_services.jpg',
    description: 'විශ්වාසදායී ලෙස ඊ-මේල් පණිවිඩ යැවීම, ලේඛන ඇමුණුම් පරීක්ෂාව සහ ආරක්ෂිත ඩිජිටල් සන්නිවේදන විසඳුම්.',
    items: [
      { name: 'Official Email Composition & Fast Dispatch' },
      { name: 'Secure Document Dispatch & Cloud Links' },
      { name: 'Incoming Mail Checking & Quick Printouts' },
      { name: 'Job Application & Resume Direct HR Sending' },
      { name: 'Digital File Verification & Compressing' }
    ]
  },
  {
    id: 'online-applications',
    title: 'Online Applications',
    sinhala: 'මාර්ගගත අයදුම් පත්‍ර',
    image: '/images/services/online_applications.jpg',
    description: 'විශ්වවිද්‍යාල, විභාග, රියදුරු බලපත්‍ර, ආදායම් බලපත්‍ර සහ රජයේ සියලුම මාර්ගගත අයදුම්පත් නිවැරදිව පිරවීම.',
    items: [
      { name: 'University & Examination Registrations' },
      { name: 'Vehicle Revenue License Online Renewal' },
      { name: 'Passport & Driving License Appointment Forms' },
      { name: 'Government Vacancy & Gazette Submissions' },
      { name: 'State Portal & Digital Identity Setup' }
    ]
  },
  {
    id: 'media-downloads',
    title: 'Entertainment & Downloads',
    sinhala: 'චිත්‍රපට, ගීත, වීඩියෝ, මෘදුකාංග ඩවුන්ලෝඩ්',
    image: '/images/services/media_downloads.jpg',
    description: 'චිත්‍රපට, ගීත ඇල්බම්, වීඩියෝ, අත්‍යවශ්‍ය පරිගණක මෘදුකාංග සහ ක්‍රීඩා අධිවේගී ඩවුන්ලෝඩ්.',
    items: [
      { name: 'Sinhala, English & Tamil MP3 Song Collections' },
      { name: 'Full HD Movies & High Quality Series' },
      { name: 'Essential Windows Utility Software Packages' },
      { name: 'Offline PC Games & High-Speed Media Loading' },
      { name: 'Educational Documentaries & Revision Media' }
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
      { name: 'Business Cards & Office Identity Tags' },
      { name: 'Flyers, Posters & Leaflet Graphic Design' },
      { name: 'Social Media Facebook & Instagram Graphics' },
      { name: 'Product Labels, Covers & Custom Stickers' }
    ]
  },
  {
    id: 'bill-payments',
    title: 'Utility Bill Payments',
    sinhala: 'බිල්පත් ගෙවීම්',
    image: '/images/services/bill_payments.jpg',
    description: 'විදුලි, ජල, ස්ථාවර දුරකථන සහ රක්ෂණ බිල්පත් කඩිනමින් සහ විශ්වාසදායී රිසිට්පත් සහිතව ක්ෂණිකව ගෙවීම.',
    items: [
      { name: 'CEB & LECO Electricity Bill Settlement' },
      { name: 'National Water Supply & Drainage Board Bills' },
      { name: 'SLT Megaline & Fibre Broadband Postpaid Bills' },
      { name: 'Dialog, Mobitel, Airtel, Hutch Postpaid Bills' },
      { name: 'Instant Electronic Verified Payment Receipts' }
    ]
  },
  {
    id: 'reloads-packages',
    title: 'Mobile Reloads & Packages',
    sinhala: 'පැකේජ සක්‍රිය කිරීම් සහ Reload',
    image: '/images/services/mobile_reloads.jpg',
    description: 'සියලුම දුරකථන ජාල සඳහා Reloads, 4G/5G Data Plans, Unlimited Voice Plans සහ DTV නාලිකා සක්‍රිය කිරීම්.',
    items: [
      { name: 'Instant Mobile Reloads for All Networks' },
      { name: 'Monthly & Weekly High-Speed Data Packs' },
      { name: 'Unlimited YouTube & Social Media Bundles' },
      { name: 'Dialog Television & DTV Channel Top-ups' },
      { name: 'International Calling Cards & Roaming Reloads' }
    ]
  },
  {
    id: 'web-development',
    title: 'Web Application Development',
    sinhala: 'වෙබ් අඩවි සහ මෘදුකාංග නිර්මාණය',
    image: '/images/services/web_development.jpg',
    description: 'නවීන තාක්ෂණයෙන් යුත් Responsive වෙබ් අඩවි, Cloud Management Systems සහ E-Commerce විසඳුම් සැලසුම් කිරීම.',
    items: [
      { name: 'Custom Business & Portfolio Websites' },
      { name: 'Modern React & Node.js Cloud Web Apps' },
      { name: 'E-Commerce Online Stores & Payment Gateways' },
      { name: 'Cloud Inventory & Database Management Portals' },
      { name: 'Search Engine Optimization (SEO) & Fast Hosting' }
    ]
  }
];

export default function Services() {
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [loading, setLoading] = useState(true);
  const [selectedServiceModal, setSelectedServiceModal] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [cycleIndex, setCycleIndex] = useState(0);

  // Load hidden/visible state from Supabase if configured in Admin
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

  // Idle cycle: Automatically alternate hover description overlay among tiles every 3 seconds
  useEffect(() => {
    if (hoveredId !== null) return; // Pause cycling while user is hovering manually
    if (!services || services.length === 0) return;

    const interval = setInterval(() => {
      setCycleIndex((prev) => (prev + 1) % services.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [hoveredId, services.length]);

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
        {/* 1:1 SQUARE TILES (FULL IMAGE BOX + DARK GRADIENT FADE)    */}
        {/* Hover description overlay + idle rotating auto-cycle     */}
        {/* ======================================================== */}
        {loading ? (
          <div className="py-20 text-center text-sky-400 font-semibold text-sm">
            සේවා තොරතුරු පූරණය වෙමින් පවතී...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-7">
            {services.map((service, idx) => {
              // Active overlay is either explicitly hovered by the user or chosen by the idle rotation
              const isOverlayActive = hoveredId !== null 
                ? hoveredId === service.id 
                : cycleIndex === idx;

              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: idx * 0.04 }}
                  onMouseEnter={() => setHoveredId(service.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => setSelectedServiceModal(service)}
                  className="group relative aspect-square rounded-[24px] sm:rounded-[30px] overflow-hidden border border-white/10 hover:border-sky-400/60 shadow-[0_12px_35px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_50px_rgba(14,165,233,0.3)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer select-none bg-[#050c18] isolate"
                >
                  {/* Full Box Edge-to-Edge Image */}
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108 block"
                    loading="lazy"
                  />

                  {/* Bottom Dark Gradient Fade for Text */}
                  <div className={`absolute inset-x-0 bottom-0 pt-16 pb-3.5 sm:pb-4 px-3 sm:px-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent text-center z-10 pointer-events-none transition-opacity duration-300 ${isOverlayActive ? 'opacity-0' : 'opacity-100'}`}>
                    <h3 className="text-xs sm:text-sm md:text-base font-black text-white tracking-tight leading-snug drop-shadow-md">
                      {service.title}
                    </h3>
                    <p className="text-[10px] sm:text-xs font-semibold text-sky-300/90 mt-0.5 truncate drop-shadow-sm">
                      {service.sinhala}
                    </p>
                  </div>

                  {/* Hover / Auto-Cycling Description Overlay Covering the FULL Tile Seamlessly */}
                  <div 
                    className={`absolute inset-0 w-full h-full rounded-[24px] sm:rounded-[30px] bg-[#050c18]/95 backdrop-blur-md p-4 sm:p-5 flex flex-col justify-between z-20 text-left transition-opacity duration-300 border border-sky-400/40 shadow-inner ${
                      isOverlayActive 
                        ? 'opacity-100 pointer-events-auto' 
                        : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] sm:text-[11px] font-bold text-sky-400 uppercase tracking-wider block mb-1 truncate">
                        {service.sinhala}
                      </span>
                      <h4 className="text-xs sm:text-sm md:text-base font-black text-white leading-snug tracking-tight">
                        {service.title}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-300 mt-2 line-clamp-3 sm:line-clamp-4 leading-relaxed font-medium">
                        {service.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-sky-300 text-[11px] sm:text-xs font-bold">
                      <span>විස්තර බලන්න</span>
                      <ArrowRight className="w-3.5 h-3.5 text-sky-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Subtle Top Glow Border (Only visible when overlay is inactive) */}
                  <div className={`absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-sky-300 to-transparent transition-opacity z-10 ${isOverlayActive ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`} />
                </motion.div>
              );
            })}
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
                    <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-400/30 overflow-hidden shrink-0 shadow-inner">
                      <img 
                        src={selectedServiceModal.image} 
                        alt={selectedServiceModal.title} 
                        className="w-full h-full object-cover"
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
