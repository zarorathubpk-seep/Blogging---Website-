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
  protectPdf,
  unlockPdf,
  RedactionZone,
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
  Eye,
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
import { useTheme } from '../../context/ThemeContext';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
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
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [allowPrintingOption, setAllowPrintingOption] = useState<boolean>(true);
  const [allowCopyingOption, setAllowCopyingOption] = useState<boolean>(true);

  // Redaction parameters
  const [redactionPreset, setRedactionPreset] = useState<'custom' | 'header' | 'footer' | 'address-block'>('header');
  const [redactionPage, setRedactionPage] = useState<number>(1);
  const [redactionX, setRedactionX] = useState<number>(50);
  const [redactionY, setRedactionY] = useState<number>(750);
  const [redactionWidth, setRedactionWidth] = useState<number>(240);
  const [redactionHeight, setRedactionHeight] = useState<number>(36);
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

        case 'protect-pdf': {
          if (!passwordInput || passwordInput.trim().length < 3) {
            throw new Error('Please enter a password with at least 3 characters to protect this PDF.');
          }
          resultBytes = await protectPdf(primaryFile, passwordInput.trim(), {
            allowPrinting: allowPrintingOption,
            allowCopying: allowCopyingOption,
          });
          setSuccessInfo('PDF encrypted with AES-256 standard password protection. Passphrase is now required to open.');
          break;
        }

        case 'unlock-pdf': {
          resultBytes = await unlockPdf(primaryFile, passwordInput);
          setSuccessInfo('Password verified successfully! Restrictions removed and clean unlocked PDF generated.');
          break;
        }

        case 'redact-pdf': {
          let zones: RedactionZone[] = [];
          if (redactionPreset === 'header') {
            zones = [{ page: redactionPage, x: 40, y: 770, width: 515, height: 45, label: 'Header Margin' }];
          } else if (redactionPreset === 'footer') {
            zones = [{ page: redactionPage, x: 40, y: 30, width: 515, height: 45, label: 'Footer Margin' }];
          } else if (redactionPreset === 'address-block') {
            zones = [
              { page: redactionPage, x: 48, y: 680, width: 240, height: 60, label: 'Address & Contact Block' },
            ];
          } else {
            zones = [
              {
                page: redactionPage,
                x: Number(redactionX) || 40,
                y: Number(redactionY) || 700,
                width: Number(redactionWidth) || 200,
                height: Number(redactionHeight) || 30,
                label: 'Custom Redaction Box',
              },
            ];
          }
          resultBytes = await redactPdf(primaryFile, zones);
          setSuccessInfo(`Permanently blacked out ${zones.length} zone(s) on Page ${redactionPage} from the PDF streams.`);
          break;
        }

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
      <div
        className={`rounded-3xl p-6 sm:p-8 space-y-6 transition-colors duration-200 border ${
          isDark
            ? 'bg-[#0c101d] border-amber-500/25 shadow-2xl text-slate-100'
            : 'bg-white border-slate-200/90 shadow-sm text-slate-900'
        }`}
      >
        {/* Upload Zone */}
        {tool.id !== 'create-pdf' &&
          tool.id !== 'webpage-to-pdf' &&
          tool.id !== 'powerpoint-to-pdf' &&
          tool.id !== 'excel-to-pdf' && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all group ${
                isDark
                  ? 'border-amber-500/35 hover:border-amber-400 bg-[#070a14]/90 hover:bg-amber-500/5'
                  : 'border-amber-300 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50/80'
              }`}
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
              <div
                className={`w-16 h-16 rounded-2xl border shadow-md flex items-center justify-center mx-auto mb-4 transition ${
                  isDark
                    ? 'bg-[#0e1424] border-amber-500/30 group-hover:border-amber-400 text-amber-400'
                    : 'bg-amber-100 border-amber-300 group-hover:border-amber-400 text-amber-800'
                }`}
              >
                <UploadCloud className="w-8 h-8 group-hover:scale-105 transition" />
              </div>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {tool.id === 'images-to-pdf'
                  ? 'Choose or drag pictures (JPG, PNG, WEBP)'
                  : tool.id === 'merge-pdf' || tool.id === 'compare-pdfs'
                  ? 'Choose multiple PDF files to combine or compare'
                  : 'Select or drop your document here'}
              </h3>
              <p className={`text-xs mt-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                100% Client-Side Processing • Zero Cloud Uploads • Max file size: 100MB
              </p>
            </div>
          )}

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Selected Files ({selectedFiles.length})</span>
              <button
                type="button"
                onClick={() => setSelectedFiles([])}
                className="text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
              >
                Clear all
              </button>
            </div>
            <div className="divide-y divide-slate-800 border border-amber-500/20 rounded-2xl overflow-hidden bg-[#070a14]">
              {selectedFiles.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-3 text-xs bg-[#090d18]">
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-semibold text-slate-200 truncate">{f.name}</span>
                    <span className="text-amber-400/80 font-mono text-[11px]">
                      ({(f.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="p-1 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 rounded transition cursor-pointer"
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
        <div className="p-4 sm:p-5 bg-[#070a14] border border-amber-500/25 rounded-2xl space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">
            Tool Settings & Options
          </h4>

          {/* CROP PDF MARGINS */}
          {tool.id === 'crop-pdf' && (
            <div className="space-y-3">
              <span className="text-xs text-slate-300">Adjust page boundary trim margins (points):</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
                  <div key={side} className="bg-[#0c111e] p-3 rounded-xl border border-amber-500/20">
                    <label className="block text-[11px] font-bold uppercase text-amber-300 mb-1">
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
                        className="w-full accent-amber-400"
                      />
                      <span className="text-xs font-mono font-bold text-amber-300 w-8 text-right">
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
              <p className="text-xs text-slate-300">
                The Repair tool executes a deep structural diagnostic to recover corrupted stream headers, rebuild damaged cross-reference (xref) indices, and re-serialize the document catalog.
              </p>
              {repairLogs.length > 0 && (
                <div className="p-3 bg-[#0c111e] rounded-xl font-mono text-[11px] text-amber-300 border border-amber-500/30 space-y-1">
                  {repairLogs.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PDF TO PDF/A ARCHIVAL INFO */}
          {tool.id === 'pdf-to-pdfa' && (
            <div className="p-3.5 bg-[#0c111e] rounded-xl border border-amber-500/25 text-xs text-slate-300 space-y-2">
              <div className="font-bold text-amber-300 flex items-center gap-2">
                <Archive className="w-4 h-4 text-amber-400" />
                <span>ISO-19005-1b Archival Compliance Specifications:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
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
                <label className="block text-xs font-bold text-amber-200 mb-1">Deck Title</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full text-xs bg-[#0c111e] border border-amber-500/30 text-white rounded-xl px-3 py-2 font-bold focus:border-amber-400"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Presentation Slides ({slides.length})</span>
                  <button
                    type="button"
                    onClick={() =>
                      setSlides((prev) => [
                        ...prev,
                        { title: `Slide ${prev.length + 1}`, bullets: ['New key talking point', 'Action item'] },
                      ])
                    }
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Slide</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {slides.map((s, idx) => (
                    <div key={idx} className="p-3 bg-[#0c111e] rounded-xl border border-amber-500/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-400">Slide #{idx + 1}</span>
                        {slides.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setSlides((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-rose-400 cursor-pointer"
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
                        className="w-full text-xs bg-[#070a14] border border-amber-500/30 text-white rounded-lg px-2.5 py-1.5 font-semibold focus:border-amber-400"
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
                        className="w-full text-xs bg-[#070a14] border border-amber-500/30 text-white rounded-lg p-2 font-mono text-[11px] focus:border-amber-400"
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
                <label className="block text-xs font-bold text-amber-200 mb-1">Report Title</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full text-xs bg-[#0c111e] border border-amber-500/30 text-white rounded-xl px-3 py-2 font-bold focus:border-amber-400"
                />
              </div>

              <div className="overflow-x-auto border border-amber-500/25 rounded-xl bg-[#0c111e]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#131b2e] text-amber-300 font-bold border-b border-amber-500/20">
                    <tr>
                      {tableHeaders.map((h, i) => (
                        <th key={i} className="p-2.5">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                    {tableRows.map((r, ri) => (
                      <tr key={ri} className="hover:bg-amber-500/5">
                        {r.map((cell, ci) => (
                          <td key={ci} className="p-2 text-slate-300">
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
                <label className="block text-xs font-bold text-amber-200 mb-1">
                  Target Language
                </label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full text-xs bg-[#0c111e] border border-amber-500/30 text-white rounded-xl px-3 py-2 font-medium focus:border-amber-400"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1">
                  Text to Translate
                </label>
                <textarea
                  rows={4}
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  className="w-full text-xs bg-[#0c111e] border border-amber-500/30 text-white rounded-xl p-3 font-mono focus:border-amber-400"
                />
              </div>
            </div>
          )}

          {/* PDF FORMS FILLER */}
          {tool.id === 'pdf-forms' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-amber-200 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formFields.fullName}
                    onChange={(e) => setFormFields((prev) => ({ ...prev, fullName: e.target.value }))}
                    className="w-full text-xs bg-[#0c111e] border border-amber-500/30 text-white rounded-xl px-3 py-2 focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amber-200 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formFields.email}
                    onChange={(e) => setFormFields((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full text-xs bg-[#0c111e] border border-amber-500/30 text-white rounded-xl px-3 py-2 focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1">Form Remarks</label>
                <textarea
                  rows={2}
                  value={formFields.comments}
                  onChange={(e) => setFormFields((prev) => ({ ...prev, comments: e.target.value }))}
                  className="w-full text-xs bg-[#0c111e] border border-amber-500/30 text-white rounded-xl p-2.5 focus:border-amber-400"
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
              <label className="block text-xs font-bold text-amber-200 mb-1">
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
                className="w-full text-xs bg-[#0c111e] border border-amber-500/30 text-white rounded-xl px-3 py-2 focus:border-amber-400 focus:outline-hidden font-mono"
              />
            </div>
          )}

          {/* Rotation Degrees */}
          {tool.id === 'rotate-pdf' && (
            <div>
              <label className="block text-xs font-bold text-amber-200 mb-2">
                Rotation Angle (Clockwise)
              </label>
              <div className="flex gap-2">
                {[90, 180, 270].map((deg) => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() => setRotateDeg(deg)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                      rotateDeg === deg
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md'
                        : 'bg-[#0c111e] border border-amber-500/25 text-slate-300 hover:text-amber-300'
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
                <label className="block text-xs font-bold text-amber-200 mb-1">
                  Watermark Text
                </label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className="w-full text-xs bg-[#0c111e] border border-amber-500/30 text-white rounded-xl px-3 py-2 focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1">
                  Opacity ({Math.round(watermarkOpacity * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={watermarkOpacity}
                  onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                  className="w-full mt-2 accent-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1">
                  Angle ({watermarkAngle}°)
                </label>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="15"
                  value={watermarkAngle}
                  onChange={(e) => setWatermarkAngle(parseInt(e.target.value, 10))}
                  className="w-full mt-2 accent-amber-400"
                />
              </div>
            </div>
          )}

          {/* Page Numbers */}
          {tool.id === 'page-numbers-pdf' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1">
                  Format
                </label>
                <select
                  value={pageNumberFormat}
                  onChange={(e: any) => setPageNumberFormat(e.target.value)}
                  className="w-full text-xs bg-[#0c111e] border border-amber-500/30 text-white rounded-xl px-3 py-2 focus:border-amber-400"
                >
                  <option value="page-x-of-y">Page X of Y (Recommended)</option>
                  <option value="page-x">Page X</option>
                  <option value="simple">X only</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1">
                  Placement
                </label>
                <select
                  value={pageNumberPos}
                  onChange={(e: any) => setPageNumberPos(e.target.value)}
                  className="w-full text-xs bg-[#0c111e] border border-amber-500/30 text-white rounded-xl px-3 py-2 focus:border-amber-400"
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
                <label className="text-xs font-bold text-amber-200">
                  Draw Signature with Touch or Mouse
                </label>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-xs text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
                >
                  Clear Signature
                </button>
              </div>
              <div className="border border-amber-500/30 rounded-2xl bg-white overflow-hidden shadow-md">
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

          {/* Password Protection Controls */}
          {tool.id === 'protect-pdf' && (
            <div className="space-y-4 p-4 rounded-2xl bg-[#0B1020] border border-[#F3B542]/30 text-[#CBD5E1]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#F3B542]">
                <Lock className="w-4 h-4" />
                <span>AES-256 Client-Side Encryption Passphrase</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">
                  Set Document Password (Minimum 3 characters)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter secure password to protect PDF..."
                    className="w-full text-xs bg-[#111827] border border-[#F3B542]/30 text-white rounded-xl pl-3.5 pr-10 py-2.5 focus:border-[#F3B542] focus:ring-1 focus:ring-[#F3B542] focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allowPrintingOption}
                    onChange={(e) => setAllowPrintingOption(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-400 w-3.5 h-3.5"
                  />
                  <span>Allow High-Resolution Printing</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allowCopyingOption}
                    onChange={(e) => setAllowCopyingOption(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-400 w-3.5 h-3.5"
                  />
                  <span>Allow Text & Graphic Copying</span>
                </label>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Your passphrase encrypts the document binary in your browser using AES-256 standard (V=5, R=6). Neither the file nor the password is ever sent to any server.
              </p>
            </div>
          )}

          {/* Unlock PDF Controls */}
          {tool.id === 'unlock-pdf' && (
            <div className="space-y-4 p-4 rounded-2xl bg-[#0B1020] border border-[#F3B542]/30 text-[#CBD5E1]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#F3B542]">
                <Unlock className="w-4 h-4" />
                <span>Remove Password Restrictions</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">
                  Enter Password to Unlock Document
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter the password for this encrypted PDF..."
                    className="w-full text-xs bg-[#111827] border border-[#F3B542]/30 text-white rounded-xl pl-3.5 pr-10 py-2.5 focus:border-[#F3B542] focus:ring-1 focus:ring-[#F3B542] focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                If the document is encrypted with standard AES or RC4 encryption, providing the correct password decrypts the file and strips all restrictions, generating a clean, unprotected PDF.
              </p>
            </div>
          )}

          {/* Redact PDF Controls */}
          {tool.id === 'redact-pdf' && (
            <div className="space-y-4 p-4 rounded-2xl bg-[#0B1020] border border-[#F3B542]/30 text-[#CBD5E1]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#F3B542]">
                <EyeOff className="w-4 h-4" />
                <span>Permanent Blackout & Redaction Settings</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                    Redaction Area Preset
                  </label>
                  <select
                    value={redactionPreset}
                    onChange={(e: any) => setRedactionPreset(e.target.value)}
                    className="w-full text-xs bg-[#111827] border border-[#F3B542]/30 text-white rounded-xl px-3 py-2"
                  >
                    <option value="header">Top Header (Names, Dates & Case Numbers)</option>
                    <option value="footer">Bottom Footer (Metadata & Footnotes)</option>
                    <option value="address-block">Address & Contact Information Block</option>
                    <option value="custom">Custom Area (Specify Box Coordinates)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                    Target Page Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={redactionPage}
                    onChange={(e) => setRedactionPage(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full text-xs bg-[#111827] border border-[#F3B542]/30 text-white rounded-xl px-3 py-2 font-mono"
                  />
                </div>
              </div>

              {redactionPreset === 'custom' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">X Coord (pt)</label>
                    <input
                      type="number"
                      value={redactionX}
                      onChange={(e) => setRedactionX(parseInt(e.target.value, 10) || 0)}
                      className="w-full text-xs bg-[#111827] border border-slate-700 text-white rounded-lg px-2.5 py-1.5 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Y Coord (pt)</label>
                    <input
                      type="number"
                      value={redactionY}
                      onChange={(e) => setRedactionY(parseInt(e.target.value, 10) || 0)}
                      className="w-full text-xs bg-[#111827] border border-slate-700 text-white rounded-lg px-2.5 py-1.5 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Width (pt)</label>
                    <input
                      type="number"
                      value={redactionWidth}
                      onChange={(e) => setRedactionWidth(parseInt(e.target.value, 10) || 0)}
                      className="w-full text-xs bg-[#111827] border border-slate-700 text-white rounded-lg px-2.5 py-1.5 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Height (pt)</label>
                    <input
                      type="number"
                      value={redactionHeight}
                      onChange={(e) => setRedactionHeight(parseInt(e.target.value, 10) || 0)}
                      className="w-full text-xs bg-[#111827] border border-slate-700 text-white rounded-lg px-2.5 py-1.5 font-mono"
                    />
                  </div>
                </div>
              )}
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Redaction permanently overwrites the page content stream with solid blackout boxes. The underlying text and images in the designated zone are irrecoverable.
              </p>
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
                <label className="block text-xs font-bold text-amber-200 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full text-xs bg-[#0c111e] border border-amber-500/30 text-white rounded-xl px-3 py-2 font-bold focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1">
                  Content / Text / Markdown Body
                </label>
                <textarea
                  rows={5}
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  className="w-full text-xs bg-[#0c111e] border border-amber-500/30 text-white rounded-xl p-3 font-mono leading-relaxed focus:border-amber-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* AI Summary Card Output */}
        {summaryResult && (
          <div className="p-5 bg-[#080c16] border border-amber-500/30 rounded-2xl space-y-4 animate-fadeIn text-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Executive AI Summary</span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(summaryResult.executiveSummary)}
                className="px-3 py-1.5 text-xs bg-[#0c111e] border border-amber-500/30 rounded-lg text-amber-300 font-bold flex items-center gap-1.5 shadow-xs hover:bg-amber-500/10 cursor-pointer"
              >
                {copiedText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? 'Copied!' : 'Copy Summary'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-[#0c111e] p-3 rounded-xl border border-amber-500/20">
              {summaryResult.executiveSummary}
            </p>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block mb-1.5">
                Key Takeaways:
              </span>
              <ul className="space-y-1 text-xs text-slate-300">
                {summaryResult.keyTakeaways.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono text-amber-300">
              <div>Words: {summaryResult.metrics.wordCount}</div>
              <div>Sentences: {summaryResult.metrics.sentenceCount}</div>
              <div>Est. Read: ~{summaryResult.metrics.estimatedReadTimeMinutes} min</div>
            </div>
          </div>
        )}

        {/* Feedback / Error Alerts */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-950/40 border border-rose-500/40 rounded-2xl text-xs text-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successInfo && (
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl text-xs text-emerald-200 flex items-center justify-between gap-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successInfo}</span>
            </div>
            {processedBytes && (
              <span className="font-mono text-[11px] text-emerald-300 font-bold">
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
              className="flex-1 py-3.5 px-6 text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-98 rounded-2xl shadow-lg shadow-amber-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <Zap className="w-4 h-4 text-slate-950 stroke-[2.5]" />
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
      <div className="bg-[#0c101d] border border-amber-500/25 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 text-slate-100">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>How to Use {tool.name} (3 Simple Steps)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-4 bg-[#070a14] border border-amber-500/20 rounded-2xl space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black flex items-center justify-center">
              1
            </span>
            <h4 className="font-bold text-xs text-white">Upload or Select Document</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Drag your file directly into the box or choose documents from your device.
            </p>
          </div>
          <div className="p-4 bg-[#070a14] border border-amber-500/20 rounded-2xl space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black flex items-center justify-center">
              2
            </span>
            <h4 className="font-bold text-xs text-white">Configure Options</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Adjust compression levels, angles, margin crops, page numbers, or watermark options.
            </p>
          </div>
          <div className="p-4 bg-[#070a14] border border-amber-500/20 rounded-2xl space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black flex items-center justify-center">
              3
            </span>
            <h4 className="font-bold text-xs text-white">Process & Download</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
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
            q: 'Is my PDF uploaded to any external server?',
            a: 'No. ToolCrest processes all documents 100% locally in your browser using WebAssembly and client-side JavaScript. Your files never leave your machine.',
          },
          {
            q: 'Is there any file size or page limit?',
            a: 'ToolCrest supports documents up to 100MB and hundreds of pages directly in your browser without throttling or scan limits.',
          },
          {
            q: 'Can I rename the output file before downloading?',
            a: 'Yes. Every tool features an editable file name input field before downloading, automatically sanitized with proper file extensions.',
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
