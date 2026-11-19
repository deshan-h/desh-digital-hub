import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ShieldCheck, Eye, EyeOff, ArrowRight, CheckCircle2, Sparkles, MessageCircle } from 'lucide-react';
import logo from '../../assets/logo.webp';

export default function Login({ 
  email, 
  setEmail, 
  password, 
  setPassword, 
  rememberMe, 
  setRememberMe, 
  handleLogin,
  loading = false 
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    handleLogin(e, rememberMe);
  };

  return (
    <div className="min-h-screen bg-[#040b15] flex items-center justify-center p-3 sm:p-6 lg:p-10 relative overflow-hidden selection:bg-sky-500/30 selection:text-white font-sans">
      
      {/* Background Ambient Cyber Glows */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[45rem] h-[45rem] bg-sky-600/15 rounded-full blur-[160px] mix-blend-screen" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45rem] h-[45rem] bg-indigo-600/15 rounded-full blur-[160px] mix-blend-screen" />
        
        {/* Subtle Tech Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(56,189,248,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(56,189,248,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '36px 36px'
          }}
        />
      </div>

      {/* Main Split-Screen Container */}
      <motion.div 
        initial={{ opacity: 0, y: 25, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl rounded-3xl sm:rounded-[36px] overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_50px_rgba(56,189,248,0.15)] border border-sky-500/25 bg-[#07152b]/95 backdrop-blur-2xl relative z-10 grid grid-cols-1 lg:grid-cols-12 min-h-[580px]"
      >
        
        {/* LEFT COLUMN: Visual Tech Showcase Artwork (Inspired by Reference Design) */}
        <div className="lg:col-span-7 relative overflow-hidden min-h-[260px] sm:min-h-[340px] lg:min-h-full flex flex-col justify-between p-6 sm:p-8 lg:p-10">
          
          {/* Background Tech Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/images/login_tech_art.jpg" 
              alt="DESH Digital Tech Artwork"
              className="w-full h-full object-cover object-center scale-105 hover:scale-100 transition-transform duration-1000"
            />
            {/* Deep Sapphire Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#07152b] via-[#07152b]/40 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-[#07152b]/30 lg:to-[#07152b]" />
            <div className="absolute inset-0 bg-sky-950/20 mix-blend-color" />
          </div>

          {/* Top Brand Tag */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-[#071324]/80 backdrop-blur-md border border-sky-400/30 shadow-lg">
              <div className="w-7 h-7 rounded-lg overflow-hidden bg-white/10 p-1 flex items-center justify-center">
                <img src="/pwa-192x192.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-white tracking-wide leading-none">
                  DESH Digital Hub
                </span>
                <span className="text-[9px] font-semibold text-sky-400 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Management Suite
                </span>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 backdrop-blur-md">
              <Sparkles className="w-3 h-3" />
              <span>v1.25 Enterprise</span>
            </div>
          </div>

          {/* Bottom Overlaid Information Card */}
          <div className="relative z-10 mt-auto pt-6">
            <div className="rounded-2xl p-4 sm:p-5 bg-[#051020]/80 backdrop-blur-xl border border-sky-400/25 shadow-2xl">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold text-sky-300 uppercase tracking-wider font-mono">
                  Enterprise Control Center
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                High-Speed POS Billing, Repair Diagnostics, Real-time Customer History, and Cloud Inventory Synchronized 24/7.
              </p>

              {/* Status Chips */}
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-sky-500/15 text-[11px] text-slate-300 font-semibold">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Realtime Cloud Sync
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1 text-sky-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  256-Bit SSL Secured
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Modern High-Impact Login Form Area */}
        <div className="lg:col-span-5 p-7 sm:p-10 lg:p-11 flex flex-col justify-between bg-[#081830]/95 backdrop-blur-3xl border-t lg:border-t-0 lg:border-l border-sky-500/20">
          
          <div>
            {/* Greeting Header matching reference design: HELLO! with accent bar */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">
                HELLO!
              </h1>
              {/* Thick cyan accent bar underneath */}
              <div className="w-14 h-1.5 bg-gradient-to-r from-sky-400 to-cyan-300 rounded-full mt-2.5 shadow-[0_0_10px_#38bdf8]" />
              
              <p className="text-xs sm:text-sm text-slate-300 mt-3 font-normal leading-relaxed">
                Welcome back! Please enter your account credentials to access the admin portal.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={onSubmit} className="space-y-5">
              
              {/* Email / Username Input */}
              <div className="space-y-1.5">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-400 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email or username"
                    required
                    className="w-full bg-[#050f1f]/90 text-slate-100 border border-sky-500/25 rounded-2xl pl-10 pr-4 py-3.5 text-xs sm:text-sm focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all placeholder:text-slate-500 shadow-inner"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-400 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password"
                    required
                    className="w-full bg-[#050f1f]/90 text-slate-100 border border-sky-500/25 rounded-2xl pl-10 pr-11 py-3.5 text-xs sm:text-sm focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all placeholder:text-slate-500 shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-sky-300 transition-colors cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Help Options */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md border-sky-500/40 bg-[#050f1f] text-sky-500 focus:ring-sky-400/40 focus:ring-offset-0 cursor-pointer transition-all"
                  />
                  <span className="text-slate-300 group-hover:text-white font-medium transition-colors">
                    Remember me
                  </span>
                </label>

                <a 
                  href="https://wa.me/94719989000?text=Hello%20DESH%20Digital%20Hub,%20I%20need%20help%20accessing%20my%20admin%20account."
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-400 hover:text-sky-300 font-semibold hover:underline transition-colors flex items-center gap-1"
                >
                  Forgot password?
                </a>
              </div>

              {/* Action Button: NEXT -> */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className="w-full py-3.5 sm:py-4 px-6 rounded-2xl font-black text-sm tracking-wider uppercase text-white bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_0_25px_rgba(56,189,248,0.35)] hover:shadow-[0_0_35px_rgba(56,189,248,0.55)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <span>{loading ? 'Authenticating...' : 'NEXT'}</span>
                  <motion.div
                    animate={{ x: isHovered ? 4 : 0 }}
                    transition={{ type: 'spring', stiffness: 350 }}
                  >
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </motion.div>
                </button>
              </div>

            </form>
          </div>

          {/* Footer Branding Strip */}
          <div className="mt-8 pt-4 border-t border-sky-500/15 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              DESH Encrypted Vault
            </span>
            <span className="font-semibold text-slate-300">
              Developed by <span className="text-sky-400 font-bold tracking-wider">DESH</span>
            </span>
          </div>

        </div>

      </motion.div>

    </div>
  );
}
