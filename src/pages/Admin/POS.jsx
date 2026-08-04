import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ShoppingCart, Minus, Plus, Trash2, Printer, MessageCircle, Search, Package, RefreshCw } from 'lucide-react';
import * as Icons from 'lucide-react';
import { FcPackage, FcPrint, FcTemplate, FcDocument, FcRules, FcImageFile, FcDataBackup, FcCommandLine, FcSettings } from 'react-icons/fc';
import { notify } from '../../utils/toast';
import { generateInvoiceHtml } from '../../utils/invoiceTemplate';

const ICON_MAP = {
  'Package': FcPackage,
  'Printer': FcPrint,
  'Layers': FcTemplate,
  'FileText': FcDocument,
  'Type': FcRules,
  'Image': FcImageFile,
  'Download': FcDataBackup,
  'Code': FcCommandLine,
  'Settings': FcSettings
};

// Memoized Components for Performance
const POSItem = React.memo(({ item, addToCart }) => (
  <button
    onClick={() => addToCart(item)}
    className="relative group bg-slate-900 border border-slate-800 flex flex-col text-left transition-colors hover:border-emerald-500/40 rounded-xl h-28 w-full shadow-none overflow-hidden"
  >
    <div className="flex-1 p-3.5 flex items-start z-10">
      <span className="font-semibold text-slate-200 text-[13px] leading-tight line-clamp-2">{item.name}</span>
    </div>
    <div className="bg-slate-950 w-full px-3.5 py-2 border-t border-slate-800 mt-auto z-10 transition-colors">
      <span className="text-emerald-400 font-bold text-[14px] tracking-wide">
        {item.price === 0 ? 'Custom' : `Rs ${item.price.toFixed(2)}`}
      </span>
    </div>
  </button>
));

const CategoryTab = React.memo(({ cat, isActive, onClick }) => {
  const CatIcon = ICON_MAP[cat.icon] || FcPackage;
  return (
    <button
      onClick={onClick}
      className={`relative shrink-0 flex flex-col justify-center items-center w-28 h-20 border transition-colors rounded-2xl p-2 overflow-hidden ${
        isActive 
          ? 'border-emerald-500/40 bg-emerald-900/30' 
          : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
      }`}
    >
      <div className="z-10 w-full h-full relative overflow-hidden flex flex-col items-center justify-center">
        {CatIcon && <CatIcon className={`w-6 h-6 mb-1 drop-shadow-sm`} />}
        <span className={`text-[11px] font-extrabold tracking-widest uppercase text-center leading-tight ${isActive ? 'text-emerald-400' : 'text-slate-100'}`}>
          {cat.category}
        </span>
      </div>
    </button>
  );
});

const CartItem = React.memo(({ item, updateCartItem, removeFromCart }) => (
  <div className="flex items-center justify-between py-3 px-1 border-b border-slate-800 group">
    <button onClick={() => removeFromCart(item.id)} className="text-slate-600 hover:text-red-400 mr-2 transition-colors">
      <Trash2 className="w-4 h-4" />
    </button>
    <span className="font-medium text-[13px] text-slate-300 flex-1 truncate mr-2">{item.name}</span>
    <div className="flex items-center space-x-1 w-20 justify-center">
      <button onClick={() => updateCartItem(item.id, 'qty', Number(item.qty) - 1)} className="text-emerald-400 hover:bg-emerald-900/30 rounded-full p-0.5 transition-colors shrink-0">
        <Minus className="w-3 h-3" />
      </button>
      <input
        type="number"
        value={item.qty}
        onChange={(e) => updateCartItem(item.id, 'qty', e.target.value)}
        className="w-8 text-center text-[13px] font-bold text-slate-200 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-emerald-500/50 focus:outline-none transition-colors"
      />
      <button onClick={() => updateCartItem(item.id, 'qty', Number(item.qty) + 1)} className="text-emerald-400 hover:bg-emerald-900/30 rounded-full p-0.5 transition-colors shrink-0">
        <Plus className="w-3 h-3" />
      </button>
    </div>
    <div className="w-20 text-right">
      {item.id === 'cu-1' || item.price === 0 ? (
        <input
          type="number"
          value={item.price}
          onChange={(e) => updateCartItem(item.id, 'price', Number(e.target.value))}
          className="w-16 bg-slate-900 text-emerald-400 font-bold px-1.5 py-1 rounded-md border border-slate-800 text-right text-[13px] focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
        />
      ) : (
        <span className="text-slate-200 font-bold text-[13px]">Rs {(item.price * item.qty).toFixed(2)}</span>
      )}
    </div>
  </div>
));

