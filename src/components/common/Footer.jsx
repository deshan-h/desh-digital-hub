import React from 'react';
import logo from "../../assets/logo.webp";

export default function Footer() {
  return (
    <footer id="contact" className="bg-slate-950 text-slate-400 py-16 md:py-20 border-t border-white/5 mt-auto relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16">
          
          {/* Brand Info */}
          <div className="space-y-6">
            <a href="#" className="inline-block group">
              <img src={logo} alt="DESH Digital Hub" className="h-16 object-contain transition-transform duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
            </a>
            <p className="text-sm md:text-base text-slate-400 font-medium leading-relaxed">
              වේගවත්, දැරිය හැකි සහ විශ්වාසදායී සේවාවන් සපයන ඩිජිටල් සේවා මධ්‍යස්ථානය.
            </p>
            <div className="inline-block px-5 py-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 text-cyan-400 text-xs font-black uppercase tracking-widest shadow-[0_0_15px_rgba(8,145,178,0.15)]">
              සතියේ දින 7 ම විවෘතයි
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-6">
            <h5 className="text-xl font-bold text-white mb-6 tracking-wide drop-shadow-sm flex items-center gap-2">
              <span className="w-6 h-px bg-cyan-400/50"></span> අපව අමතන්න
            </h5>
            <div className="flex items-start space-x-4 text-sm md:text-base font-medium group cursor-pointer hover:bg-slate-900/50 p-3 -ml-3 rounded-xl transition-colors">
              <div className="p-2 bg-slate-800/50 rounded-lg group-hover:bg-cyan-500/10 group-hover:text-cyan-400 transition-colors">
                <svg className="w-5 h-5 text-slate-300 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
              <span className="group-hover:text-slate-200 transition-colors leading-relaxed">204/1, Pitapahamuna, Hiriyala,<br />Lenawa, Melsiripura,<br />60540, LK</span>
            </div>
            <div className="flex items-center space-x-4 text-sm md:text-base font-medium group cursor-pointer hover:bg-slate-900/50 p-3 -ml-3 rounded-xl transition-colors">
              <div className="p-2 bg-slate-800/50 rounded-lg group-hover:bg-cyan-500/10 group-hover:text-cyan-400 transition-colors">
                <svg className="w-5 h-5 text-slate-300 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              </div>
              <a href="tel:0719989000" className="group-hover:text-cyan-400 transition-colors text-lg tracking-wider font-bold">071 998 9000</a>
            </div>
          </div>

          {/* Our Location Map */}
          <div className="space-y-6">
            <h5 className="text-xl font-bold text-white mb-6 tracking-wide drop-shadow-sm flex items-center gap-2">
              <span className="w-6 h-px bg-blue-400/50"></span> අප පිහිටි ස්ථානය
            </h5>
            <div className="w-full h-48 rounded-2xl overflow-hidden border border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative group">
              <iframe 
                src="https://maps.google.com/maps?q=DESH+Digital+Hub,+Melsiripura&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="opacity-70 group-hover:opacity-100 transition-opacity duration-500 mix-blend-luminosity group-hover:mix-blend-normal"
                title="DESH Digital Hub Location"
              ></iframe>
              <a 
                href="https://maps.app.goo.gl/9vC3Xq2K7sKjX9n28" 
                target="_blank" 
                rel="noreferrer"
                className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md text-cyan-400 text-xs px-4 py-2 rounded-xl border border-cyan-500/20 hover:bg-cyan-500 hover:text-slate-900 hover:border-cyan-500 transition-all font-bold tracking-wide shadow-lg translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0"
              >
                Maps හරහා පිවිසෙන්න
              </a>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-6">
            <h5 className="text-xl font-bold text-white mb-6 tracking-wide drop-shadow-sm flex items-center gap-2">
              <span className="w-6 h-px bg-purple-400/50"></span> අප හා එක්වන්න
            </h5>
            <div className="flex flex-wrap gap-4">
              {/* Facebook */}
              <a 
                href="https://desh.s.gy/desh-fb-page" 
                target="_blank" rel="noreferrer"
                className="w-12 h-12 rounded-xl bg-[#1877F2]/10 backdrop-blur-sm border border-[#1877F2]/20 flex items-center justify-center text-[#1877F2] hover:text-white hover:bg-[#1877F2] hover:shadow-[0_0_20px_rgba(24,119,242,0.5)] transition-all duration-300 hover:-translate-y-1.5 group"
                title="Facebook"
              >
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>

              {/* YouTube */}
              <a 
                href="https://desh.s.gy/desh-youtube" 
                target="_blank" rel="noreferrer"
                className="w-12 h-12 rounded-xl bg-[#FF0000]/10 backdrop-blur-sm border border-[#FF0000]/20 flex items-center justify-center text-[#FF0000] hover:text-white hover:bg-[#FF0000] hover:shadow-[0_0_20px_rgba(255,0,0,0.5)] transition-all duration-300 hover:-translate-y-1.5 group"
                title="YouTube"
              >
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>

              {/* WhatsApp */}
              <a 
                href="https://desh.s.gy/desh-whatsapp" 
                target="_blank" rel="noreferrer"
                className="w-12 h-12 rounded-xl bg-[#25D366]/10 backdrop-blur-sm border border-[#25D366]/20 flex items-center justify-center text-[#25D366] hover:text-white hover:bg-[#25D366] hover:shadow-[0_0_20px_rgba(37,211,102,0.5)] transition-all duration-300 hover:-translate-y-1.5 group"
                title="WhatsApp"
              >
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              </a>

              {/* LinkedIn */}
              <a 
                href="https://desh.s.gy/desh-linkedin" 
                target="_blank" rel="noreferrer"
                className="w-12 h-12 rounded-xl bg-[#0077B5]/10 backdrop-blur-sm border border-[#0077B5]/20 flex items-center justify-center text-[#0077B5] hover:text-white hover:bg-[#0077B5] hover:shadow-[0_0_20px_rgba(0,119,181,0.5)] transition-all duration-300 hover:-translate-y-1.5 group"
                title="LinkedIn"
              >
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>

        </div>
        
        <div className="border-t border-slate-800/50 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm font-medium">© {new Date().getFullYear()} DESH Digital Hub. All rights reserved.</p>
          <div className="flex items-center gap-3 text-slate-500 text-xs">
            <span className="tracking-wide uppercase font-semibold">Developed By</span>
            <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800/80 shadow-inner hover:border-cyan-500/30 transition-colors cursor-default">
              <img src={`${import.meta.env.BASE_URL}desh-logo.png`} alt="DEH Logo" className="h-4 w-auto object-contain drop-shadow-md brightness-150" />
              <span className="text-slate-300 font-black tracking-widest uppercase">Desh</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
