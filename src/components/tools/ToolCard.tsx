import React, { useState, useRef } from 'react';
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
  MoreVertical,
  Share2,
  Check,
  UploadCloud,
  Info,
  Wrench,
  LayoutGrid,
  Camera,
  Archive,
  Crop,
  CheckSquare,
  Sparkles,
  Languages,
  Table,
  Presentation,
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
  Wrench,
  LayoutGrid,
  Camera,
  Archive,
  Crop,
  CheckSquare,
  Sparkles,
  Languages,
  Table,
  Presentation,
};

interface ToolCardProps {
  tool: ToolItem;
  onSelect: (slug: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent, id: string) => void;
  showCategoryBadge?: boolean;
  compact?: boolean;
}

// Category visual styling: rich multi-tone gradients, crisp borders, and refined color harmony
export const getCategoryStyles = (category: ToolCategory) => {
  switch (category) {
    case 'pdf':
      return {
        topStripe: 'from-rose-500 to-orange-500',
        iconBg: 'bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-orange-500/10 border-rose-200/90 text-rose-600 group-hover:from-rose-500/20 group-hover:to-orange-500/20',
        badgeBg: 'bg-rose-50 text-rose-700 border-rose-200/80',
        dotColor: 'bg-rose-500',
        accentText: 'text-rose-600',
        cardHoverBorder: 'hover:border-rose-400/70',
        hoverGlow: 'group-hover:shadow-rose-500/10',
        label: 'PDF Suite',
      };
    case 'qr':
      return {
        topStripe: 'from-violet-500 to-purple-500',
        iconBg: 'bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-fuchsia-500/10 border-violet-200/90 text-violet-600 group-hover:from-violet-500/20 group-hover:to-purple-500/20',
        badgeBg: 'bg-violet-50 text-violet-700 border-violet-200/80',
        dotColor: 'bg-violet-500',
        accentText: 'text-violet-600',
        cardHoverBorder: 'hover:border-violet-400/70',
        hoverGlow: 'group-hover:shadow-violet-500/10',
        label: 'QR & Barcode',
      };
    case 'converters':
      return {
        topStripe: 'from-blue-500 to-cyan-500',
        iconBg: 'bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-sky-500/10 border-blue-200/90 text-blue-600 group-hover:from-blue-500/20 group-hover:to-cyan-500/20',
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200/80',
        dotColor: 'bg-blue-500',
        accentText: 'text-blue-600',
        cardHoverBorder: 'hover:border-blue-400/70',
        hoverGlow: 'group-hover:shadow-blue-500/10',
        label: 'Converter',
      };
    case 'calculators':
      return {
        topStripe: 'from-emerald-500 to-teal-500',
        iconBg: 'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border-emerald-200/90 text-emerald-700 group-hover:from-emerald-500/20 group-hover:to-teal-500/20',
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
        dotColor: 'bg-emerald-500',
        accentText: 'text-emerald-700',
        cardHoverBorder: 'hover:border-emerald-400/70',
        hoverGlow: 'group-hover:shadow-emerald-500/10',
        label: 'Financial & Math',
      };
    case 'productivity':
      return {
        topStripe: 'from-amber-500 to-orange-500',
        iconBg: 'bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10 border-amber-200/90 text-amber-700 group-hover:from-amber-500/20 group-hover:to-orange-500/20',
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200/80',
        dotColor: 'bg-amber-500',
        accentText: 'text-amber-700',
        cardHoverBorder: 'hover:border-amber-400/70',
        hoverGlow: 'group-hover:shadow-amber-500/10',
        label: 'Productivity',
      };
    case 'image':
      return {
        topStripe: 'from-cyan-500 to-teal-500',
        iconBg: 'bg-gradient-to-br from-cyan-500/10 via-teal-500/5 to-emerald-500/10 border-cyan-200/90 text-cyan-600 group-hover:from-cyan-500/20 group-hover:to-teal-500/20',
        badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
        dotColor: 'bg-cyan-500',
        accentText: 'text-cyan-600',
        cardHoverBorder: 'hover:border-cyan-400/70',
        hoverGlow: 'group-hover:shadow-cyan-500/10',
        label: 'Image & Media',
      };
    default:
      return {
        topStripe: 'from-indigo-500 to-blue-500',
        iconBg: 'bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border-indigo-200/90 text-indigo-600 group-hover:from-indigo-500/20 group-hover:to-blue-500/20',
        badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
        dotColor: 'bg-indigo-500',
        accentText: 'text-indigo-600',
        cardHoverBorder: 'hover:border-indigo-400/70',
        hoverGlow: 'group-hover:shadow-indigo-500/10',
        label: 'Utility',
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const IconComponent = TOOL_ICON_MAP[tool.iconName] || Layers;
  const styles = getCategoryStyles(tool.category);

  // Copy direct tool URL
  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/tools/${tool.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      setMenuOpen(false);
    });
  };

  // Share tool
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/tools/${tool.slug}`;
    if (navigator.share) {
      navigator.share({
        title: `${tool.name} — ToolCrest`,
        text: tool.shortDesc,
        url,
      }).catch(() => {});
    } else {
      handleCopyLink(e);
    }
    setMenuOpen(false);
  };

  const handleToggleOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  };

  const handleSpecsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSpecs((prev) => !prev);
    setMenuOpen(false);
  };

  return (
    <div
      onClick={() => onSelect(tool.slug)}
      className={`group relative bg-white border border-slate-200/80 ${styles.cardHoverBorder} rounded-2xl shadow-xs hover:shadow-xl ${styles.hoverGlow} transition-all duration-300 ease-out cursor-pointer flex flex-col justify-between hover:-translate-y-1 select-none h-full overflow-hidden ${
        compact ? 'p-4' : 'p-5 sm:p-5.5'
      }`}
    >
      {/* Top Accent Gradient Stripe that highlights on hover */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${styles.topStripe} opacity-40 group-hover:opacity-100 transition-opacity duration-300`}
      />

      <div>
        {/* Top Bar: Icon + Badge + Favorite + More Options Menu */}
        <div className="flex items-start justify-between gap-3 mb-3.5 pt-1">
          {/* Distinctive Dual-Tone Icon Container */}
          <div
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-108 transition-transform duration-300 ${styles.iconBg}`}
          >
            <IconComponent className="w-6 h-6 stroke-[2.2]" />
          </div>

          <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
            {tool.badge && (
              <span
                className={`text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full ${
                  tool.badge === 'Popular'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : tool.badge === 'New'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {tool.badge}
              </span>
            )}

            {/* Favorite Star Button */}
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
                  className={`w-4 h-4 transition ${isFavorite ? 'fill-amber-400' : ''}`}
                />
              </button>
            )}

            {/* More Options Dropdown Trigger */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={handleToggleOptions}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
                title="Tool options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Options Popover Menu */}
              {menuOpen && (
                <div
                  className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 animate-fadeIn text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Share Tool</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSpecsClick}
                    className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition border-t border-slate-100"
                  >
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    <span>Quick Specs</span>
                  </button>
                </div>
              )}
            </div>
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

        {/* Concise Description */}
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2 min-h-[2.25rem]">
          {tool.shortDesc}
        </p>

        {/* Quick Specs Drawer (if toggled) */}
        {showSpecs && (
          <div
            className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-bold text-slate-900">Key Features:</div>
            <div className="text-slate-500 leading-normal">
              {tool.longDesc.substring(0, 110)}…
            </div>
          </div>
        )}
      </div>

      {/* Card Footer: Metadata Tags + Primary Launch Button */}
      <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
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
