import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
// Vite URL import bundles and references the local worker file with zero external CDN dependency
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url';

// Configure worker locally
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;
}

export interface PageInfo {
  pageNumber: number; // 1-based index
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  thumbnailUrl?: string;
  status?: 'pending' | 'rendering' | 'ready' | 'error';
  errorMessage?: string;
  rotation?: number;
}

export interface PdfDocumentSummary {
  pageCount: number;
  pages: PageInfo[];
  title?: string;
  author?: string;
}

/**
 * Inspects a PDF file using pdf-lib to get accurate page count and page dimensions.
 */
export async function getPdfDocumentSummary(file: File | ArrayBuffer): Promise<PdfDocumentSummary> {
  const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file;
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
      status: 'pending',
      rotation: 0,
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
 * Generates a clean vector-based fallback thumbnail for a page if PDF.js fails.
 */
export function generateFallbackPageThumbnail(page: PageInfo, customLabel?: string): string {
  const canvas = document.createElement('canvas');
  const isLandscape = page.orientation === 'landscape';
  canvas.width = isLandscape ? 240 : 180;
  canvas.height = isLandscape ? 180 : 240;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Clean white paper sheet with subtle inner contrast
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border outline
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

  // Decorative header bar in soft gold
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(10, 14, canvas.width - 20, 18);
  ctx.fillStyle = '#D4AF37';
  ctx.fillRect(10, 14, 28, 18);

  // Simulated paragraph lines
  ctx.fillStyle = '#e2e8f0';
  let y = 44;
  while (y < canvas.height - 40) {
    const lineWidth = (canvas.width - 20) * (0.6 + (Math.sin(y) + 1) * 0.18);
    ctx.fillRect(10, y, lineWidth, 6);
    y += 14;
  }

  // Page number badge in center
  ctx.fillStyle = '#101114';
  ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(customLabel || `Page ${page.pageNumber}`, canvas.width / 2, canvas.height / 2);

  // Dimension tag at bottom
  ctx.fillStyle = '#64748b';
  ctx.font = '10px monospace';
  ctx.fillText(`${page.width} × ${page.height} pt`, canvas.width / 2, canvas.height - 14);

  return canvas.toDataURL('image/png');
}

/**
 * Concurrency queue manager to safely throttle PDF.js page rendering.
 * Throttling prevents memory thrashing, detached buffer issues, and canvas memory exhaustion.
 */
class RenderQueue {
  private queue: Array<() => Promise<void>> = [];
  private activeCount = 0;
  private readonly maxConcurrency = 2; // Render up to 2 pages simultaneously

  enqueue<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
      this.processNext();
    });
  }

  private processNext() {
    if (this.activeCount >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }
    const nextTask = this.queue.shift();
    if (!nextTask) return;

    this.activeCount++;
    nextTask().finally(() => {
      this.activeCount--;
      this.processNext();
    });
  }

  clear() {
    this.queue = [];
  }
}

const globalRenderQueue = new RenderQueue();

/**
 * Manages an open PDF.js Document Proxy with caching, concurrency management, and proper cleanup.
 */
export class PdfThumbnailEngine {
  private pdfDocProxy: any = null;
  private isDestroyed = false;
  private rawBuffer: ArrayBuffer | null = null;
  private objectUrls: Set<string> = new Set();

  async loadDocument(fileOrBuffer: File | ArrayBuffer): Promise<number> {
    const buffer = fileOrBuffer instanceof File ? await fileOrBuffer.arrayBuffer() : fileOrBuffer;
    this.rawBuffer = buffer.slice(0); // Safe clone to prevent detachment

    const getDoc = pdfjsLib.getDocument || (pdfjsLib as any).default?.getDocument;
    try {
      const loadingTask = getDoc({
        data: new Uint8Array(this.rawBuffer),
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
        cMapPacked: true,
        standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/',
      });

      this.pdfDocProxy = await loadingTask.promise;
      return this.pdfDocProxy.numPages;
    } catch (err) {
      // Fallback: try loading with fake worker or fallback
      console.warn('PDF.js standard worker load error, attempting fallback config:', err);
      const fallbackTask = getDoc({
        data: new Uint8Array(this.rawBuffer),
        isEvalSupported: false,
      });
      this.pdfDocProxy = await fallbackTask.promise;
      return this.pdfDocProxy.numPages;
    }
  }

  getPageCount(): number {
    return this.pdfDocProxy ? this.pdfDocProxy.numPages : 0;
  }

