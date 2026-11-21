import React, { useState, useEffect, useMemo } from 'react';
import { inquiryService } from '../../services/supabaseService';
import { notify } from '../../utils/toast';
import WhatsAppIcon from '../../components/common/WhatsAppIcon';
import { 
  MessageSquare, 
  Phone, 
  User, 
  Calendar, 
  CheckCircle2, 
  Trash2, 
  RefreshCw, 
  MessageCircle, 
  Search, 
  Clock, 
  Check, 
  Send,
  Sparkles,
  Inbox,
  Filter,
  ExternalLink,
  Mail,
  RotateCcw
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'new' | 'replied'
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedInquiryId, setSelectedInquiryId] = useState(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setRefreshing(true);
      const data = await inquiryService.getInquiries();
      setInquiries(data || []);
      if (data && data.length > 0 && !selectedInquiryId) {
        setSelectedInquiryId(data[0].id);
      }
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
      if (selectedInquiryId === id) {
        setSelectedInquiryId(null);
      }
      notify.success('Inquiry deleted successfully');
    } catch (err) {
      console.error(err);
      notify.error('Failed to delete inquiry');
    }
  };

  const handleReplyWhatsApp = (inquiry) => {
    let cleanPhone = (inquiry.phone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '94' + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith('94') && cleanPhone.length === 9) {
      cleanPhone = '94' + cleanPhone;
    }

    const replyText = encodeURIComponent(`Hi ${inquiry.name}, thank you for contacting DESH Digital Hub regarding your inquiry for ${inquiry.service}. How can we assist you today?`);
    window.open(`https://wa.me/${cleanPhone}?text=${replyText}`, '_blank');
    handleUpdateStatus(inquiry.id, 'replied');
  };

  const filteredInquiries = useMemo(() => {
    return inquiries.filter(item => {
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      if (!searchQuery.trim()) return matchesStatus;
      const q = searchQuery.toLowerCase().trim();
      const inName = item.name && item.name.toLowerCase().includes(q);
      const inPhone = item.phone && item.phone.toLowerCase().includes(q);
      const inService = item.service && item.service.toLowerCase().includes(q);
      const inMsg = item.message && item.message.toLowerCase().includes(q);
      return matchesStatus && (inName || inPhone || inService || inMsg);
    });
  }, [inquiries, filterStatus, searchQuery]);

  const newCount = inquiries.filter(i => i.status === 'new').length;
  const repliedCount = inquiries.filter(i => i.status === 'replied').length;

  // Active selected inquiry
  const activeInquiry = useMemo(() => {
    return inquiries.find(i => i.id === selectedInquiryId) || filteredInquiries[0] || null;
  }, [inquiries, selectedInquiryId, filteredInquiries]);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3">
        <div className="animate-spin w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full"></div>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading Customer Messages...</p>
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
            <MessageSquare className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-white tracking-wider uppercase">Messages & Inquiries</h2>
              {newCount > 0 && (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {newCount} New
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {inquiries.length} Inquiries received from website contact and booking forms
            </p>
          </div>
        </div>

        {/* Center: Search Box */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer, phone, service..."
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

        {/* Right: Status Filter Chips & Refresh */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          
          <div className="flex bg-[#090d16] p-0.5 rounded-xl border border-slate-800/90 gap-1">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              All ({inquiries.length})
            </button>
            <button
              onClick={() => setFilterStatus('new')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1 ${
                filterStatus === 'new'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800/60'
              }`}
            >
              <span>New</span>
              <span className="font-mono text-[10px]">({newCount})</span>
            </button>
            <button
              onClick={() => setFilterStatus('replied')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1 ${
                filterStatus === 'replied'
                  ? 'bg-purple-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-purple-300 hover:bg-slate-800/60'
              }`}
            >
              <span>Replied</span>
              <span className="font-mono text-[10px]">({repliedCount})</span>
            </button>
          </div>

          <button
            onClick={fetchInquiries}
            disabled={refreshing}
            className="p-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700/80 transition-all cursor-pointer shadow-sm"
            title="Refresh Inquiries"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-sky-400' : ''}`} />
          </button>

        </div>

      </div>

      {/* Main Split Layout: Left Messages Inbox + Right Details Pane */}
      <div className="flex-1 flex flex-col md:flex-row gap-3 min-h-0 overflow-hidden">
        
        {/* Left: Messages Inbox List */}
        <div className="w-full md:w-80 lg:w-96 shrink-0 bg-[#071326]/90 backdrop-blur-md border border-slate-800/80 rounded-2xl p-2.5 flex flex-col gap-2 shadow-xl overflow-y-auto custom-scrollbar">
          
          <div className="flex items-center justify-between px-2 py-1 border-b border-slate-800/80">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Inbox</span>
            <span className="text-[10px] font-mono text-slate-500">{filteredInquiries.length} Messages</span>
          </div>

          {filteredInquiries.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-2 text-slate-500">
              <Inbox className="w-8 h-8 text-slate-600 stroke-[1.5]" />
              <p className="text-xs font-bold text-slate-400">No messages match filter</p>
            </div>
          ) : (
            <div className="space-y-1.5 flex-1">
              {filteredInquiries.map((inq) => {
                const isSelected = activeInquiry?.id === inq.id;
                const isNew = inq.status === 'new';
                const createdDate = inq.createdAt ? new Date(inq.createdAt) : new Date();

                return (
                  <div
                    key={inq.id}
                    onClick={() => setSelectedInquiryId(inq.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-500/40 shadow-md ring-1 ring-sky-500/20'
                        : isNew
                        ? 'bg-[#0a1832]/80 border-slate-800 hover:border-sky-500/30 hover:bg-slate-800/40'
                        : 'bg-[#090d16]/70 border-slate-800/70 hover:border-slate-700 hover:bg-slate-800/30 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border ${
                          isNew
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {(inq.name || 'C').substring(0, 1).toUpperCase()}
                        </div>
                        <span className={`text-xs font-bold truncate ${isNew ? 'text-white' : 'text-slate-300'}`}>
                          {inq.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isNew ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            NEW
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/25">
                            REPLIED
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Service & Time */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold truncate max-w-[140px]">
                        {inq.service || 'General Inquiry'}
                      </span>
                      <span className="font-mono text-slate-500 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {formatDistanceToNow(createdDate, { addSuffix: true })}
                      </span>
                    </div>

                    {/* Message Preview */}
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {inq.message || 'No additional text provided.'}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right: Message Detail Viewer */}
        <div className="flex-1 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col justify-between overflow-y-auto custom-scrollbar">
          
          {activeInquiry ? (
            <div className="flex flex-col h-full justify-between space-y-4">
              
              {/* Message Header */}
              <div className="border-b border-slate-800/80 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-teal-500/20 border border-sky-500/30 flex items-center justify-center text-sky-300 font-black text-base shadow-inner">
                    {(activeInquiry.name || 'C').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-white">{activeInquiry.name}</h3>
                      {activeInquiry.status === 'new' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          New Message
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          Replied
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                      {activeInquiry.phone && (
                        <a
                          href={`tel:${activeInquiry.phone}`}
                          className="font-mono text-slate-300 hover:text-sky-300 flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700/60"
                        >
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>{activeInquiry.phone}</span>
                        </a>
                      )}
                      {activeInquiry.email && (
                        <span className="font-mono text-slate-400 flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700/60">
                          <Mail className="w-3 h-3 text-sky-400" />
                          <span>{activeInquiry.email}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-400 font-mono self-end sm:self-auto">
                  {activeInquiry.createdAt ? format(new Date(activeInquiry.createdAt), 'yyyy-MM-dd • hh:mm a') : 'Recent'}
                </div>
              </div>

              {/* Message Body */}
              <div className="flex-1 space-y-4">
                
                {/* Service Tag Card */}
                <div className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-slate-400 uppercase font-black tracking-wider">Service Required:</span>
                    <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/25">
                      {activeInquiry.service || 'General Service Inquiry'}
                    </span>
                  </div>
                </div>

                {/* Message Content Bubble */}
                <div className="p-5 rounded-2xl bg-[#071326] border border-slate-800/90 shadow-inner space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Customer Note / Inquiry Details:
                  </span>
                  <p className="text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                    {activeInquiry.message || 'No additional note provided by customer.'}
                  </p>
                </div>

              </div>

              {/* Action Buttons Footer */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
                
                {/* Status Toggle */}
                <div className="flex items-center gap-2">
                  {activeInquiry.status === 'new' ? (
                    <button
                      onClick={() => handleUpdateStatus(activeInquiry.id, 'replied')}
                      className="px-3.5 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark as Replied</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(activeInquiry.id, 'new')}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Mark as Unread (New)</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(activeInquiry.id)}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700/80 transition-all cursor-pointer"
                    title="Delete Message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* WhatsApp Reply Button */}
                {activeInquiry.phone ? (
                  <button
                    onClick={() => handleReplyWhatsApp(activeInquiry)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
                  >
                    <WhatsAppIcon className="w-4 h-4 shrink-0" />
                    <span>Reply on WhatsApp</span>
                  </button>
                ) : null}

              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
              <MessageSquare className="w-12 h-12 stroke-[1.5] text-slate-600" />
              <p className="text-sm font-bold text-slate-400">Select a message from the left to view details</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
