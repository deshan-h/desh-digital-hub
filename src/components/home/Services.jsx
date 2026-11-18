import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { categoryService, settingsService } from '../../services/supabaseService';
import { 
  Sparkles, 
  CheckCircle2, 
  X, 
  MessageCircle, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';

// ==========================================
// BESPOKE 3D ISOMETRIC CATEGORY ILLUSTRATIONS
// Matching the uploaded 3D cyber-aesthetic tile
// ==========================================

function IsometricPrinter() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)]">
      {/* Ground Oval Shadow */}
      <ellipse cx="100" cy="162" rx="72" ry="20" fill="#000" opacity="0.35" filter="blur(6px)" />
      
      {/* Printer Base Body (Isometric) */}
      <g transform="translate(15, 20)">
        {/* Bottom output paper */}
        <polygon points="45,130 90,148 70,158 25,140" fill="#ffffff" />
        <polygon points="48,133 87,149 70,156 31,140" fill="#e2e8f0" />
        {/* Paper printed text lines */}
        <line x1="42" y1="139" x2="62" y2="147" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
        <line x1="47" y1="143" x2="72" y2="153" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />

        {/* Lower Main Unit */}
        {/* Left Face */}
        <polygon points="35,85 85,115 85,138 35,108" fill="#1e293b" />
        {/* Right Face */}
        <polygon points="85,115 135,85 135,108 85,138" fill="#334155" />
        {/* Top Face of lower unit */}
        <polygon points="35,85 85,55 135,85 85,115" fill="#f8fafc" />

        {/* Paper Tray Inset */}
        <polygon points="50,118 85,132 85,135 50,121" fill="#0f172a" />

        {/* Middle Scanner Deck */}
        <polygon points="30,70 85,40 140,70 85,100" fill="#0284c7" opacity="0.9" />
        {/* Scanner Glass Glow */}
        <polygon points="38,68 85,44 132,68 85,92" fill="#38bdf8" opacity="0.85" />
        <polygon points="45,67 85,48 125,67 85,86" fill="#e0f2fe" opacity="0.6" />

        {/* Top Feeder Unit */}
        <polygon points="42,50 85,25 128,50 85,75" fill="#f1f5f9" />
        <polygon points="42,50 85,75 85,82 42,57" fill="#cbd5e1" />
        <polygon points="85,75 128,50 128,57 85,82" fill="#94a3b8" />

        {/* Top Input Paper Stack */}
        <polygon points="60,28 85,14 110,28 85,42" fill="#ffffff" />
        <polygon points="63,30 85,18 107,30 85,42" fill="#f8fafc" />
        <line x1="72" y1="28" x2="98" y2="28" stroke="#cbd5e1" strokeWidth="1.5" />

        {/* Control Panel (Glowing Cyan Display) */}
        <polygon points="70,72 85,81 85,88 70,79" fill="#0f172a" />
        <polygon points="72,74 83,81 83,85 72,78" fill="#38bdf8" />
        {/* Control buttons */}
        <circle cx="95" cy="85" r="2.5" fill="#10b981" />
        <circle cx="102" cy="81" r="2" fill="#3b82f6" />
        <circle cx="108" cy="77" r="2" fill="#f59e0b" />
      </g>
    </svg>
  );
}

