import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, ShoppingCart, History, LogOut, Menu, Wrench, UserCog, User, ChevronDown, Users, Wallet, RefreshCw, Tags, Contact } from 'lucide-react';

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
  totalPendingDues
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
                Customer Accounts
              </div>
            </button>

            <button
              onClick={() => setActiveTab('customer_directory')}
              className={`group relative w-full flex items-center justify-center p-3 rounded-xl transition-all duration-300 ${activeTab === 'customer_directory' ? 'bg-emerald-500/15 text-emerald-400 shadow-[inset_3px_0_0_0_#10b981] ring-1 ring-emerald-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
            >
              <Contact className="w-[22px] h-[22px]" />
              <div className="absolute left-16 hidden group-hover:block bg-slate-900/95 backdrop-blur-xl text-slate-100 text-xs font-semibold px-4 py-2 rounded-lg border border-white/10 whitespace-nowrap z-50 shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
                Customer Directory
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
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-slate-950 relative flex flex-col">
        {/* Top Header */}
        <div className="h-16 flex items-center justify-end px-6 bg-slate-950/60 backdrop-blur-2xl sticky top-0 z-30 border-b border-white/5 gap-4">
          
          <h1 className="hidden sm:flex items-center absolute left-1/2 transform -translate-x-1/2 text-xl font-extrabold tracking-tight gap-3">
            <img src="/desh-digital-hub/pwa-192x192.png" alt="DESH Digital Hub Logo" className="w-8 h-8 object-contain drop-shadow-md" />
            <span className="bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">DESH Digital Hub</span>
          </h1>

          <div className="mr-auto flex items-center gap-4">
            {todaySalesSum !== undefined && (
              <div className="hidden lg:flex items-center gap-2.5 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full shadow-inner">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Today's Sales</span>
                <span className="text-sm font-black text-emerald-400 tracking-wide">Rs {todaySalesSum.toFixed(2)}</span>
              </div>
            )}

            {totalPendingDues !== undefined && (
              <button 
                onClick={() => setActiveTab('customers')}
                className="hidden lg:flex items-center gap-2.5 px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full shadow-inner hover:bg-red-500/20 transition-colors cursor-pointer"
              >
                <span className="text-[11px] font-bold text-red-400/80 uppercase tracking-widest">Pending Dues</span>
                <span className="text-sm font-black text-red-400 tracking-wide">Rs {totalPendingDues.toFixed(2)}</span>
              </button>
            )}
          </div>

          <button 
            onClick={handleHardRefresh}
            title="Hard Refresh"
            className="flex items-center justify-center p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-slate-200"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {user && (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="hidden sm:flex items-center gap-3 pl-1 pr-3 py-1 bg-white/5 border border-white/10 rounded-full shadow-inner cursor-pointer hover:bg-white/10 transition-colors duration-200 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700/50 shadow-sm">
                  {isAdmin ? <UserCog className="w-4 h-4 text-emerald-400" /> : <User className="w-4 h-4 text-blue-400" />}
                </div>
                <div className="flex flex-col items-start justify-center">
                  <span className="text-[12px] font-bold text-slate-200 tracking-wide leading-tight">
                    {isAdmin ? 'Admin' : 'Sales'}
                  </span>
                  <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-1.5 leading-tight">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
                    Online
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ml-1 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2.5 border-b border-white/5 mb-1 bg-white/5">
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest mb-0.5">Signed in as</p>
                    <p className="text-sm font-semibold text-slate-200 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2.5 font-medium mt-1"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="absolute inset-0 top-16 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #64748b 1px, transparent 1px)', backgroundSize: '48px 48px' }}></div>

        <div className="w-full relative z-10 flex-1">
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
