import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MousePointer2,
  Type,
  Image as ImageIcon,
  Pen,
  Highlighter,
  Square,
  Minus,
  ArrowUpRight,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ScanText,
  FileText,
  Info,
  Bold,
  Layers,
  ShieldAlert,
} from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url';
import { createWorker } from 'tesseract.js';
import { ToolHeader } from './ToolHeader';
import { FileUploadZone } from './FileUploadZone';
import { PdfDownloadSection } from './PdfDownloadSection';
import { RelatedToolsSection } from './RelatedToolsSection';
import { ToolGuideSection } from './ToolGuideSection';
import { FaqSection } from '../FaqSection';
import { TOOLS_DATA, ToolItem } from '../../data/toolsData';
import { getSuggestedDefaultFileName } from '../../utils/fileNaming';

if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;
}

type EditorToolMode =
  | 'select'
  | 'text'
  | 'image'
  | 'pen'
  | 'highlighter'
  | 'rect'
  | 'highlight-box'
  | 'line'
  | 'arrow'
  | 'cover';

type PdfFontFamily = 'Helvetica' | 'TimesRoman' | 'Courier';

interface DetectedTextSegment {
  id: string;
  str: string;
  // Coordinates normalized in PDF points (origin: top-left for UI convenience)
  xPt: number;
  yTopPt: number;
  widthPt: number;
  heightPt: number;
  fontSizePt: number;
  fromOcr?: boolean;
}

interface EditorObject {
  id: string;
  pageNumber: number; // 1-indexed
  type: 'text' | 'image' | 'path' | 'rect' | 'line' | 'arrow';
  // Coordinates in PDF points (top-left origin; converted to bottom-left upon PDF export)
  xPt: number;
  yTopPt: number;
  widthPt?: number;
  heightPt?: number;
  // Text properties
  text?: string;
  fontSizePt?: number;
  fontFamily?: PdfFontFamily;
  bold?: boolean;
  colorHex?: string;
  bgFillHex?: string | null; // e.g. '#ffffff' when masking replaced PDF text
  // Path properties (pen / highlighter)
  pointsPt?: { x: number; y: number }[];
  strokeWidthPt?: number;
  opacity?: number;
  // Line / arrow endpoint
  x2Pt?: number;
  y2TopPt?: number;
  // Shape styling
  fillHex?: string | null;
  borderHex?: string | null;
  // Image properties
  imageDataUrl?: string;
  imageMime?: 'image/png' | 'image/jpeg';
}

interface VisualPdfEditorToolProps {
  onNavigate: (path: string) => void;
}

function hexToRgbValues(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(clean || '000000', 16);
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255,
  };
}