function IsometricLaminator() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)]">
      <ellipse cx="100" cy="160" rx="70" ry="18" fill="#000" opacity="0.35" filter="blur(6px)" />
      
      <g transform="translate(18, 25)">
        {/* Machine Main Body */}
        <polygon points="25,85 85,115 145,85 85,55" fill="#0284c7" />
        <polygon points="25,85 85,115 85,130 25,100" fill="#0369a1" />
        <polygon points="85,115 145,85 145,100 85,130" fill="#075985" />

        {/* Roller Feed Slot (Glowing Heat Core) */}
        <polygon points="38,82 85,102 132,82 85,62" fill="#0c4a6e" />
        <polygon points="42,82 85,100 128,82 85,64" fill="#f59e0b" opacity="0.75" />

        {/* Certificate Entering / Emerging (Laminated Shiny Sheet) */}
        <polygon points="45,45 85,25 125,45 85,65" fill="#ffffff" opacity="0.95" />
        <polygon points="45,95 85,115 125,95 85,75" fill="#38bdf8" opacity="0.45" stroke="#bae6fd" strokeWidth="1.5" />

        {/* Seal Stamp on Certificate */}
        <ellipse cx="85" cy="45" rx="8" ry="4" fill="#fbbf24" />
        <polygon points="55,50 75,60 70,62 50,52" fill="#94a3b8" opacity="0.6" />
        <polygon points="95,50 115,40 120,42 100,52" fill="#94a3b8" opacity="0.6" />

        {/* Temperature LED Indicators */}
        <circle cx="70" cy="115" r="2.5" fill="#10b981" />
        <circle cx="78" cy="119" r="2.5" fill="#38bdf8" />
        <circle cx="86" cy="123" r="2.5" fill="#f43f5e" />
      </g>
    </svg>
  );
}

function IsometricBinding() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)]">
      <ellipse cx="100" cy="162" rx="68" ry="18" fill="#000" opacity="0.35" filter="blur(6px)" />
      
      <g transform="translate(20, 22)">
        {/* Bottom Hardcover Book */}
        <polygon points="25,95 85,125 145,95 85,65" fill="#0369a1" />
        <polygon points="25,95 85,125 85,135 25,105" fill="#0284c7" />
        <polygon points="85,125 145,95 145,105 85,135" fill="#075985" />
        {/* Page edges */}
        <polygon points="32,97 85,122 85,128 32,103" fill="#f8fafc" />
        <polygon points="85,122 138,97 138,103 85,128" fill="#e2e8f0" />

        {/* Middle Spiral Notebook */}
        <polygon points="30,70 85,98 140,70 85,42" fill="#38bdf8" />
        <polygon points="30,70 85,98 85,106 30,78" fill="#0284c7" />
        <polygon points="85,98 140,70 140,78 85,106" fill="#0369a1" />

        {/* Spiral Comb Coil (Cyan rings) */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <ellipse 
            key={i} 
            cx={40 + i * 8.5} 
            cy={65 + i * 4.2} 
            rx="3" 
            ry="6" 
            fill="none" 
            stroke="#ffffff" 
            strokeWidth="2.2" 
          />
        ))}

        {/* Top Executive Thesis Hardcover */}
        <polygon points="40,40 85,18 130,40 85,62" fill="#0f172a" />
        <polygon points="40,40 85,62 85,68 40,46" fill="#1e293b" />
        <polygon points="85,62 130,40 130,46 85,68" fill="#020617" />
        {/* Gold Ribbon Bookmark */}
        <polygon points="82,45 88,42 94,58 88,55" fill="#f59e0b" />
        {/* Gold Title Foil */}
        <line x1="70" y1="36" x2="100" y2="28" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="75" y1="42" x2="95" y2="36" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function IsometricGraphicDesign() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)]">
      <ellipse cx="100" cy="162" rx="68" ry="18" fill="#000" opacity="0.35" filter="blur(6px)" />
      
      <g transform="translate(18, 20)">
        {/* Designer Tablet Base */}
        <polygon points="25,85 85,115 145,85 85,55" fill="#0f172a" />
        <polygon points="25,85 85,115 85,124 25,94" fill="#1e293b" />
        <polygon points="85,115 145,85 145,94 85,124" fill="#020617" />

        {/* High-res Screen with Graphic Layout */}
        <polygon points="32,83 85,108 138,83 85,58" fill="#0369a1" />
        
        {/* CV / Poster Layout Sheet on Screen */}
        <polygon points="45,78 85,98 115,83 75,63" fill="#ffffff" />
        <polygon points="52,76 75,87 75,72 52,61" fill="#38bdf8" />
        <line x1="80" y1="87" x2="105" y2="75" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
        <line x1="80" y1="91" x2="100" y2="81" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />

        {/* Color Palette Swatches */}
        <polygon points="120,70 128,66 128,72 120,76" fill="#f43f5e" />
        <polygon points="120,77 128,73 128,79 120,83" fill="#10b981" />
        <polygon points="120,84 128,80 128,86 120,90" fill="#f59e0b" />

        {/* Floating Stylus Pen */}
        <g transform="translate(95, 30) rotate(-25)">
          <rect x="0" y="0" width="8" height="45" rx="3" fill="#f8fafc" />
          <polygon points="0,45 8,45 4,55" fill="#0284c7" />
          <circle cx="4" cy="54" r="1.5" fill="#38bdf8" />
        </g>
      </g>
    </svg>
  );
}

