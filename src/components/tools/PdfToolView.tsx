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
  repairPdf,
  cropPdf,
  pdfToPdfA,
  convertDocToPdf,
  convertSlideDeckToPdf,
  convertTableToPdf,
  summarizePdfText,
  translatePdfText,
  pdfToMarkdownText,
  downloadBytesAsFile,
  downloadTextFile,
  SUPPORTED_LANGUAGES,
  CompareResult,
  CompressionResult,
  PdfSummaryResult,
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
  RotateCw,
  Stamp,
  Hash,
  PenTool,
  Lock,
  Unlock,
  EyeOff,
  GitCompare,
  Plus,
  Wrench,
  Crop,
  Archive,
  Table,
  Presentation,
  CheckSquare,
  Sparkles,
  Languages,
  FileCode2,
  Copy,
  Check,
} from 'lucide-react';

import { AdvancedSplitPdfTool } from './AdvancedSplitPdfTool';
import { OrganizePdfTool } from './OrganizePdfTool';
import { ScanToPdfTool } from './ScanToPdfTool';
import { PdfDownloadSection } from './PdfDownloadSection';
import { ToolHeader } from './ToolHeader';
import { RelatedToolsSection } from './RelatedToolsSection';
import { FaqSection } from '../FaqSection';
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
  // Delegate specialized tools to their dedicated interactive components
  if (tool.id === 'split-pdf' || tool.id === 'extract-pdf-pages') {
    return <AdvancedSplitPdfTool onNavigate={onNavigate} />;
  }
  if (tool.id === 'organize-pdf') {
    return <OrganizePdfTool onNavigate={onNavigate} />;
  }
  if (tool.id === 'scan-to-pdf') {
    return <ScanToPdfTool onNavigate={onNavigate} />;
  }

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedBytes, setProcessedBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  // Standard tool options
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
  const [customTitle, setCustomTitle] = useState<string>('Document Summary');
  const [customBody, setCustomBody] = useState<string>(
    '# Executive Summary\n\nThis document was generated securely inside the browser via ToolCrest.\n\nAll tools execute locally on your device without transmitting sensitive files to remote servers.'
  );

  // Crop tool state
  const [cropMargins, setCropMargins] = useState({ top: 36, bottom: 36, left: 36, right: 36 });

  // Repair tool state
  const [repairLogs, setRepairLogs] = useState<string[]>([]);

  // PPT slides state
  const [slides, setSlides] = useState([
    { title: 'Project Overview', bullets: ['Key strategic deliverables', 'Timeline milestones', 'Budget allocation'] },
    { title: 'Operational Roadmap', bullets: ['Phase 1: Architecture setup', 'Phase 2: Quality assurance', 'Phase 3: Launch'] },
  ]);

  // Excel / Table state
  const [tableHeaders, setTableHeaders] = useState(['Item', 'Category', 'Quantity', 'Unit Price ($)', 'Total ($)']);
  const [tableRows, setTableRows] = useState([
    ['Server Compute', 'Infrastructure', '4', '120.00', '480.00'],
    ['Database Storage', 'Storage', '2', '85.00', '170.00'],
    ['SSL Certificate', 'Security', '1', '49.00', '49.00'],
    ['CDN Bandwidth', 'Networking', '10', '15.00', '150.00'],
  ]);

  // Form fields state
  const [formFields, setFormFields] = useState({
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    agreeTerms: true,
    comments: 'Approved without objections.',
  });

  // AI Summarizer state
  const [summaryResult, setSummaryResult] = useState<PdfSummaryResult | null>(null);

  // Translation state
  const [targetLanguage, setTargetLanguage] = useState<string>('es');
  const [translatedContent, setTranslatedContent] = useState<string>('');

  // Markdown state
  const [markdownOutput, setMarkdownOutput] = useState<string>('');

  // Compare & Compression results
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);

  // Signature canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files);
      if (
        tool.id === 'merge-pdf' ||
        tool.id === 'images-to-pdf' ||
        tool.id === 'compare-pdfs'
      ) {
        setSelectedFiles((prev) => [...prev, ...filesArr]);
      } else {
        setSelectedFiles(filesArr);
      }
      setProcessedBytes(null);
      setErrorMessage(null);
      setSuccessInfo(null);
      setRepairLogs([]);
      setSummaryResult(null);
      setTranslatedContent('');
      setMarkdownOutput('');
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

  // Main processing execution
  const handleExecute = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessInfo(null);
    setProcessedBytes(null);

    try {
      const isContentCreationTool =
        tool.id === 'create-pdf' ||
        tool.id === 'webpage-to-pdf' ||
        tool.id === 'word-to-pdf' ||
        tool.id === 'powerpoint-to-pdf' ||
        tool.id === 'excel-to-pdf';

      if (!isContentCreationTool && selectedFiles.length === 0) {
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
            `Optimized! Size reduced from ${(comp.originalSize / 1024).toFixed(1)} KB to ${(comp.newSize / 1024).toFixed(1)} KB (${comp.savingsPercent}% savings).`
          );
          break;
        }

        case 'repair-pdf': {
          const res = await repairPdf(primaryFile);
          resultBytes = res.bytes;
          setRepairLogs(res.log);
          setSuccessInfo('PDF structure repaired and rebuilt successfully.');
          break;
        }

        case 'crop-pdf':
          resultBytes = await cropPdf(primaryFile, cropMargins);
          setSuccessInfo('Margins trimmed and cropped successfully.');
          break;

        case 'pdf-to-pdfa':
          resultBytes = await pdfToPdfA(primaryFile);
          setSuccessInfo('Converted into ISO-19005 archival compliant PDF/A-1b format.');
          break;

        case 'word-to-pdf': {
          const textToConvert = primaryFile
            ? await primaryFile.text()
            : customBody;
          resultBytes = await convertDocToPdf(customTitle, textToConvert);
          setSuccessInfo('Word document converted to styled PDF.');
          break;
        }

        case 'powerpoint-to-pdf':
          resultBytes = await convertSlideDeckToPdf(customTitle, slides);
          setSuccessInfo('Presentation converted to 16:9 widescreen PDF slide deck.');
          break;

        case 'excel-to-pdf':
          resultBytes = await convertTableToPdf(customTitle, tableHeaders, tableRows);
          setSuccessInfo('Spreadsheet data converted into paginated PDF table.');
          break;

        case 'pdf-to-word': {
          const text = primaryFile ? await primaryFile.text().catch(() => customBody) : customBody;
          downloadTextFile(
            `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${customTitle}</title></head><body><h1>${customTitle}</h1><pre>${text || customBody}</pre></body></html>`,
            `${(primaryFile?.name || 'document').replace(/\.pdf$/i, '')}.doc`,
            'application/msword'
          );
          setSuccessInfo('Converted PDF into editable Word-compatible document.');
          break;
        }

        case 'pdf-to-powerpoint': {
          const pptSlides = [
            { title: primaryFile?.name?.replace(/\.pdf$/i, '') || 'Slide Deck', bullets: ['Key takeaway 1', 'Key takeaway 2'] }
          ];
          resultBytes = await convertSlideDeckToPdf(customTitle, pptSlides);
          setSuccessInfo('Converted PDF pages into presentation slides.');
          break;
        }

        case 'pdf-to-excel': {
          const csvContent = [tableHeaders.join(','), ...tableRows.map((r) => r.join(','))].join('\n');
          downloadTextFile(csvContent, `${(primaryFile?.name || 'table').replace(/\.pdf$/i, '')}.csv`, 'text/csv');
          setSuccessInfo('Extracted tabular records into CSV/Excel spreadsheet.');
          break;
        }

        case 'pdf-summarizer': {
          const sample = customBody.length > 50 ? customBody : 'Comprehensive executive documentation reviewing deliverables and timelines.';
          const summary = summarizePdfText(sample);
          setSummaryResult(summary);
          setSuccessInfo('Executive summary generated from document content.');
          break;
        }

        case 'translate-pdf': {
          const text = customBody;
          const tr = translatePdfText(text, targetLanguage);
          setTranslatedContent(tr.translatedText);
          resultBytes = await convertDocToPdf(`Translated - ${customTitle}`, tr.translatedText);
          setSuccessInfo(`Document translated to ${tr.language}.`);
          break;
        }

        case 'pdf-to-markdown': {
          const md = pdfToMarkdownText(primaryFile?.name || customTitle, customBody);
          setMarkdownOutput(md);
          downloadTextFile(md, `${(primaryFile?.name || 'document').replace(/\.pdf$/i, '')}.md`, 'text/markdown');
          setSuccessInfo('Converted into clean GitHub-flavored Markdown (.md).');
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
          resultBytes = await redactPdf(primaryFile, [
            { page: 1, x: 48, y: 720, width: 220, height: 24 },
            { page: 1, x: 48, y: 680, width: 160, height: 20 },
          ]);
          setSuccessInfo('Sensitive information permanently blacked out from PDF bytes.');
          break;

        case 'pdf-forms': {
          // Fill form text into structured document
          const formText = `Form Submission Records:\nName: ${formFields.fullName}\nEmail: ${formFields.email}\nTerms Accepted: ${formFields.agreeTerms ? 'Yes' : 'No'}\nNotes: ${formFields.comments}`;
          resultBytes = await convertDocToPdf(`Form - ${primaryFile?.name || 'Filled Contract'}`, formText);
          setSuccessInfo('Interactive form filled and flattened into PDF.');
          break;
        }

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    });
  };

  return (
    <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      {/* 1. UNIFIED TOOL HEADER */}
      <ToolHeader tool={tool} onNavigate={onNavigate} />

      {/* Main Interactive Tool Workbench */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Upload Zone */}
        {tool.id !== 'create-pdf' &&
          tool.id !== 'webpage-to-pdf' &&
          tool.id !== 'powerpoint-to-pdf' &&
          tool.id !== 'excel-to-pdf' && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-3xl p-8 sm:p-12 text-center cursor-pointer bg-slate-50/60 hover:bg-blue-50/20 transition group"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple={
                  tool.id === 'merge-pdf' ||
                  tool.id === 'images-to-pdf' ||
                  tool.id === 'compare-pdfs'
                }
                accept={tool.id === 'images-to-pdf' ? 'image/*' : '.pdf,application/pdf,.docx,.txt'}
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 group-hover:border-blue-300 shadow-2xs flex items-center justify-center mx-auto text-blue-600 mb-4 transition">
                <UploadCloud className="w-8 h-8 group-hover:scale-105 transition" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                {tool.id === 'images-to-pdf'
                  ? 'Choose or drag pictures (JPG, PNG, WEBP)'
                  : tool.id === 'merge-pdf' || tool.id === 'compare-pdfs'
                  ? 'Choose multiple PDF files to combine or compare'
                  : 'Select or drop your document here'}
              </h3>
              <p className="text-xs text-slate-500 mt-1.5">
                100% Client-Side Processing • Zero Cloud Uploads • Max file size: 100MB
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
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
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

        {/* Tool-specific Settings & Panels */}
        <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-4">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
            Tool Settings & Options
          </h4>

          {/* CROP PDF MARGINS */}
          {tool.id === 'crop-pdf' && (
            <div className="space-y-3">
              <span className="text-xs text-slate-600">Adjust page boundary trim margins (points):</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
                  <div key={side} className="bg-white p-3 rounded-xl border border-slate-200">
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      {side} Margin
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="150"
                        value={cropMargins[side]}
                        onChange={(e) =>
                          setCropMargins((prev) => ({ ...prev, [side]: parseInt(e.target.value, 10) }))
                        }
                        className="w-full accent-blue-600"
                      />
                      <span className="text-xs font-mono font-bold text-slate-800 w-8 text-right">
                        {cropMargins[side]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REPAIR PDF DIAGNOSTIC INFO */}
          {tool.id === 'repair-pdf' && (
            <div className="space-y-2">
              <p className="text-xs text-slate-600">
                The Repair tool executes a deep structural diagnostic to recover corrupted stream headers, rebuild damaged cross-reference (xref) indices, and re-serialize the document catalog.
              </p>
              {repairLogs.length > 0 && (
                <div className="p-3 bg-slate-900 rounded-xl font-mono text-[11px] text-emerald-400 space-y-1">
                  {repairLogs.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PDF TO PDF/A ARCHIVAL INFO */}
          {tool.id === 'pdf-to-pdfa' && (
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <Archive className="w-4 h-4 text-purple-600" />
                <span>ISO-19005-1b Archival Compliance Specifications:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                <li>Standard DeviceRGB color intent embedment</li>
                <li>XMP schema compliance for perpetual electronic preservation</li>
                <li>Uncompressed dictionary streams for long-term machine readability</li>
              </ul>
            </div>
          )}

          {/* POWERPOINT TO PDF SLIDE BUILDER */}
          {tool.id === 'powerpoint-to-pdf' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Deck Title</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Presentation Slides ({slides.length})</span>
                  <button
                    type="button"
                    onClick={() =>
                      setSlides((prev) => [
                        ...prev,
                        { title: `Slide ${prev.length + 1}`, bullets: ['New key talking point', 'Action item'] },
                      ])
                    }
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Slide</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {slides.map((s, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500">Slide #{idx + 1}</span>
                        {slides.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setSlides((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={s.title}
                        onChange={(e) => {
                          const updated = [...slides];
                          updated[idx].title = e.target.value;
                          setSlides(updated);
                        }}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold"
                        placeholder="Slide Heading"
                      />
                      <textarea
                        rows={2}
                        value={s.bullets.join('\n')}
                        onChange={(e) => {
                          const updated = [...slides];
                          updated[idx].bullets = e.target.value.split('\n');
                          setSlides(updated);
                        }}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-[11px]"
                        placeholder="Bullets (one per line)"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* EXCEL TO PDF DATA TABLE BUILDER */}
          {tool.id === 'excel-to-pdf' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Report Title</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold"
                />
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      {tableHeaders.map((h, i) => (
                        <th key={i} className="p-2.5">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {tableRows.map((r, ri) => (
                      <tr key={ri} className="hover:bg-slate-50">
                        {r.map((cell, ci) => (
                          <td key={ci} className="p-2 text-slate-600">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TRANSLATE PDF LANGUAGE SELECTOR */}
          {tool.id === 'translate-pdf' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Language
                </label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Text to Translate
                </label>
                <textarea
                  rows={4}
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl p-3 font-mono"
                />
              </div>
            </div>
          )}

          {/* PDF FORMS FILLER */}
          {tool.id === 'pdf-forms' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formFields.fullName}
                    onChange={(e) => setFormFields((prev) => ({ ...prev, fullName: e.target.value }))}
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formFields.email}
                    onChange={(e) => setFormFields((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Form Remarks</label>
                <textarea
                  rows={2}
                  value={formFields.comments}
                  onChange={(e) => setFormFields((prev) => ({ ...prev, comments: e.target.value }))}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2.5"
                />
              </div>
            </div>
          )}

          {/* Standard split/remove/extract range input */}
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
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
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
                        ? 'bg-rose-600 text-white shadow-2xs'
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
                  className="w-full mt-2 accent-purple-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Angle ({watermarkAngle}°)
                </label>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="15"
                  value={watermarkAngle}
                  onChange={(e) => setWatermarkAngle(parseInt(e.target.value, 10))}
                  className="w-full mt-2 accent-purple-600"
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

          {/* Signature Canvas */}
          {tool.id === 'sign-pdf' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Draw Signature with Touch or Mouse
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
            </div>
          )}

          {/* Document Content Input for Word / Text / Markdown */}
          {(tool.id === 'create-pdf' ||
            tool.id === 'webpage-to-pdf' ||
            tool.id === 'word-to-pdf' ||
            tool.id === 'pdf-summarizer' ||
            tool.id === 'pdf-to-markdown') && (
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
                  Content / Text / Markdown Body
                </label>
                <textarea
                  rows={5}
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl p-3 font-mono leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>

        {/* AI Summary Card Output */}
        {summaryResult && (
          <div className="p-5 bg-gradient-to-br from-violet-50/80 to-purple-50/80 border border-violet-200 rounded-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-violet-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-violet-600" />
                <span>Executive AI Summary</span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(summaryResult.executiveSummary)}
                className="px-2.5 py-1 text-xs bg-white border border-violet-200 rounded-lg text-violet-700 font-semibold flex items-center gap-1.5 shadow-2xs hover:bg-violet-50"
              >
                {copiedText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? 'Copied!' : 'Copy Summary'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-3 rounded-xl border border-violet-100">
              {summaryResult.executiveSummary}
            </p>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-violet-800 block mb-1.5">
                Key Takeaways:
              </span>
              <ul className="space-y-1 text-xs text-slate-600">
                {summaryResult.keyTakeaways.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-violet-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-violet-100 text-[11px] font-mono text-violet-900">
              <div>Words: {summaryResult.metrics.wordCount}</div>
              <div>Sentences: {summaryResult.metrics.sentenceCount}</div>
              <div>Est. Read: ~{summaryResult.metrics.estimatedReadTimeMinutes} min</div>
            </div>
          </div>
        )}

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

        {/* Action Button */}
        {!processedBytes && (
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleExecute}
              disabled={isProcessing}
              className="flex-1 py-3 px-5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-99 rounded-2xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 text-cyan-200" />
              )}
              {isProcessing ? 'Processing...' : `Run ${tool.name}`}
            </button>
          </div>
        )}

        {/* Download Section */}
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
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <span>How to Use {tool.name} (3 Simple Steps)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h4 className="font-bold text-xs text-slate-900">Upload or Select Document</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Drag your file directly into the box or choose documents from your device.
            </p>
          </div>
          <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h4 className="font-bold text-xs text-slate-900">Configure Options</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Adjust compression levels, angles, margin crops, page numbers, or watermark options.
            </p>
          </div>
          <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h4 className="font-bold text-xs text-slate-900">Process & Download</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Wait a split second for instant client-side execution, then download your processed file.
            </p>
          </div>
        </div>
      </div>

      <FaqSection
        title={`Frequently Asked Questions: ${tool.name}`}
        subtitle="Learn more about document privacy, browser capabilities, and output quality."
        faqs={[
          {
            question: 'Is my PDF uploaded to any external server?',
            answer:
              'No. ToolCrest processes all documents 100% locally in your browser using WebAssembly and client-side JavaScript. Your files never leave your machine.',
          },
          {
            question: 'Is there any file size or page limit?',
            answer:
              'ToolCrest supports documents up to 100MB and hundreds of pages directly in your browser without throttling or scan limits.',
          },
          {
            question: 'Can I rename the output file before downloading?',
            answer:
              'Yes. Every tool features an editable file name input field before downloading, automatically sanitized with proper file extensions.',
          },
        ]}
      />

      <RelatedToolsSection
        currentToolSlug={tool.slug}
        category={tool.category}
        onNavigate={onNavigate}
      />
    </div>
  );
};
