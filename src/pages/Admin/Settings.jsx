import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { settingsService } from '../../services/supabaseService';
import { supabase } from '../../config/supabase';
import { uploadToCloudflare } from '../../services/cloudflareStorage';
import { generateBannerCopy, generateServiceCopy, generateAiImage } from '../../services/bannerAiService';
import { DEFAULT_SERVICES } from '../../components/home/Services';
import { notify } from '../../utils/toast';
import { 
  Save, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  UploadCloud, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Database, 
  Sliders, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles, 
  Clock, 
  Check, 
  Activity, 
  X,
  Edit,
  Hash,
  Wand2,
  Zap,
  ArrowRight,
  RotateCcw,
  Layers,
  Palette,
  ChevronUp,
  ChevronDown
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
    active: true,
    order: 1
  },
  {
    id: 'default-2',
    title: 'DESH Edu Hub Portal',
    subtitle: 'Free and premium educational resources, exam papers and study guides.',
    badge: 'EDUCATIONAL',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    linkUrl: 'https://deshedublog.blogspot.com',
    linkText: 'Visit Edu Hub',
    active: true,
    order: 2
  }
];

export default function Settings({ isAdmin }) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ad-posts'); // 'ad-posts' | 'storage'

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
  const [isNewBannerOpen, setIsNewBannerOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [editUploading, setEditUploading] = useState(false);
  const [editImageInputMode, setEditImageInputMode] = useState('file');

  // ==========================================
  // AI BANNER COPYWRITER STATE
  // ==========================================
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiTarget, setAiTarget] = useState('new'); // 'new' | 'edit'
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLanguage, setAiLanguage] = useState('sinhala'); // 'sinhala' | 'english' | 'singlish'
  const [aiStyle, setAiStyle] = useState('promotional');
  const [aiBadge, setAiBadge] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const handleOpenAiModal = (target) => {
    setAiTarget(target);
    const existingTitle = target === 'new' ? newBanner.title : (editingBanner?.title || '');
    setAiPrompt(existingTitle || '');
    setAiResult(null);
    setIsAiModalOpen(true);
  };

  const handleGenerateAiCopy = async (customPrompt) => {
    const promptToUse = (customPrompt || aiPrompt).trim();
    if (!promptToUse) {
      notify.error('කරුණාකර මාතෘකාවක් ඇතුළත් කරන්න හෝ පහතින් එකක් තෝරන්න.');
      return;
    }
    setAiGenerating(true);
    try {
      const copy = await generateBannerCopy({
        prompt: promptToUse,
        style: aiStyle,
        badge: aiBadge,
        language: aiLanguage,
      });
      setAiResult(copy);
      notify.success(`✨ Copy generated via ${copy.engine}!`);
    } catch (err) {
      console.error('AI copy error:', err);
      notify.error(err.message || 'Failed to generate copy.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleApplyAiCopy = () => {
    if (!aiResult) return;
    if (aiTarget === 'new') {
      setNewBanner((prev) => ({
        ...prev,
        title: aiResult.title || prev.title,
        subtitle: aiResult.subtitle || prev.subtitle,
        badge: aiResult.badge || prev.badge,
        linkText: aiResult.linkText || prev.linkText,
        linkUrl: aiResult.linkUrl || prev.linkUrl || '#services',
      }));
    } else if (aiTarget === 'edit' && editingBanner) {
      setEditingBanner((prev) => ({
        ...prev,
        title: aiResult.title || prev.title,
        subtitle: aiResult.subtitle || prev.subtitle,
        badge: aiResult.badge || prev.badge,
        linkText: aiResult.linkText || prev.linkText,
        linkUrl: aiResult.linkUrl || prev.linkUrl || '#services',
      }));
    }
    setIsAiModalOpen(false);
    notify.success('✨ Banner content updated with AI copy!');
  };

  // ==========================================
  // 2. STORAGE & DIAGNOSTICS STATE
  // ==========================================
  const [pingLatency, setPingLatency] = useState(null);
  const [testingPing, setTestingPing] = useState(false);

  // ==========================================
  // 3. PUBLIC SERVICES & CATEGORIES STATE
  // ==========================================
  const [servicesList, setServicesList] = useState([]);
  const [savingServices, setSavingServices] = useState(false);
  const [serviceImageMode, setServiceImageMode] = useState('file'); // 'file' | 'url' | 'ai'
  const [serviceUploading, setServiceUploading] = useState(false);
  const [serviceAiPrompt, setServiceAiPrompt] = useState('');
  const [aiGeneratingServiceImage, setAiGeneratingServiceImage] = useState(false);
  const [aiGeneratingServiceDesc, setAiGeneratingServiceDesc] = useState(false);
  const [newSubInput, setNewSubInput] = useState('');
  const [newService, setNewService] = useState({
    title: '',
    sinhala: '',
    image: '',
    description: '',
    items: [],
    active: true
  });

  // Edit Service Modal State
  const [isNewServiceOpen, setIsNewServiceOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [editServiceImageMode, setEditServiceImageMode] = useState('file');
  const [editServiceUploading, setEditServiceUploading] = useState(false);
  const [editServiceAiPrompt, setEditServiceAiPrompt] = useState('');
  const [editAiGeneratingServiceImage, setEditAiGeneratingServiceImage] = useState(false);
  const [editAiGeneratingServiceDesc, setEditAiGeneratingServiceDesc] = useState(false);
  const [editSubInput, setEditSubInput] = useState('');

  useEffect(() => {
    fetchInitialSettings();
  }, []);

  const fetchInitialSettings = async () => {
    try {
      // 1. Fetch Banners
      const bannersData = await settingsService.getSetting('banners').catch(() => null);

      if (bannersData && Array.isArray(bannersData.items)) {
        const items = bannersData.items.map((b, idx) => ({
          ...b,
          order: b.order !== undefined && b.order !== null ? Number(b.order) : idx + 1
        }));
        items.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
        setBanners(items);
      } else {
        setBanners(DEFAULT_BANNERS.map((b, idx) => ({ ...b, order: idx + 1 })));
      }

      // 2. Fetch Public Services & Categories
      const servicesData = await settingsService.getSetting('public_services').catch(() => null);
      if (servicesData && Array.isArray(servicesData.items) && servicesData.items.length > 0) {
        const items = servicesData.items.map((s, idx) => ({
          ...s,
          order: s.order !== undefined && s.order !== null ? Number(s.order) : idx + 1,
          items: Array.isArray(s.items) ? s.items : []
        }));
        items.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
        setServicesList(items);
      } else {
        setServicesList(DEFAULT_SERVICES.map((s, idx) => ({ ...s, order: idx + 1, active: true })));
      }
    } catch (error) {
      console.error(error);
      notify.error('Failed to load settings data');
    } finally {
      setLoading(false);
    }
  };

  const saveBannersToSupabase = async (newBanners) => {
    const ordered = newBanners.map((b, idx) => ({
      ...b,
      order: idx + 1
    }));
    setBanners(ordered);
    setSavingBanners(true);
    try {
      await settingsService.saveSetting('banners', { items: ordered });
      return true;
    } catch (error) {
      console.error(error);
      notify.error('Failed to save banners to database');
      return false;
    } finally {
      setSavingBanners(false);
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

  const handleEditFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editingBanner) return;

    setEditUploading(true);
    try {
      const result = await uploadToCloudflare(file);
      setEditingBanner((prev) => ({ ...prev, imageUrl: result.url }));
      notify.success('New flyer image uploaded successfully!');
    } catch (err) {
      console.error(err);
      notify.error(err.message || 'Image upload failed.');
    } finally {
      setEditUploading(false);
      e.target.value = '';
    }
  };

  const handleAddBanner = async () => {
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
      order: banners.length + 1,
      createdAt: new Date().toISOString()
    };

    const updated = [...banners, item];
    const ok = await saveBannersToSupabase(updated);
    if (ok) {
      setNewBanner({
        title: '',
        subtitle: '',
        badge: 'PROMOTION',
        imageUrl: '',
        linkUrl: '',
        linkText: 'View Details',
        active: true
      });
      setIsNewBannerOpen(false);
      notify.success('Banner added and published successfully!');
    }
  };

  const handleRemoveBanner = async (index) => {
    const bannerToDelete = banners[index];
    const updated = banners.filter((_, i) => i !== index);
    const ok = await saveBannersToSupabase(updated);
    if (ok) {
      notify.success(`Banner "${bannerToDelete?.title || 'Item'}" deleted successfully!`);
    }
  };

  const handleToggleBannerActive = async (index) => {
    const updated = banners.map((b, i) => (i === index ? { ...b, active: !b.active } : b));
    const ok = await saveBannersToSupabase(updated);
    if (ok) {
      notify.success(updated[index].active ? 'Banner is now Visible on website' : 'Banner is now Hidden from website');
    }
  };

  const handleReorderBanner = async (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= banners.length || fromIndex === toIndex) return;
    const reordered = [...banners];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    const ok = await saveBannersToSupabase(reordered);
    if (ok) {
      notify.success(`Banner moved to play order #${toIndex + 1}`);
    }
  };

  const handleMoveBanner = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    handleReorderBanner(index, targetIndex);
  };

  const handleSaveEditedBanner = async (e) => {
    if (e) e.preventDefault();
    if (!editingBanner || !editingBanner.imageUrl.trim()) {
      notify.error('Please upload an image or provide an image URL.');
      return;
    }

    const originalIndex = editingBanner.originalIndex;
    const targetOrder = Math.max(1, Math.min(banners.length, Number(editingBanner.order) || (originalIndex + 1)));
    const targetIndex = targetOrder - 1;

    let updated = [...banners];
    const updatedItem = {
      ...updated[originalIndex],
      title: editingBanner.title.trim(),
      subtitle: editingBanner.subtitle.trim(),
      badge: (editingBanner.badge || 'PROMOTION').trim().toUpperCase(),
      imageUrl: editingBanner.imageUrl.trim(),
      linkUrl: editingBanner.linkUrl.trim(),
      linkText: (editingBanner.linkText || 'View Details').trim(),
      active: Boolean(editingBanner.active)
    };

    if (targetIndex !== originalIndex) {
      updated.splice(originalIndex, 1);
      updated.splice(targetIndex, 0, updatedItem);
    } else {
      updated[originalIndex] = updatedItem;
    }

    const ok = await saveBannersToSupabase(updated);
    if (ok) {
      setEditingBanner(null);
      notify.success('Banner updated and saved successfully!');
    }
  };

  const handleSaveBanners = async () => {
    setSavingBanners(true);
    try {
      await settingsService.saveSetting('banners', { items: banners });
      notify.success('Public wallpaper & promotional carousel updated successfully!');
    } catch (error) {
      console.error(error);
      notify.error('Failed to save banners');
    } finally {
      setSavingBanners(false);
    }
  };

  // ==========================================
  // PUBLIC SERVICES HANDLERS
  // ==========================================
  const handleSaveServices = async (listToSave) => {
    const list = listToSave || servicesList;
    const ordered = list.map((s, idx) => ({
      ...s,
      order: idx + 1
    }));
    setServicesList(ordered);
    setSavingServices(true);
    try {
      await settingsService.saveSetting('public_services', { items: ordered });
      notify.success('Public Services & Categories updated successfully!');
      return true;
    } catch (err) {
      console.error(err);
      notify.error('Failed to save services to Supabase');
      return false;
    } finally {
      setSavingServices(false);
    }
  };

  const handleResetDefaultServices = async () => {
    if (!window.confirm('Reset services to the original 12 standard categories? Custom changes will be overwritten.')) return;
    const initial = DEFAULT_SERVICES.map((s, idx) => ({ ...s, order: idx + 1, active: true }));
    await handleSaveServices(initial);
  };

  const handleToggleServiceVisibility = async (serviceId) => {
    const updated = servicesList.map(s => s.id === serviceId ? { ...s, active: !s.active } : s);
    await handleSaveServices(updated);
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to remove this service category?')) return;
    const updated = servicesList.filter(s => s.id !== serviceId);
    await handleSaveServices(updated);
  };

  const handleAddServiceSubItem = () => {
    const val = newSubInput.trim();
    if (!val) return;
    if (newService.items.some(i => (typeof i === 'string' ? i : i.name) === val)) {
      notify.error('This sub-service is already in the list.');
      return;
    }
    setNewService(prev => ({
      ...prev,
      items: [...prev.items, { name: val }]
    }));
    setNewSubInput('');
  };

  const handleRemoveServiceSubItem = (idxToRemove) => {
    setNewService(prev => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== idxToRemove)
    }));
  };

  const handleAddServiceCategory = async (e) => {
    e.preventDefault();
    if (!newService.title.trim() && !newService.sinhala.trim()) {
      notify.error('Please enter at least an English or Sinhala category title.');
      return;
    }
    if (!newService.image.trim()) {
      notify.error('Please provide or generate an image for the category.');
      return;
    }

    const newId = `srv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const categoryToAdd = {
      id: newId,
      title: newService.title.trim() || newService.sinhala.trim(),
      sinhala: newService.sinhala.trim() || newService.title.trim(),
      image: newService.image.trim(),
      description: newService.description.trim(),
      items: newService.items.length > 0 ? newService.items : [{ name: 'Standard Service' }],
      active: true,
      order: servicesList.length + 1
    };

    const updated = [...servicesList, categoryToAdd];
    const ok = await handleSaveServices(updated);
    if (ok) {
      setNewService({
        title: '',
        sinhala: '',
        image: '',
        description: '',
        items: [],
        active: true
      });
      setNewSubInput('');
      setServiceAiPrompt('');
      setIsNewServiceOpen(false);
      notify.success('✨ New service category added and published!');
    }
  };

  const handleGenerateServiceDescription = async (target = 'new', lang = 'sinhala') => {
    const current = target === 'new' ? newService : editingService;
    const title = current?.title || current?.sinhala;
    if (!title) {
      notify.error('Please enter a service category title first.');
      return;
    }

    if (target === 'new') setAiGeneratingServiceDesc(true);
    else setEditAiGeneratingServiceDesc(true);

    try {
      const result = await generateServiceCopy({
        title: current.title,
        sinhalaTitle: current.sinhala,
        language: lang
      });

      if (target === 'new') {
        setNewService(prev => ({
          ...prev,
          description: result.description || prev.description,
          items: result.items?.length > 0 ? result.items.map(name => ({ name })) : prev.items
        }));
      } else {
        setEditingService(prev => ({
          ...prev,
          description: result.description || prev.description,
          items: result.items?.length > 0 ? result.items.map(name => ({ name })) : prev.items
        }));
      }
      notify.success(`✨ Service details generated via ${result.engine}!`);
    } catch (err) {
      console.error(err);
      notify.error(err.message || 'Failed to generate service description.');
    } finally {
      if (target === 'new') setAiGeneratingServiceDesc(false);
      else setEditAiGeneratingServiceDesc(false);
    }
  };

  const handleGenerateServiceAiImage = async (target = 'new') => {
    const current = target === 'new' ? newService : editingService;
    const prompt = target === 'new' 
      ? (serviceAiPrompt || current?.title || current?.sinhala) 
      : (editServiceAiPrompt || current?.title || current?.sinhala);

    if (!prompt) {
      notify.error('Please enter a category title or image description prompt.');
      return;
    }

    if (target === 'new') setAiGeneratingServiceImage(true);
    else setEditAiGeneratingServiceImage(true);

    try {
      const result = await generateAiImage({
        prompt,
        categoryName: current?.title || current?.sinhala
      });

      if (target === 'new') {
        setNewService(prev => ({ ...prev, image: result.url }));
      } else {
        setEditingService(prev => ({ ...prev, image: result.url }));
      }
      notify.success(`🎨 Image generated via ${result.engine}!`);
    } catch (err) {
      console.error(err);
      notify.error(err.message || 'Failed to generate AI image.');
    } finally {
      if (target === 'new') setAiGeneratingServiceImage(false);
      else setEditAiGeneratingServiceImage(false);
    }
  };

  const handleUpdateEditingService = async (e) => {
    e.preventDefault();
    if (!editingService) return;
    if (!editingService.title.trim() && !editingService.sinhala.trim()) {
      notify.error('Category title cannot be empty.');
      return;
    }
    if (!editingService.image.trim()) {
      notify.error('Category image cannot be empty.');
      return;
    }

    const updated = servicesList.map(s => {
      if (s.id === editingService.id) {
        return {
          ...s,
          title: editingService.title.trim(),
          sinhala: editingService.sinhala.trim(),
          image: editingService.image.trim(),
          description: editingService.description.trim(),
          items: editingService.items,
          order: Number(editingService.order) || s.order,
          active: Boolean(editingService.active)
        };
      }
      return s;
    });

    const ok = await handleSaveServices(updated);
    if (ok) {
      setEditingService(null);
      notify.success('Service category updated successfully!');
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

  const navTabs = [
    {
      id: 'ad-posts',
      label: 'Banners & Promotions',
      icon: ImageIcon,
      count: banners.length,
      badgeColor: 'text-amber-400'
    },
    {
      id: 'services',
      label: 'Our Services (ප්‍රසිද්ධ සේවාවන්)',
      icon: Sparkles,
      count: servicesList.length,
      badgeColor: 'text-sky-400'
    },
    {
      id: 'storage',
      label: 'Cloud Storage & Diagnostics',
      icon: Database,
      badgeColor: 'text-emerald-400'
    }
  ];

  return (
    <div className="w-full h-full flex flex-col space-y-2 overflow-hidden text-slate-100">
      
      {/* Top Header Control Strip */}
      <div className="relative z-20 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-2 sm:p-2.5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
        
        {/* Segmented Settings Tabs */}
        <div className="flex items-center gap-1 bg-[#090d16] p-0.5 rounded-xl border border-slate-800/90 overflow-x-auto w-full sm:w-auto">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-slate-950' : tab.badgeColor}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-black ${
                    isActive ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {activeTab === 'ad-posts' && (
            <button
              onClick={handleSaveBanners}
              disabled={savingBanners}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-black text-xs bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-slate-950 transition-all shadow-md shadow-sky-500/20 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingBanners ? 'Saving...' : 'Save Changes'}</span>
            </button>
          )}

          {activeTab === 'services' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetDefaultServices}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer shadow-sm"
                title="Restore original 12 services"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Reset Defaults</span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveServices(servicesList)}
                disabled={savingServices}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-black text-xs bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-slate-950 transition-all shadow-md shadow-sky-500/20 disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingServices ? 'Saving...' : 'Save Services'}</span>
              </button>
            </div>
          )}

          {activeTab === 'storage' && (
            <button
              onClick={handleRunDiagnostic}
              disabled={testingPing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{testingPing ? 'Testing...' : 'Test DB Ping'}</span>
            </button>
          )}
        </div>

      </div>

      {/* Main Settings Content Area */}
      <div className="flex-1 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-xl overflow-y-auto custom-scrollbar space-y-6">
        
        {/* ======================================================== */}
        {/* TAB 1: AD POST SETTINGS (Promotional Wallpapers/Posters)  */}
        {/* ======================================================== */}
        {activeTab === 'ad-posts' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Add New Flyer Card (Collapsible) */}
            {!isNewBannerOpen ? (
              <div className="bg-[#071326] border border-amber-500/30 hover:border-amber-500/50 rounded-2xl p-4 sm:p-5 shadow-xl flex items-center justify-between gap-4 transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200 truncate flex items-center gap-2">
                      <span>Add New Promotional Web Banner / Flyer</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 hidden sm:block truncate">
                      Create homepage slideshow banners, marketing flyers, and discount announcements
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNewBannerOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 transition-all shadow-md shadow-amber-500/20 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
                  <span>+ New Banner</span>
                </button>
              </div>
            ) : (
              <div className="bg-[#071326] border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200">
                      Add New Promotional Web Banner / Flyer
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsNewBannerOpen(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                    <span>Collapse</span>
                  </button>
                </div>

              {/* Input Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                
                {/* Left Column: Image Uploader */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Graphic Flyer Image *
                    </label>
                    <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
                      <button
                        type="button"
                        onClick={() => setImageInputMode('file')}
                        className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
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
                        className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
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
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          {uploading ? (
                            <UploadCloud className="w-5 h-5 animate-bounce" />
                          ) : (
                            <UploadCloud className="w-5 h-5" />
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-200">
                          {uploading ? 'Uploading to Cloudflare R2...' : 'Click or drop flyer image here'}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          Square 1:1 or 16:9 banner flyer (PNG, JPG, WebP)
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
                        className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-amber-500 outline-none font-mono"
                      />
                    </div>
                  )}

                  {/* Thumbnail Preview */}
                  {newBanner.imageUrl && (
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
                      <img
                        src={newBanner.imageUrl}
                        alt="Preview"
                        className="w-14 h-14 object-cover rounded-lg border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-emerald-400 block flex items-center gap-1">
                          <Check className="w-3 h-3" /> Image Ready
                        </span>
                        <p className="text-[10px] text-slate-400 truncate font-mono">{newBanner.imageUrl}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNewBanner({ ...newBanner, imageUrl: '' })}
                        className="p-1 rounded text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Column: Titles & Links */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Banner Headline Title
                      </label>
                      <button
                        type="button"
                        onClick={() => handleOpenAiModal('new')}
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-sky-500/20 via-cyan-500/20 to-teal-500/20 hover:from-sky-500/30 hover:to-teal-500/30 text-sky-300 border border-sky-500/40 text-[10px] font-black cursor-pointer transition-all shadow-sm group"
                      >
                        <Sparkles className="w-3 h-3 text-sky-400 group-hover:rotate-12 transition-transform" />
                        <span>✨ Generate with AI</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Special Discount on Laptop Repairs & SSDs!"
                      value={newBanner.title}
                      onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                      className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Subtext / Promotional Description
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Upgrade your PC today with genuine parts and get 1-year warranty."
                      value={newBanner.subtitle}
                      onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
                      className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Promotional Badge Tag
                      </label>
                      <select
                        value={newBanner.badge}
                        onChange={(e) => setNewBanner({ ...newBanner, badge: e.target.value })}
                        className="w-full bg-slate-950 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-amber-500 outline-none cursor-pointer"
                      >
                        <option value="PROMOTION">PROMOTION</option>
                        <option value="FEATURED">FEATURED</option>
                        <option value="NEW SERVICE">NEW SERVICE</option>
                        <option value="SPECIAL OFFER">SPECIAL OFFER</option>
                        <option value="EDUCATIONAL">EDUCATIONAL</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Button Action Link
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. #services or https://..."
                        value={newBanner.linkUrl}
                        onChange={(e) => setNewBanner({ ...newBanner, linkUrl: e.target.value })}
                        className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-amber-500 outline-none font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddBanner}
                    className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/20"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Add to Active Banners</span>
                  </button>
                </div>

              </div>
            </div>
            )}

            {/* Current Active Banners List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Published Wallpapers & Banners ({banners.length})
                </span>
                <span className="text-[10px] text-slate-500">
                  Play order 1, 2, 3.. controls carousel playback. Changes save automatically.
                </span>
              </div>

              {banners.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs italic bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
                  No promotional banners configured. Add a new banner above.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {banners.map((item, index) => (
                    <div
                      key={item.id || index}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                        item.active
                          ? 'bg-[#071326] border-slate-800 hover:border-sky-500/40'
                          : 'bg-slate-950/60 border-slate-900 opacity-60'
                      }`}
                    >
                      <div className="flex gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-20 h-20 object-cover rounded-xl border border-slate-700 shrink-0 shadow-md"
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-1.5 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1">
                                <Hash className="w-3 h-3 text-sky-400" />
                                #{index + 1}
                              </span>
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {item.badge || 'PROMOTION'}
                              </span>
                            </div>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                              item.active 
                                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' 
                                : 'text-slate-400 bg-slate-900 border-slate-800'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${item.active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                              {item.active ? 'Visible' : 'Hidden'}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-100 truncate">{item.title || 'Untitled Banner'}</h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{item.subtitle}</p>
                        </div>
                      </div>

                      {/* Card Footer Controls */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs gap-2 flex-wrap">
                        {/* 1, 2, 3.. Play Order Selector */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order:</span>
                          <select
                            value={index + 1}
                            onChange={(e) => handleReorderBanner(index, Number(e.target.value) - 1)}
                            className="bg-slate-950 border border-slate-700 hover:border-sky-500 rounded-lg px-2 py-1 text-xs text-sky-300 font-black font-mono focus:outline-none cursor-pointer"
                            title="Change play sequence order (1, 2, 3...)"
                          >
                            {banners.map((_, i) => (
                              <option key={i} value={i + 1} className="bg-slate-900 text-slate-200">
                                #{i + 1} {i === 0 ? '(First)' : ''}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleMoveBanner(index, 'up')}
                            disabled={index === 0}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveBanner(index, 'down')}
                            disabled={index === banners.length - 1}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Edit, Hide, Delete Actions */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingBanner({ ...item, originalIndex: index, order: index + 1 })}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 border border-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Edit Banner Information"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleBannerActive(index)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors border ${
                              item.active
                                ? 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700'
                            }`}
                            title={item.active ? 'Hide from website' : 'Show on website'}
                          >
                            {item.active ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                            <span>{item.active ? 'Hide' : 'Show'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveBanner(index)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 transition-colors cursor-pointer"
                            title="Delete Banner Permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Edit Banner Modal */}
            {editingBanner && createPortal(
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
                <div className="bg-[#071326] border border-sky-500/30 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(14,165,233,0.15)] overflow-hidden slide-in-from-bottom-6">
                  {/* Modal Header */}
                  <div className="px-6 py-4 border-b border-sky-500/20 bg-gradient-to-r from-[#0a1e38] via-[#09182d] to-[#071326] flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
                        <Edit className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">Edit Promotional Banner</h3>
                        <p className="text-xs text-slate-400">Update headline, graphic flyer, play order, or link</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingBanner(null)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Form */}
                  <form onSubmit={handleSaveEditedBanner} className="flex flex-col flex-1 min-h-0 overflow-hidden text-xs">
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {/* Image Upload / URL */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                          Banner Image Flyer
                        </label>
                        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                          <button
                            type="button"
                            onClick={() => setEditImageInputMode('file')}
                            className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                              editImageInputMode === 'file' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Upload New
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditImageInputMode('url')}
                            className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                              editImageInputMode === 'url' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Edit URL
                          </button>
                        </div>
                      </div>

                      {editImageInputMode === 'file' ? (
                        <div className="relative border-2 border-dashed border-slate-700 hover:border-sky-500/60 rounded-xl p-4 text-center bg-slate-950/60 transition-colors group">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleEditFileUpload}
                            disabled={editUploading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                          />
                          <div className="flex flex-col items-center justify-center gap-1.5">
                            <UploadCloud className="w-6 h-6 text-sky-400" />
                            <p className="text-xs font-bold text-slate-200">
                              {editUploading ? 'Uploading to Cloudflare...' : 'Click or drop new flyer image'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <input
                          type="url"
                          value={editingBanner.imageUrl}
                          onChange={(e) => setEditingBanner({ ...editingBanner, imageUrl: e.target.value })}
                          placeholder="https://..."
                          className="w-full bg-slate-950 text-slate-100 px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none font-mono text-xs"
                        />
                      )}

                      {/* Live Preview */}
                      {editingBanner.imageUrl && (
                        <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
                          <img
                            src={editingBanner.imageUrl}
                            alt="Preview"
                            className="w-14 h-14 object-cover rounded-lg border border-slate-700 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Image Active
                            </span>
                            <p className="text-[10px] text-slate-400 truncate font-mono">{editingBanner.imageUrl}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Title & Subtitle */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Banner Headline Title
                          </label>
                          <button
                            type="button"
                            onClick={() => handleOpenAiModal('edit')}
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-sky-500/20 via-cyan-500/20 to-teal-500/20 hover:from-sky-500/30 hover:to-teal-500/30 text-sky-300 border border-sky-500/40 text-[10px] font-black cursor-pointer transition-all shadow-sm group"
                          >
                            <Sparkles className="w-3 h-3 text-sky-400 group-hover:rotate-12 transition-transform" />
                            <span>✨ AI Rewrite Copy</span>
                          </button>
                        </div>
                        <input
                          type="text"
                          value={editingBanner.title}
                          onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                          className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none"
                          placeholder="Headline title..."
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Subtext / Promotional Description
                        </label>
                        <textarea
                          rows={2}
                          value={editingBanner.subtitle}
                          onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                          className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none resize-none"
                          placeholder="Description..."
                        />
                      </div>
                    </div>

                    {/* Badge, Play Order, Visibility */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Badge Tag
                        </label>
                        <select
                          value={editingBanner.badge}
                          onChange={(e) => setEditingBanner({ ...editingBanner, badge: e.target.value })}
                          className="w-full bg-slate-950 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none cursor-pointer"
                        >
                          <option value="PROMOTION">PROMOTION</option>
                          <option value="FEATURED">FEATURED</option>
                          <option value="NEW SERVICE">NEW SERVICE</option>
                          <option value="SPECIAL OFFER">SPECIAL OFFER</option>
                          <option value="EDUCATIONAL">EDUCATIONAL</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Play Order (Sequence #)
                        </label>
                        <select
                          value={editingBanner.order}
                          onChange={(e) => setEditingBanner({ ...editingBanner, order: Number(e.target.value) })}
                          className="w-full bg-slate-950 text-sky-400 font-bold font-mono text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none cursor-pointer"
                        >
                          {banners.map((_, i) => (
                            <option key={i} value={i + 1} className="bg-slate-900 text-slate-200">
                              Position #{i + 1} {i === 0 ? '(Plays First)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Visibility Status
                        </label>
                        <select
                          value={editingBanner.active ? 'active' : 'hidden'}
                          onChange={(e) => setEditingBanner({ ...editingBanner, active: e.target.value === 'active' })}
                          className={`w-full font-bold text-xs px-3 py-2 rounded-xl border outline-none cursor-pointer ${
                            editingBanner.active 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40' 
                              : 'bg-slate-900 text-slate-400 border-slate-700'
                          }`}
                        >
                          <option value="active" className="bg-slate-900 text-emerald-400 font-bold">Active (Show on Website)</option>
                          <option value="hidden" className="bg-slate-900 text-slate-400 font-bold">Hidden (Draft)</option>
                        </select>
                      </div>
                    </div>

                    {/* Target Link & Button Text */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Button Action Link
                        </label>
                        <input
                          type="text"
                          value={editingBanner.linkUrl}
                          onChange={(e) => setEditingBanner({ ...editingBanner, linkUrl: e.target.value })}
                          className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none font-mono"
                          placeholder="e.g. #services or https://..."
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Button Label
                        </label>
                        <input
                          type="text"
                          value={editingBanner.linkText}
                          onChange={(e) => setEditingBanner({ ...editingBanner, linkText: e.target.value })}
                          className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none"
                          placeholder="e.g. View Details"
                        />
                      </div>
                    </div>

                    </div>

                    {/* Modal Fixed Footer Actions */}
                    <div className="shrink-0 px-6 py-4 border-t border-slate-800 bg-[#071326] flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => setEditingBanner(null)}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs transition-all shadow-md shadow-sky-500/25 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save & Update Banner</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>,
              document.body
            )}

            {/* ======================================================== */}
            {/* CLOUDFLARE WORKERS AI COPYWRITER MODAL                   */}
            {/* ======================================================== */}
            {isAiModalOpen && createPortal(
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
                <div className="bg-[#0b182f] border border-sky-500/30 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                  {/* Header */}
                  <div className="px-5 sm:px-6 py-4 border-b border-slate-800 shrink-0 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-100 flex items-center gap-1.5">
                          <span>Cloudflare Workers AI Copywriter</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase">
                            Free Llama 3.1
                          </span>
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Draft catchy banner titles, subtitles & badges tailored for DESH Digital Hub.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAiModalOpen(false)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar">

                  {/* Target indicator */}
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px]">
                    <span className="text-slate-400">Applying copy to:</span>
                    <span className="font-bold text-sky-400 flex items-center gap-1">
                      {aiTarget === 'new' ? '+ Add New Banner Form' : '✏️ Current Banner in Edit'}
                    </span>
                  </div>

                  {/* Quick Idea Presets */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" /> Quick Idea Presets (ක්ෂණික අදහස්)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: '🚀 SSD & RAM වේගය', prompt: 'පරිගණකයේ වේගය වැඩි කරගන්න NVMe SSD සහ RAM Upgrade විශේෂ වට්ටම්' },
                        { label: '💻 ලැප්ටොප් Chip රෙපයාර්', prompt: 'විශ්වාසනීය ලැප්ටොප් මදර්බෝඩ් චිප් ලෙවල් රෙපයාර් සහ නොමිලේ දෝෂ පරීක්ෂාව' },
                        { label: '🖨️ Color Print & Binding', prompt: 'උසස් තත්වයේ වර්ණ මුද්‍රණ, ඡායා පිටපත්, සහ පොත් බැඳීම' },
                        { label: '🌐 Online අයදුම්පත් (Passport)', prompt: 'මාර්ගගත පාස්පෝට් දිනයන්, රියදුරු බලපත්‍ර සහ රජයේ විභාග අයදුම්පත්' },
                        { label: '🎧 පරිගණක උපාංග', prompt: 'Gaming Keyboards, Wireless Mice, Cables සහ CCTV කැමරා උපාංග' },
                        { label: '⚡ සති අන්ත 20% Discount', prompt: 'සති අන්ත විශේෂ දීමනා පරිගණක උපාංග සහ සේවාවන් සඳහා 20%ක වට්ටමක්' },
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setAiPrompt(preset.prompt);
                            handleGenerateAiCopy(preset.prompt);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-sky-950/50 text-slate-300 hover:text-sky-300 border border-slate-800 hover:border-sky-500/40 text-[10px] font-bold transition-all cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Prompt Input & Style */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Describe what you want to promote (ප්‍රවර්ධනය කිරීමට අවශ්‍ය දේ ඇතුළත් කරන්න) *
                      </label>
                      <textarea
                        rows={2}
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="උදා: ලැප්ටොප් SSD upgrade එකක් සමඟ Windows 11 දැමීම 15%ක වට්ටමක් සහිතව..."
                        className="w-full bg-slate-950 text-slate-100 text-xs p-3 rounded-xl border border-slate-700 focus:border-sky-500 outline-none resize-none leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Language (භාෂාව)
                        </label>
                        <select
                          value={aiLanguage}
                          onChange={(e) => setAiLanguage(e.target.value)}
                          className="w-full bg-slate-950 text-sky-400 font-bold text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none cursor-pointer"
                        >
                          <option value="sinhala">🇱🇰 සිංහල (Sinhala)</option>
                          <option value="singlish">🇱🇰 Singlish (සිංග්ලිෂ්)</option>
                          <option value="english">🇬🇧 English</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Marketing Tone
                        </label>
                        <select
                          value={aiStyle}
                          onChange={(e) => setAiStyle(e.target.value)}
                          className="w-full bg-slate-950 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none cursor-pointer"
                        >
                          <option value="promotional">High-Converting (ආකර්ෂණීය)</option>
                          <option value="urgent">Urgent Offer (සීමිත කාලීන)</option>
                          <option value="premium">Tech Premium (වෘත්තීය)</option>
                          <option value="educational">Educational (පැහැදිලි)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Preferred Badge
                        </label>
                        <select
                          value={aiBadge}
                          onChange={(e) => setAiBadge(e.target.value)}
                          className="w-full bg-slate-950 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none cursor-pointer"
                        >
                          <option value="">AI Recommended (Auto)</option>
                          <option value="PROMOTION">PROMOTION</option>
                          <option value="FEATURED">FEATURED</option>
                          <option value="NEW SERVICE">NEW SERVICE</option>
                          <option value="SPECIAL OFFER">SPECIAL OFFER</option>
                          <option value="EDUCATIONAL">EDUCATIONAL</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleGenerateAiCopy()}
                      disabled={aiGenerating || !aiPrompt.trim()}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-teal-400 hover:from-sky-400 hover:to-teal-300 text-slate-950 font-black text-xs transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {aiGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                          <span>Generating Copy with Cloudflare AI...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 text-slate-950" />
                          <span>Generate Banner Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* AI Generated Output Preview */}
                  {aiResult && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/40 space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-[10px] font-bold text-sky-400 flex items-center gap-1.5 uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Generated Output Preview
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30">
                          {aiResult.engine || 'Cloudflare Workers AI'}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            {aiResult.badge || 'PROMOTION'}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-white leading-snug">
                          {aiResult.title}
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {aiResult.subtitle}
                        </p>
                        <div className="pt-2 flex items-center gap-2">
                          <span className="px-3 py-1 rounded-lg bg-sky-500 text-slate-950 text-[11px] font-black flex items-center gap-1">
                            {aiResult.linkText || 'Learn More'}
                            <ArrowRight className="w-3 h-3" />
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            Action: {aiResult.linkUrl || '#services'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleGenerateAiCopy()}
                          disabled={aiGenerating}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-colors cursor-pointer border border-slate-800"
                        >
                          Regenerate 🔄
                        </button>
                        <button
                          type="button"
                          onClick={handleApplyAiCopy}
                          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Use This Copy (Apply)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  </div>

                  {/* Footer */}
                  <div className="shrink-0 flex items-center justify-between px-5 sm:px-6 py-3 border-t border-slate-800 text-[11px] text-slate-500 bg-[#0b182f]">
                    <span>Runs on Cloudflare Free Tier (10,000 free neurons/day)</span>
                    <button
                      type="button"
                      onClick={() => setIsAiModalOpen(false)}
                      className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: OUR SERVICES & CATEGORIES (Public Site Services)  */}
        {/* ======================================================== */}
        {activeTab === 'services' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Add New Service Category Card (Collapsible) */}
            {!isNewServiceOpen ? (
              <div className="bg-[#071326] border border-sky-500/30 hover:border-sky-500/50 rounded-2xl p-4 sm:p-5 shadow-xl flex items-center justify-between gap-4 transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                    <Sparkles className="w-5 h-5 text-sky-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200 truncate flex items-center gap-2">
                      <span>Add New Public Service Category • නව සේවා ප්‍රවර්ගයක් එක්කිරීම</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 hidden sm:block truncate">
                      Add services showcase category with Sinhala translation, icons & interactive sub-services
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30 hidden md:inline-block">
                    {servicesList.length} Active
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsNewServiceOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-400 hover:from-sky-400 hover:to-emerald-300 text-slate-950 transition-all shadow-md shadow-sky-500/20 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
                    <span>+ New Category</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#071326] border border-sky-500/30 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200">
                      Add New Public Service Category • නව සේවා ප්‍රවර්ගයක් එක්කිරීම
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30 hidden sm:inline-block">
                      {servicesList.length} Active Categories
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsNewServiceOpen(false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>Collapse</span>
                    </button>
                  </div>
                </div>

              <form onSubmit={handleAddServiceCategory} className="space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  
                  {/* Left Column: Titles & Image */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Category Title (English) *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. PC & Laptop Repair"
                          value={newService.title}
                          onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                          className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Category Title (Sinhala) *
                        </label>
                        <input
                          type="text"
                          placeholder="උදා: පරිගණක අලුත්වැඩියා"
                          value={newService.sinhala}
                          onChange={(e) => setNewService({ ...newService, sinhala: e.target.value })}
                          className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Image Selector */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Category Graphic Visual *
                        </label>
                        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                          <button
                            type="button"
                            onClick={() => setServiceImageMode('ai')}
                            className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                              serviceImageMode === 'ai'
                                ? 'bg-gradient-to-r from-purple-500/20 to-sky-500/20 text-sky-300 font-bold border border-sky-500/30'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            🎨 Cloudflare AI
                          </button>
                          <button
                            type="button"
                            onClick={() => setServiceImageMode('file')}
                            className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                              serviceImageMode === 'file'
                                ? 'bg-sky-500/20 text-sky-300 font-bold'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Upload File
                          </button>
                          <button
                            type="button"
                            onClick={() => setServiceImageMode('url')}
                            className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                              serviceImageMode === 'url'
                                ? 'bg-sky-500/20 text-sky-300 font-bold'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Paste URL
                          </button>
                        </div>
                      </div>

                      {serviceImageMode === 'ai' && (
                        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-purple-500/30 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                              Generate 3D Isometric Tech Graphic (FLUX.1 Schnell)
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                              Free Tier
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder={newService.title ? `3D isometric render of ${newService.title}...` : "e.g. Modern computer repair workshop with blue neon lighting..."}
                              value={serviceAiPrompt}
                              onChange={(e) => setServiceAiPrompt(e.target.value)}
                              className="flex-1 bg-slate-900 text-slate-100 text-xs px-3 py-1.5 rounded-xl border border-slate-700 focus:border-purple-500 outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleGenerateServiceAiImage('new')}
                              disabled={aiGeneratingServiceImage || (!serviceAiPrompt.trim() && !newService.title.trim())}
                              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shrink-0"
                            >
                              {aiGeneratingServiceImage ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>Generating...</span>
                                </>
                              ) : (
                                <>
                                  <Palette className="w-3.5 h-3.5" />
                                  <span>Generate Image</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {serviceImageMode === 'file' && (
                        <div className="relative border-2 border-dashed border-slate-700 hover:border-sky-500/60 rounded-2xl p-5 text-center bg-slate-950/60 transition-colors group">
                          <input
                            type="file"
                            accept="image/*"
                            disabled={serviceUploading}
                            onChange={async (e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              setServiceUploading(true);
                              try {
                                const res = await uploadToCloudflare(f);
                                setNewService(prev => ({ ...prev, image: res.url }));
                                notify.success('Service graphic uploaded to Cloudflare R2!');
                              } catch (err) {
                                notify.error(err.message || 'Failed to upload');
                              } finally {
                                setServiceUploading(false);
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                          />
                          <div className="flex flex-col items-center justify-center gap-1.5">
                            <UploadCloud className={`w-5 h-5 text-sky-400 ${serviceUploading ? 'animate-bounce' : ''}`} />
                            <p className="text-xs font-bold text-slate-200">
                              {serviceUploading ? 'Uploading to Cloudflare R2...' : 'Click or drop service visual here'}
                            </p>
                          </div>
                        </div>
                      )}

                      {serviceImageMode === 'url' && (
                        <input
                          type="url"
                          placeholder="https://pub-xxxx.r2.dev/service-1.jpg or any image URL"
                          value={newService.image}
                          onChange={(e) => setNewService({ ...newService, image: e.target.value })}
                          className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none font-mono"
                        />
                      )}

                      {/* Image Preview Thumbnail */}
                      {newService.image && (
                        <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
                          <img
                            src={newService.image}
                            alt="Category Visual"
                            className="w-14 h-14 object-cover rounded-lg border border-slate-700 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Image Selected
                            </span>
                            <p className="text-[10px] text-slate-400 truncate font-mono">{newService.image}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setNewService({ ...newService, image: '' })}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Description & Sub-services */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Overview Description
                        </label>
                        <button
                          type="button"
                          onClick={() => handleGenerateServiceDescription('new', 'sinhala')}
                          disabled={aiGeneratingServiceDesc || (!newService.title.trim() && !newService.sinhala.trim())}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-sky-500/20 via-cyan-500/20 to-teal-500/20 hover:from-sky-500/30 hover:to-teal-500/30 text-sky-300 border border-sky-500/40 text-[10px] font-black cursor-pointer transition-all shadow-sm disabled:opacity-50"
                        >
                          {aiGeneratingServiceDesc ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin text-sky-400" />
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 text-sky-400" />
                              <span>✨ AI Generate (සිංහල)</span>
                            </>
                          )}
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="දෝෂ හඳුනාගැනීම, Motherboard chip-level රෙපයාර්, Display & Battery මාරු කිරීම..."
                        value={newService.description}
                        onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                        className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none resize-none leading-relaxed"
                      />
                    </div>

                    {/* Sub-services Items */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Sub-Services / Items ({newService.items.length})
                        </label>
                        <button
                          type="button"
                          onClick={() => handleGenerateServiceDescription('new', 'english')}
                          disabled={aiGeneratingServiceDesc || (!newService.title.trim() && !newService.sinhala.trim())}
                          className="text-[10px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <Zap className="w-3 h-3 text-amber-400" />
                          <span>⚡ Suggest Sub-Services</span>
                        </button>
                      </div>

                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="e.g. Hardware Diagnostics & Fault Checking"
                          value={newSubInput}
                          onChange={(e) => setNewSubInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddServiceSubItem();
                            }
                          }}
                          className="flex-1 bg-slate-950 text-slate-100 text-xs px-3 py-1.5 rounded-xl border border-slate-700 focus:border-sky-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddServiceSubItem}
                          disabled={!newSubInput.trim()}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 cursor-pointer disabled:opacity-50"
                        >
                          + Add Item
                        </button>
                      </div>

                      {/* Chips Container */}
                      <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto custom-scrollbar p-1.5 bg-slate-950/50 rounded-xl border border-slate-800/80">
                        {newService.items.length === 0 ? (
                          <span className="text-[10px] text-slate-500 italic p-1">
                            No sub-services added yet. Type above or click "⚡ Suggest Sub-Services".
                          </span>
                        ) : (
                          newService.items.map((item, idx) => {
                            const name = typeof item === 'string' ? item : item.name;
                            return (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-sky-950/60 border border-sky-500/30 text-sky-300 text-[10px] font-medium"
                              >
                                <Check className="w-2.5 h-2.5 text-sky-400 shrink-0" />
                                <span>{name}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveServiceSubItem(idx)}
                                  className="text-slate-400 hover:text-rose-400 cursor-pointer ml-0.5"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </span>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingServices}
                  className="w-full py-2.5 bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-400 hover:from-sky-400 hover:to-emerald-300 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-sky-500/20 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Add Service Category to Public Site</span>
                </button>
              </form>
            </div>
            )}

            {/* Active Service Categories Grid */}
            <div className="bg-[#071326] border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200">
                    Active Public Services Showcase ({servicesList.length})
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Displayed on the home page with interactive sub-services popups & WhatsApp inquiry
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {servicesList.map((service, idx) => (
                  <div
                    key={service.id || idx}
                    className={`rounded-2xl border p-4 flex flex-col justify-between transition-all space-y-3 ${
                      service.active !== false
                        ? 'bg-slate-950/80 border-slate-800/90 hover:border-sky-500/40'
                        : 'bg-slate-950/40 border-slate-800/40 opacity-60'
                    }`}
                  >
                    {/* Top Row: Thumbnail & Titles */}
                    <div className="flex items-start gap-3">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-16 h-16 object-cover rounded-xl border border-slate-800 shrink-0 bg-slate-900"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=300&q=80';
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                            #{service.order || idx + 1}
                          </span>
                          {service.active !== false ? (
                            <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-0.5">
                              <Eye className="w-2.5 h-2.5" /> Visible
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-slate-500 flex items-center gap-0.5">
                              <EyeOff className="w-2.5 h-2.5" /> Hidden
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-black text-white truncate">
                          {service.title}
                        </h4>
                        <p className="text-[11px] text-sky-400 font-semibold truncate">
                          {service.sinhala}
                        </p>
                      </div>
                    </div>

                    {/* Description snippet */}
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {service.description || 'No description provided.'}
                    </p>

                    {/* Sub-services count & chips */}
                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-bold">Sub-Services:</span>
                        <span className="font-mono text-sky-400 font-black">
                          {Array.isArray(service.items) ? service.items.length : 0} items
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(service.items) && service.items.slice(0, 3).map((item, iIdx) => {
                          const name = typeof item === 'string' ? item : item.name;
                          return (
                            <span key={iIdx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 truncate max-w-[130px]">
                              {name}
                            </span>
                          );
                        })}
                        {Array.isArray(service.items) && service.items.length > 3 && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-500 font-mono">
                            +{service.items.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-bold">Order:</span>
                        <select
                          value={service.order || idx + 1}
                          onChange={(e) => {
                            const newOrder = Number(e.target.value);
                            const updated = [...servicesList];
                            const currentIdx = idx;
                            const targetIdx = newOrder - 1;
                            const item = updated.splice(currentIdx, 1)[0];
                            updated.splice(targetIdx, 0, item);
                            handleSaveServices(updated);
                          }}
                          className="bg-slate-900 text-slate-200 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700 outline-none cursor-pointer"
                        >
                          {servicesList.map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleServiceVisibility(service.id)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            service.active !== false
                              ? 'bg-slate-800 text-emerald-400 border-emerald-500/30 hover:bg-slate-700'
                              : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                          }`}
                          title={service.active !== false ? "Hide on public site" : "Show on public site"}
                        >
                          {service.active !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingService({
                              ...service,
                              items: Array.isArray(service.items) ? service.items : []
                            });
                            setEditServiceAiPrompt(service.title || service.sinhala);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                          title="Edit Service Category"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteService(service.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                          title="Delete Service Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ======================================================== */}
            {/* EDIT SERVICE CATEGORY MODAL                              */}
            {/* ======================================================== */}
            {editingService && createPortal(
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
                <div className="bg-[#071326] border border-sky-500/30 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(14,165,233,0.15)] overflow-hidden slide-in-from-bottom-6">
                  {/* Modal Header */}
                  <div className="px-6 py-4 border-b border-sky-500/20 bg-gradient-to-r from-[#0a1e38] via-[#09182d] to-[#071326] flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
                        <Edit className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white uppercase tracking-wider">
                          Edit Service Category • {editingService.title}
                        </h3>
                        <p className="text-xs text-slate-400">Update category details, Sinhala translation, icon and sub-services</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingService(null)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleUpdateEditingService} className="flex flex-col flex-1 min-h-0 overflow-hidden text-xs">
                    <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 custom-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Category Title (English) *
                        </label>
                        <input
                          type="text"
                          value={editingService.title}
                          onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                          className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Category Title (Sinhala) *
                        </label>
                        <input
                          type="text"
                          value={editingService.sinhala}
                          onChange={(e) => setEditingService({ ...editingService, sinhala: e.target.value })}
                          className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Image section */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Category Visual Image
                        </label>
                        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                          <button
                            type="button"
                            onClick={() => setEditServiceImageMode('ai')}
                            className={`px-2 py-0.5 rounded cursor-pointer ${
                              editServiceImageMode === 'ai' ? 'bg-purple-500/20 text-purple-300 font-bold' : 'text-slate-400'
                            }`}
                          >
                            🎨 Cloudflare AI
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditServiceImageMode('file')}
                            className={`px-2 py-0.5 rounded cursor-pointer ${
                              editServiceImageMode === 'file' ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-400'
                            }`}
                          >
                            Upload
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditServiceImageMode('url')}
                            className={`px-2 py-0.5 rounded cursor-pointer ${
                              editServiceImageMode === 'url' ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-400'
                            }`}
                          >
                            URL
                          </button>
                        </div>
                      </div>

                      {editServiceImageMode === 'ai' && (
                        <div className="p-3 rounded-xl bg-slate-950 border border-purple-500/30 flex gap-2">
                          <input
                            type="text"
                            placeholder="Prompt for AI image generation..."
                            value={editServiceAiPrompt}
                            onChange={(e) => setEditServiceAiPrompt(e.target.value)}
                            className="flex-1 bg-slate-900 text-slate-100 text-xs px-3 py-1.5 rounded-xl border border-slate-700 focus:border-purple-500 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleGenerateServiceAiImage('edit')}
                            disabled={editAiGeneratingServiceImage}
                            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer flex items-center gap-1 shrink-0"
                          >
                            {editAiGeneratingServiceImage ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Palette className="w-3.5 h-3.5" />}
                            <span>Generate</span>
                          </button>
                        </div>
                      )}

                      {editServiceImageMode === 'file' && (
                        <input
                          type="file"
                          accept="image/*"
                          disabled={editServiceUploading}
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            setEditServiceUploading(true);
                            try {
                              const res = await uploadToCloudflare(f);
                              setEditingService(prev => ({ ...prev, image: res.url }));
                              notify.success('Image uploaded!');
                            } catch (err) {
                              notify.error(err.message);
                            } finally {
                              setEditServiceUploading(false);
                            }
                          }}
                          className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-600 file:text-white cursor-pointer"
                        />
                      )}

                      {editServiceImageMode === 'url' && (
                        <input
                          type="url"
                          value={editingService.image}
                          onChange={(e) => setEditingService({ ...editingService, image: e.target.value })}
                          className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none font-mono"
                        />
                      )}

                      {editingService.image && (
                        <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
                          <img
                            src={editingService.image}
                            alt="Visual"
                            className="w-12 h-12 object-cover rounded-lg border border-slate-700 shrink-0"
                          />
                          <p className="text-[10px] text-slate-400 truncate font-mono flex-1">{editingService.image}</p>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Description
                        </label>
                        <button
                          type="button"
                          onClick={() => handleGenerateServiceDescription('edit', 'sinhala')}
                          disabled={editAiGeneratingServiceDesc}
                          className="text-[10px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles className="w-3 h-3 text-sky-400" />
                          <span>✨ AI Rewrite Description</span>
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={editingService.description}
                        onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                        className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none resize-none"
                      />
                    </div>

                    {/* Sub-services */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Sub-Services ({editingService.items?.length || 0})
                        </label>
                        <button
                          type="button"
                          onClick={() => handleGenerateServiceDescription('edit', 'english')}
                          disabled={editAiGeneratingServiceDesc}
                          className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <Zap className="w-3 h-3" />
                          <span>⚡ Suggest Items</span>
                        </button>
                      </div>

                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Type sub-service and press Enter..."
                          value={editSubInput}
                          onChange={(e) => setEditSubInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = editSubInput.trim();
                              if (!val) return;
                              setEditingService(prev => ({
                                ...prev,
                                items: [...(prev.items || []), { name: val }]
                              }));
                              setEditSubInput('');
                            }
                          }}
                          className="flex-1 bg-slate-950 text-slate-100 text-xs px-3 py-1.5 rounded-xl border border-slate-700 focus:border-sky-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = editSubInput.trim();
                            if (!val) return;
                            setEditingService(prev => ({
                              ...prev,
                              items: [...(prev.items || []), { name: val }]
                            }));
                            setEditSubInput('');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer"
                        >
                          + Add
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto custom-scrollbar p-1.5 bg-slate-950 rounded-xl border border-slate-800">
                        {(!editingService.items || editingService.items.length === 0) ? (
                          <span className="text-[10px] text-slate-500 italic p-1">No items</span>
                        ) : (
                          editingService.items.map((item, idx) => {
                            const name = typeof item === 'string' ? item : item.name;
                            return (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-sky-950/60 border border-sky-500/30 text-sky-300 text-[10px]"
                              >
                                <Check className="w-2.5 h-2.5 text-sky-400" />
                                <span>{name}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingService(prev => ({
                                      ...prev,
                                      items: prev.items.filter((_, i) => i !== idx)
                                    }));
                                  }}
                                  className="text-slate-400 hover:text-rose-400 cursor-pointer"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </span>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Order & Visibility */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Display Sequence (Order #)
                        </label>
                        <select
                          value={editingService.order || 1}
                          onChange={(e) => setEditingService({ ...editingService, order: Number(e.target.value) })}
                          className="w-full bg-slate-950 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none cursor-pointer"
                        >
                          {servicesList.map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              Order #{i + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Public Visibility
                        </label>
                        <select
                          value={editingService.active !== false ? 'active' : 'hidden'}
                          onChange={(e) => setEditingService({ ...editingService, active: e.target.value === 'active' })}
                          className="w-full bg-slate-950 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none cursor-pointer"
                        >
                          <option value="active" className="text-emerald-400">Visible on Public Site</option>
                          <option value="hidden" className="text-slate-400">Hidden (Draft)</option>
                        </select>
                      </div>
                    </div>

                    </div>

                    {/* Modal Fixed Footer */}
                    <div className="shrink-0 px-6 py-4 border-t border-slate-800 bg-[#071326] flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => setEditingService(null)}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-sky-500/25 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save & Update Category</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>,
              document.body
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: STORAGE SETTINGS (Cloudflare R2, Supabase, Cache) */}
        {/* ======================================================== */}
        {activeTab === 'storage' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="bg-[#071326] border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
              <div className="border-b border-slate-800/80 pb-3">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Database className="w-4 h-4 text-sky-400" />
                  Cloud Storage & Database Infrastructure
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Cloudflare R2 global object storage bucket, Supabase database latency and local client cache management.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Cloudflare R2 Storage Card */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <UploadCloud className="w-4 h-4 text-sky-400" />
                        Cloudflare R2 Object Storage
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      S3-compatible bucket storing high-resolution product images, repair job attachments, and promotional flyers.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-xs text-slate-400">Status: Connected</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                      CDN Active
                    </span>
                  </div>
                </div>

                {/* Supabase Cloud Database Card */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <Database className="w-4 h-4 text-emerald-400" />
                        Supabase PostgreSQL Database
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Real-time database powering inventory items, repair jobs, sales records, customer dues, and system settings.
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

                {/* Cloudflare Workers AI Engine Card */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        Cloudflare Workers AI Gateway
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]"></span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Serverless generative AI inference on Meta Llama 3.1 8B, drafting high-converting marketing copy with zero server costs.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-xs text-slate-400 font-mono text-[11px]">Free 10K Neurons/Day</span>
                    <button
                      type="button"
                      onClick={() => handleOpenAiModal('new')}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white cursor-pointer shadow-sm"
                    >
                      Open AI Assistant
                    </button>
                  </div>
                </div>

                {/* Client Cache Management Card */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-3 sm:col-span-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-purple-400" />
                        Browser Cache & Progressive Web App (PWA) Storage
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Unregister old Service Worker versions, flush temporary cache, and reload fresh application state.
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
          </div>
        )}

      </div>

    </div>
  );
}