function IsometricOnlineDesk() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)]">
      <ellipse cx="100" cy="162" rx="70" ry="18" fill="#000" opacity="0.35" filter="blur(6px)" />
      
      <g transform="translate(16, 20)">
        {/* Circular Hologram Base Ring */}
        <ellipse cx="85" cy="115" rx="60" ry="24" fill="#0284c7" opacity="0.35" />
        <ellipse cx="85" cy="115" rx="52" ry="20" fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.8" />
        
        {/* 3D Glowing Globe Core */}
        <circle cx="85" cy="72" r="34" fill="#0284c7" />
        {/* Globe Atmosphere Glow */}
        <circle cx="85" cy="72" r="34" fill="none" stroke="#38bdf8" strokeWidth="3" opacity="0.75" />
        
        {/* Globe Grid Lines */}
        <ellipse cx="85" cy="72" rx="34" ry="14" fill="none" stroke="#e0f2fe" strokeWidth="1.5" opacity="0.8" />
        <ellipse cx="85" cy="72" rx="14" ry="34" fill="none" stroke="#bae6fd" strokeWidth="1.5" opacity="0.7" />
        <line x1="85" y1="38" x2="85" y2="106" stroke="#e0f2fe" strokeWidth="1.5" opacity="0.8" />

        {/* Orbiting Satellite Data Ring */}
        <ellipse cx="85" cy="72" rx="48" ry="18" fill="none" stroke="#7dd3fc" strokeWidth="2" strokeDasharray="6 4" transform="rotate(-20 85 72)" />

        {/* Official Government Shield / Verified Check */}
        <g transform="translate(100, 75)">
          <polygon points="18,0 36,8 36,25 18,36 0,25 0,8" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
          <polyline points="7,17 14,24 28,10" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
    </svg>
  );
}

function IsometricPCRepair() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)]">
      <ellipse cx="100" cy="162" rx="70" ry="18" fill="#000" opacity="0.35" filter="blur(6px)" />
      
      <g transform="translate(18, 20)">
        {/* Computer Tower Chassis (Isometric) */}
        <polygon points="35,60 75,35 75,120 35,145" fill="#1e293b" />
        <polygon points="75,35 125,60 125,145 75,120" fill="#334155" />
        <polygon points="35,60 75,35 125,60 85,85" fill="#475569" />

        {/* Illuminated Transparent Glass Side Panel */}
        <polygon points="38,65 72,43 72,116 38,138" fill="#0284c7" opacity="0.45" stroke="#38bdf8" strokeWidth="1.5" />

        {/* Glowing RGB Fan inside */}
        <circle cx="55" cy="90" r="16" fill="#0f172a" />
        <circle cx="55" cy="90" r="14" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
        <circle cx="55" cy="90" r="6" fill="#f43f5e" />

        {/* RAM modules & GPU */}
        <line x1="58" y1="68" x2="68" y2="62" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
        <line x1="58" y1="74" x2="68" y2="68" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />

        {/* Front Panel Power LED */}
        <circle cx="100" cy="72" r="3" fill="#38bdf8" />
        <line x1="90" y1="85" x2="115" y2="100" stroke="#64748b" strokeWidth="2" />
        <line x1="90" y1="95" x2="115" y2="110" stroke="#64748b" strokeWidth="2" />

        {/* Precision Repair Screwdriver */}
        <g transform="translate(100, 30) rotate(40)">
          <rect x="0" y="0" width="10" height="30" rx="3" fill="#0284c7" />
          <rect x="3" y="30" width="4" height="35" fill="#94a3b8" />
          <polygon points="2,65 8,65 5,72" fill="#cbd5e1" />
        </g>
      </g>
    </svg>
  );
}

