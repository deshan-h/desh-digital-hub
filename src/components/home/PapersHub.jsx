import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, doc, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { FileText, Download, Search, Sparkles, GraduationCap, ArrowUpRight, FolderDown } from 'lucide-react';
import { formatDirectDownloadLink } from '../../utils/helpers';

export default function PapersHub() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;

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

  const filteredPapers = papers.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <section id="papers" className="w-full py-16 md:py-24 relative overflow-hidden scroll-mt-20">
      {/* Ambient Lighting & Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[140px] pointer-events-none"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-4 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
          >
            <GraduationCap className="w-4 h-4" />
            <span>ඩිජිටල් සම්පත් එකතුව • PAPERS HUB</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-cyan-100 to-slate-300 tracking-tight leading-tight mb-4"
          >
            විභාග ප්‍රශ්න පත්‍ර <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">නොමිලේ Download</span> කරගන්න
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-slate-400 font-medium max-w-2xl leading-relaxed"
          >
            A/L, O/L සහ පාසල් වාර විභාග පසුගිය ප්‍රශ්න පත්‍ර සහ ආදර්ශ ප්‍රශ්න පත්‍ර (Past Papers & Model Papers) පහසුවෙන් බාගත කරගන්න.
          </motion.p>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
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
            
            <div className="flex justify-between items-center text-xs text-slate-400 mt-2 px-2">
              <span>ලබා ගත හැකි ප්‍රශ්න පත්‍ර: <strong className="text-cyan-400">{papers.length}</strong></span>
              {searchTerm && (
                <span>ප්‍රතිඵල: <strong className="text-white">{filteredPapers.length}</strong></span>
              )}
            </div>
          </motion.div>
        </div>

        {/* Papers Grid Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 h-52 animate-pulse flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 bg-slate-800 rounded-xl mb-4"></div>
                  <div className="h-4 bg-slate-800 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-800 rounded w-1/2"></div>
                </div>
                <div className="h-10 bg-slate-800 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : filteredPapers.length === 0 ? (
          <div className="text-center py-16 px-4 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl max-w-xl mx-auto">
            <FolderDown className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-300 mb-1">
              {searchTerm ? 'ගැළපෙන ප්‍රශ්න පත්‍රයක් හමු නොවීය' : 'ප්‍රශ්න පත්‍ර ඉක්මනින්ම එක් කෙරේ'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              {searchTerm 
                ? 'වෙනත් වචනයක් යොදා නැවත සොයා බලන්න.' 
                : 'අපගේ Papers Hub එකතුවේ ප්‍රශ්න පත්‍ර නිරන්තරයෙන් update වන අතර අවශ්‍ය ප්‍රශ්න පත්‍රයක් ඇත්නම් අප අමතන්න.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
              >
                සියලු ප්‍රශ්න පත්‍ර පෙන්වන්න
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            <AnimatePresence>
              {filteredPapers.map((paper, index) => (
                <motion.div
                  key={paper.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
                  className="group relative flex flex-col justify-between bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-950/80 backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 rounded-2xl p-5 sm:p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_35px_-5px_rgba(6,182,212,0.2)] transition-all duration-300 hover:-translate-y-1.5 overflow-hidden"
                >
                  {/* Subtle Top Glow line on hover */}
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div>
                    {/* Icon and Tag Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all duration-300 shadow-inner">
                        <FileText className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-black tracking-wider uppercase bg-slate-800/80 border border-white/5 text-slate-300">
                        PDF
                      </span>
                    </div>

                    {/* Paper Title */}
                    <h3 className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug mb-5">
                      {paper.name}
                    </h3>
                  </div>

                  {/* Download Button */}
                  <div className="pt-2 border-t border-white/5">
                    <a
                      href={formatDirectDownloadLink(paper.link)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm tracking-wide shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:shadow-[0_0_30px_rgba(8,145,178,0.6)] transition-all duration-300 group/btn"
                    >
                      <span>බාගත කරන්න (Download)</span>
                      <Download className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-y-0.5" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>
    </section>
  );
}

