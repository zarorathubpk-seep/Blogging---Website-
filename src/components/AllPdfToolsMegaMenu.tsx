import React from 'react';
import { getPdfGroups, ToolItem } from '../data/toolsData';
import { TOOL_ICON_MAP } from './tools/ToolCard';
import {
  Layers,
  Split,
  Trash2,
  FolderOutput,
  LayoutGrid,
  Camera,
  Minimize2,
  Wrench,
  ScanText,
  Image,
  FileText,
  Presentation,
  Table,
  Globe,
  FileImage,
  Archive,
  RotateCw,
  Hash,
  Stamp,
  Crop,
  FileEdit,
  CheckSquare,
  Unlock,
  Lock,
  PenTool,
  EyeOff,
  GitCompare,
  Sparkles,
  Languages,
  FileCode2,
  ArrowRight,
  X,
} from 'lucide-react';

// Dedicated icon map for mega menu
const MEGA_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Layers,
  Split,
  Trash2,
  FolderOutput,
  LayoutGrid,
  Camera,
  Minimize2,
  Wrench,
  ScanText,
  Image,
  FileText,
  Presentation,
  Table,
  Globe,
  FileImage,
  Archive,
  RotateCw,
  Hash,
  Stamp,
  Crop,
  FileEdit,
  CheckSquare,
  Unlock,
  Lock,
  PenTool,
  EyeOff,
  GitCompare,
  Sparkles,
  Languages,
  FileCode2,
};

interface AllPdfToolsMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (slug: string) => void;
}

export const AllPdfToolsMegaMenu: React.FC<AllPdfToolsMegaMenuProps> = ({
  isOpen,
  onClose,
  onSelectTool,
}) => {
  if (!isOpen) return null;

  const groups = getPdfGroups();

  const handleToolClick = (slug: string) => {
    onClose();
    onSelectTool(slug);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fadeIn print:hidden">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Mega Menu Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 pointer-events-none">
        <div className="relative pointer-events-auto bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-6 sm:p-8 lg:p-10 overflow-hidden">
          {/* Subtle top decorative gradient line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500" />

          {/* Header row */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-[11px] font-extrabold tracking-widest uppercase text-slate-500">
                  Comprehensive Suite
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                All PDF Tools
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                33 Tools • 100% In-Browser & Private
              </span>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                title="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 7 Columns matching the user's uploaded image exactly */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-6 lg:gap-5">
            {groups.map((group) => {
              const GroupIcon = MEGA_ICON_MAP[group.iconName] || Layers;

              return (
                <div key={group.id} className="space-y-3">
                  {/* Category Title */}
                  <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
                    <GroupIcon className={`w-4 h-4 ${group.accentColor}`} />
                    <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-800">
                      {group.title}
                    </h3>
                  </div>

                  {/* Tool List */}
                  <ul className="space-y-1">
                    {group.tools.map((tool) => {
                      const Icon = MEGA_ICON_MAP[tool.iconName] || Layers;
                      const isHot = tool.badge === 'Popular' || tool.slug === 'merge-pdf';

                      return (
                        <li key={tool.id}>
                          <button
                            type="button"
                            onClick={() => handleToolClick(tool.slug)}
                            className="w-full text-left group flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                  group.id === 'organize'
                                    ? 'bg-rose-50 text-rose-600 group-hover:bg-rose-100'
                                    : group.id === 'optimize'
                                    ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'
                                    : group.id === 'convert-to'
                                    ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-100'
                                    : group.id === 'convert-from'
                                    ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
                                    : group.id === 'edit'
                                    ? 'bg-purple-50 text-purple-600 group-hover:bg-purple-100'
                                    : group.id === 'security'
                                    ? 'bg-sky-50 text-sky-600 group-hover:bg-sky-100'
                                    : 'bg-violet-50 text-violet-600 group-hover:bg-violet-100'
                                }`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                              </div>

                              <span
                                className={`text-xs font-semibold truncate transition-colors ${
                                  isHot
                                    ? 'text-rose-600 font-bold group-hover:text-rose-700'
                                    : 'text-slate-700 group-hover:text-slate-950'
                                }`}
                              >
                                {tool.name}
                              </span>
                            </div>

                            {tool.badge === 'New' && (
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                                New
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Bottom quick banner */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Zero server transfers • High-fidelity vector processing • Completely free</span>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectTool('merge-pdf');
              }}
              className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
            >
              <span>Explore Top PDF Tools</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
