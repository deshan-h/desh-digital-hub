import React from 'react';
import MainLayout from '../layouts/MainLayout';
import Hero from '../components/home/Hero';
import Services from '../components/home/Services';
import EduHubSection from '../components/home/EduHubSection';
import SocialChannels from '../components/home/SocialChannels';
import WorkingHoursAndLocation from '../components/home/WorkingHoursAndLocation';
import QuickInquiry from '../components/home/QuickInquiry';
import About from '../components/home/About';

export default function Home() {
  return (
    <MainLayout>
      <div className="bg-[#050c18] text-slate-200">

        {/* Top Hero Section */}
        <section id="home" className="relative flex flex-col items-center pt-10 md:pt-14 pb-8 overflow-hidden">
          {/* Ambient Glowing Orbs */}
          <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-sky-500/15 rounded-full blur-[160px] pointer-events-none mix-blend-screen" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-[160px] pointer-events-none mix-blend-screen" />

          {/* Subtle Tech Grid */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
              maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)'
            }}
          />

          <Hero />
        </section>

        {/* 1. Services Showcase (No Prices) */}
        <Services />

        {/* 2. DESH Edu Hub Educational Portal */}
        <EduHubSection />

        {/* 3. YouTube & TikTok Digital Channels */}
        <SocialChannels />

        {/* 4. Store Working Hours & Google Map Location */}
        <WorkingHoursAndLocation />

        {/* 5. Direct Message / WhatsApp Inquiry */}
        <QuickInquiry />

        {/* 6. About & Quality Standards */}
        <About />

      </div>
    </MainLayout>
  );
}
