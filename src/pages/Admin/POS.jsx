import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  Search, 
  Package, 
  RefreshCw, 
  Save, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp,
  ChevronDown,
  X, 
  Printer,
  Minus,
  Zap,
  CheckCircle2,
  Receipt,
  Percent
} from 'lucide-react';
import { notify } from '../../utils/toast';
import { parseTimestamp } from '../../utils/helpers';
import { generateInvoiceHtml, generateUtilityReceiptHtml } from '../../utils/invoiceTemplate';
import { 
  customerService, 
  salesService, 
  duesService, 
  categoryService, 
  pendingOrderService, 
  settingsService 
} from '../../services/supabaseService';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import { POSItem, CategoryTab, CartItem, POSItemsGrid, CustomerInput, POSReminderModal } from './POSComponents';

export default function POS({
  cart,
  addToCart,
  updateCartItem,
  removeFromCart,
  setCart,
  cartTotal,
  handleCheckout,
  checkoutLoading,
  whatsappNumber,
  setWhatsappNumber,
  sendWhatsAppBill,
  posCategories = [],
  customersList = [],
  fetchCustomersList,
  salesHistory = [],
  customerDuesList = [],
  refreshPOSData,
  pendingOrders = [],
  showPendingOrdersModal,
  setShowPendingOrdersModal,
  todaySalesSum = 0,
  totalPendingDues = 0
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef(null);

  // Utility Bill Payment state
  const [isUtilityOpen, setIsUtilityOpen] = useState(false);
  const [utilityProvider, setUtilityProvider] = useState('CEB Electricity');
  const [utilityAmount, setUtilityAmount] = useState('');
  const [utilityAccountNo, setUtilityAccountNo] = useState('');
  const [utilityRefNo, setUtilityRefNo] = useState('');
  const [utilitySaving, setUtilitySaving] = useState(false);
  const utilityDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (utilityDropdownRef.current && !utilityDropdownRef.current.contains(event.target)) {
        setIsUtilityOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSaveUtilityBill = async (shouldPrint = false) => {
    const billAmt = Number(utilityAmount || 0);
    if (!billAmt || billAmt <= 0) {
      notify.error("කරුණාකර ගෙවන ලද බිල්පත් මුදල (Bill Amount) ඇතුළත් කරන්න.");
      return;
    }

    setUtilitySaving(true);
    try {
      const accNo = utilityAccountNo.trim();
      const refNo = utilityRefNo.trim();
      const desc = `Utility Bill - ${utilityProvider}${accNo ? ' | A/C: ' + accNo : ''}${refNo ? ' | Ref: ' + refNo : ''} (Bill: Rs ${billAmt.toFixed(2)})`;

      const newSale = await salesService.createSale({
        amount: 50, // Rs. 50 service charge added directly to sales
        discount: 0,
        description: desc,
        cartItems: [{
          id: 'utility-' + Date.now(),
          name: `${utilityProvider} Bill Payment`,
          price: 50,
          qty: 1,
          billAmount: billAmt,
          accountNumber: accNo,
          referenceNumber: refNo,
          provider: utilityProvider,
          isUtility: true
        }],
        customerName: customerName.trim() || 'Utility Customer',
        customerPhone: whatsappNumber || '',
        isCredit: false
      });

      notify.success(`Utility Bill saved! Rs. 50.00 added to Today's Sales.`);

      if (shouldPrint) {
        const saleForPrint = {
          id: newSale?.id || 'UB' + Date.now().toString().slice(-6),
          timestamp: new Date(),
          customerName: customerName.trim() || 'Utility Customer',
          amount: 50,
          description: desc,
          cartItems: [{
            id: 'utility-' + Date.now(),
            name: `${utilityProvider} Bill Payment`,
            price: 50,
            qty: 1,
            billAmount: billAmt,
            accountNumber: accNo,
            referenceNumber: refNo,
            provider: utilityProvider,
            isUtility: true
          }]
        };

        const printWindow = window.open('', '_blank');
        const html = generateUtilityReceiptHtml(saleForPrint);
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }

      setUtilityAmount('');
      setUtilityAccountNo('');
      setUtilityRefNo('');
      setIsUtilityOpen(false);
      if (refreshPOSData) refreshPOSData();
    } catch (err) {
      console.error(err);
      notify.error("Failed to save utility bill payment");
    } finally {
      setUtilitySaving(false);
    }
  };

  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [discount, setDiscount] = useState('');
  const [discountPercent, setDiscountPercent] = useState(null);
  const [isPricingExpanded, setIsPricingExpanded] = useState(false);
  const [cashGiven, setCashGiven] = useState('');
  const [isCredit, setIsCredit] = useState(false);
  const [includePreviousArrears, setIncludePreviousArrears] = useState(true);
  const [keepChangeAsAdvance, setKeepChangeAsAdvance] = useState(false);

  // Favorite Customers
  const [favoriteCustomerNames, setFavoriteCustomerNames] = useState(() => {
    const cached = localStorage.getItem('favoriteCustomers');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    if (customersList && customersList.length > 0) {
      return customersList.filter(c => c.mostVisited).map(c => c.name);
    }
    return [];
  });

  useEffect(() => {
    if (customersList && customersList.length > 0) {
      const dbFavs = customersList.filter(c => c.mostVisited).map(c => c.name);
      setFavoriteCustomerNames(dbFavs);
      localStorage.setItem('favoriteCustomers', JSON.stringify(dbFavs));
    }
  }, [customersList]);

  // Favorite Items
  const [favoriteItemIds, setFavoriteItemIds] = useState(() => {
    const saved = localStorage.getItem('posFavorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const loadSavedFavorites = async () => {
      try {
        const data = await settingsService.getSetting('pos_favorites');
        if (data && Array.isArray(data.itemIds)) {
          setFavoriteItemIds(data.itemIds);
          localStorage.setItem('posFavorites', JSON.stringify(data.itemIds));
        }
      } catch (e) {
        console.error("Error loading POS favorites from Supabase", e);
      }
    };
    loadSavedFavorites();
  }, []);

  const toggleFavorite = useCallback(async (e, item) => {
    e.stopPropagation();
    const itemId = item.id;
    let updated;
    if (favoriteItemIds.includes(itemId)) {
      updated = favoriteItemIds.filter(id => id !== itemId);
    } else {
      updated = [...favoriteItemIds, itemId];
    }
    setFavoriteItemIds(updated);
    localStorage.setItem('posFavorites', JSON.stringify(updated));

    try {
      await settingsService.setSetting('pos_favorites', { itemIds: updated });
    } catch (err) {
      console.error("Error saving POS favorites list to DB", err);
    }
  }, [favoriteItemIds]);

  // Categories & Items
  const allItems = useMemo(() => {
    return posCategories.flatMap(c => c.items || []);
  }, [posCategories]);

  const displayCategories = useMemo(() => {
    const favItems = allItems.filter(item => 
      item.isFavorite === true || item.favorite === true || favoriteItemIds.includes(item.id)
    );

    const favCategory = {
      id: 'favorites',
      category: 'Favorites',
      icon: 'Star',
      items: favItems
    };

    return [favCategory, ...posCategories];
  }, [posCategories, allItems, favoriteItemIds]);

  const activeCategory = displayCategories[activeCategoryIndex] || null;

  const filteredItems = useMemo(() => {
    return searchQuery.trim() !== ''
      ? allItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : (activeCategory ? activeCategory.items : []);
  }, [allItems, activeCategory, searchQuery]);

  // Category horizontal scroll & hover scroll
  const categoryScrollRef = useRef(null);
  const scrollIntervalRef = useRef(null);

  const startHoverScroll = useCallback((direction) => {
    if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    scrollIntervalRef.current = setInterval(() => {
      if (categoryScrollRef.current) {
        categoryScrollRef.current.scrollBy({ 
          left: direction === 'left' ? -18 : 18, 
          behavior: 'auto' 
        });
      }
    }, 20);
  }, []);

  const stopHoverScroll = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, []);

  const scrollCategories = useCallback((direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, []);

  // Pending sales state
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingToDelete, setPendingToDelete] = useState(null);

  // Customer Arrears & Advance calculation
  const customerBalance = useMemo(() => {
    if (!customerName || customerName.trim() === '') return 0;
    const nameMatch = customerName.trim().toLowerCase();

    return customerDuesList
      .filter(due => due.name && due.name.toLowerCase() === nameMatch)
      .reduce((sum, due) => {
        if (due.type === 'Payment') {
          return sum - Number(due.amount || 0);
        } else if (due.status === 'Pending') {
          return sum + Number(due.amount || 0);
        }
        return sum;
      }, 0);
  }, [customerName, customerDuesList]);

  const currentCustomerArrears = Math.max(0, customerBalance);
  const currentCustomerAdvance = Math.max(0, -customerBalance);

  // Print Invoice
  const handlePrint = (customSaleData = null) => {
    if (cart.length === 0 && !customSaleData) {
      notify.error("Cart is empty");
      return;
    }
    const sale = customSaleData || {
      id: Math.random().toString(36).substring(2, 8).toUpperCase(),
      timestamp: new Date(),
      customerName: customerName || 'Valued Customer',
      cartItems: cart,
      amount: Math.max(0, cartTotal - Number(discount || 0)),
      description: 'POS Sale'
    };

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

  // Complete Order
  const handleCompleteOrder = async () => {
    if (cart.length === 0) {
      notify.error("Please add products or services to the cart first.");
      return;
    }

    const success = await handleCheckout(
      customerName, 
      discount, 
      isCredit, 
      cashGiven, 
      includePreviousArrears ? currentCustomerArrears : 0, 
      currentCustomerAdvance, 
      keepChangeAsAdvance
    );

    if (success) {
      // Print removed from POS checkout as requested; printable from Sales History
      setCashGiven('');
      setCustomerName('');
      setDiscount('');
      setDiscountPercent(null);
      setIsPricingExpanded(false);
      setIsCredit(false);
      setKeepChangeAsAdvance(false);
      setIncludePreviousArrears(true);
    }
  };

  // Direct Save Pending Sale (No separate modal; requires Customer Name)
  const handleDirectSavePending = async () => {
    if (cart.length === 0) {
      notify.error("Cart is empty. Please add items to save as pending sale.");
      return;
    }

    const trimmedName = customerName.trim();
    if (!trimmedName) {
      notify.error("Customer Name is required to save as pending sale!");
      const input = document.getElementById('pos-customer-name-input');
      if (input) {
        input.focus();
        input.classList.add('ring-2', 'ring-rose-500');
        setTimeout(() => input.classList.remove('ring-2', 'ring-rose-500'), 2500);
      }
      return;
    }

    setPendingLoading(true);
    try {
      await pendingOrderService.createPendingOrder({
        note: trimmedName,
        phone: whatsappNumber || '',
        items: cart,
        totalAmount: cartTotal,
        discount: Number(discount) || 0
      });
      notify.success(`Sale for "${trimmedName}" saved as pending!`);
      setCart([]);
      setCustomerName('');
      setWhatsappNumber('');
      setDiscount('');
      setDiscountPercent(null);
      setIsPricingExpanded(false);
      setCashGiven('');
      if (refreshPOSData) refreshPOSData();
    } catch (error) {
      console.error(error);
      notify.error("Failed to save pending sale");
    } finally {
      setPendingLoading(false);
    }
  };

  // Resume Pending Sale from Navbar Dropdown
  useEffect(() => {
    const handleResumePending = async (e) => {
      const order = e.detail;
      if (!order) return;
      if (order.items && Array.isArray(order.items)) {
        setCart(order.items);
      }
      if (order.note) {
        setCustomerName(order.note);
      }
      if (order.phone) {
        setWhatsappNumber(order.phone);
      }
      if (order.discount) {
        setDiscount(String(order.discount));
        setDiscountPercent(null);
      }
      notify.success(`Loaded pending sale for "${order.note || 'customer'}"`);

      try {
        await pendingOrderService.deletePendingOrder(order.id);
        if (refreshPOSData) refreshPOSData();
      } catch (err) {
        console.error("Error removing resumed pending order", err);
      }
    };

    window.addEventListener('pos-resume-pending-sale', handleResumePending);
    return () => window.removeEventListener('pos-resume-pending-sale', handleResumePending);
  }, [setCart, setCustomerName, setWhatsappNumber, setDiscount, refreshPOSData]);

  // Calculations
  const rawSubTotal = cartTotal;

  // Handle % discount application
  const handleApplyPercentDiscount = (customPct = null) => {
    const pct = customPct !== null ? Number(customPct) : Number(discount || 0);

    if (!pct || pct <= 0) {
      notify.error("කරුණාකර Discount ප්‍රතිශතය (%) ඇතුළත් කරන්න (උදා: 10)");
      return;
    }
    if (!rawSubTotal || rawSubTotal <= 0) {
      notify.error("Discount යෙදීමට පෙර භාණ්ඩ Cart එකට එකතු කරන්න");
      return;
    }
    if (pct > 100) {
      notify.error("Discount ප්‍රතිශතය 100% කට වඩා වැඩි විය නොහැක");
      return;
    }

    const calculatedAmt = Math.round(((rawSubTotal * pct) / 100) * 100) / 100;
    setDiscount(calculatedAmt % 1 === 0 ? String(calculatedAmt) : calculatedAmt.toFixed(2));
    setDiscountPercent(pct);
    notify.success(`${pct}% Discount (Rs ${calculatedAmt.toFixed(2)}) applied!`);
  };

  // Re-calculate % discount when subtotal changes, if a percentage was applied
  useEffect(() => {
    if (discountPercent !== null && rawSubTotal > 0) {
      const calculatedAmt = Math.round(((rawSubTotal * discountPercent) / 100) * 100) / 100;
      setDiscount(calculatedAmt % 1 === 0 ? String(calculatedAmt) : calculatedAmt.toFixed(2));
    }
  }, [rawSubTotal, discountPercent]);

  const discountVal = Number(discount || 0);
  const finalPayable = Math.max(0, rawSubTotal - discountVal) + (includePreviousArrears ? currentCustomerArrears : 0) - currentCustomerAdvance;
  const cashVal = cashGiven === '' ? 0 : Number(cashGiven);
  const cashDiff = cashVal - Math.max(0, finalPayable);

  return (
    <div className="w-full h-full flex flex-col space-y-2 overflow-hidden">

      {/* Main 2-Column Split POS Layout (Full Viewport Constrained) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch flex-1 min-h-0 overflow-hidden">
        
        {/* ======================================================== */}
        {/* LEFT SIDE (65% Width): Categories + POS Items + Customer */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-2 h-full min-h-0 overflow-hidden">
          
          {/* Top Bar: Search (Collapsible) + Utility Bill + Custom Item + Refresh + Categories */}
          <div className="relative z-20 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-2.5 sm:p-3 shadow-xl space-y-2.5 shrink-0 overflow-visible">
            
            <div className="flex items-center gap-2">
              {/* Collapsible Search Bar */}
              <div className="relative">
                {isSearchExpanded || searchQuery ? (
                  <div className="relative flex items-center animate-in fade-in zoom-in-95 duration-150">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="w-44 sm:w-60 md:w-64 bg-[#090d16] border border-blue-500/50 focus:border-blue-400 rounded-xl pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all shadow-md"
                    />
                    <button 
                      onClick={() => {
                        setSearchQuery('');
                        setIsSearchExpanded(false);
                      }}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Close search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsSearchExpanded(true);
                      setTimeout(() => searchInputRef.current?.focus(), 50);
                    }}
                    className="w-8 h-8 rounded-xl bg-[#090d16] hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40 text-slate-400 hover:text-sky-400 flex items-center justify-center transition-all cursor-pointer shadow-sm group"
                    title="Search items (Click to expand)"
                  >
                    <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </button>
                )}
              </div>

              {/* Utility Bill Payment Button & Dropdown */}
              <div className="relative z-40" ref={utilityDropdownRef}>
                <button
                  onClick={() => setIsUtilityOpen(!isUtilityOpen)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                    isUtilityOpen 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10' 
                      : 'bg-[#090d16] hover:bg-slate-800 text-amber-400 border-slate-800 hover:border-amber-500/40'
                  }`}
                  title="Issue Utility Bill Payment (CEB, Water, Telecom, etc.)"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Utility Bill</span>
                </button>

                {isUtilityOpen && (
                  <div className="absolute left-0 mt-2 w-80 sm:w-88 bg-[#0c1222] border border-amber-500/40 rounded-2xl shadow-2xl p-3.5 z-50 backdrop-blur-xl animate-in fade-in duration-150 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-100">Utility Bill Payment</h4>
                          <p className="text-[10px] text-slate-400">Issue customer utility payment receipt</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsUtilityOpen(false)}
                        className="text-slate-400 hover:text-white cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Provider Select */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                        Utility Provider <span className="text-rose-400">*</span>
                      </label>
                      <select
                        value={utilityProvider}
                        onChange={(e) => setUtilityProvider(e.target.value)}
                        className="w-full bg-[#090d16] border border-slate-800 focus:border-amber-500/60 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
                      >
                        <option value="CEB Electricity">CEB Electricity Bill</option>
                        <option value="LECO Electricity">LECO Electricity Bill</option>
                        <option value="Water Board">National Water Board Bill</option>
                        <option value="SLT Mobitel">SLT Mobitel Telecom Bill</option>
                        <option value="Dialog Axiata">Dialog Axiata Bill / TV</option>
                        <option value="Mobitel Postpaid">Mobitel Postpaid / Reload</option>
                        <option value="Airtel / Hutch">Airtel / Hutch Bill</option>
                        <option value="Other Utility">Other Utility Bill</option>
                      </select>
                    </div>

                    {/* Bill Amount Input (Required) */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                          Bill Amount (Rs) <span className="text-amber-400 font-bold">*</span>
                        </label>
                        <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                          Required
                        </span>
                      </div>
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 1500.00"
                        value={utilityAmount}
                        onChange={(e) => setUtilityAmount(e.target.value)}
                        className="w-full bg-[#090d16] border border-amber-500/40 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-amber-300 focus:outline-none shadow-inner"
                      />
                    </div>

                    {/* Account Number (Optional) */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                        Account Number <span className="text-slate-500 lowercase">(optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 10492830 / 037..."
                        value={utilityAccountNo}
                        onChange={(e) => setUtilityAccountNo(e.target.value)}
                        className="w-full bg-[#090d16] border border-slate-800 focus:border-amber-500/60 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                      />
                    </div>

                    {/* Reference Number (Optional) */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                        Reference Number <span className="text-slate-500 lowercase">(optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. TXN-89412 / Ref No"
                        value={utilityRefNo}
                        onChange={(e) => setUtilityRefNo(e.target.value)}
                        className="w-full bg-[#090d16] border border-slate-800 focus:border-amber-500/60 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                      />
                    </div>

                    {/* Dual Action Buttons: Save & Print vs Save Only */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handleSaveUtilityBill(true)}
                        disabled={utilitySaving}
                        className="w-full py-2.5 px-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                        title="Save to sales and immediately print utility payment receipt"
                      >
                        <Printer className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Save & Print</span>
                      </button>

                      <button
                        onClick={() => handleSaveUtilityBill(false)}
                        disabled={utilitySaving}
                        className="w-full py-2.5 px-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                        title="Save to Today's Sales (+Rs 50)"
                      >
                        <Save className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Save Only</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Custom Item Button */}
              <button
                onClick={() => addToCart({
                  id: 'custom-' + Date.now(),
                  name: 'Custom Service / Item',
                  price: 0,
                  qty: 1
                })}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#090d16] hover:bg-slate-800 text-sky-400 border border-slate-800 hover:border-sky-500/40 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
                title="Add Custom Item with manual price"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Custom Item</span>
              </button>

              <div className="flex-1"></div>

              {/* Refresh Button */}
              <button
                onClick={() => {
                  if (refreshPOSData) refreshPOSData();
                  setSearchQuery('');
                  notify.success("POS Data Refreshed!");
                }}
                className="p-1.5 bg-[#090d16] hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-xl transition-colors cursor-pointer shrink-0"
                title="Refresh Items"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Categories Slider with Frozen Favorites */}
            <div className="relative flex items-center gap-1.5 pt-0.5">
              
              {/* Frozen / Pinned Favorites Star Button */}
              <button
                onClick={() => {
                  setActiveCategoryIndex(0);
                  setSearchQuery('');
                }}
                title="Favorites"
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center justify-center gap-1 border ${
                  activeCategoryIndex === 0
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20 border-amber-400/60 font-black'
                    : 'bg-[#090d16] hover:bg-slate-800 text-amber-400 border-slate-800 hover:border-amber-500/40'
                }`}
              >
                <Star className="w-4 h-4 fill-current shrink-0" />
              </button>

              {/* Subtle Divider */}
              <div className="h-4 w-[1px] bg-slate-800 shrink-0 mx-0.5"></div>

              {/* Left Scroll Button */}
              <button
                onClick={() => scrollCategories('left')}
                onMouseEnter={() => startHoverScroll('left')}
                onMouseLeave={stopHoverScroll}
                className="shrink-0 w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
                title="Scroll left (Hover or click)"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Scrollable Categories List (Favorites excluded from scrolling) */}
              <div
                ref={categoryScrollRef}
                className="flex overflow-x-auto gap-1.5 py-0.5 no-scrollbar flex-1 scroll-smooth"
              >
                {posCategories.map((cat, idx) => {
                  const actualIndex = idx + 1; // 0 is favorites
                  const isActive = activeCategoryIndex === actualIndex;
                  return (
                    <button
                      key={cat.id || idx}
                      onClick={() => {
                        setActiveCategoryIndex(actualIndex);
                        setSearchQuery('');
                      }}
                      title={cat.category}
                      className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer flex items-center justify-center gap-1.5 ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md shadow-blue-600/30 border border-blue-400/30' 
                          : 'bg-[#090d16] hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-800/70 font-semibold'
                      }`}
                    >
                      <span>{cat.category}</span>
                    </button>
                  );
                })}
              </div>

              {/* Right Scroll Button */}
              <button
                onClick={() => scrollCategories('right')}
                onMouseEnter={() => startHoverScroll('right')}
                onMouseLeave={stopHoverScroll}
                className="shrink-0 w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
                title="Scroll right (Hover or click)"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Services & Products Items Grid */}
          <div className="relative z-10 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-2.5 sm:p-3 shadow-xl flex-1 min-h-0 flex flex-col overflow-hidden">
            <POSItemsGrid
              filteredItems={filteredItems}
              handleAddToCart={addToCart}
              favoriteItemIds={favoriteItemIds}
              toggleFavorite={toggleFavorite}
              activeCategory={activeCategory}
              searchQuery={searchQuery}
            />
          </div>

          {/* Customer Details Box (Placed Under POS Items Box) */}
          <div className="relative z-30 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-2.5 sm:p-3 shadow-xl space-y-2 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Customer Details <span className="text-rose-400">*</span>
              </span>
              {currentCustomerArrears > 0 && (
                <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-md">
                  Due: Rs {currentCustomerArrears.toFixed(0)}
                </span>
              )}
            </div>

            <CustomerInput
              customerName={customerName}
              setCustomerName={setCustomerName}
              customersList={customersList}
              whatsappNumber={whatsappNumber}
              setWhatsappNumber={setWhatsappNumber}
              isCredit={isCredit}
              favoriteCustomers={favoriteCustomerNames}
            />

            {/* Favorite Customers Quick-Pill Selection across full available bar width */}
            {favoriteCustomerNames.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 w-full scroll-smooth">
                <span className="text-[10px] font-bold text-amber-400/90 flex items-center gap-1 shrink-0 pr-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-slate-400">Favs:</span>
                </span>
                {favoriteCustomerNames.map((name, i) => {
                  const isSelected = customerName?.toLowerCase() === name.toLowerCase();
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setCustomerName('');
                          setWhatsappNumber('');
                        } else {
                          setCustomerName(name);
                          const matched = customersList.find(c => c.name?.toLowerCase() === name.toLowerCase());
                          if (matched && matched.phone && !whatsappNumber) {
                            setWhatsappNumber(matched.phone);
                          }
                        }
                      }}
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-sm ${
                        isSelected 
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                          : 'bg-[#090d16] border-slate-800/80 text-slate-300 hover:text-sky-400 hover:border-sky-500/40 hover:bg-slate-800/60'
                      }`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* ======================================================== */}
        {/* RIGHT SIDE (35% Width): Current Cart -> Total & Pay      */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col space-y-2 h-full min-h-0 overflow-hidden">
          
          {/* BOX 1: Current Order / Cart Box (Top Right) */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-2.5 sm:p-3 shadow-xl space-y-2 flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-sky-400" />
                <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                  Current Sale ({cart.length})
                </h3>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="text-[10px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Cart Items List (Compact Single Line) */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 no-scrollbar pr-0.5">
              {cart.length === 0 ? (
                <div className="text-center text-slate-500 py-6 text-xs font-medium italic">
                  Cart is empty. Tap items on the left to add.
                </div>
              ) : (
                cart.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between gap-1.5 py-1 px-2 bg-[#090d16] border border-slate-800/70 hover:border-slate-700/80 rounded-xl text-xs transition-colors shrink-0"
                  >
                    {/* Item Name & Unit Price on Single Line */}
                    <div className="flex-1 min-w-0 flex items-center gap-1.5 pr-1">
                      <span className="font-bold text-slate-200 truncate text-[11px]">{item.name}</span>
                      {String(item.id).startsWith('custom-') || item.price === 0 ? (
                        <div className="flex items-center gap-0.5 shrink-0">
                          <span className="text-[10px] text-slate-500 font-mono">@</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={item.price || ''}
                            onChange={(e) => updateCartItem(item.id, 'price', Math.max(0, Number(e.target.value) || 0))}
                            className="w-12 text-right bg-slate-950 border border-slate-700/80 rounded px-1 py-0.2 text-emerald-400 font-mono font-bold text-[10px] focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">
                          @{Number(item.price || 0).toFixed(0)}
                        </span>
                      )}
                    </div>

                    {/* Quantity Stepper (Compact) */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => updateCartItem(item.id, 'qty', Math.max(1, (Number(item.qty) || 1) - 1))}
                        className="w-4 h-4 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-[10px] flex items-center justify-center cursor-pointer transition-colors"
                      >
                        -
                      </button>
                      <span className="w-5 text-center font-bold text-slate-200 text-xs font-mono">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateCartItem(item.id, 'qty', (Number(item.qty) || 1) + 1)}
                        className="w-4 h-4 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-[10px] flex items-center justify-center cursor-pointer transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal */}
                    <span className="w-14 text-right font-mono font-bold text-sky-400 text-xs shrink-0">
                      Rs {((Number(item.price) || 0) * (Number(item.qty) || 1)).toFixed(0)}
                    </span>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="p-0.5 text-slate-500 hover:text-rose-400 transition-colors shrink-0 cursor-pointer"
                      title="Remove Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* BOX 2: Total & Cash Given / Payment Box (Expands Upwards with Large Text & Inputs) */}
          <div 
            onClick={() => {
              if (!isPricingExpanded) setIsPricingExpanded(true);
            }}
            className={`bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-2xl shrink-0 transition-all duration-300 ease-in-out ${
              isPricingExpanded 
                ? 'p-3.5 sm:p-4 space-y-3 border-2 border-sky-500/40 ring-2 ring-sky-500/20 shadow-sky-950/70 max-h-[85%] overflow-y-auto' 
                : 'p-2.5 sm:p-3 space-y-2 text-xs border border-slate-800/80 hover:border-slate-700/80 cursor-pointer'
            }`}
          >
            {/* Header Strip with Expand / Collapse Toggle */}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setIsPricingExpanded(prev => !prev);
              }}
              className="flex items-center justify-between pb-1.5 border-b border-slate-800/80 cursor-pointer select-none group"
              title={isPricingExpanded ? "Click to switch to Compact View" : "Click to expand with large text & inputs"}
            >
              <div className="flex items-center gap-2">
                <Receipt className={`text-sky-400 ${isPricingExpanded ? 'w-4 h-4' : 'w-3.5 h-3.5'}`} />
                <span className={`font-black text-slate-200 tracking-wide uppercase ${isPricingExpanded ? 'text-xs sm:text-sm text-sky-200' : 'text-xs'}`}>
                  Payment & Bill
                </span>
                {discountPercent !== null && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              <button
                type="button"
                className={`flex items-center gap-1.5 font-bold transition-all cursor-pointer rounded-lg border ${
                  isPricingExpanded 
                    ? 'text-xs px-2.5 py-1 bg-sky-500/15 text-sky-300 border-sky-500/40 hover:bg-sky-500/25' 
                    : 'text-[11px] px-2 py-0.5 bg-slate-950/80 text-slate-400 group-hover:text-sky-400 border-slate-800 group-hover:border-sky-500/40'
                }`}
              >
                <span>{isPricingExpanded ? 'Compact View' : 'Expand View'}</span>
                {isPricingExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-sky-400" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-400" />
                )}
              </button>
            </div>
            
            {/* Subtotal */}
            <div className="flex items-center justify-between text-slate-300">
              <span className={`font-semibold ${isPricingExpanded ? 'text-sm text-slate-200' : 'text-xs'}`}>
                Sub Total:
              </span>
              <span className={`font-mono font-black text-slate-100 ${isPricingExpanded ? 'text-base sm:text-lg' : 'text-xs'}`}>
                Rs {rawSubTotal.toFixed(2)}
              </span>
            </div>

            {/* Discount with % button */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className={`font-semibold text-slate-300 ${isPricingExpanded ? 'text-sm' : 'text-xs'}`}>
                  Discount:
                </span>
                {discountPercent !== null && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDiscount('');
                      setDiscountPercent(null);
                    }}
                    className="text-[10px] sm:text-xs text-rose-400 hover:text-rose-300 cursor-pointer font-bold underline"
                    title="Clear percentage discount"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <span className={`absolute left-2 top-1/2 -translate-y-1/2 font-mono text-slate-500 pointer-events-none font-bold ${
                    isPricingExpanded ? 'text-xs' : 'text-[10px]'
                  }`}>
                    Rs
                  </span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={discount}
                    onFocus={() => setIsPricingExpanded(true)}
                    onChange={(e) => {
                      setDiscount(e.target.value);
                      setDiscountPercent(null);
                    }}
                    className={`text-right bg-[#090d16] border border-slate-700/80 rounded-xl text-slate-100 font-mono font-bold focus:outline-none focus:border-sky-500 transition-all shadow-inner ${
                      isPricingExpanded 
                        ? 'w-32 sm:w-36 pl-8 pr-2.5 py-1.5 text-base sm:text-lg' 
                        : 'w-24 pl-6 pr-2 py-0.5 text-xs'
                    }`}
                  />
                </div>

                {/* % Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApplyPercentDiscount();
                  }}
                  className={`rounded-xl font-black font-mono transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center ${
                    discountPercent !== null
                      ? 'bg-amber-500 text-slate-950 shadow-amber-500/30'
                      : 'bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border border-sky-500/40 hover:border-sky-400'
                  } ${isPricingExpanded ? 'px-3 py-1.5 text-sm sm:text-base' : 'px-2 py-0.5 text-xs'}`}
                  title="Enter % value & click to apply percentage from Total Bill"
                >
                  <Percent className={isPricingExpanded ? 'w-4 h-4 stroke-[3]' : 'w-3 h-3 stroke-[2.5]'} />
                </button>
              </div>
            </div>

            {/* Credit Toggle */}
            <div className={`border-t border-slate-800/80 flex items-center justify-between ${isPricingExpanded ? 'pt-2.5' : 'pt-1.5'}`}>
              <span className={`font-semibold text-slate-300 ${isPricingExpanded ? 'text-sm' : 'text-xs'}`}>
                Payment Mode:
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCredit(false);
                  }}
                  className={`rounded-xl font-bold transition-all cursor-pointer ${
                    !isCredit 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm' 
                      : 'bg-[#090d16] text-slate-400 border border-slate-800/80 hover:text-slate-300'
                  } ${isPricingExpanded ? 'px-3.5 py-1.5 text-xs sm:text-sm font-black' : 'px-2.5 py-0.5 text-xs'}`}
                >
                  Cash
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCredit(true);
                  }}
                  className={`rounded-xl font-bold transition-all cursor-pointer ${
                    isCredit 
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm' 
                      : 'bg-[#090d16] text-slate-400 border border-slate-800/80 hover:text-slate-300'
                  } ${isPricingExpanded ? 'px-3.5 py-1.5 text-xs sm:text-sm font-black' : 'px-2.5 py-0.5 text-xs'}`}
                >
                  Credit
                </button>
              </div>
            </div>

            {/* Cash Given & Change Due */}
            {!isCredit && (
              <div className={`border-t border-slate-800/80 ${isPricingExpanded ? 'pt-2.5 space-y-2' : 'pt-1.5 space-y-1.5'}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-black text-slate-200 ${isPricingExpanded ? 'text-sm' : 'text-xs'}`}>
                      Cash Given:
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCashGiven(finalPayable.toFixed(2));
                      }}
                      className={`font-bold rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30 hover:bg-sky-500/25 transition-colors cursor-pointer ${
                        isPricingExpanded ? 'text-xs px-2.5 py-1' : 'text-[10px] px-2 py-0.5'
                      }`}
                    >
                      Exact
                    </button>
                  </div>

                  <div className="relative">
                    {isPricingExpanded && (
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-emerald-600/70 pointer-events-none font-bold">
                        Rs
                      </span>
                    )}
                    <input
                      type="number"
                      min="0"
                      placeholder="0.00"
                      value={cashGiven}
                      onFocus={() => setIsPricingExpanded(true)}
                      onChange={(e) => setCashGiven(e.target.value)}
                      className={`text-right bg-[#090d16] rounded-xl text-emerald-400 font-mono font-black focus:outline-none transition-all shadow-inner ${
                        isPricingExpanded 
                          ? 'w-36 sm:w-44 pl-8 pr-3 py-1.5 text-lg sm:text-xl border-2 border-emerald-500/60 focus:border-emerald-400 ring-2 ring-emerald-500/20' 
                          : 'w-24 px-2 py-0.5 text-xs border border-slate-800/90 focus:border-emerald-500/70'
                      }`}
                    />
                  </div>
                </div>

                {cashGiven !== '' && (
                  <div className={`flex items-center justify-between ${isPricingExpanded ? 'pt-1 text-sm' : 'pt-0.5 text-xs'}`}>
                    <span className={`font-bold ${isPricingExpanded ? 'text-xs sm:text-sm text-slate-300' : 'text-[11px] text-slate-400'}`}>
                      {cashDiff >= 0 ? 'Change Due:' : 'Short Amount:'}
                    </span>
                    <span className={`font-mono font-black ${
                      cashDiff >= 0 ? 'text-sky-400' : 'text-rose-400'
                    } ${isPricingExpanded ? 'text-base sm:text-lg' : 'text-xs'}`}>
                      Rs {Math.abs(cashDiff).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Customer Arrears & Advance */}
            {(currentCustomerArrears > 0 || currentCustomerAdvance > 0) && (
              <div className={`border-t border-slate-800/80 bg-slate-950/40 rounded-xl border border-slate-800/60 ${
                isPricingExpanded ? 'p-2.5 space-y-1.5 text-xs sm:text-sm' : 'p-2 space-y-1 text-xs'
              }`}>
                {currentCustomerArrears > 0 && (
                  <label className="flex items-center justify-between cursor-pointer select-none">
                    <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                      <input
                        type="checkbox"
                        checked={includePreviousArrears}
                        onChange={(e) => setIncludePreviousArrears(e.target.checked)}
                        className="rounded border-slate-700 text-sky-500 focus:ring-sky-500 focus:ring-offset-0 bg-slate-900 cursor-pointer"
                      />
                      <span>Include Previous Arrears:</span>
                    </span>
                    <span className="font-mono font-bold text-rose-400">
                      +Rs {currentCustomerArrears.toFixed(2)}
                    </span>
                  </label>
                )}

                {currentCustomerAdvance > 0 && (
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-emerald-400">Advance Deducted:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      -Rs {currentCustomerAdvance.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Keep change as advance toggle */}
            {!isCredit && cashDiff > 0 && (
              <label className={`flex items-center gap-2 text-slate-400 cursor-pointer select-none pt-0.5 ${
                isPricingExpanded ? 'text-xs font-medium' : 'text-[11px]'
              }`}>
                <input
                  type="checkbox"
                  checked={keepChangeAsAdvance}
                  onChange={(e) => setKeepChangeAsAdvance(e.target.checked)}
                  className="rounded border-slate-700 text-sky-500 focus:ring-sky-500 focus:ring-offset-0 bg-slate-900 cursor-pointer"
                />
                <span>Keep change (Rs {cashDiff.toFixed(2)}) as customer advance</span>
              </label>
            )}

            {/* Total Payable Banner */}
            <div className={`relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-950/90 via-indigo-950/90 to-slate-900 border border-blue-500/40 shadow-xl shadow-blue-950/50 flex items-center justify-between ${
              isPricingExpanded ? 'p-3.5 sm:p-4 mt-2' : 'p-2.5 sm:p-3 mt-1'
            }`}>
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none"></div>
              <span className={`font-black uppercase tracking-wider text-blue-200 ${isPricingExpanded ? 'text-xs sm:text-sm' : 'text-[11px]'}`}>
                Total Payable:
              </span>
              <span className={`font-black font-mono text-white tracking-tight drop-shadow-[0_2px_12px_rgba(56,189,248,0.4)] ${
                isPricingExpanded ? 'text-2xl sm:text-3xl' : 'text-xl'
              }`}>
                Rs {finalPayable.toFixed(2)}
              </span>
            </div>

            {/* Primary Action Buttons (In the same single row) */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCompleteOrder();
                }}
                disabled={cart.length === 0 || checkoutLoading}
                className={`w-full rounded-xl font-black bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99] text-center ${
                  isPricingExpanded ? 'py-3 sm:py-3.5 px-3 text-xs sm:text-sm' : 'py-2.5 px-2 text-xs'
                }`}
              >
                <CheckCircle2 className={`stroke-[2.5] shrink-0 ${isPricingExpanded ? 'w-4 h-4' : 'w-3.5 h-3.5'}`} />
                <span className="truncate">{checkoutLoading ? 'Processing...' : (isCredit ? 'Confirm Bill' : 'Complete Sale')}</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDirectSavePending();
                }}
                disabled={cart.length === 0 || pendingLoading}
                className={`w-full rounded-xl font-bold bg-[#090d16] hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 text-center ${
                  isPricingExpanded ? 'py-3 sm:py-3.5 px-3 text-xs sm:text-sm' : 'py-2.5 px-2 text-xs'
                }`}
              >
                <Save className={`shrink-0 ${isPricingExpanded ? 'w-4 h-4' : 'w-3.5 h-3.5'}`} />
                <span className="truncate">{pendingLoading ? 'Saving...' : 'Save Pending Sale'}</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Modals */}
      <DeleteConfirmModal
        isOpen={!!pendingToDelete}
        onClose={() => setPendingToDelete(null)}
        onConfirm={async () => {
          if (!pendingToDelete) return;
          try {
            await pendingOrderService.deletePendingOrder(pendingToDelete);
            if (refreshPOSData) refreshPOSData();
            notify.success("Pending sale deleted");
          } catch (e) {
            console.error(e);
            notify.error("Failed to delete");
          } finally {
            setPendingToDelete(null);
          }
        }}
        title="Delete Pending Sale?"
        message="Are you sure you want to delete this pending sale? This action cannot be undone."
      />

    </div>
  );
}
