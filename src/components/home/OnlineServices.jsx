import React, { useState } from 'react';
import { motion } from 'framer-motion';
import WhatsAppIcon from '../common/WhatsAppIcon';
import AskServiceModal from '../common/AskServiceModal';
import {
  Sparkles,
  CheckCircle2,
  FileText,
  CreditCard,
  QrCode,
  Building2,
  Truck,
  Clock,
  Palette,
  Laptop,
  Globe
} from 'lucide-react';

// ========================================================
// THE CORE 100% ONLINE SERVICE CATEGORIES
// ========================================================
export const ONLINE_SERVICES_DATA = [
  {
    id: 'govt-apps',
    badge: '100% Online Service',
    category: 'Govt & Career Applications',
    title: 'රජයේ හා රැකියා ඔන්ලයින් අයදුම්පත්',
    englishTitle: 'Govt, University & Exam Applications',
    icon: FileText,
    accentColor: 'from-sky-500 to-blue-600',
    borderColor: 'border-sky-500/30 hover:border-sky-400',
    iconBg: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    description: 'ඔබ සිටින තැන සිටම රජයේ සියලුම විභාග, පාස්පෝට් දිනයන්, විශ්වවිද්‍යාල සහ ආදායම් බලපත්‍ර ඔන්ලයින් අයදුම් කරගන්න.',
    deliveryTime: 'Same-day instant processing',
    items: [
      { name: 'විභාග අයදුම්පත් (A/L, O/L, රජයේ විභාග, ගුරු විභාග)', highlight: true },
      { name: 'විශ්වවිද්‍යාල අයදුම්පත් හා ලියාපදිංචි කිරීම් (University Applications)', highlight: false },
      { name: 'පාස්පෝට් (Passport) ඔන්ලයින් දිනයන් වෙන් කිරීම', highlight: true },
      { name: 'විදේශ රැකියා හා NVQ ලියාපදිංචි කිරීම්', highlight: false },
      { name: 'වාහන ආදායම් බලපත්‍ර (Revenue License) අලුත් කිරීම', highlight: true },
      { name: 'අස්වැසුම අභියාචනා / විරෝධතා අයදුම් කිරීම (Aswesuma)', highlight: false },
      { name: 'TIN අංක (Tax Identification Number) ලියාපදිංචි කිරීම', highlight: true }
    ],
    whatsappTemplate: 'Hi DESH Digital Hub! මට රජයේ / රැකියා ඔන්ලයින් අයදුම්පතක් සකසා ගැනීමට අවශ්‍යයි.'
  },
  {
    id: 'graphics-cv',
    badge: 'Digital Delivery',
    category: 'Creative Design & CV',
    title: 'වෘත්තීය CV සහ ග්‍රැෆික් නිර්මාණ',
    englishTitle: 'Professional CV & Graphic Design',
    icon: Palette,
    accentColor: 'from-purple-500 to-indigo-600',
    borderColor: 'border-purple-500/30 hover:border-purple-400',
    iconBg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    description: 'ඔබගේ තොරතුරු WhatsApp මඟින් එවන්න. ආකර්ෂණීය නවීන මෝස්තර නිර්මාණය කර High-Res PDF/JPG ලෙස සෘජුව WhatsApp වෙතම එවන්නෙමු.',
    deliveryTime: '2 - 6 hours digital turnaround',
    items: [
      { name: 'නවීන ATS-Friendly Professional CV / Resume (Sinhala & English)', highlight: true },
      { name: 'Social Media Flyers, Facebook / Instagram Ads & Banners', highlight: false },
      { name: 'Professional Visiting Cards', highlight: false },
      { name: 'මඟුල් හා උත්සව ආරාධනා පත්‍ර (Wedding & Invitation Cards)', highlight: false },
      { name: 'පොත් කවර නිර්මාණය කිරීම (Creative Book Covers)', highlight: true },
      { name: 'Digital Softcopy WhatsApp වෙතම ක්ෂණිකව ලබා දීම', highlight: true }
    ],
    whatsappTemplate: 'Hi DESH Digital Hub! මට Professional CV එකක් / Graphic Design එකක් කරගැනීමට අවශ්‍යයි.'
  },
  {
    id: 'remote-pc',
    badge: 'Instant Remote Help',
    category: 'AnyDesk Remote Support',
    title: 'දුරස්ථ පරිගණක සහය (Remote PC Support)',
    englishTitle: 'Online Software & Remote PC Assistance',
    icon: Laptop,
    accentColor: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-500/30 hover:border-emerald-400',
    iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    description: 'AnyDesk හෝ TeamViewer මඟින් ඔබගේ පරිගණකයට ආරක්ෂිතව සම්බන්ධ වී, නිවසේ සිටම අවශ්‍ය මෘදුකාංග ස්ථාපනය සහ තාක්ෂණික ගැටලු නිරාකරණය කර දෙන්නෙමු.',
    deliveryTime: 'Live 1-on-1 Remote Connection',
    items: [
      { name: 'AnyDesk / TeamViewer මඟින් සජීවීව සම්බන්ධ වීම', highlight: true },
      { name: 'Software / Applications ස්ථාපනය හා Configure කිරීම', highlight: false },
      { name: 'Windows OS & MS Office Activation සහ Anti-Virus Setup', highlight: true },
      { name: 'Driver දෝෂ විසඳීම හා Printers / Scanners Setup කිරීම', highlight: false },
      { name: 'පරිගණක දෝෂ හඳුනාගැනීම සහ තාක්ෂණික උපදෙස්', highlight: true }
    ],
    whatsappTemplate: 'Hi DESH Digital Hub! මට AnyDesk හරහා Remote Software / PC Support එකක් අවශ්‍යයි.'
  },
  {
    id: 'web-development',
    badge: '100% Online Delivery',
    category: 'Web & Cloud Solutions',
    title: 'වෙබ් අඩවි සහ මෘදුකාංග නිර්මාණය',
    englishTitle: 'Custom Websites & Web Applications',
    icon: Globe,
    accentColor: 'from-cyan-400 via-sky-500 to-blue-600',
    borderColor: 'border-cyan-500/30 hover:border-cyan-400',
    iconBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    description: 'ඔබගේ ව්‍යාපාරයට හෝ ආයතනයට නවීන Responsive වෙබ් අඩවි, E-Commerce Stores සහ Cloud Web Systems 100% ඔන්ලයින් සාකච්ඡා කර සැලසුම් කරගන්න.',
    deliveryTime: 'Custom Project Milestone Turnaround',
    items: [
      { name: 'Business, Corporate & Portfolio Websites', highlight: true },
      { name: 'E-Commerce Online Stores', highlight: true },
      { name: 'Fast Modern Cloud Web Applications (React / Full-Stack)', highlight: false },
      { name: '100% Mobile Responsive Design & Maintenance Support', highlight: true }
    ],
    whatsappTemplate: 'Hi DESH Digital Hub! මට Website එකක් / Web Application එකක් නිර්මාණය කරගැනීමට අවශ්‍යයි.'
  },
  {
    id: 'online-print',
    badge: 'Islandwide Delivery',
    category: 'Print & Courier Delivery',
    title: 'මුද්‍රණය කර නිවසටම ගෙන්වා ගැනීම',
    englishTitle: 'Online Print & Doorstep Delivery',
    icon: Truck,
    accentColor: 'from-amber-500 to-emerald-600',
    borderColor: 'border-amber-500/30 hover:border-amber-400',
    iconBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    description: 'ඔබගේ PDF/Word ලේඛන WhatsApp හෝ Form එක හරහා අපට එවන්න. උසස් ලේසර් මුද්‍රණයෙන් මුද්‍රණය කර, ලැමිනේට් හෝ බයින්ඩින් කර නිවසටම එවන්නෙමු.',
    deliveryTime: 'Pronto, Domex, Koombiyo or Register Post',
    items: [
      { name: 'B/W & Full-Color High-Speed Printing', highlight: true },
      { name: 'NIC & Document Lamination', highlight: false },
      { name: 'Plastic Spiral, Clip Binding & Tape Book Binding', highlight: true },
      { name: 'දිවයින පුරා පාරිභෝගිකයාගේ ලිපිනයටම Courier / Register Post මඟින් Safe Delivery', highlight: true }
    ],
    whatsappTemplate: 'Hi DESH Digital Hub! මට ලේඛන මුද්‍රණය කර Courier මඟින් නිවසටම ගෙන්වා ගැනීමට අවශ්‍යයි.'
  }
];

