import React, { useState, useEffect, useMemo } from 'react';
import { categoryService } from '../../services/supabaseService';
import { notify } from '../../utils/toast';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import { 
  Tags, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Printer, 
  Layers, 
  FileText, 
  Image as ImageIcon, 
  Download, 
  Code, 
  Settings, 
  Package, 
  FileDown, 
  ArrowUp, 
  ArrowDown, 
  HelpCircle, 
  GripVertical,
  Search,
  Check,
  TrendingUp,
  Sparkles,
  Boxes,
  RotateCcw
} from 'lucide-react';

import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  FcPackage, 
  FcPrint, 
  FcTemplate, 
  FcDocument, 
  FcRules, 
  FcImageFile, 
  FcDataBackup, 
  FcCommandLine, 
  FcSettings 
} from 'react-icons/fc';

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
    { id: 'ps-1', name: 'Printout / Photocopy [B/W]', price: 10, cost: 3, qty: 100 },
    { id: 'ps-2', name: 'Printout / Photocopy [Color]', price: 20, cost: 7, qty: 100 },
    { id: 'ps-3', name: 'Scan', price: 20, cost: 0, qty: 0 },
    { id: 'ps-4', name: 'Budget Print', price: 5, cost: 2, qty: 100 },
  ]},
  { category: 'Document Laminating', icon: 'Layers', color: 'text-emerald-400', items: [
    { id: 'lb-1', name: 'Laminating [NIC Size]', price: 50, cost: 15, qty: 50 },
    { id: 'lb-2', name: 'Laminating [A4]', price: 150, cost: 40, qty: 50 },
    { id: 'lb-3', name: 'Laminating [Legal]', price: 200, cost: 50, qty: 30 },
    { id: 'lb-4', name: 'Laminating [A3]', price: 250, cost: 70, qty: 20 },
  ]},
  { category: 'Book Binding', icon: 'FileText', color: 'text-orange-400', items: [
    { id: 'bb-1', name: 'Book Binding [pgs > 20]', price: 200, cost: 60, qty: 25 },
    { id: 'bb-2', name: 'Book Binding [pgs > 50]', price: 300, cost: 90, qty: 25 },
    { id: 'bb-3', name: 'Book Binding [pgs < 100]', price: 400, cost: 120, qty: 25 },
    { id: 'bb-4', name: 'Book Binding - Tape Binding', price: 250, cost: 80, qty: 25 },
  ]},
  { category: 'Type Setting', icon: 'Type', color: 'text-orange-400', items: [
    { id: 'ge-1', name: 'CV [Without Photo]', price: 250, cost: 0, qty: 0 },
    { id: 'ge-2', name: 'CV [With Photo]', price: 350, cost: 0, qty: 0 },
    { id: 'ge-3', name: 'CV [Advanced + ATS]', price: 800, cost: 0, qty: 0 },
    { id: 'ge-4', name: 'Name Tag', price: 120, cost: 30, qty: 50 },
    { id: 'ge-5', name: 'Name Stickers [Color]', price: 100, cost: 25, qty: 50 },
    { id: 'ge-6', name: 'Name Stickers [B/W]', price: 80, cost: 20, qty: 50 },
    { id: 'ge-7', name: 'Book Cover Design', price: 200, cost: 0, qty: 0 },
  ]},
  { category: 'Online Services', icon: 'Package', color: 'text-purple-400', items: [
    { id: 'os-1', name: 'Online App [Per Page]', price: 150, cost: 0, qty: 0 },
    { id: 'os-2', name: 'Campus Application', price: 400, cost: 0, qty: 0 },
    { id: 'os-3', name: 'Email', price: 50, cost: 0, qty: 0 },
    { id: 'os-4', name: 'Vehicle Licence renewal', price: 150, cost: 0, qty: 0 },
  ]},
  { category: 'Downloads & Media', icon: 'Download', color: 'text-yellow-400', items: [
    { id: 'dm-1', name: 'Images', price: 5, cost: 0, qty: 0 },
    { id: 'dm-2', name: 'Mp3 Songs', price: 1, cost: 0, qty: 0 },
    { id: 'dm-3', name: 'Movies', price: 50, cost: 0, qty: 0 },
    { id: 'dm-4', name: 'Video Songs', price: 20, cost: 0, qty: 0 },
    { id: 'dm-5', name: 'Software [1GB]', price: 100, cost: 0, qty: 0 },
    { id: 'dm-6', name: 'Games [1GB]', price: 100, cost: 0, qty: 0 },
    { id: 'dm-7', name: 'Exam Result Sheet', price: 50, cost: 0, qty: 0 },
  ]},
  { category: 'Custom & Utilities', icon: 'Settings', color: 'text-slate-400', items: [
    { id: 'cu-1', name: 'Custom Item', price: 0, cost: 0, qty: 0 },
  ]}
];

