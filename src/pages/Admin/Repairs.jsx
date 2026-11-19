import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../config/supabase';
import { salesService, customerService } from '../../services/supabaseService';
import { format } from 'date-fns';
import { parseTimestamp } from '../../utils/helpers';
import { 
  Search, 
  Plus, 
  Wrench, 
  X, 
  Check, 
  Save, 
  PlusCircle, 
  Trash2, 
  Calculator, 
  Printer, 
  Edit, 
  Send, 
  HelpCircle,
  Laptop,
  Monitor,
  Cpu,
  Smartphone,
  Printer as PrinterIcon,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Phone,
  ShieldCheck,
  Tag,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import logo from '../../assets/logo.webp';
import { notify } from '../../utils/toast';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import { RepairJobModal, RepairBillModal } from './RepairsComponents';
import { generateRepairInvoiceHtml } from '../../utils/invoiceTemplate';

export default function Repairs({ user, fetchSales }) {
  const [repairs, setRepairs] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isViewBillModalOpen, setIsViewBillModalOpen] = useState(false);
  const [viewingJob, setViewingJob] = useState(null);
  const [deleteModalJobId, setDeleteModalJobId] = useState(null);

  // Unified Job Form State
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [modalStatus, setModalStatus] = useState('Pending');
  const [warrantyDays, setWarrantyDays] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [editAdvancePayment, setEditAdvancePayment] = useState(0);
  const [editFinalPayment, setEditFinalPayment] = useState(0);
  const [editSalutation, setEditSalutation] = useState('Mr.');
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editDeviceType, setEditDeviceType] = useState('PC');
  const [editSerial, setEditSerial] = useState('');
  const [editIssue, setEditIssue] = useState('');
  const [editCalcItems, setEditCalcItems] = useState([{ desc: '', amount: '' }]);
  const [showCalc, setShowCalc] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: repData, error } = await supabase
        .from('view_repairs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) console.error("Error fetching repairs:", error);

      const mappedRepairs = (repData || []).map(r => {
        const extra = (r.parts_used && typeof r.parts_used === 'object' && !Array.isArray(r.parts_used))
          ? r.parts_used
          : { parts: r.parts_used || [] };

        return {
          id: r.id,
          customerId: r.customer_id,
          customerName: r.customer_name || 'Repair Customer',
          whatsapp: r.phone || '',
          deviceType: r.device_model || 'PC',
          issue: r.issue || '',
          status: r.status || 'Pending',
          isPaid: Boolean(r.is_paid),
          createdAt: r.created_at,
          timestamp: r.created_at,
          discount: Number(extra.discount) || 0,
          advancePayment: Number(extra.advancePayment) || 0,
          finalPayment: Number(extra.finalPayment) || 0,
          warrantyDays: Number(extra.warrantyDays) || 0,
          serial: extra.serial || '',
          salutation: extra.salutation || 'Mr.',
          calcItems: extra.calcItems || [],
          parts: extra.parts || [],
          profit: extra.profit,
          finalTotal: extra.finalTotal,
          ...extra
        };
      });

      setRepairs(mappedRepairs);
      setInventory([]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (id) => {
    setDeleteModalJobId(id);
  };

  const confirmDeleteJob = async () => {
    if (!deleteModalJobId) return;
    try {
      await supabase.from('repairs').delete().eq('id', deleteModalJobId);
      fetchData();
      notify.success("Job deleted successfully.");
    } catch (err) {
      console.error(err);
      notify.error("Failed to delete job.");
    } finally {
      setDeleteModalJobId(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openJobModal = (repair = null) => {
    setSelectedRepair(repair);
    if (repair) {
      let cName = repair.customerName || '';
      let sal = 'Mr.';
      const prefixes = ['Mr.', 'Mrs.', 'Ms.', 'Rev.', 'Dr.', 'Hon.'];
      for (let p of prefixes) {
        if (cName.startsWith(p + ' ')) {
          sal = p;
          cName = cName.substring(p.length + 1).trim();
          break;
        }
      }
      setEditSalutation(repair.salutation || sal);
      setEditCustomerName(cName);
      setEditWhatsapp(repair.whatsapp || '');
      setEditDeviceType(repair.deviceType || 'PC');
      setEditSerial(repair.serial || '');
      setEditIssue(repair.issue || '');
      setModalStatus(repair.status || 'Pending');
      setWarrantyDays(repair.warrantyDays || 0);
      setDiscount(Number(repair.discount) || 0);
      setEditAdvancePayment(repair.advancePayment || 0);
      setEditFinalPayment(repair.finalPayment || 0);
      setEditCalcItems(repair.calcItems && repair.calcItems.length > 0 ? repair.calcItems : [{ desc: '', amount: '' }]);
    } else {
      setEditSalutation('Mr.');
      setEditCustomerName('');
      setEditWhatsapp('');
      setEditDeviceType('PC');
      setEditSerial('');
      setEditIssue('');
      setModalStatus('Pending');
      setWarrantyDays(0);
      setDiscount(0);
      setEditAdvancePayment(0);
      setEditFinalPayment(0);
      setEditCalcItems([{ desc: '', amount: '' }]);
    }
    setShowCalc(false);
    setIsJobModalOpen(true);
  };

  const hasPendingBalanceToComplete = () => {
    return modalStatus === 'Paid' && currentFinalTotal > 0;
  };

  const handleSaveJob = async (e, shouldPrint = false) => {
    if (e) e.preventDefault();
    if (!editCustomerName || !editIssue) return notify.error('Customer Name and Issue are required.');
    
    if (selectedRepair && hasPendingBalanceToComplete()) {
      notify.error("Please mark the pending balance as paid before saving.");
      return;
    }

    const jobData = {
      customerName: `${editSalutation} ${editCustomerName.trim()}`,
      whatsapp: editWhatsapp,
      deviceType: editDeviceType,
      serial: editSerial,
      issue: editIssue,
      calcItems: editCalcItems,
      warrantyDays: Number(warrantyDays) || 0,
      discount: Number(discount) || 0,
      advancePayment: Number(editAdvancePayment) || 0,
      finalPayment: Number(editFinalPayment) || 0,
      estCost: editCalcItems.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    };

    try {
      let customerId = selectedRepair?.customerId || null;
      if (!customerId && jobData.customerName) {
        customerId = await customerService.findOrCreateCustomerByName(jobData.customerName, jobData.whatsapp);
      }

      if (selectedRepair) {
        jobData.status = modalStatus;

        if (modalStatus === 'Paid' && selectedRepair.status !== 'Paid') {
          const partsTotal = (selectedRepair.parts || []).reduce((sum, p) => sum + p.sellingPrice, 0);
          const calcItemsTotal = editCalcItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
          const calcCostTotal = editCalcItems.reduce((sum, item) => sum + Number(item.buyingPrice || 0), 0);
          
          const buyingTotal = (selectedRepair.parts || []).reduce((sum, p) => sum + p.buyingPrice, 0) + calcCostTotal;
          const totalJobAmount = partsTotal + calcItemsTotal - Number(discount);
          
          jobData.finalTotal = totalJobAmount;
          jobData.profit = totalJobAmount - buyingTotal;

          let description = `Repair Payment: ${jobData.customerName} - ${jobData.deviceType} `;
          if ((selectedRepair.parts || []).length > 0) {
            description += `| Parts: ${(selectedRepair.parts || []).map(p => p.name).join(', ')} `;
          }
          if (editCalcItems.length > 0) {
            const calcDescs = editCalcItems.filter(i => i.desc).map(i => i.desc);
            if (calcDescs.length > 0) {
              description += `| Services: ${calcDescs.join(', ')} `;
            }
          }

          await salesService.createSale({
            amount: totalJobAmount,
            discount: Number(jobData.discount || 0),
            description,
            customerName: jobData.customerName || 'Repair Customer',
            customerPhone: jobData.whatsapp || '',
            userId: user?.id || user?.email || 'system'
          });
        }

        const repairPayload = {
          customer_id: customerId,
          device_model: jobData.deviceType || 'PC',
          issue: jobData.issue || '',
          cost: Number(jobData.finalTotal || jobData.estCost || 0),
          estimated_cost: Number(jobData.estCost || 0),
          status: jobData.status,
          is_paid: jobData.status === 'Paid',
          parts_used: {
            parts: selectedRepair.parts || [],
            calcItems: jobData.calcItems || [],
            warrantyDays: jobData.warrantyDays,
            advancePayment: jobData.advancePayment,
            finalPayment: jobData.finalPayment,
            discount: Number(jobData.discount) || 0,
            serial: jobData.serial,
            deviceType: jobData.deviceType,
            salutation: editSalutation,
            profit: jobData.profit,
            finalTotal: jobData.finalTotal
          }
        };

        await supabase.from('repairs').update(repairPayload).eq('id', selectedRepair.id);
      } else {
        jobData.status = 'Pending';
        jobData.parts = [];
        jobData.laborCharge = 0;
        jobData.finalTotal = 0;

        const repairPayload = {
          customer_id: customerId,
          device_model: jobData.deviceType || 'PC',
          issue: jobData.issue || '',
          cost: 0,
          estimated_cost: Number(jobData.estCost || 0),
          status: 'Pending',
          is_paid: false,
          parts_used: {
            parts: [],
            calcItems: jobData.calcItems || [],
            warrantyDays: jobData.warrantyDays,
            advancePayment: jobData.advancePayment,
            finalPayment: jobData.finalPayment,
            discount: Number(jobData.discount) || 0,
            serial: jobData.serial,
            deviceType: jobData.deviceType,
            salutation: editSalutation
          }
        };
        
        const { data: createdRepair, error: createErr } = await supabase.from('repairs').insert(repairPayload).select().single();
        if (createErr) throw createErr;
        jobData.id = createdRepair.id;
        
        if (shouldPrint) {
          printEstimate(jobData);
        }
      }

      setIsJobModalOpen(false);
      fetchData();
      if (fetchSales) fetchSales();
      notify.success(`Job ${selectedRepair ? 'updated' : 'created'} successfully!`);
    } catch (err) {
      console.error(err);
      notify.error('Error saving job');
    }
  };

  const printEstimate = (jobData) => {
    const html = generateRepairInvoiceHtml(jobData, true);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };





  const printFinalBill = (job) => {
    const html = generateRepairInvoiceHtml(job, false);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleQuickStatusChange = async (job, newStatus) => {
    if (job.status === newStatus) return;
    try {
      const isPaid = newStatus === 'Paid';

      // If marking as Paid and wasn't Paid before, record sale
      if (newStatus === 'Paid' && job.status !== 'Paid') {
        const pTotal = (job.parts || []).reduce((sum, p) => sum + Number(p.sellingPrice || 0), 0);
        const cTotal = (job.calcItems || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const calcCostTotal = (job.calcItems || []).reduce((sum, item) => sum + Number(item.buyingPrice || 0), 0);
        const buyingTotal = (job.parts || []).reduce((sum, p) => sum + Number(p.buyingPrice || 0), 0) + calcCostTotal;
        const discountAmt = Number(job.discount || 0);

        let totalJobAmount = (pTotal + cTotal) > 0 
          ? (pTotal + cTotal - discountAmt) 
          : (Number(job.finalTotal || job.estCost || 0) - discountAmt);
        if (totalJobAmount < 0) totalJobAmount = 0;

        let description = `Repair Payment: ${job.customerName || 'Customer'} - ${job.deviceType || 'PC'} `;
        if ((job.parts || []).length > 0) {
          description += `| Parts: ${job.parts.map(p => p.name).join(', ')} `;
        }
        if ((job.calcItems || []).length > 0) {
          const calcDescs = job.calcItems.filter(i => i.desc).map(i => i.desc);
          if (calcDescs.length > 0) {
            description += `| Services: ${calcDescs.join(', ')} `;
          }
        }

        if (totalJobAmount > 0) {
          await salesService.createSale({
            amount: totalJobAmount,
            discount: discountAmt,
            description,
            customerName: job.customerName || 'Repair Customer',
            customerPhone: job.whatsapp || '',
            userId: user?.id || user?.email || 'system'
          });
        }
      }

      // Update in Supabase
      const { error } = await supabase
        .from('repairs')
        .update({
          status: newStatus,
          is_paid: isPaid
        })
        .eq('id', job.id);

      if (error) {
        console.error("Error updating status:", error);
        notify.error("Failed to update status");
        return;
      }

      // Optimistically update local state
      setRepairs(prev => prev.map(r => r.id === job.id ? { ...r, status: newStatus, isPaid } : r));
      if (fetchSales) fetchSales();
      notify.success(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating status:", err);
      notify.error("Failed to update status");
    }
  };

  const handlePrintBill = () => {
    if (!selectedRepair) return;
    printFinalBill({
      ...selectedRepair,
      parts: usedParts,
      laborCharge,
      discount
    });
  };

  const viewBill = (job) => {
    setViewingJob(job);
    setIsViewBillModalOpen(true);
  };

  const partsTotal = (selectedRepair?.parts || []).reduce((sum, p) => sum + p.sellingPrice, 0);
  const calcItemsTotal = editCalcItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const currentFinalTotal = Math.max(0, partsTotal + calcItemsTotal - Number(discount || 0) - Number(editAdvancePayment || 0) - Number(editFinalPayment || 0));

  const commonServices = [
    { name: 'Computer Formatting', price: 1500 },
    { name: 'Software Installation', price: 500 },
    { name: 'Driver Updating', price: 500 },
    { name: 'PC/Laptop service', price: 500 }
  ];

  const handleQuickAdd = (service) => {
    let newItems = [...editCalcItems];
    if (newItems.length === 1 && newItems[0].desc === '' && !newItems[0].amount) {
      newItems = [{ desc: service.name, amount: service.price }];
    } else {
      newItems.push({ desc: service.name, amount: service.price });
    }
    setEditCalcItems(newItems);
  };

  const getDeviceIcon = (deviceType) => {
    const dt = (deviceType || '').toLowerCase();
    if (dt.includes('laptop') || dt.includes('macbook') || dt.includes('notebook')) return Laptop;
    if (dt.includes('monitor') || dt.includes('screen') || dt.includes('display')) return Monitor;
    if (dt.includes('printer')) return PrinterIcon;
    if (dt.includes('phone') || dt.includes('tab')) return Smartphone;
    return Cpu;
  };

  const openWhatsAppChat = (e, phone, name, id) => {
    e.stopPropagation();
    if (!phone) return;
    let formattedNum = phone.replace(/\D/g, '');
    if (formattedNum.startsWith('0')) formattedNum = '94' + formattedNum.substring(1);
    const msg = `Hello ${name}, regarding your PC Repair Job #${id.slice(0, 6).toUpperCase()} at DESH Digital Hub...`;
    window.open(`https://wa.me/${formattedNum}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // KPI Calculations
  const totalJobsCount = repairs.length;
  const pendingCount = repairs.filter(r => r.status === 'Pending').length;
  const inProgressCount = repairs.filter(r => r.status === 'In Progress').length;
  const completedCount = repairs.filter(r => r.status === 'Completed').length;
  const paidCount = repairs.filter(r => r.status === 'Paid').length;
  const activeBalanceDue = repairs
    .filter(r => r.status !== 'Paid')
    .reduce((sum, r) => {
      const pTotal = (r.parts || []).reduce((s, p) => s + Number(p.sellingPrice || 0), 0);
      const cTotal = (r.calcItems || []).reduce((s, i) => s + Number(i.amount || 0), 0);
      const sub = (pTotal + cTotal) > 0 ? (pTotal + cTotal) : Number(r.finalTotal || r.estCost || 0);
      const adv = Number(r.advancePayment || 0);
      const disc = Number(r.discount || 0);
      return sum + Math.max(0, sub - adv - disc);
    }, 0);

  // Filtered Jobs
  const filteredRepairs = useMemo(() => {
    return repairs.filter(job => {
      if (statusFilter !== 'All' && job.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = (job.id || '').toLowerCase().includes(q);
        const matchName = (job.customerName || '').toLowerCase().includes(q);
        const matchPhone = (job.whatsapp || '').toLowerCase().includes(q);
        const matchDevice = (job.deviceType || '').toLowerCase().includes(q);
        const matchIssue = (job.issue || '').toLowerCase().includes(q);
        const matchSerial = (job.serial || '').toLowerCase().includes(q);
        if (!matchId && !matchName && !matchPhone && !matchDevice && !matchIssue && !matchSerial) return false;
      }
      return true;
    });
  }, [repairs, statusFilter, searchQuery]);

  return (
    <div className="w-full h-full flex flex-col space-y-2 overflow-hidden">

      {/* Control Strip (Top Toolbar matching POS layout): Status Filter Tabs + Search + Refresh + New Job */}
      <div className="relative z-20 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-2 sm:p-2.5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
        
        {/* Status Filter Tabs / Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto custom-scrollbar">
          {[
            { id: 'All', label: 'All Jobs', count: totalJobsCount },
            { id: 'Pending', label: 'In Queue', count: pendingCount },
            { id: 'In Progress', label: 'In Progress', count: inProgressCount },
            { id: 'Completed', label: 'Ready', count: completedCount },
            { id: 'Paid', label: 'Paid', count: paidCount }
          ].map(tab => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                  isActive
                    ? 'bg-sky-500/20 border-sky-400/80 text-white shadow-md shadow-sky-500/10'
                    : 'bg-[#090d16] hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-sky-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search customer, phone, device..."
              className="w-full bg-[#090d16] border border-slate-800 focus:border-sky-500/60 rounded-xl pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-xl bg-[#090d16] hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40 text-slate-300 hover:text-sky-300 transition-all cursor-pointer shrink-0"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>

          <button
            onClick={() => openJobModal()}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs shadow-md shadow-sky-500/20 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Job</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Strip (Compact Matching POS Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 shrink-0">
        {/* Total Active Jobs */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-2 sm:p-2.5 backdrop-blur-md shadow-sm flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
            <Wrench className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block truncate">Total Jobs</span>
            <span className="text-base font-black text-white font-mono leading-tight">{totalJobsCount}</span>
          </div>
        </div>

        {/* Pending Queue */}
        <div className="bg-slate-900/60 border border-amber-500/20 rounded-xl p-2 sm:p-2.5 backdrop-blur-md shadow-sm flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-bold text-amber-300/80 uppercase tracking-wider block truncate">In Queue</span>
            <span className="text-base font-black text-amber-400 font-mono leading-tight">{pendingCount}</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-slate-900/60 border border-sky-500/20 rounded-xl p-2 sm:p-2.5 backdrop-blur-md shadow-sm flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-bold text-sky-300/80 uppercase tracking-wider block truncate">In Progress</span>
            <span className="text-base font-black text-sky-400 font-mono leading-tight">{inProgressCount}</span>
          </div>
        </div>

        {/* Ready / Completed */}
        <div className="bg-slate-900/60 border border-emerald-500/20 rounded-xl p-2 sm:p-2.5 backdrop-blur-md shadow-sm flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-bold text-emerald-300/80 uppercase tracking-wider block truncate">Ready for Pickup</span>
            <span className="text-base font-black text-emerald-400 font-mono leading-tight">{completedCount}</span>
          </div>
        </div>

        {/* Active Balance Due */}
        <div className="col-span-2 sm:col-span-1 bg-slate-900/60 border border-rose-500/20 rounded-xl p-2 sm:p-2.5 backdrop-blur-md shadow-sm flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-bold text-rose-300/80 uppercase tracking-wider block truncate">Balance Due</span>
            <span className="text-sm font-black text-rose-300 font-mono leading-tight truncate block">
              Rs {activeBalanceDue.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Table Card (Fills height smoothly like POS items grid) */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl flex-1 min-h-0 flex flex-col">
        <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#09182d] text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-800/90">
                <th className="px-4 py-3.5 font-bold">Job ID</th>
                <th className="px-4 py-3.5 font-bold">Date</th>
                <th className="px-4 py-3.5 font-bold">Customer Profile</th>
                <th className="px-4 py-3.5 font-bold">Device & Model</th>
                <th className="px-4 py-3.5 font-bold">Diagnosed Issue</th>
                <th className="px-4 py-3.5 font-bold text-right">Est. Cost</th>
                <th className="px-4 py-3.5 font-bold text-right">Advance Paid</th>
                <th className="px-4 py-3.5 font-bold text-right">Discount</th>
                <th className="px-4 py-3.5 font-bold text-right">Balance Due</th>
                <th className="px-4 py-3.5 font-bold text-center">Status</th>
                {user?.email === 'admin@desh.lk' && (
                  <th className="px-4 py-3.5 font-bold text-right text-sky-400">Profit</th>
                )}
                <th className="px-4 py-3.5 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={user?.email === 'admin@desh.lk' ? 12 : 11} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-sky-400" />
                      <span className="text-xs font-semibold">Loading repair jobs database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRepairs.length === 0 ? (
                <tr>
                  <td colSpan={user?.email === 'admin@desh.lk' ? 12 : 11} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Wrench className="w-8 h-8 text-slate-600 stroke-[1.5]" />
                      <span className="text-sm font-bold text-slate-400">No repair jobs matching criteria.</span>
                      <p className="text-xs text-slate-500">Try adjusting your filters or search keywords, or register a new job.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRepairs.map(job => {
                  const DeviceIcon = getDeviceIcon(job.deviceType);
                  const partsTotal = (job.parts || []).reduce((sum, p) => sum + Number(p.sellingPrice || 0), 0);
                  const calcTotal = (job.calcItems || []).reduce((sum, i) => sum + Number(i.amount || 0), 0);
                  const jobTotal = (partsTotal + calcTotal) > 0 ? (partsTotal + calcTotal) : Number(job.finalTotal || job.estCost || 0);
                  const estCost = Number(job.estCost || 0);
                  const advance = Number(job.advancePayment || 0);
                  const disc = Number(job.discount || 0);
                  const bal = Math.max(0, jobTotal - advance - disc);

                  return (
                    <tr key={job.id} className="hover:bg-slate-800/30 transition-colors group">
                      
                      {/* Job ID */}
                      <td className="px-4 py-3.5 whitespace-nowrap align-middle">
                        <button 
                          onClick={() => viewBill(job)}
                          className="font-mono font-bold text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1 cursor-pointer"
                          title="Click to view estimate/bill summary"
                        >
                          <span>#{job.id.slice(0, 6).toUpperCase()}</span>
                        </button>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap align-middle font-mono text-[11px]">
                        {job.createdAt ? format(parseTimestamp(job.createdAt), 'MMM dd, p') : '...'}
                      </td>

                      {/* Customer Profile + WhatsApp Direct */}
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-bold text-slate-100">{job.customerName}</div>
                            {job.whatsapp ? (
                              <button
                                onClick={(e) => openWhatsAppChat(e, job.whatsapp, job.customerName, job.id)}
                                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono hover:underline cursor-pointer"
                                title="Click to chat on WhatsApp"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{job.whatsapp}</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-500">No phone</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Device & Model */}
                      <td className="px-4 py-3.5 whitespace-nowrap align-middle">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                            <DeviceIcon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-200">{job.deviceType}</div>
                            {job.serial && (
                              <div className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]" title={job.serial}>
                                {job.serial}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Issue */}
                      <td className="px-4 py-3.5 align-middle max-w-[220px]">
                        <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed" title={job.issue}>
                          {job.issue || '-'}
                        </p>
                      </td>

                      {/* Est. Cost */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap align-middle font-mono font-bold text-sky-300">
                        {jobTotal > 0 ? `Rs ${jobTotal.toFixed(2)}` : (estCost > 0 ? `Rs ${estCost.toFixed(2)}` : '-')}
                      </td>

                      {/* Advance Paid */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap align-middle font-mono font-bold text-emerald-400">
                        {advance > 0 ? `Rs ${advance.toFixed(2)}` : '-'}
                      </td>

                      {/* Discount */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap align-middle font-mono font-bold text-rose-400">
                        {disc > 0 ? `Rs ${disc.toFixed(2)}` : '-'}
                      </td>

                      {/* Balance Due */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap align-middle font-mono font-black">
                        {job.status === 'Paid' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Cleared
                          </span>
                        ) : bal > 0 ? (
                          <span className="text-amber-400">Rs ${bal.toFixed(2)}</span>
                        ) : jobTotal > 0 ? (
                          <span className="text-slate-400 text-xs font-semibold">Rs 0.00</span>
                        ) : (
                          <span className="text-amber-400/80 text-xs font-bold">Pending</span>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap align-middle">
                        <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={job.status}
                            onChange={(e) => handleQuickStatusChange(job, e.target.value)}
                            className={`appearance-none cursor-pointer pl-3 pr-7 py-1 text-[11px] font-black uppercase rounded-full border transition-all outline-none focus:ring-1 focus:ring-sky-400 font-mono shadow-sm ${
                              job.status === 'Completed' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/25' :
                              job.status === 'In Progress' ? 'bg-sky-500/15 text-sky-400 border-sky-500/40 hover:bg-sky-500/25' :
                              job.status === 'Paid' ? 'bg-slate-700/60 text-slate-300 border-slate-600 hover:bg-slate-700' :
                              'bg-amber-500/15 text-amber-400 border-amber-500/40 hover:bg-amber-500/25'
                            }`}
                            title="Click to change job status directly"
                          >
                            <option value="Pending" className="bg-slate-900 text-amber-400 font-bold">Pending</option>
                            <option value="In Progress" className="bg-slate-900 text-sky-400 font-bold">In Progress</option>
                            <option value="Completed" className="bg-slate-900 text-emerald-400 font-bold">Ready / Completed</option>
                            <option value="Paid" className="bg-slate-900 text-slate-300 font-bold">Paid</option>
                          </select>
                          <ChevronDown className={`w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${
                            job.status === 'Completed' ? 'text-emerald-400' :
                            job.status === 'In Progress' ? 'text-sky-400' :
                            job.status === 'Paid' ? 'text-slate-400' :
                            'text-amber-400'
                          }`} />
                        </div>
                      </td>

                      {/* Profit (Admin Only) */}
                      {user?.email === 'admin@desh.lk' && (
                        <td className="px-4 py-3.5 text-right whitespace-nowrap align-middle font-mono font-bold text-sky-400">
                          {(() => {
                            if (job.profit !== undefined) return `Rs ${job.profit.toFixed(2)}`;
                            const pTotal = (job.parts || []).reduce((sum, p) => sum + p.sellingPrice, 0);
                            const cTotal = (job.calcItems || []).reduce((sum, i) => sum + Number(i.amount || 0), 0);
                            const pCost = (job.parts || []).reduce((sum, p) => sum + p.buyingPrice, 0);
                            const cCost = (job.calcItems || []).reduce((sum, i) => sum + Number(i.buyingPrice || 0), 0);
                            let estimatedRevenue = (pTotal + cTotal) > 0 ? (pTotal + cTotal) : (job.estCost || 0);
                            let totalCost = pCost + cCost;
                            let profit = Math.max(0, estimatedRevenue - totalCost - Number(job.discount || 0));
                            return `Rs ${profit.toFixed(2)}`;
                          })()}
                        </td>
                      )}

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap align-middle">
                        <div className="flex items-center justify-center gap-1.5">
                          {job.status === 'Paid' ? (
                            <button
                              onClick={() => printFinalBill(job)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 border border-slate-700/80 transition-all cursor-pointer"
                              title="Print Final Bill"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => openJobModal(job)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-700/80 transition-all cursor-pointer"
                                title="Edit / Update Job Diagnostics"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => printEstimate(job)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700/80 transition-all cursor-pointer"
                                title="Print Estimate Sheet"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {user?.email === 'admin@desh.lk' && (
                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/80 transition-all cursor-pointer"
                              title="Delete Job"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
      </div>

      {/* Unified Job Modal */}
      <RepairJobModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        selectedRepair={selectedRepair}
        handleSaveJob={handleSaveJob}
        editSalutation={editSalutation}
        setEditSalutation={setEditSalutation}
        editCustomerName={editCustomerName}
        setEditCustomerName={setEditCustomerName}
        editWhatsapp={editWhatsapp}
        setEditWhatsapp={setEditWhatsapp}
        editDeviceType={editDeviceType}
        setEditDeviceType={setEditDeviceType}
        editSerial={editSerial}
        setEditSerial={setEditSerial}
        editIssue={editIssue}
        setEditIssue={setEditIssue}
        modalStatus={modalStatus}
        setModalStatus={setModalStatus}
        warrantyDays={warrantyDays}
        setWarrantyDays={setWarrantyDays}
        discount={discount}
        setDiscount={setDiscount}
        editAdvancePayment={editAdvancePayment}
        setEditAdvancePayment={setEditAdvancePayment}
        editFinalPayment={editFinalPayment}
        setEditFinalPayment={setEditFinalPayment}
        editCalcItems={editCalcItems}
        setEditCalcItems={setEditCalcItems}
        handleQuickAdd={handleQuickAdd}
        partsTotal={partsTotal}
        calcItemsTotal={calcItemsTotal}
        currentFinalTotal={currentFinalTotal}
        user={user}
        printEstimate={printEstimate}
        printFinalBill={printFinalBill}
        hasPendingBalanceToComplete={hasPendingBalanceToComplete}
      />

      {/* View Bill Modal */}
      <RepairBillModal
        isOpen={isViewBillModalOpen}
        onClose={() => setIsViewBillModalOpen(false)}
        viewingJob={viewingJob}
        printEstimate={printEstimate}
        printFinalBill={printFinalBill}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal 
        isOpen={!!deleteModalJobId} 
        onClose={() => setDeleteModalJobId(null)} 
        onConfirm={confirmDeleteJob}
        title="Delete Job?"
        message="Are you sure you want to delete this repair job? This action cannot be undone."
      />
    </div>
  );
}