  /**
   * Renders a specific page visual thumbnail into an image Data URL.
   */
  async renderPageThumbnail(
    pageNumber: number,
    pageInfo?: PageInfo,
    renderScale = 0.45,
    rotation = 0
  ): Promise<string> {
    if (this.isDestroyed || !this.pdfDocProxy) {
      if (pageInfo) return generateFallbackPageThumbnail(pageInfo);
      throw new Error('PDF document engine not loaded');
    }

    return globalRenderQueue.enqueue(async () => {
      if (this.isDestroyed || !this.pdfDocProxy) {
        if (pageInfo) return generateFallbackPageThumbnail(pageInfo);
        throw new Error('Engine destroyed');
      }

      try {
        const page = await this.pdfDocProxy.getPage(pageNumber);
        const viewport = page.getViewport({ scale: renderScale, rotation: (page.rotate + rotation) % 360 });

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) throw new Error('Could not get 2d canvas context');

        // Clean white background for crisp document readability
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: ctx,
          viewport,
        }).promise;

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        // Clean up canvas
        canvas.width = 0;
        canvas.height = 0;
        return dataUrl;
      } catch (err: any) {
        console.warn(`Render error on page ${pageNumber}:`, err);
        if (pageInfo) {
          return generateFallbackPageThumbnail(pageInfo, `Page ${pageNumber} (Preview)`);
        }
        throw err;
      }
    });
  }

  /**
   * High-resolution rendering to Blob for PDF to Image conversion.
   */
  async renderPageToBlob(
    pageNumber: number,
    format: 'png' | 'jpeg' = 'png',
    quality = 0.95,
    scale = 2.0,
    rotation = 0
  ): Promise<{ blob: Blob; dataUrl: string }> {
    if (this.isDestroyed || !this.pdfDocProxy) {
      throw new Error('PDF engine not initialized');
    }

    return globalRenderQueue.enqueue(async () => {
      const page = await this.pdfDocProxy.getPage(pageNumber);
      const viewport = page.getViewport({ scale, rotation: (page.rotate + rotation) % 360 });

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      if (format === 'jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      await page.render({
        canvasContext: ctx,
        viewport,
      }).promise;

      const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const dataUrl = canvas.toDataURL(mimeType, quality);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error('Failed to generate image blob'));
          },
          mimeType,
          quality
        );
      });

      return { blob, dataUrl };
    });
  }

  /**
   * Release resources, destroy PDF proxy, and free memory.
   */
  destroy() {
    this.isDestroyed = true;
    this.objectUrls.forEach((url) => URL.revokeObjectURL(url));
    this.objectUrls.clear();

    if (this.pdfDocProxy) {
      try {
        this.pdfDocProxy.destroy();
      } catch {}
      this.pdfDocProxy = null;
    }
    this.rawBuffer = null;
  }
}

/**
 * Standalone thumbnail rendering helper for one-off calls (backwards compatible).
 */
export async function renderPageThumbnail(
  fileArrayBuffer: ArrayBuffer,
  pageNumber: number,
  pageInfo: PageInfo,
  renderScale = 0.45,
  rotation = 0
): Promise<string> {
  const engine = new PdfThumbnailEngine();
  try {
    await engine.loadDocument(fileArrayBuffer.slice(0));
    const thumb = await engine.renderPageThumbnail(pageNumber, pageInfo, renderScale, rotation);
    engine.destroy();
    return thumb;
  } catch (err) {
    console.warn(`One-off thumbnail fallback for page ${pageNumber}:`, err);
    engine.destroy();
    return generateFallbackPageThumbnail(pageInfo);
  }
}

/**
 * Standalone page-to-image converter (backwards compatible).
 */
export async function renderPageToImageBlob(
  fileArrayBuffer: ArrayBuffer,
  pageNumber: number,
  pageInfo: PageInfo,
  format: 'png' | 'jpeg' = 'png',
  quality = 0.95,
  scale = 2.0,
  rotation = 0
): Promise<{ blob: Blob; dataUrl: string }> {
  const engine = new PdfThumbnailEngine();
  try {
    await engine.loadDocument(fileArrayBuffer.slice(0));
    const result = await engine.renderPageToBlob(pageNumber, format, quality, scale, rotation);
    engine.destroy();
    return result;
  } catch (err) {
    engine.destroy();
    console.warn('Page to image fallback:', err);
    const fallbackUrl = generateFallbackPageThumbnail(pageInfo);
    const res = await fetch(fallbackUrl);
    const blob = await res.blob();
    return { blob, dataUrl: fallbackUrl };
  }
}
