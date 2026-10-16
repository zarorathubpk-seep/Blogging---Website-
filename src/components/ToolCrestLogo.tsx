import React from 'react';

interface ToolCrestLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'compact' | 'icon-only';
  showTagline?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
}

export const ToolCrestLogo: React.FC<ToolCrestLogoProps> = ({
  size = 'md',
  variant = 'full',
  showTagline = true,
  theme = 'light',
  className = '',
}) => {
  const iconDimensions = {
    xs: 'w-6 h-6',
    sm: 'w-7.5 h-7.5',
    md: 'w-9.5 h-9.5',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const isDark = theme === 'dark';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Vector Crest Icon */}
      <div className={`relative ${iconDimensions[size]} shrink-0 flex items-center justify-center transition-transform hover:scale-105 duration-200`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
        >
          <defs>
            <linearGradient id="tcLogoShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="50%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
            <linearGradient id="tcLogoCyanGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
            <linearGradient id="tcLogoFacetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.98" />
              <stop offset="100%" stopColor="#E0E7FF" stopOpacity="0.88" />
            </linearGradient>
            <linearGradient id="tcLogoInnerSpark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E40AF" />
              <stop offset="100%" stopColor="#6D28D9" />
            </linearGradient>
          </defs>

          {/* Hexagonal Crest Shield Base */}
          <path
            d="M24 3.5 L43 12.8 V29.5 C43 37.8 34.6 43.8 24 46.5 C13.4 43.8 5 37.8 5 29.5 V12.8 L24 3.5 Z"
            fill="url(#tcLogoShieldGrad)"
          />

          {/* Top Cyan Apex Precision Highlight */}
          <path
            d="M24 3.5 L43 12.8 L38.5 15 L24 8 L9.5 15 L5 12.8 L24 3.5 Z"
            fill="url(#tcLogoCyanGlow)"
            opacity="0.95"
          />

          {/* Crisp Shield Bevel Ring */}
          <path
            d="M24 5.5 L41 13.8 V28.8 C41 36 33.5 41.5 24 44 C14.5 41.5 7 36 7 28.8 V13.8 L24 5.5 Z"
            stroke="white"
            strokeOpacity="0.22"
            strokeWidth="1.2"
          />

          {/* Inner Precision Facet / Stylized Apex Tool */}
          <path
            d="M24 13 L33 20 V29 L24 34 L15 29 V20 L24 13 Z"
            fill="url(#tcLogoFacetGrad)"
          />

          {/* Center Precision Diamond Core */}
          <path
            d="M24 18.5 L27.5 24 L24 29.5 L20.5 24 Z"
            fill="url(#tcLogoInnerSpark)"
          />

          {/* Cyan Focal Precision Spark */}
          <circle cx="24" cy="24" r="1.8" fill="#06B6D4" />
        </svg>
      </div>

      {/* Brand Typography */}
      {variant !== 'icon-only' && (
        <div className="flex flex-col leading-none">
          <div className={`font-black tracking-tight ${textSizes[size]} flex items-center`}>
            <span className={isDark ? 'text-white' : 'text-slate-900'}>Tool</span>
            <span className="ml-0.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent font-extrabold">
              Crest
            </span>
          </div>

          {showTagline && variant === 'full' && (
            <span className={`text-[9px] font-extrabold uppercase tracking-widest mt-0.5 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Online Tools Platform
            </span>
          )}
        </div>
      )}
    </div>
  );
};
