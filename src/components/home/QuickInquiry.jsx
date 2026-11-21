import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare, Phone, User, CheckCircle2, Sparkles, HelpCircle } from 'lucide-react';
import { notify } from '../../utils/toast';
import { inquiryService } from '../../services/supabaseService';
import WhatsAppIcon from '../common/WhatsAppIcon';

export default function QuickInquiry() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: 'General Inquiry',
    message: ''
  });
  const [submittingWhatsApp, setSubmittingWhatsApp] = useState(false);
  const [submittingSystem, setSubmittingSystem] = useState(false);

  const serviceOptions = [
    'General Inquiry (සාමාන්‍ය විමසීමක්)',
    'Computer & Laptop Repair (පරිගණක අලුත්වැඩියාව)',
    'Document Printing & Photocopy (මුද්‍රණ සහ ෆොටෝකොපි)',
    'Laminating (ලැමිනේටින්)',
    'Book Binding (පොත් බයින්ඩින්)',
    'Document Scanning (ස්කෑන් කිරීම්)',
    'Email & Online Services (ඊ-මේල් සේවා)',
    'Online Applications (ඔන්ලයින් අයදුම්පත්)',
    'Media & Software Download (චිත්‍රපට / මෘදුකාංග / ගීත)',
    'Graphic & Poster Design (ග්‍රැෆික් නිර්මාණ)',
    'Utility Bill Payments (බිල්පත් ගෙවීම්)',
    'Mobile Reloads & Data Packages (රීලෝඩ් සහ පැකේජ)',
    'Web Application Development (වෙබ් අඩවි නිර්මාණය)'
  ];

  const handleSendMessage = async (type) => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      notify.error('කරුණාකර ඔබගේ නම සහ දුරකථන අංකය ඇතුළත් කරන්න.');
      return;
    }

    if (type === 'whatsapp') {
      setSubmittingWhatsApp(true);
      try {
        // Save to system database as WhatsApp inquiry
        await inquiryService.createInquiry({
          name: formData.name,
          phone: formData.phone,
          service: formData.service,
          message: formData.message,
          source: 'WhatsApp'
        }).catch(err => console.warn('Could not store inquiry locally:', err));

        const formattedMessage = `*New Customer Inquiry - DESH Digital Hub*\n\n` +
          `👤 *Name:* ${formData.name.trim()}\n` +
          `📞 *Phone / WhatsApp:* ${formData.phone.trim()}\n` +
          `🛠️ *Service Needed:* ${formData.service}\n` +
          `💬 *Message:* ${formData.message.trim() || 'No additional message provided.'}\n\n` +
          `_Sent via deshdigitalhub.lk web portal_`;

        const encodedText = encodeURIComponent(formattedMessage);
        const whatsappUrl = `https://wa.me/94719989000?text=${encodedText}`;

        notify.success('පණිවිඩය සාර්ථකව යොමු කෙරිණි! WhatsApp විවෘත වේ...');
        setTimeout(() => {
          window.open(whatsappUrl, '_blank');
          setSubmittingWhatsApp(false);
          setFormData({
            name: '',
            phone: '',
            service: 'General Inquiry',
            message: ''
          });
        }, 350);
      } catch (err) {
        console.error(err);
        notify.error('පණිවිඩය යැවීමට නොහැකි විය.');
        setSubmittingWhatsApp(false);
      }
    } else {
      // Normal system message submission
      setSubmittingSystem(true);
      try {
        await inquiryService.createInquiry({
          name: formData.name,
          phone: formData.phone,
          service: formData.service,
          message: formData.message,
          source: 'System Web'
        });

        notify.success('ඔබගේ පණිවිඩය සාර්ථකව පද්ධතිය වෙත ලැබුණි! අප කඩිනමින් ඔබව අමතන්නෙමු.');
        setFormData({
          name: '',
          phone: '',
          service: 'General Inquiry',
          message: ''
        });
      } catch (err) {
        console.error(err);
        notify.error('පණිවිඩය යැවීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.');
      } finally {
        setSubmittingSystem(false);
      }
    }
  };

  return (
    <section id="inquiry" className="py-20 relative overflow-hidden bg-[#050c18] border-t border-sky-500/10">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45rem] h-[30rem] bg-indigo-600/10 rounded-full blur-[170px] pointer-events-none -z-10 mix-blend-screen" />

      <div className="container mx-auto px-4 md:px-6 max-w-4xl relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Send a Message • අප අමතන්න</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Have a Question or Need a Service?
          </h2>

          <p className="text-sm sm:text-base text-slate-300 mt-3 font-medium">
            ඔබට අවශ්‍ය ඕනෑම සේවාවක් පිළිබඳ තොරතුරු හෝ ලේඛන යැවීමට පහත පෝරමය පුරවා ක්ෂණිකව අපට පණිවිඩයක් එවන්න.
          </p>
        </div>

        {/* Form Container */}
        <div className="rounded-3xl p-7 sm:p-10 bg-gradient-to-br from-[#09152b] via-[#081224] to-[#050c18] border border-sky-500/25 shadow-2xl relative overflow-hidden">
          
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage('system'); }} className="space-y-5 relative z-10">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Name Input */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sky-400" />
                  <span>Your Name (ඔබගේ නම) *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kasun Perera"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-sky-400/60 rounded-2xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500/30 transition-all shadow-inner"
                />
              </div>

              {/* Phone / WhatsApp Input */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2 flex items-center gap-1.5">
                  <WhatsAppIcon className="w-4 h-4 shrink-0" />
                  <span>Phone / WhatsApp Number (දුරකථන අංකය) *</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 077 123 4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-400/60 rounded-2xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all shadow-inner font-mono"
                />
              </div>

            </div>

            {/* Service Selection Dropdown */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Service Category (අවශ්‍ය සේවාව තෝරන්න)</span>
              </label>
              <select
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-sky-400/60 rounded-2xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500/30 transition-all shadow-inner cursor-pointer"
              >
                {serviceOptions.map((opt, idx) => (
                  <option key={idx} value={opt} className="bg-slate-900 text-white">
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Message Area */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                <span>Message or Requirement (ඔබගේ අවශ්‍යතාවය කෙටියෙන්)</span>
              </label>
              <textarea
                rows={3}
                placeholder="ඔබට අවශ්‍ය සේවාව, පිටු ගණන හෝ පරිගණකයේ පවතින ගැටලුව මෙහි සඳහන් කරන්න..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-400/60 rounded-2xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all shadow-inner"
              />
            </div>

            {/* Action Buttons: System Message as Primary Action */}
            <div className="pt-2 space-y-3.5">
              
              {/* PRIMARY ACTION: Send Directly to System Admin Message Panel */}
              <button
                type="submit"
                disabled={submittingWhatsApp || submittingSystem}
                className="w-full py-3.5 px-6 rounded-2xl font-black text-sm bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white flex items-center justify-center gap-3 transition-all shadow-xl shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-[1.01] active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                <Send className="w-5 h-5 shrink-0" />
                <div className="flex flex-col items-start sm:items-center text-left sm:text-center leading-tight">
                  <span className="font-black text-sm sm:text-base">
                    {submittingSystem ? 'Sending Message to System...' : 'Send Message to System (පද්ධතියට සෘජුව පණිවිඩය එවන්න)'}
                  </span>
                  <span className="text-[10px] font-medium text-sky-200 mt-0.5">
                    පණිවිඩය Admin Panel වෙත සෘජුවම ලැබෙන අතර කඩිනමින් ඔබව අමතන්නෙමු
                  </span>
                </div>
              </button>

              {/* SECONDARY ACTION: Direct WhatsApp Contact */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800/80">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <WhatsAppIcon className="w-4 h-4 shrink-0" />
                  <span>කෙලින්ම WhatsApp හරහා සම්බන්ධ වීමට අවශ්‍යද?</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleSendMessage('whatsapp')}
                  disabled={submittingWhatsApp || submittingSystem}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 hover:border-[#25D366] text-white text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <WhatsAppIcon className="w-4 h-4 shrink-0" />
                  <span>Chat on WhatsApp (+94 71 998 9000)</span>
                </button>
              </div>

            </div>

            {/* Helpful Notice */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-1 text-center">
              <WhatsAppIcon className="w-3.5 h-3.5 shrink-0" />
              <span>ලේඛන, ඡායාරූප හෝ PDF ගොනු ඇත්නම් අපගේ WhatsApp වෙත කෙලින්ම එවිය හැක.</span>
            </div>

          </form>

        </div>

      </div>
    </section>
  );
}
