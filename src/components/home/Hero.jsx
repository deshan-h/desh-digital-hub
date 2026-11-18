import React from 'react';
import { motion } from 'framer-motion';
import BannerCarousel from './BannerCarousel';

export default function Hero() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10">
      
      {/* Left Column: Intentionally clean to let the full photo artwork (owner, logo, billboards) shine unobstructed */}
      <div className="hidden lg:block lg:w-[50%] xl:w-[54%]" />

      {/* Right Column: The Black Carousel */}
      <motion.div 
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full lg:w-[50%] xl:w-[46%] flex justify-center lg:justify-end"
      >
        <BannerCarousel />
      </motion.div>

    </div>
  );
}
