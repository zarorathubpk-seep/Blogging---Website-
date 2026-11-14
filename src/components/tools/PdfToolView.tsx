import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url';
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
  pdfToMarkdownText,
  downloadBytesAsFile,
  downloadTextFile,
  SUPPORTED_LANGUAGES,
  CompareResult,
  CompressionResult,
  PdfSummaryResult,
} from '../../services/pdfEngine';
import {
  convertPdfToWord,
  convertPdfToPowerPoint,
  convertPdfToExcel,
  extractPdfImagesToZip,
  overlayPdfDocuments,
  translatePdfDocument,
  performPdfOcr,
  extractTextAndStructureFromPdf,
  parseDocxOrTextFile,
  parsePptxFile,
  parseSpreadsheetFile,
} from '../../services/documentConverter';
import {
  FileText,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  HelpCircle,
  RotateCw,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Plus,
  Archive,
  Sparkles,
  Languages,
  Copy,
  Check,
  Layers,
  Zap,
} from 'lucide-react';

import { AdvancedSplitPdfTool } from './AdvancedSplitPdfTool';
import { OrganizePdfTool } from './OrganizePdfTool';
import { ScanToPdfTool } from './ScanToPdfTool';
import { VisualPdfEditorTool } from './VisualPdfEditorTool';
import { FileUploadZone } from './FileUploadZone';
import { PdfDownloadSection } from './PdfDownloadSection';
import { ToolHeader } from './ToolHeader';
import { RelatedToolsSection } from './RelatedToolsSection';
import { FaqSection } from '../FaqSection';
import { getSuggestedDefaultFileName } from '../../utils/fileNaming';
import { useTheme } from '../../context/ThemeContext';

if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;
}

interface PdfToolViewProps {
  tool: ToolItem;
  onNavigate: (path: string) => void;
  onSelectTool: (slug: string) => void;
}

