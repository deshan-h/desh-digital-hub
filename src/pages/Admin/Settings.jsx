import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { settingsService } from '../../services/supabaseService';
import { supabase } from '../../config/supabase';
import { uploadToCloudflare, compressAndConvertToWebP } from '../../services/cloudflareStorage';
import { generateBannerCopy, generateServiceCopy, generateAiImage } from '../../services/bannerAiService';
import { DEFAULT_SERVICES } from '../../components/home/Services';
import { SAMPLE_WORKS } from '../../components/home/OnlinePortfolioGallery';
import { notify } from '../../utils/toast';
import { BannerEditModal, WorkersAiModal, ServiceEditModal, WorkEditModal } from './SettingsComponents';
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
    linkUrl: 'https://desh.s.gy/edu-hub',
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
      notify.error('Please enter a topic or select one of the presets.');
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

  // ==========================================
  // 4. OUR WORKS SHOWCASE PORTFOLIO STATE
  // ==========================================
  const [worksList, setWorksList] = useState([]);
  const [savingWorks, setSavingWorks] = useState(false);
  const [workImageMode, setWorkImageMode] = useState('file'); // 'file' | 'url'
  const [workUploading, setWorkUploading] = useState(false);
  const [isNewWorkOpen, setIsNewWorkOpen] = useState(false);
  const [newWork, setNewWork] = useState({
    title: '',
    image: '',
    description: '',
    active: true
  });

  // Edit Work Modal State
  const [editingWork, setEditingWork] = useState(null);
  const [editWorkImageMode, setEditWorkImageMode] = useState('file');
  const [editWorkUploading, setEditWorkUploading] = useState(false);

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

      // 3. Fetch Our Works Showcase Portfolio
      const worksData = await settingsService.getSetting('our_works').catch(() => null);
      if (worksData && Array.isArray(worksData.items) && worksData.items.length > 0) {
        const items = worksData.items.map((w, idx) => ({
          ...w,
          order: w.order !== undefined && w.order !== null ? Number(w.order) : idx + 1,
          highlights: Array.isArray(w.highlights) ? w.highlights : []
        }));
        items.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
        setWorksList(items);
        localStorage.setItem('desh_our_works', JSON.stringify(items));
      } else {
        const initial = SAMPLE_WORKS.map((w, idx) => ({ ...w, order: idx + 1, active: true }));
        setWorksList(initial);
        localStorage.setItem('desh_our_works', JSON.stringify(initial));
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

  // ==========================================
  // OUR WORKS SHOWCASE HANDLERS
  // ==========================================
  const handleSaveWorks = async (listToSave) => {
    const list = listToSave || worksList;
    const ordered = list.map((w, idx) => ({
      ...w,
      order: idx + 1
    }));
    setWorksList(ordered);
    try {
      localStorage.setItem('desh_our_works', JSON.stringify(ordered));
    } catch (e) {
      console.warn('localStorage error:', e);
    }
    setSavingWorks(true);
    try {
      await settingsService.saveSetting('our_works', { items: ordered });
      notify.success('Our Works Showcase updated and published successfully!');
      return true;
    } catch (err) {
      console.error(err);
      notify.error('Failed to save works to Supabase');
      return false;
    } finally {
      setSavingWorks(false);
    }
  };

  const handleResetDefaultWorks = async () => {
    if (!window.confirm('Reset Our Works to standard sample works? Any custom works will be overwritten.')) return;
    const initial = SAMPLE_WORKS.map((w, idx) => ({ ...w, order: idx + 1, active: true }));
    await handleSaveWorks(initial);
  };

  const handleToggleWorkActive = async (workId) => {
    const updated = worksList.map(w => w.id === workId ? { ...w, active: !w.active } : w);
    await handleSaveWorks(updated);
  };

  const handleDeleteWork = async (workId) => {
    const target = worksList.find(w => w.id === workId);
    if (!window.confirm(`Are you sure you want to delete "${target?.title || 'this work item'}"?`)) return;
    const updated = worksList.filter(w => w.id !== workId);
    await handleSaveWorks(updated);
  };

  const handleReorderWork = async (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= worksList.length || fromIndex === toIndex) return;
    const reordered = [...worksList];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    await handleSaveWorks(reordered);
  };

  const handleMoveWork = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    handleReorderWork(index, targetIndex);
  };

  const handleWorkFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setWorkUploading(true);
    try {
      let url = '';
      try {
        const res = await uploadToCloudflare(file);
        if (res?.url) url = res.url;
      } catch (cfErr) {
        console.warn('Cloudflare upload not available, falling back to base64 reader:', cfErr);
      }
      if (!url) {
        let fileToRead = file;
        try {
          const comp = await compressAndConvertToWebP(file, { maxWidth: 1400, quality: 0.82 });
          fileToRead = comp.file;
        } catch (_) {}
        url = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target.result);
          reader.onerror = () => reject(new Error('Failed to read image file'));
          reader.readAsDataURL(fileToRead);
        });
      }
      setNewWork(prev => ({ ...prev, image: url }));
      notify.success('Work sample photo compressed (WebP) & loaded successfully!');
    } catch (err) {
      notify.error(err.message || 'Image upload failed.');
    } finally {
      setWorkUploading(false);
      e.target.value = '';
    }
  };

  const handleEditWorkFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editingWork) return;
    setEditWorkUploading(true);
    try {
      let url = '';
      try {
        const res = await uploadToCloudflare(file);
        if (res?.url) url = res.url;
      } catch (cfErr) {
        console.warn('Cloudflare upload fallback to base64 reader:', cfErr);
      }
      if (!url) {
        let fileToRead = file;
        try {
          const comp = await compressAndConvertToWebP(file, { maxWidth: 1400, quality: 0.82 });
          fileToRead = comp.file;
        } catch (_) {}
        url = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target.result);
          reader.onerror = () => reject(new Error('Failed to read image file'));
          reader.readAsDataURL(fileToRead);
        });
      }
      setEditingWork(prev => ({ ...prev, image: url }));
      notify.success('Work sample photo compressed (WebP) & updated successfully!');
    } catch (err) {
      notify.error(err.message || 'Image upload failed.');
    } finally {
      setEditWorkUploading(false);
      e.target.value = '';
    }
  };

  const handleAddHighlightToNew = () => {
    if (!newHighlightInput.trim()) return;
    setNewWork(prev => ({
      ...prev,
      highlights: [...(prev.highlights || []), newHighlightInput.trim()]
    }));
    setNewHighlightInput('');
  };

  const handleAddWorkItem = async (e) => {
    if (e) e.preventDefault();
    if (!newWork.title.trim()) {
      notify.error('Please enter a title for the work sample.');
      return;
    }
    if (!newWork.image.trim()) {
      notify.error('Please upload or provide an image for the work sample.');
      return;
    }

    const newItem = {
      id: `work-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: newWork.title.trim(),
      image: newWork.image.trim(),
      description: newWork.description.trim(),
      active: true,
      order: worksList.length + 1
    };

    const updated = [...worksList, newItem];
    const ok = await handleSaveWorks(updated);
    if (ok) {
      setNewWork({
        title: '',
        image: '',
        description: '',
        active: true
      });
      setIsNewWorkOpen(false);
      notify.success('✨ New work item added and published to Our Works!');
    }
  };

  const handleSaveEditedWork = async (e) => {
    if (e) e.preventDefault();
    if (!editingWork || !editingWork.image?.trim()) {
      notify.error('Please provide an image for the work item.');
      return;
    }

    const originalIndex = editingWork.originalIndex;
    const targetOrder = Math.max(1, Math.min(worksList.length, Number(editingWork.order) || (originalIndex + 1)));
    const targetIndex = targetOrder - 1;

    let updated = [...worksList];
    const updatedItem = {
      ...updated[originalIndex],
      title: editingWork.title.trim(),
      image: editingWork.image.trim(),
      description: editingWork.description.trim(),
      active: Boolean(editingWork.active)
    };

    if (targetIndex !== originalIndex) {
      updated.splice(originalIndex, 1);
      updated.splice(targetIndex, 0, updatedItem);
    } else {
      updated[originalIndex] = updatedItem;
    }

    const ok = await handleSaveWorks(updated);
    if (ok) {
      setEditingWork(null);
      notify.success('Work item updated successfully!');
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
      label: 'Our Services',
      icon: Sparkles,
      count: servicesList.length,
      badgeColor: 'text-sky-400'
    },
    {
      id: 'our-works',
      label: 'Our Works Showcase',
      icon: Layers,
      count: worksList.length,
      badgeColor: 'text-indigo-400'
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

          {activeTab === 'our-works' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetDefaultWorks}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer shadow-sm"
                title="Restore default sample works"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Reset Defaults</span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveWorks(worksList)}
                disabled={savingWorks}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-black text-xs bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-slate-950 transition-all shadow-md shadow-sky-500/20 disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingWorks ? 'Saving...' : 'Save Works'}</span>
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
            <BannerEditModal
              editingBanner={editingBanner}
              setEditingBanner={setEditingBanner}
              banners={banners}
              editImageInputMode={editImageInputMode}
              setEditImageInputMode={setEditImageInputMode}
              editUploading={editUploading}
              handleEditFileUpload={handleEditFileUpload}
              handleOpenAiModal={handleOpenAiModal}
              handleSaveEditedBanner={handleSaveEditedBanner}
            />

            {/* Cloudflare Workers AI Copywriter Modal */}
            <WorkersAiModal
              isOpen={isAiModalOpen}
              onClose={() => setIsAiModalOpen(false)}
              aiTarget={aiTarget}
              aiPrompt={aiPrompt}
              setAiPrompt={setAiPrompt}
              aiLanguage={aiLanguage}
              setAiLanguage={setAiLanguage}
              aiStyle={aiStyle}
              setAiStyle={setAiStyle}
              aiBadge={aiBadge}
              setAiBadge={setAiBadge}
              aiGenerating={aiGenerating}
              aiResult={aiResult}
              handleGenerateAiCopy={handleGenerateAiCopy}
              handleApplyAiCopy={handleApplyAiCopy}
            />

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
                      <span>Add New Public Service Category</span>
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
                      Add New Public Service Category
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
                          placeholder="e.g. Sinhala title"
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
                              <span>✨ AI Generate Description</span>
                            </>
                          )}
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Comprehensive repair solutions, troubleshooting, hardware upgrades..."
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
            <ServiceEditModal
              editingService={editingService}
              setEditingService={setEditingService}
              editServiceImageMode={editServiceImageMode}
              setEditServiceImageMode={setEditServiceImageMode}
              editServiceAiPrompt={editServiceAiPrompt}
              setEditServiceAiPrompt={setEditServiceAiPrompt}
              editAiGeneratingServiceImage={editAiGeneratingServiceImage}
              handleGenerateServiceAiImage={handleGenerateServiceAiImage}
              editServiceUploading={editServiceUploading}
              uploadToCloudflare={uploadToCloudflare}
              notify={notify}
              handleGenerateServiceDescription={handleGenerateServiceDescription}
              editAiGeneratingServiceDesc={editAiGeneratingServiceDesc}
              editSubInput={editSubInput}
              setEditSubInput={setEditSubInput}
              servicesList={servicesList}
              handleUpdateEditingService={handleUpdateEditingService}
            />

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: OUR WORKS SHOWCASE (PORTFOLIO GALLERY MANAGEMENT)    */}
        {/* ======================================================== */}
        {activeTab === 'our-works' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Add New Work Item Card (Collapsible) */}
            {!isNewWorkOpen ? (
              <div className="bg-[#071326] border border-indigo-500/30 hover:border-indigo-500/50 rounded-2xl p-4 sm:p-5 shadow-xl flex items-center justify-between gap-4 transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                    <Layers className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200 truncate flex items-center gap-2">
                      <span>Add New Work Showcase Item</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 hidden sm:block truncate">
                      Upload portfolio photo, title, short description and publish to homepage cover-flow carousel
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNewWorkOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 text-white transition-all shadow-md shadow-indigo-500/20 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4 text-white stroke-[3]" />
                  <span>+ New Work Item</span>
                </button>
              </div>
            ) : (
              <div className="bg-[#071326] border border-indigo-500/30 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200">
                      Add New Showcase Item
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsNewWorkOpen(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                    <span>Collapse</span>
                  </button>
                </div>

                <form onSubmit={handleAddWorkItem} className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Left Column: Image Upload & Preview */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          Work Showcase Photo *
                        </label>
                        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
                          <button
                            type="button"
                            onClick={() => setWorkImageMode('file')}
                            className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                              workImageMode === 'file'
                                ? 'bg-indigo-500/20 text-indigo-300 font-bold'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Upload File
                          </button>
                          <button
                            type="button"
                            onClick={() => setWorkImageMode('url')}
                            className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                              workImageMode === 'url'
                                ? 'bg-indigo-500/20 text-indigo-300 font-bold'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Paste URL
                          </button>
                        </div>
                      </div>

                      {workImageMode === 'file' ? (
                        <div className="relative border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-2xl p-6 text-center bg-slate-950/60 transition-colors group">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleWorkFileUpload}
                            disabled={workUploading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                          />
                          <div className="flex flex-col items-center justify-center gap-2">
                            <UploadCloud className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform" />
                            <p className="text-xs font-bold text-slate-200">
                              {workUploading ? 'Uploading / Processing photo...' : 'Click or drop sample photo here'}
                            </p>
                            <p className="text-[10px] text-slate-400">Supports JPG, PNG, WebP (Portrait or Landscape)</p>
                          </div>
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={newWork.image}
                          onChange={(e) => setNewWork(prev => ({ ...prev, image: e.target.value }))}
                          placeholder="https://... or /images/services/..."
                          className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 outline-none font-mono text-xs"
                        />
                      )}

                      {/* Image Preview */}
                      {newWork.image && (
                        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
                          <img
                            src={newWork.image}
                            alt="Preview"
                            className="w-16 h-16 object-cover rounded-lg border border-slate-700 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Image Loaded & Ready
                            </span>
                            <p className="text-[11px] text-slate-400 truncate font-mono mt-0.5">{newWork.image}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Title & Small Description */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                          Work Title *
                        </label>
                        <input
                          type="text"
                          value={newWork.title}
                          onChange={(e) => setNewWork(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full bg-slate-950 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 outline-none"
                          placeholder="e.g. Modern Executive ATS Resume"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                          Small Description *
                        </label>
                        <textarea
                          rows={4}
                          value={newWork.description}
                          onChange={(e) => setNewWork(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full bg-slate-950 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 outline-none resize-none leading-relaxed"
                          placeholder="Concise overview of the work sample or project details..."
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsNewWorkOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingWorks || workUploading}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 text-white font-black text-xs transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{savingWorks ? 'Saving...' : 'Add & Publish to Our Works'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Works Showcase List & Reorder Section */}
            <div className="bg-[#071326] border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span>Showcase Portfolio Items ({worksList.length})</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Display sequence on homepage cover-flow carousel. Use Move Up / Down buttons to rearrange order.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-400 font-mono bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                    Total: {worksList.length} items
                  </span>
                </div>
              </div>

              {/* Works Items Grid / List */}
              {worksList.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/40">
                  <Layers className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-400">No work items found</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Click "Reset Defaults" to load standard showcase items, or click "+ New Work Item" to add your own creations.
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleResetDefaultWorks}
                      className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                    >
                      Reset Defaults
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsNewWorkOpen(true)}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                    >
                      + Add First Work
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {worksList.map((work, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === worksList.length - 1;

                    return (
                      <div
                        key={work.id || idx}
                        className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          work.active !== false
                            ? 'bg-[#09152b] border-slate-800 hover:border-slate-700'
                            : 'bg-slate-950/60 border-slate-800/50 opacity-60'
                        }`}
                      >
                        {/* Left: Reorder controls + Thumbnail + Details */}
                        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                          
                          {/* Order Badging & Move Up/Down Buttons */}
                          <div className="flex flex-col items-center justify-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMoveWork(idx, 'up')}
                              disabled={isFirst}
                              title="Move Up"
                              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                                isFirst
                                  ? 'text-slate-700 cursor-not-allowed'
                                  : 'bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-300'
                              }`}
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>

                            <span className="text-[10px] font-mono font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-1.5 py-0.5 rounded">
                              #{idx + 1}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleMoveWork(idx, 'down')}
                              disabled={isLast}
                              title="Move Down"
                              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                                isLast
                                  ? 'text-slate-700 cursor-not-allowed'
                                  : 'bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-300'
                              }`}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Image Thumbnail */}
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-700 shrink-0 bg-slate-950">
                            <img
                              src={work.image}
                              alt={work.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            {work.active === false && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-[9px] font-bold text-amber-300 bg-black/80 px-1 py-0.5 rounded">
                                  Hidden
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Text Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white truncate">
                                {work.title}
                              </h4>
                              {work.active === false && (
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  Draft / Hidden
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                              {work.description}
                            </p>
                          </div>

                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80 w-full sm:w-auto justify-end">
                          {/* Toggle Active */}
                          <button
                            type="button"
                            onClick={() => handleToggleWorkActive(work.id)}
                            title={work.active !== false ? 'Hide from website' : 'Show on website'}
                            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                              work.active !== false
                                ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                            }`}
                          >
                            {work.active !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => setEditingWork({ ...work, originalIndex: idx })}
                            title="Edit Work Details"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteWork(work.id)}
                            title="Delete Work Item"
                            className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Edit Work Modal */}
            <WorkEditModal
              editingWork={editingWork}
              setEditingWork={setEditingWork}
              worksList={worksList}
              editWorkImageMode={editWorkImageMode}
              setEditWorkImageMode={setEditWorkImageMode}
              editWorkUploading={editWorkUploading}
              handleEditWorkFileUpload={handleEditWorkFileUpload}
              handleSaveEditedWork={handleSaveEditedWork}
            />

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
