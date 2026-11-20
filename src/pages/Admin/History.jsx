import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ArrowDownUp, 
  Filter, 
  RotateCcw, 
  RefreshCw, 
  FileText, 
  Printer, 
  Trash2, 
  MessageCircle, 
  Edit3, 
  Zap, 
  X, 
  Download, 
  User, 
  Users,
  DollarSign, 
  CreditCard, 
  Layers, 
  Tag, 
  CheckCircle2, 
  ArrowUpRight, 
  Clock, 
  Wrench,
  HelpCircle,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { generateInvoiceHtml, generateUtilityReceiptHtml } from '../../utils/invoiceTemplate';
import { notify } from '../../utils/toast';
import { customerService, salesService } from '../../services/supabaseService';
import { supabase } from '../../config/supabase';

export default function History({ 
  salesHistory = [], 
  fetchSales, 
  handleDeleteSale, 
  user, 
  posCategories = [], 
  isAdmin, 
  customersList = [],
  setActiveTab
}) {
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc', 'date-asc', 'amount-desc', 'amount-asc', 'name-asc'
  const [accountFilter, setAccountFilter] = useState('ALL'); // 'ALL', 'Cash', 'Credit', 'Utility', 'Repair'
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [recordTypeFilter, setRecordTypeFilter] = useState('ALL'); // 'ALL', 'INCOME', 'CREDIT', 'UTILITY', 'REPAIR'
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Month Navigation State
  const [monthFilterType, setMonthFilterType] = useState('this-month'); // 'this-month', 'last-month', 'all-time', 'custom-month'
  const [currentSelectedMonth, setCurrentSelectedMonth] = useState(new Date());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // WhatsApp Modal
  const [whatsappModalData, setWhatsappModalData] = useState(null);
  const [whatsappNumberInput, setWhatsappNumberInput] = useState('');
  const [isUpdatingCustomer, setIsUpdatingCustomer] = useState(false);

  // Utility Bill Edit Modal
  const [utilityModalSale, setUtilityModalSale] = useState(null);
  const [editAccountNo, setEditAccountNo] = useState('');
  const [editRefNo, setEditRefNo] = useState('');
  const [isUpdatingUtility, setIsUpdatingUtility] = useState(false);

  // Category mapping
  const itemToCategoryMap = useMemo(() => {
    const map = {};
    if (posCategories && Array.isArray(posCategories)) {
      posCategories.forEach(cat => {
        if (cat.items && Array.isArray(cat.items)) {
          cat.items.forEach(item => {
            map[item.name] = cat.category;
          });
        }
      });
    }
    return map;
  }, [posCategories]);

  const availableCategories = useMemo(() => {
    const cats = new Set(['REPAIR']);
    if (posCategories && Array.isArray(posCategories)) {
      posCategories.forEach(cat => cats.add(cat.category.toUpperCase()));
    }
    return Array.from(cats);
  }, [posCategories]);

  // Handle Month Navigation
  const handlePrevMonth = () => {
    setMonthFilterType('custom-month');
    setCurrentSelectedMonth(prev => subMonths(prev, 1));
    setCurrentPage(1);
  };

  const handleNextMonth = () => {
    setMonthFilterType('custom-month');
    setCurrentSelectedMonth(prev => addMonths(prev, 1));
    setCurrentPage(1);
  };

  const handleMonthTypeChange = (type) => {
    setMonthFilterType(type);
    if (type === 'this-month') {
      setCurrentSelectedMonth(new Date());
    } else if (type === 'last-month') {
      setCurrentSelectedMonth(subMonths(new Date(), 1));
    }
    setCurrentPage(1);
  };

  // Utility Bill Handlers
  const handleOpenUtilityModal = (sale) => {
    setUtilityModalSale(sale);
    const utilityItem = sale.cartItems?.find(i => i.isUtility || i.accountNumber || i.referenceNumber);
    setEditAccountNo(utilityItem?.accountNumber || '');
    setEditRefNo(utilityItem?.referenceNumber || '');
  };

  const handleSaveUtilityUpdate = async () => {
    if (!utilityModalSale) return;
    setIsUpdatingUtility(true);
    try {
      const sale = utilityModalSale;
      const cleanAcc = editAccountNo.trim();
      const cleanRef = editRefNo.trim();

      const updatedCartItems = (sale.cartItems && sale.cartItems.length > 0)
        ? sale.cartItems.map(item => {
            if (item.isUtility || item.name?.toLowerCase().includes('bill payment')) {
              return {
                ...item,
                accountNumber: cleanAcc,
                referenceNumber: cleanRef
              };
            }
            return item;
          })
        : [{
            id: 'utility-' + Date.now(),
            name: 'Utility Bill Payment',
            price: Number(sale.amount || 50),
            qty: 1,
            accountNumber: cleanAcc,
            referenceNumber: cleanRef,
            isUtility: true
          }];

      let providerName = 'Utility';
      if (sale.description && sale.description.includes(' - ')) {
        const afterDash = sale.description.split(' - ')[1];
        providerName = afterDash.split('|')[0].trim();
      }

      const updatedDesc = `Utility Bill - ${providerName}${cleanAcc ? ' | A/C: ' + cleanAcc : ''}${cleanRef ? ' | Ref: ' + cleanRef : ''}`;

      await salesService.updateSale(sale.id, {
        description: updatedDesc,
        cartItems: updatedCartItems
      });

      notify.success("Utility Bill details updated successfully!");
      setUtilityModalSale(null);
      if (fetchSales) fetchSales();
    } catch (err) {
      console.error(err);
      notify.error("Failed to update utility bill details");
    } finally {
      setIsUpdatingUtility(false);
    }
  };

  // WhatsApp Modal Handlers
  const handleOpenWhatsappModal = (sale) => {
    let customerPhone = sale.customerPhone || '';
    if (!customerPhone && sale.customerName) {
      const customer = customersList.find(c => c.name?.toLowerCase() === sale.customerName.toLowerCase());
      if (customer && customer.phone) {
        customerPhone = customer.phone;
      }
    }

    if (customerPhone) {
      proceedSendWhatsapp(sale, customerPhone);
    } else {
      setWhatsappModalData(sale);
      setWhatsappNumberInput('');
    }
  };

  const proceedSendWhatsapp = async (sale, numberToUse) => {
    let text = '*DESH Digital Hub*\n';
    text += 'Thank you for your business!\n\n';
    text += '*Your Order:*\n';
    if (sale.cartItems && sale.cartItems.length > 0) {
      sale.cartItems.forEach(item => {
        text += `- ${item.name} x${item.qty} (Rs. ${(item.price * item.qty).toFixed(2)})\n`;
      });
    } else {
      text += `${sale.description || 'No items'}\n`;
    }
    text += `\n*Total Amount:* Rs. ${sale.amount}\n\n`;
    text += 'For inquiries, call +94(71) 998 9000.';
    const encodedMessage = encodeURIComponent(text);
    
    let formattedNumber = numberToUse.trim().replace(/\D/g, '');
    if (formattedNumber.startsWith('0')) {
      formattedNumber = '94' + formattedNumber.substring(1);
    } else if (!formattedNumber.startsWith('94')) {
      formattedNumber = '94' + formattedNumber;
    }
    
    window.open(`https://wa.me/${formattedNumber}?text=${encodedMessage}`, '_blank');
  };

  const submitWhatsappModal = async () => {
    if (!whatsappNumberInput.trim()) {
      notify.error("Please enter a WhatsApp number");
      return;
    }
    
    setIsUpdatingCustomer(true);
    try {
      const sale = whatsappModalData;
      const phoneTrimmed = whatsappNumberInput.trim();
      
      if (sale.customerId) {
        await customerService.updateCustomer(sale.customerId, { phone: phoneTrimmed });
      } else if (sale.customerName) {
        await customerService.findOrCreateCustomerByName(sale.customerName, phoneTrimmed);
      }

      proceedSendWhatsapp(sale, phoneTrimmed);
      setWhatsappModalData(null);
    } catch (error) {
      console.error("Error updating customer phone:", error);
      notify.error("Failed to update customer phone");
    } finally {
      setIsUpdatingCustomer(false);
    }
  };

  // Print Invoice / Utility Receipt
  const handlePrint = (sale) => {
    const isUtility = sale.isUtility || 
      (sale.cartItems && sale.cartItems.some(i => i.isUtility)) || 
      (sale.description && sale.description.startsWith('Utility Bill'));

    const printWindow = window.open('', '_blank');
    const html = isUtility ? generateUtilityReceiptHtml(sale) : generateInvoiceHtml(sale);
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const getSaleIncome = (sale) => {
    if (sale.isRepair) {
      return Number(sale.amount || 0) - Number(sale.cost || 0);
    }
    let totalCost = 0;
    if (sale.cartItems && Array.isArray(sale.cartItems)) {
      sale.cartItems.forEach(item => {
        totalCost += (Number(item.cost || 0) * Number(item.qty || 1));
      });
    }
    return Number(sale.amount || 0) - totalCost;
  };

  // Manual Refresh
  const handleRefresh = async () => {
    if (fetchSales) {
      setIsRefreshing(true);
      await fetchSales();
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  // Clear Filters
  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('date-desc');
    setAccountFilter('ALL');
    setCategoryFilter('ALL');
    setRecordTypeFilter('ALL');
    setMinAmount('');
    setMaxAmount('');
    setMonthFilterType('this-month');
    setCurrentSelectedMonth(new Date());
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || 
    sortBy !== 'date-desc' || 
    accountFilter !== 'ALL' || 
    categoryFilter !== 'ALL' || 
    recordTypeFilter !== 'ALL' || 
    minAmount || 
    maxAmount || 
    monthFilterType !== 'this-month';

  // Filter & Sort Logic
  const filteredAndSortedSales = useMemo(() => {
    let filtered = salesHistory || [];

    // 1. Month Filter
    if (monthFilterType !== 'all-time') {
      const start = startOfMonth(currentSelectedMonth);
      const end = endOfMonth(currentSelectedMonth);
      filtered = filtered.filter(sale => {
        const d = sale.timestamp 
          ? (typeof sale.timestamp.toDate === 'function' ? sale.timestamp.toDate() : new Date(sale.timestamp.seconds ? sale.timestamp.seconds * 1000 : sale.timestamp)) 
          : new Date();
        return d >= start && d <= end;
      });
    }

    // 2. Search Query (Invoice No, Customer Name, Description, User)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(sale => {
        const inv = (sale.invoiceNo || (sale.id ? sale.id.slice(0, 6) : '')).toLowerCase();
        const customer = (sale.customerName || '').toLowerCase();
        const desc = (sale.description || '').toLowerCase();
        const phone = (sale.customerPhone || '').toLowerCase();
        const userStr = (sale.userEmail || sale.userId || '').toLowerCase();
        return inv.includes(q) || customer.includes(q) || desc.includes(q) || phone.includes(q) || userStr.includes(q);
      });
    }

    // 3. Accounts / Payment Method
    if (accountFilter !== 'ALL') {
      filtered = filtered.filter(sale => {
        const isUtility = Boolean(sale.isUtility || sale.description?.toLowerCase().includes('utility bill'));
        if (accountFilter === 'Cash') return sale.paymentMethod === 'Cash' || (!sale.paymentMethod && !sale.is_credit && !sale.dueAmount);
        if (accountFilter === 'Credit') return sale.paymentMethod === 'Credit' || sale.dueAmount > 0 || sale.is_credit || sale.status === 'Pending';
        if (accountFilter === 'Utility') return isUtility;
        if (accountFilter === 'Repair') return Boolean(sale.isRepair || sale.description?.toLowerCase().includes('repair payment'));
        return true;
      });
    }

    // 4. Categories
    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter(sale => {
        let badgeCategory = 'SALE';
        const isUtility = Boolean(sale.isUtility || sale.description?.toLowerCase().includes('utility bill'));
        if (isUtility) badgeCategory = 'UTILITY';
        else if (sale.isRepair) badgeCategory = 'REPAIR';
        else if (sale.cartItems && sale.cartItems.length > 0) {
          const cats = sale.cartItems.map(item => itemToCategoryMap[item.name]).filter(Boolean);
          if (cats.length > 0) badgeCategory = cats[0].toUpperCase();
        }
        return badgeCategory === categoryFilter;
      });
    }

    // 5. Record Types
    if (recordTypeFilter !== 'ALL') {
      filtered = filtered.filter(sale => {
        const isUtility = Boolean(sale.isUtility || sale.description?.toLowerCase().includes('utility bill'));
        const isCredit = Boolean(sale.paymentMethod === 'Credit' || sale.dueAmount > 0 || sale.is_credit || sale.status === 'Pending');
        const isRepair = Boolean(sale.isRepair || sale.description?.toLowerCase().includes('repair payment'));

        if (recordTypeFilter === 'UTILITY') return isUtility;
        if (recordTypeFilter === 'REPAIR') return isRepair;
        if (recordTypeFilter === 'CREDIT') return isCredit;
        if (recordTypeFilter === 'INCOME') return !isCredit;
        return true;
      });
    }

    // 6. Amount Range
    if (minAmount !== '') {
      filtered = filtered.filter(sale => Number(sale.amount || 0) >= Number(minAmount));
    }
    if (maxAmount !== '') {
      filtered = filtered.filter(sale => Number(sale.amount || 0) <= Number(maxAmount));
    }

    // 7. Sort
    return [...filtered].sort((a, b) => {
      if (sortBy === 'amount-desc') return Number(b.amount || 0) - Number(a.amount || 0);
      if (sortBy === 'amount-asc') return Number(a.amount || 0) - Number(b.amount || 0);
      if (sortBy === 'name-asc') return (a.customerName || '').localeCompare(b.customerName || '');
      
      const dateA = a.timestamp 
        ? (typeof a.timestamp.toDate === 'function' ? a.timestamp.toDate() : new Date(a.timestamp.seconds ? a.timestamp.seconds * 1000 : a.timestamp)) 
        : new Date(0);
      const dateB = b.timestamp 
        ? (typeof b.timestamp.toDate === 'function' ? b.timestamp.toDate() : new Date(b.timestamp.seconds ? b.timestamp.seconds * 1000 : b.timestamp)) 
        : new Date(0);

      if (sortBy === 'date-asc') return dateA - dateB;
      return dateB - dateA; // default date-desc
    });
  }, [
    salesHistory, 
    monthFilterType, 
    currentSelectedMonth, 
    searchQuery, 
    accountFilter, 
    categoryFilter, 
    recordTypeFilter, 
    minAmount, 
    maxAmount, 
    sortBy, 
    itemToCategoryMap
  ]);

  // Aggregate Metrics
  const totalFilteredAmount = useMemo(() => {
    return filteredAndSortedSales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  }, [filteredAndSortedSales]);

  const totalFilteredIncome = useMemo(() => {
    return filteredAndSortedSales.reduce((sum, s) => sum + getSaleIncome(s), 0);
  }, [filteredAndSortedSales]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredAndSortedSales.length / ITEMS_PER_PAGE);
  const paginatedSales = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedSales.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedSales, currentPage]);

  // CSV Export
  const exportToCSV = () => {
    if (!filteredAndSortedSales || filteredAndSortedSales.length === 0) {
      notify.error("No sales records to export!");
      return;
    }
    const headers = ["Invoice No", "Date", "Time", "Customer", "Category", "Payment Method", "Description", "Amount", "Status", "User"];
    const rows = filteredAndSortedSales.map(sale => {
      const dateObj = sale.timestamp ? (typeof sale.timestamp.toDate === 'function' ? sale.timestamp.toDate() : new Date(sale.timestamp.seconds ? sale.timestamp.seconds * 1000 : sale.timestamp)) : new Date();
      return [
        sale.invoiceNo || sale.id.slice(0, 6).toUpperCase(),
        format(dateObj, 'yyyy-MM-dd'),
        format(dateObj, 'HH:mm'),
        `"${(sale.customerName || '').replace(/"/g, '""')}"`,
        sale.isRepair ? 'REPAIR' : (sale.isUtility ? 'UTILITY' : 'SALE'),
        sale.paymentMethod || 'Cash',
        `"${(sale.description || '').replace(/"/g, '""')}"`,
        Number(sale.amount || 0).toFixed(2),
        sale.status || 'Completed',
        sale.userEmail || sale.userId || 'Admin'
      ];
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales-records-${format(new Date(), 'yyyyMMdd-HHmm')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify.success("Sales records exported to CSV!");
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-2 sm:gap-2.5 overflow-hidden">
      
      {/* ======================================================== */}
      {/* LEFT SIDEBAR: Advanced Filters Section (Matching Reference) */}
      {/* ======================================================== */}
      <aside className="w-full md:w-64 lg:w-72 shrink-0 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-3 sm:p-3.5 shadow-xl flex flex-col justify-between overflow-y-auto custom-scrollbar">
        
        <div className="space-y-3.5">
          {/* Header: Title + Action Icons */}
          <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-base font-black text-slate-100 tracking-tight">Records</h2>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={handleRefresh}
                className="p-1.5 rounded-lg bg-[#090d16] hover:bg-slate-800 text-slate-400 hover:text-sky-400 border border-slate-800 transition-colors cursor-pointer"
                title="Refresh sales data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
              </button>
              
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="p-1.5 rounded-lg bg-[#090d16] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors cursor-pointer"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Search Box */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Search
            </label>
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search records, client, invoice..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full bg-[#090d16] border border-slate-800/90 focus:border-sky-500/60 rounded-xl pl-8 pr-7 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Sort by
            </label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                className="w-full appearance-none bg-[#090d16] border border-slate-800/90 focus:border-sky-500/60 text-slate-200 rounded-xl pl-8 pr-7 py-2 text-xs focus:outline-none transition-all cursor-pointer shadow-inner"
              >
                <option value="date-desc" className="bg-slate-900">Time (newest first)</option>
                <option value="date-asc" className="bg-slate-900">Time (oldest first)</option>
                <option value="amount-desc" className="bg-slate-900">Amount (highest first)</option>
                <option value="amount-asc" className="bg-slate-900">Amount (lowest first)</option>
                <option value="name-asc" className="bg-slate-900">Customer (A-Z)</option>
              </select>
              <ArrowDownUp className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Accounts / Payment Method */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Accounts
            </label>
            <div className="relative">
              <select
                value={accountFilter}
                onChange={(e) => { setAccountFilter(e.target.value); setCurrentPage(1); }}
                className="w-full appearance-none bg-[#090d16] border border-slate-800/90 focus:border-sky-500/60 text-slate-200 rounded-xl pl-8 pr-7 py-2 text-xs focus:outline-none transition-all cursor-pointer shadow-inner"
              >
                <option value="ALL" className="bg-slate-900">All accounts</option>
                <option value="Cash" className="bg-slate-900">Cash Sales</option>
                <option value="Credit" className="bg-slate-900">Credit / Arrears</option>
                <option value="Utility" className="bg-slate-900">Utility Payments</option>
                <option value="Repair" className="bg-slate-900">PC & Repair Invoices</option>
              </select>
              <CreditCard className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Categories
            </label>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                className="w-full appearance-none bg-[#090d16] border border-slate-800/90 focus:border-sky-500/60 text-slate-200 rounded-xl pl-8 pr-7 py-2 text-xs focus:outline-none transition-all cursor-pointer shadow-inner"
              >
                <option value="ALL" className="bg-slate-900">All categories</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                ))}
              </select>
              <Layers className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Record Types */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Record types
            </label>
            <div className="relative">
              <select
                value={recordTypeFilter}
                onChange={(e) => { setRecordTypeFilter(e.target.value); setCurrentPage(1); }}
                className="w-full appearance-none bg-[#090d16] border border-slate-800/90 focus:border-sky-500/60 text-slate-200 rounded-xl pl-8 pr-7 py-2 text-xs focus:outline-none transition-all cursor-pointer shadow-inner"
              >
                <option value="ALL" className="bg-slate-900">All Record types</option>
                <option value="INCOME" className="bg-slate-900">Income / Settled</option>
                <option value="CREDIT" className="bg-slate-900">Credit / Arrears</option>
                <option value="UTILITY" className="bg-slate-900">Utility Bill Payments</option>
                <option value="REPAIR" className="bg-slate-900">Device Repairs</option>
              </select>
              <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Amount Range */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Amount range
              </label>
              <span className="text-[10px] font-mono text-slate-500">LKR</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <input
                  type="number"
                  placeholder="Min (0)"
                  value={minAmount}
                  onChange={(e) => { setMinAmount(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-[#090d16] border border-slate-800/90 focus:border-sky-500/60 text-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none font-mono shadow-inner"
                />
              </div>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Max"
                  value={maxAmount}
                  onChange={(e) => { setMaxAmount(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-[#090d16] border border-slate-800/90 focus:border-sky-500/60 text-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none font-mono shadow-inner"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Clear Filters Button at bottom */}
        {hasActiveFilters && (
          <div className="pt-3 border-t border-slate-800/60 mt-3">
            <button
              onClick={clearFilters}
              className="w-full py-2 px-3 rounded-xl bg-slate-800/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/60 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}

      </aside>

      {/* ======================================================== */}
      {/* RIGHT MAIN AREA: Top Bar + Records Table + Pagination */}
      {/* ======================================================== */}
      <div className="flex-1 min-w-0 flex flex-col gap-2 h-full overflow-hidden">
        
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
                    <option value="custom-month" className="bg-slate-900 text-sky-400 font-bold">
                      {format(currentSelectedMonth, 'MMMM yyyy')}
                    </option>
                  )}
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

            {/* Filtered Records Count Pill */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/80">FILTERED RECORDS:</span>
              <span className="font-black text-emerald-300">{filteredAndSortedSales.length}</span>
            </div>
          </div>

          {/* Right: Metrics + Export Button */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2">
              {/* Total Revenue Pill */}
              <div className="bg-[#090d16] border border-slate-800/90 rounded-xl px-2.5 py-1 text-right">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 block leading-none">Total Revenue</span>
                <span className="text-xs font-black text-slate-200 font-mono">
                  Rs. {totalFilteredAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Net Income Pill (Admin Only) */}
              {isAdmin && (
                <div className="bg-[#090d16] border border-sky-500/30 rounded-xl px-2.5 py-1 text-right">
                  <span className="text-[9px] uppercase tracking-wider text-sky-400/80 block leading-none">Net Income</span>
                  <span className="text-xs font-black text-sky-300 font-mono">
                    Rs. {totalFilteredIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>

            {/* Export CSV Button */}
            <button
              onClick={exportToCSV}
              className="p-2 rounded-xl bg-[#090d16] hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all cursor-pointer shadow-sm flex items-center gap-1.5 text-xs font-bold"
              title="Export filtered records to CSV"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden lg:inline text-[11px]">CSV</span>
            </button>
          </div>

        </div>

        {/* Main Records Table Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl flex-1 min-h-0 flex flex-col">
          <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#09182d] text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-800/90 sticky top-0 z-10 backdrop-blur-md">
                  <th className="px-4 py-3.5 font-bold">DATE & TIME</th>
                  <th className="px-4 py-3.5 font-bold">TYPE</th>
                  <th className="px-4 py-3.5 font-bold">CATEGORY</th>
                  <th className="px-4 py-3.5 font-bold">LABEL</th>
                  <th className="px-4 py-3.5 font-bold">DESCRIPTION</th>
                  <th className="px-4 py-3.5 font-bold text-right">AMOUNT</th>
                  <th className="px-4 py-3.5 font-bold text-center">ACTIONS</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-800/40 text-xs">
                {paginatedSales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Receipt className="w-8 h-8 text-slate-600 stroke-[1.5]" />
                        <span className="text-sm font-bold text-slate-400">No records found matching criteria.</span>
                        <p className="text-xs text-slate-500">Try adjusting your filters or search keywords.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedSales.map((sale) => {
                    const dateObj = sale.timestamp 
                      ? (typeof sale.timestamp.toDate === 'function' ? sale.timestamp.toDate() : new Date(sale.timestamp.seconds ? sale.timestamp.seconds * 1000 : sale.timestamp)) 
                      : new Date();
                    const dateStr = format(dateObj, 'dd MMM yyyy');
                    const timeStr = format(dateObj, 'HH:mm');
                    const email = sale.userEmail || '';
                    const userName = email.includes('@') ? email.split('@')[0] : (sale.userEmail || sale.userId || 'Admin');
                    const income = getSaleIncome(sale);

                    const isUtilitySale = Boolean(
                      sale.isUtility ||
                      sale.description?.toLowerCase().includes('utility bill') ||
                      sale.cartItems?.some(item => item.isUtility || item.accountNumber || item.referenceNumber || item.name?.toLowerCase().includes('bill payment'))
                    );

                    let badgeCategory = 'BUSINESS';
                    if (isUtilitySale) {
                      badgeCategory = 'UTILITY';
                    } else if (sale.isRepair) {
                      badgeCategory = 'REPAIR';
                    } else if (sale.cartItems && sale.cartItems.length > 0) {
                      const cats = sale.cartItems.map(item => itemToCategoryMap[item.name]).filter(Boolean);
                      if (cats.length > 0) {
                        badgeCategory = cats[0].toUpperCase();
                      }
                    }

                    const isCredit = Boolean(sale.paymentMethod === 'Credit' || sale.dueAmount > 0 || sale.status === 'Pending' || sale.is_credit);
                    const amountVal = Number(sale.amount || 0);

                    // Label / Payment Badge Text
                    let labelText = 'POS BATCH SYNC';
                    if (isUtilitySale) labelText = 'UTILITY BILL';
                    else if (sale.isRepair) labelText = 'REPAIR BILL';
                    else if (sale.paymentMethod) labelText = sale.paymentMethod.toUpperCase();
                    else if (isCredit) labelText = 'CREDIT SALE';
                    else labelText = 'CASH SALE';

                    return (
                      <tr key={sale.id} className="hover:bg-slate-800/30 transition-colors group">
                        
                        {/* Date & Time */}
                        <td className="px-4 py-3 whitespace-nowrap align-middle">
                          <div className="font-bold text-slate-200 text-xs font-mono">{dateStr}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{timeStr}</div>
                        </td>

                        {/* Type: INCOME (Green) / EXPENSE or CREDIT (Red/Amber) / UTILITY (Cyan) */}
                        <td className="px-4 py-3 whitespace-nowrap align-middle">
                          {isCredit ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase rounded-full border bg-amber-500/10 text-amber-400 border-amber-500/30">
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>CREDIT</span>
                            </span>
                          ) : isUtilitySale ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase rounded-full border bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                              <Zap className="w-3 h-3 text-cyan-400" />
                              <span>UTILITY</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                              <span>INCOME</span>
                            </span>
                          )}
                        </td>

                        {/* Category Badge */}
                        <td className="px-4 py-3 whitespace-nowrap align-middle">
                          <span className="inline-block px-2.5 py-0.5 text-[10px] font-black uppercase rounded-md bg-[#090d16] text-slate-300 border border-slate-800 tracking-wider">
                            {badgeCategory}
                          </span>
                        </td>

                        {/* Label Badge */}
                        <td className="px-4 py-3 whitespace-nowrap align-middle">
                          <span className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-slate-800/70 text-slate-400 border border-slate-700/60 font-mono">
                            {labelText}
                          </span>
                        </td>

                        {/* Description & Customer */}
                        <td className="px-4 py-3 align-middle max-w-[280px]">
                          <div className="font-bold text-slate-200 line-clamp-1 text-xs" title={sale.description}>
                            {sale.description || 'General POS Sale'}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                            {sale.customerName && (
                              <span className="text-slate-300 font-semibold">{sale.customerName}</span>
                            )}
                            {sale.customerName && <span className="text-slate-600">•</span>}
                            <span className="text-slate-500 font-mono">#{sale.invoiceNo || sale.id.slice(0, 6).toUpperCase()}</span>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3 text-right whitespace-nowrap align-middle font-mono">
                          <div className={`font-black text-xs ${isCredit ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {isCredit ? `Rs. ${amountVal.toFixed(2)}` : `+Rs. ${amountVal.toFixed(2)}`}
                          </div>
                          {isAdmin && (
                            <div className="text-[9px] font-bold text-sky-400/80 mt-0.5">
                              Inc: Rs. {income.toFixed(2)}
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-center whitespace-nowrap align-middle">
                          <div className="flex items-center justify-center gap-1">
                            {isUtilitySale && (
                              <button
                                onClick={() => handleOpenUtilityModal(sale)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 border border-slate-700/80 transition-all cursor-pointer"
                                title="Update Account & Reference No"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => handlePrint(sale)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-500/20 text-slate-400 hover:text-sky-300 border border-slate-700/80 transition-all cursor-pointer"
                              title="Print Receipt / Bill"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleOpenWhatsappModal(sale)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-300 border border-slate-700/80 transition-all cursor-pointer"
                              title="Send WhatsApp Bill"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>

                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteSale(sale.id)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/80 transition-all cursor-pointer"
                                title="Delete Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer: Pagination */}
          <div className="bg-[#09182d] border-t border-slate-800/90 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-[11px] font-bold text-slate-400 font-mono">
              Showing {filteredAndSortedSales.length === 0 ? 0 : ((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedSales.length)} of {filteredAndSortedSales.length} records
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-3 h-3" /> Previous
              </button>
              
              <span className="text-xs font-bold text-slate-200 px-2 font-mono">
                Page {currentPage} / {totalPages || 1}
              </span>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1"
              >
                Next <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* WhatsApp Reminder Modal */}
      {/* ======================================================== */}
      {whatsappModalData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="text-base font-black text-slate-100 uppercase tracking-wide flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-400" /> Send WhatsApp
              </h3>
              <button onClick={() => setWhatsappModalData(null)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Send a WhatsApp receipt for <span className="text-slate-200 font-bold">{whatsappModalData.customerName || whatsappModalData.invoiceNo || 'this order'}</span>.
              </p>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                  WhatsApp Number
                </label>
                <input
                  type="text"
                  autoFocus
                  value={whatsappNumberInput}
                  onChange={(e) => setWhatsappNumberInput(e.target.value)}
                  placeholder="07XXXXXXXX"
                  className="w-full text-base bg-[#090d16] border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitWhatsappModal();
                  }}
                />
              </div>
              <button
                onClick={submitWhatsappModal}
                disabled={!whatsappNumberInput.trim() || isUpdatingCustomer}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wide transition-all disabled:opacity-50 mt-2 flex justify-center items-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20"
              >
                {isUpdatingCustomer ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* Utility Bill Update Modal */}
      {/* ======================================================== */}
      {utilityModalSale && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="text-base font-black text-slate-100 uppercase tracking-wide flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" /> Update Utility Bill Details
              </h3>
              <button 
                onClick={() => setUtilityModalSale(null)} 
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="p-3 bg-[#090d16] rounded-xl border border-slate-800 text-xs space-y-1">
                <p className="font-bold text-slate-200 truncate">{utilityModalSale.description || 'Utility Bill Payment'}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                  <span>Customer: <span className="text-slate-200 font-semibold">{utilityModalSale.customerName || 'Walk-in'}</span></span>
                  <span className="text-amber-400 font-mono font-bold">Fee: Rs. {Number(utilityModalSale.amount || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Account Number */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                  Account Number <span className="text-slate-500 lowercase font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10492830 / 037..."
                  value={editAccountNo}
                  onChange={(e) => setEditAccountNo(e.target.value)}
                  className="w-full text-sm bg-[#090d16] border border-slate-800 text-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500/50 transition-all font-mono"
                />
              </div>

              {/* Reference Number */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                  Reference Number <span className="text-slate-500 lowercase font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. TXN-948120 / Ref No"
                  value={editRefNo}
                  onChange={(e) => setEditRefNo(e.target.value)}
                  className="w-full text-sm bg-[#090d16] border border-slate-800 text-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500/50 transition-all font-mono"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUtilityModalSale(null)}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handlePrint({
                      ...utilityModalSale,
                      cartItems: (utilityModalSale.cartItems || []).map(i => i.isUtility ? {
                        ...i,
                        accountNumber: editAccountNo.trim(),
                        referenceNumber: editRefNo.trim()
                      } : i)
                    });
                  }}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-sky-400 border border-sky-500/30 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  title="Print Utility Receipt"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveUtilityUpdate}
                  disabled={isUpdatingUtility}
                  className="py-2.5 px-3 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingUtility ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
