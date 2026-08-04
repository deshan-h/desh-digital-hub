import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Trash2, ShoppingCart, ArrowUpRight, Search, Filter, User, History as HistoryIcon, Printer, ChevronDown } from 'lucide-react';
import { generateInvoiceHtml } from '../../utils/invoiceTemplate';

export default function History({ salesHistory, fetchSales, handleDeleteSale, user, posCategories = [], isAdmin }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDates, setExpandedDates] = useState({
    [format(new Date(), 'MMM d, yyyy')]: true
  });

  const toggleDate = (dateStr) => {
    setExpandedDates(prev => ({ ...prev, [dateStr]: !prev[dateStr] }));
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

  // Helper to calculate Net Income of a single sale
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
    if (searchTerm.trim() !== '') {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(sale => 
        (sale.description && sale.description.toLowerCase().includes(lower)) ||
        (sale.customerName && sale.customerName.toLowerCase().includes(lower))
      );
    }
    return [...filtered].sort((a, b) => {
      const dateA = a.timestamp ? (typeof a.timestamp.toDate === 'function' ? a.timestamp.toDate() : new Date(a.timestamp.seconds ? a.timestamp.seconds * 1000 : a.timestamp)) : new Date(0);
      const dateB = b.timestamp ? (typeof b.timestamp.toDate === 'function' ? b.timestamp.toDate() : new Date(b.timestamp.seconds ? b.timestamp.seconds * 1000 : b.timestamp)) : new Date(0);
      return dateB - dateA;
    });
  }, [salesHistory, searchTerm]);

  return (
    <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <HistoryIcon className="w-6 h-6 text-indigo-400" />
          <h2 className="text-2xl font-black text-white uppercase tracking-widest">All History</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search history..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900/80 border border-slate-700 text-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm font-semibold focus:outline-none focus:border-indigo-500/50 transition-all w-full sm:w-64 shadow-inner"
            />
          </div>
          <button className="flex items-center gap-2 bg-slate-900/80 border border-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm">
            <Filter className="w-4 h-4" /> FILTERS
          </button>
          <button onClick={fetchSales} className="bg-slate-900/80 hover:bg-slate-800 text-indigo-400 px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-slate-700 shadow-sm whitespace-nowrap">
            Refresh
          </button>
        </div>
      </div>

      {filteredAndSortedSales.length === 0 ? (
        <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-16 text-center text-slate-500 shadow-lg flex flex-col items-center justify-center">
          <ShoppingCart className="w-16 h-16 text-slate-700 mb-6 opacity-50" />
          <span className="text-lg font-bold tracking-wide text-slate-400">No history records found.</span>
          <p className="text-sm mt-2">Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div className="bg-slate-900/30 backdrop-blur-md rounded-3xl border border-white/5 p-6 sm:p-8 shadow-2xl">
          <div className="relative border-l border-slate-700/50 ml-24 sm:ml-28 space-y-4">
            {(() => {
              const groupedSales = {};
              filteredAndSortedSales.forEach(sale => {
                const date = sale.timestamp ? (typeof sale.timestamp.toDate === 'function' ? sale.timestamp.toDate() : new Date(sale.timestamp.seconds ? sale.timestamp.seconds * 1000 : sale.timestamp)) : new Date();
                const dateStr = format(date, 'MMM d, yyyy');
                if (!groupedSales[dateStr]) groupedSales[dateStr] = [];
                groupedSales[dateStr].push({ ...sale, _parsedDate: date });
              });

              return Object.entries(groupedSales).map(([dateStr, sales]) => {
                const isExpanded = expandedDates[dateStr];
                
                return (
                  <div key={dateStr} className="relative pb-6">
                    {/* Date Header */}
                    <div 
                      className="relative flex items-center cursor-pointer group"
                      onClick={() => toggleDate(dateStr)}
                    >
                      <div className="absolute -left-[120px] sm:-left-[140px] w-24 sm:w-28 text-right flex flex-col pr-4">
                        <span className="text-emerald-400 text-[11px] sm:text-[12px] font-black uppercase tracking-wider">{dateStr}</span>
                      </div>
                      
                      <div className="absolute -left-[14px] w-7 h-7 rounded-full bg-slate-900 border-2 border-emerald-500/50 flex items-center justify-center z-10 shadow-[0_0_10px_rgba(16,185,129,0.2)] group-hover:border-emerald-400 group-hover:bg-emerald-900/50 transition-all">
                        <ChevronDown className={`w-4 h-4 text-emerald-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>

                      <div className="ml-6 sm:ml-8 text-slate-500 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider group-hover:text-emerald-400/70 transition-colors">
                        {sales.length} Record{sales.length !== 1 ? 's' : ''}
                      </div>
                    </div>

                    {/* Sales List */}
                    {isExpanded && (
                      <div className="mt-6 space-y-4">
                        {sales.map(sale => {
                          const timeStr = format(sale._parsedDate, 'h:mm a');
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

                          return (
                            <div key={sale.id} className="relative flex items-center group">
                              <div className="absolute -left-[120px] sm:-left-[140px] w-24 sm:w-28 text-right flex flex-col pr-4">
                                <span className="text-slate-500 text-[9px] sm:text-[10px] font-bold tracking-widest">{timeStr}</span>
                              </div>

                              <div className="absolute -left-[9px] w-4 h-4 rounded-full bg-slate-950 border-2 border-slate-700 flex items-center justify-center z-10 group-hover:border-emerald-500/50 group-hover:bg-emerald-500/10 transition-all">
                                <ArrowUpRight className="w-2 h-2 text-emerald-500/50 hidden group-hover:block" />
                              </div>

                              <div className="flex-1 ml-6 sm:ml-8 flex flex-row items-center gap-3 sm:gap-5 hover:bg-slate-800/30 py-2.5 px-4 rounded-xl transition-all border border-transparent hover:border-slate-700/50 overflow-hidden">
                                <div className="flex items-center gap-2 shrink-0">
                                   <span className="bg-emerald-500/10 text-emerald-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-emerald-500/20 shadow-sm w-36 truncate text-center" title={badgeCategory}>
                                     {badgeCategory}
                                   </span>
                                   <span className="bg-slate-800 text-slate-300 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm w-16 sm:w-20 text-center truncate" title={userName}>
                                     {userName}
                                   </span>
                                </div>
                                
                                <div className="flex-1 min-w-0 flex flex-row items-center gap-3">
                                   <span className="text-slate-200 text-[12px] sm:text-[13px] font-bold truncate">{sale.description}</span>
                                   {sale.customerName && (
                                     <span className="text-slate-500 text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 shrink-0 bg-slate-900/50 px-2 py-1 rounded-md border border-slate-800">
                                       <User className="w-3 h-3" /> {sale.customerName}
                                     </span>
                                   )}
                                </div>
                                
                                <div className="flex items-center gap-4 shrink-0 bg-slate-950/50 px-4 py-1.5 rounded-lg border border-white/5">
                                   <div className="flex items-center gap-2 text-right">
                                     <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest hidden sm:block">Sale</span>
                                     <span className="text-[12px] font-black text-slate-300 whitespace-nowrap">Rs. {Number(sale.amount).toFixed(2)}</span>
                                   </div>
                                   {isAdmin && (
                                     <>
                                       <div className="w-px h-6 bg-slate-800"></div>
                                       <div className="flex items-center gap-2 text-right">
                                         <span className="text-[9px] text-emerald-500/60 font-bold uppercase tracking-widest hidden sm:block">Inc</span>
                                         <span className="text-[12px] font-black text-emerald-400 whitespace-nowrap">+Rs. {income.toFixed(2)}</span>
                                       </div>
                                     </>
                                   )}
                                </div>
                                
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => handlePrint(sale)}
                                    className="text-slate-600 hover:text-cyan-400 hover:bg-cyan-500/10 p-2 rounded-lg transition-all border border-transparent hover:border-cyan-500/20"
                                    title="Print Receipt"
                                  >
                                    <Printer className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSale(sale.id)}
                                    className="text-slate-600 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-all border border-transparent hover:border-red-500/20"
                                    title="Delete Record"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
