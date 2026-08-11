import React, { useState, useEffect } from 'react';
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { notify } from '../../utils/toast';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import { 
  Tags, Plus, Edit2, Trash2, Save, X, Printer, Layers, FileText, Image as ImageIcon, Download, Code, Settings, Package, FileDown, ArrowUp, ArrowDown, MoveUp, MoveDown 
} from 'lucide-react';
import * as Icons from 'lucide-react';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
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

const AVAILABLE_ICONS = Object.keys(ICON_MAP);

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
  { category: 'Online Services', icon: 'Globe', color: 'text-purple-400', items: [
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
  
  // Category CRUD State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("Package");
  
  const [editingCategory, setEditingCategory] = useState(null); // catId
  const [editCatName, setEditCatName] = useState("");
  const [editCatIcon, setEditCatIcon] = useState("");
  
  const [catToDelete, setCatToDelete] = useState(null);

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Category,Service Name,Cost (Rs),Price (Rs)\n";
    categories.forEach(cat => {
      cat.items.forEach(item => {
        const cost = item.cost !== undefined ? item.cost : 0;
        const price = item.price !== undefined ? item.price : 0;
        csvContent += `"${cat.category}","${item.name}",${cost},${price}\n`;
      });
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `desh_services_prices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('pdf-export-container');
    if (!element) return;
    try {
      const imgData = await toPng(element, { backgroundColor: '#ffffff', pixelRatio: 2 });
      
      const doc = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = doc.internal.pageSize.getHeight();
      
      // The element is now exactly A4 proportion, so we fill the entire page.
      doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      doc.save(`desh_services_prices_${new Date().toISOString().split('T')[0]}.pdf`);
      notify.success("PDF Downloaded!");
    } catch (error) {
      console.error(error);
      notify.error("Failed to generate PDF");
    }
  };

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
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        let indexA = CATEGORY_ORDER.indexOf(a.category);
        let indexB = CATEGORY_ORDER.indexOf(b.category);
        if (indexA === -1) indexA = 999;
        if (indexB === -1) indexB = 999;
        return indexA - indexB;
      });

      // NO LONGER SORTING ITEMS BY PRICE - We respect the custom array order
      // data.forEach(cat => {
      //   if (cat.items && Array.isArray(cat.items)) {
      //     cat.items.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
      //   }
      // });

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

  // --- NEW FEATURES ---

  const handleAddCategory = async () => {
    if (!newCatName) return;
    try {
      const newOrder = categories.length; // Place at the end
      const newCat = {
        category: newCatName,
        icon: newCatIcon || 'Package',
        color: 'text-emerald-400',
        items: [],
        order: newOrder
      };
      const docRef = await addDoc(collection(db, 'pos_categories'), newCat);
      setCategories([...categories, { id: docRef.id, ...newCat }]);
      notify.success("Category added!");
      setNewCatName("");
      setIsAddingCategory(false);
    } catch (error) {
      console.error(error);
      notify.error("Failed to add category");
    }
  };

  const handleUpdateCategory = async (catId) => {
    if (!editCatName) return;
    try {
      await updateDoc(doc(db, 'pos_categories', catId), { category: editCatName, icon: editCatIcon });
      setCategories(categories.map(c => c.id === catId ? { ...c, category: editCatName, icon: editCatIcon } : c));
      notify.success("Category updated!");
      setEditingCategory(null);
    } catch (error) {
      console.error(error);
      notify.error("Failed to update category");
    }
  };

  const confirmDeleteCategory = async () => {
    if (!catToDelete) return;
    try {
      await deleteDoc(doc(db, 'pos_categories', catToDelete));
      setCategories(categories.filter(c => c.id !== catToDelete));
      notify.success("Category deleted!");
    } catch (error) {
      console.error(error);
      notify.error("Failed to delete category");
    } finally {
      setCatToDelete(null);
    }
  };

  const moveCategory = async (index, direction) => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === categories.length - 1)) return;
    const newCategories = [...categories];
    const temp = newCategories[index];
    newCategories[index] = newCategories[index + direction];
    newCategories[index + direction] = temp;
    
    // Update order values and save to db
    try {
      const batch = writeBatch(db);
      newCategories.forEach((cat, idx) => {
        cat.order = idx;
        batch.update(doc(db, 'pos_categories', cat.id), { order: idx });
      });
      await batch.commit();
      setCategories(newCategories);
      // notify.success("Order updated"); // Optional
    } catch (error) {
      console.error(error);
      notify.error("Failed to reorder categories");
    }
  };

  const moveItem = async (catId, itemIndex, direction) => {
    const categoryIndex = categories.findIndex(c => c.id === catId);
    const categoryDoc = categories[categoryIndex];
    if ((direction === -1 && itemIndex === 0) || (direction === 1 && itemIndex === categoryDoc.items.length - 1)) return;
    
    const newItems = [...categoryDoc.items];
    const temp = newItems[itemIndex];
    newItems[itemIndex] = newItems[itemIndex + direction];
    newItems[itemIndex + direction] = temp;

    try {
      await updateDoc(doc(db, 'pos_categories', catId), { items: newItems });
      setCategories(categories.map(c => c.id === catId ? { ...c, items: newItems } : c));
    } catch (error) {
      console.error(error);
      notify.error("Failed to reorder items");
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    
    if (source.droppableId !== destination.droppableId) return;
    
    const catId = source.droppableId;
    const categoryIndex = categories.findIndex(c => c.id === catId);
    if (categoryIndex === -1) return;
    
    const categoryDoc = categories[categoryIndex];
    const newItems = Array.from(categoryDoc.items);
    
    const [movedItem] = newItems.splice(source.index, 1);
    newItems.splice(destination.index, 0, movedItem);
    
    setCategories(categories.map(c => c.id === catId ? { ...c, items: newItems } : c));
    
    try {
      await updateDoc(doc(db, 'pos_categories', catId), { items: newItems });
    } catch (error) {
      console.error(error);
      notify.error("Failed to save reordered items");
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
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportPDF}
            className="px-4 py-2 bg-red-900/40 hover:bg-red-800 text-red-200 rounded-xl font-bold transition-all border border-red-500/30 flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" /> Export PDF
          </button>
          
          <button 
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition-all border border-white/10 flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" /> Export CSV
          </button>
          
          <button 
            onClick={() => setIsAddingCategory(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>

          {categories.length === 0 && (
            <button 
              onClick={handleMigrate}
              disabled={isMigrating}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isMigrating ? 'Migrating...' : 'Default Items'}
            </button>
          )}
        </div>
      </div>

      {isAddingCategory && (
        <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-5 flex flex-col gap-4 animate-fade-in shadow-[0_0_30px_rgba(16,185,129,0.1)]">
          <div className="flex items-center gap-4">
            <input 
              type="text" 
              placeholder="New Category Name..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 bg-slate-950 text-slate-200 px-4 py-2.5 rounded-xl border border-white/10 focus:border-emerald-500 outline-none"
            />
            <button onClick={handleAddCategory} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold flex items-center gap-2">
              <Save className="w-4 h-4" /> Save
            </button>
            <button onClick={() => setIsAddingCategory(false)} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold">
              Cancel
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-slate-400 mr-2">Select Icon:</span>
            {AVAILABLE_ICONS.map(iconName => {
              const IconBtn = ICON_MAP[iconName];
              const isSelected = newCatIcon === iconName;
              return (
                <button
                  key={iconName}
                  onClick={() => setNewCatIcon(iconName)}
                  title={iconName}
                  className={`p-2 rounded-lg border transition-all ${
                    isSelected 
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                      : 'bg-slate-950 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <IconBtn className="w-6 h-6 drop-shadow-md" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-6 pb-20">
        {categories.map((cat, catIndex) => {
          const IconCmp = ICON_MAP[cat.icon] || FcPackage;
          const isCatEditing = editingCategory === cat.id;

          return (
            <div key={cat.id} className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-white/5 bg-slate-950/30 flex items-center justify-between group">
                {isCatEditing ? (
                  <div className="flex flex-col gap-3 flex-1">
                    <div className="flex items-center gap-3">
                      <input 
                        type="text" 
                        value={editCatName}
                        onChange={(e) => setEditCatName(e.target.value)}
                        className="bg-slate-900 text-lg font-bold text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/50 outline-none flex-1"
                      />
                      <button onClick={() => handleUpdateCategory(cat.id)} className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/40"><Save className="w-5 h-5" /></button>
                      <button onClick={() => setEditingCategory(null)} className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap bg-slate-950/50 p-2 rounded-xl border border-white/5">
                      <span className="text-xs font-medium text-slate-500 mr-1">Icon:</span>
                      {AVAILABLE_ICONS.map(iconName => {
                        const IconBtn = ICON_MAP[iconName];
                        const isSelected = editCatIcon === iconName;
                        return (
                          <button
                            key={iconName}
                            onClick={() => setEditCatIcon(iconName)}
                            title={iconName}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isSelected 
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                                : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <IconBtn className="w-5 h-5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-slate-800 border border-white/5`}>
                        <IconCmp className="w-6 h-6 drop-shadow-md" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-200">{cat.category}</h3>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => moveCategory(catIndex, -1)} disabled={catIndex === 0} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                      <button onClick={() => moveCategory(catIndex, 1)} disabled={catIndex === categories.length - 1} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                      <div className="w-px h-4 bg-white/10 mx-1"></div>
                      <button 
                        onClick={() => { setEditingCategory(cat.id); setEditCatName(cat.category); setEditCatIcon(cat.icon || 'Package'); }} 
                        className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setCatToDelete(cat.id)} 
                        className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <Droppable droppableId={cat.id}>
                  {(provided) => (
                    <div 
                      className="space-y-2 mb-2"
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {cat.items.map((item, idx) => {
                        const isEditing = editingItem?.catId === cat.id && editingItem?.itemIndex === idx;
                        return (
                          <Draggable key={item.id || `item-${idx}`} draggableId={item.id || `item-${idx}`} index={idx}>
                            {(provided, snapshot) => (
                              <div 
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`flex items-center justify-between p-3 rounded-xl border group transition-all ${
                                  snapshot.isDragging 
                                    ? 'bg-slate-800 border-emerald-500/50 shadow-2xl ring-2 ring-emerald-500/20 z-50' 
                                    : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/5'
                                }`}
                              >
                                {/* Drag Handle */}
                                {!isEditing && (
                                  <div 
                                    {...provided.dragHandleProps} 
                                    className="mr-3 text-slate-600 hover:text-slate-300 cursor-grab active:cursor-grabbing"
                                  >
                                    <Icons.GripVertical className="w-5 h-5" />
                                  </div>
                                )}
                                
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
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

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
                    <Plus className="w-4 h-4" /> Add Service
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      </DragDropContext>
      
      <DeleteConfirmModal 
        isOpen={!!itemToDelete} 
        onClose={() => setItemToDelete(null)} 
        onConfirm={confirmDeleteItem} 
      />
      
      <DeleteConfirmModal 
        isOpen={!!catToDelete} 
        onClose={() => setCatToDelete(null)} 
        onConfirm={confirmDeleteCategory} 
      />

      {/* Hidden container for PDF export */}
      <div className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none h-0 w-0 overflow-hidden">
        {/* 1200x1697 is exactly A4 aspect ratio (1 : 1.414). This ensures it fits perfectly without scaling margins. */}
        <div id="pdf-export-container" className="p-6 font-sans" style={{ width: '1200px', height: '1697px', backgroundColor: '#ffffff', color: '#0f172a' }}>
          <div className="text-center mb-6 border-b-2 pb-4" style={{ borderColor: '#10b981' }}>
            <h1 className="text-4xl font-black" style={{ color: '#1e293b' }}>DESH Digital Hub</h1>
            <p className="text-lg font-medium mt-1" style={{ color: '#64748b' }}>Services & Prices List</p>
          </div>
          
          <div className="columns-2 gap-8">
            {categories.map(cat => {
              const IconCmp = ICON_MAP[cat.icon] || FcPackage;
              return (
                <div key={cat.id} className="border rounded-xl overflow-hidden mb-6 break-inside-avoid" style={{ borderColor: '#e2e8f0' }}>
                  <div className="p-3 flex items-center gap-3 border-b" style={{ backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' }}>
                    <IconCmp className="w-6 h-6" />
                    <h2 className="text-xl font-bold" style={{ color: '#1e293b' }}>{cat.category}</h2>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-sm" style={{ backgroundColor: '#f8fafc', color: '#64748b' }}>
                        <th className="p-3 border-b font-bold" style={{ borderColor: '#e2e8f0' }}>Service Name</th>
                        <th className="p-3 border-b font-bold text-right w-32" style={{ borderColor: '#e2e8f0' }}>Price (Rs)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cat.items.map((item, idx) => (
                        <tr key={idx} className="border-b last:border-none" style={{ borderColor: '#f1f5f9' }}>
                          <td className="p-3 font-semibold" style={{ color: '#334155' }}>{item.name}</td>
                          <td className="p-3 font-bold text-right" style={{ color: '#059669' }}>Rs {item.price !== undefined ? Number(item.price).toFixed(2) : '0.00'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
