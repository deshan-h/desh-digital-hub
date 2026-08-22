import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Search, Plus, Trash2, Wallet, PackageOpen, DollarSign, Calendar, HelpCircle, ChevronUp, RefreshCw } from 'lucide-react';
import { notify } from '../../utils/toast';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';

export default function Expenses({ isAdmin }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  // Form State
  const [itemName, setItemName] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete Modal State
  const [deleteRecordId, setDeleteRecordId] = useState(null);

  // Quick Select Options
  const quickItems = ["A4 Bundle", "Laminate Bundle", "Printer Ink"];

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const q = query(collection(db, 'shop_expenses'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setRecords(data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      notify.error("Failed to load expenses.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!itemName || !amount) {
      notify.error("Item name and Amount are required.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'shop_expenses'), {
        itemName,
        amount: Number(amount),
        timestamp: serverTimestamp()
      });
      notify.success("Expense recorded successfully!");
      setItemName('');
      setAmount('');
      fetchRecords();
    } catch (error) {
      console.error("Error adding expense:", error);
      notify.error("Failed to add expense.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    if (!isAdmin) return;
    setDeleteRecordId(id);
  };

  const confirmDelete = async () => {
    if (!deleteRecordId) return;
    try {
      await deleteDoc(doc(db, 'shop_expenses', deleteRecordId));
      notify.success("Expense record deleted.");
      fetchRecords();
    } catch (error) {
      console.error("Error deleting expense:", error);
      notify.error("Failed to delete record.");
    } finally {
      setDeleteRecordId(null);
    }
  };

  const filteredRecords = records.filter(record => 
    (record.itemName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const totalExpenses = records.reduce((sum, r) => sum + r.amount, 0);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthExpenses = records.reduce((sum, r) => {
    if (r.timestamp) {
      const date = r.timestamp.toDate();
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        return sum + r.amount;
      }
    }
    return sum;
  }, 0);

  return (
    <div className="p-4 space-y-4 w-full relative z-10 h-full flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-transparent to-orange-900/10 pointer-events-none -z-10 rounded-3xl"></div>
      
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0 px-2 md:px-4">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-xl font-black text-slate-100 uppercase tracking-widest flex items-center gap-3">
            <Wallet className="w-8 h-8 text-rose-400" /> EXPENSES
          </h1>
          <div className="relative group cursor-help mt-1">
            <HelpCircle className="w-5 h-5 text-slate-500 hover:text-slate-300 transition-colors" />
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 w-max max-w-xs px-3 py-2 bg-slate-800/95 backdrop-blur text-slate-200 text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-xl border border-slate-700 z-50">
              Record money spent on shop supplies and inventory
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
            className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-lg border transition-all shadow-sm ${
              isAddFormOpen 
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' 
                : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40'
            }`}
            title={isAddFormOpen ? 'Close Form' : 'Add New Expense'}
          >
            {isAddFormOpen ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={fetchRecords}
            className="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg bg-slate-800/40 border border-slate-700/60 text-slate-400 hover:bg-slate-700 hover:text-slate-200 hover:border-slate-600 transition-all shadow-sm"
            title="Refresh Table"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Compact This Month Expenses Widget */}
          <div className="h-10 justify-center bg-slate-900/80 backdrop-blur-xl border border-orange-500/20 px-3 rounded-lg flex items-center gap-2 shadow-sm relative overflow-hidden group hidden sm:flex">
            <div className="absolute -right-4 -top-4 w-12 h-12 bg-orange-500/10 rounded-full blur-lg group-hover:bg-orange-500/20 transition-all"></div>
            <div className="p-1 bg-orange-500/10 rounded md:hidden lg:block">
              <Calendar className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <div className="flex flex-col relative z-10">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">This Month</span>
              <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400 leading-none tracking-tight">Rs {thisMonthExpenses.toFixed(2)}</span>
            </div>
          </div>

          {/* Compact Total Expenses Widget */}
          <div className="h-10 justify-center bg-slate-900/80 backdrop-blur-xl border border-red-500/20 px-3 rounded-lg flex items-center gap-2 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-12 h-12 bg-red-500/10 rounded-full blur-lg group-hover:bg-red-500/20 transition-all"></div>
            <div className="p-1 bg-red-500/10 rounded md:hidden lg:block">
              <Wallet className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div className="flex flex-col relative z-10">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Total Expenses</span>
              <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 leading-none tracking-tight">Rs {totalExpenses.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 flex-1 min-h-0">
        
        {/* Top Panel: Form */}
        {isAddFormOpen && (
        <div className="shrink-0 bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.5)] relative animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
          <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 mb-4 flex items-center gap-2 drop-shadow-sm shrink-0">
            <Plus className="w-5 h-5 text-red-400" /> Add New Expense
          </h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-end">
            <div className="col-span-1 md:col-span-2 xl:col-span-4 mb-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Quick Select</label>
              <div className="flex flex-wrap gap-2">
                {quickItems.map(item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setItemName(item)}
                    className="px-3 py-1.5 rounded-lg text-[13px] font-bold border transition-all bg-slate-950/50 border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/50"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 xl:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Item Name / Description *</label>
              <div className="relative">
                <PackageOpen className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-10 py-3 text-slate-200 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all text-sm"
                  placeholder="e.g. A4 Bundle"
                />
              </div>
            </div>

            <div className="col-span-1 xl:col-span-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Amount (Rs) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">Rs.</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-10 py-3 text-slate-200 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="col-span-1 xl:col-span-1 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] disabled:opacity-50"
              >
                {isSubmitting ? 'Recording...' : 'Record Expense'}
              </button>
            </div>
          </form>
        </div>
        )}

        {/* Bottom Area: List */}
        <div className="flex-1 h-full min-h-0">
          <div className="h-full flex flex-col min-h-0 bg-gradient-to-b from-slate-900/60 to-slate-950/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.3)] relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] pointer-events-none"></div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 relative z-10">
              <h2 className="text-lg font-black text-slate-100 tracking-wide">Recent Expenses</h2>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search item..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/50 rounded-xl px-9 py-2 text-slate-200 focus:outline-none focus:border-red-500/50 text-sm"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex-1 flex justify-center items-center">
                <div className="w-8 h-8 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-12">
                <Wallet className="w-12 h-12 mb-3 opacity-20" />
                <p>No expenses recorded yet.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar bg-slate-900/40 rounded-2xl border border-white/5">
                {/* Table Header */}
                <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-4 border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-950/80 sticky top-0 z-10 items-center">
                  <div className="col-span-5">Item Name</div>
                  <div className="col-span-3">Date & Time</div>
                  <div className="col-span-3 text-right">Amount</div>
                  <div className="col-span-1 text-center">Action</div>
                </div>

                <div className="divide-y divide-white/5">
                  {filteredRecords.map(record => (
                    <div key={record.id} className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-slate-800/40 transition-colors">
                      <div className="col-span-1 lg:col-span-5 flex items-center">
                        <h3 className="text-slate-200 font-bold text-[14px] truncate">{record.itemName}</h3>
                      </div>
                      <div className="col-span-1 lg:col-span-3 flex items-center text-slate-400 text-[13px] truncate">
                        <Calendar className="w-3.5 h-3.5 mr-2" />
                        {record.timestamp ? new Date(record.timestamp.toDate()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </div>
                      <div className="col-span-1 lg:col-span-3 flex items-center justify-end text-red-400 font-black text-[14px]">
                        Rs {record.amount.toFixed(2)}
                      </div>
                      <div className="col-span-1 flex justify-end lg:justify-center">
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="p-1.5 rounded-lg text-red-500/50 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                            title="Delete Expense"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
      
      <DeleteConfirmModal 
        isOpen={!!deleteRecordId} 
        onClose={() => setDeleteRecordId(null)} 
        onConfirm={confirmDelete}
        title="Delete Expense?"
        message="Are you sure you want to delete this expense record? This action cannot be undone."
      />
    </div>
  );
}
