import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { FcPackage, FcPrint, FcTemplate, FcDocument, FcRules, FcImageFile, FcDataBackup, FcCommandLine, FcSettings, FcGlobe } from 'react-icons/fc';

const ICON_MAP = {
  'Package': FcPackage,
  'Printer': FcPrint,
  'Layers': FcTemplate,
  'FileText': FcDocument,
  'Type': FcRules,
  'Image': FcImageFile,
  'Download': FcDataBackup,
  'Code': FcCommandLine,
  'Settings': FcSettings,
  'Globe': FcGlobe
};

const CATEGORY_META = {
  'Printing & Scanning': {
    name: 'මුද්‍රණ සහ ස්කෑන් සේවා',
    description: 'උසස් තත්ත්වයේ මුද්‍රණ (Printing) සහ ලිපිලේඛන ස්කෑන් කිරීමේ සේවාවන්.',
    colorClass: 'text-blue-400'
  },
  'Document Laminating': {
    name: 'ලැමිනේටින් සේවා',
    description: 'ඔබේ වටිනා සහතිකපත් සහ හැඳුනුම්පත් ආරක්ෂා කරගැනීමට උසස් ලැමිනේටින් සේවාව.',
    colorClass: 'text-emerald-400'
  },
  'Book Binding': {
    name: 'පොත් බඳින සේවා (Book Binding)',
    description: 'වාර්තා, පැවරුම් (Assignments) සහ පොත් සඳහා වෘත්තීය මට්ටමේ බයින්ඩිං සේවාවන්.',
    colorClass: 'text-orange-400'
  },
  'Type Setting': {
    name: 'ග්‍රැෆික් නිර්මාණ (Graphic Design)',
    description: 'ඔබගේ ව්‍යාපාරයට, උත්සව වලට සහ පුද්ගලික අවශ්‍යතා සඳහා නිර්මාණාත්මක ග්‍රැෆික් නිර්මාණ.',
    colorClass: 'text-pink-400'
  },
  'Online Services': {
    name: 'මාර්ගගත සේවා (Online Services)',
    description: 'රජයේ අයදුම්පත්, වීසා පෝරම සහ විභාග අයදුම්පත් මාර්ගගතව (Online) යැවීම සඳහා විශ්වාසදායී සේවාව.',
    colorClass: 'text-purple-400'
  },
  'Downloads & Media': {
    name: 'ඩවුන්ලෝඩ් සේවා',
    description: 'නවීන චිත්‍රපට, පරිගණක ක්‍රීඩා සහ මෘදුකාංග (Software) ඉක්මනින් ඩවුන්ලෝඩ් කරගැනීමේ පහසුකම.',
    colorClass: 'text-yellow-400'
  },
  'Custom & Utilities': {
    name: 'පරිගණක අලුත්වැඩියාව',
    description: 'පරිගණක සහ ලැප්ටොප් දෝෂ පරික්ෂා කිරීම සහ අලුත්වැඩියාව.',
    colorClass: 'text-red-400'
  }
};

