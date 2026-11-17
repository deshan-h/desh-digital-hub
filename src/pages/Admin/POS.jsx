import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
  X, 
  MessageCircle,
  LayoutGrid,
  Table as TableIcon,
  UserPlus,
  ChevronDown,
  Printer,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { notify } from '../../utils/toast';
import { parseTimestamp } from '../../utils/helpers';
import { generateInvoiceHtml } from '../../utils/invoiceTemplate';
import { 
  customerService, 
  salesService, 
  duesService, 
  categoryService, 
  pendingOrderService, 
  settingsService 
} from '../../services/supabaseService';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import { POSItem, CategoryTab, CartItem, POSItemsGrid, CustomerInput, SavePendingModal, POSReminderModal } from './POSComponents';

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
  // View mode: 'table' (ERP style matching screenshot) or 'grid' (Visual tiles)
  const [viewMode, setViewMode] = useState('table');
  
  // Order Metadata (ERP Layout)
  const [orderSource, setOrderSource] = useState('Walk-in Shop');
  const [assignee, setAssignee] = useState('Admin (Owner)');
  const [businessLocation, setBusinessLocation] = useState('Main Branch');
  const [deliveryCharge, setDeliveryCharge] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [selectedProductSearch, setSelectedProductSearch] = useState('');
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

  // Customer Favorites State
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

  const topCustomers = favoriteCustomerNames;

  const yesterdaySalesSum = useMemo(() => {
    if (!salesHistory) return 0;
    let ySum = 0;

    const now = new Date();
    const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    salesHistory.forEach(sale => {
      let d = new Date();
      if (typeof sale.timestamp?.toDate === 'function') d = sale.timestamp.toDate();
      else if (sale.timestamp?.seconds) d = new Date(sale.timestamp.seconds * 1000);
      else if (sale.timestamp) d = new Date(sale.timestamp);

      if (d >= yesterdayStart && d < yesterdayEnd) {
        ySum += Number(sale.amount || 0);
      }
    });

    return ySum;
  }, [salesHistory]);

  const categoryScrollRef = React.useRef(null);

  const scrollCategories = useCallback((direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, []);

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

  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [cashGiven, setCashGiven] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [discount, setDiscount] = useState('');
  const [isCredit, setIsCredit] = useState(false);
  const [includePreviousArrears, setIncludePreviousArrears] = useState(true);
  const [keepChangeAsAdvance, setKeepChangeAsAdvance] = useState(false);

  // Pending Orders State
  const [showSavePendingModal, setShowSavePendingModal] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState('Order'); // 'Order' | 'Pending'
  const [pendingCustomerName, setPendingCustomerName] = useState('');
  const [pendingWhatsappNumber, setPendingWhatsappNumber] = useState('');
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingToDelete, setPendingToDelete] = useState(null);
  const [reminderModalData, setReminderModalData] = useState(null);
  const [reminderWhatsapp, setReminderWhatsapp] = useState('');
  const [showRecentSalesDropdown, setShowRecentSalesDropdown] = useState(false);
  const [showRecentDuesDropdown, setShowRecentDuesDropdown] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState(null);

  // Match selected customer record
  const selectedCustomerRecord = useMemo(() => {
    if (!customerName || !customerName.trim()) return null;
    return customersList.find(c => c.name?.toLowerCase() === customerName.trim().toLowerCase()) || null;
  }, [customerName, customersList]);

  // Arrears & Advance calculation
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

  const pendingOrdersSum = useMemo(() => {
    return pendingOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  }, [pendingOrders]);

  // Filtered products for dropdown search
  const searchedProducts = useMemo(() => {
    if (!selectedProductSearch.trim()) return allItems.slice(0, 10);
    const q = selectedProductSearch.toLowerCase();
    return allItems.filter(item => item.name?.toLowerCase().includes(q)).slice(0, 15);
  }, [allItems, selectedProductSearch]);

  // Filtered items for Grid view
  const activeCategory = displayCategories[activeCategoryIndex] || null;
  const filteredItems = useMemo(() => {
    return searchQuery.trim() !== ''
      ? allItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : (activeCategory ? activeCategory.items : []);
  }, [allItems, activeCategory, searchQuery]);

  // Reset order listener
  useEffect(() => {
    const handleReset = () => {
      setCart([]);
      setCustomerName('');
      setCashGiven('');
      setDiscount('');
      setDeliveryCharge('');
      setOrderNotes('');
      setIsCredit(false);
      notify.success('New sale order started!');
    };
    window.addEventListener('pos-reset-sale', handleReset);
    return () => window.removeEventListener('pos-reset-sale', handleReset);
  }, [setCart]);

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
      amount: Math.max(0, cartTotal - Number(discount || 0)) + Number(deliveryCharge || 0),
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

  const handleCompleteOrder = async () => {
    if (cart.length === 0) {
      notify.error("Please add products to the cart first.");
      return;
    }

    const calculatedTotal = Math.max(0, cartTotal - Number(discount || 0)) + Number(deliveryCharge || 0);

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
      // Auto print bill
      handlePrint();

      // Reset Form
      setCashGiven('');
      setCustomerName('');
      setDiscount('');
      setDeliveryCharge('');
      setOrderNotes('');
      setIsCredit(false);
      setKeepChangeAsAdvance(false);
      setIncludePreviousArrears(true);
    }
  };

  const handleSavePending = async () => {
    let finalCustomerName = pendingCustomerName.trim() || customerName.trim();
    if (!finalCustomerName) {
      finalCustomerName = 'No Name Provided';
    }
    setPendingLoading(true);

    try {
      await pendingOrderService.createPendingOrder({
        note: finalCustomerName,
        phone: pendingWhatsappNumber || whatsappNumber || '',
        items: cart,
        totalAmount: cartTotal,
        discount: Number(discount) || 0
      });
      notify.success("Order saved as pending!");
      setCart([]);
      setShowSavePendingModal(false);
      setPendingCustomerName('');
      setPendingWhatsappNumber('');
      setActiveRightTab('Pending');
      if (refreshPOSData) refreshPOSData();
    } catch (error) {
      console.error(error);
      notify.error("Failed to save pending order");
    } finally {
      setPendingLoading(false);
    }
  };

  const handleResumePending = async (order) => {
    if (cart.length > 0) {
      if (!window.confirm("Current cart will be replaced. Continue?")) return;
    }
    setCart(order.items);
    setCustomerName(order.note);
    if (order.phone) {
      setWhatsappNumber(order.phone);
    }
    setActiveRightTab('Order');
    try {
      await pendingOrderService.deletePendingOrder(order.id);
      if (refreshPOSData) refreshPOSData();
    } catch (e) {
      console.error("Error removing pending doc", e);
    }
  };

  const confirmDeleteSale = async () => {
    if (!saleToDelete) return;
    try {
      await salesService.deleteSale(saleToDelete);
      if (refreshPOSData) refreshPOSData();
      notify.success("Sale deleted successfully!");
    } catch (err) {
      console.error(err);
      notify.error("Failed to delete sale");
    } finally {
      setSaleToDelete(null);
    }
  };

  const confirmDeletePending = async () => {
    if (!pendingToDelete) return;
    try {
      await pendingOrderService.deletePendingOrder(pendingToDelete);
      if (refreshPOSData) refreshPOSData();
      notify.success("Pending order deleted");
    } catch (e) {
      console.error(e);
      notify.error("Failed to delete");
    } finally {
      setPendingToDelete(null);
    }
  };

  // Calculations for Summary
  const rawSubTotal = cartTotal;
  const discountVal = Number(discount || 0);
  const deliveryVal = Number(deliveryCharge || 0);
  const finalPayable = Math.max(0, rawSubTotal - discountVal) + deliveryVal + (includePreviousArrears ? currentCustomerArrears : 0) - currentCustomerAdvance;
  const cashVal = cashGiven === '' ? 0 : Number(cashGiven);
  const cashDiff = cashVal - Math.max(0, finalPayable);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* Top Header Row matching Reference Layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2.5">
            <span>Add New Sale</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold uppercase tracking-wider">
              POS Terminal
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Select customer, add products or services, and generate sales invoices.
          </p>
        </div>

        {/* View Switcher & Quick Stats */}
        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          {/* Today's Sales Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Today:</span>
            <span className="font-bold text-emerald-400">Rs {(todaySalesSum || 0).toFixed(0)}</span>
          </div>

          {/* Table / Grid Mode Toggle */}
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid Tiles</span>
            </button>
          </div>

          {/* Pending Orders Button */}
          {pendingOrders.length > 0 && (
            <button
              onClick={() => setShowPendingOrdersModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Pending ({pendingOrders.length})</span>
            </button>
          )}

          {/* Custom Item Button */}
          <button
            onClick={() => addToCart({
              id: 'custom-' + Date.now(),
              name: 'Custom Service / Item',
              price: 0,
              qty: 1
            })}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Custom Item</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: 68% Width (Customer + Products + Notes)     */}
        {/* ======================================================== */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* CARD 1: Customer Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            
            {/* Customer Search & New Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 shrink-0">
                  Customer Name <span className="text-red-400">*</span>
                </label>
                <div className="flex-1">
                  <CustomerInput
                    customerName={customerName}
                    setCustomerName={setCustomerName}
                    customersList={customersList}
                    whatsappNumber={whatsappNumber}
                    setWhatsappNumber={setWhatsappNumber}
                    isCredit={isCredit}
                    favoriteCustomers={favoriteCustomerNames}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const newName = prompt("Enter New Customer Name:");
                  if (newName && newName.trim()) {
                    setCustomerName(newName.trim());
                    notify.success(`Selected customer: ${newName.trim()}`);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-cyan-400 hover:text-cyan-300 text-xs font-bold transition-all shrink-0 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add New Customer</span>
              </button>
            </div>

            {/* Quick Profile Information Box matching screenshot */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">Reference ID:</span>
                <span className="text-slate-300 font-mono font-medium mt-0.5 block truncate">
                  {selectedCustomerRecord?.id ? `CUST-${selectedCustomerRecord.id.substring(0, 6).toUpperCase()}` : '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">Email:</span>
                <span className="text-slate-300 font-medium mt-0.5 block truncate">
                  {selectedCustomerRecord?.email || '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">Contact No. 1:</span>
                <span className="text-slate-300 font-mono font-medium mt-0.5 block truncate">
                  {selectedCustomerRecord?.phone || whatsappNumber || '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block">Contact No. 2 (WhatsApp):</span>
                <span className="text-slate-300 font-mono font-medium mt-0.5 block truncate">
                  {whatsappNumber || '-'}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-4 pt-1 border-t border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Customer Address:</span>
                  <span className="text-slate-300 font-medium">
                    {selectedCustomerRecord?.area || selectedCustomerRecord?.address || '-'}
                  </span>
                </div>

                {/* Arrears / Advance status pills */}
                <div className="flex items-center gap-2">
                  {currentCustomerArrears > 0 && (
                    <span className="text-[11px] font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-md">
                      Due Arrears: Rs {currentCustomerArrears.toFixed(2)}
                    </span>
                  )}
                  {currentCustomerAdvance > 0 && (
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                      Advance: Rs {currentCustomerAdvance.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* CARD 2: Product Details & Items Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            
            {/* Product Details Header & Dropdown Selection */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-slate-100">Product Details</h2>
              </div>

              {/* Autocomplete / Select Product Dropdown */}
              <div className="relative w-full sm:w-72">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Select or Search Product..."
                    value={selectedProductSearch}
                    onChange={(e) => {
                      setSelectedProductSearch(e.target.value);
                      setIsProductDropdownOpen(true);
                    }}
                    onFocus={() => setIsProductDropdownOpen(true)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                  />
                  <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>

                {/* Dropdown Options */}
                {isProductDropdownOpen && (
                  <div className="absolute left-0 right-0 top-11 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-40 p-1">
                    {searchedProducts.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          addToCart(p);
                          setSelectedProductSearch('');
                          setIsProductDropdownOpen(false);
                          notify.success(`Added ${p.name} to cart`);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-slate-800 rounded-lg flex items-center justify-between text-xs text-slate-200 transition-colors cursor-pointer"
                      >
                        <span className="font-semibold truncate">{p.name}</span>
                        <span className="font-mono text-cyan-400 font-bold ml-2 shrink-0">
                          Rs {p.price ? p.price.toFixed(2) : 'Custom'}
                        </span>
                      </button>
                    ))}
                    {searchedProducts.length === 0 && (
                      <div className="p-3 text-center text-xs text-slate-500">No matching products found.</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* View Mode: TABLE MODE (Matches Reference Screenshot) */}
            {viewMode === 'table' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold text-[11px]">
                      <th className="py-3 px-3">Product Name</th>
                      <th className="py-3 px-3 text-center w-28">Quantity</th>
                      <th className="py-3 px-3 text-right w-32">Selling Price</th>
                      <th className="py-3 px-3 text-right w-32">Sub Total</th>
                      <th className="py-3 px-3 text-center w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-16 text-center text-slate-500 text-sm font-semibold italic bg-slate-950/30 rounded-xl">
                          Please, Select the Product
                        </td>
                      </tr>
                    ) : (
                      cart.map((item) => {
                        const itemSub = (Number(item.price) || 0) * (Number(item.qty) || 1);
                        return (
                          <tr key={item.id} className="border-b border-slate-800/60 hover:bg-slate-950/40 transition-colors">
                            <td className="py-3 px-3">
                              <span className="font-bold text-slate-200 text-sm block">{item.name}</span>
                              {item.category && (
                                <span className="text-[10px] text-slate-500 uppercase">{item.category}</span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => updateCartItem(item.id, 'qty', Math.max(1, (Number(item.qty) || 1) - 1))}
                                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center cursor-pointer"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.qty}
                                  onChange={(e) => updateCartItem(item.id, 'qty', Math.max(1, parseInt(e.target.value) || 1))}
                                  className="w-12 text-center bg-slate-950 border border-slate-800 rounded py-1 text-xs text-slate-200 font-bold focus:outline-none focus:border-cyan-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateCartItem(item.id, 'qty', (Number(item.qty) || 1) + 1)}
                                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <input
                                type="number"
                                min="0"
                                value={item.price}
                                onChange={(e) => updateCartItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                                className="w-24 text-right bg-slate-950 border border-slate-800 rounded py-1 px-2 text-xs text-slate-200 font-mono font-bold focus:outline-none focus:border-cyan-500"
                              />
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-sm text-cyan-400">
                              Rs {itemSub.toFixed(2)}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.id)}
                                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* GRID MODE (Visual Tiles) */
              <div className="space-y-4">
                <POSItemsGrid
                  filteredItems={filteredItems}
                  handleAddToCart={addToCart}
                  favoriteItemIds={favoriteItemIds}
                  toggleFavorite={toggleFavorite}
                  activeCategory={activeCategory}
                  searchQuery={searchQuery}
                />
                
                {/* Category Slider */}
                <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
                  {displayCategories.map((cat, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveCategoryIndex(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                        activeCategoryIndex === idx ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat.category}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* CARD 3: Custom Fields & Notes matching reference */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="font-bold text-slate-200 text-sm">Custom Fields & Order Remarks</h3>
            <textarea
              rows={2}
              placeholder="Add optional notes, repair job reference, or delivery instructions here..."
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none"
            />
          </div>

        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: 32% Width (Sticky Order Details & Billing) */}
        {/* ======================================================== */}
        <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-20">
          
          {/* Order Details Meta Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <ShoppingCart className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-slate-100 text-base">Order Details</h3>
            </div>

            <div className="space-y-3 text-xs">
              {/* Order Date */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Order Date:</span>
                <span className="text-slate-200 font-mono font-semibold">
                  {new Date().toLocaleDateString('en-GB')} at {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Source Dropdown */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400 font-medium shrink-0">Source:</span>
                <select
                  value={orderSource}
                  onChange={(e) => setOrderSource(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                >
                  <option value="Walk-in Shop">Walk-in Shop</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Facebook">Facebook</option>
                  <option value="DESH Edu Hub">DESH Edu Hub</option>
                  <option value="Phone Call">Phone Call</option>
                </select>
              </div>

              {/* Assignee */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400 font-medium shrink-0">Assignee:</span>
                <span className="text-slate-200 font-semibold">{assignee}</span>
              </div>

              {/* Business Location */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400 font-medium shrink-0">Business Location:</span>
                <span className="text-slate-200 font-semibold">{businessLocation}</span>
              </div>

              {/* Payment Type */}
              <div className="pt-2 border-t border-slate-800">
                <label className="text-slate-400 font-medium block mb-1.5">Payment Method:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsCredit(false)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      !isCredit ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Cash / Direct
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCredit(true)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isCredit ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Credit (ණයට)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Calculations Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3.5 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span>Sub Total:</span>
              <span className="font-mono font-bold text-sm">Rs {rawSubTotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400">Discount (Rs):</span>
              <input
                type="number"
                min="0"
                placeholder="0.00"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-24 text-right bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400">Delivery Charge:</span>
              <input
                type="number"
                min="0"
                placeholder="0.00"
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(e.target.value)}
                className="w-24 text-right bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* If Cash: Cash Given & Balance Change */}
            {!isCredit && (
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-300 font-bold">Cash Given:</span>
                    <button
                      type="button"
                      onClick={() => setCashGiven(finalPayable.toFixed(2))}
                      className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/30 hover:bg-cyan-500/20"
                    >
                      Exact
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={cashGiven}
                    onChange={(e) => setCashGiven(e.target.value)}
                    className="w-28 text-right bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-emerald-400 font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {cashGiven !== '' && (
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400 font-semibold">
                      {cashDiff >= 0 ? 'Change Due:' : 'Short Amount:'}
                    </span>
                    <span className={`font-mono font-black ${cashDiff >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                      Rs {Math.abs(cashDiff).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Big Prominent Total Payable Banner (Matches Reference Screenshot) */}
          <div className="bg-gradient-to-r from-blue-900/90 via-slate-900 to-cyan-900/90 border border-cyan-500/30 rounded-2xl p-5 shadow-2xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-cyan-300 block">
                Total Payable
              </span>
              <span className="text-xs text-slate-400 font-medium">Net Bill Amount</span>
            </div>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono drop-shadow">
                Rs {finalPayable.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleCompleteOrder}
              disabled={cart.length === 0 || checkoutLoading}
              className="w-full py-4 rounded-xl font-black text-base bg-gradient-to-r from-cyan-500 via-blue-600 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-5 h-5" />
              <span>{checkoutLoading ? 'Processing...' : (isCredit ? 'Confirm Credit Sale & Bill' : 'Complete Sale & Print Bill')}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSavePendingModal(true)}
              disabled={cart.length === 0}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save as Pending Order</span>
            </button>
          </div>

        </div>

      </div>

      {/* Modals */}
      <SavePendingModal
        isOpen={showSavePendingModal}
        onClose={() => setShowSavePendingModal(false)}
        pendingCustomerName={pendingCustomerName || customerName}
        setPendingCustomerName={setPendingCustomerName}
        customersList={customersList}
        pendingWhatsappNumber={pendingWhatsappNumber || whatsappNumber}
        setPendingWhatsappNumber={setPendingWhatsappNumber}
        favoriteCustomerNames={favoriteCustomerNames}
        handleSavePending={handleSavePending}
        pendingLoading={pendingLoading}
      />

      <DeleteConfirmModal
        isOpen={!!pendingToDelete}
        onClose={() => setPendingToDelete(null)}
        onConfirm={confirmDeletePending}
        title="Delete Pending Order?"
        message="Are you sure you want to delete this pending order? This action cannot be undone."
      />

      <DeleteConfirmModal
        isOpen={!!saleToDelete}
        onClose={() => setSaleToDelete(null)}
        onConfirm={confirmDeleteSale}
        title="Delete Sale?"
        message="Are you sure you want to delete this sale? This action cannot be undone."
      />

      <POSReminderModal
        data={reminderModalData}
        onClose={() => setReminderModalData(null)}
        reminderWhatsapp={reminderWhatsapp}
        setReminderWhatsapp={setReminderWhatsapp}
        handleSendReminder={() => {}}
        isUpdatingCustomer={false}
      />

    </div>
  );
}
