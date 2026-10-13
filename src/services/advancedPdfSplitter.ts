import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import {
  renderPageToImageBlob,
  getPdfDocumentSummary,
} from './pdfThumbnailRenderer';
import { sanitizeFileName } from '../utils/fileNaming';

export interface CustomRangeItem {
  id: string;
  name: string;
  start: number;
  end: number;
}

/**
 * Extracts selected non-consecutive page numbers into a single combined PDF.
 */
export async function extractPagesToSinglePdf(
  file: File,
  pageNumbers: number[]
): Promise<Uint8Array> {
  if (pageNumbers.length === 0) {
    throw new Error('Please select at least one page to extract.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = srcPdf.getPageCount();

  const targetPdf = await PDFDocument.create();
  // Sort and remove duplicates, convert to 0-based indices
  const uniquePages = Array.from(new Set(pageNumbers))
    .sort((a, b) => a - b)
    .filter((p) => p >= 1 && p <= totalPages);

  if (uniquePages.length === 0) {
    throw new Error('None of the selected pages exist in the document.');
  }

  const pageIndices = uniquePages.map((p) => p - 1);
  const copiedPages = await targetPdf.copyPages(srcPdf, pageIndices);
  copiedPages.forEach((page) => targetPdf.addPage(page));

  return await targetPdf.save();
}

/**
 * Extracts each selected page as an individual standalone PDF and packages them into a ZIP archive.
 */
export async function extractPagesToSeparatePdfsZip(
  file: File,
  pageNumbers: number[],
  baseFileName: string
): Promise<Uint8Array> {
  if (pageNumbers.length === 0) {
    throw new Error('Please select at least one page to split.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = srcPdf.getPageCount();

  const uniquePages = Array.from(new Set(pageNumbers))
    .sort((a, b) => a - b)
    .filter((p) => p >= 1 && p <= totalPages);

  const cleanBase = sanitizeFileName(baseFileName, 'split_page');
  const zip = new JSZip();

  for (const pageNum of uniquePages) {
    const singleDoc = await PDFDocument.create();
    const [copied] = await singleDoc.copyPages(srcPdf, [pageNum - 1]);
    singleDoc.addPage(copied);
    const pdfBytes = await singleDoc.save();

    const fileName = `${cleanBase}_page_${pageNum}.pdf`;
    zip.file(fileName, pdfBytes);
  }

  return await zip.generateAsync({ type: 'uint8array' });
}

/**
 * Splits every single page of the PDF into separate individual PDFs in a ZIP archive.
 */
export async function splitEveryPageToZip(
  file: File,
  baseFileName: string
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = srcPdf.getPageCount();

  if (totalPages === 0) {
    throw new Error('Document has 0 pages.');
  }

  const cleanBase = sanitizeFileName(baseFileName, 'page');
  const zip = new JSZip();

  for (let i = 0; i < totalPages; i++) {
    const pageNum = i + 1;
    const singleDoc = await PDFDocument.create();
    const [copied] = await singleDoc.copyPages(srcPdf, [i]);
    singleDoc.addPage(copied);
    const pdfBytes = await singleDoc.save();

    const fileName = `${cleanBase}_page_${pageNum}.pdf`;
    zip.file(fileName, pdfBytes);
  }

  return await zip.generateAsync({ type: 'uint8array' });
}

/**
 * Extracts multiple custom ranges (e.g. 1-5, 8-12, 16-20).
 * If mergeAll is true, merges all ranges into one single PDF.
 * If mergeAll is false, packages each range as its own PDF in a ZIP archive.
 */
export async function splitCustomRanges(
  file: File,
  ranges: CustomRangeItem[],
  mergeAll: boolean,
  baseFileName: string
): Promise<{ bytes: Uint8Array; isZip: boolean }> {
  if (ranges.length === 0) {
    throw new Error('Please add at least one page range.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = srcPdf.getPageCount();

  const cleanBase = sanitizeFileName(baseFileName, 'range');

  if (mergeAll) {
    // Collect all pages from all ranges in order
    const pageIndicesToKeep: number[] = [];
    for (const r of ranges) {
      const start = Math.max(1, Math.min(r.start, r.end));
      const end = Math.min(totalPages, Math.max(r.start, r.end));
      for (let p = start; p <= end; p++) {
        const idx = p - 1;
        if (!pageIndicesToKeep.includes(idx)) {
          pageIndicesToKeep.push(idx);
        }
      }
    }

    if (pageIndicesToKeep.length === 0) {
      throw new Error('No valid pages found in the specified ranges.');
    }

    const targetPdf = await PDFDocument.create();
    const copiedPages = await targetPdf.copyPages(srcPdf, pageIndicesToKeep);
    copiedPages.forEach((page) => targetPdf.addPage(page));

    const bytes = await targetPdf.save();
    return { bytes, isZip: false };
  } else {
    // Generate separate PDF for each range, inside a ZIP archive
    const zip = new JSZip();

    for (let i = 0; i < ranges.length; i++) {
      const r = ranges[i];
      const start = Math.max(1, Math.min(r.start, r.end));
      const end = Math.min(totalPages, Math.max(r.start, r.end));
      const rangeIndices: number[] = [];

      for (let p = start; p <= end; p++) {
        rangeIndices.push(p - 1);
      }

      if (rangeIndices.length > 0) {
        const rangeDoc = await PDFDocument.create();
        const copied = await rangeDoc.copyPages(srcPdf, rangeIndices);
        copied.forEach((p) => rangeDoc.addPage(p));
        const rangeBytes = await rangeDoc.save();

        const rangeLabel = r.name ? sanitizeFileName(r.name) : `range_${start}-${end}`;
        const fileName = `${cleanBase}_${rangeLabel}.pdf`;
        zip.file(fileName, rangeBytes);
      }
    }

    const zipBytes = await zip.generateAsync({ type: 'uint8array' });
    return { bytes: zipBytes, isZip: true };
  }
}

/**
 * Option 5: Exports selected PDF pages as PNG or JPEG images bundled into a ZIP archive.
 */
export async function exportSelectedPagesAsImagesZip(
  file: File,
  pageNumbers: number[],
  format: 'png' | 'jpeg',
  quality = 0.95,
  scale = 2.0,
  baseFileName: string,
  onProgress?: (current: number, total: number) => void
): Promise<Uint8Array> {
  if (pageNumbers.length === 0) {
    throw new Error('Please select at least one page to export as images.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const summary = await getPdfDocumentSummary(file);

  const cleanBase = sanitizeFileName(baseFileName, 'image');
  const zip = new JSZip();
  const ext = format === 'jpeg' ? 'jpg' : 'png';

  const uniquePages = Array.from(new Set(pageNumbers)).sort((a, b) => a - b);
  const total = uniquePages.length;

  for (let i = 0; i < total; i++) {
    const pageNum = uniquePages[i];
    const pageInfo = summary.pages.find((p) => p.pageNumber === pageNum) || {
      pageNumber: pageNum,
      width: 595,
      height: 842,
      orientation: 'portrait' as const,
    };

    if (onProgress) {
      onProgress(i + 1, total);
    }

    const { blob } = await renderPageToImageBlob(
      arrayBuffer,
      pageNum,
      pageInfo,
      format,
      quality,
      scale
    );

    const imageBytes = new Uint8Array(await blob.arrayBuffer());
    const fileName = `${cleanBase}_page_${pageNum}.${ext}`;
    zip.file(fileName, imageBytes);
  }

  return await zip.generateAsync({ type: 'uint8array' });
}
