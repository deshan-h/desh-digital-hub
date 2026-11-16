import React, { useState, useEffect } from 'react';
import { settingsService } from '../../services/supabaseService';
import { notify } from '../../utils/toast';
import { Save, Plus, Trash2, GripVertical, Info, HelpCircle, Settings as SettingsIcon, Database, CheckCircle2, RefreshCw } from 'lucide-react';
import Loader from '../../components/Loader';
import { runFirebaseToSupabaseMigration } from '../../utils/migrationService';

export default function Settings({ isAdmin }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newsItems, setNewsItems] = useState([]);
  const [newItemText, setNewItemText] = useState('');

  // Migration State
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(null);
  const [migrationSummary, setMigrationSummary] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleStartMigration = async () => {
    if (!window.confirm("Are you sure you want to transfer all data from Firebase to Supabase? Existing Firebase data will remain untouched.")) {
      return;
    }

    setIsMigrating(true);
    setMigrationSummary(null);
    setMigrationProgress({ message: 'Initializing migration...', percent: 0, stage: 'init' });

    try {
      const res = await runFirebaseToSupabaseMigration((p) => {
        setMigrationProgress(p);
      });

      if (res.success) {
        notify.success('All data migrated to Supabase successfully!');
        setMigrationSummary(res.results);
      } else {
        notify.error('Migration encountered errors. Check summary.');
        setMigrationSummary(res.results);
      }
    } catch (e) {
      console.error(e);
      notify.error('Migration failed: ' + e.message);
    } finally {
      setIsMigrating(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const data = await settingsService.getSetting('news');
      if (data && data.items) {
        setNewsItems(data.items);
      } else {
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
      await settingsService.saveSetting('news', { 
        items: newsItems,
        updatedAt: new Date().toISOString()
      });
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
            <SettingsIcon className="w-8 h-8 text-slate-300" /> SYSTEM SETTINGS
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

      {/* Supabase Migration Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20 shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">Database Migration to Supabase</h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Ready
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Transfer all Customers, Daily Sales, Dues, Repairs, POS Categories, and Expenses from Firebase Firestore to your normalized Supabase PostgreSQL database.
              </p>
              <div className="mt-2 text-xs text-slate-500 font-mono flex flex-wrap items-center gap-2">
                <span>Target URL:</span>
                <span className="text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  https://cxtfqlrnqdvrhsnifzmr.supabase.co
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleStartMigration}
            disabled={isMigrating}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {isMigrating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Migrating...</span>
              </>
            ) : (
              <>
                <Database className="w-4 h-4" />
                <span>Start Migration</span>
              </>
            )}
          </button>
        </div>

        {/* Progress Bar when running */}
        {isMigrating && migrationProgress && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
            <div className="flex justify-between items-center text-xs">
              <span className="text-emerald-400 font-bold flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                {migrationProgress.message}
              </span>
              <span className="text-slate-400 font-mono font-bold">{migrationProgress.percent}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${migrationProgress.percent}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Migration Summary Report */}
        {migrationSummary && (
          <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-5 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Migration Completed Successfully!</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                <span className="text-slate-400 block mb-1">Customers</span>
                <span className="text-lg font-black text-white">{migrationSummary.customers}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                <span className="text-slate-400 block mb-1">Daily Sales</span>
                <span className="text-lg font-black text-cyan-400">{migrationSummary.daily_sales}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                <span className="text-slate-400 block mb-1">Customer Dues</span>
                <span className="text-lg font-black text-orange-400">{migrationSummary.customer_dues}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                <span className="text-slate-400 block mb-1">Repairs</span>
                <span className="text-lg font-black text-purple-400">{migrationSummary.repairs}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                <span className="text-slate-400 block mb-1">POS Categories</span>
                <span className="text-lg font-black text-white">{migrationSummary.pos_categories}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                <span className="text-slate-400 block mb-1">Expenses</span>
                <span className="text-lg font-black text-white">{migrationSummary.expenses}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                <span className="text-slate-400 block mb-1">Pending Orders</span>
                <span className="text-lg font-black text-white">{migrationSummary.pending_orders}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                <span className="text-slate-400 block mb-1">Settings</span>
                <span className="text-lg font-black text-white">{migrationSummary.settings}</span>
              </div>
            </div>

            {migrationSummary.errors && migrationSummary.errors.length > 0 && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                <span className="font-bold block mb-1">Warnings/Errors ({migrationSummary.errors.length}):</span>
                <ul className="list-disc pl-4 space-y-1">
                  {migrationSummary.errors.slice(0, 5).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
