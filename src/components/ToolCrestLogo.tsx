import React from 'react';

interface ToolCrestLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'compact' | 'icon-only';
  showTagline?: boolean;
  theme?: 'dark' | 'light' | 'auto';
  className?: string;
}

export const ToolCrestLogo: React.FC<ToolCrestLogoProps> = ({
  size = 'md',
  variant = 'full',
  showTagline = true,
  theme = 'dark',
  className = '',
}) => {
  const iconDimensions = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-13 h-13',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const isLight = theme === 'light';

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Precision Masterpiece: 24K Gold Royal Crest */}
      <div
        className={`relative ${iconDimensions[size]} shrink-0 flex items-center justify-center transition-transform hover:scale-105 duration-300 group`}
      >
        {/* Ambient Golden Corona Halo */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/25 via-yellow-400/20 to-amber-600/25 rounded-2xl blur-md opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10 drop-shadow-[0_4px_12px_rgba(245,158,11,0.35)]"
        >
          <defs>
            {/* Ultra-Luxe 24K Gold Multi-Stop Metallic Gradient */}
            <linearGradient id="tcRoyalGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="18%" stopColor="#FDE68A" />
              <stop offset="38%" stopColor="#F59E0B" />
              <stop offset="55%" stopColor="#FEF3C7" />
              <stop offset="78%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>

            {/* Deep Obsidian Titanium Core Gradient */}
            <linearGradient id="tcObsidianBase" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E2433" />
              <stop offset="50%" stopColor="#0F1422" />
              <stop offset="100%" stopColor="#070A12" />
            </linearGradient>

            {/* Radiant Gold Shimmer for Crown & Apex */}
            <linearGradient id="tcGoldCrownGleam" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="35%" stopColor="#FBBF24" />
              <stop offset="50%" stopColor="#FFFDF5" />
              <stop offset="70%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>

            {/* Subtle Drop Shadow for Inner Elements */}
            <filter id="tcInnerGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#F59E0B" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Outer Heraldic Shield Contour (Dark Obsidian Base) */}
          <path
            d="M32 4 L56 16 V38 C56 49.5 45.5 57.5 32 61 C18.5 57.5 8 49.5 8 38 V16 L32 4 Z"
            fill="url(#tcObsidianBase)"
          />

          {/* Exterior 24K Gold Beveled Rim */}
          <path
            d="M32 4 L56 16 V38 C56 49.5 45.5 57.5 32 61 C18.5 57.5 8 49.5 8 38 V16 L32 4 Z"
            stroke="url(#tcRoyalGoldGrad)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Concentric Interior Precision Gold Accent Line */}
          <path
            d="M32 9 L51 19 V37 C51 46 42.5 52.5 32 55.5 C21.5 52.5 13 46 13 37 V19 L32 9 Z"
            stroke="url(#tcRoyalGoldGrad)"
            strokeWidth="1"
            strokeOpacity="0.75"
            strokeDasharray="1 0"
          />

          {/* Imperial Chevron Crown Apex */}
          <path
            d="M32 14 L44 23 L32 30 L20 23 Z"
            fill="url(#tcGoldCrownGleam)"
            filter="url(#tcInnerGlow)"
          />

          {/* Interlocking Monogram/T-Crest Stylized Jewel Columns */}
          <path
            d="M30 26 H34 V45 H30 Z"
            fill="url(#tcRoyalGoldGrad)"
          />
          <path
            d="M23 27 H41 V31 H23 Z"
            fill="url(#tcRoyalGoldGrad)"
          />

          {/* Dynamic Faceted Left Wing Chevron */}
          <path
            d="M19 28 L27 34 L25 38 L17 32 Z"
            fill="url(#tcRoyalGoldGrad)"
            opacity="0.9"
          />

          {/* Dynamic Faceted Right Wing Chevron */}
          <path
            d="M45 28 L37 34 L39 38 L47 32 Z"
            fill="url(#tcRoyalGoldGrad)"
            opacity="0.9"
          />

          {/* Center 8-Point Brilliant Cut Diamond Star */}
          <path
            d="M32 33 L34 37 L38 38 L34 39 L32 43 L30 39 L26 38 L30 37 Z"
            fill="#FFFFFF"
          />

          {/* Lower Crest Diamond Accent Anchor */}
          <path
            d="M32 48 L35 51 L32 54 L29 51 Z"
            fill="url(#tcRoyalGoldGrad)"
          />

          {/* Apex Glint Highlight */}
          <circle cx="32" cy="14" r="1.5" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Brand Typography (Dark & Golden Harmony) */}
      {variant !== 'icon-only' && (
        <div className="flex flex-col leading-none">
          <div className={`font-black tracking-tight ${textSizes[size]} flex items-center`}>
            <span className={isLight ? 'text-slate-900' : 'text-slate-100 font-extrabold tracking-tight'}>
              Tool
            </span>
            <span className="ml-1 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent font-black tracking-tight drop-shadow-[0_2px_6px_rgba(245,158,11,0.25)]">
              Crest
            </span>
          </div>

          {showTagline && variant === 'full' && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs text-amber-400 font-bold">✦</span>
              <span
                className={`text-xs font-bold tracking-wider ${
                  isLight ? 'text-slate-600' : 'text-amber-200/90'
                }`}
              >
                Premium Tools Platform
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
