import { PDFDocument } from 'pdf-lib';

export interface PageInfo {
  pageNumber: number; // 1-based index
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  thumbnailUrl?: string;
  isRendering?: boolean;
}

export interface PdfDocumentSummary {
  pageCount: number;
  pages: PageInfo[];
  title?: string;
  author?: string;
}

// Global reference for dynamically loaded PDF.js
declare global {
  interface Window {
    pdfjsLib?: any;
    pdfjsLibLoadingPromise?: Promise<any>;
  }
}

/**
 * Dynamically loads PDF.js library from reliable CDN if not already loaded in the window.
 */
export function ensurePdfJsLoaded(): Promise<any> {
  if (window.pdfjsLib) {
    return Promise.resolve(window.pdfjsLib);
  }

  if (window.pdfjsLibLoadingPromise) {
    return window.pdfjsLibLoadingPromise;
  }

  window.pdfjsLibLoadingPromise = new Promise((resolve, reject) => {
    // Check if script already exists in document
    const existingScript = document.querySelector('script[src*="pdf.min.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.pdfjsLib));
      existingScript.addEventListener('error', (e) => reject(e));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(window.pdfjsLib);
      } else {
        reject(new Error('PDF.js script loaded but window.pdfjsLib not defined'));
      }
    };
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });

  return window.pdfjsLibLoadingPromise;
}

/**
 * Inspects a PDF file using pdf-lib to get accurate page count and page dimensions.
 */
export async function getPdfDocumentSummary(file: File): Promise<PdfDocumentSummary> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pageCount = pdfDoc.getPageCount();

  const pages: PageInfo[] = [];
  for (let i = 0; i < pageCount; i++) {
    const page = pdfDoc.getPage(i);
    const { width, height } = page.getSize();
    pages.push({
      pageNumber: i + 1,
      width: Math.round(width),
      height: Math.round(height),
      orientation: width > height ? 'landscape' : 'portrait',
    });
  }

  return {
    pageCount,
    pages,
    title: pdfDoc.getTitle(),
    author: pdfDoc.getAuthor(),
  };
}

/**
 * Generates an SVG/Canvas fallback thumbnail for a page if PDF.js is unavailable or still loading.
 */
export function generateFallbackPageThumbnail(page: PageInfo): string {
  const canvas = document.createElement('canvas');
  const isLandscape = page.orientation === 'landscape';
  canvas.width = isLandscape ? 240 : 180;
  canvas.height = isLandscape ? 180 : 240;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background page sheet
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border outline
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

  // Decorative header bar
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(10, 15, canvas.width - 20, 16);

  // Simulated paragraph lines
  ctx.fillStyle = '#e2e8f0';
  let y = 42;
  while (y < canvas.height - 40) {
    const lineWidth = (canvas.width - 20) * (0.6 + (Math.sin(y) + 1) * 0.18);
    ctx.fillRect(10, y, lineWidth, 6);
    y += 14;
  }

  // Page number watermark in center
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`Page ${page.pageNumber}`, canvas.width / 2, canvas.height / 2);

  // Dimension tag at bottom
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px monospace';
  ctx.fillText(`${page.width} × ${page.height} pt`, canvas.width / 2, canvas.height - 15);

  return canvas.toDataURL('image/png');
}

/**
 * Renders a high-resolution visual thumbnail using PDF.js. Falls back to vector canvas.
 */
export async function renderPageThumbnail(
  fileArrayBuffer: ArrayBuffer,
  pageNumber: number,
  pageInfo: PageInfo,
  renderScale = 0.5
): Promise<string> {
  try {
    const pdfjs = await ensurePdfJsLoaded();
    const loadingTask = pdfjs.getDocument({ data: fileArrayBuffer });
    const pdfDoc = await loadingTask.promise;
    const page = await pdfDoc.getPage(pageNumber);

    const viewport = page.getViewport({ scale: renderScale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    await page.render({ canvasContext: ctx, viewport }).promise;
    return canvas.toDataURL('image/jpeg', 0.85);
  } catch (err) {
    console.warn(`PDF.js rendering fallback for page ${pageNumber}:`, err);
    return generateFallbackPageThumbnail(pageInfo);
  }
}

/**
 * Converts a specific PDF page to a standalone PNG or JPEG image blob at custom resolution & quality.
 */
export async function renderPageToImageBlob(
  fileArrayBuffer: ArrayBuffer,
  pageNumber: number,
  pageInfo: PageInfo,
  format: 'png' | 'jpeg' = 'png',
  quality = 0.95,
  scale = 2.0
): Promise<{ blob: Blob; dataUrl: string }> {
  try {
    const pdfjs = await ensurePdfJsLoaded();
    const loadingTask = pdfjs.getDocument({ data: fileArrayBuffer });
    const pdfDoc = await loadingTask.promise;
    const page = await pdfDoc.getPage(pageNumber);

    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not create canvas context');

    // Fill white background for JPEGs
    if (format === 'jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    await page.render({ canvasContext: ctx, viewport }).promise;

    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const dataUrl = canvas.toDataURL(mimeType, quality);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Canvas toBlob failed'));
        },
        mimeType,
        quality
      );
    });

    return { blob, dataUrl };
  } catch (err) {
    console.warn('PDF.js image conversion fallback:', err);
    // Vector fallback
    const fallbackDataUrl = generateFallbackPageThumbnail(pageInfo);
    const res = await fetch(fallbackDataUrl);
    const blob = await res.blob();
    return { blob, dataUrl: fallbackDataUrl };
  }
}
