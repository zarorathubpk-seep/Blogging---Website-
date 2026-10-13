import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  UploadCloud,
  Layers,
  Split,
  CheckCircle2,
  FileText,
  Trash2,
  Download,
  AlertCircle,
  Loader2,
  Archive,
  Image,
  Check,
  Plus,
  RotateCw,
  Sparkles,
  Sliders,
  CheckSquare,
  Square,
  ArrowRight,
  ShieldCheck,
  Grid,
  FileCheck,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { TOOLS_DATA } from '../../data/toolsData';
import { ToolHeader } from './ToolHeader';
import { RelatedToolsSection } from './RelatedToolsSection';
import { FaqSection } from '../FaqSection';
import {
  getPdfDocumentSummary,
  renderPageThumbnail,
  PageInfo,
  PdfDocumentSummary,
} from '../../services/pdfThumbnailRenderer';
import {
  extractPagesToSinglePdf,
  extractPagesToSeparatePdfsZip,
  splitEveryPageToZip,
  splitCustomRanges,
  exportSelectedPagesAsImagesZip,
  CustomRangeItem,
} from '../../services/advancedPdfSplitter';
import {
  sanitizeFileName,
  ensureFileExtension,
  getSuggestedDefaultFileName,
} from '../../utils/fileNaming';
import { PdfDownloadSection } from './PdfDownloadSection';

interface AdvancedSplitPdfToolProps {
  onNavigate: (path: string) => void;
}

type SplitTabMode =
  | 'individual' // Option 1 & 4: Select individual / visual pages
  | 'ranges'     // Option 2: Custom page ranges
  | 'every'      // Option 3: Split every page
  | 'images';    // Option 5: Export selected pages as images

