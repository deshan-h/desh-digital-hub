import React, { useState, useEffect } from 'react';
import { settingsService } from '../../services/supabaseService';
import { supabase } from '../../config/supabase';
import { uploadToCloudflare } from '../../services/cloudflareStorage';
import { notify } from '../../utils/toast';
import ItemsManager from './ItemsManager';
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
  Printer,
  Database,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Palette,
  Package,
  Layers,
  Sparkles,
  Clock,
  ShieldCheck,
  Check
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

export default function Settings({ isAdmin, posCategories, fetchCategories }) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ad-posts'); // 'ad-posts' | 'items' | 'appearance' | 'storage'

  // ==========================================
  // 1. AD POST / BANNERS STATE
  // ==========================================
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

  // ==========================================
  // 2. APPEARANCE SETTINGS STATE
  // ==========================================
  const [savingAppearance, setSavingAppearance] = useState(false);
  const [appearance, setAppearance] = useState({
    theme: 'sapphire-obsidian',
    compactMode: true,
    accentColor: '#38bdf8',
    receiptTitle: 'DESH DIGITAL HUB',
    receiptSubtitle: 'Computer Systems, Printing & IT Solutions',
    paperSize: '80mm', // '80mm' | '58mm' | 'a4'
    footerNote: 'Thank you for your business! Please visit us again.',
    showCashier: true,
    showCustomerDetails: true,
    autoPrintOnSale: false
  });

  // ==========================================
  // 3. STORAGE & DIAGNOSTICS STATE
  // ==========================================
  const [pingLatency, setPingLatency] = useState(null);
  const [testingPing, setTestingPing] = useState(false);

  // ==========================================
  // 4. PUBLIC CATEGORY VISIBILITY STATE
  // ==========================================
  const [hiddenCategories, setHiddenCategories] = useState([]);
  const [savingCategoryVisibility, setSavingCategoryVisibility] = useState(false);

  useEffect(() => {
    fetchInitialSettings();
  }, []);

  const fetchInitialSettings = async () => {
    try {
      const [bannersData, appearanceData, hiddenIds] = await Promise.all([
        settingsService.getSetting('banners').catch(() => null),
        settingsService.getSetting('appearance_settings').catch(() => null),
        settingsService.getPublicCategoryVisibility().catch(() => [])
      ]);

      if (bannersData && Array.isArray(bannersData.items) && bannersData.items.length > 0) {
        setBanners(bannersData.items);
      } else {
        setBanners(DEFAULT_BANNERS);
      }

      if (appearanceData && typeof appearanceData === 'object') {
        setAppearance((prev) => ({ ...prev, ...appearanceData }));
      }

      setHiddenCategories(Array.isArray(hiddenIds) ? hiddenIds : []);
    } catch (error) {
      console.error(error);
      notify.error('Failed to load settings data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCategoryVisibility = async (catIdOrName) => {
    setSavingCategoryVisibility(true);
    const isHidden = hiddenCategories.includes(catIdOrName);
    const updated = isHidden
      ? hiddenCategories.filter(id => id !== catIdOrName)
      : [...hiddenCategories, catIdOrName];
    setHiddenCategories(updated);
    try {
      await settingsService.setPublicCategoryVisibility(updated);
      notify.success(isHidden ? 'Category is now visible on public website!' : 'Category hidden from public website!');
    } catch (e) {
      notify.error('Failed to update category visibility');
    } finally {
      setSavingCategoryVisibility(false);
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
      notify.success('Flyer image uploaded to Cloudflare R2 successfully!');
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
    notify.success('Banner added. Click "Save Changes" to publish to carousel!');
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
      notify.success('Public wallpaper & ad carousel updated successfully!');
    } catch (error) {
      console.error(error);
      notify.error('Failed to save banners');
    } finally {
      setSavingBanners(false);
    }
  };

  // --- Appearance Handler ---
  const handleSaveAppearance = async () => {
    setSavingAppearance(true);
    try {
      await settingsService.saveSetting('appearance_settings', appearance);
      notify.success('Appearance & print layout settings saved successfully!');
    } catch (error) {
      console.error(error);
      notify.error('Failed to save appearance settings');
    } finally {
      setSavingAppearance(false);
    }
  };

  // --- Storage Diagnostic Ping ---
  const handleRunDiagnostic = async () => {
    setTestingPing(true);
    const start = performance.now();
    try {
      await supabase.from('settings').select('id').limit(1);
      const end = performance.now();
      const latency = Math.round(end - start);
      setPingLatency(latency);
      notify.success(`Database connection verified in ${latency}ms`);
    } catch (err) {
      console.error(err);
      notify.error('Database ping failed');
    } finally {
      setTestingPing(false);
    }
  };

  if (loading) return <Loader text="Loading Settings..." subText="Configuring Preferences" />;

  // 4 Primary Setting Sections
  const navTabs = [
    {
      id: 'ad-posts',
      label: 'Ad Post Settings',
      shortLabel: 'Ad Posts',
      icon: ImageIcon,
      count: banners.length,
      badgeColor: 'text-amber-400'
    },
    {
      id: 'items',
      label: 'Product & Items',
      shortLabel: 'Products',
      icon: Package,
      badgeColor: 'text-emerald-400'
    },
    {
      id: 'appearance',
      label: 'Appearance Settings',
      shortLabel: 'Appearance',
      icon: Palette,
      badgeColor: 'text-purple-400'
    },
    {
      id: 'storage',
      label: 'Storage Settings',
      shortLabel: 'Storage',
      icon: Database,
      badgeColor: 'text-sky-400'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      
      {/* ======================================================== */}
      {/* HEADER & 4-TAB NAVIGATION                                */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-sky-400" />
            <span>Settings & Control Panel</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage promotional ad posts, product inventory, receipt appearance, and cloud storage.
          </p>
        </div>

        {/* Action Button based on active tab */}
        {activeTab === 'ad-posts' && (
          <button
            onClick={handleSaveBanners}
            disabled={savingBanners}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 self-start md:self-auto cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{savingBanners ? 'Saving Changes...' : 'Save Ad Banners'}</span>
          </button>
        )}

        {activeTab === 'appearance' && (
          <button
            onClick={handleSaveAppearance}
            disabled={savingAppearance}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 self-start md:self-auto cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{savingAppearance ? 'Saving Layout...' : 'Save Appearance'}</span>
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* 4 PRIMARY SETTINGS TABS (Sleek Segment Switch)           */}
      {/* ======================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar p-1.5 bg-[#0b101d]/90 border border-slate-800/80 rounded-2xl shadow-inner">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : tab.badgeColor}`} />
              <span className="truncate">{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: AD POST SETTINGS (Promotional Wallpapers/Posters)  */}
      {/* ======================================================== */}
      {activeTab === 'ad-posts' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Add New Flyer Card */}
          <div className="bg-[#0b101d]/90 border border-slate-800/80 rounded-2xl p-6 sm:p-7 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-amber-400" />
                  Add New Promotional Ad Post / Wallpaper
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Upload a 1:1 square graphic flyer or enter an image URL to display on the public customer carousel.
                </p>
              </div>
            </div>

            {/* Input Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Column: Image Uploader */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Graphic Flyer Image *
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
                        {uploading ? 'Uploading to Cloudflare R2...' : 'Click or drop flyer image here'}
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

                {/* 1:1 Live Square Preview */}
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

              {/* Right Column: Metadata */}
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
                    Ad Title (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Special PC Repair Offer (Leave blank if poster has text)"
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
                    placeholder="e.g. Free software diagnostics for students."
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
                    <span>Add to Active Carousel</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Active Carousel Banners List */}
          <div className="bg-[#0b101d]/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  Active Carousel Posters ({banners.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Slide order goes top to bottom. Click the save button after reordering.
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
                  No ad banners added yet. Default banners will be shown on the home carousel.
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
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PRODUCT AND ITEMS (Embedded ItemsManager)         */}
      {/* ======================================================== */}
      {activeTab === 'items' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#0b101d]/90 border border-slate-800/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                Product & Services Catalog Management
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage your product prices, service categories, public website visibility, and PDF price sheets.
              </p>
            </div>
          </div>

          {/* Public Website Category Visibility Manager */}
          <div className="bg-[#0b101d]/90 border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
                  <Eye className="w-4 h-4 text-sky-400" />
                  Public Website Category Visibility (ප්‍රසිද්ධ වෙබ් අඩවියේ පෙන්වීම/සැඟවීම)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click the toggle to show or hide specific service categories from the public website home page.
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 self-start sm:self-auto">
                {posCategories?.length || 0} Total Categories
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {(posCategories || []).map((cat) => {
                const isHidden = hiddenCategories.includes(cat.id) || hiddenCategories.includes(cat.category);
                return (
                  <div
                    key={cat.id || cat.category}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                      isHidden
                        ? 'bg-slate-950/60 border-slate-800/80 opacity-60'
                        : 'bg-[#09172c]/70 border-sky-500/20 hover:border-sky-500/40'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-200 truncate">{cat.category}</div>
                      <div className={`text-[10px] font-semibold flex items-center gap-1 mt-0.5 ${
                        isHidden ? 'text-slate-500' : 'text-emerald-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isHidden ? 'bg-slate-500' : 'bg-emerald-400'}`}></span>
                        <span>{isHidden ? 'Hidden on Web' : 'Visible on Web'}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleCategoryVisibility(cat.id || cat.category)}
                      disabled={savingCategoryVisibility}
                      className={`p-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
                        isHidden
                          ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                          : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30'
                      }`}
                      title={isHidden ? 'Click to show on public website' : 'Click to hide from public website'}
                    >
                      {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Embedded Complete ItemsManager */}
          <ItemsManager 
            posCategories={posCategories} 
            fetchCategories={fetchCategories} 
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: APPEARANCE SETTINGS (Theme & Receipt Layout)      */}
      {/* ======================================================== */}
      {activeTab === 'appearance' && (
        <div className="bg-[#0b101d]/90 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-800/80 pb-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-400" />
              Theme Appearance & Print Layout Configuration
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Customize the sapphire dark interface, thermal POS receipt styling, and invoice print formats.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Theme Card */}
            <div className="sm:col-span-2 p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                Active Interface Theme
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl border border-sky-500/40 bg-sky-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0c2340] to-sky-500 border border-sky-400/50 shadow-inner"></div>
                    <div>
                      <span className="text-xs font-bold text-white block">Oceanic Sapphire Dark</span>
                      <span className="text-[10px] text-sky-300">Executive Deep Navy with Glass Accents</span>
                    </div>
                  </div>
                  <Check className="w-4 h-4 text-sky-400" />
                </div>

                <div className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/40 flex items-center justify-between opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-900 to-slate-700 border border-slate-600"></div>
                    <div>
                      <span className="text-xs font-bold text-slate-300 block">Pure Obsidian Black</span>
                      <span className="text-[10px] text-slate-500">Ultra-Minimal Monochrome</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">Default</span>
                </div>
              </div>
            </div>

            {/* Receipt Header Title */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Receipt Header Title
              </label>
              <input
                type="text"
                value={appearance.receiptTitle}
                onChange={(e) => setAppearance({ ...appearance, receiptTitle: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-purple-500/50"
              />
            </div>

            {/* Receipt Subtitle */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Receipt Subtitle / Tagline
              </label>
              <input
                type="text"
                value={appearance.receiptSubtitle}
                onChange={(e) => setAppearance({ ...appearance, receiptSubtitle: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-purple-500/50"
              />
            </div>

            {/* Default Paper Format */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Default Receipt Format
              </label>
              <select
                value={appearance.paperSize}
                onChange={(e) => setAppearance({ ...appearance, paperSize: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-purple-500/50 cursor-pointer"
              >
                <option value="80mm">80mm Thermal POS Roll (Standard)</option>
                <option value="58mm">58mm Mini Thermal Roll</option>
                <option value="a4">A4 Full Sheet Formal Invoice</option>
              </select>
            </div>

            {/* Thank You Note */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Footer Thank You Note
              </label>
              <input
                type="text"
                value={appearance.footerNote}
                onChange={(e) => setAppearance({ ...appearance, footerNote: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-purple-500/50"
              />
            </div>

            {/* Checkbox Toggles */}
            <div className="sm:col-span-2 space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={appearance.showCashier}
                  onChange={(e) => setAppearance({ ...appearance, showCashier: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-0 bg-slate-900 border-slate-700 cursor-pointer"
                />
                <span className="text-xs text-slate-300 group-hover:text-white">
                  Show Cashier name & Station ID on printed receipts
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={appearance.showCustomerDetails}
                  onChange={(e) => setAppearance({ ...appearance, showCustomerDetails: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-0 bg-slate-900 border-slate-700 cursor-pointer"
                />
                <span className="text-xs text-slate-300 group-hover:text-white">
                  Print Customer Name & Contact details when attached to sales order
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={appearance.autoPrintOnSale}
                  onChange={(e) => setAppearance({ ...appearance, autoPrintOnSale: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-0 bg-slate-900 border-slate-700 cursor-pointer"
                />
                <span className="text-xs text-slate-300 group-hover:text-white">
                  Auto-trigger browser print dialog immediately after confirming order
                </span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex justify-end">
            <button
              onClick={handleSaveAppearance}
              disabled={savingAppearance}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{savingAppearance ? 'Saving Changes...' : 'Save Appearance Settings'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: STORAGE SETTINGS (Cloudflare R2, Supabase, Cache) */}
      {/* ======================================================== */}
      {activeTab === 'storage' && (
        <div className="bg-[#0b101d]/90 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-800/80 pb-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Database className="w-5 h-5 text-sky-400" />
              Cloud Storage & Database Infrastructure
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Verify Cloudflare R2 object storage, test database response latency, and clear client PWA cache.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Cloudflare R2 Storage Card */}
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-sky-400" />
                    Cloudflare R2 Object Storage
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  High-speed global S3-compatible bucket storing product catalog images and promotional carousel flyers.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400">Status: Connected</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  CDN Active
                </span>
              </div>
            </div>

            {/* Supabase Cloud Database Card */}
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    Supabase PostgreSQL Database
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Real-time database powering inventory items, repair jobs, sales records, customers, and configuration.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400">
                  {pingLatency !== null ? `Latency: ${pingLatency}ms` : 'Status: Ready'}
                </span>
                <button
                  onClick={handleRunDiagnostic}
                  disabled={testingPing}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white cursor-pointer disabled:opacity-50"
                >
                  {testingPing ? 'Testing...' : 'Test Ping'}
                </button>
              </div>
            </div>

            {/* Client Cache Management Card */}
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-4 sm:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-purple-400" />
                    Browser Cache & Progressive Web App (PWA) Storage
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Unregister old Service Worker versions, flush temporary storage, and reload fresh application state (v1.25.1).
                  </p>
                </div>
                <button
                  onClick={async () => {
                    if ('serviceWorker' in navigator) {
                      const registrations = await navigator.serviceWorker.getRegistrations();
                      for (let reg of registrations) {
                        await reg.unregister();
                      }
                    }
                    localStorage.clear();
                    sessionStorage.clear();
                    notify.success('Cache cleared! Reloading application...');
                    setTimeout(() => window.location.reload(true), 600);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/30 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
                >
                  Clear Cache & Hard Reload
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
