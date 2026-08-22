import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Calendar, Search, Filter, Download, ArrowRight, Printer, AlertTriangle, FileText, ChevronDown, ChevronUp, Package, Wrench, X, RefreshCw, Smartphone, Monitor, Battery, CheckCircle, Clock, Trash2, HelpCircle, ShoppingCart, User, History as HistoryIcon, MessageCircle } from 'lucide-react';
import { generateInvoiceHtml } from '../../utils/invoiceTemplate';

export default function History({ salesHistory, fetchSales, handleDeleteSale, user, posCategories = [], isAdmin }) {
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [descriptionSearch, setDescriptionSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

// Send WhatsApp for a sale
const sendWhatsAppSale = (sale) => {
  const number = window.prompt('Enter WhatsApp number (with country code, e.g., 9471xxxxxxx):');
  if (!number) return;
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
  let formattedNumber = number.trim();
  if (formattedNumber.startsWith('0')) {
    formattedNumber = formattedNumber.substring(1);
  }
  window.open(`https://wa.me/${formattedNumber}?text=${encodedMessage}`, '_blank');
};

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

  const handlePrint = (sale) => {
    const printWindow = window.open('', '_blank');
    const html = generateInvoiceHtml(sale);
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

  const filteredAndSortedSales = useMemo(() => {
    let filtered = salesHistory || [];
    
    if (invoiceSearch.trim() !== '') {
      const lower = invoiceSearch.toLowerCase();
      filtered = filtered.filter(sale => {
        const inv = sale.invoiceNo || (sale.id ? sale.id.slice(0, 6) : '');
        return inv.toLowerCase().includes(lower);
      });
    }

    if (customerSearch.trim() !== '') {
      const lower = customerSearch.toLowerCase();
      filtered = filtered.filter(sale => sale.customerName && sale.customerName.toLowerCase().includes(lower));
    }

    if (descriptionSearch.trim() !== '') {
      const lower = descriptionSearch.toLowerCase();
      filtered = filtered.filter(sale => sale.description && sale.description.toLowerCase().includes(lower));
    }

    if (userSearch.trim() !== '') {
      const lower = userSearch.toLowerCase();
      filtered = filtered.filter(sale => {
        const email = sale.userEmail || '';
        const userName = email.includes('@') ? email.split('@')[0] : (sale.userEmail || sale.userId || 'Admin');
        return userName.toLowerCase().includes(lower);
      });
    }

    if (minAmount !== '') {
      filtered = filtered.filter(sale => Number(sale.amount || 0) >= Number(minAmount));
    }

    if (maxAmount !== '') {
      filtered = filtered.filter(sale => Number(sale.amount || 0) <= Number(maxAmount));
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(sale => {
        let status = 'Completed';
        if (sale.isRepair) {
          status = sale.status || 'Completed';
        } else {
          if (sale.paymentMethod === 'Credit' || sale.dueAmount > 0 || sale.status === 'Pending') {
            status = 'Credit';
          } else {
            status = 'Paid';
          }
        }
        return status.toUpperCase() === statusFilter.toUpperCase();
      });
    }

    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter(sale => {
        let badgeCategory = 'SALE';
        if (sale.isRepair) badgeCategory = 'REPAIR';
        else if (sale.cartItems && sale.cartItems.length > 0) {
          const cats = sale.cartItems.map(item => itemToCategoryMap[item.name]).filter(Boolean);
          if (cats.length > 0) badgeCategory = cats[0].toUpperCase();
        }
        return badgeCategory === categoryFilter || (categoryFilter === 'SALE' && badgeCategory !== 'REPAIR' && sale.isRepair === false);
      });
    }

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(sale => {
        const d = sale.timestamp ? (typeof sale.timestamp.toDate === 'function' ? sale.timestamp.toDate() : new Date(sale.timestamp.seconds ? sale.timestamp.seconds * 1000 : sale.timestamp)) : new Date();
        return d >= start;
      });
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(sale => {
        const d = sale.timestamp ? (typeof sale.timestamp.toDate === 'function' ? sale.timestamp.toDate() : new Date(sale.timestamp.seconds ? sale.timestamp.seconds * 1000 : sale.timestamp)) : new Date();
        return d <= end;
      });
    }

    return [...filtered].sort((a, b) => {
      const dateA = a.timestamp ? (typeof a.timestamp.toDate === 'function' ? a.timestamp.toDate() : new Date(a.timestamp.seconds ? a.timestamp.seconds * 1000 : a.timestamp)) : new Date(0);
      const dateB = b.timestamp ? (typeof b.timestamp.toDate === 'function' ? b.timestamp.toDate() : new Date(b.timestamp.seconds ? b.timestamp.seconds * 1000 : b.timestamp)) : new Date(0);
      return dateB - dateA;
    });
  }, [salesHistory, invoiceSearch, customerSearch, descriptionSearch, userSearch, minAmount, maxAmount, statusFilter, startDate, endDate, categoryFilter, itemToCategoryMap]);

  const totalFilteredAmount = filteredAndSortedSales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const totalFilteredIncome = filteredAndSortedSales.reduce((sum, s) => sum + getSaleIncome(s), 0);

  const totalPages = Math.ceil(filteredAndSortedSales.length / ITEMS_PER_PAGE);
  const paginatedSales = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedSales.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedSales, currentPage]);

  const clearFilters = () => {
    setInvoiceSearch('');
    setCustomerSearch('');
    setDescriptionSearch('');
    setUserSearch('');
    setMinAmount('');
    setMaxAmount('');
    setStatusFilter('ALL');
    setStartDate('');
    setEndDate('');
    setCategoryFilter('ALL');
    setCurrentPage(1);
  };

  return (
    <div className="p-4 space-y-4 w-full relative z-10 h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar flex flex-col">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 shrink-0 mb-4 px-2 md:px-4">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-xl font-black text-slate-100 uppercase tracking-widest flex items-center gap-3">
            <FileText className="w-8 h-8 text-emerald-400" />
            HISTORY REPORT
          </h1>
          <div className="relative group cursor-help mt-1">
            <HelpCircle className="w-5 h-5 text-slate-500 hover:text-slate-300 transition-colors" />
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 w-max max-w-xs px-3 py-2 bg-slate-800/95 backdrop-blur text-slate-200 text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-xl border border-slate-700 z-50">
              View all sales and repair history
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-lg border transition-all shadow-sm relative ${isFiltersOpen ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-700 hover:text-slate-200 hover:border-slate-600'}`}
            title="Filters"
          >
            <Filter className="w-4 h-4" />
            {(invoiceSearch || customerSearch || descriptionSearch || userSearch || minAmount || maxAmount || statusFilter !== 'ALL' || categoryFilter !== 'ALL' || startDate || endDate) && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500"></span>
            )}
          </button>
        </div>
      </div>

      {/* FILTER SECTION */}
      {isFiltersOpen && (
        <div className="mb-6 bg-slate-900/50 backdrop-blur-md border border-indigo-500/20 rounded-2xl p-5 shadow-lg shrink-0 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Invoice</label>
              <input 
                type="text" 
                placeholder="Invoice No" 
                value={invoiceSearch}
                onChange={(e) => { setInvoiceSearch(e.target.value); setCurrentPage(1); }}
                className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/50 w-full"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
              <select 
                value={categoryFilter} 
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/50 w-full appearance-none"
              >
                <option value="ALL">All Categories</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Customer</label>
              <input 
                type="text" 
                placeholder="Customer Name" 
                value={customerSearch}
                onChange={(e) => { setCustomerSearch(e.target.value); setCurrentPage(1); }}
                className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/50 w-full"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
              <input 
                type="text" 
                placeholder="Description" 
                value={descriptionSearch}
                onChange={(e) => { setDescriptionSearch(e.target.value); setCurrentPage(1); }}
                className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/50 w-full"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">User</label>
              <input 
                type="text" 
                placeholder="User/Admin" 
                value={userSearch}
                onChange={(e) => { setUserSearch(e.target.value); setCurrentPage(1); }}
                className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/50 w-full"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Status</label>
              <select 
                value={statusFilter} 
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/50 w-full appearance-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="PAID">Paid</option>
                <option value="CREDIT">Credit</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="IN PROGRESS">In Progress</option>
                <option value="READY">Ready</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1/2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Min Amount</label>
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={minAmount}
                  onChange={(e) => { setMinAmount(e.target.value); setCurrentPage(1); }}
                  className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/50 w-full"
                />
              </div>
              <div className="w-1/2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Max Amount</label>
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={maxAmount}
                  onChange={(e) => { setMaxAmount(e.target.value); setCurrentPage(1); }}
                  className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/50 w-full"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1/2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Start Date</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                  className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/50 w-full [color-scheme:dark]"
                />
              </div>
              <div className="w-1/2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">End Date</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                  className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/50 w-full [color-scheme:dark]"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button 
              onClick={clearFilters}
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-md hover:bg-red-500/10"
            >
              <X className="w-3 h-3" /> Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="flex-1 min-h-0 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-950/80 sticky top-0 z-10 border-b border-white/10 backdrop-blur-md">
              <tr>
                <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Invoice</th>
                <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Category</th>
                <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Date & Time</th>
                <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Customer</th>
                <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-1/4">Description</th>
                <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">User</th>
                <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Amount (Rs)</th>
                <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Status</th>
                <th className="px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-16 text-center text-slate-500">
                    <HistoryIcon className="w-12 h-12 text-slate-700 mx-auto mb-4 opacity-50" />
                    <span className="text-base font-bold text-slate-400">No records found</span>
                    <p className="text-xs mt-1">Try adjusting your filters or search term.</p>
                  </td>
                </tr>
              ) : (
                paginatedSales.map((sale) => {
                  const dateObj = sale.timestamp ? (typeof sale.timestamp.toDate === 'function' ? sale.timestamp.toDate() : new Date(sale.timestamp.seconds ? sale.timestamp.seconds * 1000 : sale.timestamp)) : new Date();
                  const dateStr = format(dateObj, 'MMM d, yyyy');
                  const timeStr = format(dateObj, 'h:mm a');
                  const email = sale.userEmail || '';
                  const userName = email.includes('@') ? email.split('@')[0] : (sale.userEmail || sale.userId || 'Admin');
                  const income = getSaleIncome(sale);

                  let badgeCategory = 'SALE';
                  if (sale.isRepair) {
                    badgeCategory = 'REPAIR';
                  } else if (sale.cartItems && sale.cartItems.length > 0) {
                    const cats = sale.cartItems.map(item => itemToCategoryMap[item.name]).filter(Boolean);
                    if (cats.length > 0) {
                      badgeCategory = cats[0].toUpperCase();
                    }
                  }

                  const invoiceNo = sale.invoiceNo || sale.id.slice(0, 6).toUpperCase();
                  const totalQty = sale.isRepair ? 1 : (sale.cartItems?.reduce((sum, item) => sum + Number(item.qty || 1), 0) || 1);
                  
                  let status = 'Completed';
                  let statusColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                  
                  if (sale.isRepair) {
                    status = sale.status || 'Completed';
                    if (status === 'Pending' || status === 'In Progress') statusColor = 'bg-orange-500/10 text-orange-400 border-orange-500/20';
                    else if (status === 'Ready') statusColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                    else if (status === 'Cancelled') statusColor = 'bg-red-500/10 text-red-400 border-red-500/20';
                  } else {
                    if (sale.paymentMethod === 'Credit' || sale.dueAmount > 0 || sale.status === 'Pending') {
                      status = 'Credit';
                      statusColor = 'bg-red-500/10 text-red-400 border-red-500/20';
                    } else {
                      status = 'Paid';
                    }
                  }

                  return (
                    <tr key={sale.id} className="hover:bg-slate-800/50 transition-colors group">
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className="text-xs font-mono font-bold text-slate-400">#{invoiceNo}</span>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${sale.isRepair ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                          {badgeCategory}
                        </span>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="text-xs font-bold text-slate-200">{dateStr}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">{timeStr}</div>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        {sale.customerName ? (
                          <div className="text-xs font-bold text-slate-200">{sale.customerName}</div>
                        ) : (
                          <div className="text-xs font-semibold text-slate-500">-</div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-xs font-bold text-slate-200 line-clamp-2">{sale.description}</div>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                           <User className="w-3 h-3" /> {userName}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <div className="text-xs font-black text-slate-100">Rs. {Number(sale.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        {isAdmin && (
                          <div className="text-[10px] font-black text-emerald-400/80 mt-0.5">
                            Inc: Rs. {income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center whitespace-nowrap">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${statusColor}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 transition-opacity">
                          <button
                            onClick={() => handlePrint(sale)}
                            className="text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 p-1.5 rounded-lg transition-all"
                            title="Print Receipt"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSale(sale.id)}
                            className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-all"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => sendWhatsAppSale(sale)}
                            className="text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 p-1.5 rounded-lg transition-all"
                            title="Send WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredAndSortedSales.length > 0 && (
              <tfoot className="bg-slate-950/90 sticky bottom-0 border-t border-white/10 backdrop-blur-md">
                <tr>
                  <td colSpan={6} className="px-5 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">
                    Report Totals:
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <div className="text-sm font-black text-slate-100">Rs. {totalFilteredAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    {isAdmin && (
                      <div className="text-[10px] font-black text-emerald-400/80 mt-0.5">
                        Inc: Rs. {totalFilteredIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    )}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        
        {/* PAGINATION CONTROLS */}
        {filteredAndSortedSales.length > 0 && (
          <div className="bg-slate-950/80 border-t border-white/10 px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
            <div className="text-xs font-bold text-slate-400">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedSales.length)} of {filteredAndSortedSales.length} records
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
              >
                Previous
              </button>
              <span className="text-xs font-bold text-slate-200">
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
