import React, { useState, useRef } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import {
  UploadCloud,
  Layers,
  RotateCw,
  Trash2,
  MoveLeft,
  MoveRight,
  Copy,
  Download,
  Loader2,
  CheckCircle2,
  FileText,
  AlertCircle,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { ToolHeader } from './ToolHeader';
import { RelatedToolsSection } from './RelatedToolsSection';
import { FaqSection } from '../FaqSection';
import { downloadBytesAsFile } from '../../services/pdfEngine';
import { getSuggestedDefaultFileName } from '../../utils/fileNaming';

interface OrganizePdfToolProps {
  onNavigate: (path: string) => void;
}

interface PageItem {
  id: string;
  originalIndex: number;
  rotation: number;
  label: string;
}

export const OrganizePdfTool: React.FC<OrganizePdfToolProps> = ({ onNavigate }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [processedBytes, setProcessedBytes] = useState<Uint8Array | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (selectedFile: File) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      setProcessedBytes(null);

      const buffer = await selectedFile.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = doc.getPageCount();

      const initialPages: PageItem[] = Array.from({ length: count }, (_, idx) => ({
        id: `page-${idx}-${Date.now()}`,
        originalIndex: idx,
        rotation: 0,
        label: `Page ${idx + 1}`,
      }));

      setPdfDoc(doc);
      setPages(initialPages);
      setFile(selectedFile);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to read PDF document.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const movePage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= pages.length) return;
    const updated = [...pages];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setPages(updated);
    setProcessedBytes(null);
  };

  const rotatePage = (index: number) => {
    setPages((prev) =>
      prev.map((p, i) => (i === index ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
    );
    setProcessedBytes(null);
  };

  const rotateAllPages = () => {
    setPages((prev) => prev.map((p) => ({ ...p, rotation: (p.rotation + 90) % 360 })));
    setProcessedBytes(null);
  };

  const deletePage = (index: number) => {
    if (pages.length <= 1) {
      setErrorMessage('A PDF must contain at least one page.');
      return;
    }
    setPages((prev) => prev.filter((_, i) => i !== index));
    setProcessedBytes(null);
  };

  const duplicatePage = (index: number) => {
    const item = pages[index];
    const dup: PageItem = {
      id: `page-${item.originalIndex}-dup-${Date.now()}`,
      originalIndex: item.originalIndex,
      rotation: item.rotation,
      label: `${item.label} (Copy)`,
    };
    const updated = [...pages];
    updated.splice(index + 1, 0, dup);
    setPages(updated);
    setProcessedBytes(null);
  };

  const resetPages = () => {
    if (!pdfDoc) return;
    const count = pdfDoc.getPageCount();
    setPages(
      Array.from({ length: count }, (_, idx) => ({
        id: `page-${idx}-${Date.now()}`,
        originalIndex: idx,
        rotation: 0,
        label: `Page ${idx + 1}`,
      }))
    );
    setProcessedBytes(null);
  };

  const handleGeneratePdf = async () => {
    if (!pdfDoc || pages.length === 0) return;
    try {
      setIsProcessing(true);
      setErrorMessage(null);

      const targetDoc = await PDFDocument.create();

      for (const item of pages) {
        const [copiedPage] = await targetDoc.copyPages(pdfDoc, [item.originalIndex]);
        if (item.rotation !== 0) {
          const currentRotation = copiedPage.getRotation().angle;
          copiedPage.setRotation(degrees((currentRotation + item.rotation) % 360));
        }
        targetDoc.addPage(copiedPage);
      }

      const bytes = await targetDoc.save({ useObjectStreams: true });
      setProcessedBytes(bytes);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to reorder and save PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedBytes || !file) return;
    const outputName = getSuggestedDefaultFileName(file.name, 'organized');
    downloadBytesAsFile(processedBytes, outputName);
  };

  const faqs = [
    {
      question: 'How does the Organize PDF tool work?',
      answer:
        'Upload your PDF and every page is displayed in an interactive visual grid. You can drag or move pages forward and backward, rotate upside-down or sideways pages by 90°, delete unwanted pages, and duplicate important sections before saving.',
    },
    {
      question: 'Are my pages uploaded to an external server?',
      answer:
        'No. ToolCrest executes all PDF reordering, rendering, and rebuilding 100% locally in your web browser. Your private documents never leave your computer.',
    },
    {
      question: 'Can I duplicate or delete multiple pages?',
      answer:
        'Yes. You can delete any individual page with a single click, or duplicate pages with the copy button to repeat them in contracts or slide decks.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      <ToolHeader
        title="Organize PDF"
        subtitle="Sort, reorder, rotate, duplicate, and delete pages in an interactive visual workspace."
        badge="New"
        badgeColor="rose"
        onBack={() => onNavigate('/')}
      />

      {!file ? (
        /* Upload Area */
        <div className="bg-white border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-3xl p-10 text-center transition-all duration-300 shadow-sm hover:shadow-md">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200/80 flex items-center justify-center text-rose-600 shadow-xs">
              <Layers className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Select a PDF to Organize Pages</h3>
              <p className="text-xs text-slate-500 mt-1">
                Visual thumbnail workspace • Reorder, rotate, delete, or duplicate pages locally
              </p>
            </div>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading Document...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Choose PDF File</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-400">100% In-Browser • Zero Cloud Uploads • Max file size: 100MB</p>
          </div>
        </div>
      ) : (
        /* Interactive Page Organization Grid */
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-600" />
                <span>{file.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                  {pages.length} Pages
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Use arrows to move pages, rotate sideways scans, or delete unwanted pages.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={rotateAllPages}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5"
                title="Rotate all pages clockwise by 90 degrees"
              >
                <RotateCw className="w-3.5 h-3.5 text-rose-600" />
                <span>Rotate All</span>
              </button>
              <button
                type="button"
                onClick={resetPages}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5"
                title="Reset to original order"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPages([]);
                  setProcessedBytes(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl text-rose-600 hover:bg-rose-50 transition"
              >
                Change File
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Pages Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pages.map((item, idx) => (
              <div
                key={item.id}
                className="relative group bg-slate-50 border-2 border-slate-200 hover:border-blue-500 rounded-2xl p-3 flex flex-col items-center justify-between transition-all hover:shadow-md"
              >
                {/* Page Position Badge */}
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs">
                    #{idx + 1}
                  </span>
                  {item.rotation !== 0 && (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                      {item.rotation}°
                    </span>
                  )}
                </div>

                {/* Simulated Visual Sheet Preview */}
                <div
                  className="w-24 h-32 bg-white border border-slate-200 rounded-lg shadow-2xs flex flex-col justify-between p-2 my-2 transition-transform duration-200"
                  style={{ transform: `rotate(${item.rotation}deg)` }}
                >
                  <div className="space-y-1">
                    <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
                    <div className="w-16 h-1 bg-slate-200 rounded-full" />
                    <div className="w-14 h-1 bg-slate-200 rounded-full" />
                    <div className="w-10 h-1 bg-slate-200 rounded-full" />
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 text-center">
                    {item.label}
                  </div>
                </div>

                {/* Per-Page Controls */}
                <div className="w-full pt-2 border-t border-slate-200/80 flex items-center justify-between gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => movePage(idx, idx - 1)}
                    className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/80 disabled:opacity-30 disabled:pointer-events-none transition"
                    title="Move page left"
                  >
                    <MoveLeft className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => rotatePage(idx)}
                    className="p-1 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Rotate 90 degrees"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => duplicatePage(idx)}
                    className="p-1 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition"
                    title="Duplicate page"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => deletePage(idx)}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete page"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={idx === pages.length - 1}
                    onClick={() => movePage(idx, idx + 1)}
                    className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/80 disabled:opacity-30 disabled:pointer-events-none transition"
                    title="Move page right"
                  >
                    <MoveRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Execution Bar */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs text-slate-500">
              Total {pages.length} pages will be compiled in this exact arrangement.
            </span>

            <div className="flex items-center gap-3">
              {!processedBytes ? (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleGeneratePdf}
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Layers className="w-4 h-4" />
                      <span>Save & Reorganize PDF</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer animate-pulse"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Reorganized PDF</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FAQs */}
      <FaqSection faqs={faqs} />

      {/* Related Tools */}
      <RelatedToolsSection
        currentToolSlug="organize-pdf"
        category="pdf"
        onNavigate={onNavigate}
      />
    </div>
  );
};