export const AdvancedSplitPdfTool: React.FC<AdvancedSplitPdfToolProps> = ({
  onNavigate,
}) => {
  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [docSummary, setDocSummary] = useState<PdfDocumentSummary | null>(null);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tab mode
  const [activeTab, setActiveTab] = useState<SplitTabMode>('individual');

  // Thumbnail cache & thumbnail size
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [thumbnailSize, setThumbnailSize] = useState<'sm' | 'md' | 'lg'>('md');

  // Option 1 & 4 state: Individual pages selected (1-based index)
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [individualExportMode, setIndividualExportMode] = useState<'merged' | 'zip'>(
    'merged'
  );

  // Option 2 state: Custom page ranges
  const [ranges, setRanges] = useState<CustomRangeItem[]>([
    { id: 'r-1', name: 'Part 1', start: 1, end: 2 },
  ]);
  const [rangeExportMode, setRangeExportMode] = useState<'merged' | 'zip'>('merged');

  // Option 5 state: Image export settings
  const [imageFormat, setImageFormat] = useState<'png' | 'jpeg'>('png');
  const [imageQuality, setImageQuality] = useState<number>(0.92);
  const [imageScale, setImageScale] = useState<number>(2.0);
  const [imageProgress, setImageProgress] = useState<{ current: number; total: number } | null>(
    null
  );

  // Result state for download
  const [processedResult, setProcessedResult] = useState<{
    bytes: Uint8Array;
    targetExt: 'pdf' | 'zip';
    suggestedName: string;
    message: string;
    pageCount?: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle file drop/upload
  const handleSelectFile = async (uploadedFile: File) => {
    if (!uploadedFile.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Please select a valid PDF file.');
      return;
    }

    setFile(uploadedFile);
    setIsLoadingDoc(true);
    setErrorMessage(null);
    setProcessedResult(null);
    setThumbnails({});

    try {
      const summary = await getPdfDocumentSummary(uploadedFile);
      setDocSummary(summary);

      // Default selection: select all pages initially or first 2 pages
      const total = summary.pageCount;
      if (total <= 5) {
        setSelectedPages(Array.from({ length: total }, (_, i) => i + 1));
      } else {
        setSelectedPages([1, 2]);
      }

      // Initialize default range
      setRanges([
        { id: `r-${Date.now()}`, name: 'Section 1', start: 1, end: Math.min(3, total) },
      ]);

      // Lazy load first batch of thumbnails asynchronously
      loadThumbnails(uploadedFile, summary);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err?.message || 'Failed to inspect PDF. Ensure the file is not password-protected.'
      );
      setFile(null);
      setDocSummary(null);
    } finally {
      setIsLoadingDoc(false);
    }
  };

  // Asynchronously render thumbnails
  const loadThumbnails = async (pdfFile: File, summary: PdfDocumentSummary) => {
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      // Render up to first 24 pages immediately, rest lazily
      const count = Math.min(summary.pageCount, 30);
      for (let i = 1; i <= count; i++) {
        const pageInfo = summary.pages[i - 1];
        renderPageThumbnail(arrayBuffer, i, pageInfo, 0.45).then((dataUrl) => {
          setThumbnails((prev) => ({ ...prev, [i]: dataUrl }));
        });
      }
    } catch (err) {
      console.warn('Thumbnail rendering process noticed:', err);
    }
  };

  // Toggle page selection
  const togglePageSelection = (pageNum: number) => {
    setSelectedPages((prev) =>
      prev.includes(pageNum) ? prev.filter((p) => p !== pageNum) : [...prev, pageNum].sort((a, b) => a - b)
    );
    setProcessedResult(null);
  };

  // Selection actions
  const handleSelectAll = () => {
    if (!docSummary) return;
    setSelectedPages(Array.from({ length: docSummary.pageCount }, (_, i) => i + 1));
    setProcessedResult(null);
  };

  const handleDeselectAll = () => {
    setSelectedPages([]);
    setProcessedResult(null);
  };

  const handleInvertSelection = () => {
    if (!docSummary) return;
    const all = Array.from({ length: docSummary.pageCount }, (_, i) => i + 1);
    setSelectedPages(all.filter((p) => !selectedPages.includes(p)));
    setProcessedResult(null);
  };

  // Custom range helpers
  const handleAddRange = () => {
    if (!docSummary) return;
    const last = ranges[ranges.length - 1];
    const newStart = last ? Math.min(last.end + 1, docSummary.pageCount) : 1;
    const newEnd = Math.min(newStart + 2, docSummary.pageCount);
    const newRange: CustomRangeItem = {
      id: `range-${Date.now()}`,
      name: `Part ${ranges.length + 1}`,
      start: newStart,
      end: newEnd,
    };
    setRanges([...ranges, newRange]);
    setProcessedResult(null);
  };

  const handleRemoveRange = (id: string) => {
    if (ranges.length <= 1) return;
    setRanges(ranges.filter((r) => r.id !== id));
    setProcessedResult(null);
  };

  const handleUpdateRange = (id: string, updates: Partial<CustomRangeItem>) => {
    setRanges(
      ranges.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, ...updates };
        // Bounds checking
        if (docSummary) {
          updated.start = Math.max(1, Math.min(updated.start, docSummary.pageCount));
          updated.end = Math.max(1, Math.min(updated.end, docSummary.pageCount));
        }
        return updated;
      })
    );
    setProcessedResult(null);
  };

  // Main Action Executor
  const handleProcessSplit = async () => {
    if (!file || !docSummary) return;
    setIsProcessing(true);
    setErrorMessage(null);
    setProcessedResult(null);
    setImageProgress(null);

    const baseName = file.name.replace(/\.[^/.]+$/, '');

    try {
      if (activeTab === 'individual') {
        // Option 1 & 4
        if (selectedPages.length === 0) {
          throw new Error('Please select at least one page to extract.');
        }

        if (individualExportMode === 'merged') {
          const bytes = await extractPagesToSinglePdf(file, selectedPages);
          const suggested = getSuggestedDefaultFileName(file.name, 'split-pdf', 'extracted');
          setProcessedResult({
            bytes,
            targetExt: 'pdf',
            suggestedName: suggested,
            message: `Extracted ${selectedPages.length} selected pages into a single PDF document.`,
            pageCount: selectedPages.length,
          });
        } else {
          // Download as individual PDFs inside a ZIP
          const zipBytes = await extractPagesToSeparatePdfsZip(
            file,
            selectedPages,
            `${baseName}_pages`
          );
          setProcessedResult({
            bytes: zipBytes,
            targetExt: 'zip',
            suggestedName: `${baseName}_selected_pages`,
            message: `Created ZIP archive with ${selectedPages.length} individual PDF files.`,
            pageCount: selectedPages.length,
          });
        }
      } else if (activeTab === 'ranges') {
        // Option 2: Custom Ranges
        if (ranges.length === 0) {
          throw new Error('Please define at least one page range.');
        }

        const isMerged = rangeExportMode === 'merged';
        const res = await splitCustomRanges(file, ranges, isMerged, baseName);

        setProcessedResult({
          bytes: res.bytes,
          targetExt: res.isZip ? 'zip' : 'pdf',
          suggestedName: res.isZip ? `${baseName}_ranges` : `${baseName}_custom_ranges`,
          message: isMerged
            ? `Merged ${ranges.length} custom ranges into a unified PDF document.`
            : `Packaged ${ranges.length} range PDF documents inside a ZIP archive.`,
        });
      } else if (activeTab === 'every') {
        // Option 3: Split Every Page
        const zipBytes = await splitEveryPageToZip(file, baseName);
        setProcessedResult({
          bytes: zipBytes,
          targetExt: 'zip',
          suggestedName: `${baseName}_all_pages`,
          message: `Successfully split all ${docSummary.pageCount} pages into individual PDF files in a ZIP archive.`,
          pageCount: docSummary.pageCount,
        });
      } else if (activeTab === 'images') {
        // Option 5: Export as Images
        if (selectedPages.length === 0) {
          throw new Error('Please select at least one page to export as images.');
        }

        const zipBytes = await exportSelectedPagesAsImagesZip(
          file,
          selectedPages,
          imageFormat,
          imageQuality,
          imageScale,
          `${baseName}_images`,
          (curr, tot) => setImageProgress({ current: curr, total: tot })
        );

        setProcessedResult({
          bytes: zipBytes,
          targetExt: 'zip',
          suggestedName: `${baseName}_${imageFormat.toUpperCase()}_images`,
          message: `Rendered and packaged ${selectedPages.length} pages as high-resolution ${imageFormat.toUpperCase()} images in a ZIP archive.`,
          pageCount: selectedPages.length,
        });
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Error executing split operation.');
    } finally {
      setIsProcessing(false);
      setImageProgress(null);
    }
  };

  return (
    <div className="py-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* 1. UNIFIED TOOL HEADER */}
      <ToolHeader
        tool={
          TOOLS_DATA.find((t) => t.id === 'split-pdf') || {
            id: 'split-pdf',
            name: 'Advanced Split PDF',
            slug: 'split-pdf',
            category: 'pdf',
            categoryLabel: 'PDF Suite',
            shortDesc: 'Extract individual pages, custom page ranges, or split every page into a ZIP.',
            longDesc: 'Complete control over PDF pages: select visual thumbnails, custom ranges, split every page, or export pages as high-resolution images.',
            iconName: 'Split',
            badge: 'Popular',
            keywords: ['split', 'extract', 'pdf', 'ranges'],
          }
        }
        onNavigate={onNavigate}
        badge="5 Split Modes"
      />

      {/* Upload Dropzone if no file selected */}
      {!file && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) {
              handleSelectFile(e.dataTransfer.files[0]);
            }
          }}
          className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/20 rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition space-y-4 group"
        >
          <div className="w-16 h-16 rounded-3xl bg-white text-slate-400 group-hover:text-emerald-600 border border-slate-200 group-hover:border-emerald-300 flex items-center justify-center mx-auto shadow-2xs transition group-hover:scale-105">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base">
              Drop your PDF here, or <span className="text-emerald-700 underline">browse files</span>
            </h3>
            <p className="text-xs text-slate-500">
              Supports single or multi-page documents. All processing executes securely in your browser.
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => {
              if (e.target.files?.[0]) handleSelectFile(e.target.files[0]);
            }}
            className="hidden"
          />
        </div>
      )}

      {/* Loading Document Indicator */}
      {isLoadingDoc && (
        <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-700">
            Analyzing document structure and preparing page previews...
          </p>
        </div>
      )}

      {/* Active Document Workspace */}
      {file && docSummary && !isLoadingDoc && (
        <div className="space-y-6">
          {/* Document Header Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate max-w-sm sm:max-w-md">
                  {file.name}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                  <span className="font-mono font-bold text-slate-700">
                    {docSummary.pageCount} Total Pages
                  </span>
                  <span>•</span>
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setFile(null);
                setDocSummary(null);
                setProcessedResult(null);
              }}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Change Document
            </button>
          </div>

          {/* Mode Selector Tabs (5 Options from user brief) */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-3 shadow-xs space-y-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('individual');
                  setProcessedResult(null);
                }}
                className={`px-4 py-2.5 rounded-2xl transition whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'individual'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span>Option 1 & 4: Visual Page Selection</span>
                <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {selectedPages.length} Selected
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('ranges');
                  setProcessedResult(null);
                }}
                className={`px-4 py-2.5 rounded-2xl transition whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'ranges'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Option 2: Custom Page Ranges</span>
                <span className="bg-slate-200/60 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-full">
                  {ranges.length} Ranges
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('every');
                  setProcessedResult(null);
                }}
                className={`px-4 py-2.5 rounded-2xl transition whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'every'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Option 3: Split Every Page</span>
                <span className="bg-slate-200/60 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-full">
                  ZIP
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('images');
                  setProcessedResult(null);
                }}
                className={`px-4 py-2.5 rounded-2xl transition whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'images'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Image className="w-4 h-4" />
                <span>Option 5: Export as Images</span>
                <span className="bg-slate-200/60 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-full">
                  PNG/JPG
                </span>
              </button>
            </div>
          </div>

          {/* TAB 1 & 4: Visual Thumbnail Grid & Individual Selection */}
          {(activeTab === 'individual' || activeTab === 'images') && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
              {/* Toolbar: Select All / Deselect / Invert / Thumbnail Size */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 mr-1">
                    Selection ({selectedPages.length} of {docSummary.pageCount} pages):
                  </span>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="px-2.5 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="px-2.5 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                  >
                    Deselect All
                  </button>
                  <button
                    type="button"
                    onClick={handleInvertSelection}
                    className="px-2.5 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                  >
                    Invert Selection
                  </button>
                </div>

                {/* Sub-options for individual extract */}
                {activeTab === 'individual' && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 font-semibold">Output Mode:</span>
                    <div className="flex bg-slate-100 p-0.5 rounded-xl font-bold">
                      <button
                        type="button"
                        onClick={() => setIndividualExportMode('merged')}
                        className={`px-3 py-1 rounded-lg transition ${
                          individualExportMode === 'merged'
                            ? 'bg-white text-emerald-800 shadow-2xs'
                            : 'text-slate-600'
                        }`}
                      >
                        1 Combined PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => setIndividualExportMode('zip')}
                        className={`px-3 py-1 rounded-lg transition ${
                          individualExportMode === 'zip'
                            ? 'bg-white text-emerald-800 shadow-2xs'
                            : 'text-slate-600'
                        }`}
                      >
                        Separate PDFs in ZIP
                      </button>
                    </div>
                  </div>
                )}

                {/* Image configuration for Tab 5 */}
                {activeTab === 'images' && (
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-600 font-bold">Format:</span>
                      <select
                        value={imageFormat}
                        onChange={(e) => setImageFormat(e.target.value as 'png' | 'jpeg')}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 font-bold text-slate-800"
                      >
                        <option value="png">PNG (Lossless)</option>
                        <option value="jpeg">JPG / JPEG</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-600 font-bold">Resolution:</span>
                      <select
                        value={imageScale}
                        onChange={(e) => setImageScale(Number(e.target.value))}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 font-bold text-slate-800"
                      >
                        <option value={1.0}>1x Standard (72 DPI)</option>
                        <option value={1.5}>1.5x Enhanced (108 DPI)</option>
                        <option value={2.0}>2x High Res (144 DPI)</option>
                        <option value={3.0}>3x Ultra Crisp (216 DPI)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Responsive Page Thumbnails Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-[520px] overflow-y-auto p-1">
                {docSummary.pages.map((p) => {
                  const isSelected = selectedPages.includes(p.pageNumber);
                  const thumb = thumbnails[p.pageNumber];

                  return (
                    <div
                      key={p.pageNumber}
                      onClick={() => togglePageSelection(p.pageNumber)}
                      className={`relative rounded-2xl border-2 overflow-hidden cursor-pointer transition select-none group flex flex-col ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/30 shadow-xs'
                          : 'border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-100/50'
                      }`}
                    >
                      {/* Checkbox overlay badge */}
                      <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition shadow-2xs ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white/90 text-transparent border border-slate-300 group-hover:border-slate-400'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      </div>

                      {/* Page number badge top right */}
                      <div className="absolute top-2 right-2 z-10">
                        <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Page {p.pageNumber}
                        </span>
                      </div>

                      {/* Thumbnail Image display */}
                      <div className="w-full h-44 sm:h-48 bg-white flex items-center justify-center overflow-hidden p-2">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={`Page ${p.pageNumber}`}
                            className="max-h-full max-w-full object-contain shadow-2xs rounded transition group-hover:scale-102"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-300">
                            <FileText className="w-10 h-10 animate-pulse text-slate-200" />
                            <span className="text-[10px] font-mono mt-1 text-slate-400">
                              Rendering...
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Bottom Footer Info */}
                      <div className="p-2 bg-white/90 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                        <span className="font-bold text-slate-700">
                          {p.orientation === 'landscape' ? 'Landscape' : 'Portrait'}
                        </span>
                        <span className="font-mono">
                          {p.width}×{p.height}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Custom Page Ranges */}
          {activeTab === 'ranges' && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Define Custom Extraction Ranges
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add ranges like Pages 1–5, 8–12, or 16–20. Total document has {docSummary.pageCount} pages.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-semibold">Output Mode:</span>
                  <div className="flex bg-slate-100 p-0.5 rounded-xl font-bold">
                    <button
                      type="button"
                      onClick={() => setRangeExportMode('merged')}
                      className={`px-3 py-1 rounded-lg transition ${
                        rangeExportMode === 'merged'
                          ? 'bg-white text-emerald-800 shadow-2xs'
                          : 'text-slate-600'
                      }`}
                    >
                      Merge into 1 PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => setRangeExportMode('zip')}
                      className={`px-3 py-1 rounded-lg transition ${
                        rangeExportMode === 'zip'
                          ? 'bg-white text-emerald-800 shadow-2xs'
                          : 'text-slate-600'
                      }`}
                    >
                      Separate PDF per Range in ZIP
                    </button>
                  </div>
                </div>
              </div>

              {/* Ranges List */}
              <div className="space-y-3">
                {ranges.map((r, index) => (
                  <div
                    key={r.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        value={r.name}
                        onChange={(e) => handleUpdateRange(r.id, { name: e.target.value })}
                        placeholder="Range label (e.g. Chapter 1)"
                        className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 w-36"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs">
                        <label className="text-slate-500 font-semibold">From Page:</label>
                        <input
                          type="number"
                          min={1}
                          max={docSummary.pageCount}
                          value={r.start}
                          onChange={(e) =>
                            handleUpdateRange(r.id, { start: Number(e.target.value) })
                          }
                          className="w-16 bg-white border border-slate-200 rounded-xl px-2 py-1.5 font-bold text-center"
                        />
                      </div>

                      <span className="text-slate-400 font-bold">&rarr;</span>

                      <div className="flex items-center gap-1.5 text-xs">
                        <label className="text-slate-500 font-semibold">To Page:</label>
                        <input
                          type="number"
                          min={1}
                          max={docSummary.pageCount}
                          value={r.end}
                          onChange={(e) =>
                            handleUpdateRange(r.id, { end: Number(e.target.value) })
                          }
                          className="w-16 bg-white border border-slate-200 rounded-xl px-2 py-1.5 font-bold text-center"
                        />
                      </div>

                      <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                        {Math.max(1, Math.abs(r.end - r.start) + 1)} pages
                      </span>

                      {ranges.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRange(r.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                          title="Delete Range"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddRange}
                className="w-full py-2.5 border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/30 rounded-2xl text-xs font-bold text-slate-700 hover:text-emerald-800 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-emerald-600" /> Add Another Page Range
              </button>
            </div>
          )}

          {/* TAB 3: Split Every Page Option */}
          {activeTab === 'every' && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <Archive className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Split Entire Document into Separate 1-Page PDFs
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Every page from 1 to {docSummary.pageCount} will be compiled into its own individual PDF and packaged into a ZIP file.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-700">
                <span>Output Archive format:</span>
                <span className="font-mono font-bold text-slate-900">
                  {docSummary.pageCount} PDF files inside .ZIP
                </span>
              </div>
            </div>
          )}

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Execute Split Button */}
          {!processedResult && (
            <button
              type="button"
              onClick={handleProcessSplit}
              disabled={isProcessing}
              className="w-full py-3.5 px-6 text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 active:scale-99 rounded-2xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Zap className="w-5 h-5 text-emerald-200" />
              )}
              {isProcessing
                ? imageProgress
                  ? `Rendering Page ${imageProgress.current} of ${imageProgress.total}...`
                  : 'Processing Document...'
                : activeTab === 'images'
                ? `Export ${selectedPages.length} Pages as ${imageFormat.toUpperCase()} Images`
                : activeTab === 'every'
                ? `Split All ${docSummary.pageCount} Pages into ZIP`
                : activeTab === 'ranges'
                ? `Extract ${ranges.length} Custom Ranges`
                : `Extract ${selectedPages.length} Selected Pages`}
            </button>
          )}

          {/* Clean Download Section with Editable File Name */}
          {processedResult && (
            <PdfDownloadSection
              processedBytes={processedResult.bytes}
              defaultFileName={processedResult.suggestedName}
              targetExtension={processedResult.targetExt}
              statusMessage={processedResult.message}
              pageCount={processedResult.pageCount}
              onReset={() => {
                setProcessedResult(null);
              }}
            />
          )}
        </div>
      )}

      {/* 3. HOW TO USE ADVANCED SPLIT PDF */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-600" />
          <span>How to Split PDF Files (5 Powerful Modes)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
              1
            </span>
            <h4 className="font-bold text-sm text-slate-900">Select Mode & Pages</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Click individual page thumbnails, type custom page ranges (e.g. 1-4, 8-10), or select split every single page.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
              2
            </span>
            <h4 className="font-bold text-sm text-slate-900">Choose Output Format</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Merge selected pages into one unified document, extract separate PDFs, or export pages as PNG/JPG images in a ZIP archive.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
              3
            </span>
            <h4 className="font-bold text-sm text-slate-900">Customize File Name</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your preferred custom file name before downloading. ToolCrest auto-sanitizes and applies proper file extensions.
            </p>
          </div>
        </div>
      </div>

      {/* 4. FAQS */}
      <FaqSection
        title="Frequently Asked Questions: Advanced Split PDF"
        subtitle="Learn more about page selection, range splitting, and image export capabilities."
        faqs={[
          {
            q: 'Can I select non-consecutive pages (e.g., 1, 3, 5, 9)?',
            a: 'Yes! In "Select Pages" mode, click any page thumbnails in any combination to extract exactly the pages you need.',
          },
          {
            q: 'How does multiple custom range splitting work?',
            a: 'In "Page Ranges" mode, click "Add Another Range" to define simultaneous page intervals (e.g., 1-3, 5-7, 10-12) and choose whether to merge them or download separate files.',
          },
          {
            q: 'Are exported PNG and JPG images full resolution?',
            a: 'Yes. Our high-resolution rendering pipeline exports crisp images with customizable 1x to 3x DPI settings, bundled cleanly in a single ZIP download.',
          },
          {
            q: 'Can I name the output ZIP or PDF files before downloading?',
            a: 'Yes. Every split mode includes an editable File Name box with real-time sanitized feedback before you click Download.',
          },
        ]}
      />

      {/* 5. RELATED TOOLS */}
      <RelatedToolsSection
        currentToolSlug="split-pdf"
        category="pdf"
        onNavigate={onNavigate}
      />
    </div>
  );
};
