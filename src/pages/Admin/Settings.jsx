import React, { useState, useEffect } from 'react';
import { settingsService } from '../../services/supabaseService';
import { notify } from '../../utils/toast';
import { Save, Plus, Trash2, Info, Settings as SettingsIcon } from 'lucide-react';
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
      const data = await settingsService.getSetting('news');
      if (data && data.items) {
        setNewsItems(data.items);
      }
    } catch (error) {
      console.error(error);
      notify.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNews = async () => {
    setSaving(true);
    try {
      await settingsService.setSetting('news', { items: newsItems });
      notify.success('Public notice bar updated successfully!');
    } catch (error) {
      console.error(error);
      notify.error('Failed to save settings');
    } finally {
      setSaving(false);
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
            Configure system parameters and public announcements.
          </p>
        </div>
      </div>

      {/* Notice Bar Settings */}
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
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 self-start sm:self-auto cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
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
          * Remember to click 'Save Settings' after making changes.
        </div>
      </div>
    </div>
  );
}
