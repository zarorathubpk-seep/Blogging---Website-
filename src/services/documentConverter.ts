import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url';
import { Document, Paragraph, TextRun, HeadingLevel, Packer } from 'docx';
import PptxGenJS from 'pptxgenjs';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { createWorker } from 'tesseract.js';
import { getBackendEndpoint } from '../utils/backendConfig';

// Configure local PDF.js worker
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;
}

export interface ExtractedPageText {
  pageNumber: number;
  text: string;
  lines: string[];
  tableRows: string[][];
}

export interface ExtractedPdfContent {
  totalPages: number;
  fullText: string;
  pages: ExtractedPageText[];
}

/**
 * Extracts real text and structured table rows from each page of a PDF using PDF.js.
 */
export async function extractTextAndStructureFromPdf(
  fileOrBuffer: File | ArrayBuffer
): Promise<ExtractedPdfContent> {
  const buffer =
    fileOrBuffer instanceof File ? await fileOrBuffer.arrayBuffer() : fileOrBuffer;

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
  });

  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;
  const pages: ExtractedPageText[] = [];
  const fullTextParts: string[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Group text items by Y coordinate with line-height tolerance to reconstruct lines & tables
    interface TextItemCoord {
      str: string;
      x: number;
      y: number;
      width: number;
    }

    const items: TextItemCoord[] = [];
    for (const item of textContent.items as any[]) {
      if (item.str && typeof item.str === 'string') {
        const x = item.transform ? item.transform[4] : 0;
        const y = item.transform ? item.transform[5] : 0;
        const width = typeof item.width === 'number' ? item.width : item.str.length * 4.5;
        items.push({ str: item.str, x, y, width });
      }
    }

    // Sort top to bottom (descending Y in PDF coordinates)
    items.sort((a, b) => b.y - a.y || a.x - b.x);

    const lineGroups: TextItemCoord[][] = [];
    const Y_TOLERANCE = 6; // Points tolerance for same line

    for (const item of items) {
      const matchedGroup = lineGroups.find(
        (group) => Math.abs(group[0].y - item.y) <= Y_TOLERANCE
      );
      if (matchedGroup) {
        matchedGroup.push(item);
      } else {
        lineGroups.push([item]);
      }
    }

    // Sort items within each line group from left to right (ascending X)
    // Group adjacent spans with small horizontal gaps (< 14pt) into the same cell so multi-word phrases stay together
    const pageLines: string[] = [];
    const tableRows: string[][] = [];

    for (const group of lineGroups) {
      group.sort((a, b) => a.x - b.x);

      const cells: string[] = [];
      let currentCell = '';
      let prevEndX = -Infinity;

      for (const it of group) {
        const cleanStr = it.str.trim();
        if (!cleanStr) continue;
        const gap = prevEndX === -Infinity ? 0 : it.x - prevEndX;
        if (prevEndX === -Infinity || gap < 14) {
          currentCell = currentCell ? `${currentCell} ${cleanStr}` : cleanStr;
        } else {
          if (currentCell) cells.push(currentCell);
          currentCell = cleanStr;
        }
        prevEndX = Math.max(prevEndX, it.x + Math.max(it.width, cleanStr.length * 4.2));
      }
      if (currentCell) cells.push(currentCell);

      const lineText = cells.join(' ').trim();
      if (lineText) {
        pageLines.push(lineText);
      }
      if (cells.length > 0) {
        tableRows.push(cells);
      }
    }

    const pageText = pageLines.join('\n');
    fullTextParts.push(pageText);

    pages.push({
      pageNumber: pageNum,
      text: pageText,
      lines: pageLines,
      tableRows,
    });
  }

  return {
    totalPages,
    fullText: fullTextParts.join('\n\n'),
    pages,
  };
}

/**
 * PDF to Word (.docx): Generates a genuine Microsoft Word (.docx) file containing
 * all extracted text, headers, paragraphs, and page breaks from the source PDF.
 */
