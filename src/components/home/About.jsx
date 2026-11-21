import React from 'react';
import { motion } from 'framer-motion';
import { 
  Printer, 
  ShieldCheck, 
  Wrench, 
  Globe, 
  CheckCircle2, 
  Clock, 
  Award 
} from 'lucide-react';

/**
 * About Section - Method 1: Modern Split-Grid Layout
 * Consolidates the previously scattered 3 layers (Header card, 4 middle cards, bottom stats bar)
 * into a single, cohesive, luxury 2-column quality & trust showcase.
 */
export default function About() {
  const qualityPillars = [
    {
      icon: Printer,
      iconColor: 'text-sky-400 bg-sky-500/10 border-sky-400/30',
      badge: 'Industrial Grade',
      title: 'High-DPI Precision Printing',
      sub: 'වෘත්තීය මුද්‍රණ ප්‍රමිතිය',
      desc: 'පැහැදිලි ලේඛන, නිවැරදි වර්ණ සංකලනය සහ කල් නොමැකෙන Original තීන්ත මඟින් උසස්ම මුද්‍රණ හා ඡායාරූප ගුණාත්මකභාවය.'
    },
    {
      icon: ShieldCheck,
      iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-400/30',
      badge: '100% Secure',
      title: 'Confidential Document Care',
      sub: 'පූර්ණ දත්ත රහස්‍යභාවය',
      desc: 'ජාතික හැඳුනුම්පත්, විභාග සහතිකපත් සහ රහස්‍ය ලේඛන වල උපරිම පුද්ගලිකත්වය සහ කල්පවත්නා තාප ලැමිනේටින් ආරක්ෂාව.'
    },
    {
      icon: Wrench,
      iconColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-400/30',
      badge: 'Certified Tech',
      title: 'Dedicated PC & Laptop Lab',
      sub: 'පරිගණක අලුත්වැඩියා අංශය',
      desc: 'පළපුරුදු කාර්මික ශිල්පීන් විසින් නිවැරදිව දෝෂ හඳුනාගැනීම, OS ස්ථාපනය සහ Original SSD යොදා පරිගණක වේගවත් කිරීම.'
    },
    {
      icon: Globe,
      iconColor: 'text-amber-400 bg-amber-500/10 border-amber-400/30',
      badge: 'Verified Portal',
      title: 'Government & Online Desk',
      sub: 'විශ්වාසදායී මාර්ගගත ද්වාරය',
      desc: 'රජයේ විභාග, විශ්වවිද්‍යාල ලියාපදිංචි, විදේශ රැකියා සහ මාර්ගගත පෝරම 100% නිරවද්‍යතාවයෙන් කඩිනමින් සම්පූර්ණ කිරීම.'
    }
  ];

  return (
    <section id="about" className="py-20 md:py-24 relative overflow-hidden bg-[#060e1a] border-t border-sky-500/10">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-sky-600/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        
        {/* Unified 2-Column Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 sm:gap-8 items-stretch">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: The Trust & Quality Guarantee Anchor        */}
          {/* ======================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 flex flex-col justify-between p-5 sm:p-8 md:p-9 rounded-[28px] bg-gradient-to-b from-[#0a1b33] via-[#08162b] to-[#050f1f] border border-sky-400/25 shadow-2xl backdrop-blur-xl relative overflow-hidden"
          >
            {/* Ambient Accent Light */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-bold uppercase tracking-wider mb-5">
                <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Why Choose DESH Digital Hub</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              </div>

              {/* Heading */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight mb-3">
                විශ්වාසදායී තාක්ෂණය සහ{' '}
                <span className="text-sky-400">උසස් පාරිභෝගික සේවාව</span>
              </h2>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed mb-6">
                අපගේ මධ්‍යස්ථානය සතු නවීන තාක්ෂණික උපකරණ සහ වසර 6+ ක අඛණ්ඩ විශ්වාසය හරහා ඔබගේ සෑම ඩිජිටල් අවශ්‍යතාවක්ම ඉහළම ප්‍රමිතියෙන් හා කඩිනමින් ඉටු කරනු ලැබේ.
              </p>

              {/* 3 Core Trust Guarantees */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.03] border border-sky-500/15">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block">100% පුද්ගලිකත්ව ආරක්ෂාව</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      පාරිභෝගික ලේඛන සහ ඡායාරූප වල උපරිම රහස්‍යභාවය සුරැකේ.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.03] border border-sky-500/15">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block">උසස්ම ප්‍රමිතියේ නිමාව</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Industrial High-DPI මුද්‍රණය සහ කල්පවත්නා ලැමිනේටින්.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.03] border border-sky-500/15">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block">කඩිනම් කාර්යක්ෂම සේවය</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Same-Day Express Service සහ දින 365 ම විවෘත මධ්‍යස්ථානය.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Consolidated Stats Grid */}
            <div className="pt-4 border-t border-sky-500/20 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2.5 text-center relative z-10">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 shadow-sm">
                <span className="text-lg sm:text-xl font-black text-sky-400 font-mono block">6+ Years</span>
                <span className="text-[10px] font-bold text-slate-300 block mt-0.5">අඛණ්ඩ විශ්වාසය</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 shadow-sm">
                <span className="text-lg sm:text-xl font-black text-emerald-400 font-mono block">365 Days</span>
                <span className="text-[10px] font-bold text-slate-300 block mt-0.5">වසර පුරා විවෘතයි</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 shadow-sm">
                <span className="text-lg sm:text-xl font-black text-cyan-400 font-mono block">100%</span>
                <span className="text-[10px] font-bold text-slate-300 block mt-0.5">තත්ත්ව සහතිකය</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 shadow-sm">
                <span className="text-lg sm:text-xl font-black text-indigo-400 font-mono block">Online</span>
                <span className="text-[10px] font-bold text-slate-300 block mt-0.5">දිවයින පුරා සේවය</span>
              </div>
            </div>

          </motion.div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: 4 Technical Quality Pillars (2x2 Grid)     */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {qualityPillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: idx * 0.08 }}
                  className="p-5 sm:p-6 rounded-[24px] bg-[#09172c]/85 hover:bg-[#0c203c] border border-sky-500/20 hover:border-sky-400/40 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between group shadow-lg"
                >
                  <div>
                    {/* Icon & Badge Row */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center group-hover:scale-105 transition-transform ${pillar.iconColor}`}>
                        <Icon className="w-6 h-6 stroke-[2]" />
                      </div>
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-950/90 border border-slate-800 text-sky-300 font-bold tracking-wider">
                        {pillar.badge}
                      </span>
                    </div>

                    {/* Titles */}
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-sky-300 transition-colors leading-snug">
                      {pillar.title}
                    </h3>
                    <span className="text-xs font-semibold text-sky-400/90 block mt-1 mb-2.5">
                      {pillar.sub}
                    </span>

                    {/* Description */}
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
