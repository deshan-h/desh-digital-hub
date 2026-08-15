import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Search, Plus, Trash2, CheckCircle, Clock, User, Phone, MapPin, DollarSign, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { notify } from '../../utils/toast';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';

export default function Customers({ isAdmin }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});
  const [isPaidListExpanded, setIsPaidListExpanded] = useState(false);

  const toggleGroup = (nameKey) => {
    setExpandedGroups(prev => ({
      ...prev,
      [nameKey]: !prev[nameKey]
    }));
  };

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('Pending');
  const [isPosArrears, setIsPosArrears] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete Modal State
  const [deleteRecordId, setDeleteRecordId] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const q = query(collection(db, 'customer_dues'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setRecords(data);
    } catch (error) {
      console.error("Error fetching records:", error);
      notify.error("Failed to load customer records.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !amount) {
      notify.error("Name and Amount are required.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'customer_dues'), {
        name,
        phone,
        area,
        amount: Number(amount),
        status,
        isPosArrears,
        timestamp: serverTimestamp()
      });
      notify.success("Record added successfully!");
      setName('');
      setPhone('');
      setArea('');
      setAmount('');
      setStatus('Pending');
      setIsPosArrears(true);
      fetchRecords();
    } catch (error) {
      console.error("Error adding record:", error);
      notify.error("Failed to add record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (record) => {
    try {
      if (record.status === 'Pending') {
        const newStatus = 'Paid';
        
        let saleRefId = null;
        
        // Add to daily_sales only if it's a POS Arrears
        if (record.isPosArrears !== false) {
          const saleRef = await addDoc(collection(db, 'daily_sales'), {
            amount: record.amount,
            discount: 0,
            description: `Account Settled: ${record.name}`,
            cartItems: [{ name: 'Account Settlement', price: record.amount, cost: 0, qty: 1 }],
            timestamp: serverTimestamp(),
            userId: 'system',
            customerName: record.name,
            isCredit: false,
            isAccountSettlement: true
          });
          saleRefId = saleRef.id;
        }

        await updateDoc(doc(db, 'customer_dues', record.id), {
          status: newStatus,
          ...(saleRefId && { linkedSaleId: saleRefId })
        });
        
        notify.success(`Marked as Paid & Added to Sales`);
      } else {
        const newStatus = 'Pending';
        
        if (record.linkedSaleId) {
          await deleteDoc(doc(db, 'daily_sales', record.linkedSaleId));
        }
        
        await updateDoc(doc(db, 'customer_dues', record.id), {
          status: newStatus,
          linkedSaleId: null
        });

        notify.success(`Undone Paid status & Removed from Sales`);
      }
      fetchRecords();
    } catch (error) {
      console.error("Error updating status:", error);
      notify.error("Failed to update status.");
    }
  };

  const handleDelete = (id) => {
    if (!isAdmin) return;
    setDeleteRecordId(id);
  };

  const confirmDelete = async () => {
    if (!deleteRecordId) return;
    try {
      await deleteDoc(doc(db, 'customer_dues', deleteRecordId));
      notify.success("Record deleted.");
      fetchRecords();
    } catch (error) {
      console.error("Error deleting record:", error);
      notify.error("Failed to delete record.");
    }
  };

  const filteredRecords = records.filter(record => 
    (record.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (record.phone || '').includes(searchTerm) ||
    (record.area?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const totalPending = records.filter(r => r.status === 'Pending').reduce((sum, r) => sum + r.amount, 0);

  const groupedRecords = Object.values(
    filteredRecords.reduce((acc, record) => {
      const nameKey = record.name?.trim().toLowerCase() || 'unknown';
      if (!acc[nameKey]) {
        acc[nameKey] = {
          nameKey,
          name: record.name,
          phone: record.phone,
          area: record.area,
          totalPending: 0,
          totalPaid: 0,
          records: [],
          hasPending: false
        };
      }
      acc[nameKey].records.push(record);
      if (record.type === 'Payment') {
        acc[nameKey].totalPending -= record.amount;
        acc[nameKey].totalPaid += record.amount;
      } else if (record.status === 'Pending') {
        acc[nameKey].totalPending += record.amount;
      } else {
        acc[nameKey].totalPaid += record.amount;
      }
      
      if (!acc[nameKey].phone && record.phone) acc[nameKey].phone = record.phone;
      if (!acc[nameKey].area && record.area) acc[nameKey].area = record.area;
      return acc;
    }, {})
  );

  // Post-process to fix hasPending based on computed totalPending
  groupedRecords.forEach(group => {
    if (group.totalPending > 0.01) {
      group.hasPending = true;
    } else {
      group.hasPending = false;
      group.totalPending = 0; // Prevent negative floating point dust
    }
  });

  groupedRecords.sort((a, b) => {
    if (a.hasPending && !b.hasPending) return -1;
    if (!a.hasPending && b.hasPending) return 1;
    if (a.totalPending !== b.totalPending) return b.totalPending - a.totalPending;
    return (a.name || '').localeCompare(b.name || '');
  });

  const pendingGroups = groupedRecords.filter(g => g.hasPending);
  const paidGroups = groupedRecords.filter(g => !g.hasPending);

  const renderGroup = (group) => {
    const isExpanded = expandedGroups[group.nameKey];
    return (
      <div key={group.nameKey} className={`bg-slate-950/40 border border-white/5 rounded-2xl overflow-hidden transition-all flex flex-col ${!group.hasPending ? 'opacity-70 hover:opacity-100' : ''}`}>
        {/* Group Header (Clickable) */}
        <div 
          className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors gap-4"
          onClick={() => toggleGroup(group.nameKey)}
        >
          {/* Left: Name and Badges */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h3 className="text-slate-200 font-bold text-[14px] truncate">{group.name}</h3>
            {group.hasPending ? (
              <span className="text-[9px] uppercase tracking-wider font-bold bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/20 whitespace-nowrap">
                {group.records.filter(r => r.status === 'Pending').length} Pending
              </span>
            ) : (
              <span className="text-[9px] uppercase tracking-wider font-bold bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap">
                All Paid
              </span>
            )}
          </div>

          {/* Middle: Phone/Area (Hidden on smaller screens, flex on lg) */}
          <div className="hidden lg:flex items-center gap-4 text-slate-400 text-[11px] truncate flex-1 justify-center">
            {group.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {group.phone}</span>}
            {group.area && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {group.area}</span>}
          </div>

          {/* Right: Total & Chevron */}
          <div className="flex items-center gap-4 justify-end flex-shrink-0">
            <p className="text-[15px] font-black text-white whitespace-nowrap">Rs {group.hasPending ? group.totalPending.toFixed(2) : group.totalPaid.toFixed(2)}</p>
            <button className="text-cyan-500 hover:text-cyan-400 transition-colors flex-shrink-0">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expanded Records Timeline */}
        {isExpanded && (
          <div className="bg-slate-900/50 border-t border-white/5 px-4 sm:px-6 py-4">
            <div className="relative border-l border-slate-700/50 space-y-4 pb-2 ml-2 sm:ml-0">
              {group.records.map((record, index) => (
                <div key={record.id} className="relative pl-6">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[7px] top-4 w-3.5 h-3.5 rounded-full border-[3px] border-slate-900 ${record.status === 'Pending' ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`}></div>
                  
                  {/* Timeline Content */}
                  <div className={`bg-slate-950 border border-white/5 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${record.status === 'Paid' ? 'opacity-60 hover:opacity-100 transition-opacity' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6">
                      <span className="text-[11px] font-medium text-slate-400 min-w-[70px]">
                        {record.timestamp ? new Date(record.timestamp.toDate()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Just now'}
                      </span>
                      <span className={`font-black text-[14px] ${record.type === 'Payment' ? 'text-emerald-400' : (record.status === 'Pending' ? 'text-orange-400' : 'text-emerald-400')}`}>
                        {record.type === 'Payment' ? '-' : ''}Rs {record.amount.toFixed(2)}
                      </span>
                      {record.type === 'Payment' && (
                        <span className="text-[10px] uppercase tracking-wider font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full ml-2">
                          Payment
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 justify-end sm:justify-start">
                      {record.type === 'Payment' ? (
                        isAdmin && (
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(record.id); }} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all" title="Delete Payment">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )
                      ) : (
                        <>
                          {record.status === 'Pending' ? (
                            <button onClick={(e) => { e.stopPropagation(); toggleStatus(record); }} className="p-1.5 rounded-lg transition-all bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white" title="Mark as Paid">
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button onClick={(e) => { e.stopPropagation(); toggleStatus(record); }} className="p-1.5 rounded-lg transition-all bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-white" title="Undo Paid">
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {isAdmin && (
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(record.id); }} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all" title="Delete Record">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6 w-full relative z-10 h-full flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-transparent to-red-900/10 pointer-events-none -z-10 rounded-3xl"></div>
      
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Customer Accounts</h1>
          <p className="text-slate-400 font-medium">Manage customer dues and pending payments</p>
        </div>
        
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex items-center gap-5 shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all duration-500"></div>
          <div className="p-3.5 bg-gradient-to-br from-red-500/20 to-red-900/40 rounded-xl border border-red-500/20 shadow-inner">
            <DollarSign className="w-6 h-6 text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]" />
          </div>
          <div className="relative z-10">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Pending</p>
            <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Rs {totalPending.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-1 h-full min-h-0">
          <div className="h-full flex flex-col min-h-0 bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.5)] relative">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
            <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 mb-6 flex items-center gap-2 drop-shadow-sm shrink-0">
              <Plus className="w-5 h-5 text-cyan-400" /> Add New Record
            </h2>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar" style={{ scrollbarWidth: 'thin', scrollbarColor: '#0891b2 transparent' }}>
              <form onSubmit={handleSubmit} className="space-y-4 pb-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Customer Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-10 py-3 text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm"
                    placeholder="e.g. Nimal Perera"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-10 py-3 text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm"
                    placeholder="e.g. 0712345678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Area / Description</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-10 py-3 text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm"
                    placeholder="e.g. Melsiripura town"
                  />
                </div>
              </div>

              <div>
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
                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-10 py-3 text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Initial Status</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('Pending')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${status === 'Pending' ? 'bg-orange-500/10 border-orange-500/50 text-orange-400' : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:text-slate-300'}`}
                  >
                    Pending
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('Paid')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${status === 'Paid' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:text-slate-300'}`}
                  >
                    Paid
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 cursor-pointer select-none hover:border-cyan-500/30 transition-colors" onClick={() => setIsPosArrears(!isPosArrears)}>
                <input
                  type="checkbox"
                  checked={isPosArrears}
                  onChange={(e) => setIsPosArrears(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/50 bg-slate-900 pointer-events-none"
                />
                <span className="text-sm font-semibold text-slate-300 flex-1">Add to POS Sales when Paid</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(8,145,178,0.3)] hover:shadow-[0_0_25px_rgba(8,145,178,0.5)] disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Record'}
              </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: List */}
        <div className="lg:col-span-2 h-full min-h-0">
          <div className="h-full flex flex-col min-h-0 bg-gradient-to-b from-slate-900/60 to-slate-950/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.3)] relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none"></div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-10">
              <h2 className="text-lg font-black text-slate-100 tracking-wide">Recent Records</h2>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search name, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/50 rounded-full px-9 py-2 text-slate-200 focus:outline-none focus:border-cyan-500/50 text-sm"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex-1 flex justify-center items-center">
                <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-12">
                <User className="w-12 h-12 mb-3 opacity-20" />
                <p>No records found.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-2 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#0891b2 transparent' }}>
                {pendingGroups.map(renderGroup)}
                
                {paidGroups.length > 0 && (
                  <div className="mt-8 border-t border-white/10 pt-4">
                    <button 
                      onClick={() => setIsPaidListExpanded(!isPaidListExpanded)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/50 hover:bg-slate-800/50 border border-white/5 rounded-xl transition-colors mb-3 text-slate-300"
                    >
                      <span className="font-bold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" /> Settled Accounts
                      </span>
                      <span className="flex items-center gap-2 text-sm text-slate-500">
                        {paidGroups.length} accounts
                        {isPaidListExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </button>

                    {isPaidListExpanded && (
                      <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-slate-800">
                        {paidGroups.map(renderGroup)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
      
      <DeleteConfirmModal 
        isOpen={!!deleteRecordId} 
        onClose={() => setDeleteRecordId(null)} 
        onConfirm={confirmDelete}
        title="Delete Record?"
        message="Are you sure you want to delete this customer record? This action cannot be undone."
      />
    </div>
  );
}
