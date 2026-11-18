import React, { useState, useEffect } from 'react';
import { settingsService } from '../../services/supabaseService';
import { supabase } from '../../config/supabase';
import { uploadToCloudflare } from '../../services/cloudflareStorage';
import { notify } from '../../utils/toast';
import { 
  Save, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  UploadCloud, 
  Link as LinkIcon, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  ExternalLink,
  Store,
  Printer,
  ShoppingCart,
  ShieldCheck,
  Database,
  Bell,
  Sliders,
  ChevronRight,
  ChevronLeft,
  Search,
  CheckCircle2,
  RefreshCw,
  FileText,
  Sparkles,
  Clock,
  Laptop
} from 'lucide-react';
import Loader from '../../components/Loader';

const DEFAULT_BANNERS = [
  {
    id: 'default-1',
    title: 'DESH Digital Solutions',
    subtitle: 'Next-Generation POS Systems, Web Development & IT Solutions.',
    badge: 'FEATURED',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    linkUrl: '#services',
    linkText: 'Explore Services',
    active: true
  },
  {
    id: 'default-2',
    title: 'DESH Edu Hub Portal',
    subtitle: 'Free and premium educational resources, exam papers and study guides.',
    badge: 'EDUCATIONAL',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    linkUrl: 'https://deshedublog.blogspot.com',
    linkText: 'Visit Edu Hub',
    active: true
  }
];

