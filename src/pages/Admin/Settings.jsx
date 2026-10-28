import React, { useState, useEffect } from 'react';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp, 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { notify } from '../../utils/toast';
import { 
  Save, 
  Plus, 
  Trash2, 
  GripVertical, 
  Info, 
  HelpCircle, 
  Settings as SettingsIcon,
  FileText,
  Link as LinkIcon,
  ExternalLink,
  Search,
  Download,
  GraduationCap,
  Pencil,
  X
} from 'lucide-react';
import Loader from '../../components/Loader';
import { formatDirectDownloadLink } from '../../utils/helpers';

export default function Settings({ isAdmin }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newsItems, setNewsItems] = useState([]);
  const [newItemText, setNewItemText] = useState('');

  // Papers Hub State
  const [papers, setPapers] = useState([]);
  const [paperCategory, setPaperCategory] = useState('O/L');
  const [paperName, setPaperName] = useState('');
  const [paperLink, setPaperLink] = useState('');
  const [addingPaper, setAddingPaper] = useState(false);
  const [deletingPaperId, setDeletingPaperId] = useState(null);
  const [paperSearchTerm, setPaperSearchTerm] = useState('');

  // Edit Paper State
  const [editingPaper, setEditingPaper] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchPapers();
  }, []);

  const fetchSettings = async () => {
    try {
      const docRef = doc(db, 'settings', 'news');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setNewsItems(data.items || []);
      } else {
        await setDoc(docRef, { items: [], updatedAt: serverTimestamp() });
        setNewsItems([]);
      }
    } catch (error) {
      console.error("Error fetching news settings:", error);
      notify.error("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPapers = async () => {
    try {
      let list = [];

      // 1. Check settings/papers
      const docRef = doc(db, 'settings', 'papers');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && Array.isArray(docSnap.data().items)) {
        list = [...docSnap.data().items];
      }

      // 2. Also check collection 'papers' to preserve any previously added papers
      try {
        const querySnapshot = await getDocs(collection(db, 'papers'));
        querySnapshot.forEach((d) => {
          const dData = d.data();
          if (!list.some(p => p.id === d.id || (p.name === dData.name && p.link === dData.link))) {
            list.push({ id: d.id, ...dData });
          }
        });
      } catch (colErr) {
        console.warn("Could not check papers collection:", colErr);
      }

      setPapers(list);

      // Sync combined list to settings/papers for guaranteed public client display
      if (list.length > 0) {
        await setDoc(docRef, { items: list, updatedAt: serverTimestamp() }, { merge: true });
      }
    } catch (error) {
      console.error("Error fetching papers:", error);
    }
  };

  const handleSave = async () => {
    if (!isAdmin) {
      notify.error("You do not have permission to save settings.");
      return;
    }
    
    setSaving(true);
    try {
      const docRef = doc(db, 'settings', 'news');
      await setDoc(docRef, { 
        items: newsItems,
        updatedAt: serverTimestamp()
      }, { merge: true });
      notify.success("News updated successfully!");
    } catch (error) {
      console.error("Error saving news settings:", error);
      notify.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    
    setNewsItems([...newsItems, newItemText.trim()]);
    setNewItemText('');
  };

  const handleRemoveItem = (index) => {
    const newItems = [...newsItems];
    newItems.splice(index, 1);
    setNewsItems(newItems);
  };

  // Papers Hub Handlers
  const handleAddPaper = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      notify.error("You do not have permission to add papers.");
      return;
    }

    if (!paperName.trim() || !paperLink.trim()) {
      notify.error("Please enter both Paper Name and Download Link.");
      return;
    }

    const rawLink = paperLink.trim();
    const formattedLink = formatDirectDownloadLink(rawLink);
    const isGoogleDrive = rawLink.includes('drive.google.com');

    setAddingPaper(true);
    try {
      const newId = 'paper_' + Date.now();
      const newPaper = {
        id: newId,
        category: paperCategory || 'O/L',
        name: paperName.trim(),
        link: formattedLink,
        createdAt: new Date().toISOString()
      };

      const updatedPapers = [newPaper, ...papers];

      // 1. Save to settings/papers (accessible for public client display)
      const settingsRef = doc(db, 'settings', 'papers');
      await setDoc(settingsRef, {
        items: updatedPapers,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // 2. Also save to collection 'papers' as fallback
      try {
        await setDoc(doc(db, 'papers', newId), {
          category: paperCategory || 'O/L',
          name: paperName.trim(),
          link: formattedLink,
          createdAt: serverTimestamp()
        });
      } catch (colErr) {
        console.warn("Could not save to papers collection:", colErr);
      }

      setPapers(updatedPapers);
      setPaperName('');
      setPaperLink('');
      if (isGoogleDrive) {
        notify.success("Paper added! (Google Drive direct download link created)");
      } else {
        notify.success("Paper added to Papers Hub successfully!");
      }
    } catch (error) {
      console.error("Error adding paper:", error);
      notify.error("Failed to add paper.");
    } finally {
      setAddingPaper(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      notify.error("You do not have permission to edit papers.");
      return;
    }

    if (!editingPaper.name?.trim() || !editingPaper.link?.trim()) {
      notify.error("Please enter both Paper Name and Download Link.");
      return;
    }

    const formattedLink = formatDirectDownloadLink(editingPaper.link.trim());
    setSavingEdit(true);
    try {
      const updated = papers.map((p) => {
        if (p.id === editingPaper.id) {
          return {
            ...p,
            category: editingPaper.category || 'O/L',
            name: editingPaper.name.trim(),
            link: formattedLink,
            updatedAt: new Date().toISOString()
          };
        }
        return p;
      });

      // 1. Update settings/papers
      const settingsRef = doc(db, 'settings', 'papers');
      await setDoc(settingsRef, {
        items: updated,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // 2. Also update in collection 'papers'
      try {
        await setDoc(doc(db, 'papers', editingPaper.id), {
          category: editingPaper.category || 'O/L',
          name: editingPaper.name.trim(),
          link: formattedLink,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (colErr) {
        console.warn("Could not update in papers collection:", colErr);
      }

      setPapers(updated);
      setEditingPaper(null);
      notify.success("Paper updated successfully!");
    } catch (error) {
      console.error("Error updating paper:", error);
      notify.error("Failed to update paper.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeletePaper = async (id) => {
    if (!isAdmin) {
      notify.error("You do not have permission to delete papers.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this paper?")) {
      return;
    }

    setDeletingPaperId(id);
    try {
      const updated = papers.filter(p => p.id !== id);

      // 1. Update settings/papers
      const settingsRef = doc(db, 'settings', 'papers');
      await setDoc(settingsRef, {
        items: updated,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // 2. Also delete from collection 'papers'
      try {
        await deleteDoc(doc(db, 'papers', id));
      } catch (colErr) {
        console.warn("Could not delete from papers collection:", colErr);
      }

      setPapers(updated);
      notify.success("Paper deleted successfully.");
    } catch (error) {
      console.error("Error deleting paper:", error);
      notify.error("Failed to delete paper.");
    } finally {
      setDeletingPaperId(null);
    }
  };

  const filteredPapers = papers.filter(p => 
    p.name?.toLowerCase().includes(paperSearchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(paperSearchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="bg-slate-900 border border-red-500/20 rounded-xl p-6 text-center text-red-400">
          You do not have permission to access Settings. Please log in with the admin account.
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-4 space-y-6 w-full relative z-10 h-full flex flex-col pb-24 overflow-y-auto custom-scrollbar">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0 mb-2 px-2 md:px-4">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-xl font-black text-slate-100 uppercase tracking-widest flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-cyan-400" /> SYSTEM SETTINGS
          </h1>
          <div className="relative group cursor-help mt-1">
            <HelpCircle className="w-5 h-5 text-slate-500 hover:text-slate-300 transition-colors" />
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 w-max max-w-xs px-3 py-2 bg-slate-800/95 backdrop-blur text-slate-200 text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-xl border border-slate-700 z-50">
              Manage website announcements and Papers Hub downloads.
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Save News Settings"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-emerald-400/20 border-t-emerald-400 rounded-full animate-spin"></div>
            ) : (
              <Save className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* 1. Papers Hub Manager Section */}
      <div className="bg-slate-900 border border-cyan-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[90px] pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400 shrink-0 border border-cyan-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">Papers Hub Manager</h2>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {papers.length} {papers.length === 1 ? 'Paper' : 'Papers'}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Add and manage past papers categorized by O/L, A/L, and Grade 5 for students to download.
              </p>
            </div>
          </div>
        </div>

        {/* Add Paper Form (Category, Name, Link) */}
        <form onSubmit={handleAddPaper} className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 mb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add New Paper
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
            {/* Field 1: Category Dropdown */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={paperCategory}
                onChange={(e) => setPaperCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-3 py-2.5 text-sm text-slate-200 transition-all outline-none font-semibold cursor-pointer"
              >
                <option value="O/L">O/L (Ordinary Level)</option>
                <option value="A/L">A/L (Advanced Level)</option>
                <option value="Grade 5">Grade 5 (ශිෂ්‍යත්වය)</option>
              </select>
            </div>

            {/* Field 2: Paper Name */}
            <div className="lg:col-span-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Paper Name / Title <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={paperName}
                  onChange={(e) => setPaperName(e.target.value)}
                  placeholder="e.g. 2023 A/L Combined Maths Past Paper"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* Field 3: Link */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Download Link (URL) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={paperLink}
                  onChange={(e) => setPaperLink(e.target.value)}
                  placeholder="https://drive.google.com/... or PDF link"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="lg:col-span-2">
              <button
                type="submit"
                disabled={addingPaper || !paperName.trim() || !paperLink.trim()}
                className="w-full h-[42px] bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {addingPaper ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Add Paper
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-[11px] text-cyan-400/80 mt-2 flex items-center gap-1">
            <span>💡</span> Google Drive share links direct download බවට auto-convert වේ.
          </p>
        </form>

        {/* Existing Papers List */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Available Papers List
            </h3>
            {papers.length > 0 && (
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={paperSearchTerm}
                  onChange={(e) => setPaperSearchTerm(e.target.value)}
                  placeholder="Search papers or category..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/40"
                />
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            {papers.length === 0 ? (
              <div className="text-center py-8 text-slate-500 bg-slate-950/50 rounded-xl border border-dashed border-slate-800">
                <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
                No papers added yet. Use the form above to add papers.
              </div>
            ) : filteredPapers.length === 0 ? (
              <div className="text-center py-6 text-slate-500 bg-slate-950/30 rounded-xl">
                No papers found matching "{paperSearchTerm}"
              </div>
            ) : (
              filteredPapers.map((paper) => (
                <div
                  key={paper.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 border border-slate-800/80 hover:border-slate-700/80 p-3.5 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider border ${
                          (paper.category || 'O/L') === 'A/L'
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                            : (paper.category || 'O/L') === 'Grade 5'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {paper.category || 'O/L'}
                        </span>
                        <div className="text-sm font-semibold text-slate-200 truncate">
                          {paper.name}
                        </div>
                      </div>
                      <a
                        href={paper.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-cyan-400/80 hover:text-cyan-300 hover:underline flex items-center gap-1 mt-0.5 truncate max-w-md"
                        title={paper.link}
                      >
                        <span className="truncate">{paper.link}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <a
                      href={paper.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Test Link
                    </a>
                    <button
                      onClick={() => setEditingPaper({
                        id: paper.id,
                        category: paper.category || 'O/L',
                        name: paper.name,
                        link: paper.link
                      })}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                      title="Edit Paper"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePaper(paper.id)}
                      disabled={deletingPaperId === paper.id}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                      title="Delete Paper"
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

      {/* Edit Paper Modal */}
      {editingPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-base">
                <Pencil className="w-4 h-4" /> Edit Paper
              </div>
              <button
                onClick={() => setEditingPaper(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category *</label>
                <select
                  value={editingPaper.category || 'O/L'}
                  onChange={(e) => setEditingPaper({ ...editingPaper, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-xl px-3 py-2.5 text-sm text-slate-200 outline-none font-semibold cursor-pointer"
                >
                  <option value="O/L">O/L (Ordinary Level)</option>
                  <option value="A/L">A/L (Advanced Level)</option>
                  <option value="Grade 5">Grade 5 (ශිෂ්‍යත්වය)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Paper Name / Title *</label>
                <input
                  type="text"
                  required
                  value={editingPaper.name}
                  onChange={(e) => setEditingPaper({ ...editingPaper, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Download Link (URL) *</label>
                <input
                  type="text"
                  required
                  value={editingPaper.link}
                  onChange={(e) => setEditingPaper({ ...editingPaper, link: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 outline-none"
                />
                <p className="text-[11px] text-cyan-400/80 mt-1">
                  💡 Google Drive link direct download බවට auto-convert වේ.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPaper(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {savingEdit ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Latest News Carousel Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-start gap-3 mb-6 border-b border-slate-800 pb-4">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-200">Latest News Carousel</h2>
            <p className="text-sm text-slate-400 mt-1">
              Add announcements or news items here. They will automatically scroll on the public website's Hero section.
            </p>
          </div>
        </div>

        {/* Add New Item */}
        <form onSubmit={handleAddItem} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Enter news announcement..."
            className="flex-1 bg-slate-950 border border-slate-800 focus-visible:ring-blue-500/40 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 transition-colors focus:outline-none"
          />
          <button 
            type="submit"
            disabled={!newItemText.trim()}
            className="bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white px-5 py-3 rounded-xl transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </form>

        {/* List of Items */}
        <div className="space-y-3">
          {newsItems.length === 0 ? (
            <div className="text-center py-8 text-slate-500 bg-slate-950/50 rounded-xl border border-dashed border-slate-800">
              No news items added yet.
            </div>
          ) : (
            newsItems.map((item, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 bg-slate-950 border border-slate-800 p-3 rounded-xl group hover:border-slate-700 transition-colors"
              >
                <div className="text-slate-600 cursor-grab active:cursor-grabbing px-1">
                  <GripVertical className="w-4 h-4" />
                </div>
                <div className="flex-1 text-slate-300 text-sm font-medium">
                  {item}
                </div>
                <button
                  onClick={() => handleRemoveItem(index)}
                  className="text-slate-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Remove Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-4 text-xs text-slate-500 flex justify-end">
          * Remember to click 'Save Settings' (top right button) after modifying news items.
        </div>
      </div>
    </div>
  );
}
