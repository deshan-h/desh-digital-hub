import React, { useState, useMemo, useEffect, useDeferredValue } from 'react';
import { Trash2, Minus, Plus, Star, Search, ChevronDown, ChevronLeft, ChevronRight, X, MessageCircle } from 'lucide-react';
import { FcPackage, FcPrint, FcTemplate, FcDocument, FcRules, FcImageFile, FcDataBackup, FcCommandLine, FcSettings, FcGlobe } from 'react-icons/fc';

export const ICON_MAP = {
  'Package': FcPackage,
  'Printer': FcPrint,
  'Layers': FcTemplate,
  'FileText': FcDocument,
  'Type': FcRules,
  'Image': FcImageFile,
  'Download': FcDataBackup,
  'Code': FcCommandLine,
  'Settings': FcSettings,
  'Globe': FcGlobe
};

export const POSItem = React.memo(({ item, addToCart, isFavorite, onToggleFavorite }) => (
  <button
    onClick={() => addToCart(item)}
    className="relative group bg-[#090d16] border border-slate-800/80 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 flex flex-col text-left transition-all rounded-xl h-24 w-full shadow-none overflow-hidden cursor-pointer"
  >
    <div 
      className="absolute top-2 right-2 p-1.5 z-20 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
      onClick={(e) => onToggleFavorite(e, item)}
    >
      <Star className={`w-[14px] h-[14px] transition-colors ${isFavorite ? 'text-amber-400 fill-amber-400' : 'text-slate-600 hover:text-amber-400'}`} />
    </div>
    <div className="flex-1 p-3 flex items-start z-10 pr-8">
      <span className="font-bold text-slate-200 text-xs leading-snug line-clamp-2 group-hover:text-white transition-colors">{item.name}</span>
    </div>
    <div className="bg-slate-900/90 w-full px-3 py-1.5 border-t border-slate-800/80 mt-auto z-10 flex items-center justify-between transition-colors">
      <span className="text-emerald-400 font-bold font-mono text-xs tracking-wide">
        {item.price === 0 ? 'Custom' : `Rs ${item.price.toFixed(2)}`}
      </span>
      <span className="text-[10px] text-slate-400 group-hover:text-sky-400 font-bold transition-colors">
        + Add
      </span>
    </div>
  </button>
));

export const CategoryTab = React.memo(({ cat, isActive, onClick }) => {
  let CatIcon = ICON_MAP[cat.category === 'Online Services' ? 'Globe' : (cat.icon || 'Package')] || FcPackage;
  if (cat.category === 'Favorites') CatIcon = Star;

  return (
    <button
      onClick={onClick}
      className={`relative shrink-0 flex flex-col items-center w-28 h-24 border transition-colors rounded-2xl p-2 overflow-hidden ${
        isActive 
          ? 'border-emerald-500/40 bg-emerald-900/30' 
          : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
      }`}
    >
      <div className="z-10 w-full h-full relative flex flex-col items-center">
        {CatIcon && <CatIcon className={`w-6 h-6 mt-0.5 shrink-0 drop-shadow-sm ${cat.category === 'Favorites' ? 'text-yellow-400 fill-yellow-400' : ''}`} />}
        <div className="flex-1 w-full flex items-center justify-center mt-1">
          <span className={`text-[10px] font-extrabold tracking-widest uppercase text-center leading-tight ${isActive ? 'text-emerald-400' : 'text-slate-100'}`}>
            {cat.category}
          </span>
        </div>
      </div>
    </button>
  );
});

