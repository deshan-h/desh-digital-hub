import React from 'react';
import { motion } from 'framer-motion';
import { Video, ExternalLink, Sparkles, Play, Users, Bell } from 'lucide-react';

export default function SocialChannels() {
  return (
    <section id="social" className="py-20 relative overflow-hidden bg-[#050c18] border-t border-sky-500/10">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-[-10%] w-[30rem] h-[30rem] bg-rose-600/10 rounded-full blur-[140px] pointer-events-none -z-10 mix-blend-screen" />
      <div className="absolute top-1/2 right-[-10%] w-[30rem] h-[30rem] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none -z-10 mix-blend-screen" />

      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Video className="w-3.5 h-3.5" />
            <span>Digital Community • අපේ සමාජ මාධ්‍ය</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Follow Us on YouTube & TikTok
          </h2>

          <p className="text-sm sm:text-base text-slate-300 mt-3 font-medium">
            නවතම තාක්ෂණික දැනුම, පරිගණක අලුත්වැඩියා රහස් සහ සේවා පිළිබඳ වීඩියෝ නැරඹීමට අපගේ නාලිකා සමඟ එක්වන්න.
          </p>
        </div>

        {/* 2-Column Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          
          {/* 1. YouTube Channel Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl p-7 sm:p-8 bg-gradient-to-br from-[#180a10] via-[#0f0e1a] to-[#080f20] border border-rose-500/30 hover:border-rose-500/50 shadow-2xl relative overflow-hidden group flex flex-col justify-between"
          >
            {/* Ambient Red Glow */}
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-rose-600/15 rounded-full blur-3xl pointer-events-none group-hover:bg-rose-600/25 transition-all duration-500" />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
                  <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>

                <span className="text-xs font-bold text-rose-300 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30">
                  Tech & Tutorials
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white group-hover:text-rose-300 transition-colors">
                  DESH Digital YouTube Channel
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  පරිගණක දෝෂ නිරාකරණය (PC Troubleshooting), Windows සහ Software සැකසුම්, ප්‍රින්ටර් නඩත්තුව සහ තාක්ෂණික උපදෙස් ඇතුළත් දීර්ඝ වීඩියෝ.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-300">
                  <span className="font-bold text-white block mb-0.5">Hardware Fixes</span>
                  <span className="text-[11px] text-slate-400">පරිගණක අලුත්වැඩියා</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-300">
                  <span className="font-bold text-white block mb-0.5">Software Guides</span>
                  <span className="text-[11px] text-slate-400">මෘදුකාංග පුහුණු</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-rose-500/20 relative z-10 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-rose-400" />
                <span>Subscribe for Updates</span>
              </span>

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-500 text-white transition-all shadow-lg shadow-red-600/30 hover:scale-[1.02] cursor-pointer"
              >
                <span>Watch on YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>

          {/* 2. TikTok Channel Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-3xl p-7 sm:p-8 bg-gradient-to-br from-[#05151c] via-[#09111c] to-[#0d091a] border border-cyan-500/30 hover:border-cyan-500/50 shadow-2xl relative overflow-hidden group flex flex-col justify-between"
          >
            {/* Ambient Cyan/Purple Glow */}
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/25 transition-all duration-500" />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 via-slate-900 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-transform p-0.5">
                  <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
                    <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
                    </svg>
                  </div>
                </div>

                <span className="text-xs font-bold text-cyan-300 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30">
                  Quick Tech Hacks
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white group-hover:text-cyan-300 transition-colors">
                  DESH Digital on TikTok
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  දිනපතා කෙටි තාක්ෂණික උපක්‍රම (Short Tech Hacks), නවීන උපාංග සහ ආයතනික සේවාවන් පිළිබඳ තත්පර 60 කින් දැනගත හැකි රසවත් වීඩියෝ.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-300">
                  <span className="font-bold text-white block mb-0.5">Short Tips & Tricks</span>
                  <span className="text-[11px] text-slate-400">ක්ෂණික ටිප්ස්</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-300">
                  <span className="font-bold text-white block mb-0.5">Daily Shop Updates</span>
                  <span className="text-[11px] text-slate-400">දෛනික තොරතුරු</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-cyan-500/20 relative z-10 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>Join the Community</span>
              </span>

              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition-all shadow-lg shadow-cyan-500/30 hover:scale-[1.02] cursor-pointer"
              >
                <span>Follow on TikTok</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