const CustomerInput = React.memo(({ customerName, setCustomerName, customersList, whatsappNumber, setWhatsappNumber, isCredit }) => {
  const [localVal, setLocalVal] = useState(customerName);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setLocalVal(customerName);
  }, [customerName]);

  const commitChange = (val) => {
    setCustomerName(val);
    const matchedCustomer = customersList.find(c => c.name === val);
    if (matchedCustomer && matchedCustomer.phone && !whatsappNumber) {
      setWhatsappNumber(matchedCustomer.phone);
    }
  };

  const filteredCustomers = customersList.filter(c => c.name.toLowerCase().includes(localVal.toLowerCase()));

  return (
    <div className="flex-1 relative">
      <div className="relative">
        <input
          type="text"
          placeholder={isCredit ? "Customer Name (Required)" : "Customer Name (Optional)"}
          value={localVal}
          onChange={(e) => {
            setLocalVal(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={(e) => {
            const val = e.target.value;
            setTimeout(() => {
              setShowDropdown(false);
              commitChange(val);
            }, 200);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const val = e.target.value.trim().toLowerCase();
              if (val) {
                const exactMatch = customersList.find(c => c.name.toLowerCase().startsWith(val));
                const match = exactMatch || customersList.find(c => c.name.toLowerCase().includes(val));
                if (match && match.name !== localVal) {
                  e.preventDefault();
                  setLocalVal(match.name);
                  commitChange(match.name);
                  setShowDropdown(false);
                }
              }
            }
          }}
          className={`w-full text-base bg-slate-950 border ${isCredit && !localVal.trim() ? 'border-red-500/50' : 'border-slate-800'} text-slate-200 rounded-xl px-5 py-4 focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner`}
        />
        <div 
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 cursor-pointer p-1.5 hover:bg-slate-800 rounded-full transition-colors"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <Icons.ChevronDown className={`w-5 h-5 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </div>
      </div>
      
      {showDropdown && filteredCustomers.length > 0 && (
        <div className="absolute z-50 mt-2 w-full max-h-60 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl custom-scrollbar py-1">
          {filteredCustomers.map((c, idx) => (
            <div 
              key={idx}
              className="px-5 py-3 hover:bg-slate-800 cursor-pointer text-slate-200 font-bold border-b border-slate-800/50 last:border-0 flex items-center justify-between"
              onClick={() => {
                setLocalVal(c.name);
                commitChange(c.name);
                setShowDropdown(false);
              }}
            >
              <span>{c.name}</span>
              {c.phone && <span className="text-slate-500 text-xs font-normal bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">{c.phone}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

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
  refreshPOSData
}) {
  const topCustomers = useMemo(() => {
    if (salesHistory && salesHistory.length > 0) {
      const customerTotals = {};
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      salesHistory.forEach(sale => {
        if (sale.timestamp && sale.customerName && sale.customerName.trim() !== '') {
          let d = new Date();
          if (typeof sale.timestamp.toDate === 'function') d = sale.timestamp.toDate();
          else if (sale.timestamp.seconds) d = new Date(sale.timestamp.seconds * 1000);
          else d = new Date(sale.timestamp);

          if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            const name = sale.customerName.trim();
            customerTotals[name] = (customerTotals[name] || 0) + Number(sale.amount || 0);
          }
        }
      });
      
      const tops = Object.entries(customerTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7)
        .map(([name]) => name);
        
      localStorage.setItem('topCustomersThisMonth', JSON.stringify(tops));
      return tops;
    } else {
      const cached = localStorage.getItem('topCustomersThisMonth');
      return cached ? JSON.parse(cached) : [];
    }
  }, [salesHistory]);

  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cashGiven, setCashGiven] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [discount, setDiscount] = useState('');
  const [isCredit, setIsCredit] = useState(false);

  const currentCustomerArrears = useMemo(() => {
    if (!customerName || customerName.trim() === '') return 0;
    const nameMatch = customerName.trim().toLowerCase();
    
    return customerDuesList
      .filter(due => due.name && due.name.toLowerCase() === nameMatch)
      .reduce((sum, due) => sum + Number(due.amount || 0), 0);
  }, [customerName, customerDuesList]);

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

  const activeCategory = posCategories[activeCategoryIndex] || null;

  // Optimize filtering to not run on every cart update
  const filteredItems = useMemo(() => {
    return searchQuery.trim() !== ''
      ? posCategories.flatMap(cat => 
          (cat.items || []).filter(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        )
      : (activeCategory ? activeCategory.items : []);
  }, [posCategories, activeCategoryIndex, searchQuery]);

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
        
        <div className="z-10 relative flex flex-col h-full p-6">
        
        {/* Top Bar: Search and Refresh */}
        <div className="flex mb-6 gap-3 items-center">
          <div className={`flex relative transition-all duration-300 h-10 ${isSearchExpanded ? 'w-full max-w-2xl' : 'w-10'}`}>
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
                  className="pl-11 pr-10 py-5 bg-slate-900 border border-slate-800 focus-visible:ring-emerald-500/40 rounded-xl text-sm w-full text-slate-200 placeholder:text-slate-500 transition-colors focus:outline-none"
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
                  <Minus className="w-[18px] h-[18px] rotate-45" />
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
              window.location.href = '/admin';
            }}
            className="w-10 h-10 flex shrink-0 items-center justify-center text-slate-400 hover:text-emerald-400 rounded-full bg-slate-900 border border-slate-800 shadow-none transition-colors"
            title="Refresh Items (Double click for Hard Reset)"
          >
            <RefreshCw className="w-[18px] h-[18px]" />
          </button>

          {/* Custom Item Button */}
          <button
            onClick={() => handleAddToCart({
              id: 'custom-' + Date.now(),
              name: 'Custom Service / Utilities',
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

        {/* Middle Area: Items Grid */}
        <div className="flex-1 overflow-y-auto mb-6 pr-2 relative" style={{ scrollbarWidth: 'thin' }}>
          
          {/* Background Category Icon */}
          {activeCategory && activeCategory.icon && (() => {
            const Icon = ICON_MAP[activeCategory.icon];
            return Icon ? (
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden">
                <Icon className="w-[30rem] h-[30rem] grayscale" />
              </div>
            ) : null;
          })()}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 relative z-10">
            {filteredItems.map((item) => (
              <POSItem key={`${item.id}-${item.name}`} item={item} addToCart={handleAddToCart} />
            ))}
          </div>
          {filteredItems.length === 0 && (
            <div className="text-center text-slate-500 mt-10">No items found for "{searchQuery}"</div>
          )}
        </div>

        {/* Bottom Area: Category Tabs */}
        <div className="flex overflow-x-auto gap-3 pb-2 snap-x snap-mandatory no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {posCategories.map((cat, idx) => (
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
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-full lg:w-[420px] bg-slate-950 border-l border-slate-800 p-6 flex flex-col shrink-0 z-20">
        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
          <h2 className="text-lg font-extrabold text-slate-100 uppercase tracking-wide">
            Current Order
          </h2>
          {cart.length > 0 && (
            <button 
              onClick={() => setCart([])}
              className="h-8 flex items-center justify-center rounded-lg text-[11px] uppercase tracking-wider font-bold px-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-900/30 transition-colors"
            >
              <Trash2 className="w-3 h-3 mr-1.5" /> Clear
            </button>
          )}
        </div>

        <div className="flex text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
          <div className="flex-1">Name</div>
          <div className="w-16 text-center">Qty</div>
          <div className="w-20 text-right">Price</div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {cart.length === 0 ? (
            <div className="text-slate-500 text-center mt-10">Cart is empty</div>
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
            <span className="text-slate-300 font-bold uppercase tracking-wider">Total</span>
            <span className="text-3xl font-black text-emerald-400">Rs {cartTotal.toFixed(2)}</span>
          </div>

          <button
            onClick={() => setShowPaymentModal(true)}
            disabled={cart.length === 0}
            className="w-full bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] text-slate-950 font-extrabold py-4 disabled:opacity-50 transition-all rounded-xl flex items-center justify-center text-lg uppercase tracking-wide"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/80 shrink-0">
              <h2 className="text-2xl font-black text-slate-100 uppercase tracking-widest flex items-center gap-3">
                <ShoppingCart className="w-6 h-6 text-emerald-500" />
                Complete Sale
              </h2>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-red-400 transition-colors p-2 bg-slate-800/50 hover:bg-slate-800 rounded-full"
              >
                <Icons.X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col lg:flex-row h-full overflow-y-auto no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              
              {/* Left Column: Customer & Details */}
              <div className="flex-1 p-6 lg:p-8 flex flex-col gap-6 lg:border-r border-slate-800/80">
                
                {/* Top Customers Quick Add */}
                {topCustomers.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <span className="text-sm uppercase tracking-wider font-bold text-slate-500">Quick Select (Top 7 This Month)</span>
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

                {/* Options: Print, WhatsApp */}
                <div className="flex gap-4 h-14 mt-6">
                  <button
                    onClick={handlePrint}
                    className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all rounded-xl flex items-center justify-center border border-slate-700 shadow-md font-bold gap-2"
                    title="Print Bill"
                  >
                    <Printer className="w-5 h-5" /> Print
                  </button>
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-base">+94</span>
                    <input
                      type="text"
                      placeholder="WhatsApp Number"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="w-full h-full text-base bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-14 pr-4 focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner"
                    />
                  </div>
                  <button
                    onClick={sendWhatsAppBill}
                    className="px-6 bg-emerald-900/30 hover:bg-emerald-800/50 border border-emerald-500/30 text-emerald-400 transition-all rounded-xl flex items-center justify-center shadow-md font-bold gap-2"
                    title="Send to WhatsApp"
                  >
                    <MessageCircle className="w-5 h-5" /> Send
                  </button>
                </div>
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
                      const finalTotal = Math.max(0, cartTotal - Number(discount || 0)) + currentCustomerArrears;
                      const cash = cashGiven === '' ? 0 : Number(cashGiven);
                      const diff = cash - finalTotal;
                      
                      let colorClass = 'text-red-400';
                      let label = 'Amount Due';
                      
                      if (cashGiven === '') {
                        colorClass = 'text-slate-300';
                        label = 'Pending Amount';
                      } else if (diff === 0) {
                        colorClass = 'text-emerald-400';
                        label = 'No Change';
                      } else if (diff > 0) {
                        colorClass = 'text-blue-400';
                        label = 'Change Due (Give Back)';
                      } else {
                        colorClass = 'text-red-400';
                        label = 'Short Amount (Need More)';
                      }

                      const displayDiff = cashGiven === '' ? finalTotal.toFixed(2) : Math.abs(diff).toFixed(2);

                      return (
                        <>
                          <span className="text-sm text-slate-400 uppercase tracking-wider block mb-1 font-bold">{label}</span>
                          <span className={`text-4xl font-black ${colorClass} flex items-baseline justify-end gap-1.5`}>
                            <span className="text-xl font-bold opacity-75">Rs</span>
                            {displayDiff}
                          </span>
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
                    <span className="text-4xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-baseline gap-2">
                      <span className="text-xl font-bold opacity-75">Rs</span>
                      {(Math.max(0, cartTotal - Number(discount || 0)) + currentCustomerArrears).toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={async () => {
                      const success = await handleCheckout(customerName, discount, isCredit, cashGiven, currentCustomerArrears);
                      if (success) {
                        setCashGiven('');
                        setCustomerName('');
                        setWhatsappNumber('');
                        setDiscount('');
                        setIsCredit(false);
                        setShowPaymentModal(false);
                      }
                    }}
                    disabled={cart.length === 0 || checkoutLoading || (!isCredit && cashGiven && Number(cashGiven) < Math.max(0, cartTotal - Number(discount || 0)) + currentCustomerArrears) || (isCredit && !customerName.trim())}
                    className={`w-full mt-2 ${isCredit ? 'bg-red-500 hover:bg-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'} text-slate-950 font-black py-5 disabled:opacity-50 transition-all rounded-2xl flex items-center justify-center text-xl uppercase tracking-wide`}
                  >
                    {checkoutLoading ? 'Processing...' : isCredit ? 'Confirm Credit Sale' : 'Confirm Order & Pay'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