export const VisualPdfEditorTool: React.FC<VisualPdfEditorToolProps> = ({ onNavigate }) => {
  // Document state
  const [file, setFile] = useState<File | null>(null);
  const [originalBytes, setOriginalBytes] = useState<ArrayBuffer | null>(null);
  const [pdfjsDoc, setPdfjsDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSizePt, setPageSizePt] = useState<{ width: number; height: number }>({
    width: 595.28,
    height: 841.89,
  });
  const [zoom, setZoom] = useState<number>(1.0);
  const [isLoadingDoc, setIsLoadingDoc] = useState<boolean>(false);
  const [isRenderingPage, setIsRenderingPage] = useState<boolean>(false);

  // Page text intelligence
  const [detectedTextByPage, setDetectedTextByPage] = useState<
    Record<number, DetectedTextSegment[]>
  >({});
  const [isOcrRunning, setIsOcrRunning] = useState<boolean>(false);
  const [ocrStatus, setOcrStatus] = useState<string>('');

  // Editor state & Undo/Redo history
  const [toolMode, setToolMode] = useState<EditorToolMode>('select');
  const [objects, setObjects] = useState<EditorObject[]>([]);
  const [undoStack, setUndoStack] = useState<EditorObject[][]>([]);
  const [redoStack, setRedoStack] = useState<EditorObject[][]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  // Style defaults for newly created objects
  const [activeColor, setActiveColor] = useState<string>('#111827');
  const [activeFontSize, setActiveFontSize] = useState<number>(14);
  const [activeFontFamily, setActiveFontFamily] = useState<PdfFontFamily>('Helvetica');
  const [activeBold, setActiveBold] = useState<boolean>(false);
  const [activeStrokeWidth, setActiveStrokeWidth] = useState<number>(3);
  const [flattenEditedPages, setFlattenEditedPages] = useState<boolean>(false);

  // Active interaction state (drawing / dragging / resizing)
  const [activeDraftPath, setActiveDraftPath] = useState<{ x: number; y: number }[] | null>(null);
  const [activeDraftShape, setActiveDraftShape] = useState<{
    startX: number;
    startY: number;
    currX: number;
    currY: number;
  } | null>(null);
  const [dragState, setDragState] = useState<{
    objectId: string;
    mode: 'move' | 'resize';
    startClientX: number;
    startClientY: number;
    origX: number;
    origYTop: number;
    origWidth: number;
    origHeight: number;
    preDragObjects: EditorObject[];
  } | null>(null);

  // Export state
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [processedBytes, setProcessedBytes] = useState<Uint8Array | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const imageUploadRef = useRef<HTMLInputElement | null>(null);
  const pdfDocRef = useRef<any>(null);

  // Clean up pdf.js worker document on unmount
  useEffect(() => {
    return () => {
      if (pdfDocRef.current && typeof pdfDocRef.current.destroy === 'function') {
        pdfDocRef.current.destroy();
      }
    };
  }, []);

  // Push state snapshot to Undo stack before mutations
  const commitObjectsChange = useCallback(
    (updater: (prev: EditorObject[]) => EditorObject[]) => {
      setObjects((prev) => {
        setUndoStack((u) => [...u.slice(-29), prev]);
        setRedoStack([]);
        return updater(prev);
      });
      setProcessedBytes(null);
      setStatusMessage(null);
    },
    []
  );

  const handleUndo = useCallback(() => {
    setUndoStack((u) => {
      if (u.length === 0) return u;
      const previous = u[u.length - 1];
      setObjects((curr) => {
        setRedoStack((r) => [...r, curr]);
        return previous;
      });
      setSelectedObjectId(null);
      setProcessedBytes(null);
      return u.slice(0, -1);
    });
  }, []);

  const handleRedo = useCallback(() => {
    setRedoStack((r) => {
      if (r.length === 0) return r;
      const next = r[r.length - 1];
      setObjects((curr) => {
        setUndoStack((u) => [...u, curr]);
        return next;
      });
      setSelectedObjectId(null);
      setProcessedBytes(null);
      return r.slice(0, -1);
    });
  }, []);

  // Delete selected object via keyboard Delete/Backspace
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!selectedObjectId) return;
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        commitObjectsChange((prev) => prev.filter((o) => o.id !== selectedObjectId));
        setSelectedObjectId(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedObjectId, commitObjectsChange]);

  // Load uploaded PDF
  const handlePdfUpload = async (files: File[]) => {
    const selectedFile = files[0];
    if (!selectedFile) return;

    setIsLoadingDoc(true);
    setErrorMessage(null);
    setStatusMessage(null);
    setProcessedBytes(null);
    setObjects([]);
    setUndoStack([]);
    setRedoStack([]);
    setDetectedTextByPage({});
    setSelectedObjectId(null);

    try {
      const buffer = await selectedFile.arrayBuffer();
      // Keep a fresh copy of original bytes for pdf-lib
      const bytesCopy = buffer.slice(0);
      setOriginalBytes(bytesCopy);

      if (pdfDocRef.current && typeof pdfDocRef.current.destroy === 'function') {
        pdfDocRef.current.destroy();
      }

      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(buffer),
        useSystemFonts: true,
      });
      const loadedPdf = await loadingTask.promise;
      pdfDocRef.current = loadedPdf;

      setFile(selectedFile);
      setPdfjsDoc(loadedPdf);
      setNumPages(loadedPdf.numPages);
      setCurrentPage(1);
    } catch (err: any) {
      console.error('Failed to open PDF in Visual Editor:', err);
      setErrorMessage(
        err?.message ||
          'Could not open this PDF. Ensure the document is valid and not password-locked.'
      );
      setFile(null);
    } finally {
      setIsLoadingDoc(false);
    }
  };

  // Render current page canvas & extract editable text coordinates
  useEffect(() => {
    if (!pdfjsDoc || currentPage < 1 || currentPage > numPages) return;

    let cancelled = false;

    const renderPage = async () => {
      setIsRenderingPage(true);
      try {
        const page = await pdfjsDoc.getPage(currentPage);
        const baseViewport = page.getViewport({ scale: 1.0 });
        if (cancelled) return;

        setPageSizePt({
          width: baseViewport.width,
          height: baseViewport.height,
        });

        const canvasScale = zoom * (window.devicePixelRatio > 1 ? 1.5 : 1.25);
        const renderViewport = page.getViewport({ scale: canvasScale });

        const canvas = bgCanvasRef.current;
        if (canvas) {
          canvas.width = Math.floor(renderViewport.width);
          canvas.height = Math.floor(renderViewport.height);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            await (page.render as any)({
              canvasContext: ctx,
              viewport: renderViewport,
            }).promise;
          }
        }

        // Extract editable text segments if not already cached for this page
        if (!detectedTextByPage[currentPage]) {
          const textContent = await page.getTextContent();
          if (cancelled) return;

          const segments: DetectedTextSegment[] = [];
          (textContent.items as any[]).forEach((item, idx) => {
            const textStr = item.str;
            if (!textStr || !textStr.trim()) return;
            const tx = item.transform || [1, 0, 0, 1, 0, 0];
            const fontSizePt = Math.max(6, Math.hypot(tx[2], tx[3]) || item.height || 12);
            const xPt = tx[4];
            // PDF origin is bottom-left; convert baseline Y to top-left top coordinate
            const yTopPt = baseViewport.height - tx[5] - fontSizePt * 0.85;
            const widthPt = Math.max(8, item.width || textStr.length * fontSizePt * 0.52);
            const heightPt = Math.max(10, fontSizePt * 1.25);

            segments.push({
              id: `txt-${currentPage}-${idx}`,
              str: textStr,
              xPt,
              yTopPt,
              widthPt,
              heightPt,
              fontSizePt,
            });
          });

          setDetectedTextByPage((prev) => ({
            ...prev,
            [currentPage]: segments,
          }));
        }
      } catch (err) {
        console.error(`Error rendering page ${currentPage}:`, err);
      } finally {
        if (!cancelled) setIsRenderingPage(false);
      }
    };

    renderPage();
    return () => {
      cancelled = true;
    };
  }, [pdfjsDoc, currentPage, numPages, zoom, detectedTextByPage]);

  // Run OCR assist on a scanned page with zero embedded text
  const handleRunPageOcr = async () => {
    if (!pdfjsDoc) return;
    setIsOcrRunning(true);
    setOcrStatus(`Running Tesseract OCR on Page ${currentPage}...`);
    setErrorMessage(null);

    try {
      const page = await pdfjsDoc.getPage(currentPage);
      const baseVp = page.getViewport({ scale: 1.0 });
      const ocrScale = 2.0;
      const ocrVp = page.getViewport({ scale: ocrScale });

      const offCanvas = document.createElement('canvas');
      offCanvas.width = Math.floor(ocrVp.width);
      offCanvas.height = Math.floor(ocrVp.height);
      const ctx = offCanvas.getContext('2d');
      if (!ctx) throw new Error('Canvas unavailable for OCR.');

      await (page.render as any)({ canvasContext: ctx, viewport: ocrVp }).promise;

      const worker = await createWorker('eng');
      try {
        const result = await worker.recognize(offCanvas);
        const words = (result.data as any).words || [];
        const ocrSegments: DetectedTextSegment[] = words
          .filter((w: any) => w.text && w.text.trim().length > 0 && w.bbox)
          .map((w: any, idx: number) => {
            const xPt = (w.bbox.x0 / offCanvas.width) * baseVp.width;
            const yTopPt = (w.bbox.y0 / offCanvas.height) * baseVp.height;
            const widthPt = Math.max(10, ((w.bbox.x1 - w.bbox.x0) / offCanvas.width) * baseVp.width);
            const heightPt = Math.max(10, ((w.bbox.y1 - w.bbox.y0) / offCanvas.height) * baseVp.height);
            return {
              id: `ocr-${currentPage}-${idx}`,
              str: w.text.trim(),
              xPt,
              yTopPt,
              widthPt,
              heightPt,
              fontSizePt: Math.max(8, Math.round(heightPt * 0.8)),
              fromOcr: true,
            };
          });

        setDetectedTextByPage((prev) => ({
          ...prev,
          [currentPage]: ocrSegments,
        }));

        if (ocrSegments.length === 0) {
          setOcrStatus('OCR completed, but no readable text blocks were recognized on this page.');
        } else {
          setOcrStatus(
            `OCR detected ${ocrSegments.length} text segments! Click any outlined word to edit with an overlay.`
          );
        }
      } finally {
        await worker.terminate();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'OCR recognition failed on this page.');
      setOcrStatus('');
    } finally {
      setIsOcrRunning(false);
    }
  };

  // Convert pointer event to PDF points (top-left origin)
  const clientToPdfPt = (clientX: number, clientY: number): { x: number; y: number } => {
    const el = overlayRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const relX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const relY = Math.max(0, Math.min(rect.height, clientY - rect.top));
    return {
      x: (relX / rect.width) * pageSizePt.width,
      y: (relY / rect.height) * pageSizePt.height,
    };
  };

  // Click an existing PDF text segment to spawn a masked editable replacement text box
  const handleSelectDetectedSegment = (seg: DetectedTextSegment) => {
    if (toolMode !== 'select') return;
    const newId = `obj-replace-${Date.now()}`;
    const replacementObj: EditorObject = {
      id: newId,
      pageNumber: currentPage,
      type: 'text',
      xPt: seg.xPt,
      yTopPt: seg.yTopPt,
      widthPt: Math.max(seg.widthPt + 24, 90),
      heightPt: Math.max(seg.heightPt + 4, 20),
      text: seg.str,
      fontSizePt: Math.max(8, Math.min(48, Math.round(seg.fontSizePt))),
      fontFamily: activeFontFamily,
      bold: activeBold,
      colorHex: activeColor,
      bgFillHex: '#ffffff', // Masks visual original coordinate cleanly
    };

    commitObjectsChange((prev) => [...prev, replacementObj]);
    setSelectedObjectId(newId);
  };

  // Upload image / transparent logo to place on page
  const handleImageLogoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imgFile = e.target.files?.[0];
    if (!imgFile) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const tempImg = new Image();
      tempImg.onload = () => {
        const aspect = tempImg.naturalWidth / Math.max(1, tempImg.naturalHeight);
        const initW = Math.min(180, pageSizePt.width * 0.35);
        const initH = initW / aspect;
        const mime: 'image/png' | 'image/jpeg' =
          imgFile.type === 'image/png' || imgFile.name.toLowerCase().endsWith('.png')
            ? 'image/png'
            : 'image/jpeg';

        // Normalize WebP/BMP into PNG to ensure lossless alpha compatibility with pdf-lib
        if (imgFile.type !== 'image/png' && imgFile.type !== 'image/jpeg') {
          const c = document.createElement('canvas');
          c.width = tempImg.naturalWidth;
          c.height = tempImg.naturalHeight;
          const cx = c.getContext('2d');
          if (cx) {
            cx.drawImage(tempImg, 0, 0);
            const pngUrl = c.toDataURL('image/png');
            const id = `obj-img-${Date.now()}`;
            commitObjectsChange((prev) => [
              ...prev,
              {
                id,
                pageNumber: currentPage,
                type: 'image',
                xPt: (pageSizePt.width - initW) / 2,
                yTopPt: (pageSizePt.height - initH) / 2,
                widthPt: initW,
                heightPt: initH,
                imageDataUrl: pngUrl,
                imageMime: 'image/png',
              },
            ]);
            setSelectedObjectId(id);
            setToolMode('select');
          }
          return;
        }

        const id = `obj-img-${Date.now()}`;
        commitObjectsChange((prev) => [
          ...prev,
          {
            id,
            pageNumber: currentPage,
            type: 'image',
            xPt: (pageSizePt.width - initW) / 2,
            yTopPt: (pageSizePt.height - initH) / 2,
            widthPt: initW,
            heightPt: initH,
            imageDataUrl: dataUrl,
            imageMime: mime,
          },
        ]);
        setSelectedObjectId(id);
        setToolMode('select');
      };
      tempImg.src = dataUrl;
    };
    reader.readAsDataURL(imgFile);
    e.target.value = '';
  };

  // Pointer down on canvas surface
  const handleSurfacePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.target !== overlayRef.current) return;
    const pt = clientToPdfPt(e.clientX, e.clientY);

    if (toolMode === 'select') {
      setSelectedObjectId(null);
      return;
    }

    if (toolMode === 'text') {
      const id = `obj-txt-${Date.now()}`;
      commitObjectsChange((prev) => [
        ...prev,
        {
          id,
          pageNumber: currentPage,
          type: 'text',
          xPt: pt.x,
          yTopPt: pt.y,
          widthPt: 180,
          heightPt: Math.max(24, activeFontSize * 1.6),
          text: 'Double-click or type here',
          fontSizePt: activeFontSize,
          fontFamily: activeFontFamily,
          bold: activeBold,
          colorHex: activeColor,
          bgFillHex: null,
        },
      ]);
      setSelectedObjectId(id);
      setToolMode('select');
      return;
    }

    if (toolMode === 'pen' || toolMode === 'highlighter') {
      setActiveDraftPath([pt]);
      return;
    }

    if (
      toolMode === 'rect' ||
      toolMode === 'highlight-box' ||
      toolMode === 'line' ||
      toolMode === 'arrow' ||
      toolMode === 'cover'
    ) {
      setActiveDraftShape({
        startX: pt.x,
        startY: pt.y,
        currX: pt.x,
        currY: pt.y,
      });
    }
  };

  // Global move & up handlers for dragging, resizing, and drawing
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (dragState && overlayRef.current) {
        const rect = overlayRef.current.getBoundingClientRect();
        const scaleX = pageSizePt.width / rect.width;
        const scaleY = pageSizePt.height / rect.height;
        const dxPt = (e.clientX - dragState.startClientX) * scaleX;
        const dyPt = (e.clientY - dragState.startClientY) * scaleY;

        setObjects((prev) =>
          prev.map((obj) => {
            if (obj.id !== dragState.objectId) return obj;
            if (dragState.mode === 'move') {
              return {
                ...obj,
                xPt: Math.max(0, Math.min(pageSizePt.width - 20, dragState.origX + dxPt)),
                yTopPt: Math.max(0, Math.min(pageSizePt.height - 20, dragState.origYTop + dyPt)),
              };
            } else {
              return {
                ...obj,
                widthPt: Math.max(20, dragState.origWidth + dxPt),
                heightPt: Math.max(16, dragState.origHeight + dyPt),
              };
            }
          })
        );
      } else if (activeDraftPath) {
        const pt = clientToPdfPt(e.clientX, e.clientY);
        setActiveDraftPath((prev) => (prev ? [...prev, pt] : null));
      } else if (activeDraftShape) {
        const pt = clientToPdfPt(e.clientX, e.clientY);
        setActiveDraftShape((prev) => (prev ? { ...prev, currX: pt.x, currY: pt.y } : null));
      }
    };

    const handlePointerUp = () => {
      if (dragState) {
        const movedObj = objects.find((o) => o.id === dragState.objectId);
        const origObj = dragState.preDragObjects.find((o) => o.id === dragState.objectId);
        const changed =
          movedObj &&
          origObj &&
          (movedObj.xPt !== origObj.xPt ||
            movedObj.yTopPt !== origObj.yTopPt ||
            movedObj.widthPt !== origObj.widthPt ||
            movedObj.heightPt !== origObj.heightPt);
        if (changed) {
          setUndoStack((u) => [...u.slice(-29), dragState.preDragObjects]);
          setRedoStack([]);
          setProcessedBytes(null);
        }
        setDragState(null);
      } else if (activeDraftPath && activeDraftPath.length >= 2) {
        const isHL = toolMode === 'highlighter';
        const id = `obj-path-${Date.now()}`;
        commitObjectsChange((prev) => [
          ...prev,
          {
            id,
            pageNumber: currentPage,
            type: 'path',
            xPt: 0,
            yTopPt: 0,
            pointsPt: activeDraftPath,
            colorHex: isHL ? '#facc15' : activeColor,
            strokeWidthPt: isHL ? Math.max(10, activeStrokeWidth * 3) : activeStrokeWidth,
            opacity: isHL ? 0.35 : 1.0,
          },
        ]);
        setActiveDraftPath(null);
      } else if (activeDraftPath) {
        setActiveDraftPath(null);
      } else if (activeDraftShape) {
        const minX = Math.min(activeDraftShape.startX, activeDraftShape.currX);
        const minY = Math.min(activeDraftShape.startY, activeDraftShape.currY);
        const w = Math.abs(activeDraftShape.currX - activeDraftShape.startX);
        const h = Math.abs(activeDraftShape.currY - activeDraftShape.startY);

        if (w > 4 || h > 4) {
          if (toolMode === 'line' || toolMode === 'arrow') {
            const id = `obj-${toolMode}-${Date.now()}`;
            commitObjectsChange((prev) => [
              ...prev,
              {
                id,
                pageNumber: currentPage,
                type: toolMode,
                xPt: activeDraftShape.startX,
                yTopPt: activeDraftShape.startY,
                x2Pt: activeDraftShape.currX,
                y2TopPt: activeDraftShape.currY,
                colorHex: activeColor,
                strokeWidthPt: activeStrokeWidth,
                opacity: 1,
              },
            ]);
          } else {
            const isHighlightBox = toolMode === 'highlight-box';
            const isCoverPatch = toolMode === 'cover';
            const id = `obj-rect-${Date.now()}`;
            commitObjectsChange((prev) => [
              ...prev,
              {
                id,
                pageNumber: currentPage,
                type: 'rect',
                xPt: minX,
                yTopPt: minY,
                widthPt: Math.max(10, w),
                heightPt: Math.max(10, h),
                fillHex: isHighlightBox ? '#facc15' : isCoverPatch ? '#ffffff' : null,
                borderHex: isHighlightBox || isCoverPatch ? null : activeColor,
                strokeWidthPt: activeStrokeWidth,
                opacity: isHighlightBox ? 0.35 : 1.0,
              },
            ]);
            setSelectedObjectId(id);
          }
        }
        setActiveDraftShape(null);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [
    dragState,
    activeDraftPath,
    activeDraftShape,
    pageSizePt,
    toolMode,
    activeColor,
    activeStrokeWidth,
    currentPage,
    commitObjectsChange,
    objects,
  ]);

  // Update selected object styling
  const updateSelectedObject = (patch: Partial<EditorObject>) => {
    if (!selectedObjectId) return;
    commitObjectsChange((prev) =>
      prev.map((o) => (o.id === selectedObjectId ? { ...o, ...patch } : o))
    );
  };

  // Export Edited PDF using pdf-lib
  const handleSavePdf = async () => {
    if (!originalBytes || !file) return;

    setIsSaving(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const pdfDoc = await PDFDocument.load(originalBytes.slice(0), {
        ignoreEncryption: true,
      });

      const fonts = {
        Helvetica: await pdfDoc.embedFont(StandardFonts.Helvetica),
        HelveticaBold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
        TimesRoman: await pdfDoc.embedFont(StandardFonts.TimesRoman),
        TimesRomanBold: await pdfDoc.embedFont(StandardFonts.TimesRomanBold),
        Courier: await pdfDoc.embedFont(StandardFonts.Courier),
        CourierBold: await pdfDoc.embedFont(StandardFonts.CourierBold),
      };

      const pages = pdfDoc.getPages();

      for (const obj of objects) {
        const pageIdx = obj.pageNumber - 1;
        if (pageIdx < 0 || pageIdx >= pages.length) continue;
        const page = pages[pageIdx];
        const { height: pHeight } = page.getSize();

        if (obj.type === 'text' && obj.text) {
          const fSize = obj.fontSizePt || 14;
          const fontKey = `${obj.fontFamily || 'Helvetica'}${obj.bold ? 'Bold' : ''}` as keyof typeof fonts;
          const font = fonts[fontKey] || fonts.Helvetica;

          // Draw opaque replacement background rectangle if configured (e.g. text replacement overlay)
          if (obj.bgFillHex && obj.widthPt && obj.heightPt) {
            const bgRgb = hexToRgbValues(obj.bgFillHex);
            const rectYBottom = pHeight - obj.yTopPt - obj.heightPt;
            page.drawRectangle({
              x: obj.xPt,
              y: rectYBottom,
              width: obj.widthPt,
              height: obj.heightPt,
              color: rgb(bgRgb.r, bgRgb.g, bgRgb.b),
            });
          }

          const txtRgb = hexToRgbValues(obj.colorHex || '#111827');
          const isWinAnsiSafe = /^[\x09\x0A\x0D\x20-\x7E\xA0-\xFF]*$/.test(obj.text);

          if (isWinAnsiSafe) {
            const lines = obj.text.split('\n');
            lines.forEach((line, idx) => {
              // Convert top-left box coordinate to PDF text baseline coordinate
              const baselineY = pHeight - obj.yTopPt - fSize * (idx + 1) * 1.15;
              page.drawText(line, {
                x: obj.xPt + 2,
                y: baselineY,
                size: fSize,
                font,
                color: rgb(txtRgb.r, txtRgb.g, txtRgb.b),
              });
            });
          } else {
            // Render non-WinAnsi Unicode text cleanly onto transparent Canvas PNG at 2x scale
            const boxW = Math.max(40, obj.widthPt || 180);
            const lines = obj.text.split('\n');
            const boxH = Math.max(obj.heightPt || 24, lines.length * fSize * 1.25 + 6);
            const scale = 2;
            const tc = document.createElement('canvas');
            tc.width = Math.ceil(boxW * scale);
            tc.height = Math.ceil(boxH * scale);
            const tctx = tc.getContext('2d');
            if (tctx) {
              const cssFamily =
                obj.fontFamily === 'TimesRoman'
                  ? 'Georgia, serif'
                  : obj.fontFamily === 'Courier'
                  ? 'monospace'
                  : 'sans-serif';
              tctx.font = `${obj.bold ? 'bold ' : ''}${fSize * scale}px ${cssFamily}`;
              tctx.fillStyle = obj.colorHex || '#111827';
              lines.forEach((line, idx) => {
                tctx.fillText(line, 4, (fSize * (idx + 1) * 1.15) * scale);
              });
              const pngUrl = tc.toDataURL('image/png');
              tc.width = 0;
              tc.height = 0;
              const pngBytes = await (await fetch(pngUrl)).arrayBuffer();
              const embeddedTextImg = await pdfDoc.embedPng(pngBytes);
              page.drawImage(embeddedTextImg, {
                x: obj.xPt,
                y: pHeight - obj.yTopPt - boxH,
                width: boxW,
                height: boxH,
              });
            }
          }
        } else if (obj.type === 'image' && obj.imageDataUrl) {
          const w = obj.widthPt || 120;
          const h = obj.heightPt || 80;
          const yBottom = pHeight - obj.yTopPt - h;

          const imgBytes = await (await fetch(obj.imageDataUrl)).arrayBuffer();
          const embeddedImg =
            obj.imageMime === 'image/png'
              ? await pdfDoc.embedPng(imgBytes)
              : await pdfDoc.embedJpg(imgBytes);

          page.drawImage(embeddedImg, {
            x: obj.xPt,
            y: yBottom,
            width: w,
            height: h,
          });
        } else if (obj.type === 'rect') {
          const w = obj.widthPt || 40;
          const h = obj.heightPt || 30;
          const yBottom = pHeight - obj.yTopPt - h;
          const fill = obj.fillHex ? hexToRgbValues(obj.fillHex) : null;
          const border = obj.borderHex ? hexToRgbValues(obj.borderHex) : null;

          page.drawRectangle({
            x: obj.xPt,
            y: yBottom,
            width: w,
            height: h,
            color: fill ? rgb(fill.r, fill.g, fill.b) : undefined,
            borderColor: border ? rgb(border.r, border.g, border.b) : undefined,
            borderWidth: border ? obj.strokeWidthPt || 2 : 0,
            opacity: obj.opacity ?? 1,
          });
        } else if (obj.type === 'path' && obj.pointsPt && obj.pointsPt.length >= 2) {
          const strokeRgb = hexToRgbValues(obj.colorHex || '#111827');
          for (let i = 1; i < obj.pointsPt.length; i++) {
            const prev = obj.pointsPt[i - 1];
            const curr = obj.pointsPt[i];
            page.drawLine({
              start: { x: prev.x, y: pHeight - prev.y },
              end: { x: curr.x, y: pHeight - curr.y },
              thickness: obj.strokeWidthPt || 2.5,
              color: rgb(strokeRgb.r, strokeRgb.g, strokeRgb.b),
              opacity: obj.opacity ?? 1,
            });
          }
        } else if (
          (obj.type === 'line' || obj.type === 'arrow') &&
          obj.x2Pt !== undefined &&
          obj.y2TopPt !== undefined
        ) {
          const strokeRgb = hexToRgbValues(obj.colorHex || '#111827');
          const y1 = pHeight - obj.yTopPt;
          const y2 = pHeight - obj.y2TopPt;

          page.drawLine({
            start: { x: obj.xPt, y: y1 },
            end: { x: obj.x2Pt, y: y2 },
            thickness: obj.strokeWidthPt || 2.5,
            color: rgb(strokeRgb.r, strokeRgb.g, strokeRgb.b),
          });

          if (obj.type === 'arrow') {
            const angle = Math.atan2(y2 - y1, obj.x2Pt - obj.xPt);
            const headLen = Math.max(10, (obj.strokeWidthPt || 2.5) * 4);
            page.drawLine({
              start: { x: obj.x2Pt, y: y2 },
              end: {
                x: obj.x2Pt - headLen * Math.cos(angle - Math.PI / 6),
                y: y2 - headLen * Math.sin(angle - Math.PI / 6),
              },
              thickness: obj.strokeWidthPt || 2.5,
              color: rgb(strokeRgb.r, strokeRgb.g, strokeRgb.b),
            });
            page.drawLine({
              start: { x: obj.x2Pt, y: y2 },
              end: {
                x: obj.x2Pt - headLen * Math.cos(angle + Math.PI / 6),
                y: y2 - headLen * Math.sin(angle + Math.PI / 6),
              },
              thickness: obj.strokeWidthPt || 2.5,
              color: rgb(strokeRgb.r, strokeRgb.g, strokeRgb.b),
            });
          }
        }
      }

      let finalBytes = await pdfDoc.save();

      // Optional: burn/flatten pages with annotations into rasterized images for universal lock-in
      if (flattenEditedPages && objects.length > 0) {
        const editedPageNums = new Set(objects.map((o) => o.pageNumber));
        const tempDoc = await pdfjsLib.getDocument({ data: finalBytes.slice(0) }).promise;
        const flatPdf = await PDFDocument.create();
        const srcVectorPdf = await PDFDocument.load(finalBytes.slice(0), {
          ignoreEncryption: true,
        });

        for (let pNum = 1; pNum <= numPages; pNum++) {
          if (!editedPageNums.has(pNum)) {
            const [copied] = await flatPdf.copyPages(srcVectorPdf, [pNum - 1]);
            flatPdf.addPage(copied);
          } else {
            const page = await tempDoc.getPage(pNum);
            const baseVp = page.getViewport({ scale: 1.0 });
            const scaleVp = page.getViewport({ scale: 2.0 });
            const c = document.createElement('canvas');
            c.width = Math.floor(scaleVp.width);
            c.height = Math.floor(scaleVp.height);
            const cx = c.getContext('2d');
            if (cx) {
              await (page.render as any)({ canvasContext: cx, viewport: scaleVp }).promise;
              const jpgUrl = c.toDataURL('image/jpeg', 0.94);
              c.width = 0;
              c.height = 0;
              const jpgBuf = await (await fetch(jpgUrl)).arrayBuffer();
              const embedded = await flatPdf.embedJpg(jpgBuf);
              const np = flatPdf.addPage([baseVp.width, baseVp.height]);
              np.drawImage(embedded, {
                x: 0,
                y: 0,
                width: baseVp.width,
                height: baseVp.height,
              });
            }
          }
        }
        finalBytes = await flatPdf.save();
        tempDoc.destroy();
      }

      setProcessedBytes(finalBytes);
      setStatusMessage(
        `Saved ${objects.length} edit${objects.length === 1 ? '' : 's'} across ${numPages} page${
          numPages === 1 ? '' : 's'
        }${flattenEditedPages ? ' (flattened)' : ''}. Ready to download.`
      );
    } catch (err: any) {
      console.error('Failed to save edited PDF:', err);
      setErrorMessage(err?.message || 'Failed to save edited PDF.');
    } finally {
      setIsSaving(false);
    }
  };

  const currentObjects = objects.filter((o) => o.pageNumber === currentPage);
  const currentDetectedText = detectedTextByPage[currentPage] || [];
  const selectedObj = objects.find((o) => o.id === selectedObjectId) || null;
  const isScannedPage = file && !isRenderingPage && currentDetectedText.length === 0;

  const displayWidthPx = Math.round(pageSizePt.width * zoom);
  const displayHeightPx = Math.round(pageSizePt.height * zoom);
  const ptToPx = (pt: number) => pt * zoom;

  const toolData: ToolItem = TOOLS_DATA.find((t) => t.id === 'edit-pdf') || {
    id: 'edit-pdf',
    name: 'Visual PDF Editor',
    slug: 'edit-pdf',
    category: 'pdf',
    categoryLabel: 'Edit PDF',
    shortDesc: 'Visually edit text overlays, add images/logos, draw, highlight, and annotate PDFs.',
    longDesc: 'Interactive visual PDF editor: add text boxes, replace text segments, insert transparent logos, draw freehand, add shapes, and export.',
    iconName: 'FileEdit',
    keywords: ['edit pdf', 'pdf editor', 'annotate pdf', 'add image to pdf'],
  };

  return (
    <div className="min-h-screen bg-[#101114] text-[#F5F5F5] py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <ToolHeader tool={toolData} onNavigate={onNavigate} badge="Interactive Editor" />

        {!file ? (
          <div className="space-y-4">
            <FileUploadZone
              onFilesSelected={handlePdfUpload}
              accept=".pdf,application/pdf"
              multiple={false}
              title="Drop your PDF here to launch the Visual Editor"
              subtitle="Edit text segments, add transparent logos, draw annotations, highlight, and save locally."
              fileTypeLabel="PDF"
            />
            {isLoadingDoc && (
              <div className="p-6 bg-[#1B1D22] border border-amber-500/30 rounded-2xl flex items-center justify-center gap-3 text-sm text-amber-300">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Opening PDF pages and inspecting text streams...</span>
              </div>
            )}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Top Editor Toolbar */}
            <div className="bg-[#1B1D22] border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl space-y-3">
              {/* Row 1: Tool Modes + Undo/Redo + Export */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'select', label: 'Select / Edit Text', icon: MousePointer2 },
                    { id: 'text', label: 'Add Text', icon: Type },
                    { id: 'image', label: 'Add Image/Logo', icon: ImageIcon },
                    { id: 'pen', label: 'Pen', icon: Pen },
                    { id: 'highlighter', label: 'Highlighter', icon: Highlighter },
                    { id: 'highlight-box', label: 'Highlight Box', icon: Layers },
                    { id: 'rect', label: 'Rectangle', icon: Square },
                    { id: 'line', label: 'Line', icon: Minus },
                    { id: 'arrow', label: 'Arrow', icon: ArrowUpRight },
                    { id: 'cover', label: 'Cover Patch', icon: Eraser },
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = toolMode === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (item.id === 'image') {
                            imageUploadRef.current?.click();
                          } else {
                            setToolMode(item.id as EditorToolMode);
                          }
                        }}
                        className={`px-2.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          active
                            ? 'bg-[#D4AF37] text-[#101114] shadow-md'
                            : 'bg-[#101114] text-slate-300 border border-slate-800 hover:border-amber-500/40 hover:text-amber-300'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">{item.label}</span>
                      </button>
                    );
                  })}
                  <input
                    ref={imageUploadRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageLogoSelected}
                    className="hidden"
                  />
                </div>

                {/* History & Save */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={undoStack.length === 0}
                    className="p-2 rounded-xl bg-[#101114] border border-slate-800 text-slate-300 hover:text-amber-300 disabled:opacity-30 cursor-pointer"
                    title="Undo"
                  >
                    <Undo2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRedo}
                    disabled={redoStack.length === 0}
                    className="p-2 rounded-xl bg-[#101114] border border-slate-800 text-slate-300 hover:text-amber-300 disabled:opacity-30 cursor-pointer"
                    title="Redo"
                  >
                    <Redo2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePdf}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>{isSaving ? 'Applying Edits...' : 'Apply & Export PDF'}</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Contextual Style Bar & Navigation */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-800/80 text-xs">
                {/* Typography & Stroke Controls */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400">Color:</span>
                    <input
                      type="color"
                      value={selectedObj?.colorHex || selectedObj?.borderHex || activeColor}
                      onChange={(e) => {
                        setActiveColor(e.target.value);
                        if (selectedObj) {
                          updateSelectedObject(
                            selectedObj.type === 'rect'
                              ? { borderHex: e.target.value }
                              : { colorHex: e.target.value }
                          );
                        }
                      }}
                      className="w-7 h-7 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                    />
                  </div>

                  <select
                    value={selectedObj?.fontFamily || activeFontFamily}
                    onChange={(e) => {
                      const fam = e.target.value as PdfFontFamily;
                      setActiveFontFamily(fam);
                      if (selectedObj?.type === 'text') updateSelectedObject({ fontFamily: fam });
                    }}
                    className="bg-[#101114] border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
                  >
                    <option value="Helvetica">Helvetica (Sans)</option>
                    <option value="TimesRoman">Times Roman (Serif)</option>
                    <option value="Courier">Courier (Mono)</option>
                  </select>

                  <select
                    value={selectedObj?.fontSizePt || activeFontSize}
                    onChange={(e) => {
                      const sz = Number(e.target.value);
                      setActiveFontSize(sz);
                      if (selectedObj?.type === 'text') updateSelectedObject({ fontSizePt: sz });
                    }}
                    className="bg-[#101114] border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono"
                  >
                    {[9, 10, 11, 12, 14, 16, 18, 22, 28, 36, 48].map((sz) => (
                      <option key={sz} value={sz}>
                        {sz} pt
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      const nextBold = !(selectedObj?.bold ?? activeBold);
                      setActiveBold(nextBold);
                      if (selectedObj?.type === 'text') updateSelectedObject({ bold: nextBold });
                    }}
                    className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                      (selectedObj?.type === 'text' ? selectedObj.bold : activeBold)
                        ? 'bg-amber-500/25 border-amber-400 text-amber-300'
                        : 'bg-[#101114] border-slate-700 text-slate-400'
                    }`}
                    title="Bold Font"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400">Stroke:</span>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={selectedObj?.strokeWidthPt || activeStrokeWidth}
                      onChange={(e) => {
                        const val = Math.max(1, Math.min(20, Number(e.target.value) || 2));
                        setActiveStrokeWidth(val);
                        if (selectedObj) updateSelectedObject({ strokeWidthPt: val });
                      }}
                      className="w-12 bg-[#101114] border border-slate-700 rounded-lg px-1.5 py-1 text-xs text-slate-200 font-mono"
                    />
                  </div>

                  {selectedObj && (
                    <button
                      type="button"
                      onClick={() => {
                        commitObjectsChange((prev) => prev.filter((o) => o.id !== selectedObj.id));
                        setSelectedObjectId(null);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:bg-rose-900/60 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Selected
                    </button>
                  )}
                </div>

                {/* Page Nav & Zoom */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-[#101114] border border-slate-800 rounded-xl px-2 py-1">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="p-1 text-slate-300 hover:text-amber-300 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono px-2">
                      Page {currentPage} / {numPages}
                    </span>
                    <button
                      type="button"
                      disabled={currentPage >= numPages}
                      onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                      className="p-1 text-slate-300 hover:text-amber-300 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1 bg-[#101114] border border-slate-800 rounded-xl px-2 py-1">
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.15).toFixed(2))))}
                      className="p-1 text-slate-300 hover:text-amber-300 cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-mono px-1.5">{Math.round(zoom * 100)}%</span>
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.min(2.0, Number((z + 0.15).toFixed(2))))}
                      className="p-1 text-slate-300 hover:text-amber-300 cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPdfjsDoc(null);
                      setOriginalBytes(null);
                      setObjects([]);
                      setProcessedBytes(null);
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/30 cursor-pointer"
                  >
                    Change File
                  </button>
                </div>
              </div>

              {/* Row 3: Document Content Classification & Honest Limitation Banner */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-[11px]">
                <div className="flex flex-wrap items-center gap-2">
                  {isScannedPage ? (
                    <div className="flex items-center gap-2 text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                      <ScanText className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Scanned Image Page Detected (no embedded text layer).
                      </span>
                      <button
                        type="button"
                        onClick={handleRunPageOcr}
                        disabled={isOcrRunning}
                        className="ml-1 px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 cursor-pointer disabled:opacity-50"
                      >
                        {isOcrRunning ? 'Running OCR...' : 'Run OCR Assist'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {currentDetectedText.length} Text Segments Ready — Click any dashed text
                        box in <strong>Select</strong> mode to replace it.
                      </span>
                    </div>
                  )}

                  {toolMode === 'cover' && (
                    <div className="flex items-center gap-1.5 text-amber-200 bg-amber-500/15 border border-amber-500/35 px-2.5 py-1 rounded-lg">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        Cover patches only mask visuals. For irreversible erasure of underlying text,
                        enable <strong>Flatten</strong> or use Redact PDF.
                      </span>
                    </div>
                  )}
                </div>

                <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={flattenEditedPages}
                    onChange={(e) => setFlattenEditedPages(e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span>Flatten edited pages on export (burns annotations into image)</span>
                </label>
              </div>
              {ocrStatus && (
                <div className="text-[11px] text-amber-300 font-mono">{ocrStatus}</div>
              )}
            </div>

            {/* Interactive Visual Canvas Viewport */}
            <div className="bg-[#090b10] border border-slate-800 rounded-2xl p-4 sm:p-8 overflow-auto max-h-[75vh] flex justify-center shadow-inner">
              <div
                className="relative bg-white shadow-2xl select-none shrink-0"
                style={{ width: `${displayWidthPx}px`, height: `${displayHeightPx}px` }}
              >
                {/* Underlying PDF.js rendered page */}
                <canvas
                  ref={bgCanvasRef}
                  className="block w-full h-full pointer-events-none"
                />

                {/* Interactive Annotation & Editing Surface */}
                <div
                  ref={overlayRef}
                  onPointerDown={handleSurfacePointerDown}
                  className={`absolute inset-0 touch-none ${
                    toolMode === 'select'
                      ? 'cursor-default'
                      : toolMode === 'text'
                      ? 'cursor-text'
                      : 'cursor-crosshair'
                  }`}
                >
                  {/* Interactive Text Segments detected by PDF.js or OCR (visible outlines in Select mode) */}
                  {toolMode === 'select' &&
                    currentDetectedText.map((seg) => (
                      <div
                        key={seg.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectDetectedSegment(seg);
                        }}
                        title={`Click to edit "${seg.str}" via masked replacement overlay`}
                        className="absolute border border-dashed border-sky-400/35 hover:border-sky-500 hover:bg-sky-400/15 transition cursor-pointer"
                        style={{
                          left: `${ptToPx(seg.xPt)}px`,
                          top: `${ptToPx(seg.yTopPt)}px`,
                          width: `${ptToPx(seg.widthPt)}px`,
                          height: `${ptToPx(seg.heightPt)}px`,
                        }}
                      />
                    ))}

                  {/* SVG Layer for Pen, Highlighter, Lines & Arrows */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox={`0 0 ${pageSizePt.width} ${pageSizePt.height}`}
                  >
                    {currentObjects
                      .filter((o) => o.type === 'path' || o.type === 'line' || o.type === 'arrow')
                      .map((obj) => {
                        if (obj.type === 'path' && obj.pointsPt) {
                          const d = obj.pointsPt
                            .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`)
                            .join(' ');
                          return (
                            <path
                              key={obj.id}
                              d={d}
                              fill="none"
                              stroke={obj.colorHex || '#111827'}
                              strokeWidth={obj.strokeWidthPt || 2.5}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              opacity={obj.opacity ?? 1}
                              className="pointer-events-auto cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedObjectId(obj.id);
                              }}
                            />
                          );
                        }
                        if (
                          (obj.type === 'line' || obj.type === 'arrow') &&
                          obj.x2Pt !== undefined &&
                          obj.y2TopPt !== undefined
                        ) {
                          const angle = Math.atan2(obj.y2TopPt - obj.yTopPt, obj.x2Pt - obj.xPt);
                          const headLen = Math.max(10, (obj.strokeWidthPt || 2.5) * 4);
                          return (
                            <g
                              key={obj.id}
                              className="pointer-events-auto cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedObjectId(obj.id);
                              }}
                            >
                              <line
                                x1={obj.xPt}
                                y1={obj.yTopPt}
                                x2={obj.x2Pt}
                                y2={obj.y2TopPt}
                                stroke={obj.colorHex || '#111827'}
                                strokeWidth={obj.strokeWidthPt || 2.5}
                                strokeLinecap="round"
                              />
                              {obj.type === 'arrow' && (
                                <>
                                  <line
                                    x1={obj.x2Pt}
                                    y1={obj.y2TopPt}
                                    x2={obj.x2Pt - headLen * Math.cos(angle - Math.PI / 6)}
                                    y2={obj.y2TopPt - headLen * Math.sin(angle - Math.PI / 6)}
                                    stroke={obj.colorHex || '#111827'}
                                    strokeWidth={obj.strokeWidthPt || 2.5}
                                    strokeLinecap="round"
                                  />
                                  <line
                                    x1={obj.x2Pt}
                                    y1={obj.y2TopPt}
                                    x2={obj.x2Pt - headLen * Math.cos(angle + Math.PI / 6)}
                                    y2={obj.y2TopPt - headLen * Math.sin(angle + Math.PI / 6)}
                                    stroke={obj.colorHex || '#111827'}
                                    strokeWidth={obj.strokeWidthPt || 2.5}
                                    strokeLinecap="round"
                                  />
                                </>
                              )}
                            </g>
                          );
                        }
                        return null;
                      })}

                    {/* Live Draft Pen Path */}
                    {activeDraftPath && activeDraftPath.length > 1 && (
                      <path
                        d={activeDraftPath
                          .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`)
                          .join(' ')}
                        fill="none"
                        stroke={toolMode === 'highlighter' ? '#facc15' : activeColor}
                        strokeWidth={
                          toolMode === 'highlighter'
                            ? Math.max(10, activeStrokeWidth * 3)
                            : activeStrokeWidth
                        }
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={toolMode === 'highlighter' ? 0.35 : 1}
                      />
                    )}

                    {/* Live Draft Line / Arrow / Rect */}
                    {activeDraftShape && (toolMode === 'line' || toolMode === 'arrow') && (
                      <line
                        x1={activeDraftShape.startX}
                        y1={activeDraftShape.startY}
                        x2={activeDraftShape.currX}
                        y2={activeDraftShape.currY}
                        stroke={activeColor}
                        strokeWidth={activeStrokeWidth}
                        strokeDasharray="4 2"
                      />
                    )}
                    {activeDraftShape &&
                      (toolMode === 'rect' || toolMode === 'highlight-box' || toolMode === 'cover') && (
                        <rect
                          x={Math.min(activeDraftShape.startX, activeDraftShape.currX)}
                          y={Math.min(activeDraftShape.startY, activeDraftShape.currY)}
                          width={Math.abs(activeDraftShape.currX - activeDraftShape.startX)}
                          height={Math.abs(activeDraftShape.currY - activeDraftShape.startY)}
                          fill={
                            toolMode === 'highlight-box'
                              ? '#facc15'
                              : toolMode === 'cover'
                              ? '#ffffff'
                              : 'none'
                          }
                          stroke={toolMode === 'rect' ? activeColor : '#38bdf8'}
                          strokeWidth={activeStrokeWidth}
                          opacity={toolMode === 'highlight-box' ? 0.35 : 1}
                        />
                      )}
                  </svg>

                  {/* Interactive Object Overlays (Text Boxes, Images/Logos, Rectangles) */}
                  {currentObjects
                    .filter((o) => o.type === 'text' || o.type === 'image' || o.type === 'rect')
                    .map((obj) => {
                      const isSelected = obj.id === selectedObjectId;
                      return (
                        <div
                          key={obj.id}
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            setSelectedObjectId(obj.id);
                            if ((e.target as HTMLElement).tagName.toLowerCase() === 'textarea') return;
                            setDragState({
                              objectId: obj.id,
                              mode: 'move',
                              startClientX: e.clientX,
                              startClientY: e.clientY,
                              origX: obj.xPt,
                              origYTop: obj.yTopPt,
                              origWidth: obj.widthPt || 100,
                              origHeight: obj.heightPt || 30,
                              preDragObjects: objects.map((item) => ({ ...item })),
                            });
                          }}
                          style={{
                            left: `${ptToPx(obj.xPt)}px`,
                            top: `${ptToPx(obj.yTopPt)}px`,
                            width: obj.widthPt ? `${ptToPx(obj.widthPt)}px` : undefined,
                            height: obj.heightPt ? `${ptToPx(obj.heightPt)}px` : undefined,
                            backgroundColor:
                              obj.type === 'text'
                                ? obj.bgFillHex || 'transparent'
                                : obj.type === 'rect'
                                ? obj.fillHex || 'transparent'
                                : 'transparent',
                            opacity: obj.type === 'rect' ? obj.opacity ?? 1 : 1,
                            border:
                              obj.type === 'rect' && obj.borderHex
                                ? `${ptToPx(obj.strokeWidthPt || 2)}px solid ${obj.borderHex}`
                                : isSelected
                                ? '1.5px solid #D4AF37'
                                : '1px dashed rgba(148,163,184,0.45)',
                          }}
                          className={`absolute group ${isSelected ? 'ring-2 ring-amber-400/50 z-20' : 'z-10'}`}
                        >
                          {obj.type === 'text' && (
                            <textarea
                              value={obj.text || ''}
                              onChange={(e) =>
                                setObjects((prev) =>
                                  prev.map((o) =>
                                    o.id === obj.id ? { ...o, text: e.target.value } : o
                                  )
                                )
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedObjectId(obj.id);
                              }}
                              style={{
                                fontSize: `${ptToPx(obj.fontSizePt || 14)}px`,
                                fontFamily:
                                  obj.fontFamily === 'TimesRoman'
                                    ? 'Georgia, serif'
                                    : obj.fontFamily === 'Courier'
                                    ? 'monospace'
                                    : 'sans-serif',
                                fontWeight: obj.bold ? 'bold' : 'normal',
                                color: obj.colorHex || '#111827',
                                lineHeight: 1.15,
                              }}
                              className="w-full h-full bg-transparent resize-none border-0 outline-hidden p-0.5 cursor-text overflow-hidden"
                            />
                          )}

                          {obj.type === 'image' && obj.imageDataUrl && (
                            <img
                              src={obj.imageDataUrl}
                              alt="Inserted graphic"
                              className="w-full h-full object-contain pointer-events-none"
                            />
                          )}

                          {/* Corner Resize Handle */}
                          {isSelected && (
                            <div
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                setDragState({
                                  objectId: obj.id,
                                  mode: 'resize',
                                  startClientX: e.clientX,
                                  startClientY: e.clientY,
                                  origX: obj.xPt,
                                  origYTop: obj.yTopPt,
                                  origWidth: obj.widthPt || 100,
                                  origHeight: obj.heightPt || 40,
                                  preDragObjects: objects.map((item) => ({ ...item })),
                                });
                              }}
                              className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-[#D4AF37] border border-slate-950 rounded-full cursor-nwse-resize shadow-md touch-none"
                              title="Drag to resize"
                            />
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Alerts & Export Download Card */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {statusMessage && (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {processedBytes && (
              <PdfDownloadSection
                processedBytes={processedBytes}
                defaultFileName={getSuggestedDefaultFileName(file.name, 'edit-pdf', 'edited')}
                targetExtension="pdf"
                statusMessage={statusMessage}
                originalSizeBytes={file.size}
                pageCount={numPages}
                onReset={() => setProcessedBytes(null)}
              />
            )}

            {/* Capability Disclosure Box */}
            <div className="bg-[#1B1D22] border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 flex items-start gap-3">
              <Info className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-white">How Text Editing & Overlay Annotations Work</p>
                <p className="text-slate-400 leading-relaxed">
                  Click any detected text box in <strong>Select</strong> mode to modify it via an
                  aligned replacement layer. Note that because PDF files encode fixed-position glyphs
                  rather than reflowable paragraphs, replacing text applies a masked overlay at the
                  target coordinate without rewriting raw binary content streams—enable{' '}
                  <strong>Flatten</strong> on export or use <strong>Redact PDF</strong> if you need
                  permanent underlying text eradication.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-10">
          <ToolGuideSection
            toolId="edit-pdf"
            toolName="Edit PDF"
            onNavigate={onNavigate}
            hideFaq
          />
        </div>

        <FaqSection
          title="Visual PDF Editor — Questions & Capabilities"
          faqs={[
            {
              q: 'Can I edit existing text directly inside a PDF?',
              a: 'Yes for text-based PDFs: the editor inspects embedded PDF text streams, outlines clickable segments, and lets you replace them cleanly with custom fonts, sizes, and colors via masked overlay coordinates. For scanned image PDFs, use the built-in OCR Assist button first.',
            },
            {
              q: 'Can I add transparent PNG logos and resize them?',
              a: 'Yes. Select Add Image/Logo, upload any PNG (preserving transparency) or JPG, drag it to position it anywhere on the page, and pull the golden corner handle to resize.',
            },
            {
              q: 'Do white cover patches permanently delete sensitive text?',
              a: 'No—covering text with a white patch only masks it visually. If you are hiding confidential details, enable Flatten edited pages on export or use the dedicated Redact PDF tool which erases underlying content streams.',
            },
          ]}
        />

        <RelatedToolsSection currentToolSlug="edit-pdf" onNavigate={onNavigate} />
      </div>
    </div>
  );
};
