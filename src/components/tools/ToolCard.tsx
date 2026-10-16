import React from 'react';
import { ToolItem, ToolCategory } from '../../data/toolsData';
import {
  Layers,
  Split,
  Minimize2,
  FileEdit,
  PenTool,
  RefreshCw,
  Image,
  FileImage,
  Scissors,
  Lock,
  Unlock,
  RotateCw,
  Trash2,
  FolderOutput,
  ArrowUpDown,
  Globe,
  ScanText,
  Stamp,
  Hash,
  Copy,
  GitCompare,
  Zap,
  EyeOff,
  FilePlus2,
  QrCode,
  ArrowLeftRight,
  Clock,
  CalendarDays,
  PiggyBank,
  Clock4,
  Briefcase,
  FolderGit2,
  GraduationCap,
  UtensilsCrossed,
  CheckCheck,
  AlignLeft,
  Calculator,
  KeyRound,
  FileCode2,
  Star,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const TOOL_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Layers,
  Split,
  Minimize2,
  FileEdit,
  PenTool,
  RefreshCw,
  Image,
  FileImage,
  Scissors,
  Lock,
  Unlock,
  RotateCw,
  Trash2,
  FolderOutput,
  ArrowUpDown,
  Globe,
  ScanText,
  Stamp,
  Hash,
  Copy,
  GitCompare,
  Zap,
  EyeOff,
  FilePlus2,
  QrCode,
  ArrowLeftRight,
  Clock,
  CalendarDays,
  PiggyBank,
  Clock4,
  Briefcase,
  FolderGit2,
  GraduationCap,
  UtensilsCrossed,
  CheckCheck,
  AlignLeft,
  Calculator,
  KeyRound,
  FileCode2,
};

interface ToolCardProps {
  tool: ToolItem;
  onSelect: (slug: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent, id: string) => void;
  showCategoryBadge?: boolean;
  compact?: boolean;
}

// Category visual styling: rich multi-tone gradients, crisp borders, and icon colors
export const getCategoryStyles = (category: ToolCategory) => {
  switch (category) {
    case 'pdf':
      return {
        iconBg: 'bg-linear-to-br from-rose-50 to-orange-50/80 border-rose-200/90 text-rose-600 group-hover:from-rose-100 group-hover:to-orange-100',
        badgeBg: 'bg-rose-50 text-rose-700 border-rose-200/80',
        dotColor: 'bg-rose-500',
        accentText: 'text-rose-600',
        cardHoverBorder: 'hover:border-rose-300',
        label: 'PDF Suite',
      };
    case 'qr':
      return {
        iconBg: 'bg-linear-to-br from-violet-50 to-purple-50/80 border-violet-200/90 text-violet-600 group-hover:from-violet-100 group-hover:to-purple-100',
        badgeBg: 'bg-violet-50 text-violet-700 border-violet-200/80',
        dotColor: 'bg-violet-500',
        accentText: 'text-violet-600',
        cardHoverBorder: 'hover:border-violet-300',
        label: 'QR & Barcode',
      };
    case 'converters':
      return {
        iconBg: 'bg-linear-to-br from-sky-50 to-blue-50/80 border-sky-200/90 text-sky-600 group-hover:from-sky-100 group-hover:to-blue-100',
        badgeBg: 'bg-sky-50 text-sky-700 border-sky-200/80',
        dotColor: 'bg-sky-500',
        accentText: 'text-sky-600',
        cardHoverBorder: 'hover:border-sky-300',
        label: 'Converter',
      };
    case 'calculators':
      return {
        iconBg: 'bg-linear-to-br from-emerald-50 to-teal-50/80 border-emerald-200/90 text-emerald-700 group-hover:from-emerald-100 group-hover:to-teal-100',
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
        dotColor: 'bg-emerald-500',
        accentText: 'text-emerald-700',
        cardHoverBorder: 'hover:border-emerald-300',
        label: 'Financial & Math',
      };
    case 'productivity':
      return {
        iconBg: 'bg-linear-to-br from-amber-50 to-orange-50/80 border-amber-200/90 text-amber-700 group-hover:from-amber-100 group-hover:to-orange-100',
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200/80',
        dotColor: 'bg-amber-500',
        accentText: 'text-amber-700',
        cardHoverBorder: 'hover:border-amber-300',
        label: 'Productivity',
      };
    case 'image':
      return {
        iconBg: 'bg-linear-to-br from-cyan-50 to-teal-50/80 border-cyan-200/90 text-cyan-600 group-hover:from-cyan-100 group-hover:to-teal-100',
        badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
        dotColor: 'bg-cyan-500',
        accentText: 'text-cyan-600',
        cardHoverBorder: 'hover:border-cyan-300',
        label: 'Image & Media',
      };
    default:
      return {
        iconBg: 'bg-linear-to-br from-indigo-50 to-purple-50/80 border-indigo-200/90 text-indigo-600 group-hover:from-indigo-100 group-hover:to-purple-100',
        badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
        dotColor: 'bg-indigo-500',
        accentText: 'text-indigo-600',
        cardHoverBorder: 'hover:border-indigo-300',
        label: 'Text & Utility',
      };
  }
};

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  onSelect,
  isFavorite = false,
  onToggleFavorite,
  showCategoryBadge = true,
  compact = false,
}) => {
  const IconComponent = TOOL_ICON_MAP[tool.iconName] || Layers;
  const styles = getCategoryStyles(tool.category);

  return (
    <div
      onClick={() => onSelect(tool.slug)}
      className={`group relative bg-white border border-slate-200/80 ${styles.cardHoverBorder} rounded-2xl shadow-xs hover:shadow-lg hover:shadow-slate-900/5 transition-all duration-200 ease-out cursor-pointer flex flex-col justify-between hover:-translate-y-1 select-none h-full ${
        compact ? 'p-4' : 'p-5 sm:p-5.5'
      }`}
    >
      <div>
        {/* Top Bar: Icon + Category/Badges + Favorite Button */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          {/* Colorful Icon with Soft Glow & Scale on hover */}
          <div
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-108 transition-transform duration-300 ${styles.iconBg}`}
          >
            <IconComponent className="w-5.5 h-5.5 stroke-[2.2]" />
          </div>

          <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
            {tool.badge && (
              <span className="text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/90">
                {tool.badge}
              </span>
            )}

            {onToggleFavorite && (
              <button
                type="button"
                onClick={(e) => onToggleFavorite(e, tool.id)}
                className={`p-1.5 rounded-xl transition ${
                  isFavorite
                    ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                    : 'text-slate-300 hover:text-amber-400 hover:bg-slate-50'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star
                  className={`w-4 h-4 transition ${
                    isFavorite ? 'fill-amber-400' : ''
                  }`}
                />
              </button>
            )}
          </div>
        </div>

        {/* Category Label (clean micro-typography) */}
        {showCategoryBadge && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${styles.dotColor}`} />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors">
              {tool.categoryLabel || styles.label}
            </span>
          </div>
        )}

        {/* Tool Name */}
        <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-base leading-snug tracking-tight">
          {tool.name}
        </h3>

        {/* One/two line concise description with uniform height for perfect alignment */}
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2 min-h-[2.25rem]">
          {tool.shortDesc}
        </p>
      </div>

      {/* Card Action Footer */}
      <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
          <span>Client-Side</span>
        </span>

        <span className="font-bold text-blue-600 group-hover:text-blue-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          <span>Open Tool</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
