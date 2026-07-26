import React, { useState, useEffect } from 'react';
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { notify } from '../../utils/toast';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import { 
  Tags, Plus, Edit2, Trash2, Save, X, Printer, Layers, FileText, Image as ImageIcon, Download, Code, Settings, Package 
} from 'lucide-react';
import * as Icons from 'lucide-react';

const INITIAL_CATEGORIES = [
  { category: 'Printing & Scanning', icon: 'Printer', color: 'text-blue-400', items: [
    { id: 'ps-1', name: 'Printout / Photocopy [B/W]', price: 10 },
    { id: 'ps-2', name: 'Printout / Photocopy [Color]', price: 20 },
    { id: 'ps-3', name: 'Scan', price: 20 },
    { id: 'ps-4', name: 'Budget Print', price: 5 },
  ]},
  { category: 'Document Laminating', icon: 'Layers', color: 'text-emerald-400', items: [
    { id: 'lb-1', name: 'Laminating [NIC Size]', price: 50 },
    { id: 'lb-2', name: 'Laminating [A4]', price: 150 },
    { id: 'lb-3', name: 'Laminating [Legal]', price: 200 },
    { id: 'lb-4', name: 'Laminating [A3]', price: 250 },
  ]},
  { category: 'Book Binding', icon: 'FileText', color: 'text-orange-400', items: [
    { id: 'bb-1', name: 'Book Binding [pgs > 20]', price: 200 },
    { id: 'bb-2', name: 'Book Binding [pgs > 50]', price: 300 },
    { id: 'bb-3', name: 'Book Binding [pgs < 100]', price: 400 },
    { id: 'bb-4', name: 'Book Binding - Tape Binding', price: 250 },
  ]},
  { category: 'Type Setting', icon: 'Type', color: 'text-orange-400', items: [
    { id: 'ge-1', name: 'CV [Without Photo]', price: 250 },
    { id: 'ge-2', name: 'CV [With Photo]', price: 350 },
    { id: 'ge-3', name: 'CV [Advanced + ATS]', price: 800 },
    { id: 'ge-4', name: 'Name Tag', price: 120 },
    { id: 'ge-5', name: 'Name Stickers [Color]', price: 100 },
    { id: 'ge-6', name: 'Name Stickers [B/W]', price: 80 },
    { id: 'ge-7', name: 'Book Cover Design', price: 200 },
  ]},
  { category: 'Online Services', icon: 'Code', color: 'text-purple-400', items: [
    { id: 'os-1', name: 'Online App [Per Page]', price: 150 },
    { id: 'os-2', name: 'Campus Application', price: 400 },
    { id: 'os-3', name: 'Email', price: 50 },
    { id: 'os-4', name: 'Vehicle Licence renewal', price: 150 },
  ]},
  { category: 'Downloads & Media', icon: 'Download', color: 'text-yellow-400', items: [
    { id: 'dm-1', name: 'Images', price: 5 },
    { id: 'dm-2', name: 'Mp3 Songs', price: 1 },
    { id: 'dm-3', name: 'Movies', price: 50 },
    { id: 'dm-4', name: 'Video Songs', price: 20 },
    { id: 'dm-5', name: 'Software [1GB]', price: 100 },
    { id: 'dm-6', name: 'Games [1GB]', price: 100 },
    { id: 'dm-7', name: 'Exam Result Sheet', price: 50 },
  ]},
  { category: 'Custom & Utilities', icon: 'Settings', color: 'text-slate-400', items: [
    { id: 'cu-1', name: 'Custom Item', price: 0 },
  ]}
];

