import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TOOLS_DATA, ToolCategory, ToolItem } from '../data/toolsData';
import {
  Search,
  X,
  Sparkles,
  Layers,
  Split,
  Minimize2,
  FileEdit,
  PenTool,
  QrCode,
  ArrowLeftRight,
  Clock,
  CalendarDays,
  PiggyBank,
  AlignLeft,
  Calculator,
  KeyRound,
  FileCode2,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

import { TOOL_ICON_MAP, getCategoryStyles } from './tools/ToolCard';
import { useTheme } from '../context/ThemeContext';

interface ToolSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (slug: string) => void;
}

export const ToolSelectorModal: React.FC<ToolSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectTool,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, dontShowAgain]);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('toolcrest_welcome_popup_dismissed_v1', 'true');
    }
    onClose();
  };

  const handleChoose = (slug: string) => {
    if (dontShowAgain) {
      localStorage.setItem('toolcrest_welcome_popup_dismissed_v1', 'true');
    }
    onSelectTool(slug);
    onClose();
  };

  const filteredTools = useMemo(() => {
    return TOOLS_DATA.filter((tool) => {
      const matchesCategory =
        selectedCategory === 'all' || tool.category === selectedCategory;

      if (!search.trim()) return matchesCategory;

      const q = search.toLowerCase();
      const matchesSearch =
        tool.name.toLowerCase().includes(q) ||
        tool.shortDesc.toLowerCase().includes(q) ||
        tool.keywords.some((k) => k.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
      {/* Gentle translucent backdrop preventing pitch-black blackout */}
      <div
        className={`fixed inset-0 transition-opacity ${
          isDark
            ? 'bg-slate-950/50 backdrop-blur-xs'
            : 'bg-slate-900/25 backdrop-blur-xs'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card (Centered on top of backdrop) */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
        className={`relative w-full max-w-3xl rounded-2xl shadow-2xl border overflow-hidden z-10 flex flex-col max-h-[90vh] animate-fadeIn transition-colors duration-200 ${
          isDark
            ? 'bg-slate-950 border-amber-500/30 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
        }`}
      >
        {/* Shimmering Top Gold Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500" />

        {/* Modal Header */}
        <div
          className={`p-5 sm:p-6 flex items-start justify-between border-b ${
            isDark
              ? 'bg-[#0c101d] text-white border-amber-500/20'
              : 'bg-gradient-to-r from-amber-50/80 via-yellow-50/50 to-white text-slate-900 border-amber-200/60'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`p-1 rounded-xl ${
                  isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-800'
                }`}
              >
                <Sparkles className="w-4 h-4" />
              </span>
              <span className={`text-xs font-bold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                Quick Tool Discovery
              </span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              What would you like to do today?
            </h2>
            <p className={`text-xs sm:text-sm max-w-xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Choose from 39+ instant client-side tools. Fast, private, and zero server file uploads.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-900'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div
          className={`p-4 sm:p-5 border-b space-y-3 ${
            isDark ? 'border-amber-500/15 bg-[#090d18]' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by tool name (e.g. merge, compress, qr, convert, budget, counter)..."
              className={`w-full pl-10 pr-16 py-2.5 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-amber-400 focus:outline-hidden font-medium ${
                isDark
                  ? 'bg-slate-900 border border-amber-500/30 text-white placeholder:text-slate-400 shadow-inner'
                  : 'bg-white border border-slate-300 text-slate-900 placeholder:text-slate-500 shadow-xs'
              }`}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 hover:text-amber-600 text-xs font-bold px-2 py-1 rounded-lg"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs font-semibold">
            {[
              { id: 'all' as ToolCategory, label: 'All Tools' },
              { id: 'pdf' as ToolCategory, label: 'PDF Suite' },
              { id: 'qr' as ToolCategory, label: 'QR Generator' },
              { id: 'converters' as ToolCategory, label: 'Converters' },
              { id: 'calculators' as ToolCategory, label: 'Calculators' },
              { id: 'productivity' as ToolCategory, label: 'Productivity' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold shadow-xs'
                    : isDark
                    ? 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-amber-500/20'
                    : 'bg-white text-slate-700 hover:text-amber-900 hover:bg-amber-50 border border-slate-200 shadow-2xs'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Results Grid */}
        <div className={`p-4 sm:p-6 overflow-y-auto flex-1 space-y-2 ${isDark ? 'bg-[#080c16]' : 'bg-slate-50/40'}`}>
          {filteredTools.length === 0 ? (
            <div className={`py-12 text-center space-y-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <p className="text-sm font-semibold">No tools found matching "{search}"</p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('all');
                }}
                className={`text-xs font-bold hover:underline cursor-pointer ${isDark ? 'text-amber-400' : 'text-amber-700'}`}
              >
                View all available tools
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredTools.map((tool) => {
                const IconComp = TOOL_ICON_MAP[tool.iconName] || Layers;
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => handleChoose(tool.slug)}
                    className={`p-3.5 rounded-xl border text-left transition group flex items-start gap-3.5 cursor-pointer ${
                      isDark
                        ? 'border-amber-500/20 bg-[#0c101d] hover:border-amber-400/50 hover:bg-[#11172a] shadow-md'
                        : 'border-slate-200/90 bg-white hover:border-amber-400/80 hover:bg-amber-50/40 shadow-xs'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                        isDark
                          ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                          : 'bg-amber-100 border border-amber-300 text-amber-800'
                      }`}
                    >
                      <IconComp className="w-5 h-5 stroke-[2.2]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <span
                          className={`font-bold text-xs sm:text-sm transition leading-snug break-words ${
                            isDark ? 'text-white group-hover:text-amber-300' : 'text-slate-900 group-hover:text-amber-800'
                          }`}
                        >
                          {tool.name}
                        </span>
                        {tool.badge && (
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 border ${
                              isDark
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-amber-100 text-amber-900 border-amber-300'
                            }`}
                          >
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs line-clamp-1 mt-0.5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {tool.shortDesc}
                      </p>
                    </div>

                    <ArrowRight
                      className={`w-4 h-4 group-hover:translate-x-0.5 transition shrink-0 mt-2.5 ${
                        isDark ? 'text-slate-500 group-hover:text-amber-400' : 'text-slate-400 group-hover:text-amber-700'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`p-4 sm:px-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
            isDark
              ? 'bg-[#0c101d] border-amber-500/20 text-slate-300'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded-lg text-amber-500 focus:ring-amber-400 w-3.5 h-3.5"
            />
            <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Don't show this popup automatically on page load
            </span>
          </label>

          <div className="flex items-center gap-3">
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Press{' '}
              <kbd
                className={`font-mono px-1.5 py-0.5 rounded-lg border text-xs ${
                  isDark
                    ? 'bg-slate-900 border-amber-500/30 text-amber-300'
                    : 'bg-white border-slate-300 text-slate-700'
                }`}
              >
                Esc
              </kbd>{' '}
              to close
            </span>
            <button
              type="button"
              onClick={handleClose}
              className={`px-4 py-1.5 font-bold text-xs rounded-xl transition cursor-pointer border ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-amber-500/30'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-2xs'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
