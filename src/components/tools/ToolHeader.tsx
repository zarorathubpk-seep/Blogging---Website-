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
      <nav className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
        <button
          type="button"
          onClick={() => {
            onNavigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="hover:text-blue-600 transition flex items-center gap-1"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <button
          type="button"
          onClick={() => {
            onNavigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="hover:text-blue-600 transition"
        >
          {tool.categoryLabel || styles.label}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-bold truncate max-w-xs">{tool.name}</span>
      </nav>

      {/* Main SaaS Hero Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4.5">
            {/* Colorful Modern Icon Container */}
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs ${styles.iconBg}`}
            >
              {IconComp ? (
                <IconComp className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
              ) : (
                <Sparkles className="w-7 h-7" />
              )}
            </div>

            {/* Title & Clear Purpose Description */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${styles.badgeBg}`}>
                  {tool.categoryLabel || styles.label}
                </span>

                {(badge || tool.badge) && (
                  <span className="bg-blue-50 text-blue-800 border border-blue-200/80 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                    {badge || tool.badge}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {customTitle || tool.name}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed pt-0.5">
                {customDescription || tool.longDesc || tool.shortDesc}
              </p>
            </div>
          </div>

          {/* Privacy & Instant Processing Badges */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 bg-blue-50/90 px-3.5 py-2 rounded-xl border border-blue-200/80 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-cyan-600 shrink-0" />
              <span>100% Client-Side • Private & Secure</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200">
              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Zero File Uploads • Instant Output</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
