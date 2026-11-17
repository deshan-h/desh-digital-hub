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
  Printer,
  Minus
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [discount, setDiscount] = useState('');
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

  // Category horizontal scroll
  const categoryScrollRef = React.useRef(null);
  const scrollCategories = useCallback((direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, []);

  // Pending orders & modals state
  const [showSavePendingModal, setShowSavePendingModal] = useState(false);
  const [pendingCustomerName, setPendingCustomerName] = useState('');
  const [pendingWhatsappNumber, setPendingWhatsappNumber] = useState('');
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingToDelete, setPendingToDelete] = useState(null);
  const [saleToDelete, setSaleToDelete] = useState(null);

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
      handlePrint();
      setCashGiven('');
      setCustomerName('');
      setDiscount('');
      setIsCredit(false);
      setKeepChangeAsAdvance(false);
      setIncludePreviousArrears(true);
    }
  };

  // Pending order save
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
      if (refreshPOSData) refreshPOSData();
    } catch (error) {
      console.error(error);
      notify.error("Failed to save pending order");
    } finally {
      setPendingLoading(false);
    }
  };

  // Calculations
  const rawSubTotal = cartTotal;
  const discountVal = Number(discount || 0);
  const finalPayable = Math.max(0, rawSubTotal - discountVal) + (includePreviousArrears ? currentCustomerArrears : 0) - currentCustomerAdvance;
  const cashVal = cashGiven === '' ? 0 : Number(cashGiven);
  const cashDiff = cashVal - Math.max(0, finalPayable);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">

      {/* Main 2-Column Split POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ======================================================== */}
        {/* LEFT SIDE (65% Width): Categories at Top + Services Box */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          
          {/* Top Bar: Search + Custom Item + Refresh */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3.5">
            
            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search products or services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-9 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
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
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-cyan-400 border border-slate-800 hover:border-cyan-500/40 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
                title="Add Custom Item with manual price"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Custom Item</span>
              </button>

              {/* Refresh Button */}
              <button
                onClick={() => {
                  if (refreshPOSData) refreshPOSData();
                  setSearchQuery('');
                  notify.success("POS Data Refreshed!");
                }}
                className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-xl transition-colors cursor-pointer shrink-0"
                title="Refresh Items"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Categories Slider (Top of Services Box) */}
            <div className="relative group/cats flex items-center">
              <button
                onClick={() => scrollCategories('left')}
                className="absolute left-0 -ml-2 z-10 w-6 h-6 rounded-full bg-slate-800/90 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center opacity-0 group-hover/cats:opacity-100 transition-opacity cursor-pointer shadow-md"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div
                ref={categoryScrollRef}
                className="flex overflow-x-auto gap-2 py-1 no-scrollbar flex-1 scroll-smooth"
              >
                {displayCategories.map((cat, idx) => {
                  const isActive = activeCategoryIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveCategoryIndex(idx);
                        setSearchQuery('');
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                        isActive 
                          ? 'bg-[#0082cb] text-white shadow-md' 
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {cat.category}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => scrollCategories('right')}
                className="absolute right-0 -mr-2 z-10 w-6 h-6 rounded-full bg-slate-800/90 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center opacity-0 group-hover/cats:opacity-100 transition-opacity cursor-pointer shadow-md"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Services & Products Items Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl min-h-[460px]">
            <POSItemsGrid
              filteredItems={filteredItems}
              handleAddToCart={addToCart}
              favoriteItemIds={favoriteItemIds}
              toggleFavorite={toggleFavorite}
              activeCategory={activeCategory}
              searchQuery={searchQuery}
            />
          </div>

        </div>

        {/* ======================================================== */}
        {/* RIGHT SIDE (35% Width): Customer -> Cart -> Total & Pay  */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4 lg:sticky lg:top-20">
          
          {/* BOX 1: Customer Details (Right Top) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Customer Details <span className="text-red-400">*</span>
              </span>
              {currentCustomerArrears > 0 && (
                <span className="text-[11px] font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-md">
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

            {/* Favorite Customers Quick-Pill Selection */}
            {favoriteCustomerNames.length > 0 && !customerName && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {favoriteCustomerNames.slice(0, 5).map((name, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setCustomerName(name);
                      const matched = customersList.find(c => c.name?.toLowerCase() === name.toLowerCase());
                      if (matched && matched.phone && !whatsappNumber) {
                        setWhatsappNumber(matched.phone);
                      }
                    }}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors cursor-pointer"
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* BOX 2: Current Order / Cart Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                  Current Cart ({cart.length})
                </h3>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="max-h-56 overflow-y-auto space-y-2 no-scrollbar pr-0.5">
              {cart.length === 0 ? (
                <div className="text-center text-slate-500 py-8 text-xs font-medium italic">
                  Cart is empty. Tap items on the left to add.
                </div>
              ) : (
                cart.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between gap-2 p-2 bg-slate-950 border border-slate-800/80 rounded-xl text-xs"
                  >
                    <div className="flex-1 min-w-0 pr-1">
                      <span className="font-bold text-slate-200 block truncate">{item.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Rs {Number(item.price || 0).toFixed(2)}
                      </span>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => updateCartItem(item.id, 'qty', Math.max(1, (Number(item.qty) || 1) - 1))}
                        className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold text-slate-200">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateCartItem(item.id, 'qty', (Number(item.qty) || 1) + 1)}
                        className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal */}
                    <span className="w-16 text-right font-mono font-bold text-cyan-400 shrink-0">
                      Rs {((Number(item.price) || 0) * (Number(item.qty) || 1)).toFixed(0)}
                    </span>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* BOX 3: Total & Cash Given / Payment Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3.5 text-xs">
            
            {/* Subtotal & Discount */}
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
                className="w-24 text-right bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Credit Toggle */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Payment Mode:</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsCredit(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    !isCredit ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-950 text-slate-400'
                  }`}
                >
                  Cash
                </button>
                <button
                  type="button"
                  onClick={() => setIsCredit(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isCredit ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-slate-950 text-slate-400'
                  }`}
                >
                  Credit (ණයට)
                </button>
              </div>
            </div>

            {/* Cash Given & Change Due */}
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
                    className="w-28 text-right bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-emerald-400 font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {cashGiven !== '' && (
                  <div className="flex items-center justify-between text-xs pt-0.5">
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

            {/* Total Payable Banner */}
            <div className="bg-[#0082cb] text-white rounded-xl p-3.5 flex items-center justify-between shadow-lg mt-2">
              <span className="text-xs font-black uppercase tracking-wider">Total Payable:</span>
              <span className="text-2xl font-black font-mono">
                Rs {finalPayable.toFixed(2)}
              </span>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleCompleteOrder}
                disabled={cart.length === 0 || checkoutLoading}
                className="w-full py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{checkoutLoading ? 'Processing...' : (isCredit ? 'Confirm Credit Sale & Bill' : 'Complete Sale & Print Bill')}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSavePendingModal(true)}
                disabled={cart.length === 0}
                className="w-full py-2 rounded-xl font-bold text-xs bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save as Pending Order</span>
              </button>
            </div>

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
        onConfirm={async () => {
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
        }}
        title="Delete Pending Order?"
        message="Are you sure you want to delete this pending order? This action cannot be undone."
      />

    </div>
  );
}
