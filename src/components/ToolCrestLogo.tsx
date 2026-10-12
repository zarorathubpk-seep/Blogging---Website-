import React from 'react';

interface ToolCrestLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const ToolCrestLogo: React.FC<ToolCrestLogoProps> = ({
  size = 'md',
  showTagline = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Geometric Crest Mark Icon */}
      <div className={`relative ${iconSizes[size]} shrink-0 flex items-center justify-center`}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-2xs"
        >
          <defs>
            <linearGradient id="crestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
            <linearGradient id="crestInner" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Hexagonal Crest Shield Base */}
          <path
            d="M20 3L35 11.5V28.5L20 37L5 28.5V11.5L20 3Z"
            fill="url(#crestGrad)"
            rx="4"
          />

          {/* Subtle Outer Highlight Stroke */}
          <path
            d="M20 4.5L33.5 12.2V27.8L20 35.5L6.5 27.8V12.2L20 4.5Z"
            stroke="white"
            strokeOpacity="0.25"
            strokeWidth="1.2"
          />

          {/* Inner Facet / Stylized Tool & Apex Peak */}
          <path
            d="M20 10L27 16V24L20 28L13 24V16L20 10Z"
            fill="url(#crestInner)"
            fillOpacity="0.9"
          />

          {/* Center Precision Dot / Diamond Accent */}
          <circle cx="20" cy="19" r="2.5" fill="#047857" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col leading-none">
        <div className={`font-black tracking-tight ${textSizes[size]} text-slate-900 flex items-center`}>
          <span>Tool</span>
          <span className="text-emerald-700 font-extrabold ml-0.5">Crest</span>
        </div>
        {showTagline && (
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mt-0.5">
            Online Tools & Guides
          </span>
        )}
      </div>
    </div>
  );
};
