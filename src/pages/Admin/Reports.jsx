import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Calendar, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  RotateCcw, 
  ArrowUpDown, 
  Download, 
  Printer, 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  Phone, 
  MapPin, 
  Star, 
  X, 
  Eye, 
  Award, 
  MessageCircle, 
  Receipt,
  Crown,
  Sparkles,
  Filter
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  addMonths, 
  startOfDay, 
  endOfDay, 
  formatDistanceToNow 
} from 'date-fns';
import { parseTimestamp } from '../../utils/helpers';
import { notify } from '../../utils/toast';

export default function Reports({ salesHistory = [], customersList = [], isAdmin = false }) {
  // Month Navigation & Period Filter States
  const [monthFilterType, setMonthFilterType] = useState('this-month'); // 'this-month', 'last-month', 'all-time', 'today', 'this-week', 'this-year', 'custom-month'
  const [currentSelectedMonth, setCurrentSelectedMonth] = useState(new Date());
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Sidebar Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('spend-desc'); // 'spend-desc', 'spend-asc', 'orders-desc', 'orders-asc', 'date-desc', 'name-asc'
  const [tierFilter, setTierFilter] = useState('ALL'); // 'ALL', 'VIP', 'REGULAR', 'NEW'
  const [areaFilter, setAreaFilter] = useState('ALL');
  const [minSpend, setMinSpend] = useState('');
  const [maxSpend, setMaxSpend] = useState('');

  // Customer Details Modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Month Navigation Handlers
  const handlePrevMonth = () => {
    const prev = subMonths(currentSelectedMonth, 1);
    setCurrentSelectedMonth(prev);
    setMonthFilterType('custom-month');
  };

  const handleNextMonth = () => {
    const next = addMonths(currentSelectedMonth, 1);
    setCurrentSelectedMonth(next);
    setMonthFilterType('custom-month');
  };

  const handleMonthTypeChange = (type) => {
    setMonthFilterType(type);
    if (type === 'this-month') {
      setCurrentSelectedMonth(new Date());
    } else if (type === 'last-month') {
      setCurrentSelectedMonth(subMonths(new Date(), 1));
    }
  };

  // Compute Active Date Range based on Period Filter
  const { startDate, endDate, periodLabel } = useMemo(() => {
    const now = new Date();
    let start = null;
    let end = null;
    let label = 'This Month';

    if (monthFilterType === 'today') {
      start = startOfDay(now);
      end = endOfDay(now);
      label = `Today (${format(now, 'MMM dd, yyyy')})`;
    } else if (monthFilterType === 'this-week') {
      const day = now.getDay();
      const diffToMonday = day === 0 ? 6 : day - 1;
      start = new Date(now);
      start.setDate(now.getDate() - diffToMonday);
      start.setHours(0, 0, 0, 0);
      end = endOfDay(now);
      label = `This Week (${format(start, 'MMM dd')} - ${format(end, 'MMM dd')})`;
    } else if (monthFilterType === 'this-month') {
      start = startOfMonth(now);
      end = endOfMonth(now);
      label = `This Month (${format(now, 'MMMM yyyy')})`;
    } else if (monthFilterType === 'last-month') {
      const lm = subMonths(now, 1);
      start = startOfMonth(lm);
      end = endOfMonth(lm);
      label = `Last Month (${format(lm, 'MMMM yyyy')})`;
    } else if (monthFilterType === 'this-year') {
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      label = `This Year (${now.getFullYear()})`;
    } else if (monthFilterType === 'custom-month') {
      start = startOfMonth(currentSelectedMonth);
      end = endOfMonth(currentSelectedMonth);
      label = format(currentSelectedMonth, 'MMMM yyyy');
    } else if (monthFilterType === 'all-time') {
      start = new Date(2020, 0, 1);
      end = new Date(now.getFullYear() + 2, 11, 31);
      label = 'All Time';
    }

    return { startDate: start, endDate: end, periodLabel: label };
  }, [monthFilterType, currentSelectedMonth]);

  // Extract unique areas from customersList for filter dropdown
  const uniqueAreas = useMemo(() => {
    const areas = new Set();
    (customersList || []).forEach(c => {
      if (c.area && c.area.trim()) {
        areas.add(c.area.trim());
      }
    });
    return Array.from(areas).sort();
  }, [customersList]);

  // Aggregate customer metrics from salesHistory
  const aggregatedCustomers = useMemo(() => {
    const customerMap = {};

    // 1. Populate metadata from customersList
    (customersList || []).forEach(cust => {
      if (cust.name) {
        const key = cust.name.trim();
        customerMap[key] = {
          name: key,
          phone: cust.phone || '',
          area: cust.area || '',
          mostVisited: !!cust.mostVisited,
          ordersCount: 0,
          spendValue: 0,
          lastCameDate: null,
          allTimeOrdersCount: 0,
          allTimeLastDate: null,
          sales: []
        };
      }
    });

    // 2. Iterate through salesHistory
    (salesHistory || []).forEach(sale => {
      const rawName = (sale.customerName || sale.customer || 'Walk-in Customer').trim();
      const saleDate = parseTimestamp(sale.timestamp);

      if (!customerMap[rawName]) {
        const matched = (customersList || []).find(
          c => c.name && c.name.toLowerCase() === rawName.toLowerCase()
        );

        customerMap[rawName] = {
          name: rawName,
          phone: matched?.phone || sale.phoneNumber || '',
          area: matched?.area || '',
          mostVisited: !!matched?.mostVisited,
          ordersCount: 0,
          spendValue: 0,
          lastCameDate: null,
          allTimeOrdersCount: 0,
          allTimeLastDate: saleDate,
          sales: []
        };
      }

      if (!customerMap[rawName].allTimeLastDate || saleDate > customerMap[rawName].allTimeLastDate) {
        customerMap[rawName].allTimeLastDate = saleDate;
      }
      customerMap[rawName].allTimeOrdersCount += 1;

      // Period interval check
      if (startDate && endDate && saleDate >= startDate && saleDate <= endDate) {
        customerMap[rawName].ordersCount += 1;
        customerMap[rawName].spendValue += Number(sale.amount || 0);
        customerMap[rawName].sales.push(sale);

        if (!customerMap[rawName].lastCameDate || saleDate > customerMap[rawName].lastCameDate) {
          customerMap[rawName].lastCameDate = saleDate;
        }
      }
    });

    // Sort order sales by date descending inside each customer
    Object.values(customerMap).forEach(c => {
      c.sales.sort((a, b) => {
        const dA = parseTimestamp(a.timestamp);
        const dB = parseTimestamp(b.timestamp);
        return dB - dA;
      });
    });

    return Object.values(customerMap);
  }, [salesHistory, customersList, startDate, endDate]);

  // Filter & Sort Customer Report Data
  const filteredCustomers = useMemo(() => {
    let list = aggregatedCustomers.filter(c => {
      // Must have orders in period unless searching for specific customer
      if (!searchQuery.trim() && c.ordersCount === 0) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (c.name || '').toLowerCase().includes(q);
        const matchesPhone = (c.phone || '').includes(q);
        const matchesArea = (c.area || '').toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesArea) return false;
      }

      // Customer Tier
      if (tierFilter === 'VIP' && c.spendValue < 5000) return false;
      if (tierFilter === 'REGULAR' && c.ordersCount < 3) return false;
      if (tierFilter === 'NEW' && c.ordersCount > 2) return false;

      // Area Filter
      if (areaFilter !== 'ALL' && c.area !== areaFilter) return false;

      // Min/Max Spend
      if (minSpend !== '' && c.spendValue < Number(minSpend)) return false;
      if (maxSpend !== '' && c.spendValue > Number(maxSpend)) return false;

      return true;
    });

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'spend-desc') return b.spendValue - a.spendValue;
      if (sortBy === 'spend-asc') return a.spendValue - b.spendValue;
      if (sortBy === 'orders-desc') return b.ordersCount - a.ordersCount;
      if (sortBy === 'orders-asc') return a.ordersCount - b.ordersCount;
      if (sortBy === 'date-desc') {
        const dateA = a.lastCameDate ? a.lastCameDate.getTime() : 0;
        const dateB = b.lastCameDate ? b.lastCameDate.getTime() : 0;
        return dateB - dateA;
      }
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      return 0;
    });

    return list;
  }, [aggregatedCustomers, searchQuery, sortBy, tierFilter, areaFilter, minSpend, maxSpend]);

  // Overall Period Summary KPIs
  const periodSummary = useMemo(() => {
    const totalCustomers = filteredCustomers.length;
    const totalOrders = filteredCustomers.reduce((sum, c) => sum + c.ordersCount, 0);
    const totalSpend = filteredCustomers.reduce((sum, c) => sum + c.spendValue, 0);
    const avgSpend = totalCustomers > 0 ? (totalSpend / totalCustomers) : 0;
    const topSpender = filteredCustomers.length > 0 ? filteredCustomers[0] : null;

    return { totalCustomers, totalOrders, totalSpend, avgSpend, topSpender };
  }, [filteredCustomers]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSortBy('spend-desc');
    setTierFilter('ALL');
    setAreaFilter('ALL');
    setMinSpend('');
    setMaxSpend('');
    setMonthFilterType('this-month');
    setCurrentSelectedMonth(new Date());
    notify.info('Filters reset to default');
  };

  // Export to CSV
  const exportToCSV = () => {
    if (filteredCustomers.length === 0) {
      notify.error('No customer records to export');
      return;
    }

    const headers = ['Rank', 'Customer Name', 'Phone', 'Area', 'Period Orders', 'Total Spend (Rs)', 'Avg Order Value (Rs)', 'Last Came Date'];
    const rows = filteredCustomers.map((c, idx) => [
      idx + 1,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${c.phone || ''}"`,
      `"${c.area || ''}"`,
      c.ordersCount,
      c.spendValue.toFixed(2),
      c.ordersCount > 0 ? (c.spendValue / c.ordersCount).toFixed(2) : '0.00',
      c.lastCameDate ? format(c.lastCameDate, 'yyyy-MM-dd HH:mm') : (c.allTimeLastDate ? format(c.allTimeLastDate, 'yyyy-MM-dd') : 'N/A')
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Customer_Report_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify.success('Customer report downloaded as CSV');
  };

  // Print view
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full h-full flex flex-col space-y-2 overflow-hidden text-slate-100">
      
      {/* Main Split Layout: Left Filter Drawer + Right Content */}
      <div className="flex-1 flex flex-col md:flex-row gap-3 min-h-0 overflow-hidden">
        
        {/* Left: Advanced Filters Drawer */}
        <div className="w-full md:w-64 shrink-0 bg-[#071326]/90 backdrop-blur-md border border-slate-800/80 rounded-2xl p-3.5 flex flex-col gap-3 shadow-xl overflow-y-auto custom-scrollbar">
          
          {/* Header: Title & Reset */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-200">Customer Filter</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Name, Phone, Area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-800 focus:border-teal-500/80 rounded-xl pl-8.5 pr-7 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Sort By */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sort By</label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none bg-[#090d16] border border-slate-800 focus:border-teal-500/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-medium focus:outline-none cursor-pointer pr-8 shadow-inner"
              >
                <option value="spend-desc">Highest Spender (Rs ↓)</option>
                <option value="spend-asc">Lowest Spender (Rs ↑)</option>
                <option value="orders-desc">Most Orders (Count ↓)</option>
                <option value="orders-asc">Least Orders (Count ↑)</option>
                <option value="date-desc">Recent Visit (Newest)</option>
                <option value="name-asc">Customer Name (A-Z)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Customer Tier / Frequency */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer Tier</label>
            <div className="relative">
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="w-full appearance-none bg-[#090d16] border border-slate-800 focus:border-teal-500/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-medium focus:outline-none cursor-pointer pr-8 shadow-inner"
              >
                <option value="ALL">All Customers</option>
                <option value="VIP">💎 VIP (Spend &gt; Rs. 5,000)</option>
                <option value="REGULAR">⭐ Regular (3+ Orders)</option>
                <option value="NEW">🌱 New / Casual (1-2 Orders)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Area / Location */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Area / Location</label>
            <div className="relative">
              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="w-full appearance-none bg-[#090d16] border border-slate-800 focus:border-teal-500/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-medium focus:outline-none cursor-pointer pr-8 shadow-inner"
              >
                <option value="ALL">All Areas</option>
                {uniqueAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Spend Range */}
          <div className="space-y-1 pt-1 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Spend Range</label>
              <span className="text-[10px] font-mono text-slate-500">LKR</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min Rs"
                value={minSpend}
                onChange={(e) => setMinSpend(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-800 focus:border-teal-500/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none font-mono shadow-inner"
              />
              <input
                type="number"
                placeholder="Max Rs"
                value={maxSpend}
                onChange={(e) => setMaxSpend(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-800 focus:border-teal-500/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none font-mono shadow-inner"
              />
            </div>
          </div>

          {/* Filter Status Badge */}
          <div className="mt-auto pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 uppercase font-black tracking-wider text-[10px]">Filtered Clients</span>
            <span className="font-mono font-black text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 rounded-full">
              {filteredCustomers.length}
            </span>
          </div>

        </div>

        {/* Right: Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden space-y-2">
          
          {/* Top Header Control Strip: Month Selection + Summary Pills + Export */}
          <div className="relative z-20 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-2 sm:p-2.5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
            
            {/* Left: Month Navigator `< This month ▾ >` */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center bg-[#090d16] border border-slate-800/90 rounded-xl p-0.5 shadow-inner">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                
                <div className="relative px-1">
                  <select
                    value={monthFilterType === 'custom-month' ? 'custom-month' : monthFilterType}
                    onChange={(e) => handleMonthTypeChange(e.target.value)}
                    className="appearance-none bg-transparent text-xs font-bold text-slate-200 pl-2 pr-6 py-1 cursor-pointer focus:outline-none"
                  >
                    <option value="this-month" className="bg-slate-900 text-slate-200 font-bold">
                      This month ({format(new Date(), 'MMM yyyy')})
                    </option>
                    <option value="last-month" className="bg-slate-900 text-slate-200 font-bold">
                      Last month ({format(subMonths(new Date(), 1), 'MMM yyyy')})
                    </option>
                    {monthFilterType === 'custom-month' && (
                      <option value="custom-month" className="bg-slate-900 text-teal-400 font-bold">
                        {format(currentSelectedMonth, 'MMMM yyyy')}
                      </option>
                    )}
                    <option value="today" className="bg-slate-900 text-slate-200 font-bold">
                      Today
                    </option>
                    <option value="this-week" className="bg-slate-900 text-slate-200 font-bold">
                      This Week
                    </option>
                    <option value="this-year" className="bg-slate-900 text-slate-200 font-bold">
                      This Year ({new Date().getFullYear()})
                    </option>
                    <option value="all-time" className="bg-slate-900 text-slate-200 font-bold">
                      All Time
                    </option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <button
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Top Spender Pill */}
              {periodSummary.topSpender && (
                <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-300 text-xs font-bold">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span className="truncate max-w-[130px]">Top: {periodSummary.topSpender.name}</span>
                </div>
              )}
            </div>

            {/* Right: Summary KPIs & Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
              
              {/* Total Orders Metric */}
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#090d16] border border-slate-800/90 rounded-xl shadow-inner text-xs">
                <span className="text-[10px] text-slate-400 font-black uppercase">Orders:</span>
                <span className="font-mono font-black text-cyan-400">{periodSummary.totalOrders}</span>
              </div>

              {/* Total Revenue Metric */}
              <div className="flex items-center gap-1.5 px-3 py-1 bg-teal-500/10 border border-teal-500/30 rounded-xl shadow-inner text-xs">
                <span className="text-[10px] text-teal-400 font-black uppercase">Total:</span>
                <span className="font-mono font-black text-teal-300">
                  Rs. {periodSummary.totalSpend.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>
              </div>

              {/* Avg Spend Metric */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-[#090d16] border border-slate-800/90 rounded-xl shadow-inner text-xs">
                <span className="text-[10px] text-slate-400 font-black uppercase">Avg:</span>
                <span className="font-mono font-black text-purple-400">
                  Rs. {periodSummary.avgSpend.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>
              </div>

              {/* Export CSV Button */}
              <button
                onClick={exportToCSV}
                className="p-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700/80 transition-all cursor-pointer shadow-sm"
                title="Export as CSV"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              {/* Print Button */}
              <button
                onClick={handlePrint}
                className="p-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700/80 transition-all cursor-pointer shadow-sm"
                title="Print Report"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-0">
            <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-[#071326] border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3.5 text-center w-12"># Rank</th>
                    <th className="py-2.5 px-3.5">Customer Profile</th>
                    <th className="py-2.5 px-3.5 text-center w-28">Period Orders</th>
                    <th className="py-2.5 px-3.5 text-right w-36">Total Spend (LKR)</th>
                    <th className="py-2.5 px-3.5 text-right w-32 hidden md:table-cell">Avg Order Value</th>
                    <th className="py-2.5 px-3.5 text-left w-36 hidden sm:table-cell">Last Visit</th>
                    <th className="py-2.5 px-3.5 text-center w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center gap-2.5 text-slate-500">
                          <Users className="w-10 h-10 stroke-[1.5] text-slate-600" />
                          <p className="text-sm font-bold text-slate-400">No customer records found</p>
                          <p className="text-xs text-slate-500">Try adjusting your date range, search query or filters.</p>
                          <button
                            onClick={handleResetFilters}
                            className="mt-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-400 rounded-xl text-xs font-bold border border-slate-700 transition-all cursor-pointer"
                          >
                            Reset Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((cust, idx) => {
                      const rank = idx + 1;
                      const avgOrder = cust.ordersCount > 0 ? cust.spendValue / cust.ordersCount : 0;
                      const isTop3 = rank <= 3;
                      
                      return (
                        <tr
                          key={cust.name}
                          className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                          onClick={() => setSelectedCustomer(cust)}
                        >
                          {/* Rank Column */}
                          <td className="py-2.5 px-3.5 text-center whitespace-nowrap align-middle">
                            {rank === 1 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-black text-xs shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                                🥇
                              </span>
                            ) : rank === 2 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300/20 text-slate-300 border border-slate-300/40 font-black text-xs">
                                🥈
                              </span>
                            ) : rank === 3 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/20 text-amber-500 border border-amber-700/40 font-black text-xs">
                                🥉
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-800/80 text-slate-400 font-mono font-bold text-[11px] border border-slate-700/50">
                                {rank}
                              </span>
                            )}
                          </td>

                          {/* Customer Profile Column */}
                          <td className="py-2.5 px-3.5 align-middle">
                            <div className="flex items-center gap-2.5">
                              {/* Avatar Initials */}
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 border ${
                                isTop3
                                  ? 'bg-gradient-to-tr from-teal-500/30 to-emerald-500/30 text-teal-300 border-teal-500/40'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}>
                                {cust.name.substring(0, 2).toUpperCase()}
                              </div>

                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-slate-100 text-xs truncate max-w-[180px]">
                                    {cust.name}
                                  </span>
                                  {cust.spendValue >= 5000 && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                      VIP
                                    </span>
                                  )}
                                  {cust.mostVisited && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-teal-500/15 text-teal-400 border border-teal-500/30">
                                      Frequent
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                  {cust.phone && (
                                    <span className="font-mono text-slate-400">{cust.phone}</span>
                                  )}
                                  {cust.area && (
                                    <span className="px-1 rounded bg-slate-800/80 text-slate-400 border border-slate-700/60 truncate max-w-[100px]">
                                      📍 {cust.area}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Period Orders Column */}
                          <td className="py-2.5 px-3.5 text-center whitespace-nowrap align-middle">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono font-bold text-xs">
                              <ShoppingBag className="w-3 h-3 text-sky-400" />
                              {cust.ordersCount}
                            </span>
                          </td>

                          {/* Total Spend Column */}
                          <td className="py-2.5 px-3.5 text-right whitespace-nowrap align-middle font-mono font-black text-emerald-400 text-xs">
                            Rs. {cust.spendValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>

                          {/* Avg Order Value Column */}
                          <td className="py-2.5 px-3.5 text-right whitespace-nowrap align-middle font-mono font-medium text-slate-300 text-xs hidden md:table-cell">
                            Rs. {avgOrder.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>

                          {/* Last Visit Column */}
                          <td className="py-2.5 px-3.5 text-left whitespace-nowrap align-middle hidden sm:table-cell">
                            {cust.lastCameDate ? (
                              <div className="flex flex-col">
                                <span className="text-[11px] font-semibold text-slate-300">
                                  {format(cust.lastCameDate, 'MMM dd, yyyy')}
                                </span>
                                <span className="text-[9px] text-slate-500">
                                  {formatDistanceToNow(cust.lastCameDate, { addSuffix: true })}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-500 text-[11px]">N/A</span>
                            )}
                          </td>

                          {/* Actions Column */}
                          <td 
                            className="py-2.5 px-3.5 text-center whitespace-nowrap align-middle"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-center gap-1.5">
                              {/* View Details Modal */}
                              <button
                                onClick={() => setSelectedCustomer(cust)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-teal-500/20 text-slate-400 hover:text-teal-300 border border-slate-700 transition-all cursor-pointer"
                                title="Inspect Order History"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* WhatsApp Direct Chat */}
                              {cust.phone ? (
                                <a
                                  href={`https://wa.me/${cust.phone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-300 border border-slate-700 transition-all cursor-pointer"
                                  title="WhatsApp Customer"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer: Summary Status */}
            <div className="px-4 py-2 bg-[#071326] border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                <span>Active Period: <strong className="text-teal-300">{periodLabel}</strong></span>
              </div>
              <div className="font-mono text-slate-400">
                Showing {filteredCustomers.length} active customer profiles
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* CUSTOMER ORDER HISTORY MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#071326] border border-teal-500/30 rounded-3xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-[0_0_50px_rgba(20,184,166,0.15)] overflow-hidden slide-in-from-bottom-6">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-teal-500/20 bg-gradient-to-r from-[#0a1e38] via-[#09182d] to-[#071326] flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 font-black text-sm">
                  {selectedCustomer.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
                      {selectedCustomer.name}
                    </h3>
                    {selectedCustomer.spendValue >= 5000 && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        VIP
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {selectedCustomer.phone || 'No phone recorded'} {selectedCustomer.area && `• 📍 ${selectedCustomer.area}`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Summary Stats */}
            <div className="p-4 grid grid-cols-3 gap-3 bg-[#090d16] border-b border-slate-800/80 shrink-0">
              <div className="bg-[#071326] p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Period Orders</span>
                <span className="text-lg font-black text-cyan-400 font-mono">{selectedCustomer.ordersCount}</span>
              </div>
              <div className="bg-[#071326] p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Period Spend</span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  Rs. {selectedCustomer.spendValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="bg-[#071326] p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Last Visit</span>
                <span className="text-xs font-bold text-teal-300 block mt-1 font-mono">
                  {selectedCustomer.lastCameDate ? format(selectedCustomer.lastCameDate, 'MMM dd, yyyy') : 'N/A'}
                </span>
              </div>
            </div>

            {/* Orders List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-teal-400" />
                  <span>Purchases in {periodLabel} ({selectedCustomer.sales.length})</span>
                </h4>
              </div>

              {selectedCustomer.sales.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No sales recorded in this specific time window.
                </div>
              ) : (
                selectedCustomer.sales.map((sale, i) => {
                  const sDate = parseTimestamp(sale.timestamp);
                  return (
                    <div
                      key={sale.id || i}
                      className="bg-[#090d16] border border-slate-800/80 rounded-2xl p-3.5 flex flex-col gap-2 hover:border-slate-700 transition-all shadow-sm"
                    >
                      <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
                        <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {format(sDate, 'yyyy-MM-dd • hh:mm a')}
                        </span>
                        <span className="text-sm font-black text-emerald-400 font-mono">
                          Rs. {Number(sale.amount || 0).toFixed(2)}
                        </span>
                      </div>

                      {/* Items Preview */}
                      {sale.cartItems && Array.isArray(sale.cartItems) && sale.cartItems.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {sale.cartItems.map((item, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-lg flex items-center gap-1 font-medium"
                            >
                              <span>{item.name}</span>
                              <strong className="text-cyan-400 font-mono">x{item.qty || 1}</strong>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic pt-1">
                          {sale.description || (sale.isRepair ? 'PC Repair Service' : 'POS Transaction')}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800/80 bg-[#090d16] flex justify-between items-center shrink-0">
              {selectedCustomer.phone ? (
                <a
                  href={`https://wa.me/${selectedCustomer.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 text-xs font-bold border border-emerald-500/30 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Customer</span>
                </a>
              ) : <div></div>}

              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
