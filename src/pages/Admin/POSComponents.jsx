import React, { useState, useMemo, useEffect, useDeferredValue } from 'react';
import { Trash2, Minus, Plus, Star, Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
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
    className="relative group bg-slate-900 border border-slate-800 flex flex-col text-left transition-colors hover:border-emerald-500/40 rounded-xl h-24 w-full shadow-none overflow-hidden"
  >
    <div 
      className="absolute top-2 right-2 p-1.5 z-20 hover:bg-slate-800 rounded-full transition-colors"
      onClick={(e) => onToggleFavorite(e, item)}
    >
      <Star className={`w-[14px] h-[14px] transition-colors ${isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600 hover:text-yellow-400'}`} />
    </div>
    <div className="flex-1 p-3.5 flex items-start z-10 pr-8">
      <span className="font-semibold text-slate-200 text-[13px] leading-tight line-clamp-2">{item.name}</span>
    </div>
    <div className="bg-slate-950 w-full px-3.5 py-2 border-t border-slate-800 mt-auto z-10 transition-colors">
      <span className="text-emerald-400 font-bold text-[14px] tracking-wide">
        {item.price === 0 ? 'Custom' : `Rs ${item.price.toFixed(2)}`}
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
          isFavorite={favoriteItemIds.includes(item.id)}
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

export const CustomerInput = React.memo(({ customerName, setCustomerName, customersList, whatsappNumber, setWhatsappNumber, isCredit }) => {
  const [localVal, setLocalVal] = useState(customerName);
  const deferredLocalVal = useDeferredValue(localVal);
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

  const filteredCustomers = useMemo(() => {
    const searchVal = deferredLocalVal.toLowerCase().trim();
    if (!searchVal) return customersList.slice(0, 30);
    
    const results = [];
    for (let i = 0; i < customersList.length; i++) {
      if (customersList[i].name.toLowerCase().includes(searchVal)) {
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
            setShowDropdown(false);
            commitChange(val);
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
          <ChevronDown className={`w-5 h-5 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </div>
      </div>
      
      {showDropdown && filteredCustomers.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-h-52 overflow-y-auto bg-slate-900 border border-slate-700 rounded-lg shadow-2xl custom-scrollbar py-0.5">
          {filteredCustomers.map((c, idx) => (
            <div 
              key={idx}
              className="px-3 py-1.5 hover:bg-slate-800 cursor-pointer text-slate-200 text-sm font-semibold border-b border-slate-800/50 last:border-0 flex items-center justify-between transition-colors"
              onMouseDown={(e) => {
                e.preventDefault(); // Prevents onBlur from firing before we set the value
                setLocalVal(c.name);
                commitChange(c.name);
                setShowDropdown(false);
              }}
            >
              <span className="truncate pr-2">{c.name}</span>
              {c.phone && <span className="text-slate-500 text-[11px] font-medium bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800/80 shrink-0">{c.phone}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
