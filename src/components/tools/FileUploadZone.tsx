import React, { useState, useRef, useEffect, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, FileText, AlertCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  title?: string;
  subtitle?: string;
  compact?: boolean;
  disabled?: boolean;
  className?: string;
  fileTypeLabel?: string;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFilesSelected,
  accept = '.pdf,application/pdf',
  multiple = false,
  maxFiles = 50,
  maxSizeMB = 100,
  title,
  subtitle,
  compact = false,
  disabled = false,
  className = '',
  fileTypeLabel,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [dragCounter, setDragCounter] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Global window listener: prevent browser from opening dropped files if dropped outside upload zone
  useEffect(() => {
    const handleWindowDragOver = (e: MouseEvent) => {
      e.preventDefault();
    };
    const handleWindowDrop = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('dragover', handleWindowDragOver as any);
    window.addEventListener('drop', handleWindowDrop as any);

    return () => {
      window.removeEventListener('dragover', handleWindowDragOver as any);
      window.removeEventListener('drop', handleWindowDrop as any);
    };
  }, []);

  const validateAndFilterFiles = (incomingFiles: FileList | File[]): File[] => {
    setErrorMessage(null);
    const filesArray = Array.from(incomingFiles);

    if (filesArray.length === 0) return [];

    if (!multiple && filesArray.length > 1) {
      setErrorMessage('This tool accepts one document at a time. Processing the first file.');
      filesArray.splice(1);
    } else if (multiple && filesArray.length > maxFiles) {
      setErrorMessage(`Maximum ${maxFiles} files allowed at once. Processing first ${maxFiles} files.`);
      filesArray.splice(maxFiles);
    }

    const acceptedTokens = accept
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const validFiles: File[] = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    for (const file of filesArray) {
      // Check file size
      if (file.size > maxSizeBytes) {
        setErrorMessage(
          `File "${file.name}" exceeds the maximum allowed size of ${maxSizeMB}MB.`
        );
        continue;
      }

      // Check file extension / MIME
      if (acceptedTokens.length > 0 && !acceptedTokens.includes('*') && !acceptedTokens.includes('*/*')) {
        const fileName = file.name.toLowerCase();
        const fileType = (file.type || '').toLowerCase();

        const matches = acceptedTokens.some((token) => {
          if (token.startsWith('.')) {
            return fileName.endsWith(token);
          }
          if (token.endsWith('/*')) {
            const prefix = token.replace('/*', '');
            return fileType.startsWith(prefix);
          }
          return fileType === token;
        });

        if (!matches) {
          setErrorMessage(
            `"${file.name}" is not a supported file type. Accepted: ${fileTypeLabel || accept}`
          );
          continue;
        }
      }

      validFiles.push(file);
    }

    return validFiles;
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setDragCounter((prev) => prev + 1);
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setDragCounter((prev) => {
      const next = prev - 1;
      if (next <= 0) {
        setIsDragOver(false);
        return 0;
      }
      return next;
    });
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    if (!isDragOver) {
      setIsDragOver(true);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragCounter(0);
    if (disabled) return;

    if (e.dataTransfer && e.dataTransfer.files) {
      const valid = validateAndFilterFiles(e.dataTransfer.files);
      if (valid.length > 0) {
        onFilesSelected(valid);
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const valid = validateAndFilterFiles(e.target.files);
      if (valid.length > 0) {
        onFilesSelected(valid);
      }
    }
    // Reset file input so selecting the same file again triggers change event
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const defaultTitle = multiple
    ? 'Choose or drag files here'
    : 'Choose or drag your document here';
  const defaultSubtitle = `100% Client-Side Processing • Max ${maxSizeMB}MB • Zero Cloud Uploads`;

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
        />
        <div
          onClick={() => !disabled && fileInputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-200 select-none ${
            isDragOver
              ? 'border-amber-400 bg-amber-500/15 scale-[1.01] shadow-lg shadow-amber-500/20'
              : isDark
              ? 'border-amber-500/30 hover:border-amber-400 bg-[#0e1424]/70 hover:bg-amber-500/5'
              : 'border-amber-300 hover:border-amber-500 bg-amber-50/50 hover:bg-amber-100/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-400">
            <UploadCloud className={`w-4 h-4 ${isDragOver ? 'animate-bounce' : ''}`} />
            <span>{isDragOver ? 'Drop files here!' : title || 'Add more files (click or drag & drop)'}</span>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-2 text-[11px] text-rose-400 flex items-center gap-1.5 font-medium animate-fadeIn">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />

      <div
        onClick={() => !disabled && fileInputRef.current?.click()}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 select-none group relative overflow-hidden ${
          isDragOver
            ? 'border-amber-400 bg-amber-500/20 shadow-2xl shadow-amber-500/25 scale-[1.01]'
            : isDark
            ? 'border-amber-500/35 hover:border-amber-400 bg-[#070a14]/90 hover:bg-amber-500/5'
            : 'border-amber-300 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50/80 shadow-xs'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {/* Visual Pulse Wave on Drag Over */}
        {isDragOver && (
          <div className="absolute inset-0 bg-radial from-amber-400/20 to-transparent pointer-events-none animate-pulse" />
        )}

        <div
          className={`w-16 h-16 rounded-2xl border shadow-md flex items-center justify-center mx-auto mb-4 transition-transform duration-200 ${
            isDragOver ? 'scale-110' : 'group-hover:scale-105'
          } ${
            isDark
              ? 'bg-[#0e1424] border-amber-500/30 group-hover:border-amber-400 text-amber-400'
              : 'bg-amber-100 border-amber-300 group-hover:border-amber-400 text-amber-800'
          }`}
        >
          <UploadCloud className={`w-8 h-8 ${isDragOver ? 'animate-bounce text-amber-300' : ''}`} />
        </div>

        <h3 className={`text-base sm:text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {isDragOver ? 'Drop files here to upload!' : title || defaultTitle}
        </h3>

        <p className={`text-xs mt-1.5 max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {subtitle || defaultSubtitle}
        </p>

        <div className="mt-5 flex items-center justify-center gap-3">
          <span
            className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2 ${
              isDark
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-300'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Choose Files from Device</span>
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 font-medium animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
