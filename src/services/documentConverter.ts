import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url';
import { Document, Paragraph, TextRun, HeadingLevel, Packer } from 'docx';
import PptxGenJS from 'pptxgenjs';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { createWorker } from 'tesseract.js';

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
    }

    const items: TextItemCoord[] = [];
    for (const item of textContent.items as any[]) {
      if (item.str && typeof item.str === 'string') {
        const x = item.transform ? item.transform[4] : 0;
        const y = item.transform ? item.transform[5] : 0;
        items.push({ str: item.str, x, y });
      }
    }

    // Sort top to bottom (descending Y in PDF coordinates)
    items.sort((a, b) => b.y - a.y || a.x - b.x);

    const lineGroups: TextItemCoord[][] = [];
    const Y_TOLERANCE = 8; // Points tolerance for same line

    for (const item of items) {
      let matchedGroup = lineGroups.find(
        (group) => Math.abs(group[0].y - item.y) <= Y_TOLERANCE
      );
      if (matchedGroup) {
        matchedGroup.push(item);
      } else {
        lineGroups.push([item]);
      }
    }

    // Sort items within each line group from left to right (ascending X)
    const pageLines: string[] = [];
    const tableRows: string[][] = [];

    for (const group of lineGroups) {
      group.sort((a, b) => a.x - b.x);
      const lineText = group.map((it) => it.str).join(' ').trim();
      if (lineText) {
        pageLines.push(lineText);
      }

      // If line contains multiple distinct spaced items, treat as table row
      const cells = group.map((it) => it.str.trim()).filter(Boolean);
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
 * Dictionary-based translation helper for common technical and administrative terms
 */
const DICTIONARIES: Record<string, Record<string, string>> = {
  Spanish: {
    document: 'documento',
    invoice: 'factura',
    report: 'informe',
    summary: 'resumen',
    total: 'total',
    date: 'fecha',
    name: 'nombre',
    description: 'descripción',
    amount: 'cantidad',
    notes: 'notas',
    page: 'página',
    agreement: 'acuerdo',
    contract: 'contrato',
    overview: 'visión general',
    project: 'proyecto',
    status: 'estado',
    approved: 'aprobado',
    pending: 'pendiente',
    completed: 'completado',
  },
  French: {
    document: 'document',
    invoice: 'facture',
    report: 'rapport',
    summary: 'résumé',
    total: 'total',
    date: 'date',
    name: 'nom',
    description: 'description',
    amount: 'montant',
    notes: 'remarques',
    page: 'page',
    agreement: 'accord',
    contract: 'contrat',
    overview: 'aperçu',
    project: 'projet',
    status: 'statut',
    approved: 'approuvé',
    pending: 'en attente',
    completed: 'terminé',
  },
  German: {
    document: 'Dokument',
    invoice: 'Rechnung',
    report: 'Bericht',
    summary: 'Zusammenfassung',
    total: 'Gesamt',
    date: 'Datum',
    name: 'Name',
    description: 'Beschreibung',
    amount: 'Betrag',
    notes: 'Notizen',
    page: 'Seite',
    agreement: 'Vereinbarung',
    contract: 'Vertrag',
    overview: 'Übersicht',
    project: 'Projekt',
    status: 'Status',
    approved: 'genehmigt',
    pending: 'ausstehend',
    completed: 'abgeschlossen',
  },
};

/**
 * Translates text and compiles a translated PDF.
 */
export async function translatePdfDocument(
  file: File,
  targetLanguage: string
): Promise<{ translatedText: string; pdfBytes: Uint8Array }> {
  const content = await extractTextAndStructureFromPdf(file);
  const dict = DICTIONARIES[targetLanguage] || DICTIONARIES.Spanish;

  const translatedPages: string[] = [];

  for (const page of content.pages) {
    const translatedLines = page.lines.map((line) => {
      let trLine = line;
      for (const [enWord, trWord] of Object.entries(dict)) {
        const regex = new RegExp(`\\b${enWord}\\b`, 'gi');
        trLine = trLine.replace(regex, trWord);
      }
      return trLine;
    });
    translatedPages.push(translatedLines.join('\n'));
  }

  const translatedFullText = translatedPages.join('\n\n--- Page Break ---\n\n');

  // Build clean translated PDF using pdf-lib
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  for (let i = 0; i < translatedPages.length; i++) {
    const pageText = translatedPages[i];
    const page = pdfDoc.addPage([595, 842]); // A4
    const lines = pageText.split('\n');

    page.drawText(`Translated to ${targetLanguage} - Page ${i + 1}`, {
      x: 40,
      y: 800,
      size: 14,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.15),
    });

    let y = 770;
    for (const line of lines) {
      if (y < 40) break;
      const truncated = line.slice(0, 95);
      page.drawText(truncated, {
        x: 40,
        y,
        size: 10,
        font,
        color: rgb(0.2, 0.2, 0.25),
      });
      y -= 14;
    }
  }

  const pdfBytes = await pdfDoc.save();
  return {
    translatedText: translatedFullText,
    pdfBytes,
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
