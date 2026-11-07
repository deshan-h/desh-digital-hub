import React from 'react';
import NoticeBar from '../components/common/NoticeBar';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function MainLayout({ children }) {
  return (
    <div 
      className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-cyan-600 selection:text-white flex flex-col relative overflow-hidden"
      style={{ fontFamily: "'Inter', 'Noto Sans Sinhala', sans-serif" }}
    >
      <NoticeBar />
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
