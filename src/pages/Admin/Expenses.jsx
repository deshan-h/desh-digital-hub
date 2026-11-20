import React, { useState, useEffect, useMemo } from 'react';
import { expenseService } from '../../services/supabaseService';
import { parseTimestamp } from '../../utils/helpers';
import { 
  Search, 
  Plus, 
  Trash2, 
  Wallet, 
  DollarSign, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  RotateCcw, 
  RefreshCw, 
  X, 
  Download, 
  Tag, 
  Sparkles, 
  Clock, 
  ArrowUpDown,
  Filter,
  Check
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfDay, 
  endOfDay, 
  formatDistanceToNow 
} from 'date-fns';
import { notify } from '../../utils/toast';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';

const QUICK_EXPENSE_ITEMS = [
  { name: "A4 Paper Bundle", tag: "Stationery" },
  { name: "Laminating Rolls", tag: "Stationery" },
  { name: "Printer Ink Bottle", tag: "Printer" },
  { name: "Electricity Bill", tag: "Utility" },
  { name: "Dialog WiFi Bill", tag: "Utility" },
  { name: "Shop Refreshments", tag: "Food" },
  { name: "Hardware Tools", tag: "Hardware" }
];

export default function Expenses({ isAdmin }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Month Navigation & Period Filter States
  const [monthFilterType, setMonthFilterType] = useState('this-month'); // 'this-month', 'last-month', 'all-time', 'today', 'this-week', 'this-year', 'custom-month'
  const [currentSelectedMonth, setCurrentSelectedMonth] = useState(new Date());

  // Sidebar Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc', 'date-asc', 'amount-desc', 'amount-asc', 'name-asc'
  const [tagFilter, setTagFilter] = useState('ALL');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  // Add Expense State
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Modal State
  const [deleteRecordId, setDeleteRecordId] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await expenseService.getExpenses();
      setRecords(data || []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      notify.error("Failed to load expenses.");
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!itemName.trim() || !amount) {
      notify.error("Item name and amount are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await expenseService.createExpense({
        itemName: itemName.trim(),
        amount: Number(amount),
        expenseDate
      });
      notify.success("Expense recorded successfully!");
      setItemName('');
      setAmount('');
      setExpenseDate(new Date().toLocaleDateString('en-CA'));
      setIsAddFormOpen(false);
      fetchRecords();
    } catch (error) {
      console.error("Error adding expense:", error);
      notify.error("Failed to add expense.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    if (!isAdmin) return;
    setDeleteRecordId(id);
  };

  const confirmDelete = async () => {
    if (!deleteRecordId) return;
    try {
      await expenseService.deleteExpense(deleteRecordId);
      notify.success("Expense record deleted.");
      fetchRecords();
    } catch (error) {
      console.error("Error deleting expense:", error);
      notify.error("Failed to delete record.");
    } finally {
      setDeleteRecordId(null);
    }
  };

  // Filter & Sort Expenses
  const filteredRecords = useMemo(() => {
    let list = records.filter(r => {
      const recordDate = r.timestamp ? parseTimestamp(r.timestamp) : (r.expenseDate ? new Date(r.expenseDate) : null);

      // Period interval check
      if (startDate && endDate && recordDate) {
        if (recordDate < startDate || recordDate > endDate) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (r.itemName || '').toLowerCase().includes(q);
        if (!matchesName) return false;
      }

      // Min/Max Amount
      if (minAmount !== '' && r.amount < Number(minAmount)) return false;
      if (maxAmount !== '' && r.amount > Number(maxAmount)) return false;

      return true;
    });

    // Sorting
    list.sort((a, b) => {
      const dateA = a.timestamp ? parseTimestamp(a.timestamp).getTime() : 0;
      const dateB = b.timestamp ? parseTimestamp(b.timestamp).getTime() : 0;

      if (sortBy === 'date-desc') return dateB - dateA;
      if (sortBy === 'date-asc') return dateA - dateB;
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      if (sortBy === 'name-asc') return (a.itemName || '').localeCompare(b.itemName || '');
      return 0;
    });

    return list;
  }, [records, startDate, endDate, searchQuery, minAmount, maxAmount, sortBy]);

  // Overall Period Summary KPIs
  const periodSummary = useMemo(() => {
    const totalCount = filteredRecords.length;
    const totalAmount = filteredRecords.reduce((sum, r) => sum + Number(r.amount || 0), 0);
    const avgExpense = totalCount > 0 ? totalAmount / totalCount : 0;

    return { totalCount, totalAmount, avgExpense };
  }, [filteredRecords]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSortBy('date-desc');
    setMinAmount('');
    setMaxAmount('');
    setMonthFilterType('this-month');
    setCurrentSelectedMonth(new Date());
    notify.info('Filters reset to default');
  };

  // Export to CSV
  const exportToCSV = () => {
    if (filteredRecords.length === 0) {
      notify.error('No expense records to export');
      return;
    }

    const headers = ['Date', 'Item / Description', 'Amount (LKR)'];
    const rows = filteredRecords.map(r => {
      const d = r.timestamp ? parseTimestamp(r.timestamp) : (r.expenseDate ? new Date(r.expenseDate) : new Date());
      return [
        `"${format(d, 'yyyy-MM-dd HH:mm')}"`,
        `"${(r.itemName || '').replace(/"/g, '""')}"`,
        Number(r.amount || 0).toFixed(2)
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Expenses_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify.success('Expenses exported as CSV');
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
              <Filter className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-200">Expense Filter</span>
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
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search Expense</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Paper, Ink, Bills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-800 focus:border-rose-500/80 rounded-xl pl-8.5 pr-7 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all shadow-inner"
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
                className="w-full appearance-none bg-[#090d16] border border-slate-800 focus:border-rose-500/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-medium focus:outline-none cursor-pointer pr-8 shadow-inner"
              >
                <option value="date-desc">Time (Newest First)</option>
                <option value="date-asc">Time (Oldest First)</option>
                <option value="amount-desc">Amount (Highest First)</option>
                <option value="amount-asc">Amount (Lowest First)</option>
                <option value="name-asc">Description (A-Z)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Amount Range */}
          <div className="space-y-1 pt-1 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount Range</label>
              <span className="text-[10px] font-mono text-slate-500">LKR</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min Rs"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-800 focus:border-rose-500/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none font-mono shadow-inner"
              />
              <input
                type="number"
                placeholder="Max Rs"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-800 focus:border-rose-500/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none font-mono shadow-inner"
              />
            </div>
          </div>

          {/* Quick Item Filter Tags */}
          <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Common Expenses</label>
            <div className="flex flex-wrap gap-1">
              {QUICK_EXPENSE_ITEMS.map(q => (
                <button
                  key={q.name}
                  onClick={() => setSearchQuery(q.name)}
                  className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-[10px] text-slate-400 hover:text-rose-300 transition-colors"
                >
                  {q.name}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Status Badge */}
          <div className="mt-auto pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 uppercase font-black tracking-wider text-[10px]">Filtered Records</span>
            <span className="font-mono font-black text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
              {filteredRecords.length}
            </span>
          </div>

        </div>

        {/* Right: Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden space-y-2">
          
          {/* Top Header Control Strip */}
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
                      <option value="custom-month" className="bg-slate-900 text-rose-400 font-bold">
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

              {/* Total Spent in Period Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/25 rounded-xl shadow-inner text-xs">
                <span className="text-[10px] text-rose-400 font-black uppercase">Total Spent:</span>
                <span className="font-mono font-black text-rose-400">
                  -Rs. {periodSummary.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              
              <button
                onClick={exportToCSV}
                className="p-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700/80 transition-all cursor-pointer shadow-sm"
                title="Export as CSV"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={fetchRecords}
                className="p-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700/80 transition-all cursor-pointer shadow-sm"
                title="Refresh Records"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsAddFormOpen(!isAddFormOpen)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white text-xs font-black shadow-md shadow-rose-500/20 transition-all cursor-pointer"
              >
                {isAddFormOpen ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 stroke-[3]" />}
                <span>{isAddFormOpen ? 'Close' : 'Add Expense'}</span>
              </button>
            </div>
          </div>

          {/* Inline Add Expense Card */}
          {isAddFormOpen && (
            <div className="bg-[#071326] border border-rose-500/30 rounded-2xl p-4 shadow-2xl space-y-3 shrink-0 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-400" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">Record New Shop Expense</h3>
                </div>
                <button onClick={() => setIsAddFormOpen(false)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 items-end">
                <div className="flex-1 w-full space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Item / Expense Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. A4 Paper Box, Printer Ink, Tea & Refreshments..."
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full bg-[#090d16] border border-slate-700 focus:border-rose-500 text-slate-100 text-xs px-3 py-2 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="w-full sm:w-44 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount (Rs) *</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#090d16] border border-slate-700 focus:border-rose-500 text-rose-400 font-mono font-bold text-xs px-3 py-2 rounded-xl focus:outline-none text-right"
                  />
                </div>

                <div className="w-full sm:w-44 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expense Date</label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full bg-[#090d16] border border-slate-700 focus:border-rose-500 text-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-rose-500/20 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Saving...' : 'Save Expense'}</span>
                </button>
              </form>

              {/* Quick Select Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Quick Fill:</span>
                {QUICK_EXPENSE_ITEMS.map(q => (
                  <button
                    key={q.name}
                    type="button"
                    onClick={() => setItemName(q.name)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-[10px] font-bold text-slate-300 hover:text-rose-300 transition-colors"
                  >
                    + {q.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="flex-1 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-0">
            <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-[#071326] border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3.5 w-44">Date & Time</th>
                    <th className="py-2.5 px-3.5">Expense Description</th>
                    <th className="py-2.5 px-3.5 text-right w-44">Amount (LKR)</th>
                    {isAdmin && <th className="py-2.5 px-3.5 text-center w-20">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 4 : 3} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center gap-2.5 text-slate-500">
                          <Wallet className="w-10 h-10 stroke-[1.5] text-slate-600" />
                          <p className="text-sm font-bold text-slate-400">No expense records found</p>
                          <p className="text-xs text-slate-500">Try adjusting your date range or search query.</p>
                          <button
                            onClick={handleResetFilters}
                            className="mt-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-xl text-xs font-bold border border-slate-700 transition-all cursor-pointer"
                          >
                            Reset Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => {
                      const d = record.timestamp 
                        ? parseTimestamp(record.timestamp) 
                        : (record.expenseDate ? new Date(record.expenseDate) : new Date());

                      return (
                        <tr
                          key={record.id}
                          className="hover:bg-slate-800/40 transition-colors group"
                        >
                          {/* Date Column */}
                          <td className="py-2.5 px-3.5 whitespace-nowrap align-middle">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-200 text-xs">
                                {format(d, 'dd MMM yyyy')}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5 text-slate-400" />
                                {format(d, 'HH:mm')} • {formatDistanceToNow(d, { addSuffix: true })}
                              </span>
                            </div>
                          </td>

                          {/* Expense Name Column */}
                          <td className="py-2.5 px-3.5 align-middle">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                                <DollarSign className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-bold text-slate-100 text-xs">
                                {record.itemName}
                              </span>
                            </div>
                          </td>

                          {/* Amount Column */}
                          <td className="py-2.5 px-3.5 text-right whitespace-nowrap align-middle font-mono font-black text-rose-400 text-xs">
                            -Rs. {Number(record.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>

                          {/* Actions Column */}
                          {isAdmin && (
                            <td className="py-2.5 px-3.5 text-center whitespace-nowrap align-middle">
                              <button
                                onClick={() => handleDelete(record.id)}
                                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700/80 transition-all cursor-pointer"
                                title="Delete Expense"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
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
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
                <span>Active Period: <strong className="text-rose-300">{periodLabel}</strong></span>
              </div>
              <div className="font-mono text-slate-400">
                Showing {filteredRecords.length} records • Total: <strong className="text-rose-400">-Rs. {periodSummary.totalAmount.toFixed(2)}</strong>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Delete Expense Confirmation Modal */}
      <DeleteConfirmModal 
        isOpen={!!deleteRecordId} 
        onClose={() => setDeleteRecordId(null)} 
        onConfirm={confirmDelete} 
        title="Delete Expense Record?"
        message="Are you sure you want to delete this expense record? This action cannot be undone."
      />

    </div>
  );
}
