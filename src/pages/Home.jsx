import React from 'react';
import MainLayout from '../layouts/MainLayout';
import Hero from '../components/home/Hero';
import BannerCarousel from '../components/home/BannerCarousel';
import Services from '../components/home/Services';
import About from '../components/home/About';

export default function Home() {
  return (
    <MainLayout>
      <div className="bg-[#050c18] text-slate-100 relative overflow-hidden">
        
        {/* Subtle Tech Grid Texture */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none" 
          style={{ 
            backgroundImage: `
              linear-gradient(to right, rgba(56,189,248,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(56,189,248,0.1) 1px, transparent 1px)
            `, 
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, black 20%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, black 20%, transparent 100%)'
          }}
        ></div>

        {/* 1. Main Hero Section */}
        <section id="home" className="relative flex flex-col items-center pt-6 md:pt-10 pb-6">
          <Hero />
        </section>

        {/* 2. Featured Promotional Showcase (Banners) */}
        <BannerCarousel />

        {/* 3. Interactive Services & Live Price Explorer */}
        <Services />

        {/* 4. Technical Capabilities & Trust Showcase */}
        <About />

      </div>
    </MainLayout>
  );
}