function IsometricDownloads() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)]">
      <ellipse cx="100" cy="162" rx="70" ry="18" fill="#000" opacity="0.35" filter="blur(6px)" />
      
      <g transform="translate(18, 20)">
        {/* Holographic Pedestal Platform */}
        <polygon points="30,105 85,135 140,105 85,75" fill="#0284c7" opacity="0.7" />
        <polygon points="30,105 85,135 85,145 30,115" fill="#0369a1" />
        <polygon points="85,135 140,105 140,115 85,145" fill="#075985" />
        <polygon points="38,103 85,128 132,103 85,78" fill="#38bdf8" opacity="0.5" />

        {/* Floating Cyber Cloud */}
        <g transform="translate(48, 35)">
          <path 
            d="M25,45 A16,16 0 0,1 42,20 A24,24 0 0,1 78,25 A18,18 0 0,1 92,45 Z" 
            fill="#ffffff" 
            filter="drop-shadow(0 8px 16px rgba(56,189,248,0.4))"
          />
        </g>

        {/* High-Speed Download Arrow */}
        <g transform="translate(73, 50)">
          <polygon points="12,0 24,0 24,22 34,22 18,38 2,22 12,22" fill="#0284c7" stroke="#ffffff" strokeWidth="2.5" />
        </g>

        {/* USB Flash Drive */}
        <g transform="translate(100, 100) rotate(-15)">
          <rect x="0" y="0" width="12" height="28" rx="2" fill="#0f172a" />
          <rect x="2" y="28" width="8" height="10" fill="#94a3b8" />
          <circle cx="6" cy="10" r="2" fill="#38bdf8" />
        </g>
      </g>
    </svg>
  );
}

function IsometricGenericHub() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)]">
      <ellipse cx="100" cy="162" rx="70" ry="18" fill="#000" opacity="0.35" filter="blur(6px)" />
      <g transform="translate(20, 20)">
        <polygon points="30,85 85,115 140,85 85,55" fill="#0284c7" />
        <polygon points="30,85 85,115 85,130 30,100" fill="#0369a1" />
        <polygon points="85,115 140,85 140,100 85,130" fill="#075985" />
        <polygon points="40,82 85,105 130,82 85,59" fill="#38bdf8" opacity="0.8" />
        
        {/* Floating Solution Cube */}
        <g transform="translate(60, 20)">
          <polygon points="25,25 50,10 75,25 50,40" fill="#ffffff" />
          <polygon points="25,25 50,40 50,65 25,50" fill="#38bdf8" />
          <polygon points="50,40 75,25 75,50 50,65" fill="#0284c7" />
        </g>
      </g>
    </svg>
  );
}

// Helper to choose the right 3D illustration based on category title/icon
function getCategoryIllustration(category) {
  const name = (category.displayName || category.category || '').toLowerCase();
  const icon = (category.icon || '').toLowerCase();

  if (name.includes('print') || name.includes('scan') || icon.includes('print')) {
    return <IsometricPrinter />;
  }
  if (name.includes('laminat') || icon.includes('layer')) {
    return <IsometricLaminator />;
  }
  if (name.includes('bind') || name.includes('book') || icon.includes('book') || icon.includes('file')) {
    return <IsometricBinding />;
  }
  if (name.includes('type') || name.includes('cv') || name.includes('design') || icon.includes('type') || icon.includes('palette')) {
    return <IsometricGraphicDesign />;
  }
  if (name.includes('online') || name.includes('gov') || name.includes('app') || icon.includes('globe')) {
    return <IsometricOnlineDesk />;
  }
  if (name.includes('repair') || name.includes('pc') || name.includes('laptop') || name.includes('hardware') || icon.includes('wrench')) {
    return <IsometricPCRepair />;
  }
  if (name.includes('download') || name.includes('media') || name.includes('song') || icon.includes('download')) {
    return <IsometricDownloads />;
  }
  return <IsometricGenericHub />;
}