interface AcroFormFieldEntry {
  name: string;
  type: 'text' | 'checkbox' | 'dropdown';
  value: string | boolean;
  options?: string[];
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
  if (tool.id === 'edit-pdf') {
    return <VisualPdfEditorTool onNavigate={onNavigate} />;
  }

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedBytes, setProcessedBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  // Dynamic output extension & conversion states
  const [currentTargetExt, setCurrentTargetExt] = useState<
    'pdf' | 'docx' | 'pptx' | 'xlsx' | 'zip' | 'txt' | 'csv'
  >('pdf');
  const [ocrResultText, setOcrResultText] = useState<string>('');
  const [ocrProgress, setOcrProgress] = useState<string>('');
  const [conversionStatus, setConversionStatus] = useState<string>('');
  const [secondaryOverlayFile, setSecondaryOverlayFile] = useState<File | null>(null);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.65);

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

  // Redaction parameters & visual preview state
  const [redactionPreset, setRedactionPreset] = useState<'custom' | 'header' | 'footer' | 'address-block'>('header');
  const [redactionPage, setRedactionPage] = useState<number>(1);
  const [redactionX, setRedactionX] = useState<number>(50);
  const [redactionY, setRedactionY] = useState<number>(750);
  const [redactionWidth, setRedactionWidth] = useState<number>(240);
  const [redactionHeight, setRedactionHeight] = useState<number>(36);
  const [redactPreviewUrl, setRedactPreviewUrl] = useState<string | null>(null);
  const [redactPageSize, setRedactPageSize] = useState<{ width: number; height: number; totalPages: number }>({
    width: 595,
    height: 842,
    totalPages: 1,
  });

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

  // Form fields state (AcroForm inspection + fallback summary fields)
  const [acroFormFields, setAcroFormFields] = useState<AcroFormFieldEntry[]>([]);
  const [acroFormInspected, setAcroFormInspected] = useState<boolean>(false);
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

  // Render live visual redaction preview when file/page changes for redact-pdf
  useEffect(() => {
    let cancelled = false;
    if (tool.id !== 'redact-pdf' || selectedFiles.length === 0) {
      setRedactPreviewUrl(null);
      return;
    }

    (async () => {
      try {
        const buffer = await selectedFiles[0].arrayBuffer();
        const task = pdfjsLib.getDocument({ data: new Uint8Array(buffer), useSystemFonts: true });
        const doc = await task.promise;
        const clampedPage = Math.max(1, Math.min(redactionPage, doc.numPages));
        const page = await doc.getPage(clampedPage);
        const origVp = page.getViewport({ scale: 1.0 });
        const previewScale = Math.min(1.25, 520 / Math.max(1, origVp.width));
        const vp = page.getViewport({ scale: previewScale });

        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(vp.width);
        canvas.height = Math.floor(vp.height);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          await page.render({ canvasContext: ctx, viewport: vp }).promise;
          const url = canvas.toDataURL('image/png');
          canvas.width = 0;
          canvas.height = 0;
          if (!cancelled) {
            setRedactPreviewUrl(url);
            setRedactPageSize({
              width: origVp.width,
              height: origVp.height,
              totalPages: doc.numPages,
            });
          }
        }
        if (typeof doc.destroy === 'function') doc.destroy();
      } catch {
        if (!cancelled) setRedactPreviewUrl(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tool.id, selectedFiles, redactionPage]);

  const handleFilesSelected = async (filesArr: File[]) => {
    if (filesArr.length === 0) return;

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
    setAcroFormFields([]);
    setAcroFormInspected(false);

    const primary = filesArr[0];
    try {
      if (tool.id === 'word-to-pdf') {
        const parsed = await parseDocxOrTextFile(primary);
        setCustomTitle(parsed.title);
        setCustomBody(parsed.content);
      } else if (tool.id === 'powerpoint-to-pdf') {
        const parsed = await parsePptxFile(primary);
        setCustomTitle(parsed.title);
        setSlides(parsed.slides);
      } else if (tool.id === 'excel-to-pdf') {
        const parsed = await parseSpreadsheetFile(primary);
        setCustomTitle(parsed.title);
        setTableHeaders(parsed.headers);
        setTableRows(parsed.rows);
      } else if (tool.id === 'pdf-forms') {
        const buf = await primary.arrayBuffer();
        const pdfDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
        const form = pdfDoc.getForm();
        const fields = form.getFields();
        const detected: AcroFormFieldEntry[] = [];
        for (const f of fields) {
          if (f instanceof PDFTextField) {
            detected.push({ name: f.getName(), type: 'text', value: f.getText() || '' });
          } else if (f instanceof PDFCheckBox) {
            detected.push({ name: f.getName(), type: 'checkbox', value: f.isChecked() });
          } else if (f instanceof PDFDropdown) {
            detected.push({
              name: f.getName(),
              type: 'dropdown',
              value: f.getSelected()[0] || '',
              options: f.getOptions(),
            });
          }
        }
        setAcroFormFields(detected);
        setAcroFormInspected(true);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || `Could not inspect uploaded file "${primary.name}".`);
    }
  };

  const removeFile = (idx: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
    setProcessedBytes(null);
    setAcroFormFields([]);
    setAcroFormInspected(false);
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
        tool.id === 'excel-to-pdf' ||
        tool.id === 'pdf-summarizer' ||
        tool.id === 'translate-pdf' ||
        tool.id === 'pdf-to-markdown' ||
        tool.id === 'pdf-converter';

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
          if (comp.newSize < comp.originalSize) {
            setSuccessInfo(
              `Optimized! Size reduced from ${(comp.originalSize / 1024).toFixed(1)} KB to ${(comp.newSize / 1024).toFixed(1)} KB (${comp.savingsPercent}% savings).`
            );
          } else {
            setSuccessInfo(
              `Rebuilt document (${(comp.originalSize / 1024).toFixed(1)} KB → ${(comp.newSize / 1024).toFixed(1)} KB). This PDF already uses compact streams and cannot be reduced further losslessly.`
            );
          }
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

        case 'pdf-to-pdfa': {
          if (!primaryFile) throw new Error('Please select a PDF file to convert to PDF/A.');
          resultBytes = await pdfToPdfA(primaryFile);
          setCurrentTargetExt('pdf');
          setSuccessInfo(
            'Prepared PDF/A-1b metadata, sRGB OutputIntent, and uncompressed streams. Note: formal ISO 19005-1b compliance has NOT been established or validated (an external validator such as veraPDF is required).'
          );
          break;
        }

        case 'word-to-pdf': {
          let docTitle = customTitle;
          let textToConvert = customBody;
          if (primaryFile) {
            const parsed = await parseDocxOrTextFile(primaryFile);
            docTitle = customTitle || parsed.title;
            textToConvert = customBody || parsed.content;
          }
          if (!textToConvert.trim()) {
            throw new Error('Please upload a .docx/.txt file or enter document text to convert.');
          }
          resultBytes = await convertDocToPdf(docTitle, textToConvert);
          setCurrentTargetExt('pdf');
          setSuccessInfo('Document converted to styled PDF.');
          break;
        }

        case 'powerpoint-to-pdf': {
          if (slides.length === 0) {
            throw new Error('Please add at least one slide or upload a .pptx file.');
          }
          resultBytes = await convertSlideDeckToPdf(customTitle, slides);
          setCurrentTargetExt('pdf');
          setSuccessInfo(`Presentation (${slides.length} slides) converted to 16:9 PDF slide deck.`);
          break;
        }

        case 'excel-to-pdf': {
          if (tableHeaders.length === 0) {
            throw new Error('Please upload an Excel/CSV file or define table columns.');
          }
          resultBytes = await convertTableToPdf(customTitle, tableHeaders, tableRows);
          setCurrentTargetExt('pdf');
          setSuccessInfo(`Spreadsheet data (${tableRows.length} rows) converted into paginated PDF table.`);
          break;
        }

        case 'pdf-to-word': {
          if (!primaryFile) throw new Error('Please select a PDF file to convert to Microsoft Word.');
          const docxBlob = await convertPdfToWord(primaryFile);
          const buf = await docxBlob.arrayBuffer();
          resultBytes = new Uint8Array(buf);
          setCurrentTargetExt('docx');
          setSuccessInfo('Extracted text and converted into genuine Microsoft Word (.docx) document.');
          break;
        }

        case 'pdf-to-powerpoint': {
          if (!primaryFile) throw new Error('Please select a PDF file to convert to PowerPoint.');
          setConversionStatus('Rendering presentation slides...');
          const pptxBlob = await convertPdfToPowerPoint(primaryFile, (cur, tot) => {
            setConversionStatus(`Rendering slide ${cur} of ${tot}...`);
          });
          const buf = await pptxBlob.arrayBuffer();
          resultBytes = new Uint8Array(buf);
          setCurrentTargetExt('pptx');
          setSuccessInfo('PDF pages rendered into genuine Microsoft PowerPoint (.pptx) presentation.');
          break;
        }

        case 'pdf-to-excel': {
          if (!primaryFile) throw new Error('Please select a PDF file to extract table data.');
          const xlsxBlob = await convertPdfToExcel(primaryFile);
          const buf = await xlsxBlob.arrayBuffer();
          resultBytes = new Uint8Array(buf);
          setCurrentTargetExt('xlsx');
          setSuccessInfo('Extracted tabular records into genuine Excel (.xlsx) workbook.');
          break;
        }

        case 'pdf-to-images':
        case 'extract-pdf-images': {
          if (!primaryFile) throw new Error('Please select a PDF file to extract images.');
          setConversionStatus('Extracting images from pages...');
          const { zipBlob, count } = await extractPdfImagesToZip(primaryFile, (cur, tot) => {
            setConversionStatus(`Extracting page ${cur} of ${tot}...`);
          });
          const buf = await zipBlob.arrayBuffer();
          resultBytes = new Uint8Array(buf);
          setCurrentTargetExt('zip');
          setSuccessInfo(`Extracted ${count} high-resolution image pages and packaged into ZIP archive.`);
          break;
        }

        case 'pdf-ocr': {
          if (!primaryFile) throw new Error('Please select a PDF file to run OCR.');
          setOcrProgress('Initializing OCR engine...');
          const ocrRes = await performPdfOcr(primaryFile, (info) => {
            setOcrProgress(info.status);
          });
          setOcrResultText(ocrRes.fullText);
          resultBytes = ocrRes.textPdfBytes;
          setCurrentTargetExt('pdf');
          setSuccessInfo('Optical Character Recognition completed. Searchable text layer and document generated.');
          break;
        }

        case 'overlay-pdf': {
          if (!primaryFile) throw new Error('Please select a primary PDF document.');
          const secondaryDoc = secondaryOverlayFile || (selectedFiles.length > 1 ? selectedFiles[1] : null);
          if (!secondaryDoc) {
            throw new Error('Please upload an overlay PDF template to superimpose onto your document.');
          }
          resultBytes = await overlayPdfDocuments(primaryFile, secondaryDoc, { opacity: overlayOpacity });
          setCurrentTargetExt('pdf');
          setSuccessInfo('Successfully overlaid background template onto PDF pages.');
          break;
        }

        case 'pdf-summarizer': {
          let textToSummarize = '';
          if (primaryFile) {
            const extracted = await extractTextAndStructureFromPdf(primaryFile);
            textToSummarize = extracted.fullText.trim();
            if (!textToSummarize) {
              throw new Error(
                'No selectable text found in this PDF (it may be a scanned image). Run OCR PDF first or paste text below.'
              );
            }
          } else {
            textToSummarize = customBody.trim();
            if (!textToSummarize) {
              throw new Error('Please upload a PDF document or paste text to summarize.');
            }
          }
          const summary = summarizePdfText(textToSummarize);
          setSummaryResult(summary);
          setCurrentTargetExt('pdf');
          setSuccessInfo(
            `Extractive summary generated from ${primaryFile ? primaryFile.name : 'entered text'} (${summary.metrics.wordCount} words analyzed locally).`
          );
          break;
        }

        case 'translate-pdf': {
          const langLabel =
            SUPPORTED_LANGUAGES.find((l) => l.code === targetLanguage)?.label || targetLanguage;
          const tr = await translatePdfDocument(primaryFile || null, langLabel, customBody);
          setTranslatedContent(tr.translatedText);
          resultBytes = tr.pdfBytes;
          setCurrentTargetExt('pdf');
          setSuccessInfo(`Extracted ${tr.sourceExtractedChars} characters and translated into ${langLabel}.`);
          break;
        }

        case 'pdf-to-markdown': {
          let sourceText = customBody;
          if (primaryFile) {
            const extracted = await extractTextAndStructureFromPdf(primaryFile);
            if (!extracted.fullText.trim()) {
              throw new Error('No extractable text found in this PDF. Try OCR PDF first or enter text manually.');
            }
            sourceText = extracted.fullText;
          }
          if (!sourceText.trim()) {
            throw new Error('Please upload a PDF document or enter text to convert to Markdown.');
          }
          const md = pdfToMarkdownText(primaryFile?.name || customTitle, sourceText);
          setMarkdownOutput(md);
          downloadTextFile(md, `${(primaryFile?.name || 'document').replace(/\.pdf$/i, '')}.md`, 'text/markdown');
          setSuccessInfo('Converted extracted document text into GitHub-flavored Markdown (.md).');
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
            .filter((p) => !isNaN(p) && p > 0);
          if (pagesToRemove.length === 0) {
            throw new Error('Please enter valid page numbers to remove (e.g., 2, 4).');
          }
          resultBytes = await removePdfPages(primaryFile, pagesToRemove);
          setSuccessInfo(`Removed ${pagesToRemove.length} selected page${pagesToRemove.length === 1 ? '' : 's'}.`);
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
            zones = [{ page: redactionPage, x: 40, y: Math.max(0, redactPageSize.height - 72), width: Math.max(100, redactPageSize.width - 80), height: 48, label: 'Header Margin' }];
          } else if (redactionPreset === 'footer') {
            zones = [{ page: redactionPage, x: 40, y: 24, width: Math.max(100, redactPageSize.width - 80), height: 48, label: 'Footer Margin' }];
          } else if (redactionPreset === 'address-block') {
            zones = [
              { page: redactionPage, x: 48, y: Math.max(0, redactPageSize.height - 165), width: 240, height: 65, label: 'Address & Contact Block' },
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
          setSuccessInfo(`Permanently raster-blacked out ${zones.length} zone(s) on Page ${redactionPage} with underlying text streams eradicated.`);
          break;
        }

        case 'pdf-forms': {
          if (acroFormFields.length > 0 && primaryFile) {
            const buf = await primaryFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
            const form = pdfDoc.getForm();
            for (const entry of acroFormFields) {
              try {
                if (entry.type === 'text') {
                  form.getTextField(entry.name).setText(String(entry.value || ''));
                } else if (entry.type === 'checkbox') {
                  const cb = form.getCheckBox(entry.name);
                  if (entry.value) cb.check();
                  else cb.uncheck();
                } else if (entry.type === 'dropdown' && entry.value) {
                  form.getDropdown(entry.name).select(String(entry.value));
                }
              } catch {
                // ignore field write mismatch for unsupported sub-widgets
              }
            }
            form.flatten();
            resultBytes = await pdfDoc.save();
            setSuccessInfo(`Updated and flattened ${acroFormFields.length} AcroForm fields directly inside ${primaryFile.name}.`);
          } else {
            const formText = `Form Submission Summary Sheet:\nReference File: ${primaryFile?.name || 'Manual Entry'}\nName: ${formFields.fullName}\nEmail: ${formFields.email}\nTerms Accepted: ${formFields.agreeTerms ? 'Yes' : 'No'}\nNotes: ${formFields.comments}`;
            resultBytes = await convertDocToPdf(`Form - ${primaryFile?.name || 'Submission Sheet'}`, formText);
            setSuccessInfo(
              primaryFile
                ? 'Uploaded PDF contained no interactive AcroForm fields; generated a separate Form Submission Summary PDF instead.'
                : 'Form Submission Summary PDF generated.'
            );
          }
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
        {/* Drag-and-Drop Upload Zone */}
        {tool.id !== 'create-pdf' && tool.id !== 'webpage-to-pdf' && (
          <FileUploadZone
            accept={
              tool.id === 'images-to-pdf'
                ? 'image/*,.jpg,.jpeg,.png,.webp'
                : tool.id === 'word-to-pdf'
                ? '.docx,.txt,.md,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain'
                : tool.id === 'powerpoint-to-pdf'
                ? '.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation'
                : tool.id === 'excel-to-pdf'
                ? '.xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv'
                : '.pdf,application/pdf'
            }
            multiple={
              tool.id === 'merge-pdf' ||
              tool.id === 'images-to-pdf' ||
              tool.id === 'compare-pdfs'
            }
            fileTypeLabel={
              tool.id === 'word-to-pdf'
                ? 'DOCX (.docx), Plain Text (.txt, .md)'
                : tool.id === 'powerpoint-to-pdf'
                ? 'PowerPoint (.pptx)'
                : tool.id === 'excel-to-pdf'
                ? 'Excel (.xlsx, .xls) or CSV (.csv)'
                : tool.id === 'images-to-pdf'
                ? 'Images (JPG, PNG, WebP)'
                : 'PDF (.pdf)'
            }
            title={
              tool.id === 'word-to-pdf'
                ? 'Drag & drop .docx / .txt file (or type content below)'
                : tool.id === 'powerpoint-to-pdf'
                ? 'Drag & drop .pptx presentation (or build slides below)'
                : tool.id === 'excel-to-pdf'
                ? 'Drag & drop .xlsx / .csv file (or edit table below)'
                : tool.id === 'merge-pdf' || tool.id === 'compare-pdfs'
                ? 'Choose or drag multiple PDF files here'
                : 'Choose or drag your PDF document here'
            }
            onFilesSelected={handleFilesSelected}
          />
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
                <span>PDF/A-1b Archival Preparation Notice:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                <li>Embeds XMP PDF/A-1b identification metadata and standard sRGB OutputIntent dictionary</li>
                <li>Serializes uncompressed PDF object streams (useObjectStreams: false) for archival compatibility</li>
                <li className="text-amber-300/90">Important disclosure: ISO 19005-1b archival compliance has NOT been established or validated by this browser tool. Always run an external validator (such as veraPDF) before submitting regulated archival records.</li>
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
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 leading-relaxed">
                <strong>AI Backend Disclosure:</strong> Extracted document text (up to 12,000 characters) is transmitted securely to the ToolCrest AI backend (<code className="font-mono">/api/translate</code>) for translation. If a PDF is uploaded above, its extracted text will be translated automatically; otherwise, the text box below is translated.
              </div>
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
                  Fallback / Direct Text to Translate {selectedFiles.length > 0 && '(Uploaded PDF takes priority)'}
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

          {/* PDF OCR RECOGNITION OPTIONS */}
          {tool.id === 'pdf-ocr' && (
            <div className="p-4 bg-[#0c111e] rounded-2xl border border-amber-500/25 space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Optical Character Recognition (OCR) Engine</span>
              </div>
              <p className="text-xs text-slate-300">
                Extracts machine-readable text from scanned PDF documents and image layers in-browser using Tesseract OCR.
              </p>
              {ocrProgress && (
                <div className="p-3 bg-slate-900 border border-amber-500/30 rounded-xl flex items-center gap-2.5 text-xs text-amber-300 font-mono">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
                  <span>{ocrProgress}</span>
                </div>
              )}
            </div>
          )}

          {/* PDF OVERLAY CONTROLS */}
          {tool.id === 'overlay-pdf' && (
            <div className="p-4 bg-[#0c111e] rounded-2xl border border-amber-500/25 space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Overlay PDF Template / Background</span>
              </div>
              <p className="text-xs text-slate-300">
                Superimpose a letterhead, watermark background, or secondary PDF template onto every page of your primary document.
              </p>
              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1.5">
                  Secondary PDF File (Overlay Template)
                </label>
                <FileUploadZone
                  compact
                  accept=".pdf,application/pdf"
                  multiple={false}
                  title={
                    secondaryOverlayFile
                      ? `Overlay Selected: ${secondaryOverlayFile.name} (${(secondaryOverlayFile.size / 1024).toFixed(1)} KB)`
                      : 'Drag & drop or click to select Overlay PDF Template'
                  }
                  onFilesSelected={(files) => {
                    if (files[0]) setSecondaryOverlayFile(files[0]);
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1">
                  Overlay Opacity: {Math.round(overlayOpacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>
            </div>
          )}

          {/* PDF FORMS FILLER */}
          {tool.id === 'pdf-forms' && (
            <div className="space-y-3">
              {acroFormInspected && acroFormFields.length > 0 ? (
                <div className="space-y-3">
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs">
                    Detected <strong>{acroFormFields.length}</strong> interactive AcroForm field(s) inside {selectedFiles[0]?.name}. Edit values below to fill and flatten directly into the PDF:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {acroFormFields.map((field, idx) => (
                      <div key={field.name + idx} className="bg-[#0c111e] border border-amber-500/25 rounded-xl p-3 space-y-1.5">
                        <label className="block text-[11px] font-bold text-amber-200 truncate" title={field.name}>
                          {field.name} ({field.type})
                        </label>
                        {field.type === 'checkbox' ? (
                          <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(field.value)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setAcroFormFields((prev) =>
                                  prev.map((f, i) => (i === idx ? { ...f, value: checked } : f))
                                );
                              }}
                              className="w-4 h-4 accent-amber-400"
                            />
                            <span>{field.value ? 'Checked' : 'Unchecked'}</span>
                          </label>
                        ) : field.type === 'dropdown' && field.options && field.options.length > 0 ? (
                          <select
                            value={String(field.value || '')}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAcroFormFields((prev) =>
                                prev.map((f, i) => (i === idx ? { ...f, value: val } : f))
                              );
                            }}
                            className="w-full text-xs bg-[#070a14] border border-slate-700 text-white rounded-lg px-2.5 py-1.5"
                          >
                            <option value="">Select option...</option>
                            {field.options.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={String(field.value || '')}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAcroFormFields((prev) =>
                                prev.map((f, i) => (i === idx ? { ...f, value: val } : f))
                              );
                            }}
                            className="w-full text-xs bg-[#070a14] border border-slate-700 text-white rounded-lg px-2.5 py-1.5"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {acroFormInspected && acroFormFields.length === 0 && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
                      <strong>No interactive AcroForm fields detected</strong> in {selectedFiles[0]?.name}. You can either use the Visual PDF Editor to type text directly onto the flat PDF pages, or generate a Form Submission Summary Sheet below.
                    </div>
                  )}
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

              {/* Live Visual Coordinate Preview */}
              {redactPreviewUrl && (() => {
                const zone =
                  redactionPreset === 'header'
                    ? { x: 40, y: Math.max(0, redactPageSize.height - 72), width: Math.max(100, redactPageSize.width - 80), height: 48 }
                    : redactionPreset === 'footer'
                    ? { x: 40, y: 24, width: Math.max(100, redactPageSize.width - 80), height: 48 }
                    : redactionPreset === 'address-block'
                    ? { x: 48, y: Math.max(0, redactPageSize.height - 165), width: 240, height: 65 }
                    : { x: redactionX, y: redactionY, width: redactionWidth, height: redactionHeight };

                const leftPct = (zone.x / Math.max(1, redactPageSize.width)) * 100;
                const topPct = ((redactPageSize.height - zone.y - zone.height) / Math.max(1, redactPageSize.height)) * 100;
                const widthPct = (zone.width / Math.max(1, redactPageSize.width)) * 100;
                const heightPct = (zone.height / Math.max(1, redactPageSize.height)) * 100;

                return (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Visual Zone Preview (Page {Math.min(redactionPage, redactPageSize.totalPages)} of {redactPageSize.totalPages})</span>
                      <span className="font-mono">{Math.round(redactPageSize.width)}×{Math.round(redactPageSize.height)} pt</span>
                    </div>
                    <div className="relative w-full max-w-md mx-auto border border-slate-700 rounded-xl overflow-hidden bg-white shadow-lg">
                      <img src={redactPreviewUrl} alt="Redaction Page Preview" className="w-full h-auto block" />
                      <div
                        className="absolute bg-rose-600/45 border-2 border-rose-500 pointer-events-none"
                        style={{
                          left: `${Math.max(0, Math.min(100, leftPct))}%`,
                          top: `${Math.max(0, Math.min(100, topPct))}%`,
                          width: `${Math.max(1, Math.min(100, widthPct))}%`,
                          height: `${Math.max(1, Math.min(100, heightPct))}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })()}

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Target pages are rasterized at 2x DPI before burning solid blackout pixels into the pixel buffer, permanently eradicating underlying text and vector streams inside the redacted zone.
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
                <span>Executive Extractive Summary</span>
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

        {/* Conversion Progress Status */}
        {conversionStatus && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2.5 text-xs text-amber-300 font-mono">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
            <span>{conversionStatus}</span>
          </div>
        )}

        {/* OCR Extracted Text Preview Card */}
        {ocrResultText && (
          <div className="p-4 bg-[#070a14] rounded-2xl border border-amber-500/30 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>OCR Extracted Text ({ocrResultText.split(/\s+/).filter(Boolean).length} words)</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(ocrResultText)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-amber-300 font-semibold flex items-center gap-1 border border-slate-700 cursor-pointer"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? 'Copied' : 'Copy Text'}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    downloadTextFile(
                      ocrResultText,
                      `${selectedFiles[0]?.name?.replace(/\.pdf$/i, '') || 'ocr'}_extracted.txt`,
                      'text/plain;charset=utf-8'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-xs text-amber-300 font-semibold flex items-center gap-1 border border-amber-500/40 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .txt</span>
                </button>
              </div>
            </div>
            <textarea
              readOnly
              rows={6}
              value={ocrResultText}
              className="w-full text-xs bg-[#0c111e] border border-slate-800 text-slate-200 rounded-xl p-3 font-mono focus:outline-hidden"
            />
          </div>
        )}

        {/* Translated Text Preview Card */}
        {translatedContent && (
          <div className="p-4 bg-[#070a14] rounded-2xl border border-amber-500/30 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-amber-400" />
                <span>Translated Document Preview</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(translatedContent)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-amber-300 font-semibold flex items-center gap-1 border border-slate-700 cursor-pointer"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    downloadTextFile(
                      translatedContent,
                      `${selectedFiles[0]?.name?.replace(/\.pdf$/i, '') || 'document'}_translated.txt`,
                      'text/plain;charset=utf-8'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-xs text-amber-300 font-semibold flex items-center gap-1 border border-amber-500/40 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .txt</span>
                </button>
              </div>
            </div>
            <textarea
              readOnly
              rows={5}
              value={translatedContent}
              className="w-full text-xs bg-[#0c111e] border border-slate-800 text-slate-200 rounded-xl p-3 font-mono focus:outline-hidden"
            />
          </div>
        )}

        {/* Download Section */}
        {processedBytes && (
          <div className="pt-2">
            <PdfDownloadSection
              processedBytes={processedBytes}
              defaultFileName={getSuggestedDefaultFileName(selectedFiles[0]?.name, tool.slug)}
              targetExtension={currentTargetExt}
              statusMessage={successInfo}
              originalSizeBytes={selectedFiles[0]?.size}
              onReset={() => {
                setProcessedBytes(null);
                setSuccessInfo(null);
                setConversionStatus('');
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
            a:
              tool.id === 'translate-pdf'
                ? 'PDF parsing runs locally in your browser; only the extracted text snippet (up to 12,000 characters) is sent over encrypted HTTPS to the ToolCrest backend for Gemini AI translation and is not permanently stored.'
                : 'No. ToolCrest processes this document locally in your browser using client-side JavaScript and WebAssembly. Your file never leaves your device.',
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
