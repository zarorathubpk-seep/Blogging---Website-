import React from 'react';
import { ChevronRight, ShieldCheck, Zap, Lock, Sparkles, Home } from 'lucide-react';
import { ToolItem } from '../../data/toolsData';
import { getCategoryStyles, TOOL_ICON_MAP } from './ToolCard';
import { useTheme } from '../../context/ThemeContext';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const styles = getCategoryStyles(tool.category);
  const IconComp = TOOL_ICON_MAP[tool.iconName];

  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigation */}
      <nav className={`flex items-center gap-2 text-xs flex-wrap ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        <button
          type="button"
          onClick={() => {
            onNavigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`transition flex items-center gap-1 cursor-pointer ${
            isDark ? 'hover:text-amber-300' : 'hover:text-amber-700'
          }`}
        >
          <Home className="w-3.5 h-3.5 text-amber-500" />
          <span>Home</span>
        </button>
        <ChevronRight className={`w-3.5 h-3.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
        <button
          type="button"
          onClick={() => {
            onNavigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`transition cursor-pointer ${
            isDark ? 'hover:text-amber-300' : 'hover:text-amber-700'
          }`}
        >
          {tool.categoryLabel || styles.label}
        </button>
        <ChevronRight className={`w-3.5 h-3.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
        <span className={`font-bold truncate max-w-xs ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
          {tool.name}
        </span>
      </nav>

      {/* Main SaaS Hero Header Card */}
      <div
        className={`rounded-3xl p-6 sm:p-8 relative overflow-hidden transition-colors duration-200 border ${
          isDark
            ? 'bg-slate-900 border-amber-500/25 shadow-xl text-slate-100'
            : 'bg-white border-slate-200/90 shadow-sm text-slate-900'
        }`}
      >
        {/* Subtle decorative gold ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4.5">
            {/* Framed Icon Container */}
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border flex items-center justify-center shrink-0 shadow-lg ${
                isDark
                  ? `${styles.iconBg}`
                  : 'bg-amber-100/90 border-amber-300 text-amber-800 shadow-sm'
              }`}
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
                <span
                  className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                    isDark
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}
                >
                  {tool.categoryLabel || styles.label}
                </span>

                {(badge || tool.badge) && (
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      isDark
                        ? 'bg-amber-400/20 text-yellow-200 border-amber-400/40'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}
                  >
                    {badge || tool.badge}
                  </span>
                )}
              </div>

              <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {customTitle || tool.name}
              </h1>

              <p className={`text-xs sm:text-sm max-w-2xl leading-relaxed pt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {customDescription || tool.longDesc || tool.shortDesc}
              </p>
            </div>
          </div>

          {/* Privacy & Instant Processing Badges */}
          <div
            className={`flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <div
              className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl border shadow-xs ${
                isDark
                  ? 'text-amber-200 bg-slate-950/80 border-amber-500/30'
                  : 'text-amber-900 bg-amber-50 border-amber-300/80'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
              <span>100% Client-Side • Private &amp; Secure</span>
            </div>
            <div
              className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-xl border ${
                isDark
                  ? 'text-slate-300 bg-slate-950/80 border-slate-800'
                  : 'text-slate-700 bg-slate-50 border-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Instant Local Processing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
