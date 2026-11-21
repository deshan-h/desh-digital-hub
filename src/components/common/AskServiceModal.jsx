import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Send, 
  CheckCircle2, 
  PhoneCall, 
  Phone, 
  User, 
  MessageSquare, 
  Sparkles
} from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { inquiryService } from '../../services/supabaseService';
import { notify } from '../../utils/toast';

/**
 * AskServiceModal
 * Reusable modal for "Ask More Details / Prices" across Online Services & Public Services.
 * Submits the inquiry directly to the internal system (inquiries dashboard).
 * Includes an instant WhatsApp / Phone call banner for rapid assistance.
 */
export default function AskServiceModal({
  isOpen,
  onClose,
  serviceTitle = 'General Service',
  serviceCategory = '',
  source = 'Public Services'
}) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    details: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      notify.error('කරුණාකර ඔබගේ නම ඇතුළත් කරන්න.');
      return;
    }

    if (!formData.phone.trim()) {
      notify.error('කරුණාකර ඔබගේ WhatsApp හෝ දුරකථන අංකය ඇතුළත් කරන්න.');
      return;
    }

    setSubmitting(true);
    try {
      await inquiryService.createInquiry({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        service: serviceTitle,
        message: formData.details.trim() || `Inquiry for ${serviceTitle}`,
        source: source
      });

      setIsSuccess(true);
      notify.success('ඔබගේ විමසීම සාර්ථකව පද්ධතියට ලැබුණි!');
    } catch (err) {
      console.error('Failed to submit inquiry:', err);
      notify.error('විමසීම යොමු කිරීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setFormData({ name: '', phone: '', details: '' });
    onClose();
  };

  const handleWhatsAppCall = () => {
    // Open WhatsApp directly for the shop number
    window.open('https://wa.me/94719989000', '_blank');
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/80 backdrop-blur-md"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="bg-[#0b1c36] border border-sky-400/30 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative max-h-[92vh] flex flex-col justify-between overflow-y-auto no-scrollbar"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-3.5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0 shadow-inner">
                <Sparkles className="w-5 h-5 text-cyan-300" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block truncate">
                  {serviceCategory || 'Service Inquiry'}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white leading-tight truncate">
                  Ask More Details / Prices
                </h3>
                <p className="text-xs font-bold text-slate-300 truncate mt-0.5">
                  {serviceTitle}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0 ml-2"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 mx-auto flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.3)]">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-lg font-black text-white">
                  ඔබගේ විමසීම සාර්ථකව ලැබුණි!
                </h4>
                <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                  <b>{serviceTitle}</b> පිළිබඳ මිල ගණන් සහ වැඩිදුර තොරතුරු සමඟ අප කණ්ඩායම විසින් ඔබගේ WhatsApp අංකය වෙත කඩිනමින් පිළිතුරු ලබා දෙනු ඇත.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
                >
                  හරි (Done)
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              
              {/* ======================================================== */}
              {/* INSTANT CALL BANNER                                      */}
              {/* Clean, single-line, perfectly aligned layout             */}
              {/* ======================================================== */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#07172f] via-[#092040] to-[#07172f] border border-sky-400/30 shadow-md">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <PhoneCall className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-sky-300 block truncate">
                        ඉක්මනින් දැනගැනීමට අමතන්න
                      </span>
                      <a
                        href="tel:+94719989000"
                        className="text-sm sm:text-base font-black font-mono text-white hover:text-emerald-400 transition-colors whitespace-nowrap block tracking-wide"
                      >
                        +94 71 998 9000
                      </a>
                    </div>
                  </div>

                  {/* WhatsApp Call / Direct Connect Button (Clean Plain Professional Solid Color) */}
                  <button
                    type="button"
                    onClick={handleWhatsAppCall}
                    className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1da850] text-slate-950 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shrink-0 shadow-sm"
                    title="WhatsApp Call (+94 71 998 9000)"
                  >
                    <WhatsAppIcon className="w-4 h-4 text-slate-950 shrink-0" />
                    <span className="whitespace-nowrap">WhatsApp Call</span>
                  </button>
                </div>
              </div>

              {/* Inquiry Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Your Name (නම) *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. කසුන් පෙරේරා / Kasun Perera"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-950/80 text-slate-100 text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700/80 focus:border-sky-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    WhatsApp Number (දුරකථන අංකය) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="07x xxx xxxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-950/80 text-slate-100 text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700/80 focus:border-sky-500 outline-none transition-colors font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Requirements / Details (අවශ්‍යතාවය හෝ විමසීම) *
                  </label>
                  <div className="relative">
                    <MessageSquare className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <textarea
                      rows={3}
                      required
                      placeholder={`මට ${serviceTitle} පිළිබඳ මිල ගණන් සහ විස්තර දැනගැනීමට අවශ්‍යයි...`}
                      value={formData.details}
                      onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                      className="w-full bg-slate-950/80 text-slate-100 text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700/80 focus:border-sky-500 outline-none resize-none transition-colors leading-relaxed"
                    />
                  </div>
                </div>

                {/* Submit Action (Clean Plain Professional Solid Color) */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {submitting ? (
                      <span>යොමු වෙමින්...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-white shrink-0" />
                        <span>Submit Inquiry (විමසීම යොමු කරන්න)</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
