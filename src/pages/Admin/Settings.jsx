import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { notify } from '../../utils/toast';
import { Save, Plus, Trash2, GripVertical, Info, HelpCircle, Settings as SettingsIcon } from 'lucide-react';
import Loader from '../../components/Loader';

export default function Settings({ isAdmin }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newsItems, setNewsItems] = useState([]);
  const [newItemText, setNewItemText] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const docRef = doc(db, 'settings', 'news');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setNewsItems(data.items || []);
      } else {
        // Initialize if not exists
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
    <div className="p-4 space-y-4 w-full relative z-10 h-full flex flex-col pb-24 overflow-y-auto custom-scrollbar">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0 mb-4 px-2 md:px-4">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-xl font-black text-slate-100 uppercase tracking-widest flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-emerald-400" /> SYSTEM SETTINGS
          </h1>
          <div className="relative group cursor-help mt-1">
            <HelpCircle className="w-5 h-5 text-slate-500 hover:text-slate-300 transition-colors" />
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 w-max max-w-xs px-3 py-2 bg-slate-800/95 backdrop-blur text-slate-200 text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-xl border border-slate-700 z-50">
              Manage public website configurations and announcements.
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Save Settings"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-emerald-400/20 border-t-emerald-400 rounded-full animate-spin"></div>
            ) : (
              <Save className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-start gap-3 mb-6 border-b border-slate-800 pb-4">
          <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 shrink-0">
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
            className="flex-1 bg-slate-950 border border-slate-800 focus-visible:ring-cyan-500/40 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 transition-colors focus:outline-none"
          />
          <button 
            type="submit"
            disabled={!newItemText.trim()}
            className="bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white px-5 py-3 rounded-xl transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
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
          * Remember to click 'Save Settings' after making changes.
        </div>
      </div>
    </div>
  );
}
