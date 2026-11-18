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
      <div className="text-slate-200">
        
        {/* Top Hero Section: Completely open & unboxed, directly on the sapphire background */}
        <section id="home" className="relative flex flex-col items-center pt-8 md:pt-12 pb-14 overflow-hidden bg-transparent">
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

        {/* Core Content Canvas: Starts smoothly below Hero with top corners curved downwards */}
        <div className="w-full bg-[#050c18] rounded-t-[32px] sm:rounded-t-[48px] rounded-b-[32px] sm:rounded-b-[48px] shadow-[0_0_50px_rgba(0,0,0,0.85)] relative z-10 overflow-hidden">
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

      </div>
    </MainLayout>
  );
}