// Helper for Category English & Sinhala bilingual labels
function getCategoryDisplayMeta(category) {
  const raw = (category.displayName || category.category || '').trim();
  const lower = raw.toLowerCase();

  if (lower.includes('print') || lower.includes('scan')) {
    return { title: 'Print & Scan', sinhala: 'මුද්‍රණය සහ ස්කෑන් කිරීම' };
  }
  if (lower.includes('laminat')) {
    return { title: 'Document Laminating', sinhala: 'ලැමිනේටින් සේවා' };
  }
  if (lower.includes('bind')) {
    return { title: 'Book Binding', sinhala: 'පොත් බැඳීම සහ බයින්ඩින්' };
  }
  if (lower.includes('type') || lower.includes('graphic')) {
    return { title: 'Type Setting & Design', sinhala: 'ටයිප් සෙටින්ග් සහ නිර්මාණ' };
  }
  if (lower.includes('online') || lower.includes('gov')) {
    return { title: 'Online & Gov Services', sinhala: 'මාර්ගගත සහ රජයේ සේවා' };
  }
  if (lower.includes('repair') || lower.includes('computer') || lower.includes('laptop')) {
    return { title: 'PC & Laptop Repairing', sinhala: 'පරිගණක අලුත්වැඩියාව' };
  }
  if (lower.includes('download') || lower.includes('media')) {
    return { title: 'Downloads & Media', sinhala: 'ඩිජිටල් මාධ්‍ය සහ ඩවුන්ලෝඩ්' };
  }

  return { title: raw, sinhala: 'විශ්වාසනීය ඩිජිටල් සේවා' };
}

