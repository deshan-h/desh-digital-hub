import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Phone, MessageCircle, Navigation, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function WorkingHoursAndLocation() {
  const [isOpenNow, setIsOpenNow] = useState(true);

  // Compute live open/closed status based on Sri Lanka Time (Asia/Colombo GMT+5:30)
  useEffect(() => {
    const checkOpenStatus = () => {
      try {
        const now = new Date();
        // Convert to Sri Lanka time
        const slTimeString = now.toLocaleString("en-US", { timeZone: "Asia/Colombo" });
        const slDate = new Date(slTimeString);
        const day = slDate.getDay(); // 0 = Sunday, 1..6 = Mon..Sat
        const hours = slDate.getHours();
        const minutes = slDate.getMinutes();
        const currentMinuteOfDay = hours * 60 + minutes;

        // Schedule:
        // Mon (1), Tue (2), Wed (3): 7:00 AM (420) - 5:00 PM (1020)
        // Thu (4): 7:00 AM (420) - 8:00 PM (1200)
        // Fri (5): 7:00 AM (420) - 5:00 PM (1020)
        // Sat (6): 7:00 AM (420) - 4:00 PM (960)
        // Sun (0): 7:00 AM (420) - 9:00 PM (1260)
        let openMin = 420; // 7:00 AM
        let closeMin = 1020; // 5:00 PM

        if (day >= 1 && day <= 3) {
          closeMin = 1020; // 5:00 PM
        } else if (day === 4) {
          closeMin = 1200; // 8:00 PM
        } else if (day === 5) {
          closeMin = 1020; // 5:00 PM
        } else if (day === 6) {
          closeMin = 960;  // 4:00 PM
        } else if (day === 0) {
          closeMin = 1260; // 9:00 PM
        }

        setIsOpenNow(currentMinuteOfDay >= openMin && currentMinuteOfDay < closeMin);
      } catch (e) {
        setIsOpenNow(true);
      }
    };

    checkOpenStatus();
    const interval = setInterval(checkOpenStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="location" className="py-20 relative overflow-hidden bg-[#040914] border-t border-sky-500/10">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 right-[-10%] w-[35rem] h-[35rem] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none -z-10 mix-blend-screen" />

      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Clock className="w-3.5 h-3.5" />
            <span>Store Hours & Location • අපගේ වේලාවන් සහ ස්ථානය</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Visit Us or Get in Touch
          </h2>

          <p className="text-sm sm:text-base text-slate-300 mt-3 font-medium">
            සතියේ සෑම දිනකම අප ආයතනය ඔබගේ සියලු ඩිජිටල් හා පරිගණක සේවා සඳහා විවෘතව පවතී.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch">
          
          {/* Left Column: Working Hours Card (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl p-7 sm:p-8 bg-gradient-to-br from-[#09152b] via-[#081224] to-[#050c18] border border-sky-500/20 shadow-2xl flex flex-col justify-between space-y-6">
            
            <div className="space-y-6">
              {/* Live Status Badge */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className={`w-3.5 h-3.5 rounded-full ${isOpenNow ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                  <span className="text-sm font-black text-white tracking-wide">
                    {isOpenNow ? 'Currently Open (දැන් විවෘතයි)' : 'Closed Now (දැනට වසා ඇත)'}
                  </span>
                </div>

                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  isOpenNow 
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
                    : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                }`}>
                  Live Status
                </span>
              </div>

              {/* Schedule List */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Weekly Schedule (සතියේ දින සටහන)
                </h4>

                <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                    <span className="font-bold text-white">Monday – Wednesday (සඳුදා - බදාදා)</span>
                  </div>
                  <span className="font-mono font-bold text-sky-300">7:00 AM – 5:00 PM</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="font-bold text-white">Thursday (බ්‍රහස්පතින්දා)</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-300">7:00 AM – 8:00 PM</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                    <span className="font-bold text-white">Friday (සිකුරාදා)</span>
                  </div>
                  <span className="font-mono font-bold text-sky-300">7:00 AM – 5:00 PM</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span className="font-bold text-white">Saturday (සෙනසුරාදා)</span>
                  </div>
                  <span className="font-mono font-bold text-amber-300">7:00 AM – 4:00 PM</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                    <span className="font-bold text-white">Sunday (ඉරිදා)</span>
                  </div>
                  <span className="font-mono font-bold text-purple-300">7:00 AM – 9:00 PM</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/40 border border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <span>Poya Days & Special Holidays (පෝය සහ නිවාඩු දින)</span>
                  <span className="font-mono font-bold text-slate-300">7:00 AM – 8:00 PM</span>
                </div>
              </div>

              {/* Quick Contact Numbers */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Direct Inquiries & Support
                </h4>

                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href="tel:0719989000"
                    className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-sky-500/40 text-slate-300 hover:text-white transition-all flex items-center gap-2.5 group cursor-pointer"
                  >
                    <Phone className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Phone Call</span>
                      <span className="text-xs font-bold font-mono">071 998 9000</span>
                    </div>
                  </a>

                  <a
                    href="https://wa.me/94719989000?text=Hi%20DESH%20Digital%20Hub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-white transition-all flex items-center gap-2.5 group cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">WhatsApp</span>
                      <span className="text-xs font-bold font-mono">Chat Online</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Dedicated customer service counter with instant order processing.</span>
            </div>

          </div>

          {/* Right Column: Address & Google Maps (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl p-7 sm:p-8 bg-gradient-to-br from-[#081224] via-[#09152b] to-[#050c18] border border-sky-500/20 shadow-2xl flex flex-col justify-between space-y-6">
            
            <div className="space-y-5">
              {/* Address Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Our Physical Location</h3>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed font-medium">
                      204/1, Pitapahamuna, Hiriyala, Lenawa, Melsiripura, 60540, LK
                    </p>
                  </div>
                </div>

                <a
                  href="https://maps.app.goo.gl/9vC3Xq2K7sKjX9n28"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 transition-all self-start sm:self-center cursor-pointer shadow-sm"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Directions</span>
                </a>
              </div>

              {/* Styled Interactive Google Map Embed (Using Exact Footer Location Embed) */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 aspect-video w-full bg-slate-950 shadow-inner group">
                <iframe
                  title="DESH Digital Hub Location Map"
                  src="https://maps.google.com/maps?q=DESH+Digital+Hub,+Melsiripura&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
                />

                {/* Floating Map Overlay Badge */}
                <div className="absolute top-3 left-3 bg-[#0b1c36]/90 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  <span className="font-bold text-white">DESH Digital Hub • Melsiripura</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <span>Easy roadside parking available for customers.</span>
              <a
                href="https://maps.app.goo.gl/9vC3Xq2K7sKjX9n28"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
