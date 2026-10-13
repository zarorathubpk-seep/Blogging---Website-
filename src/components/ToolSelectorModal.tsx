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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-slate-900 text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-emerald-500/30 rounded-lg text-emerald-300">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Quick Tool Discovery
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              What would you like to do today?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Choose from 30+ instant client-side tools. Fast, free, and no file uploads to external servers.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by tool name (e.g. merge, compress, qr, convert, budget, counter)..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden shadow-2xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
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
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                    : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Results Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-2">
          {filteredTools.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <p className="text-sm font-semibold">No tools found matching "{search}"</p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('all');
                }}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                View all available tools
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredTools.map((tool) => {
                const IconComp = TOOL_ICON_MAP[tool.iconName] || Layers;
                const styles = getCategoryStyles(tool.category);
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => handleChoose(tool.slug)}
                    className="p-3.5 rounded-2xl border border-slate-200/90 hover:border-emerald-500 hover:bg-slate-50/80 text-left transition group flex items-start gap-3.5 shadow-2xs hover:shadow-xs"
                  >
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition ${styles.iconBg}`}>
                      <IconComp className="w-5 h-5 stroke-[2.2]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-800 transition truncate">
                          {tool.name}
                        </span>
                        {tool.badge && (
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 shrink-0">
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 leading-relaxed">
                        {tool.shortDesc}
                      </p>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition shrink-0 mt-2.5" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
            />
            <span className="text-[11px] text-slate-600">Don't show this popup automatically on page load</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">
              Press <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border text-[10px]">Esc</kbd> to close
            </span>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-1.5 font-bold text-xs bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