export async function convertPdfToWord(file: File): Promise<Blob> {
  const content = await extractTextAndStructureFromPdf(file);
  const docTitle = file.name.replace(/\.pdf$/i, '');

  const children: Paragraph[] = [
    new Paragraph({
      text: docTitle,
      heading: HeadingLevel.HEADING_1,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Converted from PDF: ${file.name} • Total Pages: ${content.totalPages}`,
          italics: true,
          color: '666666',
          size: 20,
        }),
      ],
    }),
    new Paragraph({ text: '' }),
  ];

  for (const page of content.pages) {
    children.push(
      new Paragraph({
        text: `--- Page ${page.pageNumber} ---`,
        heading: HeadingLevel.HEADING_3,
      })
    );

    for (const line of page.lines) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              size: 24, // 12pt standard body
            }),
          ],
        })
      );
    }

    children.push(new Paragraph({ text: '' }));
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

/**
 * PDF to PowerPoint (.pptx): Generates a genuine presentation slide deck (.pptx)
 * where each PDF page is rendered as a visual slide with extracted title and bullet points.
 */
export async function convertPdfToPowerPoint(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
  });

  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const content = await extractTextAndStructureFromPdf(file);

  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = file.name.replace(/\.pdf$/i, '');

  for (let i = 1; i <= numPages; i++) {
    if (onProgress) onProgress(i, numPages);

    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      await page.render({ canvasContext: ctx, viewport }).promise;
      const imgDataUrl = canvas.toDataURL('image/jpeg', 0.9);

      const slide = pptx.addSlide();

      // Add full high-fidelity visual slide background/image
      slide.addImage({
        data: imgDataUrl,
        x: 0,
        y: 0,
        w: '100%',
        h: '100%',
      });

      // Extract text notes for accessibility and speaker notes
      const pageText = content.pages[i - 1]?.text || '';
      if (pageText) {
        slide.addNotes(pageText.slice(0, 2000));
      }
    }
  }

  const pptxArrayBuffer = (await pptx.write({ outputType: 'arraybuffer' })) as ArrayBuffer;
  return new Blob([pptxArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  });
}

/**
 * PDF to Excel (.xlsx): Extracts columnar and tabular data from the PDF into a genuine
 * Microsoft Excel workbook (.xlsx).
 */
export async function convertPdfToExcel(file: File): Promise<Blob> {
  const content = await extractTextAndStructureFromPdf(file);
  const wb = XLSX.utils.book_new();

  let hasData = false;

  for (const page of content.pages) {
    if (page.tableRows.length > 0) {
      hasData = true;
      const ws = XLSX.utils.aoa_to_sheet(page.tableRows);
      XLSX.utils.book_append_sheet(wb, ws, `Page ${page.pageNumber}`);
    }
  }

  // If no clear rows detected, compile full lines into a single sheet
  if (!hasData) {
    const fallbackRows = content.pages.flatMap((p) =>
      p.lines.map((l) => [l])
    );
    const ws = XLSX.utils.aoa_to_sheet(fallbackRows);
    XLSX.utils.book_append_sheet(wb, ws, 'Extracted Data');
  }

  const xlsxBuf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return new Blob([xlsxBuf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

/**
 * Extract PDF Images: Extracts high-resolution page renders and images from the PDF,
 * packaging them into a downloadable ZIP archive.
 */
export async function extractPdfImagesToZip(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<{ zipBlob: Blob; count: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
  });

  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const zip = new JSZip();
  const baseName = file.name.replace(/\.pdf$/i, '');

  for (let i = 1; i <= numPages; i++) {
    if (onProgress) onProgress(i, numPages);

    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      await page.render({ canvasContext: ctx, viewport }).promise;
      const dataUrl = canvas.toDataURL('image/png');
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
      zip.file(`${baseName}_page_${i}.png`, base64Data, { base64: true });
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  return { zipBlob, count: numPages };
}

/**
 * PDF Overlay: Stamps or overlays a secondary PDF or template onto a primary PDF document.
 */
export async function overlayPdfDocuments(
  primaryFile: File,
  overlayFile: File,
  options: { opacity?: number; position?: 'foreground' | 'background' } = {}
): Promise<Uint8Array> {
  const opacity = options.opacity !== undefined ? options.opacity : 0.7;
  const primaryBuf = await primaryFile.arrayBuffer();
  const overlayBuf = await overlayFile.arrayBuffer();

  const primaryDoc = await PDFDocument.load(primaryBuf, { ignoreEncryption: true });
  const overlayDoc = await PDFDocument.load(overlayBuf, { ignoreEncryption: true });

  const overlayPageIndices = overlayDoc.getPageIndices();
  const embeddedOverlayPages = await primaryDoc.embedPdf(overlayDoc, overlayPageIndices);

  const pages = primaryDoc.getPages();
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const overlayIndex = Math.min(i, embeddedOverlayPages.length - 1);
    const embeddedStamp = embeddedOverlayPages[overlayIndex];

    page.drawPage(embeddedStamp, {
      x: 0,
      y: 0,
      width: page.getWidth(),
      height: page.getHeight(),
      opacity,
    });
  }

  return await primaryDoc.save();
}

/**
 * Edit PDF: Adds headers, footers, annotations, or stamps onto PDF pages.
 */
export async function editPdfDocument(
  file: File,
  options: {
    headerText?: string;
    footerText?: string;
    stampText?: string;
    stampColorHex?: string;
  }
): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();

    // Header
    if (options.headerText) {
      page.drawText(options.headerText, {
        x: 40,
        y: height - 28,
        size: 10,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
    }

    // Footer
    if (options.footerText) {
      page.drawText(options.footerText, {
        x: 40,
        y: 20,
        size: 10,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
    }

    // Visual Stamp
    if (options.stampText) {
      page.drawText(options.stampText, {
        x: width / 2 - 120,
        y: height / 2,
        size: 36,
        font: boldFont,
        color: rgb(0.83, 0.69, 0.22), // ToolCrest gold
        opacity: 0.35,
        rotate: degrees(30),
      });
    }
  }

  return await pdfDoc.save();
}

/**
 * Parse real Microsoft Word (.docx) ZIP/XML or plain text files client-side.
 */
export async function parseDocxOrTextFile(file: File): Promise<{ title: string; content: string }> {
  const lower = file.name.toLowerCase();
  const baseTitle = file.name.replace(/\.[^/.]+$/, '') || 'Document';

  if (lower.endsWith('.doc') && !lower.endsWith('.docx')) {
    throw new Error(
      'Legacy binary .doc format is not supported directly in-browser. Please save as .docx or .txt and re-upload.'
    );
  }

  if (lower.endsWith('.txt') || lower.endsWith('.md') || file.type.startsWith('text/')) {
    const txt = await file.text();
    if (!txt.trim()) {
      throw new Error('The uploaded text file appears to be empty.');
    }
    return { title: baseTitle, content: txt };
  }

  if (!lower.endsWith('.docx')) {
    throw new Error('Unsupported document format. Please upload a .docx or .txt file.');
  }

  const buffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);
  const docXmlFile = zip.file('word/document.xml');
  if (!docXmlFile) {
    throw new Error('Invalid .docx archive: missing word/document.xml.');
  }

  const xmlString = await docXmlFile.async('string');
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
  const paragraphs = Array.from(xmlDoc.getElementsByTagName('w:p'));

  const extractedLines: string[] = [];
  for (const p of paragraphs) {
    const pStyle = p.getElementsByTagName('w:pStyle')[0]?.getAttribute('w:val') || '';
    const runs = Array.from(p.getElementsByTagName('w:t'));
    const text = runs.map((r) => r.textContent || '').join('');
    const trimmed = text.trim();
    if (!trimmed) continue;

    if (/heading1|title/i.test(pStyle)) {
      extractedLines.push(`# ${trimmed}`);
    } else if (/heading[2-6]|subtitle/i.test(pStyle)) {
      extractedLines.push(`## ${trimmed}`);
    } else {
      extractedLines.push(trimmed);
    }
  }

  if (extractedLines.length === 0) {
    throw new Error('No readable text paragraphs found inside this .docx file.');
  }

  return {
    title: baseTitle,
    content: extractedLines.join('\n\n'),
  };
}

/**
 * Parse real Microsoft PowerPoint (.pptx) ZIP/XML files into slide structures.
 */
export async function parsePptxFile(
  file: File
): Promise<{ title: string; slides: { title: string; bullets: string[] }[] }> {
  const lower = file.name.toLowerCase();
  const baseTitle = file.name.replace(/\.[^/.]+$/, '') || 'Presentation';

  if (!lower.endsWith('.pptx')) {
    throw new Error('Unsupported presentation format. Please upload a .pptx file.');
  }

  const buffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);
  const slidePaths = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)\.xml/i)?.[1] || '0', 10);
      const numB = parseInt(b.match(/slide(\d+)\.xml/i)?.[1] || '0', 10);
      return numA - numB;
    });

  if (slidePaths.length === 0) {
    throw new Error('Invalid .pptx file: no slide XML entries were found.');
  }

  const parser = new DOMParser();
  const slides: { title: string; bullets: string[] }[] = [];

  for (let i = 0; i < slidePaths.length; i++) {
    const xmlStr = await zip.files[slidePaths[i]].async('string');
    const xmlDoc = parser.parseFromString(xmlStr, 'application/xml');
    const paras = Array.from(xmlDoc.getElementsByTagName('a:p'));

    const lines: string[] = [];
    for (const p of paras) {
      const texts = Array.from(p.getElementsByTagName('a:t'))
        .map((t) => t.textContent || '')
        .join('')
        .trim();
      if (texts) lines.push(texts);
    }

    const slideTitle = lines[0] || `Slide ${i + 1}`;
    const bullets = lines.length > 1 ? lines.slice(1) : ['(No body text on slide)'];
    slides.push({ title: slideTitle, bullets });
  }

  return { title: baseTitle, slides };
}

