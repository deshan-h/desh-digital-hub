import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, doc, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import MainLayout from '../layouts/MainLayout';
import { FileText, Download, Search, GraduationCap, ArrowLeft, FolderDown, Sparkles } from 'lucide-react';
import { formatDirectDownloadLink } from '../utils/helpers';

const CATEGORIES = [
  { id: 'All', label: 'සියල්ල (All)' },
  { id: 'O/L', label: 'O/L (සා.පෙ.)' },
  { id: 'A/L', label: 'A/L (උ.පෙ.)' },
  { id: 'Grade 5', label: 'Grade 5 (ශිෂ්‍යත්වය)' }
];

export default function Papers() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    window.scrollTo(0, 0);

    let isMounted = true;

    // Helper to fetch from collection 'papers' as fallback
    const fetchFromCollection = async () => {
      try {
        const snap = await getDocs(collection(db, 'papers'));
        if (!isMounted) return;
        const data = [];
        snap.forEach((d) => {
          data.push({ id: d.id, ...d.data() });
        });
        data.sort((a, b) => {
          const tA = a.createdAt?.seconds || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
          const tB = b.createdAt?.seconds || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
          return tB - tA;
        });
        if (data.length > 0) {
          setPapers(data);
        }
      } catch (err) {
        console.error("Error loading papers from collection:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // 1. Listen to settings/papers (publicly accessible)
    const settingsRef = doc(db, 'settings', 'papers');
    const unsubscribeSettings = onSnapshot(
      settingsRef,
      (docSnap) => {
        if (!isMounted) return;
        if (docSnap.exists() && Array.isArray(docSnap.data().items) && docSnap.data().items.length > 0) {
          setPapers(docSnap.data().items);
          setLoading(false);
        } else {
          fetchFromCollection();
        }
      },
      (error) => {
        console.warn("Settings/papers listener notice:", error);
        fetchFromCollection();
      }
    );

    return () => {
      isMounted = false;
      unsubscribeSettings();
    };
  }, []);

  const filteredPapers = papers.filter((p) => {
    const matchesSearch = 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase().trim());

    const paperCat = p.category || 'O/L';
    const matchesCategory = selectedCategory === 'All' || paperCat === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <MainLayout>
      <div className="bg-slate-950 text-slate-200 min-h-screen pt-28 pb-20 relative overflow-hidden">
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-10 left-1/4 w-[35rem] h-[35rem] bg-cyan-500/15 rounded-full blur-[160px] pointer-events-none"></div>
        <div className="absolute top-1/2 right-10 w-[30rem] h-[30rem] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none"></div>

        {/* Tech Grid Background */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none" 
          style={{ 
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
            `, 
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)'
          }}
        ></div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          
          {/* Back Button */}
          <div className="mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5 hover:border-cyan-500/30 text-sm font-semibold transition-all group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>මුල් පිටුවට (Back to Home)</span>
            </Link>
          </div>

          {/* Page Header */}
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-4 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
            >
              <GraduationCap className="w-4 h-4" />
              <span>ඩිජිටල් සම්පත් එකතුව • PAPERS HUB</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-cyan-100 to-slate-300 tracking-tight leading-tight mb-4"
            >
              විභාග ප්‍රශ්න පත්‍ර <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">නොමිලේ Download</span> කරගන්න
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm sm:text-base text-slate-400 font-medium max-w-2xl leading-relaxed"
            >
              O/L, A/L සහ 5 ශ්‍රේණිය ශිෂ්‍යත්ව විභාග පසුගිය ප්‍රශ්න පත්‍ර සහ ආදර්ශ ප්‍රශ්න පත්‍ර (Past Papers & Model Papers) පහසුවෙන් බාගත කරගන්න.
            </motion.p>

            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-lg mt-8 relative"
            >
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                <div className="relative flex items-center bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden px-4 py-1">
                  <Search className="w-5 h-5 text-cyan-400 shrink-0 mr-3" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ප්‍රශ්න පත්‍රයේ නම හෝ විෂය search කරන්න... (e.g. Maths, 2023)"
                    className="w-full bg-transparent text-slate-200 placeholder:text-slate-500 text-sm py-2.5 focus:outline-none"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="text-xs font-bold text-slate-400 hover:text-white px-2 py-1 rounded-md bg-slate-800 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Category Tabs / Tiles (O/L, A/L, Grade 5) */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 mt-8 max-w-2xl mx-auto"
            >
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const count = cat.id === 'All' 
                  ? papers.length 
                  : papers.filter(p => (p.category || 'O/L') === cat.id).length;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`relative px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all duration-300 flex items-center gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_25px_rgba(6,182,212,0.45)] scale-105 border border-cyan-400/40'
                        : 'bg-slate-900/80 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white hover:border-cyan-500/40 hover:bg-slate-800/80 shadow-md'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-black transition-colors ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </motion.div>

            {/* Results count text */}
            <div className="flex justify-between items-center text-xs text-slate-400 mt-5 w-full max-w-lg px-2">
              <span>තෝරාගත් කාණ්ඩයේ ප්‍රශ්න පත්‍ර: <strong className="text-cyan-400">{filteredPapers.length}</strong></span>
              {searchTerm && (
                <span>Search ප්‍රතිඵල: <strong className="text-white">{filteredPapers.length}</strong></span>
              )}
            </div>
          </div>

          {/* Papers Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 h-36 animate-pulse flex flex-col justify-between">
                  <div>
                    <div className="h-4 bg-slate-800 rounded w-1/3 mb-3"></div>
                    <div className="h-3.5 bg-slate-800 rounded w-full mb-1.5"></div>
                    <div className="h-3.5 bg-slate-800 rounded w-3/4"></div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-800/60">
                    <div className="h-3 bg-slate-800 rounded w-16"></div>
                    <div className="w-8 h-8 bg-slate-800 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPapers.length === 0 ? (
            <div className="text-center py-20 px-4 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl max-w-xl mx-auto">
              <FolderDown className="w-14 h-14 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-200 mb-1">
                {searchTerm || selectedCategory !== 'All' 
                  ? 'මෙම කාණ්ඩයට අදාළ ප්‍රශ්න පත්‍ර හමු නොවීය' 
                  : 'ප්‍රශ්න පත්‍ර ඉක්මනින්ම එක් කෙරේ'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                {searchTerm || selectedCategory !== 'All' 
                  ? 'වෙනත් කාණ්ඩයක් හෝ වචනයක් යොදා නැවත සොයා බලන්න.' 
                  : 'අපගේ Papers Hub එකතුවේ ප්‍රශ්න පත්‍ර නිරන්තරයෙන් update වන අතර අවශ්‍ය ප්‍රශ්න පත්‍රයක් ඇත්නම් අප අමතන්න.'}
              </p>
              {(searchTerm || selectedCategory !== 'All') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                  }}
                  className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
                >
                  සියලු ප්‍රශ්න පත්‍ර පෙන්වන්න
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              <AnimatePresence>
                {filteredPapers.map((paper, index) => (
                  <motion.div
                    key={paper.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
                    className="group relative flex flex-col justify-between bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 rounded-xl p-3.5 sm:p-4 shadow-md hover:shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  >
                    {/* Glowing Top Line */}
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div>
                      {/* Top Row: Category Badge & Mini PDF Tag */}
                      <div className="flex items-center justify-between gap-1.5 mb-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                          (paper.category || 'O/L') === 'A/L'
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                            : (paper.category || 'O/L') === 'Grade 5'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {paper.category || 'O/L'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          PDF
                        </span>
                      </div>

                      {/* Paper Title */}
                      <h3 
                        title={paper.name}
                        className="text-xs sm:text-sm font-bold text-slate-200 group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug mb-3 min-h-[2rem]"
                      >
                        {paper.name}
                      </h3>
                    </div>

                    {/* Bottom Row: Download Icon Button */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-white/5 mt-auto">
                      <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-cyan-400/80" /> Past Paper
                      </span>
                      <a
                        href={formatDirectDownloadLink(paper.link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Download Paper"
                        className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white flex items-center justify-center shadow-[0_0_12px_rgba(8,145,178,0.3)] hover:shadow-[0_0_20px_rgba(8,145,178,0.6)] transition-all duration-300 group/btn hover:scale-105 shrink-0"
                      >
                        <Download className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-y-0.5" />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

        </div>
      </div>
    </MainLayout>
  );
}
