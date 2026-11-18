import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { categoryService } from '../../services/supabaseService';
import { 
  Printer, 
  Layers, 
  FileText, 
  Image as ImageIcon, 
  Download, 
  Code, 
  Settings, 
  Globe, 
  Package, 
  Wrench, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  X, 
  MessageCircle, 
  ArrowRight, 
  Sparkles,
  Palette,
  Camera
} from 'lucide-react';

const ICON_MAP = {
  'Package': Package,
  'Printer': Printer,
  'Layers': Layers,
  'FileText': FileText,
  'Type': FileText,
  'Image': ImageIcon,
  'Download': Download,
  'Code': Code,
  'Settings': Settings,
  'Globe': Globe,
  'Wrench': Wrench,
  'Palette': Palette,
  'Camera': Camera
};

export default function Services() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceModal, setSelectedServiceModal] = useState(null);

  useEffect(() => {
    async function fetchServices() {
      try {
        let data = await categoryService.getCategories();
        data = data.filter(cat => cat.category !== 'Custom & Utilities');
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
            description: 'Professional hardware diagnostics, laptop servicing, motherboard repairs, OS formatting and SSD upgrades.',
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

        setCategories(allServices);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  // Filter categories and search query
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      const matchesCategory = activeCategory === 'all' || cat.id === activeCategory || cat.category === activeCategory;
      if (!searchQuery.trim()) return matchesCategory;

      const q = searchQuery.toLowerCase();
      const inCatTitle = cat.category.toLowerCase().includes(q) || (cat.displayName && cat.displayName.toLowerCase().includes(q));
      const inItems = cat.items && cat.items.some(item => item.name.toLowerCase().includes(q));

      return matchesCategory && (inCatTitle || inItems);
    });
  }, [categories, activeCategory, searchQuery]);

  const handleWhatsAppInquiry = (serviceName) => {
    const text = encodeURIComponent(`Hi DESH Digital Hub! I would like to inquire about your ${serviceName} service.`);
    window.open(`https://wa.me/94719989000?text=${text}`, '_blank');
  };

  return (
    <section id="services" className="py-20 md:py-24 relative overflow-hidden bg-[#050c18] border-t border-sky-500/10">
      
      {/* Ambient background lighting */}
      <div className="absolute top-1/3 left-[-10%] w-[35rem] h-[35rem] bg-sky-600/10 rounded-full blur-[150px] pointer-events-none -z-10 mix-blend-screen" />
      <div className="absolute bottom-10 right-[-10%] w-[35rem] h-[35rem] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none -z-10 mix-blend-screen" />

      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Comprehensive Solutions • අපගේ සේවාවන්</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Our Digital & Computer Services
          </h2>

          <p className="text-sm sm:text-base text-slate-300 mt-3 font-medium">
            ඔබේ සියලුම ලේඛන මුද්‍රණ, පරිගණක නඩත්තු සහ ඔන්ලයින් සේවා අවශ්‍යතා සඳහා උසස්ම ප්‍රමිතියෙන් යුතු විශ්වාසනීය සේවාව.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search services (e.g. Photocopy, CV, PC Repair, Laminating)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#081528]/90 border border-sky-500/20 focus:border-sky-400/60 rounded-2xl pl-11 pr-4 py-3 text-slate-200 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-sky-500/30 transition-all shadow-lg backdrop-blur-md"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-10 px-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeCategory === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-[#09172c]/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/80'
            }`}
          >
            All Services (සියල්ල)
          </button>

          {categories.map((cat) => {
            const Icon = ICON_MAP[cat.icon] || Package;
            const isActive = activeCategory === cat.id || activeCategory === cat.category;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id || cat.category)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-600/30'
                    : 'bg-[#09172c]/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.displayName || cat.category}</span>
              </button>
            );
          })}
        </div>

        {/* Services Bento Grid (NO PRICES) */}
        {loading ? (
          <div className="py-20 text-center text-sky-400 font-semibold text-sm">
            සේවා තොරතුරු පූරණය වෙමින් පවතී...
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm border border-dashed border-slate-800 rounded-3xl bg-[#081528]/40">
            සොයන ලද සේවාව හමු නොවීය. කරුණාකර වෙනත් නමකින් සොයන්න.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((service, idx) => {
              const Icon = ICON_MAP[service.icon] || Package;
              const itemsList = service.items || [];
              const previewItems = itemsList.slice(0, 4);

              return (
                <motion.div
                  key={service.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="bg-[#081528]/85 hover:bg-[#0b1c36] backdrop-blur-xl border border-sky-500/15 hover:border-sky-500/40 rounded-3xl p-6 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-sky-500/5 hover:-translate-y-1 flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="space-y-4">
                    
                    {/* Top Row: Icon badge + Action Indicator */}
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/25 text-sky-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                        <Icon className="w-6 h-6 stroke-[2]" />
                      </div>

                      <span className="text-[11px] font-bold text-sky-400 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/25 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Available Daily
                      </span>
                    </div>

                    {/* Category Title & Description */}
                    <div>
                      <h3 className="text-lg font-black text-white group-hover:text-sky-300 transition-colors">
                        {service.displayName || service.category}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {service.description || 'Professional digital, documentation, and hardware services from DESH Digital Hub.'}
                      </p>
                    </div>

                    {/* Features / Capabilities Checklist (NO PRICES) */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      {previewItems.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className="flex items-center gap-2.5 py-1 px-2.5 rounded-xl bg-slate-900/50 border border-white/5 text-xs text-slate-300"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate font-medium">{item.name}</span>
                        </div>
                      ))}

                      {itemsList.length > 4 && (
                        <div className="text-[11px] text-slate-400 pl-2 pt-0.5 font-medium">
                          + තවත් සේවාවන් {itemsList.length - 4} ක් ඇත...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom CTA Actions */}
                  <div className="pt-5 mt-4 border-t border-slate-800/60 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setSelectedServiceModal(service)}
                      className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>View Details (විස්තර)</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <button
                      onClick={() => handleWhatsAppInquiry(service.displayName || service.category)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all shadow-sm cursor-pointer"
                      title="Inquire via WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>විමසන්න</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>

      {/* Service Details Modal (Shows full list of items without prices) */}
      <AnimatePresence>
        {selectedServiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b1c36] border border-sky-500/30 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative max-h-[85vh] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between pb-4 border-b border-slate-700/80">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center">
                      {React.createElement(ICON_MAP[selectedServiceModal.icon] || Package, { className: 'w-5 h-5' })}
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white">
                        {selectedServiceModal.displayName || selectedServiceModal.category}
                      </h3>
                      <p className="text-xs text-sky-400 font-medium">DESH Digital Hub Service Catalog</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedServiceModal(null)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="py-4 space-y-2 overflow-y-auto max-h-[48vh] no-scrollbar">
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {selectedServiceModal.description || 'මෙම අංශය යටතේ අප ආයතනයෙන් ලබාගත හැකි ප්‍රධාන සේවාවන්:'}
                  </p>

                  {(selectedServiceModal.items || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-semibold">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700/80 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedServiceModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/80"
                >
                  Close
                </button>

                <button
                  onClick={() => {
                    handleWhatsAppInquiry(selectedServiceModal.displayName || selectedServiceModal.category);
                    setSelectedServiceModal(null);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp හරහා විමසන්න</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
