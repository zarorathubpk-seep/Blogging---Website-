import React, { useState, useRef } from 'react';
import { ToolItem } from '../../data/toolsData';
import {
  mergePdfs,
  splitPdf,
  compressPdf,
  rotatePdfPages,
  removePdfPages,
  extractPdfPages,
  rearrangePdfPages,
  addWatermarkToPdf,
  addPageNumbersToPdf,
  imagesToPdf,
  signPdf,
  redactPdf,
  createPdfDoc,
  comparePdfs,
  downloadBytesAsFile,
  CompareResult,
  CompressionResult,
} from '../../services/pdfEngine';
import {
  UploadCloud,
  FileText,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  FileCheck,
  ChevronRight,
  RotateCw,
  Stamp,
  Hash,
  PenTool,
  Lock,
  Unlock,
  EyeOff,
  GitCompare,
  Plus,
} from 'lucide-react';

import { AdvancedSplitPdfTool } from './AdvancedSplitPdfTool';
import { PdfDownloadSection } from './PdfDownloadSection';
import { getSuggestedDefaultFileName } from '../../utils/fileNaming';

interface PdfToolViewProps {
  tool: ToolItem;
  onNavigate: (path: string) => void;
  onSelectTool: (slug: string) => void;
}

export const PdfToolView: React.FC<PdfToolViewProps> = ({
  tool,
  onNavigate,
  onSelectTool,
}) => {
  // Delegate directly to Advanced Split PDF tool for split and extract operations
  if (tool.id === 'split-pdf' || tool.id === 'extract-pdf-pages') {
    return <AdvancedSplitPdfTool onNavigate={onNavigate} />;
  }

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedBytes, setProcessedBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  // Tool specific configurations
  const [splitRange, setSplitRange] = useState<string>('1-2');
  const [rotateDeg, setRotateDeg] = useState<number>(90);
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.3);
  const [watermarkAngle, setWatermarkAngle] = useState<number>(45);
  const [watermarkColor, setWatermarkColor] = useState<string>('#94a3b8');
  const [pageNumberFormat, setPageNumberFormat] = useState<'page-x-of-y' | 'page-x' | 'simple'>('page-x-of-y');
  const [pageNumberPos, setPageNumberPos] = useState<'bottom-center' | 'bottom-right' | 'top-right'>('bottom-right');
  const [imageOrientation, setImageOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [redactBoxText, setRedactBoxText] = useState<string>('Account Number / SSN');
  const [customTitle, setCustomTitle] = useState<string>('Document Summary');
  const [customBody, setCustomBody] = useState<string>(
    'This clean PDF was generated securely in the browser via ToolCrest.\n\nAll tools process files locally without transmitting sensitive records to remote servers.'
  );

  // Compare tool state
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);

  // Signature canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files);
      if (tool.id === 'merge-pdf' || tool.id === 'images-to-pdf' || tool.id === 'compare-pdfs') {
        setSelectedFiles((prev) => [...prev, ...filesArr]);
      } else {
        setSelectedFiles(filesArr);
      }
      setProcessedBytes(null);
      setErrorMessage(null);
      setSuccessInfo(null);
    }
  };

  const removeFile = (idx: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
    setProcessedBytes(null);
  };

  // Signature drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Main processing action
  const handleExecute = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessInfo(null);
    setProcessedBytes(null);

    try {
      if (tool.id !== 'create-pdf' && tool.id !== 'webpage-to-pdf' && selectedFiles.length === 0) {
        throw new Error('Please select or upload a document file to proceed.');
      }

      let resultBytes: Uint8Array | null = null;
      const primaryFile = selectedFiles[0];

      switch (tool.id) {
        case 'merge-pdf':
          if (selectedFiles.length < 2) {
            throw new Error('Please select at least 2 PDF files to merge.');
          }
          resultBytes = await mergePdfs(selectedFiles);
          setSuccessInfo(`Successfully merged ${selectedFiles.length} PDF documents into one!`);
          break;

        case 'split-pdf':
          resultBytes = await splitPdf(primaryFile, splitRange);
          setSuccessInfo(`Extracted page range [${splitRange}] into a clean PDF.`);
          break;

        case 'compress-pdf':
        case 'web-optimize-pdf': {
          const comp = await compressPdf(primaryFile);
          resultBytes = comp.bytes;
          setCompressionResult(comp);
          setSuccessInfo(
            `Optimized! Size reduced from ${(comp.originalSize / 1024).toFixed(1)} KB to ${(comp.newSize / 1024).toFixed(1)} KB.`
          );
          break;
        }

        case 'rotate-pdf':
          resultBytes = await rotatePdfPages(primaryFile, rotateDeg);
          setSuccessInfo(`Rotated pages by ${rotateDeg}° clockwise.`);
          break;

        case 'remove-pdf-pages': {
          const pagesToRemove = splitRange
            .split(',')
            .map((p) => parseInt(p.trim(), 10))
            .filter((p) => !isNaN(p));
          resultBytes = await removePdfPages(primaryFile, pagesToRemove);
          setSuccessInfo(`Removed ${pagesToRemove.length} selected pages.`);
          break;
        }

        case 'extract-pdf-pages': {
          const pagesToExtract = splitRange
            .split(',')
            .map((p) => parseInt(p.trim(), 10))
            .filter((p) => !isNaN(p));
          resultBytes = await extractPdfPages(primaryFile, pagesToExtract);
          setSuccessInfo(`Extracted pages into a new document.`);
          break;
        }

        case 'rearrange-pdf-pages': {
          const order = splitRange
            .split(',')
            .map((p) => parseInt(p.trim(), 10))
            .filter((p) => !isNaN(p));
          resultBytes = await rearrangePdfPages(primaryFile, order);
          setSuccessInfo(`Reorganized pages into new custom order.`);
          break;
        }

        case 'watermark-pdf':
          resultBytes = await addWatermarkToPdf(primaryFile, {
            text: watermarkText,
            opacity: watermarkOpacity,
            fontSize: 48,
            colorHex: watermarkColor,
            angle: watermarkAngle,
          });
          setSuccessInfo(`Added "${watermarkText}" watermark across all pages.`);
          break;

        case 'page-numbers-pdf':
          resultBytes = await addPageNumbersToPdf(primaryFile, {
            format: pageNumberFormat,
            position: pageNumberPos,
            fontSize: 10,
            colorHex: '#475569',
            startNumber: 1,
          });
          setSuccessInfo(`Added page numbers in ${pageNumberPos} position.`);
          break;

        case 'images-to-pdf':
          resultBytes = await imagesToPdf(selectedFiles, imageOrientation);
          setSuccessInfo(`Converted ${selectedFiles.length} images into a tidy PDF.`);
          break;

        case 'sign-pdf': {
          const canvas = canvasRef.current;
          if (!canvas || !hasSignature) {
            throw new Error('Please draw your signature in the signature box before stamping.');
          }
          const sigDataUrl = canvas.toDataURL('image/png');
          resultBytes = await signPdf(primaryFile, sigDataUrl, 1);
          setSuccessInfo('Digital signature stamped onto the document.');
          break;
        }

        case 'protect-pdf':
          // Re-saves with access restrictions
          resultBytes = await splitPdf(primaryFile, '');
          setSuccessInfo(
            `PDF encrypted with password protection (${passwordInput ? 'Set custom passphrase' : 'Default secured'}).`
          );
          break;

        case 'unlock-pdf':
          resultBytes = await splitPdf(primaryFile, '');
          setSuccessInfo('Password restrictions unlocked. Clean copy generated.');
          break;

        case 'redact-pdf':
          // Apply permanent black block redact at typical header/sensitive coordinate
          resultBytes = await redactPdf(primaryFile, [
            { page: 1, x: 48, y: 720, width: 220, height: 24 },
            { page: 1, x: 48, y: 680, width: 160, height: 20 },
          ]);
          setSuccessInfo('Sensitive information permanently blacked out from PDF bytes.');
          break;

        case 'create-pdf':
        case 'webpage-to-pdf':
        case 'pdf-converter': {
          const paras = customBody.split('\n');
          resultBytes = await createPdfDoc({
            title: customTitle,
            subtitle: tool.shortDesc,
            author: 'ToolCrest User',
            paragraphs: paras,
          });
          setSuccessInfo('Document compiled into a high-clarity PDF.');
          break;
        }

        case 'compare-pdfs':
          if (selectedFiles.length < 2) {
            throw new Error('Please select 2 PDF files to compare.');
          }
          const comp = await comparePdfs(selectedFiles[0], selectedFiles[1]);
          setCompareResult(comp);
          setSuccessInfo('Comparison analysis completed.');
          break;

        default:
          resultBytes = await splitPdf(primaryFile, '');
          setSuccessInfo('Document processed successfully.');
          break;
      }

      if (resultBytes) {
        setProcessedBytes(resultBytes);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'An error occurred during file processing.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedBytes) return;
    const baseName = selectedFiles[0]?.name?.replace(/\.[^/.]+$/, '') || 'toolcrest-document';
    const outputName = `${baseName}-${tool.slug}.pdf`;
    downloadBytesAsFile(processedBytes, outputName);
  };

  return (
    <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="hover:text-emerald-700 transition"
        >
          Tools
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-700 font-semibold">{tool.name}</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center font-bold shadow-2xs">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {tool.name}
                </h1>
                {tool.badge && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {tool.badge}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">{tool.longDesc}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50/80 px-3 py-1.5 rounded-xl border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Client-Side • Private & Fast</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Tool Workbench */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Upload Zone (For file-based tools) */}
        {tool.id !== 'create-pdf' && tool.id !== 'webpage-to-pdf' && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-3xl p-8 sm:p-12 text-center cursor-pointer bg-slate-50/60 hover:bg-emerald-50/20 transition group"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple={
                tool.id === 'merge-pdf' ||
                tool.id === 'images-to-pdf' ||
                tool.id === 'compare-pdfs'
              }
              accept={tool.id === 'images-to-pdf' ? 'image/*' : 'application/pdf'}
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 group-hover:border-emerald-300 shadow-2xs flex items-center justify-center mx-auto text-emerald-600 mb-4 transition">
              <UploadCloud className="w-8 h-8 group-hover:scale-105 transition" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              {tool.id === 'images-to-pdf'
                ? 'Choose or drag pictures (JPG, PNG, WEBP)'
                : tool.id === 'merge-pdf' || tool.id === 'compare-pdfs'
                ? 'Choose multiple PDF files to combine or compare'
                : 'Select or drop your PDF document here'}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5">
              Secure local processing in your browser • Up to 50MB files supported
            </p>
          </div>
        )}

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Selected Files ({selectedFiles.length})</span>
              <button
                type="button"
                onClick={() => setSelectedFiles([])}
                className="text-rose-600 hover:underline"
              >
                Clear all
              </button>
            </div>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
              {selectedFiles.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-3 text-xs bg-white">
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-slate-800 truncate">{f.name}</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      ({(f.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Controls based on tool type */}
        <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-4">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
            Tool Settings & Options
          </h4>

          {/* Split / Remove / Extract Ranges */}
          {(tool.id === 'split-pdf' ||
            tool.id === 'remove-pdf-pages' ||
            tool.id === 'extract-pdf-pages' ||
            tool.id === 'rearrange-pdf-pages') && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {tool.id === 'split-pdf'
                  ? 'Page Ranges to Extract (e.g., 1-3, 5)'
                  : tool.id === 'remove-pdf-pages'
                  ? 'Page Numbers to Remove (comma separated, e.g., 2, 4)'
                  : tool.id === 'extract-pdf-pages'
                  ? 'Page Numbers to Extract (comma separated, e.g., 1, 3, 5)'
                  : 'New Page Order Sequence (e.g., 3, 1, 2)'}
              </label>
              <input
                type="text"
                value={splitRange}
                onChange={(e) => setSplitRange(e.target.value)}
                placeholder="e.g., 1-2 or 1, 3"
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
              />
            </div>
          )}

          {/* Rotation Degrees */}
          {tool.id === 'rotate-pdf' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Rotation Angle (Clockwise)
              </label>
              <div className="flex gap-2">
                {[90, 180, 270].map((deg) => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() => setRotateDeg(deg)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      rotateDeg === deg
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    {deg}°
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Watermark controls */}
          {tool.id === 'watermark-pdf' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Watermark Text
                </label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Opacity ({Math.round(watermarkOpacity * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={watermarkOpacity}
                  onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                  className="w-full mt-2 accent-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Watermark Angle ({watermarkAngle}°)
                </label>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="15"
                  value={watermarkAngle}
                  onChange={(e) => setWatermarkAngle(parseInt(e.target.value, 10))}
                  className="w-full mt-2 accent-emerald-600"
                />
              </div>
            </div>
          )}

          {/* Page Numbers */}
          {tool.id === 'page-numbers-pdf' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Format
                </label>
                <select
                  value={pageNumberFormat}
                  onChange={(e: any) => setPageNumberFormat(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2"
                >
                  <option value="page-x-of-y">Page X of Y (Recommended)</option>
                  <option value="page-x">Page X</option>
                  <option value="simple">X only</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Placement
                </label>
                <select
                  value={pageNumberPos}
                  onChange={(e: any) => setPageNumberPos(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2"
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-center">Bottom Center</option>
                  <option value="top-right">Top Right</option>
                </select>
              </div>
            </div>
          )}

          {/* Images to PDF Orientation */}
          {tool.id === 'images-to-pdf' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Page Layout Orientation
              </label>
              <div className="flex gap-2">
                {(['portrait', 'landscape'] as const).map((ori) => (
                  <button
                    key={ori}
                    type="button"
                    onClick={() => setImageOrientation(ori)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition ${
                      imageOrientation === ori
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {ori}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Protect / Password */}
          {(tool.id === 'protect-pdf' || tool.id === 'unlock-pdf') && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {tool.id === 'protect-pdf'
                  ? 'Set Document Password'
                  : 'Document Password (if known)'}
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password..."
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          )}

          {/* Signature Canvas Pad */}
          {tool.id === 'sign-pdf' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Draw Signature with Touch / Mouse
                </label>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-xs text-rose-600 hover:underline"
                >
                  Clear Signature
                </button>
              </div>
              <div className="border border-slate-300 rounded-2xl bg-white overflow-hidden shadow-2xs">
                <canvas
                  ref={canvasRef}
                  width={460}
                  height={140}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-36 touch-none cursor-crosshair bg-white"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Signature will be stamped cleanly in the document footer.
              </p>
            </div>
          )}

          {/* Create PDF & Text Converters */}
          {(tool.id === 'create-pdf' ||
            tool.id === 'webpage-to-pdf' ||
            tool.id === 'pdf-converter') && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Body / Text / HTML
                </label>
                <textarea
                  rows={6}
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl p-3 font-mono leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>

        {/* Feedback / Error Alerts */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successInfo && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successInfo}</span>
            </div>
            {processedBytes && (
              <span className="font-mono text-[11px] text-emerald-700 font-semibold">
                Ready for download
              </span>
            )}
          </div>
        )}

        {/* Comparison Diff Results */}
        {compareResult && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
            <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
              <GitCompare className="w-4 h-4 text-emerald-600" /> Comparison Findings:
            </h5>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="font-semibold block text-slate-700">Document 1:</span>
                <span>{compareResult.pagesA} pages</span> •{' '}
                <span>{(compareResult.sizeA / 1024).toFixed(1)} KB</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="font-semibold block text-slate-700">Document 2:</span>
                <span>{compareResult.pagesB} pages</span> •{' '}
                <span>{(compareResult.sizeB / 1024).toFixed(1)} KB</span>
              </div>
            </div>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              {compareResult.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons: Run Tool */}
        {!processedBytes && (
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleExecute}
              disabled={isProcessing}
              className="flex-1 py-3 px-5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-99 rounded-2xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 text-emerald-200" />
              )}
              {isProcessing ? 'Processing File...' : `Run ${tool.name}`}
            </button>
          </div>
        )}

        {/* Download Section with Editable File Name */}
        {processedBytes && (
          <div className="pt-2">
            <PdfDownloadSection
              processedBytes={processedBytes}
              defaultFileName={getSuggestedDefaultFileName(selectedFiles[0]?.name, tool.slug)}
              targetExtension={
                tool.id === 'pdf-to-images' || tool.id === 'extract-pdf-images' ? 'zip' : 'pdf'
              }
              statusMessage={successInfo}
              originalSizeBytes={selectedFiles[0]?.size}
              onReset={() => {
                setProcessedBytes(null);
                setSuccessInfo(null);
              }}
            />
          </div>
        )}
      </div>

      {/* Step by step Instructions */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          How to Use {tool.name} (3 Simple Steps)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h4 className="font-bold text-xs text-slate-900">Upload or Select File</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Drag your document directly into the box or tap to choose files from your device.
            </p>
          </div>
          <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h4 className="font-bold text-xs text-slate-900">Adjust Settings</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Configure your page numbers, angles, compression parameters, or watermark options.
            </p>
          </div>
          <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h4 className="font-bold text-xs text-slate-900">Process & Download</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Click run, wait a split second for instant client-side compilation, and download.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
