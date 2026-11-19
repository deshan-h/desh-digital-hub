import React from 'react';
import { format } from 'date-fns';
import { 
  X, 
  Save, 
  Trash2, 
  Plus, 
  Printer, 
  Send, 
  Check, 
  Wrench, 
  Laptop, 
  Monitor, 
  Cpu, 
  Smartphone, 
  Printer as PrinterIcon, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  Tag, 
  User, 
  Phone, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import logo from '../../assets/logo.webp';
import { parseTimestamp } from '../../utils/helpers';
import { SALUTATIONS, COMMON_REPAIR_SERVICES } from '../../constants';
import { notify } from '../../utils/toast';

export const RepairBillModal = ({
  isOpen,
  onClose,
  viewingJob,
  printEstimate,
  printFinalBill
}) => {
  if (!isOpen || !viewingJob) return null;

  const isComplete = viewingJob.status === 'Completed' || viewingJob.status === 'Paid';
  const advance = Number(viewingJob.advancePayment || 0);
  const disc = Number(viewingJob.discount || 0);

  const handleWhatsAppSend = () => {
    const itemsText = [];
    if (viewingJob.parts && viewingJob.parts.length > 0) {
      viewingJob.parts.forEach(p => itemsText.push(`- ${p.name}: Rs ${p.sellingPrice.toFixed(2)}`));
    }
    if (viewingJob.calcItems && viewingJob.calcItems.length > 0) {
      viewingJob.calcItems.filter(i => i.desc).forEach(p => itemsText.push(`- ${p.desc}: Rs ${Number(p.amount || 0).toFixed(2)}`));
    }
    const itemsString = itemsText.length > 0 ? `\n\nServices & Items:\n${itemsText.join('\n')}\n` : '\n';

    let msg = '';
    if (isComplete) {
      let discountStr = disc > 0 ? `\nDiscount: Rs ${disc.toFixed(2)}` : '';
      msg = `Hello ${viewingJob.customerName},\n\nYour repair job (Job #${viewingJob.id.slice(0, 6).toUpperCase()}) for ${viewingJob.deviceType} is now ${viewingJob.status}.${itemsString}\nTotal Bill: Rs ${Number(viewingJob.finalTotal || 0).toFixed(2)}${discountStr}\n\nThank you for choosing DESH Digital Hub.`;
    } else {
      const balance = Math.max(0, Number(viewingJob.estCost || 0) - advance - disc);
      let discountStr = disc > 0 ? `\nDiscount: Rs ${disc.toFixed(2)}` : '';
      msg = `Hello ${viewingJob.customerName},\n\nHere is your repair estimate (Job #${viewingJob.id.slice(0, 6).toUpperCase()}) for ${viewingJob.deviceType}.${itemsString}\nEstimated Cost: Rs ${Number(viewingJob.estCost || 0).toFixed(2)}\nAdvance Paid: Rs ${advance.toFixed(2)}${discountStr}\nBalance: Rs ${balance.toFixed(2)}\n\nThank you for choosing DESH Digital Hub.`;
    }

    let formattedNum = viewingJob.whatsapp.replace(/\D/g, '');
    if (formattedNum.startsWith('0')) formattedNum = '94' + formattedNum.substring(1);
    window.open(`https://wa.me/${formattedNum}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white text-slate-900 border border-slate-200 rounded-xl w-full max-w-sm flex flex-col shadow-2xl overflow-hidden slide-in-from-bottom-8 font-mono">
        <div className="p-6 overflow-y-auto max-h-[75vh] custom-scrollbar">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-2">
              <img src={logo} alt="DESH Digital Hub" className="h-20 object-contain" />
            </div>
            <p className="text-sm">204/1, Pitapahamuna, Melsiripura</p>
            <p className="text-sm">Tel: 071 998 9000</p>
            <div className="mt-3 font-bold uppercase text-lg border-b-2 border-dashed border-slate-300 pb-2">
              {isComplete ? 'FINAL BILL' : 'REPAIR ESTIMATE'}
            </div>
          </div>

          <div className="text-sm space-y-1 mb-4 border-b-2 border-dashed border-slate-300 pb-4">
            <div className="flex justify-between">
              <span className="font-semibold">Job No:</span>
              <span>#{viewingJob.id.slice(0, 6).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Date:</span>
              <span>{viewingJob.createdAt ? format(parseTimestamp(viewingJob.createdAt), 'dd/MM/yyyy p') : ''}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Customer:</span>
              <span>{viewingJob.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Device:</span>
              <span>{viewingJob.deviceType}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Issue:</span>
              <span className="text-right max-w-[180px]">{viewingJob.issue}</span>
            </div>
          </div>

          <div className="mb-4 text-sm border-b-2 border-dashed border-slate-300 pb-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-300">
                  <th className="text-left py-1">Description</th>
                  <th className="text-right py-1">Amount</th>
                </tr>
              </thead>
              <tbody>
                {isComplete ? (
                  <>
                    {(viewingJob.parts || []).map((p, idx) => (
                      <tr key={idx}>
                        <td className="py-1">{p.name}</td>
                        <td className="text-right py-1">{(Number(p.sellingPrice) || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                    {Number(viewingJob.laborCharge) > 0 && (
                      <tr>
                        <td className="py-1">Labor Charge</td>
                        <td className="text-right py-1">{(Number(viewingJob.laborCharge) || 0).toFixed(2)}</td>
                      </tr>
                    )}
                    {Number(viewingJob.discount) > 0 && (
                      <tr>
                        <td className="py-1">Discount</td>
                        <td className="text-right py-1">-{(Number(viewingJob.discount) || 0).toFixed(2)}</td>
                      </tr>
                    )}
                  </>
                ) : (
                  <>
                    {viewingJob.calcItems && viewingJob.calcItems.length > 0 && viewingJob.calcItems.some(i => i.desc) ? (
                      viewingJob.calcItems.filter(i => i.desc).map((p, idx) => (
                        <tr key={idx}>
                          <td className="py-1">{p.desc}</td>
                          <td className="text-right py-1">{(Number(p.amount) || 0).toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="py-2 text-slate-500 italic text-center">
                          Reason: {viewingJob.estCostReason || 'N/A'}
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>

          <div className="text-sm space-y-1 mb-6">
            {isComplete ? (
              <>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>Rs {((viewingJob.parts || []).reduce((sum, p) => sum + p.sellingPrice, 0) + Number(viewingJob.laborCharge || 0) - Number(viewingJob.discount || 0)).toFixed(2)}</span>
                </div>
                {Number(viewingJob.advancePayment) > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Advance Paid:</span>
                    <span>- Rs {Number(viewingJob.advancePayment).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-slate-300">
                  <span>FINAL TOTAL:</span>
                  <span>Rs {Number(viewingJob.finalTotal || 0).toFixed(2)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between font-bold text-lg">
                  <span>EST. TOTAL:</span>
                  <span>Rs {Number(viewingJob.estCost || 0).toFixed(2)}</span>
                </div>
                {Number(viewingJob.advancePayment) > 0 && (
                  <div className="flex justify-between text-slate-600 mt-1">
                    <span>ADVANCE PAID:</span>
                    <span>- Rs {Number(viewingJob.advancePayment).toFixed(2)}</span>
                  </div>
                )}
                {Number(viewingJob.discount) > 0 && (
                  <div className="flex justify-between text-red-500 mt-1">
                    <span>DISCOUNT:</span>
                    <span>- Rs {Number(viewingJob.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-slate-300">
                  <span>BALANCE:</span>
                  <span>Rs {Math.max(0, Number(viewingJob.estCost || 0) - Number(viewingJob.advancePayment || 0) - Number(viewingJob.discount || 0)).toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          <div className="text-center text-xs text-slate-500">
            {!(viewingJob.status === 'Completed' || viewingJob.status === 'Delivered') && (
              <div className="mb-2">*This is only an estimate.*</div>
            )}
            <div>Thank you for your business!</div>
          </div>
        </div>

        <div className="p-4 bg-slate-100 flex justify-end gap-3 border-t border-slate-200">
          <div className="flex gap-2">
            {viewingJob.whatsapp && (
              <button
                onClick={handleWhatsAppSend}
                className="px-4 py-2 font-sans font-bold bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 transition-colors shadow-md"
              >
                <Send className="w-4 h-4" /> WhatsApp
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 font-sans font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
          <button
            onClick={() => {
              if (isComplete) {
                printFinalBill(viewingJob);
              } else {
                printEstimate(viewingJob);
              }
            }}
            className="px-4 py-2 font-sans font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 transition-colors shadow-md"
          >
            <Printer className="w-4 h-4" /> Print Bill
          </button>
        </div>
      </div>
    </div>
  );
};

export const RepairJobModal = ({
  isOpen,
  onClose,
  selectedRepair,
  handleSaveJob,
  editSalutation,
  setEditSalutation,
  editCustomerName,
  setEditCustomerName,
  editWhatsapp,
  setEditWhatsapp,
  editDeviceType,
  setEditDeviceType,
  editSerial,
  setEditSerial,
  editIssue,
  setEditIssue,
  modalStatus,
  setModalStatus,
  warrantyDays,
  setWarrantyDays,
  discount,
  setDiscount,
  editAdvancePayment,
  setEditAdvancePayment,
  editFinalPayment,
  setEditFinalPayment,
  editCalcItems,
  setEditCalcItems,
  handleQuickAdd,
  partsTotal,
  calcItemsTotal,
  currentFinalTotal,
  user,
  printEstimate,
  printFinalBill,
  hasPendingBalanceToComplete
}) => {
  if (!isOpen) return null;

  const deviceTypes = [
    { id: 'PC', label: 'Desktop PC', icon: Cpu },
    { id: 'Laptop', label: 'Laptop', icon: Laptop },
    { id: 'MacBook', label: 'MacBook', icon: Laptop },
    { id: 'Printer', label: 'Printer', icon: PrinterIcon },
    { id: 'Monitor', label: 'Monitor', icon: Monitor },
    { id: 'Other', label: 'Other', icon: Smartphone }
  ];

  const estServicesTotal = editCalcItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalSubtotal = (partsTotal || 0) + estServicesTotal;
  const netDue = Math.max(0, totalSubtotal - Number(editAdvancePayment || 0) - Number(discount || 0) - Number(editFinalPayment || 0));

  const totalBuyingCost = editCalcItems.reduce((sum, item) => sum + Number(item.buyingPrice || 0), 0) + 
    ((selectedRepair?.parts || []).reduce((sum, p) => sum + Number(p.buyingPrice || 0), 0));
  const estimatedProfit = Math.max(0, totalSubtotal - totalBuyingCost - Number(discount || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#071326] border border-sky-500/30 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-[0_0_50px_rgba(14,165,233,0.15)] overflow-hidden slide-in-from-bottom-6">
        
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-sky-500/20 bg-gradient-to-r from-[#0a1e38] via-[#09182d] to-[#071326] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-cyan-500/30 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-inner">
              <Wrench className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-wide uppercase">
                  {selectedRepair ? `Edit Repair Job: #${selectedRepair.id.slice(0, 6).toUpperCase()}` : 'New PC Repair Job'}
                </h3>
                {selectedRepair && (
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    modalStatus === 'Completed' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                    modalStatus === 'In Progress' ? 'bg-sky-500/15 text-sky-400 border-sky-500/30' :
                    modalStatus === 'Paid' ? 'bg-slate-500/15 text-slate-300 border-slate-500/30' :
                    'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}>
                    {modalStatus}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {selectedRepair ? 'Update diagnostics, services, parts and customer payment records' : 'Enter customer diagnostic details, estimate services and replacement parts'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-9 h-9 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar">

          {/* Section 1: Customer Profile */}
          <div className="bg-[#0b182f]/80 border border-slate-800/80 rounded-2xl p-4.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3.5">
              <User className="w-4 h-4 text-sky-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Customer Details</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Customer Name <span className="text-rose-400">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={editSalutation}
                    onChange={e => setEditSalutation(e.target.value)}
                    className="bg-[#071326] border border-slate-700/80 focus:border-sky-500 rounded-xl px-2.5 py-2 text-slate-200 text-xs font-semibold focus:outline-none w-24 shrink-0 cursor-pointer shadow-inner"
                  >
                    {SALUTATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input
                    type="text"
                    value={editCustomerName}
                    onChange={e => setEditCustomerName(e.target.value)}
                    placeholder="Enter customer name..."
                    className="flex-1 bg-[#071326] border border-slate-700/80 focus:border-sky-500 rounded-xl px-3.5 py-2 text-slate-100 text-xs font-medium focus:outline-none placeholder-slate-500 shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                  WhatsApp / Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={editWhatsapp}
                    onChange={e => setEditWhatsapp(e.target.value)}
                    placeholder="e.g. 077 123 4567"
                    className="w-full bg-[#071326] border border-slate-700/80 focus:border-emerald-500 rounded-xl pl-9 pr-3.5 py-2 text-slate-100 text-xs font-medium focus:outline-none placeholder-slate-500 shadow-inner"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Device Diagnostics */}
          <div className="bg-[#0b182f]/80 border border-slate-800/80 rounded-2xl p-4.5 backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Laptop className="w-4 h-4 text-sky-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Device & Issue Diagnostics</h4>
            </div>

            {/* Device Type Chips */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
                Select Device Type
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {deviceTypes.map(dtype => {
                  const Icon = dtype.icon;
                  const isSelected = editDeviceType === dtype.id;
                  return (
                    <button
                      key={dtype.id}
                      type="button"
                      onClick={() => setEditDeviceType(dtype.id)}
                      className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-sky-500/20 border-sky-400/80 text-sky-300 shadow-md shadow-sky-500/10 scale-[1.02]' 
                          : 'bg-[#071326] border-slate-800/90 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-sky-300' : 'text-slate-500'}`} />
                      <span className="truncate w-full text-center text-[11px]">{dtype.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Serial / Model No.
                </label>
                <input
                  type="text"
                  value={editSerial}
                  onChange={e => setEditSerial(e.target.value)}
                  placeholder="e.g. Dell Inspiron 15 / SN-8921"
                  className="w-full bg-[#071326] border border-slate-700/80 focus:border-sky-500 rounded-xl px-3.5 py-2 text-slate-100 text-xs font-medium focus:outline-none placeholder-slate-500 shadow-inner"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Reported Issue / Symptoms <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={editIssue}
                  onChange={e => setEditIssue(e.target.value)}
                  placeholder="e.g. Display flickering, No power, Windows boot failure, Blue screen..."
                  className="w-full bg-[#071326] border border-slate-700/80 focus:border-sky-500 rounded-xl px-3.5 py-2 text-slate-100 text-xs font-medium focus:outline-none placeholder-slate-500 shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Diagnostic Charges & Services */}
          <div className="bg-[#0b182f]/80 border border-slate-800/80 rounded-2xl p-4.5 backdrop-blur-sm space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Estimated Services & Replacement Parts</h4>
              </div>

              {/* Quick Add Common Services */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">Quick Add:</span>
                {COMMON_REPAIR_SERVICES.map(s => (
                  <button
                    type="button"
                    key={s.name}
                    onClick={() => handleQuickAdd(s)}
                    className="bg-[#071326] hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    <th className="py-2 pr-2">Service / Part Description</th>
                    {user?.email === 'admin@desh.lk' && (
                      <th className="py-2 px-2 text-right w-28">Buy Cost (Rs)</th>
                    )}
                    <th className="py-2 pl-2 text-right w-32">Selling Price (Rs)</th>
                    {user?.email === 'admin@desh.lk' && (
                      <th className="py-2 pl-2 text-right w-24 text-sky-400">Profit</th>
                    )}
                    <th className="py-2 pl-2 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {editCalcItems.map((item, idx) => (
                    <tr key={idx} className="group hover:bg-slate-900/30 transition-colors">
                      <td className="py-2 pr-2">
                        <input
                          type="text"
                          value={item.desc}
                          onChange={e => {
                            const newItems = [...editCalcItems];
                            newItems[idx].desc = e.target.value;
                            setEditCalcItems(newItems);
                          }}
                          placeholder="e.g. Service charge, SSD replacement, RAM upgrade..."
                          className="w-full bg-[#071326] border border-slate-700/80 focus:border-sky-500 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none"
                        />
                      </td>

                      {user?.email === 'admin@desh.lk' && (
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.buyingPrice === 0 || item.buyingPrice === '0' ? '' : item.buyingPrice || ''}
                            onChange={e => {
                              const newItems = [...editCalcItems];
                              newItems[idx].buyingPrice = e.target.value === '' ? '' : Number(e.target.value);
                              setEditCalcItems(newItems);
                            }}
                            placeholder="0.00"
                            className="w-full bg-[#071326] border border-slate-700/80 focus:border-sky-500 rounded-lg px-2 py-1.5 text-slate-300 font-mono text-right text-xs focus:outline-none"
                          />
                        </td>
                      )}

                      <td className="py-2 pl-2">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.amount === 0 || item.amount === '0' ? '' : item.amount || ''}
                          onChange={e => {
                            const newItems = [...editCalcItems];
                            newItems[idx].amount = e.target.value === '' ? '' : Number(e.target.value);
                            setEditCalcItems(newItems);
                          }}
                          placeholder="0.00"
                          className="w-full bg-[#071326] border border-emerald-500/40 focus:border-emerald-400 rounded-lg px-2.5 py-1.5 text-emerald-400 font-mono font-bold text-right text-xs focus:outline-none"
                        />
                      </td>

                      {user?.email === 'admin@desh.lk' && (
                        <td className="py-2 pl-2 text-right font-mono font-bold text-sky-400 text-xs">
                          {((Number(item.amount) || 0) - (Number(item.buyingPrice) || 0)).toFixed(2)}
                        </td>
                      )}

                      <td className="py-2 pl-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (editCalcItems.length === 1) {
                              setEditCalcItems([{ desc: '', amount: '', buyingPrice: '' }]);
                            } else {
                              setEditCalcItems(editCalcItems.filter((_, i) => i !== idx));
                            }
                          }}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded-md hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={() => setEditCalcItems([...editCalcItems, { desc: '', amount: '', buyingPrice: '' }])}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 hover:text-sky-300 text-xs font-bold border border-slate-800 hover:border-sky-500/30 transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Another Service / Item
            </button>
          </div>

          {/* Section 4: Status & Financial Settings */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#0b182f]/80 border border-slate-800/80 rounded-2xl p-4.5 backdrop-blur-sm">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                Job Status
              </label>
              <select
                value={modalStatus}
                onChange={e => setModalStatus(e.target.value)}
                className="w-full bg-[#071326] border border-slate-700/80 focus:border-sky-500 rounded-xl px-3 py-2 text-slate-100 font-bold text-xs focus:outline-none cursor-pointer shadow-inner"
              >
                <option value="Pending">Pending (In Queue)</option>
                <option value="In Progress">In Progress (Diagnosing/Repairing)</option>
                <option value="Completed">Completed (Ready for Pickup)</option>
                <option value="Paid">Paid (Closed & Collected)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                Warranty (Days)
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-sky-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="0"
                  value={warrantyDays === 0 || warrantyDays === '0' ? '' : warrantyDays}
                  onChange={e => setWarrantyDays(e.target.value === '' ? 0 : Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-[#071326] border border-slate-700/80 focus:border-sky-500 rounded-xl pl-9 pr-3 py-2 text-slate-100 font-mono font-bold text-right text-xs focus:outline-none shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                Advance Paid (Rs)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={editAdvancePayment === 0 || editAdvancePayment === '0' ? '' : editAdvancePayment}
                onChange={e => setEditAdvancePayment(e.target.value === '' ? 0 : Number(e.target.value))}
                placeholder="0.00"
                className="w-full bg-[#071326] border border-emerald-500/40 focus:border-emerald-400 rounded-xl px-3.5 py-2 text-emerald-400 font-mono font-bold text-right text-xs focus:outline-none shadow-inner"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                <span>Discount (Rs)</span>
                <span className="text-[10px] text-rose-400 font-bold uppercase">Deduction</span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={discount === 0 || discount === '0' ? '' : discount}
                onChange={e => setDiscount(e.target.value === '' ? 0 : Number(e.target.value))}
                placeholder="0.00"
                className="w-full bg-[#071326] border border-rose-500/50 focus:border-rose-400 rounded-xl px-3.5 py-2 text-rose-300 font-mono font-bold text-right text-xs focus:outline-none shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer / Real-time Financial Summary */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#09182d] via-[#071326] to-[#0a1e38] border-t border-sky-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          
          {/* Financial Breakdown Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Estimate</span>
              <span className="text-sm font-mono font-bold text-slate-200">
                Rs {totalSubtotal.toFixed(2)}
              </span>
            </div>

            {Number(editAdvancePayment) > 0 && (
              <div className="flex flex-col border-l border-slate-700/80 pl-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Advance</span>
                <span className="text-sm font-mono font-bold text-emerald-400">
                  - Rs {Number(editAdvancePayment).toFixed(2)}
                </span>
              </div>
            )}

            {Number(discount) > 0 && (
              <div className="flex flex-col border-l border-slate-700/80 pl-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Discount</span>
                <span className="text-sm font-mono font-bold text-rose-400">
                  - Rs {Number(discount).toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex flex-col border-l border-slate-700/80 pl-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Net Balance Due</span>
              <span className="text-xl font-mono font-black text-amber-400">
                Rs {netDue.toFixed(2)}
              </span>
            </div>

            {user?.email === 'admin@desh.lk' && (
              <div className="flex flex-col border-l border-slate-700/80 pl-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Est. Profit</span>
                <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  Rs {estimatedProfit.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 justify-end">
            {selectedRepair && (modalStatus === 'Completed' || modalStatus === 'Paid') && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (hasPendingBalanceToComplete && hasPendingBalanceToComplete()) {
                      notify.error("Please mark the pending balance as paid before printing.");
                      return;
                    }
                    const tempJob = { 
                      ...selectedRepair, 
                      status: modalStatus, 
                      calcItems: editCalcItems, 
                      advancePayment: editAdvancePayment, 
                      finalPayment: editFinalPayment, 
                      discount: discount, 
                      finalTotal: netDue, 
                      warrantyDays: Number(warrantyDays) || 0 
                    };
                    printFinalBill(tempJob);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Print Final Bill"
                >
                  <Printer className="w-4 h-4 text-sky-400" />
                  <span className="hidden sm:inline">Print Bill</span>
                </button>

                {selectedRepair.whatsapp && (
                  <button
                    type="button"
                    onClick={() => {
                      if (hasPendingBalanceToComplete && hasPendingBalanceToComplete()) {
                        notify.error("Please mark the pending balance as paid before sending WhatsApp message.");
                        return;
                      }
                      const tempJob = { 
                        ...selectedRepair, 
                        status: modalStatus, 
                        calcItems: editCalcItems, 
                        advancePayment: editAdvancePayment, 
                        finalPayment: editFinalPayment, 
                        discount: discount, 
                        finalTotal: netDue, 
                        warrantyDays: Number(warrantyDays) || 0 
                      };
                      const advance = Number(tempJob.advancePayment || 0);
                      const disc = Number(tempJob.discount || 0);
                      const itemsText = [];
                      if (tempJob.parts && tempJob.parts.length > 0) {
                        tempJob.parts.forEach(p => itemsText.push(`- ${p.name}: Rs ${p.sellingPrice.toFixed(2)}`));
                      }
                      if (tempJob.calcItems && tempJob.calcItems.length > 0) {
                        tempJob.calcItems.filter(i => i.desc).forEach(p => itemsText.push(`- ${p.desc}: Rs ${Number(p.amount || 0).toFixed(2)}`));
                      }
                      const itemsString = itemsText.length > 0 ? `\n\nServices & Items:\n${itemsText.join('\n')}\n` : '\n';
                      let discountStr = disc > 0 ? `\nDiscount: Rs ${disc.toFixed(2)}` : '';
                      const msg = `Hello ${tempJob.customerName},\n\nYour repair job (Job #${tempJob.id.slice(0, 6).toUpperCase()}) for ${tempJob.deviceType} is now ${tempJob.status}.${itemsString}\nTotal Bill: Rs ${Number(totalSubtotal || 0).toFixed(2)}${discountStr}\nBalance: Rs ${netDue.toFixed(2)}\n\nThank you for choosing DESH Digital Hub.`;

                      let formattedNum = tempJob.whatsapp.replace(/\D/g, '');
                      if (formattedNum.startsWith('0')) formattedNum = '94' + formattedNum.substring(1);
                      window.open(`https://wa.me/${formattedNum}?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    title="Send bill via WhatsApp"
                  >
                    <Send className="w-4 h-4 text-emerald-400" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </button>
                )}
              </>
            )}

            {!selectedRepair && (
              <button
                type="button"
                onClick={(e) => handleSaveJob(e, true)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Save Job and immediately print estimate sheet"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Save & Print Est.</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveJob}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs shadow-lg shadow-sky-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>{selectedRepair ? 'Update Job' : 'Save Job'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
