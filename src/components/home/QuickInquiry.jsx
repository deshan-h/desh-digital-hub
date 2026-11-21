import React, { useState } from 'react';
import { Send, MessageSquare, User, Sparkles } from 'lucide-react';
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
    'General Inquiry',
    'Computer & Laptop Repair',
    'Document Printing & Photocopy',
    'Laminating & Book Binding',
    'Document Scanning & Email',
    'Online Government Applications',
    'Professional CV & Graphic Design',
    'Software & OS Support',
    'Utility Bills & Mobile Reloads',
    'Web Application Development'
  ];

  const handleSendMessage = async (type) => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      notify.error('Please enter your name and contact number.');
      return;
    }

    if (type === 'whatsapp') {
      setSubmittingWhatsApp(true);
      try {
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

        notify.success('Opening WhatsApp...');
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
        notify.error('Failed to open WhatsApp.');
        setSubmittingWhatsApp(false);
      }
    } else {
      setSubmittingSystem(true);
      try {
        await inquiryService.createInquiry({
          name: formData.name,
          phone: formData.phone,
          service: formData.service,
          message: formData.message,
          source: 'System Web'
        });

        notify.success('Thank you! Your inquiry has been sent successfully.');
        setFormData({
          name: '',
          phone: '',
          service: 'General Inquiry',
          message: ''
        });
      } catch (err) {
        console.error(err);
        notify.error('Failed to send message. Please try again.');
      } finally {
        setSubmittingSystem(false);
      }
    }
  };

  return (
    <section id="inquiry" className="py-16 sm:py-20 relative overflow-hidden bg-[#050c18] border-t border-sky-500/10">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45rem] h-[30rem] bg-indigo-600/10 rounded-full blur-[170px] pointer-events-none -z-10 mix-blend-screen" />

      <div className="container mx-auto px-4 md:px-6 max-w-3xl relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-400 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Quick Inquiry</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
            Have a Question or Need a Service?
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium">
            Send us a message or chat with our team on WhatsApp for fast support.
          </p>
        </div>

        {/* Form Container */}
        <div className="rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 bg-gradient-to-br from-[#09152b] via-[#081224] to-[#050c18] border border-sky-500/25 shadow-2xl relative overflow-hidden">
          
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage('system'); }} className="space-y-4 relative z-10">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Name Input */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Your Name *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kasun Perera"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-sky-400/60 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-sky-500/30 transition-all shadow-inner"
                />
              </div>

              {/* Phone / WhatsApp Input */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <WhatsAppIcon className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Phone / WhatsApp *</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 077 123 4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-400/60 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all shadow-inner font-mono"
                />
              </div>

            </div>

            {/* Service Selection Dropdown */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Service Category</span>
              </label>
              <select
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-sky-400/60 rounded-xl px-3.5 py-2.5 text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-sky-500/30 transition-all shadow-inner cursor-pointer"
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
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Message or Requirement</span>
              </label>
              <textarea
                rows={3}
                placeholder="Describe what you need help with..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-400/60 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all shadow-inner"
              />
            </div>

            {/* Action Buttons: 2 Clean Solid Buttons */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Primary: Submit Inquiry */}
              <button
                type="submit"
                disabled={submittingWhatsApp || submittingSystem}
                className="w-full py-3 px-5 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4 shrink-0" />
                <span>{submittingSystem ? 'Submitting...' : 'Submit Inquiry'}</span>
              </button>

              {/* Secondary: Chat on WhatsApp */}
              <button
                type="button"
                onClick={() => handleSendMessage('whatsapp')}
                disabled={submittingWhatsApp || submittingSystem}
                className="w-full py-3 px-5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1da850] text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                <WhatsAppIcon className="w-4 h-4 shrink-0 text-slate-950" />
                <span>Chat on WhatsApp</span>
              </button>

            </div>

          </form>

        </div>

      </div>
    </section>
  );
}