export const CartItem = React.memo(({ item, updateCartItem, removeFromCart }) => (
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
      {item.id === 'cu-1' || String(item.id).startsWith('custom-') ? (
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

export const POSItemsGrid = React.memo(({ filteredItems, handleAddToCart, favoriteItemIds, toggleFavorite, activeCategory, searchQuery }) => (
  <div className="flex-1 overflow-y-auto mb-6 pr-2 relative" style={{ scrollbarWidth: 'thin' }}>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 relative z-10">
      {filteredItems.map((item) => (
        <POSItem 
          key={`${item.id}-${item.name}`} 
          item={item} 
          addToCart={handleAddToCart} 
          isFavorite={item.isFavorite === true || item.favorite === true || (favoriteItemIds && favoriteItemIds.includes(item.id))}
          onToggleFavorite={toggleFavorite}
        />
      ))}
    </div>
    {filteredItems.length === 0 && (
      <div className="text-center text-slate-500 mt-10">
        {activeCategory?.category === 'Favorites' 
          ? "No favorites yet. Click the star icon on any item to add it here." 
          : `No items found for "${searchQuery}"`}
      </div>
    )}
  </div>
));

export const CustomerInput = React.memo(({ 
  customerName, 
  setCustomerName, 
  customersList = [], 
  whatsappNumber, 
  setWhatsappNumber, 
  isCredit,
  favoriteCustomers = [],
  onToggleFavorite
}) => {
  const [localVal, setLocalVal] = useState(customerName);
  const deferredLocalVal = useDeferredValue(localVal);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setLocalVal(customerName);
  }, [customerName]);

  const commitChange = (val) => {
    setCustomerName(val);
    const matchedCustomer = customersList?.find(c => c.name === val);
    if (matchedCustomer && matchedCustomer.phone && !whatsappNumber) {
      setWhatsappNumber(matchedCustomer.phone);
    }
  };

  const isCurrentFav = useMemo(() => {
    const trimmed = (localVal || '').trim().toLowerCase();
    if (!trimmed) return false;
    const match = customersList?.find(c => c.name?.toLowerCase() === trimmed);
    if (match && match.mostVisited !== undefined) return Boolean(match.mostVisited);
    return favoriteCustomers?.some(n => n?.toLowerCase() === trimmed) || false;
  }, [localVal, customersList, favoriteCustomers]);

  const filteredCustomers = useMemo(() => {
    const searchVal = deferredLocalVal.toLowerCase().trim();
    if (!customersList) return [];
    if (!searchVal) return customersList.slice(0, 30);
    
    const results = [];
    for (let i = 0; i < customersList.length; i++) {
      if (customersList[i].name?.toLowerCase().includes(searchVal)) {
        results.push(customersList[i]);
        if (results.length >= 30) break;
      }
    }
    return results;
  }, [customersList, deferredLocalVal]);

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
            // Short timeout to allow click on dropdown or star before closing
            setTimeout(() => {
              setShowDropdown(false);
            }, 200);
            commitChange(val);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const val = e.target.value.trim().toLowerCase();
              if (val) {
                const exactMatch = customersList?.find(c => c.name?.toLowerCase().startsWith(val));
                const match = exactMatch || customersList?.find(c => c.name?.toLowerCase().includes(val));
                if (match && match.name !== localVal) {
                  e.preventDefault();
                  setLocalVal(match.name);
                  commitChange(match.name);
                  setShowDropdown(false);
                }
              }
            }
          }}
          className={`w-full text-xs bg-[#090d16] border ${isCredit && !localVal.trim() ? 'border-rose-500/50' : 'border-slate-800/80'} text-slate-200 rounded-xl pl-3.5 pr-14 py-2.5 focus:outline-none focus:border-blue-500/60 transition-all shadow-inner`}
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {localVal.trim() && onToggleFavorite && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onToggleFavorite(localVal.trim());
              }}
              className={`p-1 rounded-lg border transition-all ${
                isCurrentFav 
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 shadow-[0_0_10px_rgba(234,179,8,0.2)]' 
                  : 'border-slate-800 bg-slate-900/80 text-slate-500 hover:text-amber-400 hover:border-amber-500/30'
              }`}
              title={isCurrentFav ? "Favorited (Click to remove)" : "Add to Favorites"}
            >
              <Star className={`w-3.5 h-3.5 ${isCurrentFav ? 'fill-amber-400 text-amber-400' : 'text-current'}`} />
            </button>
          )}
          <div 
            className="text-slate-500 cursor-pointer p-1 hover:bg-slate-800 rounded-full transition-colors"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>
      
      {showDropdown && filteredCustomers.length > 0 && (
        <div 
          className="absolute z-[70] bottom-full mb-1.5 w-full max-h-52 overflow-y-auto bg-[#0b101d] border border-slate-800/90 rounded-xl shadow-2xl custom-scrollbar py-1"
          style={{ colorScheme: 'dark' }}
        >
          {filteredCustomers.map((c, idx) => {
            const isFav = Boolean(c.mostVisited) || (favoriteCustomers && favoriteCustomers.some(n => n?.toLowerCase() === c.name?.toLowerCase()));
            return (
              <div 
                key={idx}
                className="px-3 py-2 hover:bg-slate-800 cursor-pointer text-slate-200 text-sm font-semibold border-b border-slate-800/50 last:border-0 flex items-center justify-between transition-colors group"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setLocalVal(c.name);
                  commitChange(c.name);
                  setShowDropdown(false);
                }}
              >
                <div className="flex items-center gap-2 truncate">
                  {onToggleFavorite && (
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onToggleFavorite(c);
                      }}
                      className="p-1 rounded hover:bg-slate-700/80 transition-colors shrink-0"
                      title={isFav ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Star className={`w-3.5 h-3.5 ${isFav ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600 group-hover:text-slate-400'}`} />
                    </button>
                  )}
                  <span className="truncate">{c.name}</span>
                </div>
                {c.phone && <span className="text-slate-500 text-[11px] font-medium bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800/80 shrink-0">{c.phone}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

export const SavePendingModal = ({
  isOpen,
  onClose,
  pendingCustomerName,
  setPendingCustomerName,
  customersList,
  pendingWhatsappNumber,
  setPendingWhatsappNumber,
  favoriteCustomerNames,
  toggleCustomerFavorite,
  handleSavePending,
  pendingLoading
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-visible shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-100 uppercase tracking-wide">Save Pending Order</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
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
              favoriteCustomers={favoriteCustomerNames}
              onToggleFavorite={toggleCustomerFavorite}
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
  );
};

export const POSReminderModal = ({
  data,
  onClose,
  reminderWhatsapp,
  setReminderWhatsapp,
  handleSendReminder,
  isUpdatingCustomer
}) => {
  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h3 className="text-lg font-black text-slate-100 uppercase tracking-wide flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-400" /> Send Reminder
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-400">
            Send a WhatsApp message to <span className="text-slate-200 font-bold">{data.order?.note}</span> that their order is ready.
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
  );
};
