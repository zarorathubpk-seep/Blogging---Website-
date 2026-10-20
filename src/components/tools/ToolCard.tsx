import React, { useState, useRef } from 'react';
import { ToolItem, ToolCategory } from '../../data/toolsData';
import { useTheme } from '../../context/ThemeContext';
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
  FileText,
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
  FileText,
};

interface ToolCardProps {
  tool: ToolItem;
  onSelect: (slug: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent, id: string) => void;
  showCategoryBadge?: boolean;
  compact?: boolean;
}

// Category visual styling harmonized with dark obsidian & metallic golden palette
export const getCategoryStyles = (category: ToolCategory) => {
  switch (category) {
    case 'pdf':
      return {
        topStripe: 'from-amber-400 via-yellow-300 to-amber-500',
        iconBg: 'bg-gradient-to-br from-amber-950/60 to-slate-950 border-amber-500/40 text-amber-400 group-hover:border-amber-300 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.25)]',
        badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        dotColor: 'bg-amber-400 shadow-[0_0_6px_#f59e0b]',
        accentText: 'text-amber-400',
        label: 'PDF Suite',
      };
    case 'qr':
      return {
        topStripe: 'from-amber-400 via-yellow-300 to-yellow-500',
        iconBg: 'bg-gradient-to-br from-amber-950/60 to-slate-950 border-amber-500/40 text-amber-300 group-hover:border-amber-300 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.25)]',
        badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        dotColor: 'bg-amber-400 shadow-[0_0_6px_#f59e0b]',
        accentText: 'text-amber-300',
        label: 'QR & Barcode',
      };
    case 'converters':
      return {
        topStripe: 'from-yellow-400 via-amber-400 to-amber-600',
        iconBg: 'bg-gradient-to-br from-amber-950/60 to-slate-950 border-amber-500/40 text-amber-400 group-hover:border-amber-300 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.25)]',
        badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        dotColor: 'bg-amber-400 shadow-[0_0_6px_#f59e0b]',
        accentText: 'text-amber-400',
        label: 'Converter',
      };
    case 'calculators':
      return {
        topStripe: 'from-amber-300 via-yellow-400 to-amber-500',
        iconBg: 'bg-gradient-to-br from-amber-950/60 to-slate-950 border-amber-500/40 text-amber-300 group-hover:border-amber-300 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.25)]',
        badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        dotColor: 'bg-amber-400 shadow-[0_0_6px_#f59e0b]',
        accentText: 'text-amber-300',
        label: 'Financial & Math',
      };
    case 'productivity':
      return {
        topStripe: 'from-yellow-300 via-amber-400 to-yellow-500',
        iconBg: 'bg-gradient-to-br from-amber-950/60 to-slate-950 border-amber-400/50 text-yellow-300 group-hover:border-yellow-300 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.25)]',
        badgeBg: 'bg-amber-500/15 text-yellow-300 border-amber-400/40',
        dotColor: 'bg-yellow-400 shadow-[0_0_6px_#eab308]',
        accentText: 'text-yellow-300',
        label: 'Productivity',
      };
    default:
      return {
        topStripe: 'from-amber-300 via-yellow-400 to-amber-500',
        iconBg: 'bg-gradient-to-br from-amber-950/60 to-slate-950 border-amber-500/40 text-amber-400 group-hover:border-amber-300',
        badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        dotColor: 'bg-amber-400 shadow-[0_0_6px_#f59e0b]',
        accentText: 'text-amber-400',
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [menuOpen, setMenuOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const IconComponent = TOOL_ICON_MAP[tool.iconName] || Layers;
  const styles = getCategoryStyles(tool.category);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/tools/${tool.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      setMenuOpen(false);
    });
  };

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
      className={`group relative border rounded-2xl shadow-xl transition-all duration-300 ease-out cursor-pointer flex flex-col justify-between hover:-translate-y-1 select-none h-full overflow-hidden ${
        isDark
          ? 'bg-gradient-to-b from-[#101626] via-[#0c101c] to-[#080b14] hover:from-[#141b2e] hover:via-[#0f1524] hover:to-[#0a0d18] border-amber-500/20 hover:border-amber-400/70 hover:shadow-[0_12px_32px_-6px_rgba(245,158,11,0.2)] text-slate-100'
          : 'bg-white hover:bg-amber-50/25 border-slate-200/90 hover:border-amber-400/80 shadow-sm hover:shadow-[0_12px_28px_-6px_rgba(217,119,6,0.15)] text-slate-900'
      } ${compact ? 'p-4' : 'p-5 sm:p-5.5'}`}
    >
      {/* Radiant 24K Gold Metallic Top Stripe */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${styles.topStripe} opacity-80 group-hover:opacity-100 transition-opacity duration-300`}
      />

      <div>
        {/* Top Bar: Icon + Badge + Favorite + More Options */}
        <div className="flex items-start justify-between gap-3 mb-3.5 pt-1">
          {/* Metallic Gold Framed Icon */}
          <div
            className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 shadow-md transition-all duration-300 ${
              isDark
                ? styles.iconBg
                : 'bg-gradient-to-br from-amber-50 to-amber-100/70 border-amber-300 text-amber-700 group-hover:border-amber-400 shadow-xs'
            }`}
          >
            <IconComponent className="w-6 h-6 stroke-[2.2]" />
          </div>

          <div className="flex items-center gap-3 shrink-0 pt-0.5">
            {tool.badge && (
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border shadow-xs mr-0.5 ${
                  tool.badge.toLowerCase() === 'new'
                    ? isDark
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : tool.badge.toLowerCase() === 'popular'
                    ? isDark
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                    : isDark
                    ? 'bg-sky-500/15 text-sky-300 border-sky-500/40'
                    : 'bg-sky-50 text-sky-800 border-sky-300'
                }`}
              >
                {tool.badge}
              </span>
            )}

            {/* Utility Action Buttons Group with Breathing Room */}
            <div className="flex items-center gap-1.5">
              {/* Favorite Star Button */}
              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={(e) => onToggleFavorite(e, tool.id)}
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  className={`p-1.5 rounded-xl transition cursor-pointer ${
                    isFavorite
                      ? 'text-amber-400 bg-amber-500/25 hover:bg-amber-500/35 border border-amber-400/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                      : isDark
                      ? 'text-slate-400 hover:text-amber-400 hover:bg-slate-800/80'
                      : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
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
                  aria-label="Tool options"
                  className={`p-1.5 rounded-xl transition cursor-pointer ${
                    isDark
                      ? 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/80'
                      : 'text-slate-400 hover:text-amber-700 hover:bg-slate-100'
                  }`}
                  title="Tool options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* Options Popover Menu */}
                {menuOpen && (
                  <div
                    className={`absolute right-0 top-full mt-1.5 w-44 rounded-xl shadow-2xl py-1 z-30 animate-fadeIn text-xs ${
                      isDark
                        ? 'bg-[#0a0d18] border border-amber-500/35 text-slate-200'
                        : 'bg-white border border-slate-200 text-slate-800 shadow-xl'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className={`w-full px-3 py-2 text-left flex items-center gap-2 transition cursor-pointer ${
                        isDark ? 'hover:bg-amber-500/10 hover:text-amber-300' : 'hover:bg-amber-50 hover:text-amber-800'
                      }`}
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-amber-500 font-bold">Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-amber-500" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleShare}
                      className={`w-full px-3 py-2 text-left flex items-center gap-2 transition cursor-pointer ${
                        isDark ? 'hover:bg-amber-500/10 hover:text-amber-300' : 'hover:bg-amber-50 hover:text-amber-800'
                      }`}
                    >
                      <Share2 className="w-3.5 h-3.5 text-amber-500" />
                      <span>Share Tool</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSpecsClick}
                      className={`w-full px-3 py-2 text-left flex items-center gap-2 transition border-t cursor-pointer ${
                        isDark
                          ? 'border-slate-800 hover:bg-amber-500/10 hover:text-amber-300'
                          : 'border-slate-100 hover:bg-amber-50 hover:text-amber-800'
                      }`}
                    >
                      <Info className="w-3.5 h-3.5 text-amber-500" />
                      <span>Quick Specs</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Category Label */}
        {showCategoryBadge && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${styles.dotColor}`} />
            <span
              className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                isDark ? 'text-amber-400 group-hover:text-amber-300' : 'text-amber-700 group-hover:text-amber-800'
              }`}
            >
              {tool.categoryLabel || styles.label}
            </span>
          </div>
        )}

        {/* Tool Name */}
        <h3
          className={`font-bold transition-colors text-base leading-snug tracking-tight ${
            isDark ? 'text-white group-hover:text-amber-300' : 'text-slate-900 group-hover:text-amber-800'
          }`}
        >
          {tool.name}
        </h3>

        {/* Concise Description */}
        <p className={`text-xs mt-1.5 leading-relaxed line-clamp-2 min-h-[2.25rem] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          {tool.shortDesc}
        </p>

        {/* Quick Specs Drawer */}
        {showSpecs && (
          <div
            className={`mt-2.5 p-2.5 rounded-xl border text-xs space-y-1 animate-fadeIn ${
              isDark ? 'bg-[#070a12] border-amber-500/30 text-slate-300' : 'bg-amber-50/80 border-amber-200 text-slate-700'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`font-bold flex items-center gap-1 text-xs ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
              <span>✦</span> Specifications
            </div>
            <div className="leading-normal text-xs">
              {tool.longDesc.substring(0, 115)}…
            </div>
          </div>
        )}
      </div>

      {/* Card Action Footer */}
      <div className={`pt-3.5 mt-3.5 border-t flex items-center justify-between text-xs ${isDark ? 'border-slate-800/80' : 'border-slate-100'}`}>
        <span className={`text-xs font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
          <span>Client-Side</span>
        </span>

        <span
          className={`font-bold flex items-center gap-1.5 group-hover:translate-x-1 transition-transform ${
            isDark ? 'text-amber-400 group-hover:text-amber-300' : 'text-amber-700 group-hover:text-amber-800'
          }`}
        >
          <span>Open Tool</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </span>
      </div>
    </div>
  );
};
