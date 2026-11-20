import React, { useState, useEffect, useMemo } from 'react';
import { customerService, duesService, salesService } from '../../services/supabaseService';
import { 
  Search, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  DollarSign, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  Edit, 
  X, 
  RefreshCw, 
  Star, 
  HelpCircle, 
  Users,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Eye,
  AlertCircle
} from 'lucide-react';
import { notify } from '../../utils/toast';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import { AddCustomerForm, CustomerHistoryModal, CustomerPhoneModal } from './CustomersComponents';

const WhatsAppIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);

export default function Customers({ isAdmin }) {
  const [records, setRecords] = useState([]);
  const [directoryRecords, setDirectoryRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation & Sub-Tab: 'dues' (Customer Balances) or 'all' (Customer Directory)
  const [activeCustomersTab, setActiveCustomersTab] = useState('dues');

  // Search & Filter States
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchArea, setSearchArea] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [duesStatusFilter, setDuesStatusFilter] = useState('ALL'); // 'ALL', 'PENDING', 'ADVANCE', 'SETTLED'
  const [sortBy, setSortBy] = useState('due-desc'); // 'due-desc', 'advance-desc', 'name-asc', 'fav-desc'

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [selectedCustomerForModal, setSelectedCustomerForModal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Inline edit state for Area / Phone
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [editingField, setEditingField] = useState('');
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
  const [isPosArrears, setIsPosArrears] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete Modal State
  const [deleteRecordId, setDeleteRecordId] = useState(null);
  const [deleteGroupData, setDeleteGroupData] = useState(null);
  const [deleteCustomerData, setDeleteCustomerData] = useState(null);

  // WhatsApp Reminder & Phone Modal State
  const [phoneModalCustomer, setPhoneModalCustomer] = useState(null);
  const [phoneModalInput, setPhoneModalInput] = useState('');
  const [isSavingPhone, setIsSavingPhone] = useState(false);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchCustomer, searchArea, searchPhone, activeCustomersTab, duesStatusFilter]);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const dues = await duesService.getCustomerDues();
      setRecords(dues || []);

      const dirData = await customerService.getCustomers();
      setDirectoryRecords(dirData || []);
    } catch (error) {
      console.error("Error fetching records:", error);
      notify.error("Failed to load customer records.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      notify.error("Customer Name is required.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const custId = await customerService.findOrCreateCustomerByName(name.trim(), phone.trim(), area.trim());

      if (amount && Number(amount) > 0) {
        await duesService.createDue({
          customerId: custId,
          customerName: name.trim(),
          phone: phone.trim(),
          area: area.trim(),
          amount: Number(amount),
          status,
          isPosArrears,
          description: 'Manual Due Entry'
        });
      }
      notify.success("Record added successfully!");
      setName('');
      setPhone('');
      setArea('');
      setAmount('');
      setStatus('Pending');
      setIsPosArrears(false);
      setIsAddFormOpen(false);
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
        
        const customerPayments = group ? group.records.filter(r => r.type === 'Payment') : [];
        const totalPaymentsAmount = customerPayments.reduce((sum, r) => sum + r.amount, 0);

        let amountToConsume = Math.min(record.amount, totalPaymentsAmount);
        const actualCashReceived = record.amount - amountToConsume;

        if (amountToConsume > 0) {
          for (const payment of customerPayments) {
            if (amountToConsume <= 0) break;
            if (payment.amount <= amountToConsume) {
              await duesService.deleteDue(payment.id);
              amountToConsume -= payment.amount;
            } else {
              await duesService.updateDue(payment.id, {
                amount: payment.amount - amountToConsume
              });
              amountToConsume = 0;
            }
          }
        }
        
        if (record.isPosArrears !== false && actualCashReceived > 0) {
          const sale = await salesService.createSale({
            amount: actualCashReceived,
            discount: 0,
            description: `Account Settled: ${record.name}`,
            cartItems: [{ name: 'Account Settlement (Balance)', price: actualCashReceived, cost: 0, qty: 1 }],
            userId: 'system',
            customerName: record.name,
            isCredit: false,
            isAccountSettlement: true
          });
          saleRefId = sale.id;
        }

        await duesService.updateDue(record.id, {
          status: newStatus,
          linkedSaleId: saleRefId || null
        });
        
        if (actualCashReceived > 0) {
          notify.success(`Marked as Paid. Rs ${actualCashReceived.toFixed(2)} added to Sales.`);
        } else {
          notify.success(`Marked as Paid. Covered by existing payments.`);
        }
      } else {
        const newStatus = 'Pending';
        if (record.linkedSaleId) {
          await salesService.deleteSale(record.linkedSaleId);
        }

        if (record.consumedPaymentAmount && record.consumedPaymentAmount > 0) {
          await duesService.createDue({
            customerId: record.customerId,
            customerName: record.name,
            phone: record.phone || '',
            area: record.area || '',
            amount: record.consumedPaymentAmount,
            status: 'Paid',
            type: 'Payment',
            description: 'Restored Payment from Undo'
          });
        }
        
        await duesService.updateDue(record.id, {
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

  const handleGroupPayment = async (group) => {
    try {
      const paymentAmount = Number(payingAmount);
      if (!paymentAmount || paymentAmount <= 0) {
        setPayingRecordId(null);
        return;
      }

      if (group.hasPosArrears) {
        await salesService.createSale({
          amount: paymentAmount,
          discount: 0,
          description: `Account Payment: ${group.name}`,
          cartItems: [{ name: 'Account Settlement', price: paymentAmount, cost: 0, qty: 1 }],
          userId: 'system',
          customerName: group.name,
          isCredit: false,
          isAccountSettlement: true
        });
      }

      await duesService.createDue({
        customerId: group.directoryId || null,
        customerName: group.name,
        phone: group.phone || '',
        area: group.area || '',
        amount: paymentAmount,
        status: 'Paid',
        type: 'Payment',
        description: 'Account Payment'
      });

      notify.success(`Payment of Rs ${paymentAmount.toFixed(2)} recorded.`);
      setPayingRecordId(null);
      setPayingAmount('');
      fetchRecords();
    } catch (err) {
      console.error(err);
      notify.error("Failed to process payment");
    }
  };

  const confirmDeleteGroup = async () => {
    if (!deleteGroupData) return;
    try {
      for (const record of deleteGroupData.records) {
        if (record.id) {
          await duesService.deleteDue(record.id);
        }
      }
      notify.success("All dues for this customer deleted.");
      fetchRecords();
    } catch (error) {
      console.error("Error deleting group:", error);
      notify.error("Failed to delete dues.");
    } finally {
      setDeleteGroupData(null);
    }
  };

  const confirmDeleteCustomerDirectory = async () => {
    if (!deleteCustomerData) return;
    try {
      if (deleteCustomerData.directoryId) {
        await customerService.deleteCustomer(deleteCustomerData.directoryId);
      }
      for (const record of deleteCustomerData.records) {
        if (record.id) {
          await duesService.deleteDue(record.id);
        }
      }
      notify.success("Customer deleted successfully.");
      fetchRecords();
    } catch (error) {
      console.error("Error deleting customer:", error);
      notify.error("Failed to delete customer.");
    } finally {
      setDeleteCustomerData(null);
    }
  };

  const toggleFavorite = async (group, e) => {
    if (e) e.stopPropagation();
    try {
      let targetId = group.directoryId;
      const isNowFavorite = !group.mostVisited;

      if (!targetId) {
        const newCust = await customerService.createCustomer({
          name: group.name,
          phone: group.phone || '',
          area: group.area || '',
          mostVisited: true
        });
        targetId = newCust.id;
        notify.success('Added to favorites');
      } else {
        await customerService.updateCustomer(targetId, {
          mostVisited: isNowFavorite
        });
        notify.success(isNowFavorite ? 'Added to favorites' : 'Removed from favorites');
      }

      fetchRecords();
    } catch (error) {
      console.error("Error toggling favorite:", error);
      notify.error("Failed to update favorite status.");
    }
  };

  const openWhatsAppMessage = (customerName, phone, amount) => {
    let clean = (phone || '').replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '94' + clean.slice(1);
    } else if (clean.length === 9) {
      clean = '94' + clean;
    }

    const formattedAmount = Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const text = `*DESH Digital Hub - Payment Reminder*\n\nDear ${customerName},\nThis is a friendly reminder that you have an outstanding balance of *Rs. ${formattedAmount}* in your account.\nKindly settle this amount at your earliest convenience.\n\nThank you!\n*DESH Digital Hub*\nInquiries: 071 998 9000`;

    const url = `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleWhatsAppReminder = (group) => {
    if (!group) return;
    const cleanPhone = (group.phone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.length >= 9) {
      openWhatsAppMessage(group.name, group.phone, group.totalPending);
    } else {
      setPhoneModalCustomer(group);
      setPhoneModalInput(group.phone || '');
    }
  };

  const savePhoneAndSendReminder = async () => {
    if (!phoneModalCustomer) return;
    const trimmedPhone = phoneModalInput.trim();
    const cleanDigits = trimmedPhone.replace(/[^0-9]/g, '');

    if (cleanDigits.length < 9) {
      notify.error('Please enter a valid phone number (at least 9 digits).');
      return;
    }

    setIsSavingPhone(true);
    try {
      if (phoneModalCustomer.directoryId) {
        await customerService.updateCustomer(phoneModalCustomer.directoryId, { phone: trimmedPhone });
      }
      for (const r of phoneModalCustomer.records) {
        if (r.id) {
          await duesService.updateDue(r.id, { phone: trimmedPhone });
        }
      }
      notify.success('Phone number saved successfully.');
      openWhatsAppMessage(phoneModalCustomer.name, trimmedPhone, phoneModalCustomer.totalPending);
      setPhoneModalCustomer(null);
      setPhoneModalInput('');
      fetchRecords();
    } catch (err) {
      console.error(err);
      notify.error('Failed to update phone number.');
    } finally {
      setIsSavingPhone(false);
    }
  };

  // Group Records logic
  const allGrouped = useMemo(() => {
    const acc = {};
    
    (directoryRecords || []).forEach(dir => {
      const key = dir.name?.trim().toLowerCase() || 'unnamed';
      acc[key] = {
        nameKey: key,
        name: dir.name,
        phone: dir.phone || '',
        area: dir.area || '',
        mostVisited: !!dir.mostVisited,
        records: [],
        totalPending: 0,
        advanceBalance: 0,
        hasPending: false,
        hasAdvance: false,
        hasPosArrears: false,
        directoryId: dir.id,
        isOnlyDirectory: true
      };
    });
    
    (records || []).forEach(record => {
      const key = record.name?.trim().toLowerCase() || 'unnamed';
      if (!acc[key]) {
        acc[key] = {
          nameKey: key,
          name: record.name,
          phone: record.phone || '',
          area: record.area || '',
          mostVisited: false,
          records: [],
          totalPending: 0,
          advanceBalance: 0,
          hasPending: false,
          hasAdvance: false,
          hasPosArrears: false,
          directoryId: null,
          isOnlyDirectory: false
        };
      }
      acc[key].isOnlyDirectory = false;
      acc[key].records.push(record);
      if (record.isPosArrears) acc[key].hasPosArrears = true;
      if (!acc[key].phone && record.phone) acc[key].phone = record.phone;
      if (!acc[key].area && record.area) acc[key].area = record.area;
    });

    Object.values(acc).forEach(group => {
      let pendingTotal = 0;
      let paymentTotal = 0;
      
      group.records.forEach(r => {
        if (r.type === 'Payment') {
          paymentTotal += Number(r.amount || 0);
        } else if (r.status === 'Pending') {
          pendingTotal += Number(r.amount || 0);
        }
      });
      
      const netBalance = pendingTotal - paymentTotal;
      if (netBalance > 0) {
        group.totalPending = netBalance;
        group.advanceBalance = 0;
        group.hasPending = true;
        group.hasAdvance = false;
      } else if (netBalance < 0) {
        group.totalPending = 0;
        group.advanceBalance = Math.abs(netBalance);
        group.hasPending = false;
        group.hasAdvance = true;
      } else {
        group.totalPending = 0;
        group.advanceBalance = 0;
      }
    });
    
    return Object.values(acc);
  }, [records, directoryRecords]);

  // Extract unique areas
  const uniqueAreas = useMemo(() => {
    const areas = new Set();
    allGrouped.forEach(g => {
      if (g.area && g.area.trim()) areas.add(g.area.trim());
    });
    return Array.from(areas).sort();
  }, [allGrouped]);

  // Filter & Sort
  const filteredGroups = useMemo(() => {
    const qName = searchCustomer.toLowerCase().trim();
    const qArea = searchArea.toLowerCase().trim();
    const qPhone = searchPhone.trim();
    
    let list = allGrouped.filter(g => {
      if (qName && !(g.name || '').toLowerCase().includes(qName)) return false;
      if (qArea && !(g.area || '').toLowerCase().includes(qArea)) return false;
      if (qPhone && !(g.phone || '').includes(qPhone)) return false;

      if (activeCustomersTab === 'dues') {
        if (duesStatusFilter === 'PENDING' && !g.hasPending) return false;
        if (duesStatusFilter === 'ADVANCE' && !g.hasAdvance) return false;
        if (duesStatusFilter === 'SETTLED' && (g.hasPending || g.hasAdvance)) return false;
        if (duesStatusFilter === 'ALL' && (!g.hasPending && !g.hasAdvance)) return false;
      }

      return true;
    });

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'due-desc') return b.totalPending - a.totalPending;
      if (sortBy === 'advance-desc') return b.advanceBalance - a.advanceBalance;
      if (sortBy === 'fav-desc') return (b.mostVisited ? 1 : 0) - (a.mostVisited ? 1 : 0);
      if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });

    return list;
  }, [allGrouped, searchCustomer, searchArea, searchPhone, activeCustomersTab, duesStatusFilter, sortBy]);

  // Total Outstanding Dues
  const totalPendingDues = useMemo(() => {
    return allGrouped.reduce((sum, g) => sum + (g.totalPending || 0), 0);
  }, [allGrouped]);

  const totalAdvanceDues = useMemo(() => {
    return allGrouped.reduce((sum, g) => sum + (g.advanceBalance || 0), 0);
  }, [allGrouped]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchCustomer('');
    setSearchArea('');
    setSearchPhone('');
    setDuesStatusFilter('ALL');
    setSortBy('due-desc');
    notify.info('Filters reset to default');
  };

  return (
    <div className="w-full h-full flex flex-col space-y-2 overflow-hidden text-slate-100">
      
      {/* Top Header Control Strip */}
      <div className="relative z-20 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-2 sm:p-2.5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
        
        {/* Left: Tab Switcher (Outstanding Dues vs All Customers) */}
        <div className="flex items-center gap-1.5 bg-[#090d16] p-0.5 rounded-xl border border-slate-800/90 w-full sm:w-auto">
          <button
            onClick={() => setActiveCustomersTab('dues')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeCustomersTab === 'dues'
                ? 'bg-rose-500 text-slate-950 font-black shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Outstanding Dues</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-black ${
              activeCustomersTab === 'dues' ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-800 text-rose-400'
            }`}>
              {allGrouped.filter(g => g.hasPending).length}
            </span>
          </button>

          <button
            onClick={() => setActiveCustomersTab('all')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeCustomersTab === 'all'
                ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Customer Directory</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-black ${
              activeCustomersTab === 'all' ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-800 text-sky-400'
            }`}>
              {allGrouped.length}
            </span>
          </button>
        </div>

        {/* Center: Search Box */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer name, phone..."
            value={searchCustomer}
            onChange={(e) => setSearchCustomer(e.target.value)}
            className="w-full bg-[#090d16] border border-slate-800 focus:border-sky-500/80 rounded-xl pl-8.5 pr-7 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all shadow-inner"
          />
          {searchCustomer && (
            <button
              onClick={() => setSearchCustomer('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Metrics & Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          
          {/* Total Pending Dues Badge */}
          {activeCustomersTab === 'dues' && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/25 rounded-xl shadow-inner text-xs">
              <span className="text-[10px] text-rose-400 font-black uppercase">Total Dues:</span>
              <span className="font-mono font-black text-rose-400">
                Rs. {totalPendingDues.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}

          <button
            onClick={fetchRecords}
            className="p-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700/80 transition-all cursor-pointer shadow-sm"
            title="Refresh Table"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-slate-950 text-xs font-black shadow-md shadow-sky-500/20 transition-all cursor-pointer"
          >
            {isAddFormOpen ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 stroke-[3]" />}
            <span>{isAddFormOpen ? 'Close' : activeCustomersTab === 'all' ? 'Add Customer' : 'Add Due'}</span>
          </button>
        </div>

      </div>

      {/* Main Split Layout: Left Filter Drawer + Right Content */}
      <div className="flex-1 flex flex-col md:flex-row gap-3 min-h-0 overflow-hidden">
        
        {/* Left: Advanced Filters Drawer */}
        <div className="w-full md:w-64 shrink-0 bg-[#071326]/90 backdrop-blur-md border border-slate-800/80 rounded-2xl p-3.5 flex flex-col gap-3 shadow-xl overflow-y-auto custom-scrollbar">
          
          {/* Header: Title & Reset */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-200">Customer Filter</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Area Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Area / Location</label>
            <div className="relative">
              <select
                value={searchArea}
                onChange={(e) => setSearchArea(e.target.value)}
                className="w-full appearance-none bg-[#090d16] border border-slate-800 focus:border-sky-500/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-medium focus:outline-none cursor-pointer pr-8 shadow-inner"
              >
                <option value="">All Areas</option>
                {uniqueAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Phone Search */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filter Phone</label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Phone digits..."
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-800 focus:border-sky-500/80 rounded-xl pl-8.5 pr-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none font-mono shadow-inner"
              />
            </div>
          </div>

          {/* Sort By */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sort By</label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none bg-[#090d16] border border-slate-800 focus:border-sky-500/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-medium focus:outline-none cursor-pointer pr-8 shadow-inner"
              >
                <option value="due-desc">Highest Due (Rs ↓)</option>
                <option value="advance-desc">Advance Balance (Rs ↓)</option>
                <option value="fav-desc">Favorites / Frequent First</option>
                <option value="name-asc">Customer Name (A-Z)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Dues Status Filter (for dues tab) */}
          {activeCustomersTab === 'dues' && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Balance Status</label>
              <div className="relative">
                <select
                  value={duesStatusFilter}
                  onChange={(e) => setDuesStatusFilter(e.target.value)}
                  className="w-full appearance-none bg-[#090d16] border border-slate-800 focus:border-sky-500/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-medium focus:outline-none cursor-pointer pr-8 shadow-inner"
                >
                  <option value="ALL">All Active Balances</option>
                  <option value="PENDING">Pending Dues Only</option>
                  <option value="ADVANCE">Advance Balances Only</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Filter Status Badge */}
          <div className="mt-auto pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 uppercase font-black tracking-wider text-[10px]">Filtered Clients</span>
            <span className="font-mono font-black text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-full">
              {filteredGroups.length}
            </span>
          </div>

        </div>

        {/* Right: Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden space-y-2">
          
          {/* Add Customer / Due Form Card */}
          {isAddFormOpen && (
            <div className="shrink-0 animate-in fade-in duration-200">
              <AddCustomerForm
                name={name} setName={setName}
                phone={phone} setPhone={setPhone}
                area={area} setArea={setArea}
                amount={amount} setAmount={setAmount}
                status={status} setStatus={setStatus}
                isPosArrears={isPosArrears} setIsPosArrears={setIsPosArrears}
                isSubmitting={isSubmitting} handleSubmit={handleSubmit}
                activeCustomersTab={activeCustomersTab} directoryRecords={directoryRecords}
              />
            </div>
          )}

          {/* Table Container */}
          <div className="flex-1 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-0">
            <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-[#071326] border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-10">★</th>
                    <th className="py-2.5 px-3.5">Customer Name</th>
                    <th className="py-2.5 px-3.5 w-36">Phone Number</th>
                    <th className="py-2.5 px-3.5 w-36 hidden sm:table-cell">Area / Town</th>
                    <th className="py-2.5 px-3.5 text-right w-40">
                      {activeCustomersTab === 'all' ? 'Account Balance' : 'Outstanding Balance'}
                    </th>
                    <th className="py-2.5 px-3.5 text-center w-36">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredGroups.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center gap-2.5 text-slate-500">
                          <Users className="w-10 h-10 stroke-[1.5] text-slate-600" />
                          <p className="text-sm font-bold text-slate-400">No customer records found</p>
                          <p className="text-xs text-slate-500">Try adjusting your search or filters.</p>
                          <button
                            onClick={handleResetFilters}
                            className="mt-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-xl text-xs font-bold border border-slate-700 transition-all cursor-pointer"
                          >
                            Reset Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredGroups.map((group) => {
                      const isPaying = payingRecordId === group.nameKey;

                      return (
                        <tr
                          key={group.nameKey}
                          className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                          onClick={() => setSelectedCustomerForModal(group)}
                        >
                          {/* Favorite Star */}
                          <td 
                            className="py-2.5 px-3 text-center align-middle"
                            onClick={(e) => toggleFavorite(group, e)}
                          >
                            <Star className={`w-4 h-4 transition-colors cursor-pointer inline-block ${
                              group.mostVisited 
                                ? 'text-amber-400 fill-amber-400' 
                                : 'text-slate-600 hover:text-amber-400/50'
                            }`} />
                          </td>

                          {/* Customer Name */}
                          <td className="py-2.5 px-3.5 align-middle">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300 shrink-0">
                                {(group.name || 'C').substring(0, 2).toUpperCase()}
                              </div>
                              <span className="font-bold text-slate-100 text-xs truncate max-w-[180px]">
                                {group.name}
                              </span>
                            </div>
                          </td>

                          {/* Phone */}
                          <td 
                            className="py-2.5 px-3.5 align-middle font-mono text-slate-300"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {editingRecordId === group.nameKey && editingField === 'phone' ? (
                              <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-0.5 border border-sky-500">
                                <input
                                  type="text"
                                  value={editingValue}
                                  onChange={e => setEditingValue(e.target.value)}
                                  className="bg-transparent text-slate-200 text-xs px-1 w-24 outline-none font-mono"
                                />
                                <CheckCircle
                                  className="w-4 h-4 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                                  onClick={async () => {
                                    try {
                                      const custId = group.directoryId || await customerService.findOrCreateCustomerByName(group.name, editingValue, group.area);
                                      if (group.directoryId) {
                                        await customerService.updateCustomer(custId, { phone: editingValue });
                                      }
                                      for (const r of group.records) {
                                        if (r.id) await duesService.updateDue(r.id, { phone: editingValue });
                                      }
                                      setEditingRecordId(null);
                                      fetchRecords();
                                      notify.success("Phone updated!");
                                    } catch (err) {
                                      notify.error("Failed to update phone");
                                    }
                                  }}
                                />
                                <X className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer" onClick={() => setEditingRecordId(null)} />
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 group/phone">
                                <span className="text-xs">{group.phone || <span className="text-slate-500 italic">No phone</span>}</span>
                                <button
                                  onClick={() => {
                                    setEditingRecordId(group.nameKey);
                                    setEditingField('phone');
                                    setEditingValue(group.phone || '');
                                  }}
                                  className="opacity-0 group-hover/phone:opacity-100 text-slate-500 hover:text-sky-300 p-0.5"
                                  title="Edit phone"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </td>

                          {/* Area */}
                          <td 
                            className="py-2.5 px-3.5 align-middle hidden sm:table-cell"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {editingRecordId === group.nameKey && editingField === 'area' ? (
                              <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-0.5 border border-sky-500">
                                <input
                                  type="text"
                                  value={editingValue}
                                  onChange={e => setEditingValue(e.target.value)}
                                  className="bg-transparent text-slate-200 text-xs px-1 w-24 outline-none"
                                />
                                <CheckCircle
                                  className="w-4 h-4 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                                  onClick={async () => {
                                    try {
                                      const custId = group.directoryId || await customerService.findOrCreateCustomerByName(group.name, group.phone, editingValue);
                                      if (group.directoryId) {
                                        await customerService.updateCustomer(custId, { area: editingValue });
                                      }
                                      for (const r of group.records) {
                                        if (r.id) await duesService.updateDue(r.id, { area: editingValue });
                                      }
                                      setEditingRecordId(null);
                                      fetchRecords();
                                      notify.success("Area updated!");
                                    } catch (err) {
                                      notify.error("Failed to update area");
                                    }
                                  }}
                                />
                                <X className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer" onClick={() => setEditingRecordId(null)} />
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 group/area">
                                <span className="text-xs text-slate-400">{group.area || <span className="text-slate-600 italic">None</span>}</span>
                                <button
                                  onClick={() => {
                                    setEditingRecordId(group.nameKey);
                                    setEditingField('area');
                                    setEditingValue(group.area || '');
                                  }}
                                  className="opacity-0 group-hover/area:opacity-100 text-slate-500 hover:text-sky-300 p-0.5"
                                  title="Edit area"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </td>

                          {/* Balance / Status */}
                          <td className="py-2.5 px-3.5 text-right whitespace-nowrap align-middle">
                            {group.hasPending ? (
                              <span className="font-mono font-black text-rose-400 bg-rose-500/10 border border-rose-500/25 px-2 py-0.5 rounded-lg text-xs">
                                -Rs. {group.totalPending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            ) : group.hasAdvance ? (
                              <span className="font-mono font-black text-sky-400 bg-sky-500/10 border border-sky-500/25 px-2 py-0.5 rounded-lg text-xs">
                                +Rs. {group.advanceBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            ) : (
                              <span className="font-mono text-slate-500 text-xs">
                                Settled
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td 
                            className="py-2.5 px-3.5 text-center whitespace-nowrap align-middle"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-center gap-1.5">
                              
                              {/* Partial Payment input row or button */}
                              {isPaying ? (
                                <div className="flex items-center gap-1 bg-[#071326] p-1 rounded-xl border border-sky-500 shadow-md">
                                  <input
                                    type="number"
                                    placeholder="Amount"
                                    value={payingAmount}
                                    onChange={(e) => setPayingAmount(e.target.value)}
                                    className="bg-transparent text-xs text-emerald-400 font-mono font-bold w-16 px-1 outline-none text-right"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleGroupPayment(group)}
                                    className="p-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 rounded"
                                    title="Confirm Payment"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => { setPayingRecordId(null); setPayingAmount(''); }}
                                    className="p-1 text-slate-400 hover:text-white"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  {/* WhatsApp Reminder */}
                                  {group.hasPending && (
                                    <button
                                      onClick={() => handleWhatsAppReminder(group)}
                                      className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors shadow-sm"
                                      title="Send WhatsApp Reminder"
                                    >
                                      <WhatsAppIcon className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {/* Quick Pay Button */}
                                  {!group.hasAdvance && (
                                    <button
                                      onClick={() => {
                                        setPayingRecordId(group.nameKey);
                                        setPayingAmount(group.totalPending > 0 ? group.totalPending : '');
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-bold transition-colors"
                                    >
                                      Pay
                                    </button>
                                  )}

                                  {/* Order History Eye button */}
                                  <button
                                    onClick={() => setSelectedCustomerForModal(group)}
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
                                    title="View Customer Records"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Clear/Delete */}
                                  <button
                                    onClick={() => {
                                      if (activeCustomersTab === 'all') {
                                        setDeleteCustomerData(group);
                                      } else {
                                        setDeleteGroupData(group);
                                      }
                                    }}
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors"
                                    title={activeCustomersTab === 'all' ? "Delete Customer" : "Clear Dues"}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}

                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-4 py-2 bg-[#071326] border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
                <span>Active Tab: <strong className="text-sky-300">{activeCustomersTab === 'dues' ? 'Outstanding Dues' : 'Directory'}</strong></span>
              </div>
              <div className="font-mono text-slate-400">
                Showing {filteredGroups.length} customer profiles
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Modals */}
      {selectedCustomerForModal && (
        <CustomerHistoryModal
          selectedCustomerForModal={selectedCustomerForModal}
          setSelectedCustomerForModal={setSelectedCustomerForModal}
          toggleStatus={toggleStatus}
          handlePartialPayment={handleGroupPayment}
          handleDelete={handleDelete}
          isAdmin={isAdmin}
          WhatsAppIcon={WhatsAppIcon}
          handleWhatsAppReminder={handleWhatsAppReminder}
        />
      )}

      {phoneModalCustomer && (
        <CustomerPhoneModal
          phoneModalCustomer={phoneModalCustomer}
          setPhoneModalCustomer={setPhoneModalCustomer}
          phoneModalInput={phoneModalInput}
          setPhoneModalInput={setPhoneModalInput}
          isSavingPhone={isSavingPhone}
          savePhoneAndSendReminder={savePhoneAndSendReminder}
          WhatsAppIcon={WhatsAppIcon}
        />
      )}

      {/* Clear Group Dues Confirmation Modal */}
      <DeleteConfirmModal 
        isOpen={!!deleteGroupData} 
        onClose={() => setDeleteGroupData(null)} 
        onConfirm={confirmDeleteGroup}
        title="Clear All Dues for Customer?"
        message={`Are you sure you want to delete all dues for ${deleteGroupData?.name}? This action cannot be undone.`}
      />

      {/* Delete Customer from Directory Confirmation Modal */}
      <DeleteConfirmModal 
        isOpen={!!deleteCustomerData} 
        onClose={() => setDeleteCustomerData(null)} 
        onConfirm={confirmDeleteCustomerDirectory}
        title="Delete Customer from Directory?"
        message={`Are you sure you want to completely delete ${deleteCustomerData?.name} and all their records?`}
      />

    </div>
  );
}
