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
  Tag,
  ArrowRight,
  Sparkles
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
  'Wrench': Wrench
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
              { name: 'Hardware Diagnostics & Checking', price: 500 },
              { name: 'Windows OS Formatting & Setup', price: 1500 },
              { name: 'Virus Removal & Deep Cleaning', price: 1000 },
              { name: 'RAM & SSD Speed Upgrade Installation', price: 800 },
              { name: 'Thermal Paste Re-application & Servicing', price: 1200 }
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
      const inItems = cat.items && cat.items.some(it => it.name.toLowerCase().includes(q));

      return matchesCategory && (inCatTitle || inItems);
    });
  }, [categories, activeCategory, searchQuery]);

  // Compute minimum starting price
  const getStartingPrice = (items) => {
    if (!items || items.length === 0) return null;
    const prices = items.map(i => Number(i.price)).filter(p => !isNaN(p) && p > 0);
    if (prices.length === 0) return null;
    return Math.min(...prices);
  };

  return (
    <section id="services" className="py-20 relative z-10 w-full border-t border-sky-500/10">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60rem] h-[30rem] bg-sky-500/5 rounded-full blur-[150px] pointer-events-none -z-10"></div>

      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Digital Services & Price Catalog</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            අපගේ සියලුම{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-400">
              සේවාවන් සහ මිල ගණන්
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-400 mt-2 font-medium">
            ඔබට අවශ්‍ය සේවාව සහ පැකේජ පහසුවෙන්ම තෝරාගෙන ක්ෂණිකව මිල ගණන් පරීක්ෂා කරන්න.
          </p>

          {/* Search Input Bar */}
          <div className="relative max-w-md mx-auto mt-6">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="සේවාවක් සොයන්න (Search: NIC, CV, Printing, A4, Format...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#081528]/80 border border-sky-500/20 rounded-2xl pl-11 pr-4 py-3 text-slate-200 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-sky-400/60 shadow-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Filter Tabs */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-10 px-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeCategory === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-[#09172c]/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/80'
            }`}
          >
            සියලුම සේවා (All)
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

        {/* Services Bento Grid */}
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
              const startPrice = getStartingPrice(service.items);
              const previewItems = (service.items || []).slice(0, 3);

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
                    
                    {/* Top Row: Icon badge + Starting Price Tag */}
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/25 text-sky-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                        <Icon className="w-6 h-6 stroke-[2]" />
                      </div>

                      {startPrice !== null ? (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-medium block">Starting from</span>
                          <span className="text-xs font-black text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25">
                            Rs. {startPrice.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-sky-300 font-bold px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                          Custom Rates
                        </span>
                      )}
                    </div>

                    {/* Category Title & Description */}
                    <div>
                      <h3 className="text-lg font-black text-white group-hover:text-sky-300 transition-colors">
                        {service.displayName || service.category}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                        {service.description || 'Specialized digital and computer services from DESH Digital Hub.'}
                      </p>
                    </div>

                    {/* Top 3 Popular Items Preview */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                      {previewItems.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className="flex items-center justify-between py-1 px-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs"
                        >
                          <span className="text-slate-300 truncate font-medium max-w-[70%]">
                            {item.name}
                          </span>
                          <span className="text-slate-200 font-bold font-mono">
                            {item.price ? `Rs. ${Number(item.price).toFixed(0)}` : 'Inquire'}
                          </span>
                        </div>
                      ))}

                      {(service.items || []).length > 3 && (
                        <p className="text-[11px] text-sky-400/80 font-semibold text-center pt-1">
                          + {(service.items || []).length - 3} more options available
                        </p>
                      )}
                    </div>

                  </div>

                  {/* Card Action Button */}
                  <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedServiceModal(service)}
                      className="text-xs font-bold text-sky-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>සම්පූර්ණ මිල ලැයිස්තුව (View All)</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <a
                      href={`https://wa.me/94719989000?text=Hi%20DESH%20Hub,%20I%20would%20like%20to%20order%20from%20${encodeURIComponent(service.displayName || service.category)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 transition-colors"
                      title="Direct WhatsApp Order"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>

                </motion.div>
              );
            })}
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* SERVICE DETAIL PRICING MODAL                             */}
      {/* ======================================================== */}
      <AnimatePresence>
        {selectedServiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#081528] border border-sky-500/25 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-widest">
                    SERVICE PRICING CATALOG
                  </span>
                  <h3 className="text-xl font-black text-white mt-1">
                    {selectedServiceModal.displayName || selectedServiceModal.category}
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedServiceModal(null)}
                  className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Items List */}
              <div className="flex-1 overflow-y-auto py-4 space-y-2 pr-1 no-scrollbar">
                {(selectedServiceModal.items || []).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-sky-500/30 transition-colors"
                  >
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-slate-200 block">
                        {item.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs sm:text-sm font-black text-sky-400 font-mono">
                        {item.price ? `Rs. ${Number(item.price).toFixed(2)}` : 'Inquire'}
                      </span>
                      <a
                        href={`https://wa.me/94719989000?text=Hello%20DESH%20Hub,%20I%20would%20like%20to%20order%20${encodeURIComponent(item.name)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 text-[11px] font-bold transition-colors"
                      >
                        Order
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-400">
                  Bulk order discounts available
                </span>
                <a
                  href={`https://wa.me/94719989000?text=Hi%20DESH%20Hub,%20I%20need%20custom%20work%20for%20${encodeURIComponent(selectedServiceModal.displayName || selectedServiceModal.category)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
