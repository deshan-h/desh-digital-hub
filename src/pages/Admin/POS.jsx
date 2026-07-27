import React, { useState, useMemo, useCallback } from 'react';
import { ShoppingCart, Minus, Plus, Trash2, Printer, MessageCircle, Search, Package, RefreshCw } from 'lucide-react';
import * as Icons from 'lucide-react';
import { FcPackage, FcPrint, FcTemplate, FcDocument, FcRules, FcImageFile, FcDataBackup, FcCommandLine, FcSettings } from 'react-icons/fc';

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
  customersList = []
}) {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cashGiven, setCashGiven] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [discount, setDiscount] = useState('');
  const [isCredit, setIsCredit] = useState(false);

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
              setCart([]);
              setSearchQuery('');
              setActiveCategoryIndex(0);
              setCustomerName('');
              setCashGiven('');
              setShowPaymentModal(false);
              setIsSearchExpanded(false);
            }}
            className="w-10 h-10 flex shrink-0 items-center justify-center text-slate-400 hover:text-emerald-400 rounded-full bg-slate-900 border border-slate-800 shadow-none transition-colors"
            title="Reset POS"
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

        <div className="pt-4 border-t border-slate-800/80 mt-4 flex flex-col gap-3">
          {/* Discount & Customer */}
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                list="customers-list"
                placeholder={isCredit ? "Customer Name (Req)" : "Customer Name (Opt)"}
                value={customerName}
                onChange={(e) => {
                  const val = e.target.value;
                  setCustomerName(val);
                  const matchedCustomer = customersList.find(c => c.name === val);
                  if (matchedCustomer && matchedCustomer.phone && !whatsappNumber) {
                    setWhatsappNumber(matchedCustomer.phone);
                  }
                }}
                className={`w-full text-xs bg-slate-900 border ${isCredit && !customerName.trim() ? 'border-red-500/50' : 'border-slate-800'} text-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-all`}
              />
              <datalist id="customers-list">
                {customersList.map(c => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
            </div>
            <div className="w-24 relative">
              <input
                type="number"
                placeholder="Discount"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full text-xs bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-all text-right"
              />
            </div>
          </div>

          {/* Credit Checkbox */}
          <div className="flex items-center gap-2 px-1">
            <input
              type="checkbox"
              id="isCredit"
              checked={isCredit}
              onChange={(e) => setIsCredit(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/50 bg-slate-900 cursor-pointer"
            />
            <label htmlFor="isCredit" className="text-xs font-semibold text-slate-400 cursor-pointer select-none">
              Save as Credit Sale (Customer Account)
            </label>
          </div>

          {/* Cash & Balance */}
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <input
                type="number"
                placeholder="Cash"
                value={cashGiven}
                onChange={(e) => setCashGiven(e.target.value)}
                className="w-full text-sm bg-slate-900 border border-slate-800 text-emerald-400 font-bold rounded-lg px-3 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>
            <div className="flex-1 bg-slate-800/30 border border-slate-800/50 rounded-lg px-3 py-2 text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block leading-none mb-1">Balance</span>
              {(() => {
                const finalTotal = Math.max(0, cartTotal - Number(discount || 0));
                const cash = cashGiven === '' ? 0 : Number(cashGiven);
                const diff = cash - finalTotal;
                
                let colorClass = 'text-red-400';
                if (cashGiven !== '') {
                  if (diff === 0) {
                    colorClass = 'text-emerald-400'; // Equal
                  } else if (diff > 0) {
                    colorClass = 'text-blue-400'; // Overpaid
                  } else {
                    colorClass = 'text-red-400'; // Underpaid
                  }
                }

                const displayDiff = Math.abs(diff).toFixed(2);
                const prefix = diff < 0 ? '-Rs ' : '+Rs ';
                const exactPrefix = diff === 0 ? 'Rs ' : prefix;

                return (
                  <span className={`text-[15px] font-black leading-none ${colorClass}`}>
                    {exactPrefix}{displayDiff}
                  </span>
                );
              })()}
            </div>
          </div>

          {/* Options: Print, WhatsApp */}
          <div className="flex gap-2 h-10">
            <button
              onClick={() => window.print()}
              className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all rounded-lg flex items-center justify-center border border-slate-700"
              title="Print Bill"
            >
              <Printer className="w-4 h-4" />
            </button>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">+94</span>
              <input
                type="text"
                placeholder="WhatsApp"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full h-full text-xs bg-slate-900 border border-slate-800 text-slate-200 rounded-lg pl-10 pr-3 focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>
            <button
              onClick={sendWhatsAppBill}
              className="px-4 bg-emerald-900/30 hover:bg-emerald-800/50 border border-emerald-500/30 text-emerald-400 transition-all rounded-lg flex items-center justify-center"
              title="Send to WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>

          <div className="flex justify-between items-center text-lg px-1 pt-2 border-t border-slate-800/80">
            <span className="text-slate-300 font-bold text-sm uppercase tracking-wider">Total</span>
            <span className="text-2xl font-black text-emerald-400">Rs {Math.max(0, cartTotal - Number(discount || 0)).toFixed(2)}</span>
          </div>

          <button
            onClick={async () => {
              const success = await handleCheckout(customerName, discount, isCredit, cashGiven);
              if (success) {
                setCashGiven('');
                setCustomerName('');
                setWhatsappNumber('');
                setDiscount('');
                setIsCredit(false);
              }
            }}
            disabled={cart.length === 0 || checkoutLoading || (!isCredit && cashGiven && Number(cashGiven) < Math.max(0, cartTotal - Number(discount || 0))) || (isCredit && !customerName.trim())}
            className={`w-full ${isCredit ? 'bg-red-500 hover:bg-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4)]' : 'bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]'} text-slate-950 font-extrabold py-3.5 disabled:opacity-50 transition-all rounded-xl flex items-center justify-center text-[15px]`}
          >
            {checkoutLoading ? 'Processing...' : isCredit ? 'Save as Credit Sale' : 'Complete Order'}
          </button>
        </div>
      </div>
    </div>
  );
}
