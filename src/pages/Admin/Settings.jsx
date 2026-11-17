import React, { useState, useEffect } from 'react';
import { settingsService } from '../../services/supabaseService';
import { uploadToCloudflare, isCloudflareUploadConfigured } from '../../services/cloudflareStorage';
import { notify } from '../../utils/toast';
import { 
  Save, 
  Plus, 
  Trash2, 
  Info, 
  Settings as SettingsIcon, 
  Image as ImageIcon, 
  UploadCloud, 
  Cloud, 
  Link as LinkIcon, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Sparkles, 
  HelpCircle, 
  ExternalLink,
  CheckCircle2,
  AlertTriangle
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
  const [activeTab, setActiveTab] = useState('banners'); // 'banners' | 'news'
  const [loading, setLoading] = useState(true);
  const [savingNews, setSavingNews] = useState(false);
  const [savingBanners, setSavingBanners] = useState(false);
  const [newsItems, setNewsItems] = useState([]);
  const [newItemText, setNewItemText] = useState('');

  // Banners state
  const [banners, setBanners] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [imageInputMode, setImageInputMode] = useState('file'); // 'file' | 'url'
  const [newBanner, setNewBanner] = useState({
    title: '',
    subtitle: '',
    badge: 'PROMOTION',
    imageUrl: '',
    linkUrl: '',
    linkText: 'View Details',
    active: true
  });

  const isR2Configured = isCloudflareUploadConfigured();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const [newsData, bannersData] = await Promise.all([
        settingsService.getSetting('news').catch(() => null),
        settingsService.getSetting('banners').catch(() => null)
      ]);

      if (newsData && newsData.items) {
        setNewsItems(newsData.items);
      }
      if (bannersData && Array.isArray(bannersData.items) && bannersData.items.length > 0) {
        setBanners(bannersData.items);
      } else {
        setBanners(DEFAULT_BANNERS);
      }
    } catch (error) {
      console.error(error);
      notify.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // BANNER HANDLERS
  // ==========================================
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
      notify.error(err.message || 'Image upload failed. You can also paste an image URL directly.');
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
    notify.success('Banner added to list. Click "Save Banners" to publish!');
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

  // ==========================================
  // NEWS TICKER HANDLERS
  // ==========================================
  const handleSaveNews = async () => {
    setSavingNews(true);
    try {
      await settingsService.saveSetting('news', { items: newsItems });
      notify.success('Public notice bar updated successfully!');
    } catch (error) {
      console.error(error);
      notify.error('Failed to save settings');
    } finally {
      setSavingNews(false);
    }
  };

  const addNewsItem = () => {
    if (!newItemText.trim()) return;
    setNewsItems([...newsItems, newItemText.trim()]);
    setNewItemText('');
  };

  const removeNewsItem = (index) => {
    setNewsItems(newsItems.filter((_, i) => i !== index));
  };

  const moveNewsItem = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newsItems.length) return;
    const newItems = [...newsItems];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, moved);
    setNewsItems(newItems);
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-3">
            <SettingsIcon className="w-7 h-7 text-emerald-500" />
            System Settings
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure graphic wallpaper banners, storage, and public notice announcements.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('banners')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'banners'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Wallpaper Banners</span>
            <span className="text-xs px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
              {banners.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'news'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Notice Bar</span>
            <span className="text-xs px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
              {newsItems.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: WALLPAPER BANNERS (CLOUDFLARE R2 INTEGRATED)        */}
      {/* ========================================================= */}
      {activeTab === 'banners' && (
        <div className="space-y-6">
          {/* Cloudflare Storage Status Banner */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 flex-shrink-0">
                <Cloud className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-200 text-sm sm:text-base">
                    Cloudflare R2 Object Storage
                  </h3>
                  {isR2Configured ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Auto-Upload Ready
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="w-3 h-3" /> Direct URL Mode
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fast Edge CDN delivery with 0 egress bandwidth cost for high-resolution graphics.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(!showGuide)}
              className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-2 rounded-lg border border-cyan-500/20 transition-all cursor-pointer flex-shrink-0"
            >
              <HelpCircle className="w-4 h-4" />
              <span>{showGuide ? 'Hide Cloudflare Guide' : 'Cloudflare Setup Guide'}</span>
            </button>
          </div>

          {/* Cloudflare Setup Guide Accordion */}
          {showGuide && (
            <div className="bg-slate-950 border border-cyan-500/30 rounded-2xl p-5 text-sm text-slate-300 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Cloudflare R2 & Worker Integration Steps
                </h4>
                <span className="text-xs text-slate-400">Takes less than 3 minutes</span>
              </div>
              
              <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <li>
                  <strong className="text-white">Create R2 Bucket:</strong> In Cloudflare Dashboard, go to <em>R2 Object Storage</em> &gt; <em>Create bucket</em> (e.g. <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">desh-hub-banners</code>).
                </li>
                <li>
                  <strong className="text-white">Enable Public Access:</strong> In bucket <em>Settings</em>, scroll to <em>Public Access</em> &gt; Allow <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">r2.dev</code> access or connect your custom domain (e.g. <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">cdn.yourdomain.com</code>).
                </li>
                <li>
                  <strong className="text-white">Create Worker Gateway:</strong> In <em>Workers & Pages</em> &gt; <em>Create Worker</em>, bind your R2 bucket as <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">MY_BUCKET</code>. Set your worker URL in <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">.env</code> as <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">VITE_CLOUDFLARE_UPLOAD_URL</code>.
                </li>
                <li>
                  <strong className="text-white">Instant Alternative:</strong> You can also upload any image directly to your Cloudflare R2 bucket in the dashboard, copy the image link, and paste it below under <em>"Enter Image URL"</em>!
                </li>
              </ol>
            </div>
          )}

          {/* Add New Banner Form Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-cyan-400" />
                  Add New Wallpaper / Banner
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Upload an image or specify an image URL to feature on the public home carousel.
                </p>
              </div>

              <button
                onClick={handleSaveBanners}
                disabled={savingBanners}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-cyan-600 hover:bg-cyan-500 text-slate-950 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50 self-start sm:self-auto cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{savingBanners ? 'Saving...' : 'Save Banners'}</span>
              </button>
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
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold'
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
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Paste URL
                    </button>
                  </div>
                </div>

                {imageInputMode === 'file' ? (
                  <div className="relative border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-2xl p-6 text-center bg-slate-950/60 transition-colors group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
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
                        PNG, JPG, WebP up to 10MB (Square 1:1 ratio / 1080x1080 px recommended)
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                )}

                {/* 1:1 Square Image Live Preview */}
                {newBanner.imageUrl && (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700 aspect-square max-w-[240px] mx-auto bg-slate-950 group shadow-lg">
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50 uppercase"
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                    Banner Title (Optional for flyers with text)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Next-Gen POS Software (Leave blank if poster has text)"
                    value={newBanner.title}
                    onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50"
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleAddBanner}
                    className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Banner to Carousel</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Existing Banners List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-cyan-400" />
                  Active Carousel Banners ({banners.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Slide order goes from top to bottom. Use the arrow buttons to reorder.
                </p>
              </div>

              <button
                onClick={handleSaveBanners}
                disabled={savingBanners}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs bg-cyan-600 hover:bg-cyan-500 text-slate-950 transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)] disabled:opacity-50 cursor-pointer"
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
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                          {item.badge || 'PROMO'}
                        </span>
                        <h4 className="font-bold text-sm text-slate-200 truncate">
                          {item.title}
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
                        <div className="flex items-center gap-1 text-[11px] text-cyan-400/80 truncate mt-1">
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

      {/* ========================================================= */}
      {/* TAB 2: NOTICE BAR ANNOUNCEMENTS (EXISTING)                 */}
      {/* ========================================================= */}
      {activeTab === 'news' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Info className="w-5 h-5 text-emerald-400" />
                Public Notice Bar Announcements
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                These messages scroll continuously at the top of the public customer portal.
              </p>
            </div>
            <button
              onClick={handleSaveNews}
              disabled={savingNews}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 self-start sm:self-auto cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{savingNews ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>

          {/* Add Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type a new announcement message here..."
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addNewsItem()}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
            <button
              onClick={addNewsItem}
              className="px-5 py-3 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 hover:border-emerald-500/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

          {/* List of Messages */}
          <div className="space-y-2">
            {newsItems.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm italic border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
                No announcement messages set. Default fallback messages will show.
              </div>
            ) : (
              newsItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-slate-200 text-sm group hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-col gap-0.5 text-slate-500 hover:text-slate-400">
                    <button
                      disabled={idx === 0}
                      onClick={() => moveNewsItem(idx, 'up')}
                      className="p-0.5 hover:bg-slate-800 rounded disabled:opacity-20 cursor-pointer"
                      title="Move Up"
                    >
                      ▲
                    </button>
                    <button
                      disabled={idx === newsItems.length - 1}
                      onClick={() => moveNewsItem(idx, 'down')}
                      className="p-0.5 hover:bg-slate-800 rounded disabled:opacity-20 cursor-pointer"
                      title="Move Down"
                    >
                      ▼
                    </button>
                  </div>
                  <span className="flex-1 font-mono text-xs text-slate-300">{item}</span>
                  <button
                    onClick={() => removeNewsItem(idx)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Remove message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-4 text-xs text-slate-500 flex justify-end">
            * Remember to click &apos;Save Settings&apos; after making changes.
          </div>
        </div>
      )}
    </div>
  );
}