export default function ItemsManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // { catId, itemIndex, item }
  const [editingPrice, setEditingPrice] = useState("");
  const [editingCost, setEditingCost] = useState("");
  const [editingQty, setEditingQty] = useState("");
  const [editingName, setEditingName] = useState("");
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'pos_categories'));
      let data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Temporary Migration: Update 'Graphic & Editing' to 'Type Setting' in Firestore
      data = await Promise.all(data.map(async (cat) => {
        if (cat.category === 'Graphic & Editing') {
          cat.category = 'Type Setting';
          cat.icon = 'Type';
          cat.color = 'text-orange-400';
          try {
            await updateDoc(doc(db, 'pos_categories', cat.id), { 
              category: 'Type Setting', 
              icon: 'Type',
              color: 'text-orange-400'
            });
          } catch (e) {
            console.error("Migration update failed", e);
          }
        }
        return cat;
      }));

      const CATEGORY_ORDER = [
        "Printing & Scanning",
        "Document Laminating",
        "Book Binding",
        "Type Setting",
        "Online Services",
        "Downloads & Media",
        "Custom & Utilities"
      ];
      
      data.sort((a, b) => {
        let indexA = CATEGORY_ORDER.indexOf(a.category);
        let indexB = CATEGORY_ORDER.indexOf(b.category);
        if (indexA === -1) indexA = 999;
        if (indexB === -1) indexB = 999;
        return indexA - indexB;
      });

      // Sort items inside each category from lowest price to highest
      data.forEach(cat => {
        if (cat.items && Array.isArray(cat.items)) {
          cat.items.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        }
      });

      setCategories(data);
    } catch (err) {
      console.error(err);
      notify.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleMigrate = async () => {
    setIsMigrating(true);
    try {
      const batch = writeBatch(db);
      INITIAL_CATEGORIES.forEach(cat => {
        const docRef = doc(collection(db, 'pos_categories'));
        batch.set(docRef, cat);
      });
      await batch.commit();
      notify.success("Categories migrated successfully!");
      fetchCategories();
    } catch (error) {
      console.error(error);
      notify.error("Migration failed");
    } finally {
      setIsMigrating(false);
    }
  };

  const handleEditSave = async (catId) => {
    if (!editingItem) return;
    try {
      const categoryDoc = categories.find(c => c.id === catId);
      const newItems = [...categoryDoc.items];
      newItems[editingItem.itemIndex] = {
        ...newItems[editingItem.itemIndex],
        name: editingName,
        price: Number(editingPrice),
        cost: Number(editingCost) || 0,
        qty: Number(editingQty) || 0
      };

      await updateDoc(doc(db, 'pos_categories', catId), { items: newItems });
      
      setCategories(categories.map(c => c.id === catId ? { ...c, items: newItems } : c));
      notify.success("Item updated!");
      setEditingItem(null);
    } catch (error) {
      console.error(error);
      notify.error("Failed to update item");
    }
  };

  const [newItemMode, setNewItemMode] = useState(null); // catId
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemCost, setNewItemCost] = useState("");
  const [newItemQty, setNewItemQty] = useState("");

  const handleAddNewItem = async (catId) => {
    if (!newItemName) return;
    try {
      const categoryDoc = categories.find(c => c.id === catId);
      const newItem = {
        id: `item-${Date.now()}`,
        name: newItemName,
        price: Number(newItemPrice) || 0,
        cost: Number(newItemCost) || 0,
        qty: Number(newItemQty) || 0
      };
      const newItems = [...categoryDoc.items, newItem];
      await updateDoc(doc(db, 'pos_categories', catId), { items: newItems });
      
      setCategories(categories.map(c => c.id === catId ? { ...c, items: newItems } : c));
      notify.success("Item added!");
      setNewItemMode(null);
      setNewItemName("");
      setNewItemPrice("");
      setNewItemCost("");
      setNewItemQty("");
    } catch (error) {
      console.error(error);
      notify.error("Failed to add item");
    }
  };

  const handleDeleteItem = (catId, itemIndex) => {
    setItemToDelete({ catId, itemIndex });
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;
    const { catId, itemIndex } = itemToDelete;
    try {
      const categoryDoc = categories.find(c => c.id === catId);
      const newItems = categoryDoc.items.filter((_, idx) => idx !== itemIndex);
      
      await updateDoc(doc(db, 'pos_categories', catId), { items: newItems });
      setCategories(categories.map(c => c.id === catId ? { ...c, items: newItems } : c));
      notify.success("Item deleted!");
    } catch (error) {
      console.error(error);
      notify.error("Failed to delete item");
    } finally {
      setItemToDelete(null);
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-slate-900/50 p-6 rounded-2xl border border-white/5">
        <div>
          <h2 className="text-2xl font-black text-slate-100 flex items-center gap-3">
            <Tags className="w-6 h-6 text-emerald-400" />
            Items & Prices Manager
          </h2>
          <p className="text-sm text-slate-400 mt-1">Manage POS categories, items and their real-time prices.</p>
        </div>
        
        {categories.length === 0 && (
          <button 
            onClick={handleMigrate}
            disabled={isMigrating}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isMigrating ? 'Migrating...' : 'Migrate Default Items'}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-6 pb-20">
        {categories.map((cat) => {
          const Icon = Icons[cat.icon] || Package;
          return (
            <div key={cat.id} className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-white/5 bg-slate-950/30 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-slate-800 border border-white/5 ${cat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-200">{cat.category}</h3>
              </div>
              
              <div className="p-4 flex-1 space-y-2">
                {cat.items.map((item, idx) => {
                  const isEditing = editingItem?.catId === cat.id && editingItem?.itemIndex === idx;
                  return (
                    <div key={item.id || idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/5 group transition-all">
                      {isEditing ? (
                        <div className="flex-1 flex gap-2 mr-2">
                          <input 
                            type="text" 
                            value={editingName} 
                            onChange={(e) => setEditingName(e.target.value)}
                            placeholder="Item Name"
                            className="bg-slate-950 text-sm text-slate-200 px-3 py-1.5 rounded-lg border border-white/10 focus:border-emerald-500 outline-none flex-1"
                          />
                          <input 
                            type="number" 
                            value={editingQty} 
                            onChange={(e) => setEditingQty(e.target.value)}
                            placeholder="Qty"
                            className="bg-slate-950 text-sm text-blue-400 font-bold px-2 py-1.5 rounded-lg border border-white/10 focus:border-blue-500 outline-none w-16"
                          />
                          <input 
                            type="number" 
                            value={editingCost} 
                            onChange={(e) => setEditingCost(e.target.value)}
                            placeholder="Cost"
                            className="bg-slate-950 text-sm text-red-400 font-bold px-2 py-1.5 rounded-lg border border-white/10 focus:border-red-500 outline-none w-20"
                          />
                          <input 
                            type="number" 
                            value={editingPrice} 
                            onChange={(e) => setEditingPrice(e.target.value)}
                            placeholder="Price"
                            className="bg-slate-950 text-sm text-emerald-400 font-bold px-2 py-1.5 rounded-lg border border-white/10 focus:border-emerald-500 outline-none w-20"
                          />
                        </div>
                      ) : (
                        <div className="flex-1 flex justify-between pr-4 items-center">
                          <p className="text-sm font-semibold text-slate-200">{item.name}</p>
                          <div className="flex gap-4">
                            {item.qty !== undefined && (
                              <p className="text-xs text-blue-400 font-medium text-right flex flex-col items-end">
                                <span className="text-[9px] uppercase tracking-widest text-slate-500">Qty</span>
                                {Number(item.qty)}
                              </p>
                            )}
                            {item.cost !== undefined && (
                              <p className="text-xs text-red-400 font-medium text-right flex flex-col items-end">
                                <span className="text-[9px] uppercase tracking-widest text-slate-500">Cost</span>
                                Rs {Number(item.cost).toFixed(2)}
                              </p>
                            )}
                            <p className="text-xs text-emerald-400 font-bold text-right flex flex-col items-end">
                              <span className="text-[9px] uppercase tracking-widest text-slate-500">Price</span>
                              Rs {Number(item.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isEditing ? (
                          <>
                            <button onClick={() => handleEditSave(cat.id)} className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded-lg"><Save className="w-4 h-4" /></button>
                            <button onClick={() => setEditingItem(null)} className="p-1.5 text-slate-400 hover:bg-slate-800 rounded-lg"><X className="w-4 h-4" /></button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => {
                                setEditingItem({ catId: cat.id, itemIndex: idx });
                                setEditingName(item.name);
                                setEditingPrice(item.price);
                                setEditingCost(item.cost !== undefined ? item.cost : "");
                                setEditingQty(item.qty !== undefined ? item.qty : "");
                              }} 
                              className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteItem(cat.id, idx)}
                              className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}

                {newItemMode === cat.id ? (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <input 
                      type="text" 
                      placeholder="Item Name"
                      value={newItemName} 
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="bg-slate-950 text-sm text-slate-200 px-3 py-1.5 rounded-lg border border-white/10 focus:border-emerald-500 outline-none flex-1"
                    />
                    <input 
                      type="number" 
                      placeholder="Qty"
                      value={newItemQty} 
                      onChange={(e) => setNewItemQty(e.target.value)}
                      className="bg-slate-950 text-sm text-blue-400 font-bold px-2 py-1.5 rounded-lg border border-white/10 focus:border-blue-500 outline-none w-16"
                    />
                    <input 
                      type="number" 
                      placeholder="Cost"
                      value={newItemCost} 
                      onChange={(e) => setNewItemCost(e.target.value)}
                      className="bg-slate-950 text-sm text-red-400 font-bold px-2 py-1.5 rounded-lg border border-white/10 focus:border-red-500 outline-none w-20"
                    />
                    <input 
                      type="number" 
                      placeholder="Price"
                      value={newItemPrice} 
                      onChange={(e) => setNewItemPrice(e.target.value)}
                      className="bg-slate-950 text-sm text-emerald-400 font-bold px-2 py-1.5 rounded-lg border border-white/10 focus:border-emerald-500 outline-none w-20"
                    />
                    <button onClick={() => handleAddNewItem(cat.id)} className="p-1.5 text-emerald-400 hover:bg-emerald-400/20 rounded-lg"><Save className="w-4 h-4" /></button>
                    <button onClick={() => setNewItemMode(null)} className="p-1.5 text-slate-400 hover:bg-slate-800 rounded-lg"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setNewItemMode(cat.id)}
                    className="w-full mt-2 py-3 border-2 border-dashed border-white/10 rounded-xl text-sm font-semibold text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Item
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <DeleteConfirmModal 
        isOpen={!!itemToDelete} 
        onClose={() => setItemToDelete(null)} 
        onConfirm={confirmDeleteItem} 
      />
    </div>
  );
}
