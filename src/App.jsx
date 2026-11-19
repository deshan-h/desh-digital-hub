import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Loader from './components/Loader';

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Suspense fallback={<Loader fullScreen text="Loading..." subText="DESH Digital Hub" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Suspense>
      <Analytics />
    </>
  );
}
