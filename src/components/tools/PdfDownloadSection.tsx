import React, { useState, useEffect } from 'react';
import {
  Download,
  FileCheck,
  CheckCircle2,
  FileText,
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
  fileSizeBytes,
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
  const originalSizeKb = originalSizeBytes ? (originalSizeBytes / 1024).toFixed(1) : null;
  const savingsPercent =
    originalSizeBytes && originalSizeBytes > processedBytes.length
      ? Math.round(((originalSizeBytes - processedBytes.length) / originalSizeBytes) * 100)
      : null;

  return (
    <div
      className={`bg-gradient-to-br from-emerald-50/80 via-white to-slate-50 border-2 border-emerald-300 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5 animate-fadeIn ${className}`}
    >
      {/* Top Banner Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-emerald-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
            {targetExtension === 'zip' ? (
              <Archive className="w-5 h-5" />
            ) : targetExtension === 'png' || targetExtension === 'jpg' ? (
              <Image className="w-5 h-5" />
            ) : (
              <FileCheck className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-slate-900">
                File Ready for Download
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Success
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {statusMessage || 'Your document was compiled and optimized locally in your browser.'}
            </p>
          </div>
        </div>

        {/* Metadata Badges */}
        <div className="flex items-center gap-2 flex-wrap text-[11px] font-medium text-slate-600">
          <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs font-mono font-bold text-slate-800">
            {calculatedSizeKb} KB
          </span>
          {savingsPercent && (
            <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg font-bold">
              -{savingsPercent}% Saved
            </span>
          )}
          {pageCount && (
            <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              {pageCount} {pageCount === 1 ? 'Page' : 'Pages'}
            </span>
          )}
          <span className="bg-slate-900 text-white px-2 py-1 rounded-lg uppercase font-bold text-[10px]">
            .{targetExtension}
          </span>
        </div>
      </div>

      {/* Editable File Name Input Box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Customize Output File Name</span>
          </label>
          {customName !== initialBase && (
            <button
              type="button"
              onClick={handleResetName}
              className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" /> Reset default name
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Enter your custom file name..."
              className="w-full text-xs sm:text-sm font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 pr-14 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-hidden shadow-2xs transition"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 uppercase select-none">
              .{targetExtension}
            </span>
          </div>

          <button
            type="button"
            onClick={handleDownload}
            className="px-5 sm:px-7 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center gap-2 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>

        {/* Real-time sanitized preview */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5 px-1">
          <span>
            Downloaded file:{' '}
            <strong className="font-mono text-emerald-800 font-bold">
              {finalFullName}
            </strong>
          </span>
          <span className="hidden sm:inline text-slate-400">
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
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold transition"
          >
            ← Upload another file
          </button>
        </div>
      )}
    </div>
  );
};
