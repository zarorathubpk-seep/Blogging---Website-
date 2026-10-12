import {
  PDFDocument,
  rgb,
  degrees,
  StandardFonts,
} from 'pdf-lib';

export interface WatermarkOptions {
  text: string;
  opacity: number;
  fontSize: number;
  colorHex: string;
  angle: number;
}

export interface PageNumberOptions {
  format: 'page-x-of-y' | 'x-of-y' | 'page-x' | 'simple';
  position: 'bottom-center' | 'bottom-right' | 'top-right' | 'top-center';
  fontSize: number;
  colorHex: string;
  startNumber: number;
}

export interface CompressionResult {
  bytes: Uint8Array;
  originalSize: number;
  newSize: number;
  savingsPercent: number;
}

export interface CompareResult {
  pagesA: number;
  pagesB: number;
  sizeA: number;
  sizeB: number;
  titleA?: string;
  titleB?: string;
  identicalPageCount: boolean;
  notes: string[];
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255,
  };
}

export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  if (files.length === 0) throw new Error('Please select at least one PDF file to merge.');
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}

export async function splitPdf(file: File, pageRangeStr: string): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = srcPdf.getPageCount();

  const targetPdf = await PDFDocument.create();
  const pageIndicesToKeep: number[] = [];

  const parts = pageRangeStr.split(',').map((p) => p.trim()).filter(Boolean);

  if (parts.length === 0) {
    // Default: keep all pages or first page
    pageIndicesToKeep.push(0);
  } else {
    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-').map((s) => s.trim());
        const start = Math.max(1, parseInt(startStr, 10) || 1);
        const end = Math.min(totalPages, parseInt(endStr, 10) || totalPages);
        for (let i = start; i <= end; i++) {
          const idx = i - 1;
          if (idx >= 0 && idx < totalPages && !pageIndicesToKeep.includes(idx)) {
            pageIndicesToKeep.push(idx);
          }
        }
      } else {
        const pNum = parseInt(part, 10);
        const idx = pNum - 1;
        if (idx >= 0 && idx < totalPages && !pageIndicesToKeep.includes(idx)) {
          pageIndicesToKeep.push(idx);
        }
      }
    }
  }

  if (pageIndicesToKeep.length === 0) {
    throw new Error('No valid pages found in the specified range.');
  }

  const copiedPages = await targetPdf.copyPages(srcPdf, pageIndicesToKeep);
  copiedPages.forEach((p) => targetPdf.addPage(p));

  return await targetPdf.save();
}

export async function rotatePdfPages(
  file: File,
  degreesToRotate: number,
  pagesToRotate?: number[]
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();

  for (let i = 0; i < totalPages; i++) {
    const pageNum = i + 1;
    if (!pagesToRotate || pagesToRotate.length === 0 || pagesToRotate.includes(pageNum)) {
      const page = pdf.getPage(i);
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees((currentRotation + degreesToRotate) % 360));
    }
  }

  return await pdf.save();
}

export async function removePdfPages(file: File, pagesToRemove: number[]): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = srcPdf.getPageCount();

  const targetPdf = await PDFDocument.create();
  const keepIndices: number[] = [];

  for (let i = 0; i < totalPages; i++) {
    if (!pagesToRemove.includes(i + 1)) {
      keepIndices.push(i);
    }
  }

  if (keepIndices.length === 0) {
    throw new Error('Cannot delete all pages from the document.');
  }

  const copiedPages = await targetPdf.copyPages(srcPdf, keepIndices);
  copiedPages.forEach((p) => targetPdf.addPage(p));

  return await targetPdf.save();
}

export async function extractPdfPages(file: File, pagesToExtract: number[]): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = srcPdf.getPageCount();

  const targetPdf = await PDFDocument.create();
  const extractIndices = pagesToExtract
    .map((p) => p - 1)
    .filter((idx) => idx >= 0 && idx < totalPages);

  if (extractIndices.length === 0) {
    throw new Error('Please select at least one valid page to extract.');
  }

  const copiedPages = await targetPdf.copyPages(srcPdf, extractIndices);
  copiedPages.forEach((p) => targetPdf.addPage(p));

  return await targetPdf.save();
}

export async function rearrangePdfPages(file: File, newOrder: number[]): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = srcPdf.getPageCount();

  const targetPdf = await PDFDocument.create();
  const validIndices = newOrder
    .map((p) => p - 1)
    .filter((idx) => idx >= 0 && idx < totalPages);

  const copiedPages = await targetPdf.copyPages(srcPdf, validIndices);
  copiedPages.forEach((p) => targetPdf.addPage(p));

  return await targetPdf.save();
}

