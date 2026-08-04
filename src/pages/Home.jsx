import React from 'react';
import MainLayout from '../layouts/MainLayout';
import Hero from '../components/home/Hero';
import Services from '../components/home/Services';
import About from '../components/home/About';

export default function Home() {
  return (
    <MainLayout>
      <div className="bg-slate-950 text-slate-200">
        <section id="home" className="relative flex flex-col items-center pt-20 md:pt-20 pb-16 min-h-screen overflow-hidden">
          {/* Ultra-Premium Ambient Glowing Orbs */}
          <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-cyan-500/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] bg-blue-600/10 rounded-full blur-[180px] pointer-events-none mix-blend-screen"></div>
          
          {/* Premium Animated Tech Grid Overlay */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none" 
            style={{ 
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
              `, 
              backgroundSize: '40px 40px',
              maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)'
            }}
          ></div>
          
          <Hero />
          <Services />
        </section>
        
        <About />
      </div>
    </MainLayout>
  );
}