export default function OnlineServices() {
  const [askModalState, setAskModalState] = useState({ isOpen: false, service: null });

  return (
    <section id="online-services" className="py-16 md:py-24 relative overflow-hidden bg-[#040b15] border-t border-sky-500/10">

      {/* Background Lighting Elements */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[55rem] h-[25rem] bg-sky-600/10 rounded-full blur-[160px] pointer-events-none -z-10 mix-blend-screen" />
      <div className="absolute bottom-10 right-[-10%] w-[35rem] h-[35rem] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none -z-10 mix-blend-screen" />

      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>100% Remote & Online Digital Portal</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            100% Online Services
          </h2>

          <p className="text-sm sm:text-base text-slate-300 mt-3 font-medium">
            කඩේට නොපැමිණ ඔබ සිටින තැන සිටම WhatsApp හෝ අපගේ වෙබ් අඩවිය හරහා ලේඛන යවා, සේවාව නිමවා Softcopy එක WhatsApp වෙත හෝ Courier මඟින් නිවසටම ගෙන්වා ගන්න.
          </p>

          {/* Quick How It Works Bar */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <div className="p-3.5 rounded-2xl bg-[#071426] border border-sky-500/20 flex items-start gap-3 shadow-md">
              <span className="w-7 h-7 rounded-xl bg-sky-500/20 text-sky-400 font-black text-xs flex items-center justify-center shrink-0">1</span>
              <div>
                <span className="text-xs font-bold text-white block">සේවාව තෝරා විස්තර එවන්න</span>
                <span className="text-[11px] text-slate-400">WhatsApp හෝ Form එකෙන් ලේඛන අපට යොමු කරන්න</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#071426] border border-sky-500/20 flex items-start gap-3 shadow-md">
              <span className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 font-black text-xs flex items-center justify-center shrink-0">2</span>
              <div>
                <span className="text-xs font-bold text-white block">Online / QR මඟින් ගෙවන්න</span>
                <span className="text-[11px] text-slate-400">Bank Transfer හෝ QR slip එක WhatsApp කරන්න</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#071426] border border-sky-500/20 flex items-start gap-3 shadow-md">
              <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center shrink-0">3</span>
              <div>
                <span className="text-xs font-bold text-white block">Softcopy හෝ Doorstep Delivery</span>
                <span className="text-[11px] text-slate-400">WhatsApp වෙත ඩිජිටල් පිටපත හෝ නිවසටම Courier</span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 5 DEDICATED CARDS GRID (2 COLUMNS, LAST CARD CENTERED)    */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12">
          {ONLINE_SERVICES_DATA.map((service, idx) => {
            const IconComponent = service.icon;
            const isLastCentered = idx === 4;

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
                className={`group rounded-3xl bg-gradient-to-br from-[#071426] via-[#061120] to-[#040c17] p-5 sm:p-7 border ${service.borderColor} shadow-xl hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
                  isLastCentered ? 'md:col-span-2 md:max-w-xl md:mx-auto w-full' : ''
                }`}
              >
                {/* Top Subtle Neon Edge Glow */}
                <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${service.accentColor} opacity-70 group-hover:opacity-100 transition-opacity`} />

                <div>
                  {/* Card Top Meta: Icon + Category on Left, Badge on Right */}
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${service.iconBg} border flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform`}>
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-sky-400 block">
                        {service.category}
                      </span>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] sm:text-[11px] font-bold text-emerald-400 shrink-0 font-mono flex items-center gap-1.5 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {service.badge}
                    </span>
                  </div>

                  {/* Title & English Subtitle - Full Width, No Squishing */}
                  <div className="mb-3.5">
                    <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                      {service.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs font-semibold text-slate-400 mt-0.5">
                      {service.englishTitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {service.description}
                  </p>

                  {/* Checklist of Included Services */}
                  <div className="space-y-2 mb-6">
                    {service.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className={`flex items-start gap-2.5 p-2 rounded-xl text-xs transition-colors ${item.highlight
                          ? 'bg-sky-950/50 border border-sky-500/30 text-white font-bold shadow-xs'
                          : 'bg-slate-900/40 border border-white/5 text-slate-300 font-medium'
                          }`}
                      >
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${item.highlight ? 'text-sky-400' : 'text-emerald-400'}`} />
                        <span className={item.highlight ? 'font-bold text-white' : 'font-normal text-slate-300'}>{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Strip: Clean Plain Color */}
                <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>{service.deliveryTime}</span>
                  </div>

                  {/* Clean Plain Solid Button */}
                  <button
                    type="button"
                    onClick={() => setAskModalState({ isOpen: true, service })}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-white shrink-0" />
                    <span>Ask More Details / Prices</span>
                  </button>
                </div>

              </motion.div>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* PAYMENT METHODS & TRUST BAR (PREMIUM WITH ICONS)         */}
        {/* ======================================================== */}
        <div className="rounded-3xl bg-gradient-to-r from-[#07162c] via-[#091f3d] to-[#07162c] border border-sky-500/25 p-6 sm:p-8 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-left w-full lg:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Payment Methods • පහසු ගෙවීම් ක්‍රමවේදය</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">100% Verified</span>
              </div>
              <h4 className="text-base sm:text-lg font-black text-white mt-1">
                Bank Transfer, Cash Deposit & LANKAQR
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                BOC, Sampath, Commercial බැංකු තැන්පතු හෝ QR හරහා පහසුවෙන් ගෙවීමට අදාළ ගිණුම් විස්තර WhatsApp හරහා ක්ෂණිකව ලබා ගන්න.
              </p>

              {/* Payment Method Badges with Icons */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700/60 text-[11px] font-bold text-slate-200 shadow-xs">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>BOC</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700/60 text-[11px] font-bold text-slate-200 shadow-xs">
                  <Building2 className="w-3.5 h-3.5 text-orange-400" />
                  <span>Sampath Bank</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700/60 text-[11px] font-bold text-slate-200 shadow-xs">
                  <Building2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Commercial Bank</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700/60 text-[11px] font-bold text-slate-200 shadow-xs">
                  <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>LANKAQR</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700/60 text-[11px] font-bold text-slate-200 shadow-xs">
                  <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                  <span>CDM & Online Banking</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Ask Bank Details & WhatsApp Slip (Clean Plain Professional Solid Colors) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0 justify-end">
            <a
              href="https://wa.me/94719989000?text=Hello%20DESH%20Digital%20Hub,%20%E0%B6%B8%E0%B6%A7%20%E0%B7%83%E0%B7%9A%E0%B7%80%E0%B7%8F%E0%B7%80%20%E0%B7%83%E0%B6%B3%E0%B7%84%E0%B7%8F%20%E0%B6%9C%E0%B7%99%E0%B7%80%E0%B7%93%E0%B6%B8%E0%B7%8A%20%E0%B6%9A%E0%B7%92%E0%B7%83%E0%B7%93%E0%B6%B8%E0%B6%A7%20Bank%20Account%20%E0%B7%80%E0%B7%92%E0%B7%83%E0%B7%8A%E0%B6%AD%E0%B6%BB%20%E0%B7%84%E0%B7%8B%20LANKAQR%20%E0%B6%91%E0%B7%80%E0%B6%B1%E0%B7%8A%E0%B6%A1."
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              title="Ask Bank Details on WhatsApp"
            >
              <Building2 className="w-4 h-4 text-white" />
              <span>Ask Bank Details (ගිණුම් විස්තර ලබාගන්න)</span>
            </a>

            <a
              href="https://wa.me/94719989000?text=Hello%20DESH%20Digital%20Hub,%20%E0%B6%B8%E0%B7%8F%20%E0%B7%80%E0%B7%92%E0%B7%83%E0%B7%92%E0%B6%B1%E0%B7%8A%20%E0%B7%83%E0%B7%92%E0%B6%A9%E0%B7%94%E0%B6%9A%E0%B7%85%20%E0%B6%9C%E0%B7%99%E0%B7%80%E0%B7%93%E0%B6%B8%E0%B7%9A%20Slip%20%E0%B6%B4%E0%B6%AD%E0%B7%8A%E0%B7%8F%E0%B6%BB%E0%B7%92%E0%B6%9A%E0%B7%8F%E0%B7%80%20%E0%B6%B8%E0%B7%99%E0%B7%84%E0%B7%92%20%E0%B6%85%E0%B6%B8%E0%B7%94%E0%B6%AB%E0%B7%8F%20%E0%B6%87%E0%B6%AD."
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1da850] text-slate-950 text-xs font-bold transition-colors flex items-center justify-center gap-2 shrink-0 shadow-sm cursor-pointer"
              title="Send Payment Slip via WhatsApp"
            >
              <WhatsAppIcon className="w-4 h-4 text-slate-950" />
              <span>WhatsApp Slip</span>
            </a>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* ASK MORE DETAILS / PRICES MODAL (SYSTEM INQUIRY & CALL)  */}
      {/* ======================================================== */}
      <AskServiceModal
        isOpen={askModalState.isOpen}
        onClose={() => setAskModalState({ isOpen: false, service: null })}
        serviceTitle={askModalState.service?.title}
        serviceCategory={askModalState.service?.category}
        source="Online Services"
      />

    </section>
  );
}
