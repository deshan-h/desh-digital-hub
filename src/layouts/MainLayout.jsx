import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function MainLayout({ children }) {
  return (
    <div 
      className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-blue-500/30 selection:text-white flex flex-col relative overflow-x-hidden"
      style={{ fontFamily: "'Inter', 'Noto Sans Sinhala', sans-serif" }}
    >
      {/* Background ambient lighting */}
      <div className="fixed top-[-15%] left-[-10%] w-[45rem] h-[45rem] bg-sky-600/10 rounded-full blur-[160px] pointer-events-none -z-10 mix-blend-screen"></div>
      <div className="fixed bottom-[-15%] right-[-10%] w-[45rem] h-[45rem] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none -z-10 mix-blend-screen"></div>

      {/* Floating Island Navbar */}
      <Navbar />

      {/* Main Content Area: Signature Blue Rounded Canvas (matching user sketch) */}
      <main className="flex-grow pt-24 sm:pt-28 pb-6 px-3 sm:px-6 md:px-8 max-w-[1440px] mx-auto w-full">
        <div className="rounded-[28px] sm:rounded-[36px] md:rounded-[42px] border border-sky-500/20 bg-gradient-to-b from-[#08182f] via-[#061224] to-[#040c18] shadow-[0_25px_80px_rgba(0,0,0,0.85)] overflow-hidden relative">
          {children}
        </div>
      </main>

      {/* Matching Framed Footer */}
      <Footer />
    </div>
  );
}
