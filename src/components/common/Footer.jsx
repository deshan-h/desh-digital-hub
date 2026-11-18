import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  MapPin, 
  Clock, 
  Mail, 
  MessageCircle, 
  Lock, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function Footer() {
  return (
    <footer id="contact" className="w-full px-3 sm:px-6 md:px-8 pb-6 md:pb-10 max-w-[1440px] mx-auto text-slate-400 relative">
      <div className="rounded-[28px] sm:rounded-[36px] md:rounded-[42px] bg-[#040814]/95 border border-sky-500/20 pt-12 pb-8 px-6 sm:px-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
        
        {/* Background Lighting */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-sky-600/5 rounded-full blur-[140px] pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none -z-10"></div>

        <div className="relative z-10">
          
          {/* Main 4-Column Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-12 border-b border-slate-800/80">
            
            {/* Column 1: Brand & Operational Hours */}
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-white/10 p-1 border border-white/15 flex items-center justify-center shadow-inner">
                  <img src="/pwa-192x192.png" alt="DESH Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black text-white tracking-tight leading-tight">
                    DESH Digital Hub
                  </span>
                  <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">
                    Your One Step Digital Solution
                  </span>
                </div>
              </Link>

              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                පරිගණක අලුත්වැඩියාව, අධිවේගී මුද්‍රණ, ලැමිනේටින්, බයින්ඩින් සහ සියලුම මාර්ගගත (Online) සේවා එකම වහලක් යටින් ලබාගන්න.
              </p>

              {/* Operating Hours Badge */}
              <div className="p-3 rounded-2xl bg-[#09172c]/80 border border-sky-500/20 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-bold text-white">සතියේ දින 7 ම විවෘතයි</span>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pl-4">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span>Monday – Sunday Open (Daily from 7:00 AM)</span>
                </p>
              </div>
            </div>

          {/* Column 2: Contact Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-sky-500"></span>
              <span>සම්බන්ධතා තොරතුරු</span>
            </h4>

            <div className="space-y-3 text-xs">
              {/* Address */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span className="text-slate-300 leading-relaxed">
                  204/1, Pitapahamuna, Hiriyala,<br />
                  Lenawa, Melsiripura, 60540, LK
                </span>
              </div>

              {/* Phone */}
              <a
                href="tel:0719989000"
                className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-sky-500/40 text-slate-300 hover:text-white transition-colors cursor-pointer group"
              >
                <Phone className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="text-[10px] text-slate-500 block">Hotline Phone</span>
                  <span className="font-bold text-sm text-sky-300">071 998 9000</span>
                </div>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/94719989000?text=Hi%20DESH%20Digital%20Hub"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 hover:border-emerald-500/50 text-slate-300 hover:text-white transition-colors cursor-pointer group"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="text-[10px] text-emerald-400 font-semibold block">WhatsApp Direct Order</span>
                  <span className="font-bold text-xs text-white">071 998 9000</span>
                </div>
              </a>
            </div>
          </div>

          {/* Column 3: Interactive Location Map */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-blue-500"></span>
              <span>අප පිහිටි ස්ථානය (Location)</span>
            </h4>

            <div className="w-full h-44 rounded-2xl overflow-hidden border border-sky-500/20 shadow-lg relative group">
              <iframe 
                src="https://maps.google.com/maps?q=DESH+Digital+Hub,+Melsiripura&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="opacity-70 group-hover:opacity-100 transition-opacity duration-300 mix-blend-luminosity group-hover:mix-blend-normal"
                title="DESH Digital Hub Location Map"
              ></iframe>

              <a 
                href="https://maps.app.goo.gl/9vC3Xq2K7sKjX9n28" 
                target="_blank" 
                rel="noreferrer"
                className="absolute bottom-2.5 right-2.5 bg-[#061222]/90 backdrop-blur-md text-sky-400 hover:text-slate-950 hover:bg-sky-400 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-sky-500/30 transition-all flex items-center gap-1 shadow-md"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Column 4: Quick Portals & Social Media */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-indigo-500"></span>
              <span>සමාජ මාධ්‍ය සහ Portals</span>
            </h4>

            {/* Social Media Buttons */}
            <div className="flex items-center gap-2.5">
              <a
                href="https://desh.s.gy/desh-fb-page"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2] text-[#1877F2] hover:text-white border border-[#1877F2]/30 flex items-center justify-center transition-all shadow-sm"
                title="Facebook"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>

              <a
                href="https://desh.s.gy/desh-youtube"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-[#FF0000]/10 hover:bg-[#FF0000] text-[#FF0000] hover:text-white border border-[#FF0000]/30 flex items-center justify-center transition-all shadow-sm"
                title="YouTube"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>

              <a
                href="https://wa.me/94719989000"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 flex items-center justify-center transition-all shadow-sm"
                title="WhatsApp Channel"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>

            {/* Quick Links */}
            <div className="space-y-1.5 pt-2">
              <a
                href="https://desh.s.gy/edu-hub"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 hover:text-sky-300 transition-colors group"
              >
                <span>DESH Edu Hub Educational Portal</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-300" />
              </a>

              <Link
                to="/admin"
                className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 hover:text-white transition-colors group"
              >
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Admin Management Portal</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-white" />
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Version Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} DESH Digital Hub. All Rights Reserved.</p>
          <div className="flex items-center gap-3">
            <span>Powered by Supabase & Cloudflare</span>
            <span>•</span>
            <span className="font-mono text-sky-400/80">DESH Portal v1.25.1</span>
          </div>
        </div>

      </div>
    </div>
  </footer>
  );
}
