import React, { useState, useEffect, useRef } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { parseTimestamp } from '../utils/helpers';
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
  Plus,
  MessageCircle,
  MessageSquare,
  Receipt,
  Clock,
  Trash2,
  CheckCircle2,
  Send,
  Check
} from 'lucide-react';
import CalculatorDropdown from '../components/common/CalculatorDropdown';
import { pendingOrderService } from '../services/supabaseService';
import { notify } from '../utils/toast';

export default function AdminLayout({
  children,
  activeTab,
  setActiveTab,
  isAdmin,
  isSidebarOpen,
  setIsSidebarOpen,
  handleLogout,
  user,
  todaySalesSum = 0,
  todaySalesList = [],
  totalPendingDues,
  pendingOrders = [],
  setShowPendingOrdersModal,
  inquiries = [],
  newInquiriesCount = 0,
  onMarkAllInquiriesRead
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isTodaySalesOpen, setIsTodaySalesOpen] = useState(false);
  const [isPendingSalesOpen, setIsPendingSalesOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(() => activeTab === 'history' || activeTab === 'reports');
  const dropdownRef = useRef(null);
  const calculatorRef = useRef(null);
  const todaySalesDropdownRef = useRef(null);
  const pendingSalesDropdownRef = useRef(null);
  const notificationsRef = useRef(null);

  const pendingSalesSum = (pendingOrders || []).reduce(
    (acc, curr) => acc + (Number(curr.totalAmount || curr.total_amount) || 0),
    0
  );

  const newInquiries = (inquiries || []).filter(i => i.status === 'new');
  const totalNotificationsCount = newInquiriesCount + (pendingOrders || []).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (calculatorRef.current && !calculatorRef.current.contains(event.target)) {
        setIsCalculatorOpen(false);
      }
      if (todaySalesDropdownRef.current && !todaySalesDropdownRef.current.contains(event.target)) {
        setIsTodaySalesOpen(false);
      }
      if (pendingSalesDropdownRef.current && !pendingSalesDropdownRef.current.contains(event.target)) {
        setIsPendingSalesOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
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

  useEffect(() => {
    if (activeTab === 'history' || activeTab === 'reports') {
      setIsReportsOpen(true);
    }
  }, [activeTab]);

  // Grouped Navigation Items matching StoreMate layout
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'Sales / POS', icon: ShoppingCart },
    { id: 'repairs', label: 'PC Repairs', icon: Wrench },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      hasSubNav: true,
      subItems: [
        { id: 'history', label: 'Sales Report', icon: Receipt },
        { id: 'reports', label: 'Customer Report', icon: Users }
      ]
    },
  ];

  const optionalNavItems = [
    ...(isAdmin ? [{ id: 'items', label: 'Products', icon: Tags }] : []),
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'expenses', label: 'Expenses', icon: Wallet },
    { id: 'inquiries', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Dynamic Breadcrumb text helper
  const getBreadcrumbs = () => {
    switch (activeTab) {
      case 'pos': return { section: 'Sales Management', page: 'Add New Sale' };
      case 'dashboard': return { section: 'Executive Overview', page: 'Main Dashboard' };
      case 'repairs': return { section: 'Services & Support', page: 'PC Repair Management' };
      case 'customers': return { section: 'CRM & Client Records', page: 'Customer Directory' };
      case 'expenses': return { section: 'Accounting', page: 'Shop Expenses' };
      case 'items': return { section: 'Inventory Management', page: 'Products & Stock' };
      case 'inquiries': return { section: 'Customer Support', page: 'Messages & Inquiries' };
      case 'history': return { section: 'Business Reports', page: 'Sales Report & Records' };
      case 'reports': return { section: 'Business Reports', page: 'Customer Analytics Report' };
      case 'settings': return { section: 'System Configuration', page: 'Settings' };
      default: return { section: 'DESH Management', page: 'Home' };
    }
  };

  const breadcrumb = getBreadcrumbs();

  return (
    // Luxury Deep Oceanic Sapphire Container (Powers the seamless curve background)
    <div className="flex h-screen bg-gradient-to-b from-[#0c2340] via-[#0a1e36] to-[#061424] overflow-hidden text-slate-100 selection:bg-blue-500/30 selection:text-white print:hidden">

      {/* ======================================================== */}
      {/* LEFT SIDEBAR (Executive Deep Oceanic Sapphire Theme)     */}
      {/* Seamless integration with the canvas background           */}
      {/* ======================================================== */}
      <aside
        className={`${isSidebarOpen ? 'w-60' : 'w-[74px]'
          } bg-transparent flex flex-col justify-between shrink-0 transition-all duration-300 z-30 select-none relative`}
      >
        <div className="flex flex-col h-full">

          {/* Sidebar Top: Logo Branding + Menu Toggle Button */}
          <div className="h-16 flex items-center px-3.5 border-b border-white/5">
            {isSidebarOpen ? (
              <div className="flex items-center justify-between w-full">
                <div
                  className="flex items-center gap-2.5 cursor-pointer overflow-hidden group"
                  onClick={() => setActiveTab('dashboard')}
                  title="Go to Dashboard"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/10 p-1 border border-white/15 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner group-hover:border-sky-400/40 transition-colors">
                    <img src="/pwa-192x192.png" alt="DESH Logo" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex flex-col min-w-0 justify-center">
                    <span className="text-sm font-black text-white tracking-tight leading-normal pb-0.5 truncate group-hover:text-sky-300 transition-colors">
                      DESH Digital Hub
                    </span>
                    <span className="text-[10px] text-sky-200/80 font-semibold tracking-wider uppercase truncate">
                      Management Portal
                    </span>
                  </div>
                </div>

                {/* Collapse Button */}
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0 mr-1"
                  title="Collapse Menu"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="w-full flex justify-center">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="group relative w-10 h-10 rounded-xl bg-white/10 p-1 border border-white/15 hover:border-sky-400/50 hover:bg-sky-500/20 backdrop-blur-md flex items-center justify-center cursor-pointer transition-all duration-200 shadow-inner"
                  title="Click to Expand Sidebar"
                >
                  <img
                    src="/pwa-192x192.png"
                    alt="DESH Logo"
                    className="w-full h-full object-contain transition-all duration-200 group-hover:scale-75 group-hover:opacity-0"
                  />
                  <ChevronRight className="w-5 h-5 text-sky-400 absolute opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:scale-110" />
                </button>
              </div>
            )}
          </div>

          {/* Navigation Links Area */}
          <nav className={`flex-1 py-4 px-3 space-y-4 ${isSidebarOpen ? 'overflow-y-auto custom-scrollbar' : 'overflow-visible'}`}>

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
                  const isItemActive = activeTab === item.id || (item.hasSubNav && (activeTab === 'history' || activeTab === 'reports'));

                  return (
                    <div key={item.id} className="space-y-1">
                      <button
                        onClick={() => {
                          if (item.hasSubNav) {
                            setIsReportsOpen(prev => !prev);
                            if (activeTab !== 'history' && activeTab !== 'reports') {
                              setActiveTab('history');
                            }
                          } else {
                            setActiveTab(item.id);
                          }
                        }}
                        className={`group relative w-full flex items-center rounded-xl transition-all duration-200 cursor-pointer ${isSidebarOpen
                          ? 'justify-between px-3.5 py-2.5 text-xs'
                          : 'flex-col justify-center py-2 px-1 text-center'
                          } ${isItemActive
                            ? 'bg-white/20 text-white font-bold backdrop-blur-md shadow-sm border border-white/20'
                            : 'text-white/80 hover:text-white hover:bg-white/10 font-medium border border-transparent'
                          }`}
                      >
                        <div className={`flex items-center ${isSidebarOpen ? 'gap-3' : 'flex-col gap-1'}`}>
                          <Icon className={`w-4 h-4 shrink-0 ${isItemActive ? 'text-white' : 'text-white/80 group-hover:text-white'}`} />
                          {isSidebarOpen ? (
                            <span className="truncate">{item.label}</span>
                          ) : (
                            <span className="text-[9px] font-semibold leading-tight text-white/70 group-hover:text-white truncate max-w-[60px]">
                              {item.label.split('/')[0]}
                            </span>
                          )}
                        </div>

                        {/* Expand chevron ONLY for Reports (item.hasSubNav) */}
                        {isSidebarOpen && item.hasSubNav && (
                          <ChevronDown className={`w-3.5 h-3.5 text-white/60 transition-transform ${isReportsOpen ? 'rotate-180 text-white' : 'group-hover:text-white'}`} />
                        )}

                        {/* Collapsed Tooltip / Sub-menu Popover */}
                        {!isSidebarOpen && (
                          item.hasSubNav ? (
                            <div className="absolute left-full ml-3.5 top-0 hidden group-hover:flex flex-col gap-1.5 bg-slate-900/95 backdrop-blur-md text-white text-xs font-bold p-2.5 rounded-xl border border-slate-700/80 shadow-2xl whitespace-nowrap w-max min-w-[150px] z-50">
                              <div className="text-[10px] uppercase tracking-wider text-slate-400 px-2 py-0.5 border-b border-slate-800 pb-1">
                                {item.label}
                              </div>
                              {item.subItems.map(sub => (
                                <div
                                  key={sub.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTab(sub.id);
                                  }}
                                  className={`px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-2 ${activeTab === sub.id ? 'text-sky-400 bg-sky-500/15 font-bold' : 'text-slate-300'
                                    }`}
                                >
                                  <span>{sub.label}</span>
                                </div>
                              ))}
                              {/* Pointer Arrow */}
                              <div className="absolute -left-1 top-4 w-2 h-2 bg-slate-900 border-l border-b border-slate-700/80 rotate-45" />
                            </div>
                          ) : (
                            <div className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center bg-slate-900/95 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-2xl whitespace-nowrap w-max z-50 pointer-events-none">
                              <span>{item.label}</span>
                              {/* Pointer Arrow */}
                              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 border-l border-b border-slate-700/80 rotate-45" />
                            </div>
                          )
                        )}
                      </button>

                      {/* Expandable Sub-items for Reports (Visible in both Expanded & Collapsed Sidebar) */}
                      {item.hasSubNav && isReportsOpen && (
                        isSidebarOpen ? (
                          <div className="pl-4 pr-1 pt-0.5 pb-1 space-y-1">
                            {item.subItems.map(sub => {
                              const SubIcon = sub.icon;
                              const isSubActive = activeTab === sub.id;
                              return (
                                <button
                                  key={sub.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTab(sub.id);
                                  }}
                                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${isSubActive
                                    ? 'bg-sky-500/25 text-white font-bold border border-sky-400/40 shadow-sm'
                                    : 'text-white/70 hover:text-white hover:bg-white/10 font-medium border border-transparent'
                                    }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <SubIcon className={`w-3.5 h-3.5 ${isSubActive ? 'text-sky-300' : 'text-white/60'}`} />
                                    <span>{sub.label}</span>
                                  </div>
                                  {isSubActive && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]" />}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          /* Collapsed Sidebar: Sub-icons stacked vertically right below Reports */
                          <div className="flex flex-col items-center gap-1.5 py-1.5 my-1 bg-black/30 rounded-2xl border border-white/10 shadow-inner">
                            {item.subItems.map(sub => {
                              const SubIcon = sub.icon;
                              const isSubActive = activeTab === sub.id;
                              return (
                                <button
                                  key={sub.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTab(sub.id);
                                  }}
                                  className={`relative group/sub w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${isSubActive
                                    ? 'bg-sky-500 text-slate-950 font-black shadow-md shadow-sky-500/40 ring-1 ring-sky-300'
                                    : 'text-white/70 hover:text-white hover:bg-white/15'
                                    }`}
                                  title={sub.label}
                                >
                                  <SubIcon className="w-4 h-4" />
                                  {/* Popover label tooltip on hover */}
                                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover/sub:flex items-center bg-slate-900/95 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-2xl whitespace-nowrap w-max z-50 pointer-events-none">
                                    <span>{sub.label}</span>
                                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 border-l border-b border-slate-700/80 rotate-45" />
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )
                      )}
                    </div>
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
                      className={`group relative w-full flex items-center rounded-xl transition-all duration-200 cursor-pointer ${isSidebarOpen
                        ? 'justify-between px-3.5 py-2.5 text-xs'
                        : 'flex-col justify-center py-2 px-1 text-center'
                        } ${isActive
                          ? 'bg-white/20 text-white font-bold backdrop-blur-md shadow-sm border border-white/20'
                          : 'text-white/80 hover:text-white hover:bg-white/10 font-medium border border-transparent'
                        }`}
                    >
                      <div className={`flex items-center ${isSidebarOpen ? 'gap-3' : 'flex-col gap-1'}`}>
                        <div className="relative">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-white/80 group-hover:text-white'}`} />
                          {!isSidebarOpen && item.id === 'inquiries' && newInquiriesCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                          )}
                        </div>
                        {isSidebarOpen ? (
                          <span className="truncate">{item.label}</span>
                        ) : (
                          <span className="text-[9px] font-semibold leading-tight text-white/70 group-hover:text-white truncate max-w-[60px]">
                            {item.label.split('/')[0]}
                          </span>
                        )}
                      </div>

                      {/* Unread Inquiries Badge */}
                      {isSidebarOpen && item.id === 'inquiries' && newInquiriesCount > 0 && (
                        <span className="ml-auto px-2 py-0.5 text-[10px] font-black rounded-full bg-rose-500 text-white shadow-sm animate-pulse">
                          {newInquiriesCount}
                        </span>
                      )}

                      {!isSidebarOpen && (
                        <div className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center bg-slate-900/95 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-2xl whitespace-nowrap w-max z-50 pointer-events-none">
                          <span>{item.label}</span>
                          {/* Pointer Arrow */}
                          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 border-l border-b border-slate-700/80 rotate-45" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          </nav>

          {/* Sidebar Bottom Footer: Version Number Only */}
          <div className="p-3 border-t border-white/5">
            {isSidebarOpen ? (
              <div className="text-[11px] text-white/60 font-mono flex items-center justify-between px-1">
                <span>DESH Hub v1.25.1</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="System Online"></span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-white/60">
                <span className="text-[9px] font-mono font-medium">1.25</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="System Online"></span>
              </div>
            )}
          </div>

        </div>
      </aside>

      {/* ======================================================== */}
      {/* MAIN CONTENT CARD WITH SLEEK SEAMLESS TOP-LEFT CURVE     */}
      {/* ======================================================== */}
      <div className="flex-1 bg-[#090d16] rounded-tl-[24px] sm:rounded-tl-[28px] overflow-hidden flex flex-col shadow-[-16px_0_35px_rgba(0,0,0,0.75)] relative min-w-0">

        {/* Top Header Bar inside the curved card */}
        <header className="h-16 pl-8 sm:pl-10 pr-5 sm:pr-8 bg-[#0b101d]/90 backdrop-blur-2xl border-b border-slate-800/80 shrink-0 flex items-center justify-between gap-4 sticky top-0 z-50">

          {/* Left: Breadcrumbs / Title */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="sm:hidden p-2 rounded-xl bg-slate-800 text-white"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center">
              <h2 className="text-sm sm:text-base font-black text-slate-100 tracking-tight leading-none">
                {activeTab === 'pos' ? 'Add New Sale' : breadcrumb.page}
              </h2>
            </div>

            {/* Today Sales Quick Stat Dropdown Button */}
            <div className="relative ml-1 sm:ml-2" ref={todaySalesDropdownRef}>
              <button
                onClick={() => setIsTodaySalesOpen(!isTodaySalesOpen)}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 transition-all cursor-pointer shadow-sm group"
                title="Click to view today's bills"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <span className="text-slate-400 font-semibold hidden md:inline">Today:</span>
                  <span className="text-emerald-300 font-black tracking-tight">
                    Rs. {Number(todaySalesSum).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                    {todaySalesList.length} {todaySalesList.length === 1 ? 'Bill' : 'Bills'}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 text-emerald-400 ${isTodaySalesOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown displaying today's bills */}
              {isTodaySalesOpen && (
                <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-[#0c1222] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl animate-in fade-in duration-150">
                  <div className="p-3.5 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white tracking-wide">Today's Sales & Bills</h4>
                        <p className="text-[10px] text-emerald-400 font-semibold">
                          {todaySalesList.length} completed transactions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-semibold">Total Revenue</p>
                      <p className="text-xs font-black text-emerald-300">
                        Rs. {Number(todaySalesSum).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* List of bills */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 p-1">
                    {todaySalesList.length === 0 ? (
                      <div className="py-8 text-center text-slate-400">
                        <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30 text-emerald-400" />
                        <p className="text-xs font-semibold">No sales recorded today yet.</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Completed POS sales will show up here</p>
                      </div>
                    ) : (
                      todaySalesList.map((sale, idx) => {
                        const timeStr = sale.timestamp
                          ? format(parseTimestamp(sale.timestamp), 'hh:mm a')
                          : '--:--';
                        return (
                          <div
                            key={sale.id || idx}
                            onClick={() => {
                              setIsTodaySalesOpen(false);
                              setActiveTab('history');
                            }}
                            className="p-2.5 hover:bg-slate-800/60 rounded-xl transition-colors cursor-pointer flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 group-hover:text-emerald-300 group-hover:bg-emerald-500/10 text-[10px] font-bold flex items-center justify-center border border-slate-700/60">
                                #{todaySalesList.length - idx}
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 truncate">
                                  {sale.customerName || 'Walk-in Customer'}
                                </p>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                  <span>{timeStr}</span>
                                  {sale.paymentMethod && (
                                    <>
                                      <span>•</span>
                                      <span className="capitalize text-slate-400">{sale.paymentMethod}</span>
                                    </>
                                  )}
                                  {sale.items?.length > 0 && (
                                    <>
                                      <span>•</span>
                                      <span className="text-slate-400">{sale.items.length} {sale.items.length === 1 ? 'item' : 'items'}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0 pl-2">
                              <p className="text-xs font-black text-slate-100 group-hover:text-emerald-300">
                                Rs. {Number(sale.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer action to go to history */}
                  <div className="p-2 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setIsTodaySalesOpen(false);
                        setActiveTab('history');
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-emerald-600/20 text-slate-300 hover:text-emerald-300 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>View All in Sales History</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Pending Sales Dropdown (Shown ONLY if there are pending sales) */}
            {pendingOrders && pendingOrders.length > 0 && (
              <div className="relative ml-1" ref={pendingSalesDropdownRef}>
                <button
                  onClick={() => setIsPendingSalesOpen(!isPendingSalesOpen)}
                  className="flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 transition-all cursor-pointer shadow-sm group"
                  title="Click to view pending sales"
                >
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <span className="text-slate-400 font-semibold hidden md:inline">Pending:</span>
                    <span className="text-amber-300 font-black tracking-tight">
                      Rs. {Number(pendingSalesSum).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30">
                      {pendingOrders.length} {pendingOrders.length === 1 ? 'Sale' : 'Sales'}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 text-amber-400 ${isPendingSalesOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown displaying pending sales */}
                {isPendingSalesOpen && (
                  <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-[#0c1222] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl animate-in fade-in duration-150">
                    <div className="p-3.5 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white tracking-wide">Pending Sales</h4>
                          <p className="text-[10px] text-amber-400 font-semibold">
                            {pendingOrders.length} saved pending transactions
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-semibold">Pending Total</p>
                        <p className="text-xs font-black text-amber-300">
                          Rs. {Number(pendingSalesSum).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    {/* List of pending sales */}
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 p-1">
                      {pendingOrders.map((order, idx) => {
                        const timeStr = order.createdAt || order.timestamp
                          ? format(parseTimestamp(order.createdAt || order.timestamp), 'hh:mm a')
                          : '--:--';
                        return (
                          <div
                            key={order.id || idx}
                            className="p-2.5 hover:bg-slate-800/60 rounded-xl transition-colors flex items-center justify-between group"
                          >
                            <div
                              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                              onClick={() => {
                                setIsPendingSalesOpen(false);
                                window.dispatchEvent(new CustomEvent('pos-resume-pending-sale', { detail: order }));
                                setActiveTab('pos');
                              }}
                              title="Click to resume this sale in POS"
                            >
                              <span className="w-6 h-6 rounded-lg bg-slate-800 text-amber-400 group-hover:bg-amber-500/20 text-[10px] font-bold flex items-center justify-center border border-slate-700/60 shrink-0">
                                #{idx + 1}
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-200 group-hover:text-amber-300 truncate">
                                  {order.note || 'No Name Provided'}
                                </p>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                  <span>{timeStr}</span>
                                  {order.phone && (
                                    <>
                                      <span>•</span>
                                      <span className="text-slate-400">{order.phone}</span>
                                    </>
                                  )}
                                  {order.items?.length > 0 && (
                                    <>
                                      <span>•</span>
                                      <span className="text-slate-400">{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pl-2 shrink-0">
                              <p className="text-xs font-black text-amber-300">
                                Rs. {Number(order.totalAmount || order.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    await pendingOrderService.deletePendingOrder(order.id);
                                    notify.success("Pending sale deleted");
                                  } catch (err) {
                                    console.error(err);
                                    notify.error("Failed to delete pending sale");
                                  }
                                }}
                                className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                title="Delete pending sale"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Total Arrears Badge in Navbar */}
            <button
              onClick={() => setActiveTab('customers')}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 transition-all cursor-pointer shadow-sm group"
              title="Click to view Customer Arrears"
            >
              <div className="w-2 h-2 rounded-full bg-rose-500"></div>
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <span className="text-slate-400 font-semibold hidden md:inline">Arrears:</span>
                <span className="text-rose-300 font-black tracking-tight">
                  Rs. {Number(totalPendingDues || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </button>
          </div>

          {/* Right: Round Utility Action Buttons */}
          <div className="flex items-center justify-end gap-2 sm:gap-2.5 shrink-0">

            {/* Primary Action Button (+ New Sale) */}
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
              <span>New Sale</span>
            </button>

            {/* Round Notification Bell Button & Dropdown */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                title="Notifications"
                className={`relative w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-sm ${isNotificationsOpen
                  ? 'bg-blue-600 border-blue-500 text-white shadow-blue-500/30'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-sky-400 hover:border-sky-500/40'
                  }`}
              >
                <Bell className="w-4 h-4" />
                {totalNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1 min-w-[17px] h-[17px] rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-md shadow-rose-500/50 animate-pulse">
                    {totalNotificationsCount > 9 ? '9+' : totalNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#09152b]/98 backdrop-blur-2xl border border-sky-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-50 overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-150">

                  {/* Dropdown Header */}
                  <div className="p-3.5 px-4 bg-slate-900/90 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-sky-400" />
                      <span className="font-bold text-xs text-white">Notifications</span>
                      {totalNotificationsCount > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          {totalNotificationsCount} new
                        </span>
                      )}
                    </div>

                    {newInquiries.length > 0 && (
                      <button
                        onClick={onMarkAllInquiriesRead}
                        className="text-[10px] font-bold text-slate-400 hover:text-sky-300 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Mark all messages as read"
                      >
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  {/* Dropdown Body */}
                  <div className="max-h-[360px] overflow-y-auto divide-y divide-white/5">

                    {/* Customer Messages Section */}
                    {newInquiries.length > 0 && (
                      <div>
                        <div className="px-4 py-1.5 bg-blue-950/40 text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center justify-between">
                          <span>New Customer Inquiries</span>
                          <span>{newInquiries.length}</span>
                        </div>
                        {newInquiries.map((inq) => {
                          const timeStr = inq.createdAt
                            ? formatDistanceToNow(new Date(inq.createdAt), { addSuffix: true })
                            : 'Just now';

                          return (
                            <div
                              key={inq.id}
                              onClick={() => {
                                setActiveTab('inquiries');
                                setIsNotificationsOpen(false);
                              }}
                              className="p-3 px-4 hover:bg-slate-800/60 transition-colors cursor-pointer group"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shrink-0" />
                                  <span className="font-bold text-xs text-white group-hover:text-sky-300 transition-colors truncate">
                                    {inq.name}
                                  </span>
                                  {inq.source === 'WhatsApp' ? (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                                      WA
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-500/15 text-sky-400 border border-sky-500/30 shrink-0">
                                      Web
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-500 whitespace-nowrap shrink-0">
                                  {timeStr}
                                </span>
                              </div>

                              <div className="text-[11px] font-semibold text-amber-300 mt-0.5 truncate">
                                {inq.service}
                              </div>

                              {inq.message && (
                                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                  {inq.message}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Pending Sales Section */}
                    {pendingOrders.length > 0 && (
                      <div>
                        <div className="px-4 py-1.5 bg-amber-950/40 text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between">
                          <span>Pending Sales</span>
                          <span>{pendingOrders.length}</span>
                        </div>
                        {pendingOrders.slice(0, 5).map((order, idx) => (
                          <div
                            key={order.id || idx}
                            onClick={() => {
                              setShowPendingOrdersModal(true);
                              setIsNotificationsOpen(false);
                            }}
                            className="p-3 px-4 hover:bg-slate-800/60 transition-colors cursor-pointer group flex items-center justify-between"
                          >
                            <div>
                              <div className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors">
                                {order.customerName || 'Customer Sale'}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {(order.items || order.cartItems || []).length} items pending
                              </div>
                            </div>
                            <span className="font-mono font-bold text-xs text-amber-400">
                              Rs {Number(order.totalAmount || order.total_amount || 0).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Empty State */}
                    {totalNotificationsCount === 0 && (
                      <div className="py-8 px-4 text-center">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-300">All caught up!</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          No unread customer messages or pending sales.
                        </p>
                      </div>
                    )}

                  </div>

                  {/* Dropdown Footer */}
                  <div className="p-2.5 bg-slate-900/90 border-t border-white/5 text-center">
                    <button
                      onClick={() => {
                        setActiveTab('inquiries');
                        setIsNotificationsOpen(false);
                      }}
                      className="text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>Open Customer Messages Center</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              )}
            </div>

            {/* Quick Calculator Dropdown (Round button) */}
            <div className="relative" ref={calculatorRef}>
              <button
                onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
                title="Quick Calculator"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer border ${isCalculatorOpen
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

        {/* Content Body */}
        <main className={`flex-1 p-2 sm:p-2.5 flex flex-col min-h-0 ${(activeTab === 'pos' || activeTab === 'repairs' || activeTab === 'history' || activeTab === 'dashboard') ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {children}
        </main>

      </div>

    </div>
  );
}