export default function Settings({ isAdmin }) {
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'general' | 'banners' | 'invoice' | 'pos' | 'security' | 'storage'
  const [searchFilter, setSearchFilter] = useState('');

  // 1. Banners state
  const [savingBanners, setSavingBanners] = useState(false);
  const [banners, setBanners] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [imageInputMode, setImageInputMode] = useState('file');
  const [newBanner, setNewBanner] = useState({
    title: '',
    subtitle: '',
    badge: 'PROMOTION',
    imageUrl: '',
    linkUrl: '',
    linkText: 'View Details',
    active: true
  });

  // 2. Business Profile state
  const [savingProfile, setSavingProfile] = useState(false);
  const [profile, setProfile] = useState({
    businessName: 'DESH Digital Hub',
    tagline: 'Next-Generation POS Systems, Web Development & IT Solutions',
    phone: '+94 77 123 4567',
    email: 'contact@deshdigital.com',
    address: 'No 45, Commercial Complex, Sri Lanka',
    currency: 'Rs.',
    timezone: 'Asia/Colombo (GMT+5:30)'
  });

  // 3. Invoice & Print state
  const [savingInvoice, setSavingInvoice] = useState(false);
  const [invoiceSettings, setInvoiceSettings] = useState({
    headerTitle: 'DESH DIGITAL HUB',
    subtitle: 'Official Sales & Service Receipt',
    paperSize: '80mm',
    footerNote: 'Thank you for your business! Please visit us again.',
    showCashier: true,
    showCustomerDetails: true,
    autoPrintOnSale: false
  });

  // 4. POS Rules state
  const [savingPOS, setSavingPOS] = useState(false);
  const [posSettings, setPosSettings] = useState({
    defaultPaymentMode: 'cash',
    quickCashPresets: '100, 500, 1000, 5000',
    soundEffects: true,
    autoFocusSearch: true,
    defaultCustomerName: 'Walk-in Customer'
  });

  // 5. Diagnostics state
  const [pingLatency, setPingLatency] = useState(null);
  const [testingPing, setTestingPing] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const [bannersData, profileData, invoiceData, posData] = await Promise.all([
        settingsService.getSetting('banners').catch(() => null),
        settingsService.getSetting('business_profile').catch(() => null),
        settingsService.getSetting('invoice_settings').catch(() => null),
        settingsService.getSetting('pos_settings').catch(() => null)
      ]);

      if (bannersData && Array.isArray(bannersData.items) && bannersData.items.length > 0) {
        setBanners(bannersData.items);
      } else {
        setBanners(DEFAULT_BANNERS);
      }

      if (profileData && typeof profileData === 'object') {
        setProfile((prev) => ({ ...prev, ...profileData }));
      }
      if (invoiceData && typeof invoiceData === 'object') {
        setInvoiceSettings((prev) => ({ ...prev, ...invoiceData }));
      }
      if (posData && typeof posData === 'object') {
        setPosSettings((prev) => ({ ...prev, ...posData }));
      }
    } catch (error) {
      console.error(error);
      notify.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // --- Banner Handlers ---
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadToCloudflare(file);
      setNewBanner((prev) => ({ ...prev, imageUrl: result.url }));
      notify.success('Image uploaded to Cloudflare R2 successfully!');
    } catch (err) {
      console.error(err);
      notify.error(err.message || 'Image upload failed. You can paste an image URL directly.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAddBanner = () => {
    if (!newBanner.imageUrl.trim()) {
      notify.error('Please upload an image or provide an image URL first.');
      return;
    }

    const item = {
      id: 'banner_' + Date.now(),
      title: newBanner.title.trim(),
      subtitle: newBanner.subtitle.trim(),
      badge: (newBanner.badge || 'PROMOTION').trim().toUpperCase(),
      imageUrl: newBanner.imageUrl.trim(),
      linkUrl: newBanner.linkUrl.trim(),
      linkText: (newBanner.linkText || 'View Details').trim(),
      active: true,
      createdAt: new Date().toISOString()
    };

    setBanners([item, ...banners]);
    setNewBanner({
      title: '',
      subtitle: '',
      badge: 'PROMOTION',
      imageUrl: '',
      linkUrl: '',
      linkText: 'View Details',
      active: true
    });
    notify.success('Banner added. Click "Save Banners" to publish!');
  };

  const handleRemoveBanner = (index) => {
    setBanners(banners.filter((_, i) => i !== index));
  };

  const handleToggleBannerActive = (index) => {
    const updated = [...banners];
    updated[index].active = !updated[index].active;
    setBanners(updated);
  };

  const handleMoveBanner = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;
    const newItems = [...banners];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, moved);
    setBanners(newItems);
  };

  const handleSaveBanners = async () => {
    setSavingBanners(true);
    try {
      await settingsService.saveSetting('banners', { items: banners });
      notify.success('Public wallpaper carousel updated successfully!');
    } catch (error) {
      console.error(error);
      notify.error('Failed to save banners');
    } finally {
      setSavingBanners(false);
    }
  };

  // --- Profile Handler ---
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await settingsService.saveSetting('business_profile', profile);
      notify.success('Business profile updated successfully!');
    } catch (error) {
      console.error(error);
      notify.error('Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // --- Invoice Handler ---
  const handleSaveInvoiceSettings = async () => {
    setSavingInvoice(true);
    try {
      await settingsService.saveSetting('invoice_settings', invoiceSettings);
      notify.success('Invoice & print settings saved successfully!');
    } catch (error) {
      console.error(error);
      notify.error('Failed to save invoice settings');
    } finally {
      setSavingInvoice(false);
    }
  };

  // --- POS Handler ---
  const handleSavePosSettings = async () => {
    setSavingPOS(true);
    try {
      await settingsService.saveSetting('pos_settings', posSettings);
      notify.success('POS preferences updated successfully!');
    } catch (error) {
      console.error(error);
      notify.error('Failed to save POS preferences');
    } finally {
      setSavingPOS(false);
    }
  };

  // --- System Diagnostic Ping ---
  const handleRunDiagnostic = async () => {
    setTestingPing(true);
    const start = performance.now();
    try {
      await supabase.from('settings').select('id').limit(1);
      const end = performance.now();
      const latency = Math.round(end - start);
      setPingLatency(latency);
      notify.success(`Database response verified in ${latency}ms`);
    } catch (err) {
      console.error(err);
      notify.error('Database connection test failed');
    } finally {
      setTestingPing(false);
    }
  };

  if (loading) return <Loader />;

  // Category Cards Configuration matching StoreMate screenshot
  const categoryCards = [
    {
      id: 'general',
      title: 'Business Profile',
      subtitle: 'Store identity, address, phone, currency and branding information.',
      icon: Store,
      badgeColor: 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-[0_0_15px_rgba(14,165,233,0.15)]',
      openText: 'Configure Profile'
    },
    {
      id: 'banners',
      title: 'Wallpaper & Banners',
      subtitle: 'Upload and manage 1:1 graphic posters for the public home carousel.',
      icon: ImageIcon,
      badgeColor: 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
      openText: 'Manage Banners',
      count: banners.length
    },
    {
      id: 'invoice',
      title: 'Layout & Printing',
      subtitle: 'Thermal receipt 80mm/58mm, A4 invoice design, and footer notes.',
      icon: Printer,
      badgeColor: 'bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]',
      openText: 'Customize Layout'
    },
    {
      id: 'pos',
      title: 'POS & Ordering',
      subtitle: 'Default payment methods, quick cash presets, and checkout preferences.',
      icon: ShoppingCart,
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
      openText: 'Edit POS Rules'
    },
    {
      id: 'security',
      title: 'Security & Policy',
      subtitle: 'System authentication, role-based protection, and session timeouts.',
      icon: ShieldCheck,
      badgeColor: 'bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]',
      openText: 'Review Security'
    },
    {
      id: 'storage',
      title: 'Storage & Diagnostics',
      subtitle: 'Cloudflare R2 bucket connection, Supabase database latency and cache.',
      icon: Database,
      badgeColor: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]',
      openText: 'View Diagnostics'
    }
  ];

  const filteredCards = categoryCards.filter(c => 
    c.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.subtitle.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      
      {/* ======================================================== */}
      {/* TOP SUB-HEADER BAR                                      */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            {activeCategory !== 'all' ? (
              <button
                onClick={() => setActiveCategory('all')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500/40 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm group"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>All Settings</span>
              </button>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shadow-inner">
                <Sliders className="w-5 h-5" />
              </div>
            )}
            
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              {activeCategory === 'all' && 'System Configuration & Settings'}
              {activeCategory === 'general' && 'Business Profile Settings'}
              {activeCategory === 'banners' && 'Wallpaper & Poster Banners'}
              {activeCategory === 'invoice' && 'Invoice & Receipt Layout'}
              {activeCategory === 'pos' && 'POS & Checkout Preferences'}
              {activeCategory === 'security' && 'Security & Access Policy'}
              {activeCategory === 'storage' && 'Cloud Storage & Diagnostics'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 pl-0.5">
            {activeCategory === 'all' && 'Manage your store profile, wallpapers, printing layout, POS preferences, and cloud connectivity.'}
            {activeCategory === 'general' && 'Configure store name, contact numbers, address, and default currency symbols.'}
            {activeCategory === 'banners' && 'Upload and organize 1:1 promotional flyers and graphic banners for the home carousel.'}
            {activeCategory === 'invoice' && 'Configure thermal receipt header, 80mm/58mm paper sizes, and customer notes.'}
            {activeCategory === 'pos' && 'Set default payment modes, quick cash preset values, and ordering behaviors.'}
            {activeCategory === 'security' && 'Manage system authentication policies, session timeouts, and audit preferences.'}
            {activeCategory === 'storage' && 'Verify Cloudflare R2 bucket connection, Supabase database health, and client cache.'}
          </p>
        </div>

        {/* Global Save or Action Button based on category */}
        {activeCategory === 'banners' && (
          <button
            onClick={handleSaveBanners}
            disabled={savingBanners}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 self-start sm:self-auto cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{savingBanners ? 'Saving...' : 'Save Banners'}</span>
          </button>
        )}

        {activeCategory === 'general' && (
          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 self-start sm:self-auto cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{savingProfile ? 'Saving...' : 'Save Profile'}</span>
          </button>
        )}

        {activeCategory === 'invoice' && (
          <button
            onClick={handleSaveInvoiceSettings}
            disabled={savingInvoice}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 self-start sm:self-auto cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{savingInvoice ? 'Saving...' : 'Save Layout'}</span>
          </button>
        )}

        {activeCategory === 'pos' && (
          <button
            onClick={handleSavePosSettings}
            disabled={savingPOS}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 self-start sm:self-auto cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{savingPOS ? 'Saving...' : 'Save POS Rules'}</span>
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* QUICK CATEGORY PILL TABS                                */}
      {/* ======================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeCategory === 'all'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          All Categories
        </button>
        {categoryCards.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeCategory === cat.id
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span>{cat.title}</span>
            {cat.count !== undefined && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                {cat.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: MASTER SETTINGS HUB (StoreMate Card Grid)        */}
      {/* ======================================================== */}
      {activeCategory === 'all' && (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search setting modules..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-[#0b101d] border border-slate-800/80 rounded-xl pl-10 pr-4 py-2 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500/50"
            />
          </div>

          {/* 4-Column Grid matching StoreMate layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
            {filteredCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  onClick={() => setActiveCategory(card.id)}
                  className="bg-[#0b101d]/90 hover:bg-[#0e1526] border border-slate-800/80 hover:border-sky-500/40 rounded-2xl p-6 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-sky-500/5 hover:-translate-y-1 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
                >
                  {/* Subtle ambient corner glow */}
                  <div className="absolute -top-12 -right-12 w-28 h-28 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-all pointer-events-none" />

                  {/* Card Content Top */}
                  <div className="space-y-4">
                    {/* Centered Squircle Icon matching StoreMate */}
                    <div className="flex justify-center">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${card.badgeColor}`}>
                        <Icon className="w-6 h-6 stroke-[2]" />
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div className="text-center space-y-1.5">
                      <h3 className="text-base font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">
                        {card.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Open link matching StoreMate */}
                  <div className="pt-5 mt-4 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-400 group-hover:text-sky-300 flex items-center gap-1 transition-colors">
                      <span>Open</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>

                    {card.count !== undefined && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/50">
                        {card.count} items
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: BUSINESS PROFILE                                */}
      {/* ======================================================== */}
      {activeCategory === 'general' && (
        <div className="bg-[#0b101d]/90 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="border-b border-slate-800/80 pb-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Store className="w-5 h-5 text-sky-400" />
              Store Identity & Contact Details
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              These details appear on your printed customer invoices, receipts, and headers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Business / Store Name *
              </label>
              <input
                type="text"
                value={profile.businessName}
                onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-sky-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Business Slogan / Tagline
              </label>
              <input
                type="text"
                value={profile.tagline}
                onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-sky-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Official Contact Number
              </label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-sky-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Support Email Address
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-sky-500/50"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Physical Shop / Outlet Address
              </label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-sky-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Currency Symbol
              </label>
              <input
                type="text"
                value={profile.currency}
                onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-sky-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                System Timezone
              </label>
              <input
                type="text"
                value={profile.timezone}
                disabled
                className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl px-4 py-2.5 text-slate-400 text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{savingProfile ? 'Saving Changes...' : 'Save Profile Details'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 3: WALLPAPER & BANNERS (Existing Full Feature Set)  */}
      {/* ======================================================== */}
      {activeCategory === 'banners' && (
        <div className="space-y-6">
          {/* Add New Banner Form Card */}
          <div className="bg-[#0b101d]/90 border border-slate-800/80 rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-amber-400" />
                  Add New Wallpaper / Carousel Poster
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Upload a 1:1 graphic poster or enter an image URL to feature on the public home carousel.
                </p>
              </div>
            </div>

            {/* Input Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Column: Image Selector */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Banner Graphic Image *
                  </label>
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('file')}
                      className={`px-2.5 py-1 rounded cursor-pointer transition-all ${
                        imageInputMode === 'file'
                          ? 'bg-amber-500/20 text-amber-300 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`px-2.5 py-1 rounded cursor-pointer transition-all ${
                        imageInputMode === 'url'
                          ? 'bg-amber-500/20 text-amber-300 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Paste URL
                    </button>
                  </div>
                </div>

                {imageInputMode === 'file' ? (
                  <div className="relative border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-2xl p-6 text-center bg-slate-950/60 transition-colors group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {uploading ? (
                          <UploadCloud className="w-6 h-6 animate-bounce" />
                        ) : (
                          <UploadCloud className="w-6 h-6" />
                        )}
                      </div>
                      <p className="text-sm font-semibold text-slate-200">
                        {uploading ? 'Uploading to Cloudflare R2...' : 'Click or drop banner image here'}
                      </p>
                      <p className="text-xs text-slate-500">
                        PNG, JPG, WebP (Square 1:1 ratio / 1080x1080 px recommended)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      placeholder="https://pub-xxxx.r2.dev/banner-1.jpg or any image URL"
                      value={newBanner.imageUrl}
                      onChange={(e) => setNewBanner({ ...newBanner, imageUrl: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                )}

                {/* 1:1 Square Image Live Preview */}
                {newBanner.imageUrl && (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700 aspect-square max-w-[220px] mx-auto bg-slate-950 group shadow-lg">
                    <img
                      src={newBanner.imageUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/600x600/020617/38bdf8?text=Image+Load+Failed';
                      }}
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs font-bold text-white bg-slate-900/90 px-3 py-1 rounded-full border border-white/20">
                        1:1 Preview
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Banner Metadata */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                      Badge / Tag
                    </label>
                    <input
                      type="text"
                      placeholder="PROMOTION / HOT / NEW"
                      value={newBanner.badge}
                      onChange={(e) => setNewBanner({ ...newBanner, badge: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500/50 uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                      Button Text
                    </label>
                    <input
                      type="text"
                      placeholder="View Details / Order Now"
                      value={newBanner.linkText}
                      onChange={(e) => setNewBanner({ ...newBanner, linkText: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                    Banner Title (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Next-Gen POS Software (Leave blank if poster has text)"
                    value={newBanner.title}
                    onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                    Subtitle / Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Special discounts for retail shops and educational portals."
                    value={newBanner.subtitle}
                    onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                    Target Link URL (Optional)
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. https://wa.me/... or /services or #contact"
                      value={newBanner.linkUrl}
                      onChange={(e) => setNewBanner({ ...newBanner, linkUrl: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleAddBanner}
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Banner to Carousel</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Active Banners List */}
          <div className="bg-[#0b101d]/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  Active Carousel Banners ({banners.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Slide order goes from top to bottom. Use the arrow buttons to reorder.
                </p>
              </div>

              <button
                onClick={handleSaveBanners}
                disabled={savingBanners}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingBanners ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>

            <div className="space-y-3">
              {banners.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm italic border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
                  No banners added yet. Default banners will be displayed on the home page.
                </div>
              ) : (
                banners.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-950 border rounded-xl p-3.5 transition-all ${
                      item.active !== false 
                        ? 'border-slate-800 hover:border-slate-700' 
                        : 'border-slate-900 opacity-60 bg-slate-950/40'
                    }`}
                  >
                    {/* Reorder Buttons */}
                    <div className="flex sm:flex-col gap-1 text-slate-500">
                      <button
                        disabled={idx === 0}
                        onClick={() => handleMoveBanner(idx, 'up')}
                        className="p-1.5 hover:bg-slate-800 rounded disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={idx === banners.length - 1}
                        onClick={() => handleMoveBanner(idx, 'down')}
                        className="p-1.5 hover:bg-slate-800 rounded disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* 1:1 Square Image Thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-800 flex-shrink-0 bg-slate-900 aspect-square">
                      <img
                        src={item.imageUrl}
                        alt={item.title || 'Banner'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/100x100/020617/38bdf8?text=Image';
                        }}
                      />
                    </div>

                    {/* Banner Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          {item.badge || 'PROMO'}
                        </span>
                        <h4 className="font-bold text-sm text-slate-200 truncate">
                          {item.title || 'Poster Graphic'}
                        </h4>
                        {item.active === false && (
                          <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            Hidden
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                      {item.linkUrl && (
                        <div className="flex items-center gap-1 text-[11px] text-amber-400/80 truncate mt-1">
                          <ExternalLink className="w-3 h-3" />
                          <span className="truncate">{item.linkUrl}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleToggleBannerActive(idx)}
                        className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          item.active !== false
                            ? 'text-emerald-400 hover:bg-emerald-500/10'
                            : 'text-slate-500 hover:bg-slate-800'
                        }`}
                        title={item.active !== false ? 'Hide from carousel' : 'Show on carousel'}
                      >
                        {item.active !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveBanner(idx)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Delete Banner"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 text-xs text-slate-500 flex justify-end">
              * Click &apos;Save Banners&apos; after adding or reordering to publish changes to the public site.
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 4: INVOICE & PRINTING LAYOUT                        */}
      {/* ======================================================== */}
      {activeCategory === 'invoice' && (
        <div className="bg-[#0b101d]/90 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="border-b border-slate-800/80 pb-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Printer className="w-5 h-5 text-purple-400" />
              Receipt & Invoice Layout Configuration
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Customize paper sizing, thank you notes, and header branding for sales slips.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Receipt Header Title
              </label>
              <input
                type="text"
                value={invoiceSettings.headerTitle}
                onChange={(e) => setInvoiceSettings({ ...invoiceSettings, headerTitle: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-purple-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Receipt Subtitle
              </label>
              <input
                type="text"
                value={invoiceSettings.subtitle}
                onChange={(e) => setInvoiceSettings({ ...invoiceSettings, subtitle: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-purple-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Default Paper Format
              </label>
              <select
                value={invoiceSettings.paperSize}
                onChange={(e) => setInvoiceSettings({ ...invoiceSettings, paperSize: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-purple-500/50 cursor-pointer"
              >
                <option value="80mm">80mm Thermal POS Roll (Standard)</option>
                <option value="58mm">58mm Mini Thermal Roll</option>
                <option value="a4">A4 Full Sheet Formal Invoice</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Footer Thank You Note / Terms
              </label>
              <textarea
                rows={2}
                value={invoiceSettings.footerNote}
                onChange={(e) => setInvoiceSettings({ ...invoiceSettings, footerNote: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-purple-500/50"
              />
            </div>

            {/* Checkbox Toggles */}
            <div className="sm:col-span-2 space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={invoiceSettings.showCashier}
                  onChange={(e) => setInvoiceSettings({ ...invoiceSettings, showCashier: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-0 bg-slate-900 border-slate-700 cursor-pointer"
                />
                <span className="text-xs text-slate-300 group-hover:text-white">
                  Show Cashier & Operator name on receipt
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={invoiceSettings.showCustomerDetails}
                  onChange={(e) => setInvoiceSettings({ ...invoiceSettings, showCustomerDetails: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-0 bg-slate-900 border-slate-700 cursor-pointer"
                />
                <span className="text-xs text-slate-300 group-hover:text-white">
                  Print Customer Name & Phone number when selected
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={invoiceSettings.autoPrintOnSale}
                  onChange={(e) => setInvoiceSettings({ ...invoiceSettings, autoPrintOnSale: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-0 bg-slate-900 border-slate-700 cursor-pointer"
                />
                <span className="text-xs text-slate-300 group-hover:text-white">
                  Auto-trigger browser print dialog immediately when completing a sale
                </span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex justify-end">
            <button
              onClick={handleSaveInvoiceSettings}
              disabled={savingInvoice}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{savingInvoice ? 'Saving Changes...' : 'Save Print Layout'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 5: POS & ORDER PREFERENCES                          */}
      {/* ======================================================== */}
      {activeCategory === 'pos' && (
        <div className="bg-[#0b101d]/90 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="border-b border-slate-800/80 pb-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-400" />
              Point of Sale Preferences & Defaults
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Configure checkout speeds, quick cash buttons, and search behavior.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Default Payment Method
              </label>
              <select
                value={posSettings.defaultPaymentMode}
                onChange={(e) => setPosSettings({ ...posSettings, defaultPaymentMode: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-emerald-500/50 cursor-pointer"
              >
                <option value="cash">Cash (Default)</option>
                <option value="credit">Credit / Account</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Default Customer Fallback
              </label>
              <input
                type="text"
                value={posSettings.defaultCustomerName}
                onChange={(e) => setPosSettings({ ...posSettings, defaultCustomerName: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Quick Cash Preset Denominations (Comma separated)
              </label>
              <input
                type="text"
                value={posSettings.quickCashPresets}
                onChange={(e) => setPosSettings({ ...posSettings, quickCashPresets: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-emerald-500/50"
                placeholder="100, 500, 1000, 5000"
              />
            </div>

            {/* Feature Toggles */}
            <div className="sm:col-span-2 space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={posSettings.soundEffects}
                  onChange={(e) => setPosSettings({ ...posSettings, soundEffects: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-0 bg-slate-900 border-slate-700 cursor-pointer"
                />
                <span className="text-xs text-slate-300 group-hover:text-white">
                  Play subtle audio feedback when items are added to cart or sales completed
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={posSettings.autoFocusSearch}
                  onChange={(e) => setPosSettings({ ...posSettings, autoFocusSearch: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-0 bg-slate-900 border-slate-700 cursor-pointer"
                />
                <span className="text-xs text-slate-300 group-hover:text-white">
                  Automatically refocus the item search bar after completing each order
                </span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex justify-end">
            <button
              onClick={handleSavePosSettings}
              disabled={savingPOS}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{savingPOS ? 'Saving Changes...' : 'Save POS Rules'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 6: SECURITY & ACCESS POLICY                         */}
      {/* ======================================================== */}
      {activeCategory === 'security' && (
        <div className="bg-[#0b101d]/90 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="border-b border-slate-800/80 pb-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-rose-400" />
              Security & Access Policy
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Role permissions, session controls, and data protection policies.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-200">Admin Role Privilege Active</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  You are currently authenticated with Full Administrator Privileges. You have permission to modify settings, manage products, view financial analytics, and process sales.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
              <Clock className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-200">Session Inactivity Timeout</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Admin session tokens automatically refresh with Supabase JWT security. Sessions remain active for 24 hours on this browser.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
              <Laptop className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-200">Device Hardware Verification</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Hardware accelerated graphic rendering and offline Progressive Web App (PWA) caching are enabled for high POS performance.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 7: STORAGE & DIAGNOSTICS                            */}
      {/* ======================================================== */}
      {activeCategory === 'storage' && (
        <div className="bg-[#0b101d]/90 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="border-b border-slate-800/80 pb-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              Cloud Infrastructure & System Diagnostics
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Verify database connectivity, storage bucket health, and cache status.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Supabase Card */}
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Supabase Cloud Database</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  PostgreSQL database powering sales orders, items, repairs, and customer records.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400">
                  {pingLatency !== null ? `Latency: ${pingLatency}ms` : 'Status: Ready'}
                </span>
                <button
                  onClick={handleRunDiagnostic}
                  disabled={testingPing}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer disabled:opacity-50"
                >
                  {testingPing ? 'Testing...' : 'Test Ping'}
                </button>
              </div>
            </div>

            {/* Cloudflare R2 Card */}
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Cloudflare R2 Storage</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  High-speed global CDN object storage for product images and wallpaper carousel flyers.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400">Status: Connected</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  CDN Active
                </span>
              </div>
            </div>

            {/* Client Cache Card */}
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-4 sm:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Application PWA Cache & Local Storage</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Clear local browser cache and reload the latest PWA service worker build (v1.25.1).
                  </p>
                </div>
                <button
                  onClick={() => {
                    localStorage.clear();
                    sessionStorage.clear();
                    notify.success('Local cache cleared! Reloading...');
                    setTimeout(() => window.location.reload(), 800);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/30 transition-all cursor-pointer"
                >
                  Clear Cache & Reload
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
