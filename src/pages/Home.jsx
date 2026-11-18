import React from 'react';
import MainLayout from '../layouts/MainLayout';
import Hero from '../components/home/Hero';
import Services from '../components/home/Services';
import About from '../components/home/About';

export default function Home() {
  return (
    <MainLayout>
      <div className="relative bg-slate-950 text-slate-200 selection:bg-cyan-500/30 selection:text-white">
        
        {/* ======================================================== */}
        {/* TOP HERO BACKGROUND PHOTO (Cinematic Widescreen Banner)  */}
        {/* Fixed at top of page so content scrolls smoothly over it */}
        {/* ======================================================== */}
        <div className="fixed top-0 left-0 right-0 w-full h-[78vh] sm:h-[84vh] lg:h-[92vh] -z-10 pointer-events-none overflow-hidden select-none">
          <img 
            src="/hero-banner.jpg" 
            alt="DESH Digital Hub - Services & IT Solutions" 
            className="w-full h-full object-cover object-top sm:object-center transform scale-100"
          />
          
          {/* Subtle Top Gradient for Navbar Readability */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-950/85 via-slate-950/30 to-transparent pointer-events-none" />

          {/* Deep Black Gradient Shadow at bottom of photo */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
        </div>

        {/* ======================================================== */}
        {/* HERO SECTION: Right-Aligned Black Carousel & Clean View */}
        {/* ======================================================== */}
        <section id="home" className="relative min-h-[75vh] sm:min-h-[82vh] lg:min-h-[90vh] flex items-center pt-24 pb-12 z-10">
          <Hero />
        </section>

        {/* ======================================================== */}
        {/* CONTENT LAYER: Scrolls UP OVER the Photo with Shadow     */}
        {/* ======================================================== */}
        <div className="relative z-20 bg-slate-950 shadow-[0_-40px_90px_rgba(0,0,0,1)] border-t border-slate-800/50 rounded-t-[32px] sm:rounded-t-[48px] overflow-hidden">
          
          {/* Ambient Sheet Pull Bar for Mobile */}
          <div className="w-16 h-1.5 bg-slate-800/80 rounded-full mx-auto mt-4 mb-2 opacity-60 sm:hidden"></div>

          {/* Services Catalog & Pricing */}
          <Services />

          {/* About, Contact & Location */}
          <About />

        </div>

      </div>
    </MainLayout>
  );
}
