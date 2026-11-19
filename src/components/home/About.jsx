import React from 'react';
import { motion } from 'framer-motion';
import { Printer, ShieldCheck, Wrench, Globe, CheckCircle2, Clock, Users, Award } from 'lucide-react';

export default function About() {
  const capabilities = [
    {
      icon: Printer,
      title: 'High-DPI Document & Color Printing',
      sub: 'වෘත්තීය මට්ටමේ මුද්‍රණ තාක්ෂණය',
      desc: 'නවීන මුද්‍රණ යන්ත්‍ර මගින් පැහැදිලි ලේඛන, ෆොටෝකොපි සහ උසස් තත්ත්වයේ ඡායාරූප මුද්‍රණය.',
      badge: 'Industrial Grade'
    },
    {
      icon: ShieldCheck,
      title: 'Commercial Document Protection',
      sub: 'සහතිකපත් සහ ලේඛන ආරක්ෂාව',
      desc: 'NIC, A4, Legal, A3 ප්‍රමාණයේ thermal laminating සහ වාර්තා සඳහා කල්පවත්නා book binding සේවාව.',
      badge: 'Long-Lasting'
    },
    {
      icon: Wrench,
      title: 'Dedicated PC & Laptop Lab',
      sub: 'පරිගණක අලුත්වැඩියා අංශය',
      desc: 'දෝෂ හඳුනාගැනීම, Windows OS සැකසුම්, SSD වේගවත් කිරීම් සහ දෘඩාංග (Hardware) නඩත්තුව.',
      badge: 'Certified Tech'
    },
    {
      icon: Globe,
      title: 'Government & Online Application Desk',
      sub: 'විශ්වාසදායී මාර්ගගත සේවා',
      desc: 'විභාග අයදුම්පත්, විශ්වවිද්‍යාල ලියාපදිංචි, CV සැකසුම් සහ රජයේ ඔන්ලයින් පෝරම කඩිනමින් පිරවීම.',
      badge: 'Secure Portal'
    }
  ];

  const stats = [
    { value: '365 Days', label: 'වසරේ දින 365 ම විවෘතයි', sub: 'Open All 365 Days' },
    { value: 'Online', label: 'දිවයින පුරා ඔන්ලයින් සේවා', sub: 'Island-wide Service' },
    { value: '6+ Years', label: 'වසර 6+ ක අඛණ්ඩ විශ්වාසය', sub: '6+ Years of Proven Service' },
    { value: '100%', label: 'උසස් ප්‍රමිතිය සහ වේගය', sub: 'Fast & High Quality' }
  ];

  return (
    <section id="about" className="py-24 relative overflow-hidden bg-[#060e1a] border-t border-sky-500/10">
      
      {/* Background Lighting */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-sky-600/5 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none -z-10"></div>

      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        
        {/* Attractive Showcase Header */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative max-w-4xl mx-auto mb-16 rounded-3xl p-8 sm:p-12 bg-gradient-to-b from-[#0c2340]/90 via-[#08172c]/90 to-[#050f1e]/95 border border-sky-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(56,189,248,0.15)] backdrop-blur-2xl text-center overflow-hidden"
        >
          {/* Subtle Ambient Radial Lighting in Background */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-sky-500/20 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-bold uppercase tracking-wider mb-5 shadow-sm">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Why Choose DESH Digital Hub • අසමසම විශ්වාසය</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </div>

          {/* Attractive Gradient Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            විශ්වාසදායී තාක්ෂණය සහ{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-300 drop-shadow-[0_0_30px_rgba(56,189,248,0.4)]">
              උසස් පාරිභෝගික සේවාව
            </span>
          </h2>

          {/* Stylized Description Text with Bold Key Value Highlights */}
          <p className="text-sm sm:text-base md:text-lg text-slate-200 font-normal leading-relaxed max-w-2xl mx-auto">
            අපගේ මධ්‍යස්ථානය සතු <span className="text-sky-300 font-bold">නවීන තාක්ෂණික උපකරණ</span> සහ{' '}
            <span className="text-emerald-400 font-bold">වසර ගණනාවක අඛණ්ඩ විශ්වාසය</span> හරහා ඔබගේ සෑම ඩිජිටල් අවශ්‍යතාවක්ම ඉහළම ප්‍රමිතියෙන් හා කඩිනමින් ඉටු කරනු ලැබේ.
          </p>

          {/* 3 Core Trust Badges */}
          <div className="mt-8 pt-6 border-t border-sky-500/20 grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-sky-500/15">
              <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">100% විශ්වාසදායී</span>
                <span className="text-[11px] text-slate-400 block">පුද්ගලිකත්ව ආරක්ෂාව</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-sky-500/15">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">උසස්ම ප්‍රමිතිය</span>
                <span className="text-[11px] text-slate-400 block">High-DPI මුද්‍රණ තාක්ෂණය</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-sky-500/15">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">කඩිනම් සේවාව</span>
                <span className="text-[11px] text-slate-400 block">Same-Day Express Service</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 4 Technical Capabilities Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-6 rounded-3xl bg-[#09172c]/70 hover:bg-[#0c203c] border border-sky-500/15 hover:border-sky-500/40 backdrop-blur-xl transition-all duration-300 shadow-xl hover:-translate-y-1 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6 stroke-[2]" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-sky-300 font-bold">
                      {cap.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                    {cap.title}
                  </h3>
                  <span className="text-xs font-semibold text-sky-400/90 block mt-0.5 mb-2">
                    {cap.sub}
                  </span>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {cap.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Real Stats Bar */}
        <div className="p-8 rounded-3xl bg-[#081528]/80 backdrop-blur-2xl border border-sky-500/20 shadow-2xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((st, i) => (
            <div key={i} className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 font-mono">
                {st.value}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-200 block">
                {st.label}
              </span>
              <span className="text-[11px] text-slate-500 block">
                {st.sub}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
