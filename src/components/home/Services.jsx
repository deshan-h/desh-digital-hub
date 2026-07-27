import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { FcPackage, FcPrint, FcTemplate, FcDocument, FcRules, FcImageFile, FcDataBackup, FcCommandLine, FcSettings } from 'react-icons/fc';

const ICON_MAP = {
  'Package': FcPackage,
  'Printer': FcPrint,
  'Layers': FcTemplate,
  'FileText': FcDocument,
  'Type': FcRules,
  'Image': FcImageFile,
  'Download': FcDataBackup,
  'Code': FcCommandLine,
  'Settings': FcSettings
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
            iconName: cat.icon || 'Package'
          };
        });

        setServices(mappedServices);
        if (mappedServices.length > 0) {
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

  if (loading) {
    return (
      <div id="services" className="w-full max-w-6xl mt-4 pt-8 border-t border-white/5 container mx-auto px-4 text-center text-cyan-400">
        Loading Services...
      </div>
    );
  }

  return (
    <div id="services" className="w-full max-w-6xl mt-4 pt-8 border-t border-white/5 container mx-auto px-4 z-10 relative">
      <h3 className="text-cyan-400 font-bold mb-4 md:mb-8 uppercase tracking-widest text-sm text-center drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">අපගේ ප්‍රධාන සේවාවන්</h3>
      <p className="text-slate-400 text-sm mb-2 md:mb-6 text-center font-medium">වැඩි විස්තර සහ මිල ගණන් දැනගැනීමට අදාළ සේවාව මත ක්ලික් කරන්න</p>
      
      {/* 1. Wrapped Category Tiles */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="flex overflow-x-auto hide-scrollbar justify-between gap-2 md:gap-4 w-full -mb-[1px] items-end relative z-20 pt-4">
        {services.map((service, idx) => {
          const isActive = activeService === idx;
          const IconCmp = ICON_MAP[service.iconName] || FcPackage;
          
          return (
            <motion.div 
              key={service.id} 
              onClick={() => setActiveService(idx)}
              className={`cursor-pointer flex flex-col items-center justify-center group relative flex-shrink-0 min-w-[105px] flex-1 h-32 sm:h-32 md:h-40 p-2 md:p-4 ${isActive ? 'z-30' : 'z-10 hover:z-20'}`}
            >
              {/* Inactive Background (Fades out when active) */}
              <div className={`absolute top-0 left-0 right-0 bottom-3 border rounded-3xl backdrop-blur-xl transition-all duration-300 overflow-hidden ${isActive ? 'opacity-0 pointer-events-none' : 'opacity-100 bg-slate-800/50 border-transparent group-hover:bg-slate-800 group-hover:border-cyan-400/30 group-hover:-translate-y-1'}`}>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              </div>

              {/* Active Background (Fades in when active) */}
              <div className={`absolute inset-0 border border-b-0 border-cyan-500/50 rounded-t-3xl rounded-b-none bg-slate-900 shadow-[0_-15px_30px_-10px_rgba(8,145,178,0.3)] transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {/* Cover block to completely erase faint subpixel lines on the Details Pane */}
                <div className="absolute -bottom-[2px] left-0 right-0 h-[4px] bg-slate-900 z-10" />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none rounded-t-3xl z-10" />
              </div>
              
              {/* Content */}
              <div className={`transition-all duration-300 relative z-40 ${service.colorClass} ${isActive ? 'translate-y-0 scale-110 drop-shadow-[0_0_10px_currentColor]' : '-translate-y-1.5 group-hover:-translate-y-2.5 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_currentColor]'}`}>
                <div className="mb-2 md:mb-3 flex justify-center">
                  <IconCmp className="w-8 h-8 md:w-10 md:h-10" />
                </div>
              </div>
              <span className={`font-medium transition-all duration-300 relative z-40 text-[10px] md:text-xs text-center leading-tight ${isActive ? 'translate-y-0 text-white font-bold' : '-translate-y-1.5 group-hover:-translate-y-2.5 text-slate-300 group-hover:text-white'}`}>
                {service.displayName}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* 2. Details Pane Below */}
      <div className={`w-full relative z-10 bg-slate-900 rounded-b-3xl ${activeService === 0 ? 'rounded-tl-none' : 'rounded-tl-3xl'} ${activeService === services.length - 1 ? 'rounded-tr-none' : 'rounded-tr-3xl'} border border-cyan-500/50 shadow-[0_20px_50px_rgba(8,145,178,0.15)] mb-10 overflow-hidden min-h-[400px]`}>
        <AnimatePresence mode="wait">
          {activeService !== null && services[activeService] && (() => {
            const activeData = services[activeService];
            const ActiveIconCmp = ICON_MAP[activeData.iconName] || FcPackage;
            return (
              <motion.div 
                key={activeService}
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="p-6 md:p-8 relative z-10"
              >
                  
                  <div className="flex flex-col md:flex-row md:items-center mb-8 gap-4 md:gap-6 pr-10">
                    <div className={`p-4 rounded-2xl bg-slate-900/60 border border-white/10 shadow-inner self-start md:self-auto ${activeData.colorClass}`}>
                      <div className="drop-shadow-[0_0_15px_currentColor] scale-125 md:scale-150 p-2 flex items-center justify-center">
                        <ActiveIconCmp className="w-8 h-8 md:w-10 md:h-10" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl md:text-3xl font-bold text-white tracking-tight mb-2">{activeData.displayName}</h3>
                      <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-2xl">
                        {activeData.description}
                      </p>
                    </div>
                  </div>
                  
                  <h4 className="text-cyan-400 font-semibold mb-4 text-sm tracking-widest uppercase border-b border-white/10 pb-2 drop-shadow-md">සේවාවන් සහ මිල ගණන්</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {activeData.items && activeData.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center bg-slate-900/50 backdrop-blur-sm p-4 rounded-xl border border-white/5 hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all shadow-md hover:shadow-lg group">
                        <span className="text-slate-300 text-sm font-semibold group-hover:text-white transition-colors">{item.name}</span>
                        <span className="text-cyan-400 text-sm font-black ml-4 text-right whitespace-nowrap bg-cyan-950/50 px-3 py-1 rounded-lg border border-cyan-800/50 shadow-inner">
                          {item.price !== undefined ? `${Number(item.price).toFixed(2)} LKR` : 'Custom'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {activeData.displayName === 'පරිගණක අලුත්වැඩියාව' && (
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between bg-slate-900/40 p-4 md:p-6 rounded-2xl border border-white/10">
                      <div className="mb-4 sm:mb-0 text-center sm:text-left">
                        <h5 className="text-white font-bold text-lg mb-1">වෙනත් අලුත්වැඩියා කටයුතු සඳහා</h5>
                        <p className="text-slate-400 text-sm">ඕනෑම පරිගණක දෝෂයක් සඳහා අපව අමතන්න</p>
                      </div>
                      <a 
                        href="https://wa.me/94719989000?text=Hello%20DESH%20Digital%20Hub,%20I%20need%20a%20computer%20repair%20service."
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                        Contact via WhatsApp
                      </a>
                    </div>
                  )}
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
    </div>
  );
}