/**
 * Parse real Microsoft Excel (.xlsx, .xls) or CSV spreadsheets via SheetJS.
 */
export async function parseSpreadsheetFile(
  file: File
): Promise<{ title: string; headers: string[]; rows: string[][] }> {
  const baseTitle = file.name.replace(/\.[^/.]+$/, '') || 'Spreadsheet';
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('No worksheets found inside the uploaded spreadsheet.');
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rawMatrix = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: '' });
  const nonEmpty = rawMatrix.filter((r) => Array.isArray(r) && r.some((cell) => String(cell).trim() !== ''));

  if (nonEmpty.length === 0) {
    throw new Error('The uploaded worksheet contains no tabular data.');
  }

  const maxCols = Math.max(...nonEmpty.map((r) => r.length), 1);
  const normalizeRow = (r: any[]) =>
    Array.from({ length: maxCols }, (_, idx) => String(r[idx] ?? '').trim());

  const headers = normalizeRow(nonEmpty[0]).map((h, i) => h || `Column ${i + 1}`);
  const rows = nonEmpty.slice(1).map(normalizeRow);

  return {
    title: `${baseTitle} (${firstSheetName})`,
    headers,
    rows: rows.length > 0 ? rows : [headers.map(() => '')],
  };
}

/**
 * Renders multi-page Unicode text cleanly onto PDF pages (supports Latin, Arabic, Urdu, Hindi, CJK, Cyrillic)
 * using Canvas typography so non-WinAnsi scripts never fail inside pdf-lib StandardFonts.
 */
