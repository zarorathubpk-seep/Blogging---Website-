import React, { useState, useEffect } from 'react';
import {
  Download,
  FileCheck,
  RotateCcw,
  Sparkles,
  Archive,
  Image,
} from 'lucide-react';
import {
  sanitizeFileName,
  ensureFileExtension,
} from '../../utils/fileNaming';
import { downloadBytesAsFile } from '../../services/pdfEngine';

interface PdfDownloadSectionProps {
  processedBytes: Uint8Array | null;
  defaultFileName: string;
  targetExtension?: 'pdf' | 'zip' | 'png' | 'jpg';
  statusMessage?: string | null;
  fileSizeBytes?: number;
  originalSizeBytes?: number;
  pageCount?: number;
  onReset?: () => void;
  className?: string;
}

export const PdfDownloadSection: React.FC<PdfDownloadSectionProps> = ({
  processedBytes,
  defaultFileName,
  targetExtension = 'pdf',
  statusMessage,
  originalSizeBytes,
  pageCount,
  onReset,
  className = '',
}) => {
  // Strip extension for the user-facing text input field so user edits the base name cleanly
  const initialBase = defaultFileName.replace(/\.[^/.]+$/, '');
  const [customName, setCustomName] = useState<string>(initialBase);

  // Sync if defaultFileName changes
  useEffect(() => {
    const clean = defaultFileName.replace(/\.[^/.]+$/, '');
    setCustomName(clean);
  }, [defaultFileName]);

  if (!processedBytes) return null;

  // Compute final sanitized filename
  const cleanBase = sanitizeFileName(customName, 'toolcrest_document');
  const finalFullName = ensureFileExtension(cleanBase, targetExtension);

  const handleDownload = () => {
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      zip: 'application/zip',
      png: 'image/png',
      jpg: 'image/jpeg',
    };
    const mimeType = mimeTypes[targetExtension] || 'application/pdf';
    downloadBytesAsFile(processedBytes, finalFullName, mimeType);
  };

  const handleResetName = () => {
    setCustomName(initialBase);
  };

  const calculatedSizeKb = (processedBytes.length / 1024).toFixed(1);
  const savingsPercent =
    originalSizeBytes && originalSizeBytes > processedBytes.length
      ? Math.round(((originalSizeBytes - processedBytes.length) / originalSizeBytes) * 100)
      : null;

  return (
    <div
      className={`bg-gradient-to-br from-[#12192c] via-[#0d1322] to-[#070b14] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-amber-500/10 space-y-5 animate-fadeIn text-slate-100 ${className}`}
    >
      {/* Top Banner Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/25">
            {targetExtension === 'zip' ? (
              <Archive className="w-5 h-5" />
            ) : targetExtension === 'png' || targetExtension === 'jpg' ? (
              <Image className="w-5 h-5 text-slate-950" />
            ) : (
              <FileCheck className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-white">
                File Ready for Download
              </span>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border border-amber-500/40">
                Ready
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {statusMessage || 'Your document was compiled and optimized locally in your browser.'}
            </p>
          </div>
        </div>

        {/* Metadata Badges */}
        <div className="flex items-center gap-2 flex-wrap text-[11px] font-medium text-slate-300">
          <span className="bg-[#080c18] px-3 py-1 rounded-lg border border-amber-500/30 shadow-xs font-mono font-bold text-amber-300">
            {calculatedSizeKb} KB
          </span>
          {savingsPercent && (
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg font-bold">
              -{savingsPercent}% Saved
            </span>
          )}
          {pageCount && (
            <span className="bg-[#080c18] px-2.5 py-1 rounded-lg border border-amber-500/30 text-slate-300 shadow-xs">
              {pageCount} {pageCount === 1 ? 'Page' : 'Pages'}
            </span>
          )}
          <span className="bg-amber-500 text-slate-950 px-2 py-1 rounded-lg uppercase font-black text-[10px] shadow-xs">
            .{targetExtension}
          </span>
        </div>
      </div>

      {/* Editable File Name Input Box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Customize Output File Name</span>
          </label>
          {customName !== initialBase && (
            <button
              type="button"
              onClick={handleResetName}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset default name
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Enter your custom file name..."
              className="w-full text-xs sm:text-sm font-semibold text-white bg-[#070b14] border border-amber-500/40 rounded-xl px-3.5 py-2.5 pr-14 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 focus:outline-hidden shadow-inner transition"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-amber-400/80 uppercase select-none">
              .{targetExtension}
            </span>
          </div>

          <button
            type="button"
            onClick={handleDownload}
            className="px-6 sm:px-8 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-98 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/25 transition flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Download</span>
          </button>
        </div>

        {/* Real-time sanitized preview */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5 px-1">
          <span>
            Output file:{' '}
            <strong className="font-mono text-amber-300 font-bold">
              {finalFullName}
            </strong>
          </span>
          <span className="hidden sm:inline text-slate-500">
            Invalid characters auto-sanitized
          </span>
        </div>
      </div>

      {/* Start Over Button if requested */}
      {onReset && (
        <div className="pt-1 flex justify-end">
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-amber-400/80 hover:text-amber-300 font-semibold transition cursor-pointer"
          >
            ← Upload another file
          </button>
        </div>
      )}
    </div>
  );
};
