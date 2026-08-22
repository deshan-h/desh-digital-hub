import React, { useState, useEffect, useMemo } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Search, Plus, Trash2, CheckCircle, Clock, User, Phone, MapPin, DollarSign, RotateCcw, ChevronDown, ChevronUp, Filter, Edit, X, RefreshCw, Star, HelpCircle, Users } from 'lucide-react';
import { notify } from '../../utils/toast';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import { AddCustomerForm, CustomerHistoryModal } from './CustomersComponents';

export default function Customers({ isAdmin }) {
  const [records, setRecords] = useState([]);
  const [directoryRecords, setDirectoryRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchArea, setSearchArea] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [showOnlyDues, setShowOnlyDues] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCustomerForModal, setSelectedCustomerForModal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Inline edit state for Area / Phone
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [editingField, setEditingField] = useState(''); // 'area' or 'phone'
  const [editingValue, setEditingValue] = useState('');

  // Partial Payment State
  const [payingRecordId, setPayingRecordId] = useState(null);
  const [payingAmount, setPayingAmount] = useState('');


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

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchCustomer, searchArea, searchPhone, showOnlyDues]);

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

      const dirQ = query(collection(db, 'customers'), orderBy('timestamp', 'desc'));
      const dirSnapshot = await getDocs(dirQ);
      const dirData = [];
      dirSnapshot.forEach((doc) => {
        dirData.push({ id: doc.id, ...doc.data() });
      });
      setDirectoryRecords(dirData);

    } catch (error) {
      console.error("Error fetching records:", error);
      notify.error("Failed to load customer records.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      notify.error("Customer Name is required.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Add to directory regardless to keep track of Area and Phone centrally
      await addDoc(collection(db, 'customers'), {
        name: name.trim(),
        phone: phone.trim(),
        area: area.trim(),
        timestamp: serverTimestamp()
      });

      // If an amount is provided, add it to customer_dues
      if (amount && Number(amount) > 0) {
        await addDoc(collection(db, 'customer_dues'), {
          name: name.trim(),
          phone: phone.trim(),
          area: area.trim(),
          amount: Number(amount),
          status,
          isPosArrears,
          timestamp: serverTimestamp()
        });
      }
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

  const toggleStatus = async (record, group) => {
    try {
      if (record.status === 'Pending') {
        const newStatus = 'Paid';
        
        let saleRefId = null;
        let consumedPaymentAmount = 0;
        
        // Find existing payments for this customer
        const customerPayments = group ? group.records.filter(r => r.type === 'Payment') : [];
        const totalPaymentsAmount = customerPayments.reduce((sum, r) => sum + r.amount, 0);
        
        // The actual amount paid today is the bill amount MINUS any prepaid balance (payments)
        let amountToConsume = Math.min(record.amount, totalPaymentsAmount);
        const actualCashReceived = record.amount - amountToConsume;
        consumedPaymentAmount = amountToConsume;

        // Consume the payments from the database
        if (amountToConsume > 0) {
          for (const payment of customerPayments) {
            if (amountToConsume <= 0) break;
            
            if (payment.amount <= amountToConsume) {
              await deleteDoc(doc(db, 'customer_dues', payment.id));
              amountToConsume -= payment.amount;
            } else {
              await updateDoc(doc(db, 'customer_dues', payment.id), {
                amount: payment.amount - amountToConsume
              });
              amountToConsume = 0;
            }
          }
        }
        
        // Add to daily_sales only if it's a POS Arrears and actual cash was received
        if (record.isPosArrears !== false && actualCashReceived > 0) {
          const saleRef = await addDoc(collection(db, 'daily_sales'), {
            amount: actualCashReceived,
            discount: 0,
            description: `Account Settled: ${record.name}`,
            cartItems: [{ name: 'Account Settlement (Balance)', price: actualCashReceived, cost: 0, qty: 1 }],
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
          ...(saleRefId && { linkedSaleId: saleRefId }),
          ...(consumedPaymentAmount > 0 && { consumedPaymentAmount })
        });
        
        if (actualCashReceived > 0) {
          notify.success(`Marked as Paid. Rs ${actualCashReceived.toFixed(2)} added to Sales.`);
        } else {
          notify.success(`Marked as Paid. Fully covered by existing payments.`);
        }
      } else {
        const newStatus = 'Pending';
        
        if (record.linkedSaleId) {
          await deleteDoc(doc(db, 'daily_sales', record.linkedSaleId));
        }

        // Restore consumed payments
        if (record.consumedPaymentAmount && record.consumedPaymentAmount > 0) {
           await addDoc(collection(db, 'customer_dues'), {
             name: record.name,
             phone: record.phone || '',
             area: record.area || '',
             amount: record.consumedPaymentAmount,
             status: 'Paid',
             type: 'Payment',
             description: 'Restored Payment from Undo',
             timestamp: serverTimestamp()
           });
        }
        
        await updateDoc(doc(db, 'customer_dues', record.id), {
          status: newStatus,
          linkedSaleId: null,
          consumedPaymentAmount: null
        });

        notify.success(`Undone Paid status & Removed from Sales`);
      }
      fetchRecords();
    } catch (error) {
      console.error("Error updating status:", error);
      notify.error("Failed to update status.");
    }
  };

  const handlePartialPayment = async (record, enteredAmount, group) => {
    try {
      const paymentAmount = Number(enteredAmount);
      if (!paymentAmount || paymentAmount <= 0) {
        setPayingRecordId(null);
        return;
      }
      
      if (paymentAmount >= record.amount) {
        await toggleStatus(record, group);
      } else {
        // Partial payment
        if (record.isPosArrears !== false) {
          await addDoc(collection(db, 'daily_sales'), {
            amount: paymentAmount,
            discount: 0,
            description: `Partial Payment: ${record.name}`,
            cartItems: [{ name: 'Account Settlement (Partial)', price: paymentAmount, cost: 0, qty: 1 }],
            timestamp: serverTimestamp(),
            userId: 'system',
            customerName: record.name,
            isCredit: false,
            isAccountSettlement: true
          });
        }
        
        await addDoc(collection(db, 'customer_dues'), {
          name: record.name,
          phone: record.phone || '',
          area: record.area || '',
          amount: paymentAmount,
          status: 'Paid',
          type: 'Payment',
          description: 'Partial Payment',
          timestamp: serverTimestamp()
        });
        
        notify.success(`Partial payment of Rs ${paymentAmount.toFixed(2)} recorded.`);
        fetchRecords();
      }
      
      setPayingRecordId(null);
      setPayingAmount('');
    } catch (error) {
      console.error("Error in partial payment:", error);
      notify.error("Failed to process partial payment.");
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

  const toggleFavorite = async (group, e) => {
    e.stopPropagation();
    try {
      let targetId = group.directoryId;
      const isNowFavorite = !group.mostVisited;

      if (!targetId) {
        // If customer doesn't exist in the directory yet, create it
        const newDoc = await addDoc(collection(db, 'customers'), {
          name: group.name,
          phone: group.phone || '',
          area: group.area || '',
          mostVisited: true,
          timestamp: serverTimestamp()
        });
        targetId = newDoc.id;
        notify.success('Added to favorites');
      } else {
        await updateDoc(doc(db, 'customers', targetId), {
          mostVisited: isNowFavorite
        });
        notify.success(isNowFavorite ? 'Added to favorites' : 'Removed from favorites');
      }

      // Update local storage immediately for POS modal
      let favs = JSON.parse(localStorage.getItem('favoriteCustomers') || '[]');
      if (isNowFavorite && !favs.includes(group.name)) {
        favs.push(group.name);
      } else if (!isNowFavorite) {
        favs = favs.filter(n => n !== group.name);
      }
      localStorage.setItem('favoriteCustomers', JSON.stringify(favs));

      // Also update customersList in local storage to keep global state in sync
      const savedCustomers = localStorage.getItem('customersList');
      if (savedCustomers) {
        let list = JSON.parse(savedCustomers);
        const idx = list.findIndex(c => c.id === targetId);
        if (idx !== -1) {
          list[idx].mostVisited = isNowFavorite;
        } else {
          list.push({ id: targetId, name: group.name, phone: group.phone, area: group.area, mostVisited: isNowFavorite });
        }
        localStorage.setItem('customersList', JSON.stringify(list));
      }

      fetchRecords();
    } catch (error) {
      console.error("Error toggling favorite:", error);
      notify.error("Failed to update favorite status.");
    }
  };

  const allGrouped = React.useMemo(() => {
    const acc = {};
    
    // Process directory records first
    directoryRecords.forEach(record => {
      const nameKey = record.name?.trim().toLowerCase() || 'unknown';
      if (!acc[nameKey]) {
        acc[nameKey] = {
          directoryId: record.id,
          nameKey,
          name: record.name,
          phone: record.phone,
          area: record.area,
          mostVisited: record.mostVisited || false,
          totalPending: 0,
          totalPaid: 0,
          records: [], // dues records
          hasPending: false
        };
      } else {
        if (!acc[nameKey].directoryId) acc[nameKey].directoryId = record.id;
        if (!acc[nameKey].phone && record.phone) acc[nameKey].phone = record.phone;
        if (!acc[nameKey].area && record.area) acc[nameKey].area = record.area;
        if (!acc[nameKey].mostVisited && record.mostVisited) acc[nameKey].mostVisited = record.mostVisited;
      }
    });

    // Process dues records
    records.forEach(record => {
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
    });

    Object.values(acc).forEach(group => {
      if (group.totalPending > 0.01) {
        group.hasPending = true;
      } else {
        group.hasPending = false;
        group.totalPending = 0;
      }
    });
    
    return Object.values(acc);
  }, [records, directoryRecords]);

  const filteredGroups = React.useMemo(() => {
    const searchCustomerLower = searchCustomer.toLowerCase();
    const searchAreaLower = searchArea.toLowerCase();
    const searchPhoneLower = searchPhone.toLowerCase();
    
    const filtered = allGrouped.filter(group => {
      const matchCustomer = (group.name?.toLowerCase() || '').includes(searchCustomerLower);
      const matchArea = (group.area?.toLowerCase() || '').includes(searchAreaLower);
      const matchPhone = (group.phone || '').includes(searchPhoneLower);
      
      if (showOnlyDues && !group.hasPending) return false;
      return matchCustomer && matchArea && matchPhone;
    });

    return filtered.sort((a, b) => {
      if (a.hasPending && !b.hasPending) return -1;
      if (!a.hasPending && b.hasPending) return 1;
      if (a.totalPending !== b.totalPending) return b.totalPending - a.totalPending;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [allGrouped, searchCustomer, searchArea, searchPhone, showOnlyDues]);

  const renderGroup = (group) => {
    return (
      <div key={group.nameKey} className={`bg-slate-950/40 border-b border-white/5 transition-all flex flex-col ${!group.hasPending ? 'opacity-70 hover:opacity-100' : ''}`}>
        {/* Table Row */}
        <div className="grid grid-cols-12 gap-4 px-4 py-2.5 items-center">
          {/* Col 0: Most Visited Star (col-span-1) */}
          <div className="col-span-1 flex justify-center items-center">
            <button 
              onClick={(e) => toggleFavorite(group, e)}
              className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              title={group.mostVisited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`w-4 h-4 transition-colors ${group.mostVisited ? 'text-yellow-500 fill-yellow-500' : 'text-slate-600 hover:text-yellow-500/50'}`} />
            </button>
          </div>

          {/* Col 1: Customer Name (col-span-4 lg:col-span-3) */}
          <div className="col-span-4 lg:col-span-3 flex items-center gap-3">
            <h3 className="text-slate-200 font-bold text-[14px] truncate">{group.name}</h3>
          </div>

            {/* Col 2: Area (col-span-3) */}
            <div className="col-span-4 lg:col-span-3 flex items-center text-slate-400 text-[13px] truncate" onClick={() => {
                setEditingRecordId(group.nameKey);
                setEditingField('area');
                setEditingValue(group.area || '');
              }}>
              {editingRecordId === group.nameKey && editingField === 'area' ? (
                <div className="flex items-center gap-1 bg-slate-900/50 rounded px-1">
                  <input
                    type="text"
                    value={editingValue}
                    onChange={e => setEditingValue(e.target.value)}
                    className="bg-transparent text-slate-200 border-none focus:outline-none w-20"
                  />
                  <CheckCircle
                    className="w-4 h-4 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await updateDoc(doc(db, 'customer_dues', group.records.find(r => r.id).id), { area: editingValue });
                        notify.success('Area updated');
                      } catch (err) {
                        console.error(err);
                        notify.error('Failed to update area');
                      }
                      setEditingRecordId(null);
                      setEditingField('');
                    }}
                  />
                  <X
                    className="w-4 h-4 text-slate-400 hover:text-slate-200 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingRecordId(null);
                      setEditingField('');
                      setEditingValue('');
                    }}
                  />
                </div>
              ) : (
                <>
                  <Edit className="w-3 h-3 mr-1 text-cyan-400" />
                  {group.area ? group.area : '-'}
                </>
              )}
            </div>

            {/* Col 3: Phone (col-span-2) */}
            <div className="hidden lg:flex lg:col-span-2 items-center text-slate-400 text-[13px] truncate" onClick={() => {
                setEditingRecordId(group.nameKey);
                setEditingField('phone');
                setEditingValue(group.phone || '');
              }}>
              {editingRecordId === group.nameKey && editingField === 'phone' ? (
                <div className="flex items-center gap-1 bg-slate-900/50 rounded px-1">
                  <input
                    type="text"
                    value={editingValue}
                    onChange={e => setEditingValue(e.target.value)}
                    className="bg-transparent text-slate-200 border-none focus:outline-none w-24"
                  />
                  <CheckCircle
                    className="w-4 h-4 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await updateDoc(doc(db, 'customer_dues', group.records.find(r => r.id).id), { phone: editingValue });
                        notify.success('Phone updated');
                      } catch (err) {
                        console.error(err);
                        notify.error('Failed to update phone');
                      }
                      setEditingRecordId(null);
                      setEditingField('');
                    }}
                  />
                  <X
                    className="w-4 h-4 text-slate-400 hover:text-slate-200 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingRecordId(null);
                      setEditingField('');
                      setEditingValue('');
                    }}
                  />
                </div>
              ) : (
                <>
                  <Edit className="w-3 h-3 mr-1 text-cyan-400" />
                  {group.phone ? group.phone : '-'}
                </>
              )}
            </div>

          {/* Col 4: Is Due (Clickable) */}
          <div className="col-span-3 lg:col-span-3 flex items-center justify-end">
            <button 
              onClick={() => setSelectedCustomerForModal(group)}
              className={`px-3 py-1.5 rounded-lg border transition-all text-xs font-bold whitespace-nowrap shadow-sm hover:shadow-md ${
                group.hasPending 
                  ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20' 
                  : group.records.length > 0 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {group.hasPending ? `Due: Rs ${group.totalPending.toFixed(0)}` : group.records.length > 0 ? 'Settled' : 'No History'}
            </button>
          </div>
        </div>
      </div>
    );
  };



  const totalPending = records.reduce((sum, r) => {
    if (r.type === 'Payment') return sum - r.amount;
    if (r.status === 'Pending') return sum + r.amount;
    return sum;
  }, 0);

  return (
    <div className="p-4 space-y-4 w-full relative z-10 h-full flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-transparent to-red-900/10 pointer-events-none -z-10 rounded-3xl"></div>
      
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0 px-2 md:px-4">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-xl font-black text-slate-100 uppercase tracking-widest flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-400" /> CUSTOMERS
          </h1>
          <div className="relative group cursor-help mt-1">
            <HelpCircle className="w-5 h-5 text-slate-500 hover:text-slate-300 transition-colors" />
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 w-max max-w-xs px-3 py-2 bg-slate-800/95 backdrop-blur text-slate-200 text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-xl border border-slate-700 z-50">
              Manage customer dues and pending payments
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
            className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-lg border transition-all shadow-sm ${
              isAddFormOpen 
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' 
                : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/40'
            }`}
            title={isAddFormOpen ? 'Close Form' : 'Add New Record'}
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

          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-lg border transition-all shadow-sm relative ${isFilterOpen ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-700 hover:text-slate-200 hover:border-slate-600'}`}
            title="Filters"
          >
            <Filter className="w-4 h-4" />
            {(showOnlyDues || searchCustomer || searchArea || searchPhone) && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-500"></span>
            )}
          </button>

          {/* Compact Total Pending Widget */}
          <div className="h-10 justify-center bg-slate-900/80 backdrop-blur-xl border border-red-500/20 px-3 rounded-lg flex items-center gap-2 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-12 h-12 bg-red-500/10 rounded-full blur-lg group-hover:bg-red-500/20 transition-all"></div>
            <div className="p-1 bg-red-500/10 rounded md:hidden lg:block">
              <DollarSign className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div className="flex flex-col relative z-10">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Total Pending</span>
              <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 leading-none tracking-tight">Rs {totalPending.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 flex-1 min-h-0">
        
        {/* Top Panel: Form */}
        {isAddFormOpen && (
        <div className="shrink-0">
          <AddCustomerForm 
            name={name} setName={setName}
            phone={phone} setPhone={setPhone}
            area={area} setArea={setArea}
            amount={amount} setAmount={setAmount}
            status={status} setStatus={setStatus}
            isPosArrears={isPosArrears} setIsPosArrears={setIsPosArrears}
            isSubmitting={isSubmitting} handleSubmit={handleSubmit}
          />
        </div>
        )}

        {/* Bottom Area: List */}
        <div className="flex-1 h-full min-h-0">
          <div className="h-full flex flex-col min-h-0 bg-gradient-to-b from-slate-900/60 to-slate-950/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.3)] relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none"></div>

            {/* Collapsible Filters */}
            {isFilterOpen && (
              <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-center animate-in slide-in-from-top-2 fade-in duration-200 relative z-10">
                <div className="relative w-full">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={searchCustomer}
                    onChange={(e) => setSearchCustomer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/50 rounded-xl px-9 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500/50 text-sm"
                  />
                </div>
                <div className="relative w-full">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Area"
                    value={searchArea}
                    onChange={(e) => setSearchArea(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/50 rounded-xl px-9 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500/50 text-sm"
                  />
                </div>
                <div className="relative w-full">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/50 rounded-xl px-9 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500/50 text-sm"
                  />
                </div>
                
                <label className="flex items-center justify-center gap-2 cursor-pointer text-sm font-semibold text-slate-300 whitespace-nowrap bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-700/50 hover:border-cyan-500/30 transition-colors w-full">
                  <input
                    type="checkbox"
                    checked={showOnlyDues}
                    onChange={(e) => setShowOnlyDues(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/50 bg-slate-900"
                  />
                  Show Dues Only
                </label>
              </div>
            )}

            {loading ? (
              <div className="flex-1 flex justify-center items-center">
                <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-12">
                <User className="w-12 h-12 mb-3 opacity-20" />
                <p>No customers found.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar bg-slate-900/40 rounded-2xl border border-white/5">
                {/* Table Header */}
                <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-4 border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-950/80 sticky top-0 z-10 items-center">
                  <div className="col-span-1 flex justify-center text-yellow-500"><Star className="w-4 h-4 fill-yellow-500/20" /></div>
                  <div className="col-span-3">Customer</div>
                  <div className="col-span-3">Area</div>
                  <div className="col-span-2">Phone</div>
                  <div className="col-span-3 text-right">Due Status</div>
                </div>

                <div className="divide-y divide-white/5">
                  {filteredGroups.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map(renderGroup)}
                </div>

                {filteredGroups.length > ITEMS_PER_PAGE && (
                  <div className="flex items-center justify-between px-4 py-4 border-t border-white/5 bg-slate-950/50 mt-auto">
                    <span className="text-xs text-slate-500 font-semibold">
                      Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredGroups.length)} of {filteredGroups.length}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-300 text-xs font-bold disabled:opacity-50 hover:bg-slate-700 transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredGroups.length / ITEMS_PER_PAGE), p + 1))}
                        disabled={currentPage === Math.ceil(filteredGroups.length / ITEMS_PER_PAGE)}
                        className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-300 text-xs font-bold disabled:opacity-50 hover:bg-slate-700 transition-colors"
                      >
                        Next
                      </button>
                    </div>
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

      {/* History Modal */}
      {selectedCustomerForModal && (
        <CustomerHistoryModal 
          customer={selectedCustomerForModal}
          onClose={() => setSelectedCustomerForModal(null)}
          isAdmin={isAdmin}
          payingRecordId={payingRecordId}
          setPayingRecordId={setPayingRecordId}
          payingAmount={payingAmount}
          setPayingAmount={setPayingAmount}
          handlePartialPayment={handlePartialPayment}
          toggleStatus={toggleStatus}
          handleDelete={handleDelete}
        />
      )}
    </div>
  );
}
