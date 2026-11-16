import React from 'react';
import { format } from 'date-fns';
import { X, Save, Trash2, Plus, Printer, Send, Check, Wrench } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden slide-in-from-bottom-8">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            {selectedRepair ? (
              <>Update Repair: {selectedRepair.customerName}</>
            ) : (
              <><Wrench className="w-5 h-5 text-emerald-500" /> New PC Repair Job</>
            )}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Customer & Device Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Customer Name</label>
              <div className="flex gap-2">
                <select
                  value={editSalutation}
                  onChange={e => setEditSalutation(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm w-24"
                >
                  {SALUTATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input
                  type="text"
                  value={editCustomerName}
                  onChange={e => setEditCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">WhatsApp Number</label>
              <input
                type="text"
                value={editWhatsapp}
                onChange={e => setEditWhatsapp(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Device Type</label>
              <select
                value={editDeviceType}
                onChange={e => setEditDeviceType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm"
              >
                <option value="PC">Desktop PC</option>
                <option value="Laptop">Laptop</option>
                <option value="MacBook">MacBook</option>
                <option value="Printer">Printer</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Serial / Model</label>
              <input
                type="text"
                value={editSerial}
                onChange={e => setEditSerial(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Issue Description</label>
              <input
                type="text"
                value={editIssue}
                onChange={e => setEditIssue(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
          </div>

          {/* Estimate / Bill Items */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider text-emerald-400">Estimate / Bill Items</h4>
              <div className="flex gap-2">
                {COMMON_REPAIR_SERVICES.map(s => (
                  <button
                    type="button"
                    key={s.name}
                    onClick={() => handleQuickAdd(s)}
                    className="bg-slate-800 hover:bg-emerald-600 border border-slate-700 hover:border-emerald-500 text-slate-200 text-xs font-semibold py-1 px-2 rounded-lg transition-all"
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="py-2 text-slate-400">Item / Repair</th>
                  {user?.email === 'admin@desh.lk' && (
                    <th className="py-2 text-slate-400 text-right">Real Price (Buy)</th>
                  )}
                  <th className="py-2 text-slate-400 text-right">Selling Price</th>
                  {user?.email === 'admin@desh.lk' && (
                    <th className="py-2 text-slate-400 text-right w-24">Profit</th>
                  )}
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {editCalcItems.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-800/50 last:border-0">
                    <td className="py-2 pr-2">
                      <input
                        type="text"
                        value={item.desc}
                        onChange={e => {
                          const newItems = [...editCalcItems];
                          newItems[idx].desc = e.target.value;
                          setEditCalcItems(newItems);
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-emerald-500"
                        placeholder="Description"
                      />
                    </td>
                    {user?.email === 'admin@desh.lk' && (
                      <td className="py-2 px-2 w-28">
                        <input
                          type="number"
                          value={item.buyingPrice || ''}
                          onChange={e => {
                            const newItems = [...editCalcItems];
                            newItems[idx].buyingPrice = Number(e.target.value);
                            setEditCalcItems(newItems);
                          }}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-right focus:outline-none focus:border-emerald-500"
                          placeholder="Cost"
                        />
                      </td>
                    )}
                    <td className="py-2 pl-2 w-32">
                      <input
                        type="number"
                        value={item.amount || ''}
                        onChange={e => {
                          const newItems = [...editCalcItems];
                          newItems[idx].amount = Number(e.target.value);
                          setEditCalcItems(newItems);
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-emerald-400 font-medium text-right focus:outline-none focus:border-emerald-500"
                        placeholder="Selling"
                      />
                    </td>
                    {user?.email === 'admin@desh.lk' && (
                      <td className="py-2 pl-2 w-24 text-right text-blue-400 font-medium pt-3">
                        {((Number(item.amount) || 0) - (Number(item.buyingPrice) || 0)).toFixed(2)}
                      </td>
                    )}
                    <td className="py-2 pl-2 text-right w-8">
                      <button
                        onClick={() => setEditCalcItems(editCalcItems.filter((_, i) => i !== idx))}
                        className="text-red-400/50 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between items-center mt-3">
              <button
                onClick={() => setEditCalcItems([...editCalcItems, { desc: '', amount: '', buyingPrice: '' }])}
                className="text-xs text-emerald-400 font-semibold flex items-center gap-1 hover:text-emerald-300"
              >
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>
          </div>

          {selectedRepair && (
            <div className="flex gap-4 items-end mb-6">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Current Status</label>
                <select
                  value={modalStatus}
                  onChange={e => setModalStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
              {modalStatus === 'Paid' && currentFinalTotal > 0 && (
                <div className="flex-1 bg-orange-950/30 border border-orange-500/30 rounded-xl px-4 py-2 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-orange-400 font-semibold uppercase">Pending Balance</span>
                    <div className="text-lg font-black text-slate-200">Rs {currentFinalTotal.toFixed(2)}</div>
                  </div>
                  <button
                    onClick={() => setEditFinalPayment(prev => Number(prev || 0) + currentFinalTotal)}
                    className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-sm"
                  >
                    <Check className="w-4 h-4" /> Paid
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Payment Adjustments */}
          <div className="border-t border-slate-800 pt-6 grid grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Warranty (Days)</label>
              <input
                type="number"
                value={warrantyDays}
                onChange={e => setWarrantyDays(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 font-bold focus:outline-none focus:border-emerald-500 text-right"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Advance Paid (Rs)</label>
              <input
                type="number"
                value={editAdvancePayment}
                onChange={e => setEditAdvancePayment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500 text-right"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Discount (Rs)</label>
              <input
                type="number"
                value={discount}
                onChange={e => setDiscount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-red-400 font-bold focus:outline-none focus:border-red-500 text-right"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Balance Amount</span>
            <span className="text-3xl font-black text-emerald-400 leading-none mb-1">Rs {currentFinalTotal.toFixed(2)}</span>
            {user?.email === 'admin@desh.lk' && (
              <span className="text-[11px] font-bold text-blue-400 bg-blue-900/20 px-2 py-0.5 rounded border border-blue-900/50 w-max inline-block">
                Profit: Rs {(editCalcItems.reduce((sum, item) => sum + ((Number(item.amount) || 0) - (Number(item.buyingPrice) || 0)), 0) - (Number(discount) || 0)).toFixed(2)}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            {(modalStatus === 'Completed' || modalStatus === 'Paid') && selectedRepair && (
              <>
                <button
                  onClick={() => {
                    if (hasPendingBalanceToComplete && hasPendingBalanceToComplete()) {
                      notify.error("Please mark the pending balance as paid before printing.");
                      return;
                    }
                    const tempJob = { ...selectedRepair, status: modalStatus, calcItems: editCalcItems, advancePayment: editAdvancePayment, finalPayment: editFinalPayment, discount: discount, finalTotal: currentFinalTotal, warrantyDays: Number(warrantyDays) || 0 };
                    printFinalBill(tempJob);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-4 px-4 rounded-xl shadow-md transition-all flex items-center gap-2 border border-slate-700"
                  title="Print Bill"
                >
                  <Printer className="w-5 h-5" />
                </button>
                {selectedRepair.whatsapp && (
                  <button
                    onClick={() => {
                      if (hasPendingBalanceToComplete && hasPendingBalanceToComplete()) {
                        notify.error("Please mark the pending balance as paid before sending WhatsApp message.");
                        return;
                      }
                      const tempJob = { ...selectedRepair, status: modalStatus, calcItems: editCalcItems, advancePayment: editAdvancePayment, finalPayment: editFinalPayment, discount: discount, finalTotal: currentFinalTotal, warrantyDays: Number(warrantyDays) || 0 };
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
                      const msg = `Hello ${tempJob.customerName},\n\nYour repair job (Job #${tempJob.id.slice(0, 6).toUpperCase()}) for ${tempJob.deviceType} is now ${tempJob.status}.${itemsString}\nTotal Bill: Rs ${Number(tempJob.finalTotal || 0).toFixed(2)}${discountStr}\n\nThank you for choosing DESH Digital Hub.`;

                      let formattedNum = tempJob.whatsapp.replace(/\D/g, '');
                      if (formattedNum.startsWith('0')) formattedNum = '94' + formattedNum.substring(1);
                      window.open(`https://wa.me/${formattedNum}?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-4 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.2)] transition-all flex items-center gap-2"
                    title="WhatsApp Bill"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                )}
              </>
            )}
            <button
              onClick={handleSaveJob}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-5 h-5" /> Save Job
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