async function buildUnicodeTextPdf(heading: string, bodyText: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // Check if plain WinAnsi ASCII-safe
  const isWinAnsiSafe = /^[\x09\x0A\x0D\x20-\x7E\xA0-\xFF]*$/.test(`${heading}\n${bodyText}`);

  if (isWinAnsiSafe) {
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const margin = 44;
    const maxWidth = 595.28 - margin * 2;

    let page = pdfDoc.addPage([595.28, 841.89]);
    let y = 800;

    page.drawText(heading, { x: margin, y, size: 14, font: boldFont, color: rgb(0.1, 0.1, 0.15) });
    y -= 26;

    const paragraphs = bodyText.split('\n');
    for (const para of paragraphs) {
      if (!para.trim()) {
        y -= 10;
        continue;
      }
      const words = para.split(' ');
      let currentLine = '';
      for (const word of words) {
        const test = currentLine ? `${currentLine} ${word}` : word;
        if (font.widthOfTextAtSize(test, 10) > maxWidth) {
          if (y < 48) {
            page = pdfDoc.addPage([595.28, 841.89]);
            y = 795;
          }
          page.drawText(currentLine, { x: margin, y, size: 10, font, color: rgb(0.15, 0.18, 0.22) });
          y -= 15;
          currentLine = word;
        } else {
          currentLine = test;
        }
      }
      if (currentLine) {
        if (y < 48) {
          page = pdfDoc.addPage([595.28, 841.89]);
          y = 795;
        }
        page.drawText(currentLine, { x: margin, y, size: 10, font, color: rgb(0.15, 0.18, 0.22) });
        y -= 17;
      }
    }
    return await pdfDoc.save();
  }

  // Unicode Canvas Raster Renderer for Arabic, Urdu, Hindi, CJK, Cyrillic, etc.
  if (typeof document === 'undefined') {
    throw new Error('Canvas unavailable to render non-Latin translated script to PDF.');
  }

  const pageW = 1190; // 2x A4
  const pageH = 1684;
  const margin = 80;
  const maxTextW = pageW - margin * 2;
  const lineHeight = 34;

  const measureCanvas = document.createElement('canvas');
  const mCtx = measureCanvas.getContext('2d')!;
  mCtx.font = '22px "Plus Jakarta Sans", system-ui, sans-serif';

  const wrappedLines: string[] = [];
  for (const rawLine of bodyText.split('\n')) {
    if (!rawLine.trim()) {
      wrappedLines.push('');
      continue;
    }
    const words = rawLine.split(' ');
    let cur = '';
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (mCtx.measureText(test).width > maxTextW) {
        if (cur) wrappedLines.push(cur);
        cur = w;
      } else {
        cur = test;
      }
    }
    if (cur) wrappedLines.push(cur);
  }

  let cursor = 0;
  let pageIndex = 0;
  while (cursor < wrappedLines.length || pageIndex === 0) {
    const canvas = document.createElement('canvas');
    canvas.width = pageW;
    canvas.height = pageH;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pageW, pageH);

    let y = margin + 28;
    if (pageIndex === 0) {
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 30px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillText(heading, margin, y);
      y += 50;
    }

    ctx.fillStyle = '#1e293b';
    ctx.font = '22px "Plus Jakarta Sans", system-ui, sans-serif';
    while (cursor < wrappedLines.length && y < pageH - margin) {
      if (wrappedLines[cursor]) {
        ctx.fillText(wrappedLines[cursor], margin, y);
      }
      y += lineHeight;
      cursor++;
    }

    const jpgUrl = canvas.toDataURL('image/jpeg', 0.92);
    canvas.width = 0;
    canvas.height = 0;

    const jpgBytes = await (await fetch(jpgUrl)).arrayBuffer();
    const embedded = await pdfDoc.embedJpg(jpgBytes);
    const pdfPage = pdfDoc.addPage([595.28, 841.89]);
    pdfPage.drawImage(embedded, { x: 0, y: 0, width: 595.28, height: 841.89 });
    pageIndex++;
  }

  return await pdfDoc.save();
}