export default function Services() {
  const [activeService, setActiveService] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      try {
        const snap = await getDocs(collection(db, 'pos_categories'));
        let data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Hide "Custom & Utilities" from the public frontend
        data = data.filter(cat => cat.category !== 'Custom & Utilities');

        data.sort((a, b) => {
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order;
          }
          return 0;
        });

        const mappedServices = data.map(cat => {
          const meta = CATEGORY_META[cat.category] || {
            description: 'Specialized services from DESH Digital Hub.',
            colorClass: cat.color || 'text-cyan-400'
          };
          
          return {
            ...cat,
            displayName: cat.category, // ALWAYS use the name from Firestore
            description: meta.description,
            colorClass: meta.colorClass,
            iconName: cat.category === 'Online Services' ? 'Globe' : (cat.icon || 'Package')
          };
        });

        const hardcodedServices = [
          {
            id: 'hc-repair',
            category: 'Computer Repairing',
            displayName: 'Computer Repairing',
            description: 'Professional computer and laptop repair services, troubleshooting, and hardware upgrades.',
            colorClass: 'text-orange-400',
            iconName: 'Wrench',
            items: []
          },
          {
            id: 'hc-software',
            category: 'Software Development',
            displayName: 'Software Development',
            description: 'Custom software solutions, web applications, and mobile apps tailored to your business needs.',
            colorClass: 'text-blue-400',
            iconName: 'Code',
            items: []
          }
        ];

        const allServices = [...mappedServices, ...hardcodedServices];
        setServices(allServices);
        
        if (allServices.length > 0) {
          setActiveService(0);
        }
      } catch (error) {
        console.error("Error fetching services: ", error);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  const [activeServiceId, setActiveServiceId] = useState(null);

  useEffect(() => {
    if (services.length > 0 && !activeServiceId) {
      setActiveServiceId(services[0].id);
    }
  }, [services, activeServiceId]);

  const scrollContainerRef = React.useRef(null);
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = current.clientWidth >= 768 ? current.clientWidth * 0.5 : current.clientWidth * 0.9;
      current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div id="services" className="w-full max-w-6xl mt-4 pt-8 border-t border-white/5 container mx-auto px-4 text-center text-cyan-400">
        Loading Services...
      </div>
    );
  }

  return (
    <div id="services" className="w-full max-w-[1400px] mt-12 pt-16 border-t border-white/5 container mx-auto px-4 z-10 relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10 md:mb-16"
      >
        <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-lg">
          අපගේ <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">ප්‍රධාන සේවාවන්</span>
        </h2>
        <div className="h-1.5 w-24 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full mb-6 shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto font-medium">
          වැඩි විස්තර සහ මිල ගණන් දැනගැනීමට අදාළ සේවාව තෝරන්න
        </p>
      </motion.div>

      {/* Quick Navigation Slider */}
      <div className="flex flex-wrap gap-3 mb-8 justify-center px-4 w-full max-w-4xl mx-auto">
        {services.map((service) => {
          const IconCmp = ICON_MAP[service.iconName] || FcPackage;
          const isActive = activeServiceId === service.id;
          
          return (
            <button
              key={`nav-${service.id}`}
              onClick={() => {
                setActiveServiceId(service.id);
                const el = document.getElementById(`card-${service.id}`);
                if (el && scrollContainerRef.current) {
                  const container = scrollContainerRef.current;
                  const scrollLeft = el.offsetLeft - container.offsetLeft - (container.clientWidth / 2) + (el.clientWidth / 2);
                  container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
                }
              }}
              className={`flex items-center justify-center gap-2 whitespace-nowrap p-3 md:px-5 md:py-2.5 rounded-full border transition-all duration-300 shadow-md aspect-square md:aspect-auto ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                  : 'bg-slate-900 border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:text-cyan-400 hover:border-cyan-500/50'
              }`}
            >
              <IconCmp className="w-6 h-6 md:w-5 md:h-5" />
              <span className="hidden md:inline">{service.displayName}</span>
            </button>
          );
        })}
      </div>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(34, 211, 238, 0.2); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(34, 211, 238, 0.5); }
      `}</style>
      
      <div className="relative w-full group">
        
        {/* Navigation Arrows */}
        <button 
          onClick={() => scroll('left')} 
          className="absolute -left-2 md:-left-6 top-1/2 -translate-y-1/2 z-50 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-slate-800 transition-all shadow-xl opacity-0 group-hover:opacity-100"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>

        <button 
          onClick={() => scroll('right')} 
          className="absolute -right-2 md:-right-6 top-1/2 -translate-y-1/2 z-50 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-slate-800 transition-all shadow-xl opacity-0 group-hover:opacity-100"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </button>

        {/* Carousel Container */}
        <div ref={scrollContainerRef} className="flex overflow-x-auto gap-6 md:gap-8 snap-x snap-mandatory scroll-smooth hide-scrollbar px-2 md:px-6 pb-10 pt-4">
          
          {services.map((service, idx) => {
            const IconCmp = ICON_MAP[service.iconName] || FcPackage;
            const isCardActive = activeServiceId === service.id;
            
            return (
              <motion.div 
                id={`card-${service.id}`}
                key={service.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`snap-center shrink-0 w-[95%] sm:w-[80%] md:w-[600px] bg-[#0f172a] rounded-[2rem] p-6 md:p-10 flex flex-col h-[550px] md:h-[650px] hover:border-cyan-500/40 transition-all duration-500 group/card relative overflow-hidden ${
                  isCardActive 
                    ? 'border-2 border-cyan-400 shadow-[0_0_40px_-10px_rgba(34,211,238,0.4)]' 
                    : 'border border-slate-800/80 hover:shadow-[0_20px_60px_-15px_rgba(8,145,178,0.2)]'
                }`}
              >
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none group-hover/card:bg-cyan-500/10 transition-colors duration-500"></div>
                
                {/* Header Section */}
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] md:text-xs text-slate-300 border border-slate-700/60 px-4 py-1.5 rounded-full font-semibold tracking-wide bg-slate-900/50 backdrop-blur-md">
                      {service.id?.startsWith('hc-') ? 'Featured Service' : 'Standard Service'}
                    </span>
                  </div>
                  <div className="text-slate-600 group-hover/card:text-cyan-500/40 transition-colors">
                    <IconCmp className="w-8 h-8 opacity-50 grayscale group-hover/card:grayscale-0 transition-all" />
                  </div>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight tracking-tight drop-shadow-sm relative z-10">{service.displayName}</h3>
                
                <p className="text-slate-400 text-sm md:text-base mb-8 leading-relaxed font-medium relative z-10 flex-shrink-0">
                  {service.description}
                </p>
                
                {/* Items Section Header */}
                <div className="flex items-center gap-2 text-[11px] md:text-xs font-bold text-slate-300 uppercase tracking-[0.2em] mb-6 relative z-10">
                  <span className="text-cyan-400 text-base leading-none">&lt;/&gt;</span> SERVICES & PRICES
                </div>
                
                {/* Scrollable Items List (Grid Layout) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 pr-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    {service.items && service.items.map((item, i) => (
                      <div 
                        key={i} 
                        className="flex flex-col justify-between bg-slate-800/40 backdrop-blur-md p-4 rounded-2xl border border-white/5 hover:border-cyan-400/50 hover:bg-slate-800/80 transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] group/item"
                      >
                        <span className="text-slate-200 text-sm font-semibold group-hover/item:text-white transition-colors mb-3 leading-tight">{item.name}</span>
                        <span className="text-cyan-400 text-xs font-black self-start bg-slate-900/80 px-3 py-1.5 rounded-lg border border-cyan-500/30 shadow-inner">
                          {item.price !== undefined ? `${Number(item.price).toFixed(2)} LKR` : 'Custom Price'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {(!service.items || service.items.length === 0) && (
                    <div className="text-slate-500 italic text-sm py-4 text-center bg-slate-800/20 rounded-2xl border border-dashed border-slate-700/50">
                      No specific packages listed. Please contact us for custom requirements.
                    </div>
                  )}
                </div>

                {/* Conditional WhatsApp Button at bottom */}
                {(service.displayName === 'පරිගණක අලුත්වැඩියාව' || service.id?.startsWith('hc-')) && (
                  <div className="pt-6 mt-4 border-t border-slate-800/50 relative z-10 shrink-0">
                    <a 
                      href={`https://wa.me/94719989000?text=Hello%20DESH%20Digital%20Hub,%20I%20need%20details%20about%20${encodeURIComponent(service.displayName)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-slate-800/80 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 border border-slate-700 hover:border-emerald-500/50 font-bold py-3.5 rounded-xl transition-all duration-300 text-sm"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                      Contact via WhatsApp
                    </a>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
