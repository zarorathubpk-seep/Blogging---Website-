import React from 'react';
import { RotateCw, Trash2, Check, AlertCircle, RefreshCw, MoveLeft, MoveRight } from 'lucide-react';

export interface PdfPageThumbnailCardProps {
  pageNumber: number;
  thumbnailUrl?: string;
  status?: 'pending' | 'rendering' | 'ready' | 'error';
  errorMessage?: string;
  isSelected: boolean;
  isExcluded?: boolean;
  rotation?: number;
  width?: number;
  height?: number;
  orientation?: 'portrait' | 'landscape';
  onToggleSelect?: () => void;
  onToggleExclude?: () => void;
  onRotate?: () => void;
  onRemove?: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onRetry?: () => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  compact?: boolean;
}

export const PdfPageThumbnailCard: React.FC<PdfPageThumbnailCardProps> = ({
  pageNumber,
  thumbnailUrl,
  status = 'ready',
  errorMessage,
  isSelected,
  isExcluded = false,
  rotation = 0,
  width,
  height,
  orientation = 'portrait',
  onToggleSelect,
  onToggleExclude,
  onRotate,
  onRemove,
  onMoveLeft,
  onMoveRight,
  onRetry,
  canMoveLeft = false,
  canMoveRight = false,
  compact = false,
}) => {
  const isRendering = status === 'rendering' || (!thumbnailUrl && status !== 'error');
  const hasError = status === 'error';

  return (
    <div
      className={`group relative rounded-xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
        isExcluded
          ? 'bg-[#141519] border-slate-800 opacity-50 grayscale'
          : isSelected
          ? 'bg-[#1B1D22] border-[#D4AF37] ring-1 ring-[#D4AF37]/50 shadow-lg shadow-[#D4AF37]/10'
          : 'bg-[#16181D] border-slate-800/80 hover:border-slate-700 hover:bg-[#1B1D22]'
      }`}
    >
      {/* Top Header: Page Number Badge & Selection Checkbox */}
      <div className="flex items-center justify-between p-2.5 z-10 bg-[#101114]/80 backdrop-blur-xs border-b border-slate-800/60">
        <div className="flex items-center gap-1.5">
          {onToggleSelect && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect();
              }}
              className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-[#D4AF37] text-[#101114]'
                  : 'bg-[#101114] border border-slate-600 hover:border-[#D4AF37]'
              }`}
              title={isSelected ? 'Unselect page' : 'Select page'}
              aria-label={`Select page ${pageNumber}`}
            >
              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>
          )}

          <span className="text-xs font-mono font-bold text-[#F5F5F5] px-1.5 py-0.5 rounded bg-[#1B1D22] border border-slate-800">
            #{pageNumber}
          </span>
        </div>

        {/* Rotate & Exclude/Remove Quick Actions */}
        <div className="flex items-center gap-1">
          {rotation > 0 && (
            <span className="text-[10px] font-mono text-[#E6C768] px-1 bg-[#D4AF37]/15 rounded">
              {rotation}°
            </span>
          )}
          {onRotate && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRotate();
              }}
              className="p-1 rounded text-[#B5B8BE] hover:text-[#D4AF37] hover:bg-[#101114] transition cursor-pointer"
              title="Rotate 90° clockwise"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-1 rounded text-[#B5B8BE] hover:text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
              title="Remove page"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Thumbnail Viewport with crisp white paper surface */}
      <div
        className={`relative w-full ${
          compact ? 'h-36' : 'h-48'
        } p-2.5 flex items-center justify-center bg-[#101114] overflow-hidden select-none`}
        onClick={onToggleSelect}
      >
        {isRendering ? (
          <div className="flex flex-col items-center justify-center gap-2 text-center p-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin" />
            <span className="text-[11px] font-medium text-[#B5B8BE]">Loading preview...</span>
          </div>
        ) : hasError ? (
          <div className="flex flex-col items-center justify-center gap-2 p-3 text-center">
            <AlertCircle className="w-6 h-6 text-rose-400" />
            <span className="text-[11px] text-rose-300 font-medium">
              {errorMessage || 'Preview unavailable'}
            </span>
            {onRetry && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRetry();
                }}
                className="mt-1 px-2.5 py-1 text-[11px] font-semibold text-[#101114] bg-[#D4AF37] rounded-md hover:bg-[#E6C768] transition flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            )}
          </div>
        ) : thumbnailUrl ? (
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-200"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <img
              src={thumbnailUrl}
              alt={`Page ${pageNumber}`}
              className="max-h-full max-w-full object-contain rounded-xs shadow-md bg-white border border-slate-300/40"
              loading="lazy"
            />
          </div>
        ) : null}

        {/* Excluded Overlay */}
        {isExcluded && (
          <div className="absolute inset-0 bg-[#101114]/75 flex items-center justify-center">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded border border-rose-500/30">
              Excluded
            </span>
          </div>
        )}
      </div>

      {/* Footer Info & Ordering Controls */}
      <div className="p-2 bg-[#121317] border-t border-slate-800 flex items-center justify-between text-[11px] text-[#B5B8BE]">
        <div className="flex items-center gap-1">
          {canMoveLeft && onMoveLeft && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveLeft();
              }}
              className="p-1 rounded text-[#B5B8BE] hover:text-[#F5F5F5] hover:bg-[#1B1D22] transition cursor-pointer"
              title="Move left"
            >
              <MoveLeft className="w-3.5 h-3.5" />
            </button>
          )}
          {canMoveRight && onMoveRight && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveRight();
              }}
              className="p-1 rounded text-[#B5B8BE] hover:text-[#F5F5F5] hover:bg-[#1B1D22] transition cursor-pointer"
              title="Move right"
            >
              <MoveRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onToggleExclude && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExclude();
              }}
              className={`text-[10px] font-medium transition cursor-pointer ${
                isExcluded
                  ? 'text-[#D4AF37] hover:underline'
                  : 'text-[#B5B8BE] hover:text-rose-400'
              }`}
            >
              {isExcluded ? 'Include' : 'Exclude'}
            </button>
          )}

          {width && height && (
            <span className="font-mono text-[10px] text-slate-500">
              {width}×{height}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