export default function ItemsManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);
  
  // Selection & Search Filter
  const [selectedCatId, setSelectedCatId] = useState('ALL'); // 'ALL' or specific category id
  const [searchQuery, setSearchQuery] = useState('');

  // Item Edit State
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

  // New Item State (per category)
  const [newItemMode, setNewItemMode] = useState(null); // catId
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemCost, setNewItemCost] = useState("");
  const [newItemQty, setNewItemQty] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getCategories();

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
      for (let i = 0; i < INITIAL_CATEGORIES.length; i++) {
        const cat = INITIAL_CATEGORIES[i];
        await categoryService.createCategory({
          category: cat.category,
          icon: cat.icon,
          items: cat.items,
          order: i
        });
      }
      notify.success("Categories initialized successfully!");
      fetchCategories();
    } catch (error) {
      console.error(error);
      notify.error("Initialization failed");
    } finally {
      setIsMigrating(false);
    }
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Category,Service Name,Cost (Rs),Price (Rs),Qty\n";
    categories.forEach(cat => {
      (cat.items || []).forEach(item => {
        const cost = item.cost !== undefined ? item.cost : 0;
        const price = item.price !== undefined ? item.price : 0;
        const qty = item.qty !== undefined ? item.qty : 0;
        csvContent += `"${cat.category}","${item.name}",${cost},${price},${qty}\n`;
      });
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `desh_services_prices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify.success("CSV Exported successfully!");
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('pdf-export-container');
    if (!element) return;
    try {
      const imgData = await toPng(element, { backgroundColor: '#ffffff', pixelRatio: 2 });
      
      const doc = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = doc.internal.pageSize.getHeight();
      
      doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      doc.save(`desh_services_prices_${new Date().toISOString().split('T')[0]}.pdf`);
      notify.success("PDF Downloaded successfully!");
    } catch (error) {
      console.error(error);
      notify.error("Failed to generate PDF");
    }
  };

  const handleAddNewItem = async (catId) => {
    if (!newItemName.trim()) {
      notify.error("Item name is required");
      return;
    }
    try {
      const categoryDoc = categories.find(c => c.id === catId);
      const newItem = {
        id: `item-${Date.now()}`,
        name: newItemName.trim(),
        price: Number(newItemPrice) || 0,
        cost: Number(newItemCost) || 0,
        qty: Number(newItemQty) || 0
      };
      const newItems = [...(categoryDoc.items || []), newItem];
      await categoryService.updateCategory(catId, { items: newItems });
      
      setCategories(categories.map(c => c.id === catId ? { ...c, items: newItems } : c));
      notify.success("Product / Service added successfully!");
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

  const handleEditSave = async (catId) => {
    if (!editingItem) return;
    try {
      const categoryDoc = categories.find(c => c.id === catId);
      const newItems = [...categoryDoc.items];
      newItems[editingItem.itemIndex] = {
        ...newItems[editingItem.itemIndex],
        name: editingName.trim(),
        price: Number(editingPrice) || 0,
        cost: Number(editingCost) || 0,
        qty: Number(editingQty) || 0
      };

      await categoryService.updateCategory(catId, { items: newItems });
      
      setCategories(categories.map(c => c.id === catId ? { ...c, items: newItems } : c));
      notify.success("Product / Service updated successfully!");
      setEditingItem(null);
    } catch (error) {
      console.error(error);
      notify.error("Failed to update item");
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
      
      await categoryService.updateCategory(catId, { items: newItems });
      setCategories(categories.map(c => c.id === catId ? { ...c, items: newItems } : c));
      notify.success("Item deleted successfully!");
    } catch (error) {
      console.error(error);
      notify.error("Failed to delete item");
    } finally {
      setItemToDelete(null);
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) {
      notify.error("Category name is required");
      return;
    }
    try {
      const newOrder = categories.length;
      const newCat = {
        category: newCatName.trim(),
        icon: newCatIcon || 'Package',
        items: [],
        order: newOrder
      };
      const created = await categoryService.createCategory(newCat);
      setCategories([...categories, { id: created.id, ...newCat }]);
      notify.success("Category added successfully!");
      setNewCatName("");
      setIsAddingCategory(false);
    } catch (error) {
      console.error(error);
      notify.error("Failed to add category");
    }
  };

  const handleUpdateCategory = async (catId) => {
    if (!editCatName.trim()) return;
    try {
      await categoryService.updateCategory(catId, { category: editCatName.trim(), icon: editCatIcon });
      setCategories(categories.map(c => c.id === catId ? { ...c, category: editCatName.trim(), icon: editCatIcon } : c));
      notify.success("Category updated successfully!");
      setEditingCategory(null);
    } catch (error) {
      console.error(error);
      notify.error("Failed to update category");
    }
  };

  const confirmDeleteCategory = async () => {
    if (!catToDelete) return;
    try {
      await categoryService.deleteCategory(catToDelete);
      setCategories(categories.filter(c => c.id !== catToDelete));
      notify.success("Category deleted successfully!");
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
    
    try {
      await Promise.all(newCategories.map((cat, idx) => {
        cat.order = idx;
        return categoryService.updateCategory(cat.id, { order: idx });
      }));
      setCategories(newCategories);
    } catch (error) {
      console.error(error);
      notify.error("Failed to reorder categories");
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
    const newItems = Array.from(categoryDoc.items || []);
    
    const [movedItem] = newItems.splice(source.index, 1);
    newItems.splice(destination.index, 0, movedItem);
    
    setCategories(categories.map(c => c.id === catId ? { ...c, items: newItems } : c));
    
    try {
      await categoryService.updateCategory(catId, { items: newItems });
    } catch (error) {
      console.error(error);
      notify.error("Failed to save reordered items");
    }
  };

  // Metrics
  const totalItemsCount = useMemo(() => {
    return categories.reduce((sum, cat) => sum + ((cat.items || []).length), 0);
  }, [categories]);

  // Filter Categories by selection and search query
  const displayedCategories = useMemo(() => {
    return categories.filter(cat => {
      if (selectedCatId !== 'ALL' && cat.id !== selectedCatId) return false;
      return true;
    }).map(cat => {
      if (!searchQuery.trim()) return cat;
      const q = searchQuery.toLowerCase().trim();
      const filteredItems = (cat.items || []).filter(item => 
        (item.name || '').toLowerCase().includes(q)
      );
      return { ...cat, items: filteredItems };
    }).filter(cat => {
      // If searching, only show categories that matched or if category name matched
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (cat.category || '').toLowerCase().includes(q) || (cat.items || []).length > 0;
    });
  }, [categories, selectedCatId, searchQuery]);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3">
        <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full"></div>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading Products & Catalog...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col space-y-2 overflow-hidden text-slate-100">
      
      {/* Top Header Control Strip */}
      <div className="relative z-20 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-2 sm:p-2.5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
        
        {/* Left: Title & Quick Counts */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500/20 to-teal-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 shadow-inner">
            <Tags className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-white tracking-wider uppercase">Products & Services</h2>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">
                {totalItemsCount} Items
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {categories.length} Categories • Real-time POS pricing & catalog management
            </p>
          </div>
        </div>

        {/* Center: Search Box */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search service / item name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#090d16] border border-slate-800 focus:border-sky-500/80 rounded-xl pl-8.5 pr-7 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          {categories.length === 0 && (
            <button 
              onClick={handleMigrate}
              disabled={isMigrating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700/80 transition-all cursor-pointer shadow-sm"
              title="Initialize Default Catalog"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Defaults</span>
            </button>
          )}

          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700/80 transition-all cursor-pointer shadow-sm"
            title="Export CSV"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Export CSV</span>
          </button>

          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm"
            title="Export PDF Price Sheet"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Price Sheet</span>
          </button>

          <button 
            onClick={() => setIsAddingCategory(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add Category</span>
          </button>
        </div>

      </div>

      {/* Main Split Layout: Category Sidebar + Right Items Container */}
      <div className="flex-1 flex flex-col md:flex-row gap-3 min-h-0 overflow-hidden">
        
        {/* Left: Category Selector & Reordering Drawer */}
        <div className="w-full md:w-72 shrink-0 bg-[#071326]/90 backdrop-blur-md border border-slate-800/80 rounded-2xl p-3 flex flex-col gap-2 shadow-xl overflow-y-auto custom-scrollbar">
          
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Categories</span>
            <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
              {categories.length} Total
            </span>
          </div>

          {/* "All Categories" Tab */}
          <button
            onClick={() => setSelectedCatId('ALL')}
            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
              selectedCatId === 'ALL'
                ? 'bg-sky-500 text-slate-950 font-black shadow-md shadow-sky-500/20'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4" />
              <span>All Categories</span>
            </div>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
              selectedCatId === 'ALL' ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-800 text-slate-400'
            }`}>
              {totalItemsCount}
            </span>
          </button>

          {/* Individual Category Tabs */}
          <div className="space-y-1 flex-1">
            {categories.map((cat, idx) => {
              const IconCmp = ICON_MAP[cat.icon] || FcPackage;
              const isSelected = selectedCatId === cat.id;
              const itemCount = (cat.items || []).length;

              return (
                <div
                  key={cat.id}
                  className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-gradient-to-r from-sky-500/20 to-teal-500/10 text-sky-300 border-sky-500/40 font-bold'
                      : 'border-transparent text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                  onClick={() => setSelectedCatId(cat.id)}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <IconCmp className="w-4 h-4 shrink-0 drop-shadow" />
                    <span className="truncate">{cat.category}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {itemCount}
                    </span>

                    {/* Quick Move Category Controls on Hover */}
                    <div className="hidden group-hover:flex items-center gap-0.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); moveCategory(idx, -1); }}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 disabled:opacity-20"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); moveCategory(idx, 1); }}
                        disabled={idx === categories.length - 1}
                        className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 disabled:opacity-20"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Category Button in Sidebar */}
          <button
            onClick={() => setIsAddingCategory(true)}
            className="w-full mt-auto py-2.5 border-2 border-dashed border-slate-700/80 hover:border-emerald-500/40 rounded-xl text-xs font-bold text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/5 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Category</span>
          </button>

        </div>

        {/* Right: Items Management Area */}
        <div className="flex-1 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-3 sm:p-4 shadow-xl overflow-y-auto custom-scrollbar flex flex-col space-y-4">
          
          {/* Add Category Inline Modal Card */}
          {isAddingCategory && (
            <div className="bg-[#071326] border border-emerald-500/30 rounded-2xl p-4 shadow-2xl space-y-3 shrink-0 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">Create New Category</h3>
                </div>
                <button
                  onClick={() => setIsAddingCategory(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  placeholder="Category Name (e.g. Graphic Design, Keyboards, Audio...)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 bg-[#090d16] border border-slate-700 focus:border-emerald-500 text-slate-100 text-xs px-3 py-2 rounded-xl focus:outline-none"
                />
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Category</span>
                </button>
              </div>

              {/* Icon Selector */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Choose Icon:</span>
                {AVAILABLE_ICONS.map(iconName => {
                  const IconBtn = ICON_MAP[iconName];
                  const isSelected = newCatIcon === iconName;
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setNewCatIcon(iconName)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-500'
                          : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
                      }`}
                      title={iconName}
                    >
                      <IconBtn className="w-5 h-5 drop-shadow" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Drag & Drop Context for Reordering Items */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="space-y-4">
              {displayedCategories.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center justify-center gap-2 text-slate-500">
                  <Tags className="w-10 h-10 text-slate-600 stroke-[1.5]" />
                  <p className="text-sm font-bold text-slate-300">No products or categories match your query</p>
                  <p className="text-xs text-slate-500">Clear your search or choose another category.</p>
                </div>
              ) : (
                displayedCategories.map((cat) => {
                  const IconCmp = ICON_MAP[cat.icon] || FcPackage;
                  const isCatEditing = editingCategory === cat.id;

                  return (
                    <div
                      key={cat.id}
                      className="bg-[#071326]/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg transition-all"
                    >
                      
                      {/* Category Header */}
                      <div className="px-4 py-3 bg-[#090d16] border-b border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
                        {isCatEditing ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={editCatName}
                              onChange={(e) => setEditCatName(e.target.value)}
                              className="bg-slate-900 border border-sky-500 text-sky-300 font-bold text-xs px-3 py-1.5 rounded-lg outline-none flex-1"
                            />
                            <button
                              onClick={() => handleUpdateCategory(cat.id)}
                              className="p-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 rounded-lg text-xs font-bold"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingCategory(null)}
                              className="p-1.5 bg-slate-800 text-slate-400 hover:bg-slate-700 rounded-lg"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2.5">
                              <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 shadow-sm">
                                <IconCmp className="w-5 h-5 drop-shadow" />
                              </div>
                              <h3 className="text-xs sm:text-sm font-black text-slate-100 uppercase tracking-wide">
                                {cat.category}
                              </h3>
                              <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded-full">
                                {(cat.items || []).length} items
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setNewItemMode(cat.id)}
                                className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add Item</span>
                              </button>

                              <button
                                onClick={() => {
                                  setEditingCategory(cat.id);
                                  setEditCatName(cat.category);
                                  setEditCatIcon(cat.icon || 'Package');
                                }}
                                className="p-1.5 text-slate-400 hover:text-sky-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                title="Edit Category"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setCatToDelete(cat.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                title="Delete Category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Items List (Droppable) */}
                      <div className="p-3">
                        <Droppable droppableId={cat.id}>
                          {(provided) => (
                            <div
                              className="space-y-1.5"
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                            >
                              {(cat.items || []).map((item, idx) => {
                                const isEditing = editingItem?.catId === cat.id && editingItem?.itemIndex === idx;
                                const costVal = Number(item.cost || 0);
                                const priceVal = Number(item.price || 0);
                                const profitVal = Math.max(0, priceVal - costVal);

                                return (
                                  <Draggable
                                    key={item.id || `item-${idx}`}
                                    draggableId={item.id || `item-${idx}`}
                                    index={idx}
                                  >
                                    {(providedDrag, snapshot) => (
                                      <div
                                        ref={providedDrag.innerRef}
                                        {...providedDrag.draggableProps}
                                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                                          snapshot.isDragging
                                            ? 'bg-slate-800 border-sky-500 shadow-2xl ring-2 ring-sky-500/30 z-50'
                                            : 'bg-[#090d16]/70 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-800/30'
                                        }`}
                                      >
                                        
                                        {/* Drag Handle */}
                                        {!isEditing && (
                                          <div
                                            {...providedDrag.dragHandleProps}
                                            className="mr-2 text-slate-600 hover:text-slate-300 cursor-grab active:cursor-grabbing p-1"
                                            title="Drag to reorder"
                                          >
                                            <GripVertical className="w-4 h-4" />
                                          </div>
                                        )}

                                        {/* Row Content */}
                                        {isEditing ? (
                                          <div className="flex-1 flex flex-wrap items-center gap-2 mr-2">
                                            <input
                                              type="text"
                                              value={editingName}
                                              onChange={(e) => setEditingName(e.target.value)}
                                              placeholder="Item Name"
                                              className="bg-[#071326] text-xs text-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-700 focus:border-sky-500 outline-none flex-1 min-w-[140px]"
                                            />
                                            <div className="flex items-center gap-1.5">
                                              <input
                                                type="number"
                                                value={editingQty}
                                                onChange={(e) => setEditingQty(e.target.value)}
                                                placeholder="Qty"
                                                className="bg-[#071326] text-xs text-sky-400 font-mono font-bold px-2 py-1.5 rounded-lg border border-slate-700 focus:border-sky-500 outline-none w-16 text-right"
                                              />
                                              <input
                                                type="number"
                                                value={editingCost}
                                                onChange={(e) => setEditingCost(e.target.value)}
                                                placeholder="Buy Cost"
                                                className="bg-[#071326] text-xs text-rose-400 font-mono font-bold px-2 py-1.5 rounded-lg border border-slate-700 focus:border-rose-500 outline-none w-20 text-right"
                                              />
                                              <input
                                                type="number"
                                                value={editingPrice}
                                                onChange={(e) => setEditingPrice(e.target.value)}
                                                placeholder="Selling Price"
                                                className="bg-[#071326] text-xs text-emerald-400 font-mono font-bold px-2 py-1.5 rounded-lg border border-slate-700 focus:border-emerald-500 outline-none w-20 text-right"
                                              />
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pr-3">
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs font-bold text-slate-200">
                                                {item.name}
                                              </span>
                                            </div>

                                            {/* Metrics: Qty, Cost, Price, Margin */}
                                            <div className="flex items-center gap-3">
                                              {/* Qty Pill */}
                                              {item.qty !== undefined && Number(item.qty) > 0 && (
                                                <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-md">
                                                  Qty: {Number(item.qty)}
                                                </span>
                                              )}

                                              {/* Cost Pill */}
                                              {costVal > 0 && (
                                                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
                                                  Cost: <strong className="text-slate-300">Rs {costVal.toFixed(2)}</strong>
                                                </span>
                                              )}

                                              {/* Selling Price Pill */}
                                              <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg">
                                                Rs {priceVal.toFixed(2)}
                                              </span>

                                              {/* Margin/Profit Badge */}
                                              {costVal > 0 && priceVal > costVal && (
                                                <span className="text-[10px] font-mono font-bold text-teal-300 bg-teal-500/10 border border-teal-500/20 px-1.5 py-0.5 rounded hidden sm:inline-block">
                                                  +Rs {profitVal.toFixed(2)}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        )}

                                        {/* Row Actions */}
                                        <div className="flex items-center gap-1">
                                          {isEditing ? (
                                            <>
                                              <button
                                                onClick={() => handleEditSave(cat.id)}
                                                className="p-1.5 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors cursor-pointer"
                                                title="Save Changes"
                                              >
                                                <Save className="w-3.5 h-3.5" />
                                              </button>
                                              <button
                                                onClick={() => setEditingItem(null)}
                                                className="p-1.5 text-slate-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                                title="Cancel"
                                              >
                                                <X className="w-3.5 h-3.5" />
                                              </button>
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
                                                className="p-1.5 text-slate-400 hover:text-sky-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                                title="Edit Item"
                                              >
                                                <Edit2 className="w-3.5 h-3.5" />
                                              </button>
                                              <button
                                                onClick={() => handleDeleteItem(cat.id, idx)}
                                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                                title="Delete Item"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
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

                        {/* Inline Add Item Bar */}
                        {newItemMode === cat.id ? (
                          <div className="mt-2.5 p-3 rounded-xl bg-[#090d16] border border-emerald-500/30 flex flex-col sm:flex-row items-center gap-2 animate-in fade-in duration-200">
                            <input
                              type="text"
                              placeholder="New Service or Item Name..."
                              value={newItemName}
                              onChange={(e) => setNewItemName(e.target.value)}
                              className="bg-[#071326] text-xs text-slate-100 px-3 py-1.5 rounded-lg border border-slate-700 focus:border-emerald-500 outline-none flex-1 w-full sm:w-auto"
                            />
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                              <input
                                type="number"
                                placeholder="Qty"
                                value={newItemQty}
                                onChange={(e) => setNewItemQty(e.target.value)}
                                className="bg-[#071326] text-xs text-sky-400 font-mono font-bold px-2 py-1.5 rounded-lg border border-slate-700 focus:border-sky-500 outline-none w-16 text-right"
                              />
                              <input
                                type="number"
                                placeholder="Cost (Rs)"
                                value={newItemCost}
                                onChange={(e) => setNewItemCost(e.target.value)}
                                className="bg-[#071326] text-xs text-rose-400 font-mono font-bold px-2 py-1.5 rounded-lg border border-slate-700 focus:border-rose-500 outline-none w-20 text-right"
                              />
                              <input
                                type="number"
                                placeholder="Price (Rs)"
                                value={newItemPrice}
                                onChange={(e) => setNewItemPrice(e.target.value)}
                                className="bg-[#071326] text-xs text-emerald-400 font-mono font-bold px-2 py-1.5 rounded-lg border border-slate-700 focus:border-emerald-500 outline-none w-20 text-right"
                              />
                              <button
                                onClick={() => handleAddNewItem(cat.id)}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>Save</span>
                              </button>
                              <button
                                onClick={() => setNewItemMode(null)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setNewItemMode(cat.id)}
                            className="w-full mt-2 py-2 border border-dashed border-slate-800 hover:border-emerald-500/30 rounded-xl text-xs font-semibold text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Service / Product to {cat.category}</span>
                          </button>
                        )}

                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </DragDropContext>

        </div>

      </div>

      {/* Delete Item Confirmation Modal */}
      <DeleteConfirmModal 
        isOpen={!!itemToDelete} 
        onClose={() => setItemToDelete(null)} 
        onConfirm={confirmDeleteItem}
        title="Delete Item?"
        message="Are you sure you want to delete this product/service? It will no longer appear on POS."
      />
      
      {/* Delete Category Confirmation Modal */}
      <DeleteConfirmModal 
        isOpen={!!catToDelete} 
        onClose={() => setCatToDelete(null)} 
        onConfirm={confirmDeleteCategory}
        title="Delete Entire Category?"
        message="Are you sure you want to delete this category and all its services? This action cannot be undone."
      />

      {/* Hidden container for PDF export (Exact layout maintained for A4 export) */}
      <div className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none h-0 w-0 overflow-hidden">
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
                      {(cat.items || []).map((item, idx) => (
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
