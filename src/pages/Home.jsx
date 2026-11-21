import React, { useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import Hero from '../components/home/Hero';
import OnlinePortfolioGallery from '../components/home/OnlinePortfolioGallery';
import OnlineServices from '../components/home/OnlineServices';
import Services from '../components/home/Services';
import SocialChannels from '../components/home/SocialChannels';
import WorkingHoursAndLocation from '../components/home/WorkingHoursAndLocation';
import About from '../components/home/About';
import QuickInquiry from '../components/home/QuickInquiry';
import { visitTracker } from '../services/visitTracker';

export default function Home() {
  useEffect(() => {
    visitTracker.recordVisit();
  }, []);

  return (
    <MainLayout>
      <div className="bg-[#050c18] text-slate-200">

        {/* Top Hero Section */}
        <section id="home" className="relative flex flex-col items-center pt-10 md:pt-14 pb-8 overflow-hidden">
          {/* Ambient Glowing Orbs */}
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

        {/* 1. Our Works & Real Samples Showcase Slider (Directly below Hero) */}
        <OnlinePortfolioGallery />

        {/* 2. 100% Online Services Grid (Remote Applications, Design, Courier Print & Remote Support) */}
        <OnlineServices />

        {/* 3. Services Showcase (In-store & General) */}
        <Services />

        {/* 2. Digital Community & EduHub Showcase (YouTube, TikTok, EduHub) */}
        <SocialChannels />

        {/* 3. Store Working Hours & Google Map Location */}
        <WorkingHoursAndLocation />

        {/* 4. About & Quality Standards */}
        <About />

        {/* 5. Direct Message / WhatsApp Inquiry Form */}
        <QuickInquiry />

      </div>
    </MainLayout>
  );
}
