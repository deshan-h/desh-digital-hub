import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Edit, X, Check, UploadCloud, Sparkles, Save, 
  Zap, Wand2, RefreshCw, CheckCircle2, ArrowRight, Palette,
  Plus, Trash2, Layers, Clock, Eye, EyeOff
} from 'lucide-react';

/**
 * Modal to edit an existing Promotional Web Banner / Wallpaper
 */
export function BannerEditModal({
  editingBanner,
  setEditingBanner,
  banners = [],
  editImageInputMode,
  setEditImageInputMode,
  editUploading,
  handleEditFileUpload,
  handleOpenAiModal,
  handleSaveEditedBanner
}) {
  if (!editingBanner) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#071326] border border-sky-500/30 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(14,165,233,0.15)] overflow-hidden slide-in-from-bottom-6">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-sky-500/20 bg-gradient-to-r from-[#0a1e38] via-[#09182d] to-[#071326] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
              <Edit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Edit Promotional Banner</h3>
              <p className="text-xs text-slate-400">Update headline, graphic flyer, play order, or link</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditingBanner(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSaveEditedBanner} className="flex flex-col flex-1 min-h-0 overflow-hidden text-xs">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {/* Image Upload / URL */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  Banner Image Flyer
                </label>
                <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setEditImageInputMode('file')}
                    className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                      editImageInputMode === 'file' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Upload New
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditImageInputMode('url')}
                    className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                      editImageInputMode === 'url' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Edit URL
                  </button>
                </div>
              </div>

              {editImageInputMode === 'file' ? (
                <div className="relative border-2 border-dashed border-slate-700 hover:border-sky-500/60 rounded-xl p-4 text-center bg-slate-950/60 transition-colors group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditFileUpload}
                    disabled={editUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <UploadCloud className="w-6 h-6 text-sky-400" />
                    <p className="text-xs font-bold text-slate-200">
                      {editUploading ? 'Uploading to Cloudflare...' : 'Click or drop new flyer image'}
                    </p>
                  </div>
                </div>
              ) : (
                <input
                  type="url"
                  value={editingBanner.imageUrl}
                  onChange={(e) => setEditingBanner({ ...editingBanner, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-950 text-slate-100 px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none font-mono text-xs"
                />
              )}

              {/* Live Preview */}
              {editingBanner.imageUrl && (
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
                  <img
                    src={editingBanner.imageUrl}
                    alt="Preview"
                    className="w-14 h-14 object-cover rounded-lg border border-slate-700 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Image Active
                    </span>
                    <p className="text-[10px] text-slate-400 truncate font-mono">{editingBanner.imageUrl}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Banner Headline Title
                  </label>
                  <button
                    type="button"
                    onClick={() => handleOpenAiModal('edit')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-sky-500/20 via-cyan-500/20 to-teal-500/20 hover:from-sky-500/30 hover:to-teal-500/30 text-sky-300 border border-sky-500/40 text-[10px] font-black cursor-pointer transition-all shadow-sm group"
                  >
                    <Sparkles className="w-3 h-3 text-sky-400 group-hover:rotate-12 transition-transform" />
                    <span>✨ AI Rewrite Copy</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={editingBanner.title}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none"
                  placeholder="Headline title..."
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Subtext / Promotional Description
                </label>
                <textarea
                  rows={2}
                  value={editingBanner.subtitle}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                  className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none resize-none"
                  placeholder="Description..."
                />
              </div>
            </div>

            {/* Badge, Play Order, Visibility */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Badge Tag
                </label>
                <select
                  value={editingBanner.badge}
                  onChange={(e) => setEditingBanner({ ...editingBanner, badge: e.target.value })}
                  className="w-full bg-slate-950 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none cursor-pointer"
                >
                  <option value="PROMOTION">PROMOTION</option>
                  <option value="FEATURED">FEATURED</option>
                  <option value="NEW SERVICE">NEW SERVICE</option>
                  <option value="SPECIAL OFFER">SPECIAL OFFER</option>
                  <option value="EDUCATIONAL">EDUCATIONAL</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Play Order (Sequence #)
                </label>
                <select
                  value={editingBanner.order}
                  onChange={(e) => setEditingBanner({ ...editingBanner, order: Number(e.target.value) })}
                  className="w-full bg-slate-950 text-sky-400 font-bold font-mono text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none cursor-pointer"
                >
                  {banners.map((_, i) => (
                    <option key={i} value={i + 1} className="bg-slate-900 text-slate-200">
                      Position #{i + 1} {i === 0 ? '(Plays First)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Visibility Status
                </label>
                <select
                  value={editingBanner.active ? 'active' : 'hidden'}
                  onChange={(e) => setEditingBanner({ ...editingBanner, active: e.target.value === 'active' })}
                  className={`w-full font-bold text-xs px-3 py-2 rounded-xl border outline-none cursor-pointer ${
                    editingBanner.active 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40' 
                      : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                >
                  <option value="active" className="bg-slate-900 text-emerald-400 font-bold">Active (Show on Website)</option>
                  <option value="hidden" className="bg-slate-900 text-slate-400 font-bold">Hidden (Draft)</option>
                </select>
              </div>
            </div>

            {/* Target Link & Button Text */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Button Action Link
                </label>
                <input
                  type="text"
                  value={editingBanner.linkUrl}
                  onChange={(e) => setEditingBanner({ ...editingBanner, linkUrl: e.target.value })}
                  className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none font-mono"
                  placeholder="e.g. #services or https://..."
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Button Label
                </label>
                <input
                  type="text"
                  value={editingBanner.linkText}
                  onChange={(e) => setEditingBanner({ ...editingBanner, linkText: e.target.value })}
                  className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none"
                  placeholder="e.g. View Details"
                />
              </div>
            </div>
          </div>

          {/* Modal Fixed Footer Actions */}
          <div className="shrink-0 px-6 py-4 border-t border-slate-800 bg-[#071326] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setEditingBanner(null)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs transition-all shadow-md shadow-sky-500/25 flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Update Banner</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

/**
 * Cloudflare Workers AI Copywriter Modal
 */
export function WorkersAiModal({
  isOpen,
  onClose,
  aiTarget,
  aiPrompt,
  setAiPrompt,
  aiLanguage,
  setAiLanguage,
  aiStyle,
  setAiStyle,
  aiBadge,
  setAiBadge,
  aiGenerating,
  aiResult,
  handleGenerateAiCopy,
  handleApplyAiCopy
}) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b182f] border border-sky-500/30 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-800 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-100 flex items-center gap-1.5">
                <span>Cloudflare Workers AI Copywriter</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase">
                  Free Llama 3.1
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Draft catchy banner titles, subtitles & badges tailored for DESH Digital Hub.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar">
          {/* Target indicator */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px]">
            <span className="text-slate-400">Applying copy to:</span>
            <span className="font-bold text-sky-400 flex items-center gap-1">
              {aiTarget === 'new' ? '+ Add New Banner Form' : '✏️ Current Banner in Edit'}
            </span>
          </div>

          {/* Quick Idea Presets */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> Quick Idea Presets (ක්ෂණික අදහස්)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: '🚀 SSD & RAM වේගය', prompt: 'පරිගණකයේ වේගය වැඩි කරගන්න NVMe SSD සහ RAM Upgrade විශේෂ වට්ටම්' },
                { label: '💻 ලැප්ටොප් Chip රෙපයාර්', prompt: 'විශ්වාසනීය ලැප්ටොප් මදර්බෝඩ් චිප් ලෙවල් රෙපයාර් සහ නොමිලේ දෝෂ පරීක්ෂාව' },
                { label: '🖨️ Color Print & Binding', prompt: 'උසස් තත්වයේ වර්ණ මුද්‍රණ, ඡායා පිටපත්, සහ පොත් බැඳීම' },
                { label: '🌐 Online අයදුම්පත් (Passport)', prompt: 'මාර්ගගත පාස්පෝට් දිනයන්, රියදුරු බලපත්‍ර සහ රජයේ විභාග අයදුම්පත්' },
                { label: '🎧 පරිගණක උපාංග', prompt: 'Gaming Keyboards, Wireless Mice, Cables සහ CCTV කැමරා උපාංග' },
                { label: '⚡ සති අන්ත 20% Discount', prompt: 'සති අන්ත විශේෂ දීමනා පරිගණක උපාංග සහ සේවාවන් සඳහා 20%ක වට්ටමක්' },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setAiPrompt(preset.prompt);
                    handleGenerateAiCopy(preset.prompt);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-sky-950/50 text-slate-300 hover:text-sky-300 border border-slate-800 hover:border-sky-500/40 text-[10px] font-bold transition-all cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input & Style */}
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Describe what you want to promote (ප්‍රවර්ධනය කිරීමට අවශ්‍ය දේ ඇතුළත් කරන්න) *
              </label>
              <textarea
                rows={2}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="උදා: ලැප්ටොප් SSD upgrade එකක් සමඟ Windows 11 දැමීම 15%ක වට්ටමක් සහිතව..."
                className="w-full bg-slate-950 text-slate-100 text-xs p-3 rounded-xl border border-slate-700 focus:border-sky-500 outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Language (භාෂාව)
                </label>
                <select
                  value={aiLanguage}
                  onChange={(e) => setAiLanguage(e.target.value)}
                  className="w-full bg-slate-950 text-sky-400 font-bold text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none cursor-pointer"
                >
                  <option value="sinhala">🇱🇰 සිංහල (Sinhala)</option>
                  <option value="singlish">🇱🇰 Singlish (සිංග්ලිෂ්)</option>
                  <option value="english">🇬🇧 English</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Marketing Tone
                </label>
                <select
                  value={aiStyle}
                  onChange={(e) => setAiStyle(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none cursor-pointer"
                >
                  <option value="promotional">High-Converting (ආකර්ෂණීය)</option>
                  <option value="urgent">Urgent Offer (සීමිත කාලීන)</option>
                  <option value="premium">Tech Premium (වෘත්තීය)</option>
                  <option value="educational">Educational (පැහැදිලි)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Preferred Badge
                </label>
                <select
                  value={aiBadge}
                  onChange={(e) => setAiBadge(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none cursor-pointer"
                >
                  <option value="">AI Recommended (Auto)</option>
                  <option value="PROMOTION">PROMOTION</option>
                  <option value="FEATURED">FEATURED</option>
                  <option value="NEW SERVICE">NEW SERVICE</option>
                  <option value="SPECIAL OFFER">SPECIAL OFFER</option>
                  <option value="EDUCATIONAL">EDUCATIONAL</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleGenerateAiCopy()}
              disabled={aiGenerating || !aiPrompt.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-teal-400 hover:from-sky-400 hover:to-teal-300 text-slate-950 font-black text-xs transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Generating Copy with Cloudflare AI...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-slate-950" />
                  <span>Generate Banner Copy</span>
                </>
              )}
            </button>
          </div>

          {/* AI Generated Output Preview */}
          {aiResult && (
            <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/40 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] font-bold text-sky-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Generated Output Preview
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30">
                  {aiResult.engine || 'Cloudflare Workers AI'}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {aiResult.badge || 'PROMOTION'}
                  </span>
                </div>
                <h4 className="text-sm font-black text-white leading-snug">
                  {aiResult.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {aiResult.subtitle}
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-sky-500 text-slate-950 text-[11px] font-black flex items-center gap-1">
                    {aiResult.linkText || 'Learn More'}
                    <ArrowRight className="w-3 h-3" />
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Action: {aiResult.linkUrl || '#services'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleGenerateAiCopy()}
                  disabled={aiGenerating}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-colors cursor-pointer border border-slate-800"
                >
                  Regenerate 🔄
                </button>
                <button
                  type="button"
                  onClick={handleApplyAiCopy}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Use This Copy (Apply)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between px-5 sm:px-6 py-3 border-t border-slate-800 text-[11px] text-slate-500 bg-[#0b182f]">
          <span>Runs on Cloudflare Free Tier (10,000 free neurons/day)</span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * Modal to edit an existing Service Category
 */
export function ServiceEditModal({
  editingService,
  setEditingService,
  editServiceImageMode,
  setEditServiceImageMode,
  editServiceAiPrompt,
  setEditServiceAiPrompt,
  editAiGeneratingServiceImage,
  handleGenerateServiceAiImage,
  editServiceUploading,
  uploadToCloudflare,
  notify,
  handleGenerateServiceDescription,
  editAiGeneratingServiceDesc,
  editSubInput,
  setEditSubInput,
  servicesList = [],
  handleUpdateEditingService
}) {
  if (!editingService) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#071326] border border-sky-500/30 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(14,165,233,0.15)] overflow-hidden slide-in-from-bottom-6">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-sky-500/20 bg-gradient-to-r from-[#0a1e38] via-[#09182d] to-[#071326] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
              <Edit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Edit Service Category • {editingService.title}
              </h3>
              <p className="text-xs text-slate-400">Update category details, Sinhala translation, icon and sub-services</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditingService(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleUpdateEditingService} className="flex flex-col flex-1 min-h-0 overflow-hidden text-xs">
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Category Title (English) *
                </label>
                <input
                  type="text"
                  value={editingService.title}
                  onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                  className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Category Title (Sinhala) *
                </label>
                <input
                  type="text"
                  value={editingService.sinhala}
                  onChange={(e) => setEditingService({ ...editingService, sinhala: e.target.value })}
                  className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none"
                />
              </div>
            </div>

            {/* Image section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Category Visual Image
                </label>
                <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setEditServiceImageMode('ai')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      editServiceImageMode === 'ai' ? 'bg-purple-500/20 text-purple-300 font-bold' : 'text-slate-400'
                    }`}
                  >
                    🎨 Cloudflare AI
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditServiceImageMode('file')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      editServiceImageMode === 'file' ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-400'
                    }`}
                  >
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditServiceImageMode('url')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      editServiceImageMode === 'url' ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-400'
                    }`}
                  >
                    URL
                  </button>
                </div>
              </div>

              {editServiceImageMode === 'ai' && (
                <div className="p-3 rounded-xl bg-slate-950 border border-purple-500/30 flex gap-2">
                  <input
                    type="text"
                    placeholder="Prompt for AI image generation..."
                    value={editServiceAiPrompt}
                    onChange={(e) => setEditServiceAiPrompt(e.target.value)}
                    className="flex-1 bg-slate-900 text-slate-100 text-xs px-3 py-1.5 rounded-xl border border-slate-700 focus:border-purple-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleGenerateServiceAiImage('edit')}
                    disabled={editAiGeneratingServiceImage}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    {editAiGeneratingServiceImage ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Palette className="w-3.5 h-3.5" />}
                    <span>Generate</span>
                  </button>
                </div>
              )}

              {editServiceImageMode === 'file' && (
                <input
                  type="file"
                  accept="image/*"
                  disabled={editServiceUploading}
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    try {
                      const res = await uploadToCloudflare(f);
                      setEditingService(prev => ({ ...prev, image: res.url }));
                      notify.success('Image uploaded!');
                    } catch (err) {
                      notify.error(err.message);
                    }
                  }}
                  className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-600 file:text-white cursor-pointer"
                />
              )}

              {editServiceImageMode === 'url' && (
                <input
                  type="url"
                  value={editingService.image}
                  onChange={(e) => setEditingService({ ...editingService, image: e.target.value })}
                  className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none font-mono"
                />
              )}

              {editingService.image && (
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
                  <img
                    src={editingService.image}
                    alt="Visual"
                    className="w-12 h-12 object-cover rounded-lg border border-slate-700 shrink-0"
                  />
                  <p className="text-[10px] text-slate-400 truncate font-mono flex-1">{editingService.image}</p>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Description
                </label>
                <button
                  type="button"
                  onClick={() => handleGenerateServiceDescription('edit', 'sinhala')}
                  disabled={editAiGeneratingServiceDesc}
                  className="text-[10px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3 text-sky-400" />
                  <span>✨ AI Rewrite Description</span>
                </button>
              </div>
              <textarea
                rows={2}
                value={editingService.description}
                onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                className="w-full bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none resize-none"
              />
            </div>

            {/* Sub-services */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Sub-Services ({editingService.items?.length || 0})
                </label>
                <button
                  type="button"
                  onClick={() => handleGenerateServiceDescription('edit', 'english')}
                  disabled={editAiGeneratingServiceDesc}
                  className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Zap className="w-3 h-3" />
                  <span>⚡ Suggest Items</span>
                </button>
              </div>

              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Type sub-service and press Enter..."
                  value={editSubInput}
                  onChange={(e) => setEditSubInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = editSubInput.trim();
                      if (!val) return;
                      setEditingService(prev => ({
                        ...prev,
                        items: [...(prev.items || []), { name: val }]
                      }));
                      setEditSubInput('');
                    }
                  }}
                  className="flex-1 bg-slate-950 text-slate-100 text-xs px-3 py-1.5 rounded-xl border border-slate-700 focus:border-sky-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = editSubInput.trim();
                    if (!val) return;
                    setEditingService(prev => ({
                      ...prev,
                      items: [...(prev.items || []), { name: val }]
                    }));
                    setEditSubInput('');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer"
                >
                  + Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto custom-scrollbar p-1.5 bg-slate-950 rounded-xl border border-slate-800">
                {(!editingService.items || editingService.items.length === 0) ? (
                  <span className="text-[10px] text-slate-500 italic p-1">No items</span>
                ) : (
                  editingService.items.map((item, idx) => {
                    const name = typeof item === 'string' ? item : item.name;
                    return (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-sky-950/60 border border-sky-500/30 text-sky-300 text-[10px]"
                      >
                        <Check className="w-2.5 h-2.5 text-sky-400" />
                        <span>{name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingService(prev => ({
                              ...prev,
                              items: prev.items.filter((_, i) => i !== idx)
                            }));
                          }}
                          className="text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    );
                  })
                )}
              </div>
            </div>

            {/* Order & Visibility */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Display Sequence (Order #)
                </label>
                <select
                  value={editingService.order || 1}
                  onChange={(e) => setEditingService({ ...editingService, order: Number(e.target.value) })}
                  className="w-full bg-slate-950 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none cursor-pointer"
                >
                  {servicesList.map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Order #{i + 1}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Public Visibility
                </label>
                <select
                  value={editingService.active !== false ? 'active' : 'hidden'}
                  onChange={(e) => setEditingService({ ...editingService, active: e.target.value === 'active' })}
                  className="w-full bg-slate-950 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none cursor-pointer"
                >
                  <option value="active" className="text-emerald-400">Visible on Public Site</option>
                  <option value="hidden" className="text-slate-400">Hidden (Draft)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Modal Fixed Footer */}
          <div className="shrink-0 px-6 py-4 border-t border-slate-800 bg-[#071326] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setEditingService(null)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-sky-500/25 flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Update Category</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

/**
 * Modal to edit an existing Our Work portfolio showcase item
 */
export function WorkEditModal({
  editingWork,
  setEditingWork,
  worksList = [],
  editWorkImageMode,
  setEditWorkImageMode,
  editWorkUploading,
  handleEditWorkFileUpload,
  handleSaveEditedWork
}) {
  if (!editingWork) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#071326] border border-sky-500/30 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(14,165,233,0.15)] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-sky-500/20 bg-gradient-to-r from-[#0a1e38] via-[#09182d] to-[#071326] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Edit Work Item</h3>
              <p className="text-xs text-slate-400">Update photo, title, small description, or display sequence</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditingWork(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSaveEditedWork} className="flex flex-col flex-1 min-h-0 overflow-hidden text-xs">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {/* Image Upload / URL */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  Work Showcase Image (Portrait or Landscape) *
                </label>
                <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setEditWorkImageMode('file')}
                    className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                      editWorkImageMode === 'file' ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditWorkImageMode('url')}
                    className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                      editWorkImageMode === 'url' ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Image URL
                  </button>
                </div>
              </div>

              {editWorkImageMode === 'file' ? (
                <div className="relative border-2 border-dashed border-slate-700 hover:border-sky-500/60 rounded-xl p-4 text-center bg-slate-950/60 transition-colors group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditWorkFileUpload}
                    disabled={editWorkUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <UploadCloud className="w-6 h-6 text-sky-400" />
                    <p className="text-xs font-bold text-slate-200">
                      {editWorkUploading ? 'Uploading / Processing image...' : 'Click or drop new work photo'}
                    </p>
                    <p className="text-[10px] text-slate-400">Supports JPG, PNG, WebP (Portrait or Landscape)</p>
                  </div>
                </div>
              ) : (
                <input
                  type="text"
                  value={editingWork.image || ''}
                  onChange={(e) => setEditingWork({ ...editingWork, image: e.target.value })}
                  placeholder="https://... or /images/services/..."
                  className="w-full bg-slate-950 text-slate-100 px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none font-mono text-xs"
                />
              )}

              {/* Image Preview */}
              {editingWork.image && (
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
                  <img
                    src={editingWork.image}
                    alt="Preview"
                    className="w-14 h-14 object-cover rounded-lg border border-slate-700 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Image Loaded
                    </span>
                    <p className="text-[10px] text-slate-400 truncate font-mono">{editingWork.image}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                Work Title *
              </label>
              <input
                type="text"
                value={editingWork.title || ''}
                onChange={(e) => setEditingWork({ ...editingWork, title: e.target.value })}
                className="w-full bg-slate-950 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-sky-500 outline-none"
                placeholder="e.g. Modern Executive ATS Resume"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                Small Description *
              </label>
              <textarea
                rows={3}
                value={editingWork.description || ''}
                onChange={(e) => setEditingWork({ ...editingWork, description: e.target.value })}
                className="w-full bg-slate-950 text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-sky-500 outline-none resize-none leading-relaxed"
                placeholder="Concise overview of the work sample or project details..."
                required
              />
            </div>

            {/* Order & Visibility */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Display Sequence (Order #)
                </label>
                <select
                  value={editingWork.order || 1}
                  onChange={(e) => setEditingWork({ ...editingWork, order: Number(e.target.value) })}
                  className="w-full bg-slate-950 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none cursor-pointer"
                >
                  {worksList.map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Order #{i + 1}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Public Visibility
                </label>
                <select
                  value={editingWork.active !== false ? 'active' : 'hidden'}
                  onChange={(e) => setEditingWork({ ...editingWork, active: e.target.value === 'active' })}
                  className="w-full bg-slate-950 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-sky-500 outline-none cursor-pointer"
                >
                  <option value="active" className="text-emerald-400">Visible on Public Site</option>
                  <option value="hidden" className="text-slate-400">Hidden (Draft)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="shrink-0 px-6 py-4 border-t border-slate-800 bg-[#071326] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setEditingWork(null)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-sky-500/25 flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Update Work</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