export async function addWatermarkToPdf(
  file: File,
  options: WatermarkOptions
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const color = hexToRgb(options.colorHex || '#94a3b8');

  const pages = pdf.getPages();
  for (const page of pages) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(options.text, options.fontSize);
    const textHeight = font.heightAtSize(options.fontSize);

    page.drawText(options.text, {
      x: width / 2 - textWidth / 2,
      y: height / 2 - textHeight / 4,
      size: options.fontSize,
      font,
      color: rgb(color.r, color.g, color.b),
      opacity: Math.max(0.05, Math.min(options.opacity, 0.9)),
      rotate: degrees(options.angle),
    });
  }

  return await pdf.save();
}

export async function addPageNumbersToPdf(
  file: File,
  options: PageNumberOptions
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const color = hexToRgb(options.colorHex || '#475569');

  const totalPages = pdf.getPageCount();
  const pages = pdf.getPages();

  for (let i = 0; i < totalPages; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();
    const currentNum = i + options.startNumber;

    let text = `${currentNum}`;
    if (options.format === 'page-x-of-y') text = `Page ${currentNum} of ${totalPages}`;
    else if (options.format === 'x-of-y') text = `${currentNum} / ${totalPages}`;
    else if (options.format === 'page-x') text = `Page ${currentNum}`;

    const textWidth = font.widthOfTextAtSize(text, options.fontSize);
    let x = width / 2 - textWidth / 2;
    let y = 24;

    if (options.position === 'bottom-right') {
      x = width - textWidth - 36;
      y = 24;
    } else if (options.position === 'top-right') {
      x = width - textWidth - 36;
      y = height - 32;
    } else if (options.position === 'top-center') {
      x = width / 2 - textWidth / 2;
      y = height - 32;
    }

    page.drawText(text, {
      x,
      y,
      size: options.fontSize,
      font,
      color: rgb(color.r, color.g, color.b),
    });
  }

  return await pdf.save();
}

export async function compressPdf(file: File): Promise<CompressionResult> {
  const originalSize = file.size;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  // Re-save with object stream compression and removal of unused objects
  const compressedBytes = await pdf.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  const newSize = compressedBytes.byteLength;
  const savingsPercent = Math.max(0, Math.round(((originalSize - newSize) / originalSize) * 100));

  return {
    bytes: compressedBytes,
    originalSize,
    newSize,
    savingsPercent,
  };
}

export async function imagesToPdf(
  files: File[],
  orientation: 'portrait' | 'landscape' = 'portrait'
): Promise<Uint8Array> {
  if (files.length === 0) throw new Error('Please select at least one image file.');
  const pdf = await PDFDocument.create();

  const pageWidth = orientation === 'portrait' ? 595.28 : 841.89; // A4 standard points
  const pageHeight = orientation === 'portrait' ? 841.89 : 595.28;

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    let image;
    const isPng = file.type.includes('png') || file.name.toLowerCase().endsWith('.png');
    const isJpg =
      file.type.includes('jpeg') ||
      file.type.includes('jpg') ||
      file.name.toLowerCase().endsWith('.jpg') ||
      file.name.toLowerCase().endsWith('.jpeg');

    if (isPng) {
      image = await pdf.embedPng(arrayBuffer);
    } else if (isJpg) {
      image = await pdf.embedJpg(arrayBuffer);
    } else {
      // For webp or other formats, convert to jpeg via Canvas
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const imgElem = new Image();
      imgElem.src = dataUrl;
      await new Promise((res) => (imgElem.onload = res));

      const canvas = document.createElement('canvas');
      canvas.width = imgElem.width;
      canvas.height = imgElem.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(imgElem, 0, 0);

      const blob = await new Promise<Blob>((res) =>
        canvas.toBlob((b) => res(b!), 'image/jpeg', 0.92)
      );
      const convertedBuffer = await blob.arrayBuffer();
      image = await pdf.embedJpg(convertedBuffer);
    }

    const page = pdf.addPage([pageWidth, pageHeight]);

    // Fit image inside margins with aspect ratio preserved
    const margin = 36;
    const maxW = pageWidth - margin * 2;
    const maxH = pageHeight - margin * 2;

    const imgDims = image.scale(1);
    const scale = Math.min(maxW / imgDims.width, maxH / imgDims.height, 1);
    const finalW = imgDims.width * scale;
    const finalH = imgDims.height * scale;

    const x = (pageWidth - finalW) / 2;
    const y = (pageHeight - finalH) / 2;

    page.drawImage(image, {
      x,
      y,
      width: finalW,
      height: finalH,
    });
  }

  return await pdf.save();
}

export async function signPdf(
  file: File,
  signatureDataUrl: string,
  pageNumber: number,
  xCoord?: number,
  yCoord?: number,
  boxWidth: number = 180,
  boxHeight: number = 60
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  const totalPages = pdf.getPageCount();
  const targetPageIdx = Math.max(0, Math.min(pageNumber - 1, totalPages - 1));
  const page = pdf.getPage(targetPageIdx);
  const { width, height } = page.getSize();

  // Signature image embedding
  const signatureImage = await pdf.embedPng(signatureDataUrl);

  const x = xCoord !== undefined ? xCoord : width - boxWidth - 40;
  const y = yCoord !== undefined ? yCoord : 40;

  page.drawImage(signatureImage, {
    x,
    y,
    width: boxWidth,
    height: boxHeight,
  });

  return await pdf.save();
}

