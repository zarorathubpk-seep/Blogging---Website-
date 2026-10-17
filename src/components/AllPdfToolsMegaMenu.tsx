import React from 'react';
import { getPdfGroups, ToolItem } from '../data/toolsData';
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
      {/* Dark Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity cursor-pointer"
        onClick={onClose}
      />

      {/* Luxury Dark & Gold Mega Menu Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 pointer-events-none">
        <div className="relative pointer-events-auto bg-slate-950 rounded-3xl shadow-2xl border border-amber-500/30 p-6 sm:p-8 lg:p-10 overflow-hidden text-slate-100">
          {/* Shimmering Metallic Gold Top Accent Stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

          {/* Header Row */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-amber-500/20">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
                <span className="text-[11px] font-black tracking-widest uppercase text-amber-300">
                  Comprehensive Suite
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                All 33 PDF Tools
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-xs font-bold text-amber-300 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/30">
                100% In-Browser & Private • Zero Cloud Uploads
              </span>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-900 transition cursor-pointer"
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
                  {/* Category Title with Gold Accent */}
                  <div className="flex items-center gap-1.5 pb-2 border-b border-slate-800">
                    <GroupIcon className="w-4 h-4 text-amber-400" />
                    <h3 className="text-[11px] font-black uppercase tracking-wider text-amber-200">
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
                            className="w-full text-left group flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-900 border border-transparent hover:border-amber-500/20 transition cursor-pointer"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 group-hover:text-amber-300 transition-colors">
                                <Icon className="w-3.5 h-3.5" />
                              </div>

                              <span
                                className={`text-xs font-semibold truncate transition-colors ${
                                  isHot
                                    ? 'text-amber-300 font-bold group-hover:text-yellow-200'
                                    : 'text-slate-300 group-hover:text-white'
                                }`}
                              >
                                {tool.name}
                              </span>
                            </div>

                            {tool.badge === 'New' && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-400/20 text-yellow-300 border border-amber-400/30">
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
          <div className="mt-8 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Zero server transfers • High-fidelity vector processing • Completely free</span>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectTool('merge-pdf');
              }}
              className="font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 group cursor-pointer"
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
