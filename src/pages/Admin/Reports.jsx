import React, { useState, useMemo } from 'react';
import { 
  Users, Calendar, Search, ArrowUpDown, Download, Printer, 
  ChevronRight, TrendingUp, ShoppingBag, DollarSign, Clock, 
  Phone, MapPin, Star, X, Eye, FileText, CheckCircle2, 
  BarChart3, Award, ExternalLink
} from 'lucide-react';
import { format, formatDistanceToNow, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { parseTimestamp } from '../../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';

export default function Reports({ salesHistory = [], customersList = [], isAdmin = false }) {
  // Main Sub-Tab State (Customer Report is default)
  const [activeSubTab, setActiveSubTab] = useState('customerReport');

  // Filter States - Default: 'thisMonth'
  const [timeFilter, setTimeFilter] = useState('thisMonth');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('spend'); // 'spend' | 'orders' | 'date' | 'name'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Calculate Date Range based on timeFilter
  const { startDate, endDate, periodLabel } = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let start = new Date(currentYear, currentMonth, 1, 0, 0, 0, 0);
    let end = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
    let label = format(now, 'MMMM yyyy');

    if (timeFilter === 'today') {
      start = startOfDay(now);
      end = endOfDay(now);
      label = format(now, 'MMM dd, yyyy');
    } else if (timeFilter === 'week') {
      const day = now.getDay();
      const diffToMonday = day === 0 ? 6 : day - 1;
      start = new Date(now);
      start.setDate(now.getDate() - diffToMonday);
      start.setHours(0, 0, 0, 0);
      end = endOfDay(now);
      label = `This Week (${format(start, 'MMM dd')} - ${format(end, 'MMM dd')})`;
    } else if (timeFilter === 'thisMonth') {
      start = new Date(currentYear, currentMonth, 1, 0, 0, 0, 0);
      end = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
      label = `This Month (${format(now, 'MMMM yyyy')})`;
    } else if (timeFilter === 'lastMonth') {
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      start = new Date(prevYear, prevMonth, 1, 0, 0, 0, 0);
      end = new Date(prevYear, prevMonth + 1, 0, 23, 59, 59, 999);
      label = `Last Month (${format(start, 'MMMM yyyy')})`;
    } else if (timeFilter === 'thisYear') {
      start = new Date(currentYear, 0, 1, 0, 0, 0, 0);
      end = new Date(currentYear, 11, 31, 23, 59, 59, 999);
      label = `This Year (${currentYear})`;
    } else if (timeFilter === 'all') {
      start = new Date(2020, 0, 1);
      end = new Date(now.getFullYear() + 1, 11, 31);
      label = 'All Time';
    } else if (timeFilter === 'custom') {
      if (customStartDate) {
        start = startOfDay(new Date(customStartDate));
      }
      if (customEndDate) {
        end = endOfDay(new Date(customEndDate));
      }
      label = customStartDate && customEndDate 
        ? `${customStartDate} to ${customEndDate}` 
        : 'Custom Range';
    }

    return { startDate: start, endDate: end, periodLabel: label };
  }, [timeFilter, customStartDate, customEndDate]);

  // Aggregate customer metrics from salesHistory
  const customerReportsData = useMemo(() => {
    const customerMap = {};

    // 1. First populate customer metadata from customersList
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
    salesHistory.forEach(sale => {
      const rawName = (sale.customerName || sale.customer || 'Walk-in Customer').trim();
      const saleDate = parseTimestamp(sale.timestamp);

      if (!customerMap[rawName]) {
        // Find in customersList with case-insensitive check
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

      // Track all-time last order date
      if (!customerMap[rawName].allTimeLastDate || saleDate > customerMap[rawName].allTimeLastDate) {
        customerMap[rawName].allTimeLastDate = saleDate;
      }
      customerMap[rawName].allTimeOrdersCount += 1;

      // Check if this sale is within the selected filter period
      if (saleDate >= startDate && saleDate <= endDate) {
        customerMap[rawName].ordersCount += 1;
        customerMap[rawName].spendValue += Number(sale.amount || 0);
        customerMap[rawName].sales.push(sale);

        if (!customerMap[rawName].lastCameDate || saleDate > customerMap[rawName].lastCameDate) {
          customerMap[rawName].lastCameDate = saleDate;
        }
      }
    });

    // Convert to array and filter out customers who had 0 orders in the selected period
    // (unless they specifically search for that customer)
    let list = Object.values(customerMap).filter(c => c.ordersCount > 0);

    // Apply Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = Object.values(customerMap).filter(c => 
        c.name.toLowerCase().includes(q) || 
        (c.phone && c.phone.includes(q)) ||
        (c.area && c.area.toLowerCase().includes(q))
      );
    }

    // Sort list
    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'spend') {
        comparison = b.spendValue - a.spendValue;
      } else if (sortBy === 'orders') {
        comparison = b.ordersCount - a.ordersCount;
      } else if (sortBy === 'date') {
        const dateA = a.lastCameDate ? a.lastCameDate.getTime() : 0;
        const dateB = b.lastCameDate ? b.lastCameDate.getTime() : 0;
        comparison = dateB - dateA;
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      }
      return sortOrder === 'asc' ? -comparison : comparison;
    });

    return list;
  }, [salesHistory, customersList, startDate, endDate, searchQuery, sortBy, sortOrder]);

  // Overall Period Summary KPIs
  const periodSummary = useMemo(() => {
    const totalCustomers = customerReportsData.length;
    const totalOrders = customerReportsData.reduce((sum, c) => sum + c.ordersCount, 0);
    const totalSpend = customerReportsData.reduce((sum, c) => sum + c.spendValue, 0);
    const avgSpend = totalCustomers > 0 ? (totalSpend / totalCustomers) : 0;
    const topSpender = customerReportsData.length > 0 ? customerReportsData[0] : null;

    return { totalCustomers, totalOrders, totalSpend, avgSpend, topSpender };
  }, [customerReportsData]);

  // Toggle Sorting
  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (customerReportsData.length === 0) return;

    const headers = ['Rank', 'Customer Name', 'Phone', 'Area', 'Orders Count', 'Spend Value (Rs)', 'Average Order Value (Rs)', 'Last Came Date'];
    const rows = customerReportsData.map((c, idx) => [
      idx + 1,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${c.area}"`,
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
    link.setAttribute('download', `Customer_Report_${timeFilter}_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print view
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1700px] mx-auto min-h-screen text-slate-100">
      
      {/* PAGE HEADER & MAIN SUB-TABS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-teal-500/10 border border-teal-500/20 rounded-2xl text-teal-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <span>Business Reports</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">
            Customer behavior, order frequency, and revenue analytics
          </p>
        </div>

        {/* Sub-Tabs Bar */}
        <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
          <button
            onClick={() => setActiveSubTab('customerReport')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
              activeSubTab === 'customerReport'
                ? 'bg-teal-500 text-slate-950 shadow-[0_0_20px_rgba(20,184,166,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Customer Report</span>
          </button>
        </div>
      </div>

      {/* CUSTOMER REPORT CONTENT */}
      {activeSubTab === 'customerReport' && (
        <div className="space-y-6">

          {/* TOP FILTERS BAR */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 p-4 sm:p-5 rounded-2xl shadow-xl space-y-4">
            
            {/* Row 1: Time Filter Pills & Action Buttons */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              
              {/* Date Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/70 p-1.5 rounded-xl border border-white/5">
                {[
                  { id: 'today', label: 'Today' },
                  { id: 'week', label: 'This Week' },
                  { id: 'thisMonth', label: 'This Month' },
                  { id: 'lastMonth', label: 'Last Month' },
                  { id: 'thisYear', label: 'This Year' },
                  { id: 'all', label: 'All Time' },
                  { id: 'custom', label: 'Custom' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setTimeFilter(tab.id)}
                    className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                      timeFilter === tab.id
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Action Buttons: Export & Print */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={exportToCSV}
                  disabled={customerReportsData.length === 0}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  title="Export to CSV Spreadsheet"
                >
                  <Download className="w-4 h-4 text-teal-400" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={handlePrint}
                  disabled={customerReportsData.length === 0}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  title="Print Report"
                >
                  <Printer className="w-4 h-4 text-cyan-400" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Custom Date Range Picker (shown when custom filter is active) */}
            {timeFilter === 'custom' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">From:</span>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">To:</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-teal-500"
                  />
                </div>
              </motion.div>
            )}

            {/* Row 2: Search Input & Current Filter Indicator */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/5">
              
              {/* Search Box */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 text-slate-200 text-sm pl-10 pr-9 py-2 rounded-xl focus:outline-none focus:border-teal-500/60 transition-colors shadow-inner"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Active Period Badge */}
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium self-end sm:self-auto">
                <Calendar className="w-4 h-4 text-teal-400" />
                <span>Showing report for: <strong className="text-teal-300 font-bold">{periodLabel}</strong></span>
              </div>
            </div>

          </div>

          {/* KPI SUMMARY CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            
            {/* Card 1: Active Customers */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-4 rounded-2xl relative overflow-hidden shadow-lg group hover:border-teal-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Customers</span>
                <Users className="w-4 h-4 text-teal-400" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">{periodSummary.totalCustomers}</h3>
              <p className="text-[11px] text-slate-500 mt-1">made orders in this period</p>
            </div>

            {/* Card 2: Orders Count */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-4 rounded-2xl relative overflow-hidden shadow-lg group hover:border-cyan-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
                <ShoppingBag className="w-4 h-4 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-black text-cyan-300 tracking-tight">{periodSummary.totalOrders}</h3>
              <p className="text-[11px] text-slate-500 mt-1">transactions recorded</p>
            </div>

            {/* Card 3: Total Spend Value */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-4 rounded-2xl relative overflow-hidden shadow-lg group hover:border-emerald-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Spend Value</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-black text-emerald-400 tracking-tight">
                <span className="text-sm font-bold text-slate-400">Rs.</span> {periodSummary.totalSpend.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">revenue from customers</p>
            </div>

            {/* Card 4: Average Spend */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-4 rounded-2xl relative overflow-hidden shadow-lg group hover:border-purple-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Spend / Customer</span>
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="text-2xl font-black text-purple-300 tracking-tight">
                <span className="text-sm font-bold text-slate-400">Rs.</span> {periodSummary.avgSpend.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">average spend per client</p>
            </div>

          </div>

          {/* CUSTOMER REPORT TABLE */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl overflow-hidden">
            
            {/* Table Header Info */}
            <div className="px-5 py-4 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Customer Performance Breakdown ({customerReportsData.length})
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Click any customer to inspect order history
              </span>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-950/40 select-none">
                    <th className="py-3.5 px-4 text-center w-12">#</th>
                    
                    {/* Customer Name Column Header */}
                    <th 
                      onClick={() => handleSortChange('name')}
                      className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Customer Name</span>
                        {sortBy === 'name' && (
                          <ArrowUpDown className={`w-3.5 h-3.5 text-teal-400 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>

                    {/* Orders Count Column Header */}
                    <th 
                      onClick={() => handleSortChange('orders')}
                      className="py-3.5 px-4 text-center cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>Orders Count</span>
                        {sortBy === 'orders' && (
                          <ArrowUpDown className={`w-3.5 h-3.5 text-teal-400 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>

                    {/* Spend Value Column Header */}
                    <th 
                      onClick={() => handleSortChange('spend')}
                      className="py-3.5 px-4 text-right cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Spend Value</span>
                        {sortBy === 'spend' && (
                          <ArrowUpDown className={`w-3.5 h-3.5 text-teal-400 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>

                    {/* Average Order Value Header */}
                    <th className="py-3.5 px-4 text-right hidden md:table-cell">
                      <span>Avg / Order</span>
                    </th>

                    {/* Last Came Date Column Header */}
                    <th 
                      onClick={() => handleSortChange('date')}
                      className="py-3.5 px-4 text-right cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Last Came Date</span>
                        {sortBy === 'date' && (
                          <ArrowUpDown className={`w-3.5 h-3.5 text-teal-400 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>

                    <th className="py-3.5 px-4 text-center w-16">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm font-medium">
                  {customerReportsData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-slate-500">
                        <Users className="w-10 h-10 mx-auto text-slate-600 mb-3" />
                        <p className="text-base font-bold text-slate-400">No customer records found</p>
                        <p className="text-xs text-slate-500 mt-1">No orders match the selected time filter or search query.</p>
                      </td>
                    </tr>
                  ) : (
                    customerReportsData.map((customer, idx) => {
                      const avgOrder = customer.ordersCount > 0 ? (customer.spendValue / customer.ordersCount) : 0;
                      const isTop3 = idx < 3 && sortBy === 'spend' && sortOrder === 'desc';

                      return (
                        <tr 
                          key={customer.name + idx}
                          onClick={() => setSelectedCustomer(customer)}
                          className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                        >
                          {/* Rank */}
                          <td className="py-3.5 px-4 text-center">
                            {isTop3 ? (
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black shadow-md ${
                                idx === 0 
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                                  : idx === 1 
                                  ? 'bg-slate-300/20 text-slate-200 border border-slate-300/40' 
                                  : 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                              }`}>
                                {idx + 1}
                              </span>
                            ) : (
                              <span className="text-slate-500 text-xs font-bold">{idx + 1}</span>
                            )}
                          </td>

                          {/* Customer Name */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {/* Avatar Initial */}
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center font-bold text-xs text-teal-400 shadow-sm shrink-0">
                                {customer.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-200 group-hover:text-teal-300 transition-colors truncate">
                                    {customer.name}
                                  </span>
                                  {customer.mostVisited && (
                                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 shrink-0" title="Favorite Customer" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                                  {customer.phone ? (
                                    <span className="flex items-center gap-1 text-slate-400">
                                      <Phone className="w-3 h-3 text-slate-500" />
                                      {customer.phone}
                                    </span>
                                  ) : (
                                    <span className="text-slate-600">No phone</span>
                                  )}
                                  {customer.area && (
                                    <span className="flex items-center gap-1 text-slate-500 truncate">
                                      • <MapPin className="w-3 h-3" />
                                      {customer.area}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Orders Count */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-block px-3 py-1 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-black text-xs">
                              {customer.ordersCount} {customer.ordersCount === 1 ? 'Order' : 'Orders'}
                            </span>
                          </td>

                          {/* Spend Value */}
                          <td className="py-3.5 px-4 text-right">
                            <span className="text-base font-black text-emerald-400 tracking-tight">
                              <span className="text-xs font-bold text-emerald-600 mr-0.5">Rs.</span>
                              {customer.spendValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </td>

                          {/* Average Order Value */}
                          <td className="py-3.5 px-4 text-right text-slate-400 text-xs hidden md:table-cell font-bold">
                            Rs. {avgOrder.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          </td>

                          {/* Last Came Date */}
                          <td className="py-3.5 px-4 text-right">
                            {customer.lastCameDate ? (
                              <div>
                                <span className="font-bold text-slate-200 text-xs block">
                                  {format(customer.lastCameDate, 'yyyy-MM-dd')}
                                </span>
                                <span className="text-[10px] text-teal-400/80 font-medium block">
                                  {format(customer.lastCameDate, 'hh:mm a')} • {formatDistanceToNow(customer.lastCameDate, { addSuffix: true })}
                                </span>
                              </div>
                            ) : customer.allTimeLastDate ? (
                              <div>
                                <span className="font-bold text-slate-400 text-xs block">
                                  {format(customer.allTimeLastDate, 'yyyy-MM-dd')}
                                </span>
                                <span className="text-[10px] text-slate-500 block">
                                  (Previous period)
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-600 text-xs">-</span>
                            )}
                          </td>

                          {/* Action Button */}
                          <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedCustomer(customer)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-teal-500 hover:text-slate-950 text-slate-400 transition-colors"
                              title="View Customer Order Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            {customerReportsData.length > 0 && (
              <div className="px-5 py-3.5 border-t border-white/5 bg-slate-950/40 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-2">
                <span>Showing {customerReportsData.length} customer records for <strong>{periodLabel}</strong></span>
                <span className="font-bold text-slate-300">
                  Total Value: Rs. {periodSummary.totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* CUSTOMER ORDERS DETAILS MODAL */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-white/10 flex justify-between items-center bg-slate-950/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-base">
                    {selectedCustomer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      {selectedCustomer.name}
                      {selectedCustomer.mostVisited && (
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium flex items-center gap-2 mt-0.5">
                      {selectedCustomer.phone && <span>📞 {selectedCustomer.phone}</span>}
                      {selectedCustomer.area && <span>📍 {selectedCustomer.area}</span>}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body: Customer Summary Stats */}
              <div className="p-4 grid grid-cols-3 gap-3 bg-slate-950/40 border-b border-white/5">
                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Period Orders</span>
                  <span className="text-lg font-black text-cyan-400">{selectedCustomer.ordersCount}</span>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Period Spend</span>
                  <span className="text-lg font-black text-emerald-400">Rs. {selectedCustomer.spendValue.toFixed(0)}</span>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Last Came</span>
                  <span className="text-xs font-bold text-teal-300 block mt-1">
                    {selectedCustomer.lastCameDate ? format(selectedCustomer.lastCameDate, 'MMM dd, yyyy') : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Orders List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3" style={{ scrollbarWidth: 'thin' }}>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Orders in {periodLabel} ({selectedCustomer.sales.length})
                </h4>

                {selectedCustomer.sales.length === 0 ? (
                  <p className="text-center text-slate-500 py-8 text-xs">No order records in this timeframe.</p>
                ) : (
                  selectedCustomer.sales.map((sale, i) => {
                    const sDate = parseTimestamp(sale.timestamp);
                    return (
                      <div 
                        key={sale.id || i}
                        className="bg-slate-950/60 border border-white/5 rounded-xl p-3.5 flex flex-col gap-2 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            {format(sDate, 'yyyy-MM-dd • hh:mm a')}
                          </span>
                          <span className="text-sm font-black text-emerald-400">
                            Rs. {Number(sale.amount || 0).toFixed(2)}
                          </span>
                        </div>

                        {/* Items Preview */}
                        {sale.cartItems && Array.isArray(sale.cartItems) && sale.cartItems.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {sale.cartItems.map((item, idx) => (
                              <span 
                                key={idx} 
                                className="text-[11px] bg-slate-900 border border-white/5 text-slate-300 px-2 py-0.5 rounded-md"
                              >
                                {item.name} <strong className="text-cyan-400">x{item.qty || 1}</strong>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic">
                            {sale.description || (sale.isRepair ? 'PC Repair Service' : 'POS Transaction')}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-white/10 bg-slate-950/60 flex justify-between items-center">
                {selectedCustomer.phone ? (
                  <a
                    href={`https://wa.me/${selectedCustomer.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 text-xs font-bold border border-emerald-500/30 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp Customer</span>
                  </a>
                ) : <div></div>}
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

