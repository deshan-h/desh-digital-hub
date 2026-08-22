import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, ShoppingCart, History, LogOut, Menu, Wrench, UserCog, User, ChevronDown, Users, Wallet, RefreshCw, Tags, Contact, Settings, TrendingUp, Clock } from 'lucide-react';

export default function AdminLayout({ 
  children, 
  activeTab, 
  setActiveTab, 
  isAdmin, 
  isSidebarOpen, 
  setIsSidebarOpen, 
  handleLogout,
  user,
  todaySalesSum,
  totalPendingDues,
  pendingOrders = [],
  setShowPendingOrdersModal
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleHardRefresh = async () => {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
    }
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        await registration.unregister();
      }
    }
    window.location.reload(true);
  };

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden text-slate-200 selection:bg-emerald-500/30 selection:text-white print:hidden">

      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-[72px]' : 'hidden'} bg-slate-950/40 backdrop-blur-3xl border-r border-white/5 flex flex-col justify-between shrink-0 transition-all duration-300 z-40 shadow-2xl relative`}>
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50 pointer-events-none"></div>
        <div className="relative z-10">
          <nav className="p-3 space-y-3 mt-4">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`group relative w-full flex items-center justify-center p-3 rounded-xl transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-emerald-500/15 text-emerald-400 shadow-[inset_3px_0_0_0_#10b981] ring-1 ring-emerald-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
              >
                <LayoutDashboard className="w-[22px] h-[22px]" />
                <div className="absolute left-16 hidden group-hover:block bg-slate-900/95 backdrop-blur-xl text-slate-100 text-xs font-semibold px-4 py-2 rounded-lg border border-white/10 whitespace-nowrap z-50 shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
                  Dashboard
                </div>
              </button>

              <button
                onClick={() => setActiveTab('pos')}
                className={`group relative w-full flex items-center justify-center p-3 rounded-xl transition-all duration-300 ${activeTab === 'pos' ? 'bg-emerald-500/15 text-emerald-400 shadow-[inset_3px_0_0_0_#10b981] ring-1 ring-emerald-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
              >
                <ShoppingCart className="w-[22px] h-[22px]" />
                <div className="absolute left-16 hidden group-hover:block bg-slate-900/95 backdrop-blur-xl text-slate-100 text-xs font-semibold px-4 py-2 rounded-lg border border-white/10 whitespace-nowrap z-50 shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
                Point of Sale
              </div>
            </button>

            <button
              onClick={() => setActiveTab('repairs')}
              className={`group relative w-full flex items-center justify-center p-3 rounded-xl transition-all duration-300 ${activeTab === 'repairs' ? 'bg-emerald-500/15 text-emerald-400 shadow-[inset_3px_0_0_0_#10b981] ring-1 ring-emerald-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
            >
              <Wrench className="w-[22px] h-[22px]" />
              <div className="absolute left-16 hidden group-hover:block bg-slate-900/95 backdrop-blur-xl text-slate-100 text-xs font-semibold px-4 py-2 rounded-lg border border-white/10 whitespace-nowrap z-50 shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
                PC Repairs
              </div>
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`group relative w-full flex items-center justify-center p-3 rounded-xl transition-all duration-300 ${activeTab === 'customers' ? 'bg-emerald-500/15 text-emerald-400 shadow-[inset_3px_0_0_0_#10b981] ring-1 ring-emerald-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
            >
              <Users className="w-[22px] h-[22px]" />
              <div className="absolute left-16 hidden group-hover:block bg-slate-900/95 backdrop-blur-xl text-slate-100 text-xs font-semibold px-4 py-2 rounded-lg border border-white/10 whitespace-nowrap z-50 shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
                Customers
              </div>
            </button>



            <button
              onClick={() => setActiveTab('expenses')}
              className={`group relative w-full flex items-center justify-center p-3 rounded-xl transition-all duration-300 ${activeTab === 'expenses' ? 'bg-red-500/15 text-red-400 shadow-[inset_3px_0_0_0_#ef4444] ring-1 ring-red-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
            >
              <Wallet className="w-[22px] h-[22px]" />
              <div className="absolute left-16 hidden group-hover:block bg-slate-900/95 backdrop-blur-xl text-slate-100 text-xs font-semibold px-4 py-2 rounded-lg border border-white/10 whitespace-nowrap z-50 shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
                Shop Expenses
              </div>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('items')}
                className={`group relative w-full flex items-center justify-center p-3 rounded-xl transition-all duration-300 ${activeTab === 'items' ? 'bg-emerald-500/15 text-emerald-400 shadow-[inset_3px_0_0_0_#10b981] ring-1 ring-emerald-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
              >
                <Tags className="w-[22px] h-[22px]" />
                <div className="absolute left-16 hidden group-hover:block bg-slate-900/95 backdrop-blur-xl text-slate-100 text-xs font-semibold px-4 py-2 rounded-lg border border-white/10 whitespace-nowrap z-50 shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
                  Items & Prices
                </div>
              </button>
            )}

            <button
              onClick={() => setActiveTab('history')}
              className={`group relative w-full flex items-center justify-center p-3 rounded-xl transition-all duration-300 ${activeTab === 'history' ? 'bg-emerald-500/15 text-emerald-400 shadow-[inset_3px_0_0_0_#10b981] ring-1 ring-emerald-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
            >
              <History className="w-[22px] h-[22px]" />
              <div className="absolute left-16 hidden group-hover:block bg-slate-900/95 backdrop-blur-xl text-slate-100 text-xs font-semibold px-4 py-2 rounded-lg border border-white/10 whitespace-nowrap z-50 shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
                Sales History
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('settings')}
              className={`group relative w-full flex items-center justify-center p-3 rounded-xl transition-all duration-300 ${activeTab === 'settings' ? 'bg-emerald-500/15 text-emerald-400 shadow-[inset_3px_0_0_0_#10b981] ring-1 ring-emerald-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
            >
              <Settings className="w-[22px] h-[22px]" />
              <div className="absolute left-16 hidden group-hover:block bg-slate-900/95 backdrop-blur-xl text-slate-100 text-xs font-semibold px-4 py-2 rounded-lg border border-white/10 whitespace-nowrap z-50 shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
                Settings
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-slate-950 relative flex flex-col">
        {/* Top Header */}
        <div className="h-[52px] mx-4 mt-4 rounded-xl flex items-center justify-between px-5 bg-gradient-to-r from-slate-900/70 via-slate-950/70 to-slate-900/70 backdrop-blur-2xl sticky top-4 z-30 border border-white/5 border-t-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] gap-3">
          
          <div className="flex items-center gap-4 flex-1">
            {/* Sales and Pending badges moved to POS Search row */}
          </div>

          <h1 className="hidden sm:flex items-center absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg font-extrabold tracking-tight gap-2.5 hover:scale-105 transition-transform duration-500 cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full"></div>
              <img src="/desh-digital-hub/pwa-192x192.png" alt="DESH Digital Hub Logo" className="w-7 h-7 object-contain drop-shadow-lg relative z-10" />
            </div>
            <span className="bg-gradient-to-r from-slate-100 via-white to-slate-400 bg-clip-text text-transparent drop-shadow-sm">DESH Digital Hub</span>
          </h1>

          <div className="flex items-center justify-end gap-3 flex-1">
            <button 
              onClick={handleHardRefresh}
              title="Hard Refresh"
              className="flex items-center justify-center p-2 bg-slate-950/40 border border-white/5 rounded-full hover:bg-white/10 hover:border-white/10 transition-all duration-300 text-slate-400 hover:text-slate-200 shadow-inner group"
            >
              <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
            </button>

          {user && (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="hidden sm:flex items-center gap-2.5 pl-1 pr-3 py-1 bg-slate-950/40 border border-white/5 rounded-full shadow-inner cursor-pointer hover:bg-white/10 hover:border-white/10 transition-all duration-300 focus:outline-none"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center border border-white/10 shadow-md">
                  {isAdmin ? <UserCog className="w-3.5 h-3.5 text-emerald-400 drop-shadow-md" /> : <User className="w-3.5 h-3.5 text-blue-400 drop-shadow-md" />}
                </div>
                <div className="flex flex-col items-start justify-center -space-y-0.5">
                  <span className="text-[12px] font-bold text-slate-200 tracking-wide">
                    {isAdmin ? 'Admin' : 'Sales'}
                  </span>
                  <span className="text-[9px] font-medium text-emerald-400 flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
                    Online
                  </span>
                </div>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-300 ml-0.5 ${isDropdownOpen ? 'rotate-180 text-white' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] py-2 z-50 animate-in fade-in slide-in-from-top-2 origin-top-right">
                  <div className="px-5 py-3 border-b border-white/5 mb-1 bg-white/5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Signed in as</p>
                    <p className="text-sm font-black text-slate-200 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-5 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-3 font-bold mt-1 group"
                  >
                    <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Sign out
                  </button>
                </div>
              )}
            </div>
          )}
          </div>
        </div>

        <div className="absolute inset-0 top-16 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #64748b 1px, transparent 1px)', backgroundSize: '48px 48px' }}></div>

        <div className="w-full relative z-10 flex-1 pt-1">
          {children}
        </div>

        <footer className="w-full flex items-center justify-center gap-3 py-10 mt-8 border-t border-slate-800/30 text-slate-400 text-sm font-medium bg-slate-950/20 backdrop-blur-sm relative z-20 shrink-0">
          <span className="tracking-wide">Developed By</span>
          <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800 shadow-inner">
            <img src={`${import.meta.env.BASE_URL}desh-logo.png`} alt="DEH Logo" className="h-6 w-auto object-contain drop-shadow-md" />
            <span className="text-slate-200 font-black tracking-widest uppercase">Desh</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