export async function redactPdf(
  file: File,
  redactions: { page: number; x: number; y: number; width: number; height: number }[]
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = pdf.getPageCount();

  for (const item of redactions) {
    const pageIdx = item.page - 1;
    if (pageIdx >= 0 && pageIdx < totalPages) {
      const page = pdf.getPage(pageIdx);
      page.drawRectangle({
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
        color: rgb(0, 0, 0),
      });
    }
  }

  return await pdf.save();
}

export async function createPdfDoc(doc: {
  title: string;
  subtitle?: string;
  author?: string;
  paragraphs: string[];
}): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);

  let page = pdf.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();
  let currentY = height - 54;
  const margin = 48;
  const contentWidth = width - margin * 2;

  // Title
  page.drawText(doc.title, {
    x: margin,
    y: currentY,
    size: 20,
    font: fontBold,
    color: rgb(0.08, 0.12, 0.18),
  });
  currentY -= 28;

  // Subtitle
  if (doc.subtitle) {
    page.drawText(doc.subtitle, {
      x: margin,
      y: currentY,
      size: 12,
      font: fontRegular,
      color: rgb(0.35, 0.42, 0.52),
    });
    currentY -= 24;
  }

  // Author & Date
  const metaText = `Author: ${doc.author || 'ToolCrest Creator'} • Generated: ${new Date().toLocaleDateString()}`;
  page.drawText(metaText, {
    x: margin,
    y: currentY,
    size: 9,
    font: fontRegular,
    color: rgb(0.5, 0.55, 0.65),
  });
  currentY -= 20;

  // Divider
  page.drawLine({
    start: { x: margin, y: currentY },
    end: { x: width - margin, y: currentY },
    thickness: 1,
    color: rgb(0.85, 0.88, 0.92),
  });
  currentY -= 24;

  // Body paragraphs with simple wrapping
  for (const para of doc.paragraphs) {
    if (!para.trim()) {
      currentY -= 12;
      continue;
    }

    const words = para.split(' ');
    let line = '';
    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      const testWidth = fontRegular.widthOfTextAtSize(testLine, 10.5);

      if (testWidth > contentWidth) {
        if (currentY < 60) {
          page = pdf.addPage([595.28, 841.89]);
          currentY = height - 54;
        }
        page.drawText(line, {
          x: margin,
          y: currentY,
          size: 10.5,
          font: fontRegular,
          color: rgb(0.15, 0.2, 0.25),
        });
        currentY -= 16;
        line = word;
      } else {
        line = testLine;
      }
    }

    if (line) {
      if (currentY < 60) {
        page = pdf.addPage([595.28, 841.89]);
        currentY = height - 54;
      }
      page.drawText(line, {
        x: margin,
        y: currentY,
        size: 10.5,
        font: fontRegular,
        color: rgb(0.15, 0.2, 0.25),
      });
      currentY -= 20;
    }
  }

  return await pdf.save();
}

export async function comparePdfs(fileA: File, fileB: File): Promise<CompareResult> {
  const bufA = await fileA.arrayBuffer();
  const bufB = await fileB.arrayBuffer();

  const pdfA = await PDFDocument.load(bufA, { ignoreEncryption: true });
  const pdfB = await PDFDocument.load(bufB, { ignoreEncryption: true });

  const pagesA = pdfA.getPageCount();
  const pagesB = pdfB.getPageCount();
  const sizeA = fileA.size;
  const sizeB = fileB.size;

  const notes: string[] = [];
  if (pagesA === pagesB) {
    notes.push(`Both documents share identical page count (${pagesA} pages).`);
  } else {
    notes.push(`Page counts differ: File A has ${pagesA} pages while File B has ${pagesB} pages.`);
  }

  const sizeDiff = Math.abs(sizeA - sizeB);
  if (sizeDiff === 0) {
    notes.push('Exact identical byte size.');
  } else {
    const diffFormatted = (sizeDiff / 1024).toFixed(1);
    notes.push(`File sizes differ by ${diffFormatted} KB.`);
  }

  return {
    pagesA,
    pagesB,
    sizeA,
    sizeB,
    titleA: pdfA.getTitle(),
    titleB: pdfB.getTitle(),
    identicalPageCount: pagesA === pagesB,
    notes,
  };
}

export function downloadBytesAsFile(bytes: Uint8Array, fileName: string, mimeType = 'application/pdf') {
  const blob = new Blob([bytes as unknown as BlobPart], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
