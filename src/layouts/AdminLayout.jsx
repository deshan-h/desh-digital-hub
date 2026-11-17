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
  ExternalLink,
  Plus
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

  // Nav Items definition matching Enterprise ERP style
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-400', activeBg: 'bg-blue-500/15 text-blue-400 border-blue-500/40' },
    { id: 'pos', label: 'Orders / POS', icon: ShoppingCart, color: 'text-cyan-400', activeBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40' },
    { id: 'repairs', label: 'Repairs', icon: Wrench, color: 'text-orange-400', activeBg: 'bg-orange-500/15 text-orange-400 border-orange-500/40' },
    { id: 'customers', label: 'Customers', icon: Users, color: 'text-purple-400', activeBg: 'bg-purple-500/15 text-purple-400 border-purple-500/40' },
    { id: 'expenses', label: 'Expenses', icon: Wallet, color: 'text-rose-400', activeBg: 'bg-rose-500/15 text-rose-400 border-rose-500/40' },
    ...(isAdmin ? [{ id: 'items', label: 'Products', icon: Tags, color: 'text-amber-400', activeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/40' }] : []),
    { id: 'history', label: 'Sales History', icon: History, color: 'text-emerald-400', activeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40' },
    { id: 'reports', label: 'Reports', icon: BarChart3, color: 'text-teal-400', activeBg: 'bg-teal-500/15 text-teal-400 border-teal-500/40' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'text-slate-300', activeBg: 'bg-slate-500/15 text-slate-300 border-slate-500/40' },
  ];

  // Breadcrumbs text helper
  const getBreadcrumbs = () => {
    switch (activeTab) {
      case 'pos': return { section: 'Sales Order Management', page: 'Point of Sale (POS) / Add New Sale' };
      case 'dashboard': return { section: 'Executive Overview', page: 'Main Dashboard' };
      case 'repairs': return { section: 'Technical Services', page: 'PC & Hardware Repair Management' };
      case 'customers': return { section: 'CRM & Client Records', page: 'Customer Directory' };
      case 'expenses': return { section: 'Accounting & Finance', page: 'Shop Expenses' };
      case 'items': return { section: 'Inventory Management', page: 'Products, Stock & Pricing' };
      case 'history': return { section: 'Sales Invoices', page: 'Sales History & Receipts' };
      case 'reports': return { section: 'Analytics & Insights', page: 'Performance Reports' };
      case 'settings': return { section: 'System Configuration', page: 'Wallpaper Banners & Settings' };
      default: return { section: 'DESH Management', page: 'Administration' };
    }
  };

  const breadcrumb = getBreadcrumbs();

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-200 selection:bg-cyan-500/30 selection:text-white print:hidden">

      {/* Slim Icon-First ERP Vertical Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-52' : 'w-[72px]'
        } bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between shrink-0 transition-all duration-300 z-40 shadow-2xl relative hidden sm:flex`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Top: Collapse/Expand Header */}
          <div className="h-14 flex items-center justify-between px-3 border-b border-slate-800/80">
            {isSidebarOpen ? (
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black text-sm">
                  DH
                </div>
                <span className="font-extrabold text-xs tracking-wider text-slate-200 uppercase truncate">
                  DESH Hub
                </span>
              </div>
            ) : (
              <div className="w-full flex justify-center">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black text-sm">
                  DH
                </div>
              </div>
            )}

            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800 cursor-pointer"
              title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Items (Stacked Icon + Micro-label) */}
          <nav className="flex-1 py-3 px-2 space-y-1.5 overflow-y-auto no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`group relative w-full flex rounded-xl transition-all duration-200 cursor-pointer ${
                    isSidebarOpen 
                      ? 'items-center px-3 py-2.5 gap-3' 
                      : 'flex-col items-center justify-center py-2 px-1 gap-1 text-center'
                  } ${
                    isActive 
                      ? `${item.activeBg} border shadow-sm font-bold` 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? item.color : 'text-slate-400 group-hover:text-slate-200'}`} />
                  
                  {isSidebarOpen ? (
                    <span className="text-xs font-semibold whitespace-nowrap truncate">{item.label}</span>
                  ) : (
                    <span className="text-[10px] font-medium leading-tight tracking-tight text-slate-400 group-hover:text-slate-200 line-clamp-1 w-full truncate">
                      {item.label.split('/')[0]}
                    </span>
                  )}

                  {/* Tooltip on hover when collapsed */}
                  {!isSidebarOpen && (
                    <div className="absolute left-16 hidden group-hover:block bg-slate-900 text-slate-100 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 whitespace-nowrap z-50 shadow-xl pointer-events-none">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer: Version & Support */}
          <div className="p-2.5 border-t border-slate-800/80 bg-slate-950/60">
            {isSidebarOpen ? (
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span className="font-mono">v1.25.1</span>
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 text-[9px] text-slate-500">
                <span className="font-mono">v1.25</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 overflow-y-auto bg-slate-950 flex flex-col min-w-0">
        
        {/* Top ERP Breadcrumb & Utility Header */}
        <header className="h-14 px-4 sm:px-6 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-30 flex items-center justify-between gap-4">
          
          {/* Left: Breadcrumbs & Page Subtitle */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="sm:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium truncate">
                <span className="text-cyan-400 hover:underline cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                  {breadcrumb.section}
                </span>
                <span className="text-slate-600">&gt;</span>
                <span className="text-slate-300 font-semibold truncate">{breadcrumb.page}</span>
              </div>
            </div>
          </div>

          {/* Right: Actions, Calculator, Refresh, Profile */}
          <div className="flex items-center justify-end gap-2.5 shrink-0">
            
            {/* Quick Action Button for POS */}
            {activeTab === 'pos' && (
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('pos-reset-sale'));
                }}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Sale Order</span>
              </button>
            )}

            {/* Quick Calculator Dropdown */}
            <div className="relative" ref={calculatorRef}>
              <button 
                onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
                title="Quick Calculator"
                className={`flex items-center justify-center p-2 rounded-xl transition-all cursor-pointer border ${
                  isCalculatorOpen 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-slate-700'
                }`}
              >
                <Calculator className="w-4 h-4" />
              </button>

              {isCalculatorOpen && (
                <CalculatorDropdown onClose={() => setIsCalculatorOpen(false)} />
              )}
            </div>

            {/* Hard Refresh button */}
            <button 
              onClick={handleHardRefresh}
              title="Hard Refresh Cache"
              className="flex items-center justify-center p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors cursor-pointer group"
            >
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            </button>

            {/* User Profile Avatar & Role */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 pl-1.5 pr-3 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-700 text-white font-black text-xs flex items-center justify-center shadow-sm">
                    {isAdmin ? 'AD' : 'SA'}
                  </div>
                  <div className="hidden md:flex flex-col text-left -space-y-0.5">
                    <span className="text-xs font-bold text-slate-200 leading-tight">
                      {user.email ? user.email.split('@')[0] : (isAdmin ? 'Admin' : 'Sales')}
                    </span>
                    <span className="text-[10px] text-cyan-400 font-semibold uppercase">
                      {isAdmin ? 'System Owner' : 'Sales Staff'}
                    </span>
                  </div>
                </button>

                {/* Profile Dropdown */}
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

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-5 lg:p-6 overflow-y-auto">
          {children}
        </main>

      </div>

    </div>
  );
}
