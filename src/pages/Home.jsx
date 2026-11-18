import React from 'react';
import MainLayout from '../layouts/MainLayout';
import Hero from '../components/home/Hero';
import Services from '../components/home/Services';
import About from '../components/home/About';
import heroBanner from '../assets/hero-banner.jpg';

export default function Home() {
  return (
    <MainLayout>
      <div className="relative text-slate-200">
        
        {/* ======================================================== */}
        {/* STICKY HERO CONTAINER WITH WIDESCREEN BANNER PHOTO       */}
        {/* 100% Guaranteed visible & pinned; content scrolls over it*/}
        {/* ======================================================== */}
        <section 
          id="home" 
          className="sticky top-0 w-full min-h-[75vh] sm:min-h-[82vh] lg:min-h-[90vh] flex flex-col justify-center overflow-hidden z-0"
        >
          {/* Background Image (z-0, no negative z-index) */}
          <div className="absolute inset-0 w-full h-full">
            <img 
              src={heroBanner} 
              alt="DESH Digital Hub - Services & IT Solutions" 
              className="w-full h-full object-cover object-top sm:object-center select-none"
            />
            
            {/* Top gradient for translucent Navbar readability */}
            <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-[#050c18]/85 via-[#050c18]/30 to-transparent pointer-events-none" />

            {/* Bottom deep black gradient shadow */}
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#050c18] via-[#050c18]/60 to-transparent pointer-events-none" />
          </div>

          {/* Hero Content Overlay: Right-aligned Black Carousel */}
          <div className="relative z-10 w-full pt-28 sm:pt-32 pb-12">
            <Hero />
          </div>
        </section>

        {/* ======================================================== */}
        {/* CONTENT LAYER: Scrolls UP OVER the Photo with Shadow     */}
        {/* ======================================================== */}
        <div className="relative z-20 bg-[#050c18] shadow-[0_-45px_100px_rgba(0,0,0,1)] border-t border-sky-500/10 rounded-t-[36px] sm:rounded-t-[48px] overflow-hidden -mt-10 sm:-mt-16">
          
          {/* Pull indicator for mobile */}
          <div className="w-16 h-1 bg-slate-800 rounded-full mx-auto mt-4 mb-2 opacity-50 sm:hidden" />

          {/* Services Section */}
          <Services />

          {/* About Section */}
          <About />

        </div>

      </div>
    </MainLayout>
  );
}
