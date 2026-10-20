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
import { useTheme } from '../context/ThemeContext';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const groups = getPdfGroups();

  const handleToolClick = (slug: string) => {
    onClose();
    onSelectTool(slug);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fadeIn print:hidden">
      {/* Soft Dimmed Backdrop preventing pitch black screen */}
      <div
        className={`fixed inset-0 transition-opacity cursor-pointer ${
          isDark
            ? 'bg-slate-950/50 backdrop-blur-xs'
            : 'bg-slate-900/25 backdrop-blur-xs'
        }`}
        onClick={onClose}
      />

      {/* Responsive Mega Menu Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 pointer-events-none">
        <div
          className={`relative pointer-events-auto rounded-2xl shadow-2xl border p-6 sm:p-8 lg:p-10 overflow-hidden transition-colors duration-200 ${
            isDark
              ? 'bg-[#0B0F19] border-amber-500/30 text-slate-100 shadow-2xl shadow-black/80'
              : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
          }`}
        >
          {/* Shimmering Metallic Gold Top Accent Stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

          {/* Header Row */}
          <div
            className={`flex items-center justify-between pb-6 mb-6 border-b ${
              isDark ? 'border-amber-500/20' : 'border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
                <span
                  className={`text-xs font-bold tracking-wider ${
                    isDark ? 'text-amber-300' : 'text-amber-800'
                  }`}
                >
                  Comprehensive Suite
                </span>
              </div>
              <h2
                className={`text-xl sm:text-2xl font-black tracking-tight mt-0.5 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                All 33 PDF Tools
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`hidden sm:inline-block text-xs font-bold px-3.5 py-1.5 rounded-full border ${
                  isDark
                    ? 'text-amber-300 bg-amber-500/10 border-amber-500/30'
                    : 'text-amber-900 bg-amber-50 border-amber-300/80 shadow-2xs'
                }`}
              >
                100% In-Browser &amp; Private • Zero Cloud Uploads
              </span>
              <button
                type="button"
                onClick={onClose}
                className={`p-2 rounded-full transition cursor-pointer ${
                  isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-900'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 7 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-6 lg:gap-5">
            {groups.map((group) => {
              const GroupIcon = MEGA_ICON_MAP[group.iconName] || Layers;

              return (
                <div key={group.id} className="space-y-3">
                  {/* Category Title with Gold Accent */}
                  <div
                    className={`flex items-center gap-1.5 pb-2 border-b ${
                      isDark ? 'border-slate-800' : 'border-slate-200'
                    }`}
                  >
                    <GroupIcon className="w-4 h-4 text-amber-500" />
                    <h3
                      className={`text-xs font-bold ${
                        isDark ? 'text-amber-200' : 'text-amber-950'
                      }`}
                    >
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
                            className={`w-full text-left group flex items-center justify-between p-1.5 rounded-xl border transition cursor-pointer ${
                              isDark
                                ? 'border-transparent hover:border-amber-500/20 hover:bg-slate-900/80'
                                : 'border-transparent hover:border-amber-400/40 hover:bg-amber-50/50'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                  isDark
                                    ? 'bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 group-hover:text-amber-300'
                                    : 'bg-amber-100 text-amber-800 group-hover:bg-amber-200 group-hover:text-amber-900'
                                }`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                              </div>

                              <span
                                className={`text-xs font-semibold truncate transition-colors ${
                                  isHot
                                    ? isDark
                                      ? 'text-amber-300 font-bold group-hover:text-yellow-200'
                                      : 'text-amber-800 font-bold group-hover:text-amber-950'
                                    : isDark
                                    ? 'text-slate-300 group-hover:text-white'
                                    : 'text-slate-700 group-hover:text-slate-900'
                                }`}
                              >
                                {tool.name}
                              </span>
                            </div>

                            {tool.badge && (
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ml-1.5 border ${
                                  isDark
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
                                    : 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs'
                                }`}
                              >
                                {tool.badge}
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
          <div
            className={`mt-8 pt-5 border-t flex flex-wrap items-center justify-between gap-4 text-xs ${
              isDark
                ? 'border-slate-800 text-slate-400'
                : 'border-slate-200 text-slate-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Zero server transfers • High-fidelity vector processing • Completely free</span>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectTool('merge-pdf');
              }}
              className={`font-bold flex items-center gap-1 group cursor-pointer transition ${
                isDark
                  ? 'text-amber-400 hover:text-amber-300'
                  : 'text-amber-700 hover:text-amber-900'
              }`}
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
