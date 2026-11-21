import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ScrollToTop from '../components/common/ScrollToTop';
import FloatingInquiryButton from '../components/common/FloatingInquiryButton';

export default function MainLayout({ children }) {
  return (
    <div 
      className="min-h-screen bg-[#050c18] text-slate-100 font-sans selection:bg-blue-500/30 selection:text-white flex flex-col relative overflow-hidden"
      style={{ fontFamily: "'Inter', 'Noto Sans Sinhala', sans-serif" }}
    >
      {/* Background ambient lighting - subtle bottom accent only */}
      <div className="fixed bottom-[-15%] right-[-10%] w-[45rem] h-[45rem] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none -z-10 mix-blend-screen"></div>

      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main Content Area - Seamless flow with navbar */}
      <main className="flex-grow w-full bg-[#050c18] relative z-10 pt-4 sm:pt-6 pb-12 sm:pb-16 overflow-hidden">
        {children}
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Support Agent & Quick Inquiry Widget */}
      <FloatingInquiryButton />

      {/* Floating Back to Top Button */}
      <ScrollToTop />
    </div>
  );
}
