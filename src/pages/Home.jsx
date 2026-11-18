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
        <section id="home" className="relative flex flex-col items-center pt-8 md:pt-12 pb-8 overflow-hidden">
          {/* Ambient Glowing Orbs */}
          <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-sky-500/10 rounded-full blur-[160px] pointer-events-none mix-blend-screen" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-[160px] pointer-events-none mix-blend-screen" />
          
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
