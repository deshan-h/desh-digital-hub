import React from 'react';
import { Plus, User, Phone, MapPin, CheckCircle, RotateCcw, Trash2, Clock, X } from 'lucide-react';

export const AddCustomerForm = ({
  name, setName,
  phone, setPhone,
  area, setArea,
  amount, setAmount,
  status, setStatus,
  isPosArrears, setIsPosArrears,
  isSubmitting, handleSubmit
}) => (
  <div className="shrink-0 bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.5)] relative animate-in slide-in-from-top-4 fade-in duration-300">
    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
    <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 mb-4 flex items-center gap-2 drop-shadow-sm shrink-0">
      <Plus className="w-5 h-5 text-cyan-400" /> Add New Record
    </h2>
    
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-end">
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
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Amount (Rs) - Optional</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">Rs.</span>
          <input
            type="number"
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

      <div className="col-span-1 md:col-span-2 xl:col-span-4 flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
        <div className="flex items-center gap-3 bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 cursor-pointer select-none hover:border-cyan-500/30 transition-colors flex-1" onClick={() => setIsPosArrears(!isPosArrears)}>
          <input
            type="checkbox"
            checked={isPosArrears}
            onChange={(e) => setIsPosArrears(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/50 bg-slate-900 pointer-events-none"
          />
          <span className="text-sm font-semibold text-slate-300">Add to POS Sales when Paid</span>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto md:min-w-[200px] bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-[0_0_15px_rgba(8,145,178,0.3)] hover:shadow-[0_0_25px_rgba(8,145,178,0.5)] disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Record'}
        </button>
      </div>
    </form>
  </div>
);

export const CustomerHistoryModal = ({
  customer, onClose, isAdmin,
  payingRecordId, setPayingRecordId,
  payingAmount, setPayingAmount,
  handlePartialPayment, toggleStatus, handleDelete
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
    <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-white">{customer.name}</h3>
          <p className="text-sm text-slate-400 flex gap-4 mt-1">
            <span><MapPin className="inline w-3 h-3 mr-1" />{customer.area || '-'}</span>
            <span><Phone className="inline w-3 h-3 mr-1" />{customer.phone || '-'}</span>
          </p>
        </div>
        <button 
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {customer.records.length === 0 ? (
           <div className="text-center text-slate-500 py-12 flex flex-col items-center">
             <Clock className="w-12 h-12 mb-3 opacity-20" />
             <p>No billing history for this customer.</p>
           </div>
        ) : (
          <div className="relative border-l border-slate-700/50 space-y-4 pb-2 ml-2 sm:ml-0">
            {customer.records.map((record, index) => (
              <div key={record.id} className="relative pl-6">
                <div className={`absolute -left-[7px] top-4 w-3.5 h-3.5 rounded-full border-[3px] border-slate-900 ${record.status === 'Pending' ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`}></div>
                
                <div className={`bg-slate-950/50 border border-white/5 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${record.status === 'Paid' ? 'opacity-60 hover:opacity-100 transition-opacity' : ''}`}>
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
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(record.id); onClose(); }} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all" title="Delete Payment">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )
                    ) : (
                      <>
                        {record.status === 'Pending' ? (
                          payingRecordId === record.id ? (
                            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg p-1" onClick={e => e.stopPropagation()}>
                              <span className="text-slate-400 text-xs pl-2 font-bold">Rs</span>
                              <input 
                                type="number" 
                                value={payingAmount}
                                onChange={e => setPayingAmount(e.target.value)}
                                className="w-20 bg-transparent text-white text-sm font-bold focus:outline-none"
                                autoFocus
                                placeholder="0.00"
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    handlePartialPayment(record, payingAmount, customer);
                                    onClose();
                                  } else if (e.key === 'Escape') {
                                    setPayingRecordId(null);
                                  }
                                }}
                              />
                              <button 
                                onClick={() => {
                                  handlePartialPayment(record, payingAmount, customer);
                                  onClose();
                                }}
                                className="p-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded transition-colors"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => setPayingRecordId(null)}
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5 rotate-45" />
                              </button>
                            </div>
                          ) : (
                            <button onClick={(e) => { 
                              e.stopPropagation(); 
                              setPayingRecordId(record.id);
                              setPayingAmount(record.amount.toString());
                            }} className="p-1.5 rounded-lg transition-all bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white" title="Mark as Paid">
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )
                        ) : (
                          <button onClick={(e) => { e.stopPropagation(); toggleStatus(record, customer); onClose(); }} className="p-1.5 rounded-lg transition-all bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-white" title="Undo Paid">
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {isAdmin && (
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(record.id); onClose(); }} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all" title="Delete Record">
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
        )}
      </div>
    </div>
  </div>
);
