import React from 'react';
import { ChevronRight, ShieldCheck, Zap, Lock, Sparkles, Home } from 'lucide-react';
import { ToolItem } from '../../data/toolsData';
import { getCategoryStyles, TOOL_ICON_MAP } from './ToolCard';

interface ToolHeaderProps {
  tool: ToolItem;
  onNavigate: (path: string) => void;
  badge?: string;
  customTitle?: string;
  customDescription?: string;
}

export const ToolHeader: React.FC<ToolHeaderProps> = ({
  tool,
  onNavigate,
  badge,
  customTitle,
  customDescription,
}) => {
  const styles = getCategoryStyles(tool.category);
  const IconComp = TOOL_ICON_MAP[tool.iconName];

  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
        <button
          type="button"
          onClick={() => {
            onNavigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="hover:text-amber-400 transition flex items-center gap-1 cursor-pointer"
        >
          <Home className="w-3.5 h-3.5 text-amber-400" />
          <span>Home</span>
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <button
          type="button"
          onClick={() => {
            onNavigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="hover:text-amber-400 transition cursor-pointer"
        >
          {tool.categoryLabel || styles.label}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-amber-300 font-bold truncate max-w-xs">{tool.name}</span>
      </nav>

      {/* Main SaaS Hero Header Card (Dark & Gold Luxury) */}
      <div className="bg-slate-900 border border-amber-500/25 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle decorative gold ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4.5">
            {/* Metallic Gold Framed Icon Container */}
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border flex items-center justify-center shrink-0 shadow-lg ${styles.iconBg}`}
            >
              {IconComp ? (
                <IconComp className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
              ) : (
                <Sparkles className="w-7 h-7" />
              )}
            </div>

            {/* Title & Clear Purpose Description */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {tool.categoryLabel || styles.label}
                </span>

                {(badge || tool.badge) && (
                  <span className="bg-amber-400/20 text-yellow-200 border border-amber-400/40 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                    {badge || tool.badge}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                {customTitle || tool.name}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed pt-0.5">
                {customDescription || tool.longDesc || tool.shortDesc}
              </p>
            </div>
          </div>

          {/* Privacy & Instant Processing Badges in Dark & Gold */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-200 bg-slate-950/80 px-3.5 py-2 rounded-xl border border-amber-500/30 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>100% Client-Side • Private & Secure</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-slate-800">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Instant Local Processing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
