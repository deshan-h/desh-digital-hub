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
    <div id="services" className="w-full max-w-6xl mt-12 pt-16 border-t border-white/5 container mx-auto px-4 z-10 relative">
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
      
      {/* 1. Wrapped Category Tiles */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="flex overflow-x-auto hide-scrollbar justify-between gap-2 md:gap-4 w-full -mb-[2px] items-end relative z-20 pt-4">
        {services.map((service, idx) => {
          const isActive = activeService === idx;
          const IconCmp = ICON_MAP[service.iconName] || FcPackage;
          
          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              key={service.id} 
              onClick={() => setActiveService(idx)}
              className={`cursor-pointer flex flex-col items-center justify-center group relative flex-shrink-0 min-w-[110px] flex-1 h-32 sm:h-36 md:h-40 p-2 md:p-4 transition-all duration-300 ${isActive ? 'z-30' : 'z-10 hover:z-20'}`}
            >
              {/* Inactive Background */}
              <div className={`absolute top-0 left-0 right-0 bottom-2 border rounded-3xl backdrop-blur-xl transition-all duration-500 overflow-hidden ${isActive ? 'opacity-0 pointer-events-none' : 'opacity-100 bg-slate-800/40 border-white/5 group-hover:bg-slate-800/80 group-hover:border-cyan-400/40 group-hover:-translate-y-2 group-hover:shadow-[0_10px_20px_-5px_rgba(34,211,238,0.2)]'}`}>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              </div>

              {/* Active Background */}
              <div className={`absolute inset-0 border-2 border-b-0 border-cyan-400/40 rounded-t-3xl rounded-b-none bg-slate-900 shadow-[0_-20px_40px_-10px_rgba(8,145,178,0.4)] transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute -bottom-[4px] left-0 right-0 h-[6px] bg-slate-900 z-10" />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-cyan-400/15 to-transparent pointer-events-none rounded-t-3xl z-10" />
              </div>
              
              {/* Content */}
              <div className={`transition-all duration-500 relative z-40 ${service.colorClass} ${isActive ? 'scale-125 drop-shadow-[0_0_15px_currentColor] -translate-y-2' : '-translate-y-2 group-hover:-translate-y-4 group-hover:scale-125 group-hover:drop-shadow-[0_0_20px_currentColor]'}`}>
                <div className="mb-2 md:mb-3 flex justify-center">
                  <IconCmp className="w-8 h-8 md:w-10 md:h-10" />
                </div>
              </div>
              <span className={`font-semibold transition-all duration-500 relative z-40 text-[10px] md:text-sm text-center leading-tight tracking-wide ${isActive ? 'text-white -translate-y-1' : '-translate-y-2 group-hover:-translate-y-3 text-slate-400 group-hover:text-cyan-100'}`}>
                {service.displayName}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* 2. Details Pane Below */}
      <div className={`w-full relative z-10 bg-slate-900/95 backdrop-blur-2xl rounded-b-3xl ${activeService === 0 ? 'rounded-tl-none' : 'rounded-tl-3xl'} ${activeService === services.length - 1 ? 'rounded-tr-none' : 'rounded-tr-3xl'} border-2 border-cyan-400/40 shadow-[0_30px_60px_-15px_rgba(8,145,178,0.3)] mb-10 overflow-hidden min-h-[400px]`}>
        {/* Ambient Glow inside the pane */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <AnimatePresence mode="wait">
          {activeService !== null && services[activeService] && (() => {
            const activeData = services[activeService];
            const ActiveIconCmp = ICON_MAP[activeData.iconName] || FcPackage;
            return (
              <motion.div 
                key={activeService}
                initial={{ opacity: 0, y: 20, filter: 'blur(5px)' }} 
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} 
                exit={{ opacity: 0, y: -20, filter: 'blur(5px)' }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="p-6 md:p-10 relative z-10"
              >
                  
                  <div className="flex flex-col md:flex-row md:items-center mb-10 gap-6 md:gap-8 border-b border-white/5 pb-8">
                    <div className={`p-5 rounded-3xl bg-slate-800/80 border border-white/10 shadow-2xl self-start md:self-auto backdrop-blur-md ${activeData.colorClass}`}>
                      <div className="drop-shadow-[0_0_20px_currentColor] scale-150 p-2 flex items-center justify-center">
                        <ActiveIconCmp className="w-10 h-10 md:w-12 md:h-12" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-3 drop-shadow-md">{activeData.displayName}</h3>
                      <p className="text-slate-300 text-sm md:text-lg leading-relaxed max-w-3xl font-medium">
                        {activeData.description}
                      </p>
                    </div>
                  </div>
                  
                  <h4 className="text-cyan-400 font-bold mb-6 text-sm tracking-widest uppercase flex items-center gap-3">
                    <span className="w-8 h-px bg-cyan-400/50"></span>
                    සේවාවන් සහ මිල ගණන්
                    <span className="flex-1 h-px bg-gradient-to-r from-cyan-400/50 to-transparent"></span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                    {activeData.items && activeData.items.map((item, i) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        key={i} 
                        className="flex justify-between items-center bg-slate-800/40 backdrop-blur-md p-5 rounded-2xl border border-white/5 hover:border-cyan-400/50 hover:bg-slate-800/80 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] group"
                      >
                        <span className="text-slate-200 text-base font-semibold group-hover:text-white transition-colors">{item.name}</span>
                        <span className="text-cyan-400 text-sm font-black ml-4 text-right whitespace-nowrap bg-slate-900/80 px-4 py-2 rounded-xl border border-cyan-500/30 shadow-inner">
                          {item.price !== undefined ? `${Number(item.price).toFixed(2)} LKR` : 'Custom'}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {activeData.displayName === 'පරිගණක අලුත්වැඩියාව' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                      className="mt-10 flex flex-col sm:flex-row items-center justify-between bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl"
                    >
                      <div className="mb-6 sm:mb-0 text-center sm:text-left">
                        <h5 className="text-white font-black text-xl mb-2 drop-shadow-md">වෙනත් අලුත්වැඩියා කටයුතු සඳහා</h5>
                        <p className="text-slate-300 text-base font-medium">ඕනෑම පරිගණක දෝෂයක් සඳහා අපව අමතන්න</p>
                      </div>
                      <a 
                        href="https://wa.me/94719989000?text=Hello%20DESH%20Digital%20Hub,%20I%20need%20a%20computer%20repair%20service."
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 px-8 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:-translate-y-1"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                        WhatsApp
                      </a>
                    </motion.div>
                  )}
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
    </div>
  );
}
