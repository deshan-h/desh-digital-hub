import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function MainLayout({ children }) {
  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-[#0c2340] via-[#091b30] to-[#061424] text-slate-100 font-sans selection:bg-blue-500/30 selection:text-white flex flex-col relative overflow-hidden"
      style={{ fontFamily: "'Inter', 'Noto Sans Sinhala', sans-serif" }}
    >
      {/* Background ambient lighting */}
      <div className="fixed top-[-15%] left-[-10%] w-[45rem] h-[45rem] bg-sky-600/10 rounded-full blur-[160px] pointer-events-none -z-10 mix-blend-screen"></div>
      <div className="fixed bottom-[-15%] right-[-10%] w-[45rem] h-[45rem] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none -z-10 mix-blend-screen"></div>

      {/* Top Navigation Bar in the Sapphire Area */}
      <Navbar />

      {/* Main Content Card (Top 2 corners curved downwards, bottom 2 corners curved upwards, Edge-to-Edge full width) */}
      <main className="flex-grow w-full bg-[#050c18] rounded-t-[32px] sm:rounded-t-[46px] md:rounded-t-[54px] rounded-b-[32px] sm:rounded-b-[46px] md:rounded-b-[54px] shadow-[0_0_50px_rgba(0,0,0,0.85)] relative z-10 pt-8 sm:pt-12 pb-12 sm:pb-16 overflow-hidden">
        {children}
      </main>

      {/* Footer in the Sapphire Area */}
      <Footer />
    </div>
  );
}
