import React, { useState, useEffect } from 'react';
import { inquiryService } from '../../services/supabaseService';
import { notify } from '../../utils/toast';
import { 
  MessageSquare, 
  Phone, 
  User, 
  Calendar, 
  CheckCircle2, 
  Trash2, 
  ExternalLink, 
  RefreshCw, 
  MessageCircle, 
  Search, 
  Clock, 
  Filter,
  Check
} from 'lucide-react';
import Loader from '../../components/Loader';

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'new' | 'replied'
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setRefreshing(true);
      const data = await inquiryService.getInquiries();
      setInquiries(data);
    } catch (err) {
      console.error(err);
      notify.error('Failed to load inquiries');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await inquiryService.updateInquiryStatus(id, newStatus);
      setInquiries(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
      notify.success(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      notify.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await inquiryService.deleteInquiry(id);
      setInquiries(prev => prev.filter(item => item.id !== id));
      notify.success('Inquiry deleted');
    } catch (err) {
      console.error(err);
      notify.error('Failed to delete inquiry');
    }
  };

  const handleReplyWhatsApp = (inquiry) => {
    // Format phone to clean number
    let cleanPhone = inquiry.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '94' + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith('94') && cleanPhone.length === 9) {
      cleanPhone = '94' + cleanPhone;
    }

    const replyText = encodeURIComponent(`Hi ${inquiry.name}, thank you for contacting DESH Digital Hub regarding your inquiry for ${inquiry.service}. How can we assist you today?`);
    window.open(`https://wa.me/${cleanPhone}?text=${replyText}`, '_blank');
    handleUpdateStatus(inquiry.id, 'replied');
  };

  const filteredInquiries = inquiries.filter(item => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    if (!searchQuery.trim()) return matchesStatus;
    const q = searchQuery.toLowerCase();
    const inName = item.name && item.name.toLowerCase().includes(q);
    const inPhone = item.phone && item.phone.toLowerCase().includes(q);
    const inService = item.service && item.service.toLowerCase().includes(q);
    const inMsg = item.message && item.message.toLowerCase().includes(q);
    return matchesStatus && (inName || inPhone || inService || inMsg);
  });

  const newCount = inquiries.filter(i => i.status === 'new').length;
  const repliedCount = inquiries.filter(i => i.status === 'replied').length;

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-sky-400" />
            <span>Customer Inquiries & Messages</span>
            {newCount > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                {newCount} New
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time inquiries and quote requests sent by visitors from the public web portal.
          </p>
        </div>

        <button
          onClick={fetchInquiries}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 hover:border-sky-500/40 text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-sky-400' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#0b101d]/90 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Total Inquiries</span>
            <span className="text-xl font-black text-white">{inquiries.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b101d]/90 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">New & Unread</span>
            <span className="text-xl font-black text-emerald-400">{newCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b101d]/90 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Replied on WhatsApp</span>
            <span className="text-xl font-black text-purple-400">{repliedCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0b101d] border border-slate-800 rounded-xl">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterStatus === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({inquiries.length})
          </button>
          <button
            onClick={() => setFilterStatus('new')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterStatus === 'new' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            New ({newCount})
          </button>
          <button
            onClick={() => setFilterStatus('replied')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterStatus === 'replied' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Replied ({repliedCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search name, phone, service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0b101d] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500/50"
          />
        </div>
      </div>

      {/* Inquiries Cards List */}
      <div className="space-y-3">
        {filteredInquiries.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm italic border border-dashed border-slate-800 rounded-2xl bg-[#0b101d]/40">
            No customer inquiries found for this filter.
          </div>
        ) : (
          filteredInquiries.map((inq) => {
            const isNew = inq.status === 'new';
            const dateStr = inq.createdAt 
              ? new Date(inq.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
              : 'Recently';

            return (
              <div
                key={inq.id}
                className={`p-5 rounded-2xl border transition-all duration-200 ${
                  isNew
                    ? 'bg-[#0a1832]/80 border-sky-500/30 shadow-lg shadow-sky-500/5'
                    : 'bg-[#0b101d]/90 border-slate-800/80 opacity-90'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  
                  {/* Left Column: Customer & Message Info */}
                  <div className="space-y-2.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-black text-white text-base flex items-center gap-1.5">
                        <User className="w-4 h-4 text-sky-400" />
                        <span>{inq.name}</span>
                      </span>

                      <a
                        href={`tel:${inq.phone}`}
                        className="text-xs font-mono text-slate-300 hover:text-sky-300 flex items-center gap-1 bg-slate-900/80 px-2.5 py-0.5 rounded-lg border border-slate-700/60"
                      >
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <span>{inq.phone}</span>
                      </a>

                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/25">
                        {inq.service}
                      </span>

                      <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-auto md:ml-0">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{dateStr}</span>
                      </span>
                    </div>

                    {/* Message Body */}
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 text-xs text-slate-200 leading-relaxed">
                      {inq.message || <span className="italic text-slate-500">No additional message provided. Customer requested contact for this service.</span>}
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                    <button
                      onClick={() => handleReplyWhatsApp(inq)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                      title="Open WhatsApp chat with prefilled reply"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      <span>Reply on WhatsApp</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {isNew ? (
                        <button
                          onClick={() => handleUpdateStatus(inq.id, 'read')}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Mark as Read"
                        >
                          Mark Read
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                          ✓ Handled
                        </span>
                      )}

                      <button
                        onClick={() => handleDelete(inq.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete Inquiry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
