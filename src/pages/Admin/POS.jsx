import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ShoppingCart, Plus, Trash2, Search, Package, RefreshCw, Save, Clock, TrendingUp, TrendingDown, Star, ChevronLeft, ChevronRight, X, MessageCircle } from 'lucide-react';
import { notify } from '../../utils/toast';
import { generateInvoiceHtml } from '../../utils/invoiceTemplate';
import { collection, addDoc, deleteDoc, doc, serverTimestamp, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import { POSItem, CategoryTab, CartItem, POSItemsGrid, CustomerInput } from './POSComponents';

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
  salesHistory = [],
  customerDuesList = [],
  refreshPOSData,
  pendingOrders = [],
  showPendingOrdersModal,
  setShowPendingOrdersModal,
  todaySalesSum = 0,
  totalPendingDues = 0
}) {
  const topCustomers = useMemo(() => {
    // Always prefer the freshest data from local storage, as it is instantly 
    // updated by the Customers tab when stars are toggled.
    const cached = localStorage.getItem('favoriteCustomers');
    if (cached) {
      return JSON.parse(cached);
    }
    // Fallback if local storage is empty
    if (customersList && customersList.length > 0) {
      const favorites = customersList.filter(c => c.mostVisited).map(c => c.name);
      localStorage.setItem('favoriteCustomers', JSON.stringify(favorites));
      return favorites;
    }
    return [];
  }, [customersList]);

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

  const toggleFavorite = useCallback((e, item) => {
    e.preventDefault();
    e.stopPropagation();
    setFavoriteItemIds(prev => {
      const newFavs = prev.includes(item.id)
        ? prev.filter(id => id !== item.id)
        : [...prev, item.id];
      localStorage.setItem('posFavorites', JSON.stringify(newFavs));
      return newFavs;
    });
  }, []);

  const displayCategories = useMemo(() => {
    const allItems = posCategories.flatMap(c => c.items || []);
    const favItems = allItems.filter(item => favoriteItemIds.includes(item.id));

    const favCategory = {
      id: 'favorites',
      category: 'Favorites',
      icon: 'Star',
      items: favItems
    };

    return [favCategory, ...posCategories];
  }, [posCategories, favoriteItemIds]);

  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cashGiven, setCashGiven] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [discount, setDiscount] = useState('');
  const [isCredit, setIsCredit] = useState(false);
  const [keepChangeAsAdvance, setKeepChangeAsAdvance] = useState(true);

  // Pending Orders State
  const [showSavePendingModal, setShowSavePendingModal] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState('Cart');
  const [pendingCustomerName, setPendingCustomerName] = useState('');
  const [pendingWhatsappNumber, setPendingWhatsappNumber] = useState('');
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingToDelete, setPendingToDelete] = useState(null);
  const [reminderModalData, setReminderModalData] = useState(null);
  const [reminderWhatsapp, setReminderWhatsapp] = useState('');

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

  const handleSavePending = async () => {
    let finalCustomerName = pendingCustomerName.trim();
    if (!finalCustomerName) {
      notify.error("Please enter or select a customer name");
      return;
    }
    setPendingLoading(true);

    if (!finalCustomerName.startsWith('Customer ')) {
      try {
        const q = query(collection(db, 'customers'), where('name', '==', finalCustomerName));
        const qs = await getDocs(q);
        if (qs.empty) {
          await addDoc(collection(db, 'customers'), {
            name: finalCustomerName,
            phone: pendingWhatsappNumber || '',
            area: '',
            timestamp: serverTimestamp()
          });
        }
      } catch (err) {
        console.error("Error saving new customer:", err);
      }
    }

    try {
      await addDoc(collection(db, 'pos_pending_orders'), {
        note: finalCustomerName,
        phone: pendingWhatsappNumber || '',
        items: cart,
        totalAmount: cartTotal,
        createdAt: serverTimestamp()
      });
      notify.success("Order saved as pending!");
      setCart([]);
      setShowSavePendingModal(false);
      setPendingCustomerName('');
      setPendingWhatsappNumber('');
      setActiveRightTab('Pending');
    } catch (error) {
      console.error(error);
      notify.error("Failed to save pending order");
    } finally {
      setPendingLoading(false);
    }
  };

  const [isUpdatingCustomer, setIsUpdatingCustomer] = useState(false);

  const handleOpenReminder = (order) => {
    let customerPhone = order.phone || '';
    if (!customerPhone && order.note) {
      const customer = customersList.find(c => c.name.toLowerCase() === order.note.toLowerCase());
      if (customer && customer.phone) {
        customerPhone = customer.phone;
      }
    }

    if (customerPhone) {
      proceedSendReminder(order, customerPhone);
    } else {
      setReminderModalData({ order });
      setReminderWhatsapp('');
    }
  };

  const proceedSendReminder = (order, numberToUse) => {
    const msg = `Hello *${order.note || 'Customer'}*,\nYour order from *DESH Digital Hub* is ready for collection!\n*Total Amount:* Rs ${(order.totalAmount || 0).toFixed(2)}\nThank you for choosing us!`;
    const encodedMsg = encodeURIComponent(msg);
    let number = numberToUse.trim().replace(/\D/g, '');
    if (number.startsWith('0')) {
      number = '94' + number.substring(1);
    } else if (!number.startsWith('94')) {
      number = '94' + number;
    }

    window.open(`https://wa.me/${number}?text=${encodedMsg}`, '_blank');
  };

  const handleSendReminder = async () => {
    if (!reminderWhatsapp.trim()) {
      notify.error("Please enter a WhatsApp number");
      return;
    }
    const order = reminderModalData.order;
    
    setIsUpdatingCustomer(true);
    try {
      if (order.note) {
        const q = query(collection(db, 'customers'), where('name', '==', order.note));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const customerDoc = querySnapshot.docs[0];
          await updateDoc(doc(db, 'customers', customerDoc.id), {
            phone: reminderWhatsapp.trim()
          });
        }
      }
      
      // Update the pending order itself so it doesn't ask again
      if (order.id) {
        await updateDoc(doc(db, 'pos_pending_orders', order.id), {
          phone: reminderWhatsapp.trim()
        });
      }
      
      proceedSendReminder(order, reminderWhatsapp);
      setReminderModalData(null);
      setReminderWhatsapp('');
    } catch (err) {
      console.error("Error updating customer phone:", err);
      notify.error("Failed to update customer phone");
    } finally {
      setIsUpdatingCustomer(false);
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
    setActiveRightTab('Cart');
    try {
      await deleteDoc(doc(db, 'pos_pending_orders', order.id));
    } catch (e) {
      console.error("Error removing pending doc", e);
    }
  };

  const handleDeletePending = (id) => {
    setPendingToDelete(id);
  };

  const confirmDeletePending = async () => {
    if (!pendingToDelete) return;
    try {
      await deleteDoc(doc(db, 'pos_pending_orders', pendingToDelete));
      notify.success("Pending order deleted");
    } catch (e) {
      console.error(e);
      notify.error("Failed to delete");
    } finally {
      setPendingToDelete(null);
    }
  };

  const handlePrint = () => {
    if (cart.length === 0) {
      notify.error("Cart is empty");
      return;
    }
    const sale = {
      id: Math.random().toString(36).substring(2, 8).toUpperCase(),
      timestamp: new Date(),
      customerName: customerName,
      cartItems: cart,
      amount: cartTotal - Number(discount || 0),
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

  const activeCategory = displayCategories[activeCategoryIndex] || null;

  // Optimize filtering to not run on every cart update
  const filteredItems = useMemo(() => {
    return searchQuery.trim() !== ''
      ? posCategories.flatMap(cat =>
        (cat.items || []).filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
      : (activeCategory ? activeCategory.items : []);
  }, [posCategories, activeCategory, searchQuery]);

  // Stable callbacks for child components
  const handleAddToCart = useCallback((item) => {
    addToCart(item);
  }, [addToCart]);

  const handleUpdateCartItem = useCallback((id, field, value) => {
    updateCartItem(id, field, value);
  }, [updateCartItem]);

  const handleRemoveFromCart = useCallback((id) => {
    removeFromCart(id);
  }, [removeFromCart]);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] bg-slate-950">

      {/* Left Area (Search + Items + Categories) */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-950">

        <div className="z-10 relative flex flex-col h-full px-6 pt-2 pb-6">

          {/* Top Bar: Search and Refresh */}
          <div className="flex mb-12 gap-3 items-center">
            <div className={`flex relative transition-all duration-300 h-10 ${isSearchExpanded ? 'w-full max-w-[320px]' : 'w-10'}`}>
              {!isSearchExpanded ? (
                <button
                  onClick={() => setIsSearchExpanded(true)}
                  className="absolute left-0 top-0 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-emerald-400 z-20 rounded-full bg-slate-900 border border-slate-800 shadow-none transition-colors"
                >
                  <Search className="w-[18px] h-[18px]" />
                </button>
              ) : (
                <div className="relative w-full flex items-center">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-[18px] h-[18px] text-emerald-500 z-10" />
                  <input
                    type="text"
                    placeholder="Search items or services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="pl-11 pr-10 h-10 bg-slate-900 border border-slate-800 focus-visible:ring-emerald-500/40 rounded-full text-sm w-full text-slate-200 placeholder:text-slate-500 transition-colors focus:outline-none shadow-inner"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-12 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 z-10 p-1 bg-slate-800/80 rounded-full hover:bg-slate-700 transition-colors">
                      <Minus className="w-3 h-3 rotate-45" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsSearchExpanded(false);
                      setSearchQuery('');
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-full transition-colors"
                    title="Close Search"
                  >
                    <X className="w-[18px] h-[18px] rotate-45" />
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (refreshPOSData) refreshPOSData();
                setCart([]);
                setSearchQuery('');
                setActiveCategoryIndex(0);
                setCustomerName('');
                setCashGiven('');
                setShowPaymentModal(false);
                setIsSearchExpanded(false);
                notify.success("POS Items Refreshed!");
              }}
              onDoubleClick={() => {
                if ('caches' in window) {
                  caches.keys().then(names => {
                    for (let name of names) caches.delete(name);
                  });
                }
                window.location.reload();
              }}
              className="w-10 h-10 flex shrink-0 items-center justify-center text-slate-400 hover:text-emerald-400 rounded-full bg-slate-900 border border-slate-800 shadow-none transition-colors"
              title="Refresh Items (Double click for Hard Reset)"
            >
              <RefreshCw className="w-[18px] h-[18px]" />
            </button>

            {/* Today's Sales, Pending Dues, and Pending Orders */}
            {!isSearchExpanded && (
              <div className="hidden lg:flex items-center px-4 h-10 bg-slate-900 border border-slate-800 rounded-full shadow-inner cursor-default">
                <div className="flex items-center gap-2" title={`Today's Sales (Yesterday: Rs ${yesterdaySalesSum.toFixed(2)})`}>
                  {todaySalesSum < yesterdaySalesSum ? (
                    <TrendingDown className="w-[16px] h-[16px] text-red-500" />
                  ) : (
                    <TrendingUp className="w-[16px] h-[16px] text-emerald-500" />
                  )}
                  <span className={`text-sm font-black tracking-wide ${todaySalesSum < yesterdaySalesSum ? 'text-red-500' : 'text-emerald-400'}`}>
                    Rs {(todaySalesSum || 0).toFixed(2)}
                  </span>
                </div>

                <div className="w-px h-4 bg-slate-700 mx-3"></div>

                <div className="flex items-center gap-2" title="Pending Dues">
                  <Clock className="w-[16px] h-[16px] text-rose-400" />
                  <span className="text-sm font-black text-rose-400 tracking-wide">Rs {(totalPendingDues || 0).toFixed(2)}</span>
                </div>

              </div>
            )}

            {/* Custom Item Button */}
            <button
              onClick={() => handleAddToCart({
                id: 'custom-' + Date.now(),
                name: 'Custom Service',
                price: 0, // Triggers the manual price input field in the cart
                qty: 1
              })}
              className="flex items-center gap-2 px-4 h-10 shrink-0 text-slate-200 hover:text-emerald-400 rounded-full bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all ml-auto group"
              title="Add Custom Item"
            >
              <Plus className="w-[18px] h-[18px] text-emerald-500 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold hidden sm:inline">Custom Service</span>
            </button>
          </div>

          {/* Middle Area: Items Grid (Background Icon Removed for Performance) */}
          <POSItemsGrid
            filteredItems={filteredItems}
            handleAddToCart={handleAddToCart}
            favoriteItemIds={favoriteItemIds}
            toggleFavorite={toggleFavorite}
            activeCategory={activeCategory}
            searchQuery={searchQuery}
          />

          {/* Bottom Area: Category Tabs */}
          <div className="relative group/slider mt-2 flex items-center">
            <button
              onClick={() => scrollCategories('left')}
              className="absolute left-0 -ml-3 z-20 w-8 h-8 bg-slate-800/80 backdrop-blur border border-slate-700 rounded-full flex items-center justify-center text-slate-300 opacity-0 group-hover/slider:opacity-100 transition-all duration-300 hover:bg-slate-700 hover:text-white shadow-xl hover:scale-110"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div
              ref={categoryScrollRef}
              className="flex overflow-x-auto gap-3 pb-2 snap-x snap-mandatory no-scrollbar flex-1 w-full scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {displayCategories.map((cat, idx) => (
                <CategoryTab
                  key={idx}
                  cat={cat}
                  isActive={activeCategoryIndex === idx}
                  onClick={() => {
                    setActiveCategoryIndex(idx);
                    setSearchQuery('');
                  }}
                />
              ))}
            </div>

            <button
              onClick={() => scrollCategories('right')}
              className="absolute right-0 -mr-3 z-20 w-8 h-8 bg-slate-800/80 backdrop-blur border border-slate-700 rounded-full flex items-center justify-center text-slate-300 opacity-0 group-hover/slider:opacity-100 transition-all duration-300 hover:bg-slate-700 hover:text-white shadow-xl hover:scale-110"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-[420px] bg-slate-950 border-l border-slate-800 p-6 flex flex-col shrink-0 z-20">

        {/* Tabs */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveRightTab('Cart')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${activeRightTab === 'Cart' ? 'bg-slate-800 text-emerald-400 shadow' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Cart ({cart.length})
          </button>
          <button
            onClick={() => setActiveRightTab('Pending')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all flex justify-center items-center gap-2 ${activeRightTab === 'Pending' ? 'bg-slate-800 text-orange-400 shadow' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Pending
            {pendingOrders.length > 0 && (
              <span className="bg-orange-500 text-slate-900 px-1.5 py-0.5 rounded-full text-[10px]">{pendingOrders.length}</span>
            )}
          </button>
        </div>

        {activeRightTab === 'Cart' ? (
          <>
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-4">
              <h2 className="text-sm font-extrabold text-slate-100 uppercase tracking-wide flex items-center gap-3">
                Current Order
              </h2>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="h-7 flex items-center justify-center rounded-lg text-[10px] uppercase tracking-wider font-bold px-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-900/30 transition-colors"
                >
                  <Trash2 className="w-3 h-3 mr-1" /> Clear
                </button>
              )}
            </div>

            <div className="flex text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">
              <div className="flex-1">Name</div>
              <div className="w-16 text-center">Qty</div>
              <div className="w-20 text-right">Price</div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {cart.length === 0 ? (
                <div className="text-slate-500 text-center mt-10 text-sm">Cart is empty</div>
              ) : (
                cart.map(item => (
                  <CartItem
                    key={item.id}
                    item={item}
                    updateCartItem={handleUpdateCartItem}
                    removeFromCart={handleRemoveFromCart}
                  />
                ))
              )}
            </div>

            <div className="pt-4 border-t border-slate-800/80 mt-4 flex flex-col gap-4">
              <div className="flex justify-between items-center text-lg px-1">
                <span className="text-slate-300 font-bold uppercase tracking-wider text-sm">Total</span>
                <span className="text-2xl font-black text-emerald-400">Rs {cartTotal.toFixed(2)}</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSavePendingModal(true)}
                  disabled={cart.length === 0}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 shadow-md hover:shadow-lg text-slate-200 border border-slate-700 font-extrabold py-3 disabled:opacity-50 transition-all rounded-xl flex items-center justify-center text-xs uppercase tracking-wide gap-2"
                >
                  <Save className="w-4 h-4" /> Pending
                </button>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={cart.length === 0}
                  className="flex-[2] bg-emerald-500 hover:bg-emerald-400 shadow-md hover:shadow-lg text-slate-950 font-extrabold py-3 disabled:opacity-50 transition-all rounded-xl flex items-center justify-center text-sm uppercase tracking-wide"
                >
                  Checkout
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="overflow-y-auto flex-1 space-y-3 custom-scrollbar pr-1">
              {pendingOrders.length === 0 ? (
                <div className="text-center text-slate-500 py-10 text-sm font-bold uppercase tracking-widest">No pending orders</div>
              ) : (
                pendingOrders.map(order => (
                  <div key={order.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-3 group hover:border-slate-700 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">{order.note}</h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {order.items?.length || 0} items • {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </p>
                      </div>
                      <p className="text-sm font-black text-emerald-400">Rs {(order.totalAmount || 0).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleOpenReminder(order)}
                        className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors border border-blue-500/20"
                        title="Send WhatsApp Reminder"
                      >
                        <MessageCircle className="w-[18px] h-[18px]" />
                      </button>
                      <div className="flex-1"></div>
                      <button
                        onClick={() => handleResumePending(order)}
                        className="px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors border border-emerald-500/20 text-xs font-bold"
                      >
                        Resume
                      </button>
                      <button
                        onClick={() => handleDeletePending(order.id)}
                        className="px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors border border-red-500/20 text-xs font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95">
          <div className="bg-slate-900 border border-slate-700/50 rounded-3xl w-full max-w-5xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/80 shrink-0">
              <h2 className="text-2xl font-black text-slate-100 uppercase tracking-widest flex items-center gap-3">
                <ShoppingCart className="w-6 h-6 text-emerald-500" />
                Complete Sale
              </h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-red-400 transition-colors p-2 bg-slate-800/50 hover:bg-slate-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col lg:flex-row h-full overflow-y-auto no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

              {/* Left Column: Customer & Details */}
              <div className="flex-1 p-6 lg:p-8 flex flex-col gap-6 lg:border-r border-slate-800/80">

                {/* Top Customers Quick Add */}
                {topCustomers.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <span className="text-sm uppercase tracking-wider font-bold text-slate-500 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500/20" /> Quick Select (Favorites)
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {topCustomers.map((name, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setCustomerName(name);
                            const matchedCustomer = customersList?.find(c => c.name === name);
                            if (matchedCustomer && matchedCustomer.phone && !whatsappNumber) {
                              setWhatsappNumber(matchedCustomer.phone);
                            }
                          }}
                          className="text-sm font-bold px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all truncate max-w-[200px] shadow-sm"
                          title={name}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Customer Details */}
                <div className="flex flex-col gap-3">
                  <span className="text-sm uppercase tracking-wider font-bold text-slate-500">Customer Details</span>
                  <div className="flex gap-4">
                    <CustomerInput
                      customerName={customerName}
                      setCustomerName={setCustomerName}
                      customersList={customersList}
                      whatsappNumber={whatsappNumber}
                      setWhatsappNumber={setWhatsappNumber}
                      isCredit={isCredit}
                    />
                    <div className="w-36 relative">
                      <input
                        type="number"
                        placeholder="Discount"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        className="w-full text-base bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-5 py-4 focus:outline-none focus:border-emerald-500/50 transition-all text-right shadow-inner"
                      />
                    </div>
                  </div>
                  {currentCustomerArrears > 0 && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex justify-between items-center mt-2 shadow-inner">
                      <span className="text-sm font-bold text-red-400 uppercase tracking-wider">Previous Arrears:</span>
                      <span className="text-xl font-black text-red-400 flex items-baseline gap-1"><span className="text-xs font-bold opacity-75">Rs</span>{currentCustomerArrears.toFixed(2)}</span>
                    </div>
                  )}
                  {currentCustomerAdvance > 0 && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex justify-between items-center mt-2 shadow-inner">
                      <span className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Available Advance:</span>
                      <span className="text-xl font-black text-emerald-400 flex items-baseline gap-1"><span className="text-xs font-bold opacity-75">Rs</span>{currentCustomerAdvance.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Credit Checkbox */}
                <div className="flex items-center gap-3 px-2 py-1">
                  <input
                    type="checkbox"
                    id="isCredit"
                    checked={isCredit}
                    onChange={(e) => setIsCredit(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/50 bg-slate-950 cursor-pointer"
                  />
                  <label htmlFor="isCredit" className="text-base font-semibold text-slate-300 cursor-pointer select-none">
                    Save as Credit Sale (Add to Customer Account)
                  </label>
                </div>

                <div className="flex-1"></div> {/* Spacer */}

              </div>

              {/* Right Column: Payment & Summary */}
              <div className="w-full lg:w-[420px] bg-slate-950/40 p-6 lg:p-8 flex flex-col gap-6 shrink-0">

                {/* Cash & Balance */}
                <div className="flex flex-col gap-5 bg-slate-900/80 p-6 rounded-2xl border border-slate-800/80 shadow-inner">
                  <div className="relative">
                    <span className="text-sm text-slate-400 uppercase tracking-wider block mb-2 font-bold">Cash Given</span>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-xl">Rs</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={cashGiven}
                        onChange={(e) => setCashGiven(e.target.value)}
                        className="w-full text-2xl bg-slate-950 border border-slate-700 text-emerald-400 font-black rounded-xl pl-14 pr-4 py-4 focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="h-px bg-slate-800 w-full"></div>

                  <div className="text-right">
                    {(() => {
                      // Apply advance automatically to the bill if they have it
                      let billAfterAdvance = Math.max(0, cartTotal - Number(discount || 0)) - currentCustomerAdvance;
                      billAfterAdvance = Math.max(0, billAfterAdvance); // Bill can't be negative

                      const finalTotal = billAfterAdvance + currentCustomerArrears;
                      const cash = cashGiven === '' ? 0 : Number(cashGiven);
                      const diff = cash - finalTotal;

                      let colorClass = 'text-red-400';
                      let label = 'Amount Due';
                      let displayDiff = '0.00';
                      let showKeepAdvanceCheckbox = false;
                      let checkboxAmount = 0;

                      if (cashGiven === '') {
                        if (currentCustomerAdvance > 0 && (currentCustomerAdvance - Math.max(0, cartTotal - Number(discount || 0))) > 0) {
                          const remainingAdvance = currentCustomerAdvance - Math.max(0, cartTotal - Number(discount || 0));
                          colorClass = 'text-blue-400';
                          label = 'Change Due (Give Back / Keep)';
                          displayDiff = remainingAdvance.toFixed(2);
                          showKeepAdvanceCheckbox = true;
                          checkboxAmount = remainingAdvance;
                        } else {
                          colorClass = 'text-slate-300';
                          label = 'Pending Amount';
                          displayDiff = finalTotal.toFixed(2);
                        }
                      } else {
                        if (diff === 0) {
                          colorClass = 'text-emerald-400';
                          label = 'No Change';
                          displayDiff = '0.00';
                        } else if (diff > 0) {
                          colorClass = 'text-blue-400';
                          label = 'Change Due (Give Back)';
                          displayDiff = diff.toFixed(2);
                          showKeepAdvanceCheckbox = true;
                          checkboxAmount = diff;
                        } else {
                          colorClass = 'text-red-400';
                          label = 'Short Amount (Need More)';
                          displayDiff = Math.abs(diff).toFixed(2);
                        }
                      }

                      return (
                        <>
                          <span className="text-sm text-slate-400 uppercase tracking-wider block mb-1 font-bold">{label}</span>
                          <span className={`text-4xl font-black ${colorClass} flex items-baseline justify-end gap-1.5`}>
                            <span className="text-xl font-bold opacity-75">Rs</span>
                            {displayDiff}
                          </span>

                          {showKeepAdvanceCheckbox && customerName.trim() !== '' && (
                            <div className="mt-4 flex items-center justify-end gap-3 px-2 py-1">
                              <input
                                type="checkbox"
                                id="keepChangeAsAdvance"
                                checked={keepChangeAsAdvance}
                                onChange={(e) => setKeepChangeAsAdvance(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-700 text-blue-500 focus:ring-blue-500/50 bg-slate-950 cursor-pointer"
                              />
                              <label htmlFor="keepChangeAsAdvance" className="text-sm font-semibold text-slate-300 cursor-pointer select-none">
                                Keep Change (Rs {checkboxAmount.toFixed(2)}) as Advance
                              </label>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="flex-1"></div>

                {/* Total & Submit */}
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-end pt-2 pb-2">
                    <span className="text-sm text-slate-400 font-extrabold uppercase tracking-widest mb-1">Final Total</span>
                    <span className="text-4xl font-black text-emerald-400 drop-shadow-sm flex items-baseline gap-2">
                      <span className="text-xl font-bold opacity-75">Rs</span>
                      {(Math.max(0, cartTotal - Number(discount || 0)) + currentCustomerArrears).toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={async () => {
                      // Wait, we need to automatically check keepChangeAsAdvance if we default it? 
                      // Actually, if we don't pass keepChangeAsAdvance, index.jsx naturally keeps the advance if cashGiven is empty.
                      // Let's pass keepChangeAsAdvance.
                      const success = await handleCheckout(customerName, discount, isCredit, cashGiven, currentCustomerArrears, currentCustomerAdvance, keepChangeAsAdvance);
                      if (success) {
                        setShowPaymentModal(false);
                        setCashGiven('');
                        setCustomerName('');
                        setDiscount('');
                        setIsCredit(false);
                        setKeepChangeAsAdvance(false);
                      }
                    }}
                    disabled={cart.length === 0 || checkoutLoading || (!isCredit && cashGiven && Number(cashGiven) < Math.max(0, Math.max(0, cartTotal - Number(discount || 0)) - currentCustomerAdvance) + currentCustomerArrears) || (isCredit && !customerName.trim())}
                    className={`w-full mt-2 ${isCredit ? 'bg-red-500 hover:bg-red-400' : 'bg-emerald-500 hover:bg-emerald-400'} shadow-md hover:shadow-lg text-slate-950 font-black py-5 disabled:opacity-50 transition-all rounded-2xl flex items-center justify-center text-xl uppercase tracking-wide`}
                  >
                    {checkoutLoading ? 'Processing...' : isCredit ? 'Confirm Credit Sale' : 'Confirm Order & Pay'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Save Pending Modal */}
      {showSavePendingModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-100 uppercase tracking-wide">Save Pending Order</h3>
              <button onClick={() => setShowSavePendingModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex flex-col gap-3">
                <span className="text-sm uppercase tracking-wider font-bold text-slate-500">Customer Details</span>
                <CustomerInput
                  customerName={pendingCustomerName}
                  setCustomerName={setPendingCustomerName}
                  customersList={customersList}
                  whatsappNumber={pendingWhatsappNumber}
                  setWhatsappNumber={setPendingWhatsappNumber}
                  isCredit={true}
                />
              </div>
              <button
                onClick={handleSavePending}
                disabled={pendingLoading || !pendingCustomerName.trim()}
                className="w-full bg-orange-500 hover:bg-orange-400 text-slate-950 font-black py-4 rounded-xl text-lg uppercase tracking-wide transition-all disabled:opacity-50"
              >
                {pendingLoading ? 'Saving...' : 'Save Pending Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={!!pendingToDelete}
        onClose={() => setPendingToDelete(null)}
        onConfirm={confirmDeletePending}
        title="Delete Pending Order?"
        message="Are you sure you want to delete this pending order? This action cannot be undone."
      />

      {/* WhatsApp Reminder Modal */}
      {reminderModalData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="text-lg font-black text-slate-100 uppercase tracking-wide flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-400" /> Send Reminder
              </h3>
              <button onClick={() => setReminderModalData(null)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-400">
                Send a WhatsApp message to <span className="text-slate-200 font-bold">{reminderModalData.order.note}</span> that their order is ready.
              </p>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                  WhatsApp Number
                </label>
                <input
                  type="text"
                  autoFocus
                  value={reminderWhatsapp}
                  onChange={(e) => setReminderWhatsapp(e.target.value)}
                  placeholder="07XXXXXXXX"
                  className="w-full text-lg bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendReminder();
                  }}
                />
              </div>
              <button
                onClick={handleSendReminder}
                disabled={!reminderWhatsapp.trim() || isUpdatingCustomer}
                className="w-full bg-blue-500 hover:bg-blue-400 text-slate-950 font-black py-3.5 rounded-xl text-sm uppercase tracking-wide transition-all disabled:opacity-50 mt-2"
              >
                {isUpdatingCustomer ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
