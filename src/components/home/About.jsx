import React from 'react';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <section id="about" className="py-20 md:py-32 relative overflow-hidden bg-slate-950 border-t border-white/5">
      <div className="absolute -top-[20%] right-[-10%] w-[50rem] h-[50rem] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none"></div>
      
      <div className="container mx-auto px-4 md:px-6 max-w-5xl text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          {/* Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none"></div>
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
          
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight drop-shadow-lg relative z-10">
            අප <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">ගැන</span>
          </h2>
          <div className="h-1.5 w-32 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full mb-10 shadow-[0_0_15px_rgba(34,211,238,0.5)] relative z-10"></div>
          
          <p className="text-lg md:text-2xl text-slate-300 leading-relaxed font-medium max-w-3xl mx-auto relative z-10 drop-shadow-sm">
            අපි විශ්වාසදායී ඩිජිටල් සේවා මධ්‍යස්ථානයක් සහ මුද්‍රණාලයක් වෙමු. 
            අපගේ අරමුණ වන්නේ <span className="text-white font-bold">වේගවත්</span>, <span className="text-white font-bold">දැරිය හැකි</span> සහ <span className="text-white font-bold">විශ්වාසදායී</span> සේවාවන් අපගේ ගනුදෙනුකරුවන්ට ලබා දීමයි. 
          </p>
          <p className="text-base md:text-xl text-slate-400 leading-relaxed mt-6 max-w-3xl mx-auto relative z-10">
            ඔබට අවශ්‍ය සියලුම මුද්‍රණ කටයුතු, හදිසි පරිගණක අලුත්වැඩියාවන් මෙන්ම අන්තර්ජාල සේවාවන් 
            එකම වහලක් යටින් විශ්වාසවන්තව ලබාගත හැක.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 relative z-10">
            {[
              { value: '100+', label: 'දෛනික සේවා' },
              { value: 'Fast', label: 'වේගවත් සේවය' },
              { value: 'Trust', label: 'විශ්වාසය' },
              { value: '24/7', label: 'සහාය' }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center p-4 rounded-2xl bg-slate-800/30 border border-white/5">
                <span className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">{stat.value}</span>
                <span className="text-sm md:text-base text-slate-400 font-bold tracking-wide">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
