import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  History, 
  LogOut, 
  Wrench, 
  UserCog, 
  User, 
  Users, 
  Wallet, 
  RefreshCw, 
  Tags, 
  Settings, 
  ChevronRight, 
  ChevronLeft, 
  BarChart3, 
  Calculator,
  Bell,
  HelpCircle,
  Menu,
  ChevronDown,
  Search,
  Grid,
  Headphones,
  Zap,
  ShieldCheck,
  Plus,
  MessageCircle
} from 'lucide-react';
import CalculatorDropdown from '../components/common/CalculatorDropdown';

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
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const dropdownRef = useRef(null);
  const calculatorRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (calculatorRef.current && !calculatorRef.current.contains(event.target)) {
        setIsCalculatorOpen(false);
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

  // Grouped Navigation Items matching StoreMate layout
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, hasDropdown: true },
    { id: 'pos', label: 'Orders / POS', icon: ShoppingCart, hasDropdown: true },
    { id: 'history', label: 'Sales History', icon: History, hasDropdown: true },
    { id: 'reports', label: 'Reports', icon: BarChart3, hasDropdown: false },
  ];

  const optionalNavItems = [
    ...(isAdmin ? [{ id: 'items', label: 'Products', icon: Tags, hasDropdown: true }] : []),
    { id: 'repairs', label: 'PC Repairs', icon: Wrench, hasDropdown: false },
    { id: 'customers', label: 'Customers', icon: Users, hasDropdown: false },
    { id: 'expenses', label: 'Expenses', icon: Wallet, hasDropdown: false },
    { id: 'settings', label: 'Settings', icon: Settings, hasDropdown: true },
  ];

  // Dynamic Breadcrumb text helper
  const getBreadcrumbs = () => {
    switch (activeTab) {
      case 'pos': return { section: 'Sales Order Management', page: 'Add New Sale' };
      case 'dashboard': return { section: 'Executive Overview', page: 'Main Dashboard' };
      case 'repairs': return { section: 'Services & Support', page: 'PC Repair Management' };
      case 'customers': return { section: 'CRM & Client Records', page: 'Customer Directory' };
      case 'expenses': return { section: 'Accounting', page: 'Shop Expenses' };
      case 'items': return { section: 'Inventory Management', page: 'Products & Stock' };
      case 'history': return { section: 'Sales Orders', page: 'Sales Invoices & Receipts' };
      case 'reports': return { section: 'Business Intelligence', page: 'Analytics & Reports' };
      case 'settings': return { section: 'System Configuration', page: 'Settings' };
      default: return { section: 'DESH Management', page: 'Home' };
    }
  };

  const breadcrumb = getBreadcrumbs();

  return (
    // Luxury Deep Oceanic Sapphire Container (Powers the seamless curve background)
    <div className="flex h-screen bg-gradient-to-br from-[#0c2340] via-[#0a1e36] to-[#061424] overflow-hidden text-slate-100 selection:bg-blue-500/30 selection:text-white print:hidden">

      {/* ======================================================== */}
      {/* LEFT SIDEBAR (Executive Deep Oceanic Sapphire Theme)     */}
      {/* ======================================================== */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-60' : 'w-[74px]'
        } bg-gradient-to-b from-[#0c2340] via-[#0a1e36] to-[#061424] border-r border-sky-500/10 flex flex-col justify-between shrink-0 transition-all duration-300 z-30 select-none relative`}
      >
        <div className="flex flex-col h-full">
          
          {/* Sidebar Top: Logo Branding + Menu Toggle Button */}
          <div className="h-16 flex items-center justify-between px-3.5 border-b border-white/10">
            {isSidebarOpen ? (
              <div className="flex items-center gap-2.5 cursor-pointer overflow-hidden" onClick={() => setActiveTab('dashboard')}>
                <div className="w-9 h-9 rounded-xl bg-white/10 p-1 border border-white/15 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
                  <img src="/pwa-192x192.png" alt="DESH Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-black text-white tracking-tight leading-none truncate">
                    DESH Digital Hub
                  </span>
                  <span className="text-[10px] text-sky-200/80 font-semibold tracking-wider uppercase mt-1 truncate">
                    Management Portal
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full flex justify-center cursor-pointer" onClick={() => setIsSidebarOpen(true)}>
                <div className="w-9 h-9 rounded-xl bg-white/10 p-1 border border-white/15 backdrop-blur-md flex items-center justify-center shadow-inner">
                  <img src="/pwa-192x192.png" alt="DESH Logo" className="w-full h-full object-contain" />
                </div>
              </div>
            )}

            {/* Hamburger Toggle Icon */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-1"
              title={isSidebarOpen ? "Collapse Menu" : "Expand Menu"}
            >
              {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation Links Area */}
          <nav className="flex-1 py-4 px-3 space-y-4 overflow-y-auto no-scrollbar">
            
            {/* Group 1: MAIN */}
            <div>
              {isSidebarOpen && (
                <div className="text-[10px] font-black uppercase tracking-widest text-white/50 px-3 mb-1.5">
                  Main
                </div>
              )}
              <div className="space-y-1">
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`group relative w-full flex items-center rounded-xl transition-all duration-200 cursor-pointer ${
                        isSidebarOpen 
                          ? 'justify-between px-3.5 py-2.5 text-xs' 
                          : 'flex-col justify-center py-2 px-1 text-center'
                      } ${
                        isActive 
                          ? 'bg-white/20 text-white font-bold backdrop-blur-md shadow-sm border border-white/20' 
                          : 'text-white/80 hover:text-white hover:bg-white/10 font-medium border border-transparent'
                      }`}
                    >
                      <div className={`flex items-center ${isSidebarOpen ? 'gap-3' : 'flex-col gap-1'}`}>
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-white/80 group-hover:text-white'}`} />
                        {isSidebarOpen ? (
                          <span className="truncate">{item.label}</span>
                        ) : (
                          <span className="text-[9px] font-semibold leading-tight text-white/70 group-hover:text-white truncate max-w-[60px]">
                            {item.label.split('/')[0]}
                          </span>
                        )}
                      </div>

                      {/* Dropdown chevron on right matching screenshot */}
                      {isSidebarOpen && item.hasDropdown && (
                        <ChevronDown className={`w-3.5 h-3.5 text-white/60 transition-transform ${isActive ? 'rotate-180 text-white' : 'group-hover:text-white'}`} />
                      )}

                      {/* Collapsed Tooltip */}
                      {!isSidebarOpen && (
                        <div className="absolute left-16 hidden group-hover:block bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 whitespace-nowrap z-50 shadow-2xl pointer-events-none">
                          {item.label}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Group 2: MANAGEMENT / OPTIONAL */}
            <div>
              {isSidebarOpen && (
                <div className="text-[10px] font-black uppercase tracking-widest text-white/50 px-3 mb-1.5">
                  Optional
                </div>
              )}
              <div className="space-y-1">
                {optionalNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`group relative w-full flex items-center rounded-xl transition-all duration-200 cursor-pointer ${
                        isSidebarOpen 
                          ? 'justify-between px-3.5 py-2.5 text-xs' 
                          : 'flex-col justify-center py-2 px-1 text-center'
                      } ${
                        isActive 
                          ? 'bg-white/20 text-white font-bold backdrop-blur-md shadow-sm border border-white/20' 
                          : 'text-white/80 hover:text-white hover:bg-white/10 font-medium border border-transparent'
                      }`}
                    >
                      <div className={`flex items-center ${isSidebarOpen ? 'gap-3' : 'flex-col gap-1'}`}>
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-white/80 group-hover:text-white'}`} />
                        {isSidebarOpen ? (
                          <span className="truncate">{item.label}</span>
                        ) : (
                          <span className="text-[9px] font-semibold leading-tight text-white/70 group-hover:text-white truncate max-w-[60px]">
                            {item.label.split('/')[0]}
                          </span>
                        )}
                      </div>

                      {isSidebarOpen && item.hasDropdown && (
                        <ChevronDown className={`w-3.5 h-3.5 text-white/60 transition-transform ${isActive ? 'rotate-180 text-white' : 'group-hover:text-white'}`} />
                      )}

                      {!isSidebarOpen && (
                        <div className="absolute left-16 hidden group-hover:block bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 whitespace-nowrap z-50 shadow-2xl pointer-events-none">
                          {item.label}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          </nav>

          {/* Sidebar Bottom Footer */}
          <div className="p-3 border-t border-white/15 bg-black/10">
            {isSidebarOpen ? (
              <div className="space-y-2">
                <div className="text-[10px] text-white/70 font-mono flex items-center justify-between">
                  <span>DESH Hub v1.25.1</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                {/* 4 Bottom Quick Icons from screenshot: Headset, Zap, Shield, Settings */}
                <div className="flex items-center justify-between text-white/70 pt-1">
                  <button title="Customer Support" className="hover:text-white cursor-pointer"><Headphones className="w-3.5 h-3.5" /></button>
                  <button title="System Speed" className="hover:text-white cursor-pointer"><Zap className="w-3.5 h-3.5" /></button>
                  <button title="Security Verified" className="hover:text-white cursor-pointer"><ShieldCheck className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setActiveTab('settings')} title="Settings" className="hover:text-white cursor-pointer"><Settings className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-white/70">
                <span className="text-[9px] font-mono">1.25</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </div>
            )}
          </div>

        </div>
      </aside>

      {/* ======================================================== */}
      {/* MAIN CONTENT CARD WITH THE SIGNATURE TOP-LEFT CURVE      */}
      {/* (rounded-tl-[34px] revealing the sapphire blue corner)   */}
      {/* ======================================================== */}
      <div className="flex-1 bg-[#090d16] rounded-tl-[34px] sm:rounded-tl-[38px] overflow-hidden flex flex-col shadow-[-18px_0_45px_rgba(0,0,0,0.85)] relative min-w-0 border-t border-l border-sky-400/20">
        
        {/* Top Header Bar (Uda Bar) inside the curved card */}
        <header className="h-16 px-5 sm:px-8 bg-[#0b101d]/90 backdrop-blur-2xl border-b border-slate-800/80 shrink-0 flex items-center justify-between gap-4 sticky top-0 z-20">
          
          {/* Left: Breadcrumbs / Title */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="sm:hidden p-2 rounded-xl bg-slate-800 text-white"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex flex-col">
              <span className="text-xs text-slate-400 font-semibold truncate">
                {breadcrumb.section} &gt; {breadcrumb.page}
              </span>
              <h2 className="text-sm sm:text-base font-black text-slate-100 tracking-tight leading-none mt-0.5">
                {activeTab === 'pos' ? 'Add New Sale' : breadcrumb.page}
              </h2>
            </div>
          </div>

          {/* Right: Round Utility Action Buttons matching StoreMate screenshot */}
          <div className="flex items-center justify-end gap-2 sm:gap-2.5 shrink-0">
            
            {/* Primary Action Button (Pill shape with plus icon) */}
            <button
              onClick={() => {
                if (activeTab === 'pos') {
                  window.dispatchEvent(new CustomEvent('pos-reset-sale'));
                } else {
                  setActiveTab('pos');
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Your First Order</span>
              <span className="sm:hidden">New</span>
            </button>

            {/* Round Search Button */}
            <button 
              title="Global Search"
              className="w-9 h-9 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-sky-400 hover:border-sky-500/40 flex items-center justify-center transition-all cursor-pointer shadow-sm"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Round Notification Bell Button */}
            <button 
              title="Notifications"
              className="relative w-9 h-9 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-sky-400 hover:border-sky-500/40 flex items-center justify-center transition-all cursor-pointer shadow-sm"
            >
              <Bell className="w-4 h-4" />
              {pendingOrders.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
              )}
            </button>

            {/* Round Grid Launcher Button */}
            <button 
              title="App Launcher"
              onClick={() => setActiveTab('dashboard')}
              className="w-9 h-9 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-sky-400 hover:border-sky-500/40 flex items-center justify-center transition-all cursor-pointer shadow-sm"
            >
              <Grid className="w-4 h-4" />
            </button>

            {/* Quick Calculator Dropdown (Round button) */}
            <div className="relative" ref={calculatorRef}>
              <button 
                onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
                title="Quick Calculator"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer border ${
                  isCalculatorOpen 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-blue-500/30' 
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-sky-400 hover:border-sky-500/40'
                }`}
              >
                <Calculator className="w-4 h-4" />
              </button>

              {isCalculatorOpen && (
                <CalculatorDropdown onClose={() => setIsCalculatorOpen(false)} />
              )}
            </div>

            {/* Hard Refresh Button */}
            <button 
              onClick={handleHardRefresh}
              title="Hard Refresh Cache"
              className="w-9 h-9 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 flex items-center justify-center transition-all cursor-pointer group shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
            </button>

            {/* User Profile Pill */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 pl-1.5 pr-3 py-1 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-full cursor-pointer transition-colors shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-md">
                    DH
                  </div>
                  <div className="hidden md:flex flex-col text-left -space-y-0.5">
                    <span className="text-xs font-bold text-slate-200 leading-tight">
                      DESH Hub
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {isAdmin ? 'System Owner' : 'Sales Cashier'}
                    </span>
                  </div>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-xs font-bold text-slate-200 truncate">{user.email || 'DESH Admin'}</p>
                      <p className="text-[10px] text-cyan-400">{isAdmin ? 'Administrator' : 'Staff'}</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </header>

        {/* Scrollable Content Body */}
        <main className="flex-1 p-5 sm:p-7 overflow-y-auto">
          {children}
        </main>

        {/* Floating WhatsApp Action Button in Bottom Right matching StoreMate screenshot */}
        <a
          href="https://wa.me/94770000000"
          target="_blank"
          rel="noopener noreferrer"
          title="Quick WhatsApp Support"
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:scale-110 transition-all duration-300 cursor-pointer"
        >
          <MessageCircle className="w-6 h-6 fill-white text-[#25D366]" />
        </a>

      </div>

    </div>
  );
}
