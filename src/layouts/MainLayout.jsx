import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function MainLayout({ children }) {
  return (
    <div 
      className="min-h-screen bg-[#050c18] text-slate-100 font-sans selection:bg-blue-500/30 selection:text-white flex flex-col relative overflow-hidden"
      style={{ fontFamily: "'Inter', 'Noto Sans Sinhala', sans-serif" }}
    >
      {/* Background ambient lighting */}
      <div className="fixed top-[-15%] left-[-10%] w-[45rem] h-[45rem] bg-sky-600/10 rounded-full blur-[160px] pointer-events-none -z-10 mix-blend-screen"></div>
      <div className="fixed bottom-[-15%] right-[-10%] w-[45rem] h-[45rem] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none -z-10 mix-blend-screen"></div>

      <Navbar />

      <main className="flex-grow pt-20 md:pt-24">
        {children}
      </main>

      <Footer />
    </div>
  );
}
