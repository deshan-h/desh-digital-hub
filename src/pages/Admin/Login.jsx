import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

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
    <div className="min-h-screen bg-[#030914] flex items-center justify-center p-3 sm:p-6 lg:p-10 relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[45rem] h-[45rem] bg-blue-600/10 rounded-full blur-[160px] mix-blend-screen" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45rem] h-[45rem] bg-indigo-600/10 rounded-full blur-[160px] mix-blend-screen" />
        
        {/* Subtle Background Grid */}
        <div 
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(56,189,248,0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(56,189,248,0.15) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Main Split-Screen Card Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl lg:max-w-5xl rounded-3xl sm:rounded-[36px] overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.85),0_0_50px_rgba(20,50,130,0.25)] border border-blue-900/40 bg-white relative z-10 grid grid-cols-1 lg:grid-cols-12 min-h-[580px]"
      >
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: Deep Blue Night & Tech Landscape Illustration */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 relative overflow-hidden min-h-[300px] sm:min-h-[380px] lg:min-h-full flex flex-col justify-between p-6 sm:p-8 lg:p-10 bg-gradient-to-br from-[#020922] via-[#051744] to-[#0a3585]">
          
          {/* Night Landscape SVG Art Inspired by Reference Design */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            
            {/* Glowing Moon */}
            <div className="absolute top-10 right-16 sm:right-24 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white shadow-[0_0_40px_rgba(255,255,255,0.9),0_0_90px_rgba(56,189,248,0.6)]" />

            {/* Ambient Star particles */}
            <div className="absolute top-8 left-12 w-1.5 h-1.5 rounded-full bg-white/80 shadow-[0_0_6px_#fff]" />
            <div className="absolute top-20 left-28 w-1 h-1 rounded-full bg-sky-200/70" />
            <div className="absolute top-14 right-48 w-1.5 h-1.5 rounded-full bg-cyan-200/90 shadow-[0_0_8px_#38bdf8]" />
            <div className="absolute top-36 left-20 w-1 h-1 rounded-full bg-white/60" />
            <div className="absolute top-44 right-16 w-1 h-1 rounded-full bg-sky-300/70" />

            {/* Geometric Night Clouds */}
            <div className="absolute top-24 -left-10 w-56 h-14 bg-[#082055]/50 rounded-full blur-[2px]" />
            <div className="absolute top-32 right-[-20px] w-64 h-16 bg-[#082460]/45 rounded-full blur-[2px]" />

            {/* Stylized Stilt Tower 1 (Left - Smaller) */}
            <div className="absolute bottom-28 left-8 sm:left-12 w-20 sm:w-24 flex flex-col items-center">
              {/* Roof */}
              <div 
                className="w-16 sm:w-20 h-5 bg-[#0a2763] rounded-t-lg relative"
                style={{ clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)' }}
              />
              {/* Cabin with glowing windows */}
              <div className="w-16 sm:w-20 h-9 bg-[#071d4a] border-t border-sky-400/30 flex items-center justify-around px-1">
                <span className="w-2 sm:w-2.5 h-4 bg-sky-200 rounded-[2px] shadow-[0_0_8px_#38bdf8]" />
                <span className="w-2 sm:w-2.5 h-4 bg-sky-200 rounded-[2px] shadow-[0_0_8px_#38bdf8]" />
                <span className="w-2 sm:w-2.5 h-4 bg-sky-200 rounded-[2px] shadow-[0_0_8px_#38bdf8]" />
                <span className="w-2 sm:w-2.5 h-4 bg-sky-200 rounded-[2px] shadow-[0_0_8px_#38bdf8]" />
              </div>
              {/* Stilts */}
              <div className="w-14 sm:w-16 h-28 relative flex justify-between">
                <div className="w-1.5 h-full bg-[#05173c]" />
                <div className="w-1.5 h-full bg-[#05173c]" />
                <div className="w-1.5 h-full bg-[#05173c]" />
                {/* Cross beams */}
                <div className="absolute top-6 left-0 right-0 h-1 bg-[#05173c]" />
                <div className="absolute top-16 left-0 right-0 h-1 bg-[#05173c]" />
              </div>
            </div>

            {/* Stylized Stilt Tower 2 (Center-Right - Main & Illuminated) */}
            <div className="absolute bottom-24 left-32 sm:left-44 w-28 sm:w-36 flex flex-col items-center">
              {/* Downward Light Beam Projection */}
              <div 
                className="absolute top-16 -left-8 w-44 sm:w-52 h-64 bg-gradient-to-b from-sky-400/20 via-sky-500/10 to-transparent pointer-events-none"
                style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }}
              />
              {/* Roof */}
              <div 
                className="w-24 sm:w-32 h-7 bg-[#0b2d70] rounded-t-xl relative z-10"
                style={{ clipPath: 'polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%)' }}
              />
              {/* Cabin with bright glowing windows */}
              <div className="w-24 sm:w-32 h-12 bg-[#071f52] border-t border-cyan-400/40 flex items-center justify-around px-2 relative z-10 shadow-lg">
                <span className="w-3 sm:w-3.5 h-6 bg-white rounded-[2px] shadow-[0_0_12px_#38bdf8]" />
                <span className="w-3 sm:w-3.5 h-6 bg-white rounded-[2px] shadow-[0_0_12px_#38bdf8]" />
                <span className="w-3 sm:w-3.5 h-6 bg-white rounded-[2px] shadow-[0_0_12px_#38bdf8]" />
                <span className="w-3 sm:w-3.5 h-6 bg-white rounded-[2px] shadow-[0_0_12px_#38bdf8]" />
              </div>
              {/* Stilts structure */}
              <div className="w-20 sm:w-28 h-36 relative flex justify-between z-10">
                <div className="w-2 h-full bg-[#05183f]" />
                <div className="w-2 h-full bg-[#05183f]" />
                <div className="w-2 h-full bg-[#05183f]" />
                <div className="w-2 h-full bg-[#05183f]" />
                <div className="absolute top-8 left-0 right-0 h-1.5 bg-[#05183f]" />
                <div className="absolute top-20 left-0 right-0 h-1.5 bg-[#05183f]" />
              </div>
            </div>

            {/* Silhouette Mountains Overlay at Bottom */}
            <svg 
              className="absolute bottom-0 left-0 right-0 w-full h-36 text-[#030e28] preserve-3d" 
              viewBox="0 0 500 150" 
              preserveAspectRatio="none"
            >
              <polygon points="0,150 0,60 120,110 260,30 400,100 500,50 500,150" fill="#041235" />
              <polygon points="0,150 0,90 140,130 250,75 360,120 500,85 500,150" fill="#020a1f" opacity="0.9" />
            </svg>

            {/* Optional subtle background image blending */}
            <img 
              src="/images/login_tech_art.jpg" 
              alt="DESH Digital Tech Background"
              className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-overlay pointer-events-none"
            />
          </div>

          {/* Top Brand Pill Header */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-[#030d24]/75 backdrop-blur-md border border-sky-400/30 shadow-lg">
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

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-[10px] font-bold text-sky-300 backdrop-blur-md">
              <Sparkles className="w-3 h-3" />
              <span>Cloud 24/7</span>
            </div>
          </div>

          {/* Bottom Overlaid Information Card */}
          <div className="relative z-10 mt-auto pt-6">
            <div className="rounded-2xl p-4 sm:p-5 bg-[#030e28]/75 backdrop-blur-xl border border-sky-400/20 shadow-2xl">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold text-sky-300 uppercase tracking-wider font-mono">
                  Enterprise Control Center
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                High-Speed POS Billing, Repair Diagnostics, Real-time Customer History, and Cloud Inventory Synchronized.
              </p>

              {/* Status Chips */}
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-sky-500/20 text-[11px] text-slate-300 font-semibold">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Realtime Cloud Sync
                </span>
                <span className="text-slate-500">•</span>
                <span className="flex items-center gap-1 text-sky-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  256-Bit SSL Secured
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: Pristine White Form (Matching Reference Mockup) */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 p-7 sm:p-10 lg:p-12 flex flex-col justify-between bg-white text-slate-800">
          
          <div>
            {/* Greeting Header matching reference design: HELLO! with blue underline */}
            <div className="mb-8 sm:mb-9">
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-[#1546a8] tracking-tight leading-none">
                HELLO!
              </h1>
              {/* Solid blue horizontal underline bar */}
              <div className="w-14 sm:w-16 h-1.5 bg-[#1546a8] rounded-full mt-2.5 sm:mt-3" />
              
              <p className="text-xs sm:text-sm text-slate-400 mt-3 sm:mt-3.5 font-normal leading-relaxed">
                Welcome back! Please enter your account credentials to access the admin portal.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5">
              
              {/* Email / Username Input (Matching Reference Design Soft Gray Rectangle) */}
              <div className="relative group rounded-xl bg-[#f0f2f5] hover:bg-[#eaeef3] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1546a8]/20 focus-within:border-[#1546a8] border border-transparent transition-all">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1546a8] transition-colors">
                  <User className="w-4 h-4" />
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
                  className="w-full bg-transparent text-slate-800 placeholder:text-slate-400 pl-10 pr-4 py-3.5 text-xs sm:text-sm font-medium outline-none"
                />
              </div>

              {/* Password Input (Matching Reference Design Soft Gray Rectangle) */}
              <div className="relative group rounded-xl bg-[#f0f2f5] hover:bg-[#eaeef3] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1546a8]/20 focus-within:border-[#1546a8] border border-transparent transition-all">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1546a8] transition-colors">
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
                  className="w-full bg-transparent text-slate-800 placeholder:text-slate-400 pl-10 pr-11 py-3.5 text-xs sm:text-sm font-medium outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Remember Me & Help Options */}
              <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#1546a8] accent-[#1546a8] focus:ring-[#1546a8]/30 cursor-pointer transition-all"
                  />
                  <span className="text-slate-500 group-hover:text-slate-700 font-medium transition-colors">
                    Remember
                  </span>
                </label>

                <a 
                  href="https://wa.me/94719989000?text=Hello%20DESH%20Digital%20Hub,%20I%20need%20help%20accessing%20my%20admin%20account."
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-[#1546a8] font-medium transition-colors text-xs sm:text-sm"
                >
                  Forgot your password?
                </a>
              </div>

              {/* Action Button: NEXT -> with deep blue gradient matching reference */}
              <div className="pt-3 sm:pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className="w-full py-3.5 sm:py-4 px-6 rounded-xl sm:rounded-2xl font-black text-sm tracking-wider uppercase text-white bg-gradient-to-r from-[#0d2165] via-[#103893] to-[#1c5adb] hover:from-[#103893] hover:to-[#2267f2] shadow-lg shadow-blue-900/25 hover:shadow-xl hover:shadow-blue-700/35 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
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
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              DESH Encrypted Vault
            </span>
            <a 
              href="https://wa.me/94719989000"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-slate-400 hover:text-[#1546a8] transition-colors"
            >
              Contact Support
            </a>
          </div>

        </div>

      </motion.div>

    </div>
  );
}