export default function Services() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedServiceModal, setSelectedServiceModal] = useState(null);

  useEffect(() => {
    async function fetchServices() {
      try {
        const [categoriesData, hiddenIds] = await Promise.all([
          categoryService.getCategories(),
          settingsService.getPublicCategoryVisibility().catch(() => [])
        ]);

        let data = (categoriesData || []).filter(cat => cat.category !== 'Custom & Utilities');
        data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        // Add PC Repairs as a dedicated service category
        const allServices = [
          ...data,
          {
            id: 'pc-repairs',
            category: 'Computer Repairing',
            displayName: 'Computer & Laptop Repairing',
            icon: 'Wrench',
            color: 'text-amber-400',
            description: 'Professional hardware diagnostics, laptop servicing, motherboard repairs, Windows OS formatting, and high-speed SSD upgrades.',
            items: [
              { name: 'Hardware Diagnostics & Fault Checking' },
              { name: 'Windows OS Formatting & Essential Setup' },
              { name: 'Virus Removal & Deep System Cleaning' },
              { name: 'RAM & High-Speed SSD Installation' },
              { name: 'Thermal Paste Servicing & Fan Cleaning' },
              { name: 'Driver & Software Troubleshooting' }
            ]
          }
        ];

        // Filter out categories hidden by Admin in Settings
        const visibleServices = allServices.filter(
          cat => !hiddenIds.includes(cat.id) && !hiddenIds.includes(cat.category)
        );

        setCategories(visibleServices);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
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
        {/* MAIN CATEGORIES ONLY: 1:1 SQUARE TILES (HATHARES TILES)  */}
        {/* Matching the uploaded sapphire cyber 3D design template  */}
        {/* ======================================================== */}
        {loading ? (
          <div className="py-20 text-center text-sky-400 font-semibold text-sm">
            සේවා තොරතුරු පූරණය වෙමින් පවතී...
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm border border-dashed border-slate-800 rounded-3xl bg-[#081528]/40">
            සේවා කාණ්ඩ කිසිවක් හමු නොවීය.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {categories.map((service, idx) => {
              const meta = getCategoryDisplayMeta(service);
              const illustration = getCategoryIllustration(service);

              return (
                <motion.div
                  key={service.id || idx}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: idx * 0.06 }}
                  onClick={() => setSelectedServiceModal(service)}
                  className="group relative aspect-square rounded-[26px] sm:rounded-[34px] p-4 sm:p-6 bg-gradient-to-b from-[#0a52a3] via-[#043372] to-[#011a40] border border-sky-400/35 hover:border-sky-300 shadow-[0_14px_35px_rgba(2,24,56,0.7),inset_0_1px_1.5px_rgba(255,255,255,0.4)] hover:shadow-[0_20px_50px_rgba(14,165,233,0.35),inset_0_1px_2px_rgba(255,255,255,0.6)] hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between select-none"
                >
                  {/* Subtle Cyber Circuit Grid Background Pattern */}
                  <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id={`circuit-${idx}`} width="50" height="50" patternUnits="userSpaceOnUse">
                          <path d="M 50 0 L 35 15 L 15 15 L 0 0" fill="none" stroke="#38bdf8" strokeWidth="0.8" opacity="0.6" />
                          <circle cx="35" cy="15" r="1.5" fill="#38bdf8" />
                          <path d="M 0 50 L 20 30 L 40 30" fill="none" stroke="#38bdf8" strokeWidth="0.8" opacity="0.6" />
                          <circle cx="20" cy="30" r="1.5" fill="#38bdf8" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill={`url(#circuit-${idx})`} />
                    </svg>
                  </div>

                  {/* Top Glowing Ambient Highlight */}
                  <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-sky-300 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>

                  {/* 3D Isometric Artwork (Takes 65% of Tile Height) */}
                  <div className="relative z-10 flex-1 flex items-center justify-center pt-1 group-hover:scale-110 transition-transform duration-300">
                    <div className="w-[82%] sm:w-[86%] aspect-square flex items-center justify-center">
                      {illustration}
                    </div>
                  </div>

                  {/* Bottom Text Area (English Title + Sinhala Subtitle) */}
                  <div className="relative z-10 pt-2 pb-1 text-center">
                    <h3 className="text-sm sm:text-base md:text-lg font-black text-white tracking-tight leading-snug drop-shadow-md group-hover:text-sky-200 transition-colors">
                      {meta.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs font-semibold text-sky-200/90 mt-0.5 sm:mt-1 truncate drop-shadow-sm">
                      {meta.sinhala}
                    </p>
                  </div>
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
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-400/30 p-1 flex items-center justify-center shadow-inner">
                      {getCategoryIllustration(selectedServiceModal)}
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white">
                        {getCategoryDisplayMeta(selectedServiceModal).title}
                      </h3>
                      <p className="text-xs text-sky-300 font-semibold">
                        {getCategoryDisplayMeta(selectedServiceModal).sinhala}
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
                    {selectedServiceModal.description || 'මෙම සේවා අංශය යටතේ DESH Digital Hub මගින් ලබාගත හැකි සේවාවන්:'}
                  </p>

                  {(selectedServiceModal.items || []).length > 0 ? (
                    (selectedServiceModal.items || []).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/70 border border-white/5 text-xs text-slate-200"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-semibold">{item.name}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 text-xs text-slate-300">
                      විස්තර සහ ඇණවුම් සඳහා අපගේ WhatsApp අංකය අමතන්න.
                    </div>
                  )}
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
                  onClick={() => handleWhatsAppInquiry(selectedServiceModal.displayName || selectedServiceModal.category)}
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
