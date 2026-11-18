import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, ExternalLink, BookOpen, FileCheck, Download, Award, ArrowUpRight } from 'lucide-react';
import eduHubLogo from '../../assets/edu-hub-logo.jpg';

export default function EduHubSection() {
  const highlights = [
    {
      icon: BookOpen,
      title: 'Term Test Papers (Grade 6 - 11)',
      desc: 'පළාත් හා ප්‍රමුඛ පාසල් වාර විභාග ප්‍රශ්න පත්‍ර නොමිලේ බාගත කරගත හැක.'
    },
    {
      icon: FileCheck,
      title: 'O/L & A/L Past Papers & Schemes',
      desc: 'සාමාන්‍ය පෙළ සහ උසස් පෙළ පසුගිය විභාග ප්‍රශ්න පත්‍ර සහ ලකුණු ලබාදීමේ පටිපාටි.'
    },
    {
      icon: Download,
      title: 'Model Papers & Short Notes',
      desc: 'අධ්‍යාපන ප්‍රවීණයන් විසින් සකසන ලද ආදර්ශ ප්‍රශ්න පත්‍ර සහ කෙටි සටහන්.'
    }
  ];

  return (
    <section id="eduhub" className="py-20 relative overflow-hidden bg-[#040914] border-t border-sky-500/10">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45rem] h-[25rem] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none -z-10 mix-blend-screen" />

      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        
        {/* Main Edu Hub Banner Card */}
        <div className="relative rounded-3xl p-7 sm:p-10 lg:p-12 bg-gradient-to-br from-[#0a1832] via-[#09152b] to-[#071124] border border-sky-500/25 shadow-2xl overflow-hidden group">
          
          {/* Subtle Ambient Corner Accent */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/15 transition-all duration-700" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left Column: Logo & Branding */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="relative mb-5">
                <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 via-sky-400 to-blue-500 rounded-3xl blur-md opacity-40 group-hover:opacity-75 transition-opacity" />
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-2 border-white/20 bg-slate-950 p-2 shadow-2xl relative flex items-center justify-center">
                  <img
                    src={eduHubLogo}
                    alt="DESH Edu Hub"
                    className="w-full h-full object-contain rounded-2xl"
                  />
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
                <GraduationCap className="w-4 h-4 text-amber-400" />
                <span>Free Educational Portal</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                DESH Edu Hub
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium max-w-sm">
                ශ්‍රී ලාංකීය සිසු දරු දැරියන්ගේ අධ්‍යාපනික ප්‍රගතිය උදෙසා ක්‍රියාත්මක වන නොමිලේ අධ්‍යාපනික ප්‍රශ්න පත්‍ර සහ සම්පත් එකතුව.
              </p>

              <div className="mt-6">
                <a
                  href="https://deshedublog.blogspot.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] cursor-pointer"
                >
                  <span>Visit Edu Hub Portal</span>
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </a>
              </div>
            </div>

            {/* Right Column: Educational Resources Highlight Grid */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {highlights.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    className="p-5 rounded-2xl bg-slate-950/60 border border-white/10 hover:border-sky-500/40 transition-all flex flex-col justify-between space-y-3 group/item"
                  >
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/25 text-sky-400 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white group-hover/item:text-sky-300 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/5 text-[11px] font-bold text-sky-400 flex items-center gap-1">
                      <span>Free Download</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