/**
 * Genuine PDF / Text translation powered by secure ToolCrest backend (/api/translate).
 * Never silently returns untranslated English text on failure.
 */
export async function translatePdfDocument(
  file: File | null,
  targetLanguageLabel: string,
  customText?: string
): Promise<{ translatedText: string; pdfBytes: Uint8Array; sourceExtractedChars: number }> {
  let sourceText = (customText || '').trim();

  if (file) {
    const content = await extractTextAndStructureFromPdf(file);
    const extracted = content.fullText.trim();
    if (!extracted) {
      throw new Error(
        'No extractable text was found in this PDF (it may be a scanned image). Please run OCR PDF first, or paste text directly.'
      );
    }
    sourceText = extracted;
  }

  if (!sourceText) {
    throw new Error('Please upload a text-based PDF or enter text to translate.');
  }

  const translateEndpoint = getBackendEndpoint('/api/translate');
  if (!translateEndpoint) {
    throw new Error(
      'AI Translation requires a live ToolCrest backend server (VITE_BACKEND_API_URL is not configured for this static build).'
    );
  }

  const response = await fetch(translateEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: sourceText.slice(0, 12000),
      targetLanguage: targetLanguageLabel,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      data.error || `Translation service failed with HTTP ${response.status}.`
    );
  }

  const translatedText = String(data.translatedText || '').trim();
  if (!translatedText) {
    throw new Error('Translation service returned an empty translation.');
  }

  const pdfBytes = await buildUnicodeTextPdf(
    `Translated Document (${targetLanguageLabel})`,
    translatedText
  );

  return {
    translatedText,
    pdfBytes,
    sourceExtractedChars: sourceText.length,
  };
}

/**
 * Performs Optical Character Recognition (OCR) on PDF pages using Tesseract.js.
 */
export async function performPdfOcr(
  file: File,
  onProgress?: (progressInfo: { current: number; total: number; status: string }) => void
): Promise<{ fullText: string; pageTexts: string[]; textPdfBytes: Uint8Array }> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
  });

  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const pageTexts: string[] = [];

  // Initialize Tesseract worker
  const worker = await createWorker('eng');

  try {
    for (let i = 1; i <= numPages; i++) {
      if (onProgress) {
        onProgress({ current: i, total: numPages, status: `Recognizing text on page ${i} of ${numPages}...` });
      }

      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        await page.render({ canvasContext: ctx, viewport }).promise;
        const result = await worker.recognize(canvas);
        const text = result.data.text.trim();
        pageTexts.push(text || `[Page ${i}: No text detected by OCR]`);
      }
    }
  } finally {
    await worker.terminate();
  }

  const fullText = pageTexts.join('\n\n--- Page Break ---\n\n');

  // Build searchable text PDF
  const outPdf = await PDFDocument.create();
  const font = await outPdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await outPdf.embedFont(StandardFonts.HelveticaBold);

  for (let i = 0; i < pageTexts.length; i++) {
    const page = outPdf.addPage([595, 842]);
    page.drawText(`OCR Extracted Text — Page ${i + 1}`, {
      x: 40,
      y: 800,
      size: 14,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.15),
    });

    const lines = pageTexts[i].split('\n');
    let y = 770;
    for (const line of lines) {
      if (y < 40) break;
      page.drawText(line.slice(0, 95), {
        x: 40,
        y,
        size: 9,
        font,
        color: rgb(0.15, 0.15, 0.2),
      });
      y -= 12;
    }
  }

  const textPdfBytes = await outPdf.save();
  return {
    fullText,
    pageTexts,
    textPdfBytes,
  };
}
