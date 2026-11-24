import React, { useState, useRef } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import {
  Layers,
  RotateCw,
  Download,
  Loader2,
  FileText,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { ToolHeader } from './ToolHeader';
import { FileUploadZone } from './FileUploadZone';
import { RelatedToolsSection } from './RelatedToolsSection';
import { ToolGuideSection } from './ToolGuideSection';
import { FaqSection } from '../FaqSection';
import { downloadBytesAsFile } from '../../services/pdfEngine';
import { getSuggestedDefaultFileName } from '../../utils/fileNaming';
import { TOOLS_DATA } from '../../data/toolsData';
import { PdfThumbnailEngine, getPdfDocumentSummary } from '../../services/pdfThumbnailRenderer';
import { PdfPageThumbnailCard } from '../pdf/PdfPageThumbnailCard';

interface OrganizePdfToolProps {
  onNavigate: (path: string) => void;
}

interface PageItem {
  id: string;
  originalIndex: number;
  rotation: number;
  label: string;
  thumbnailUrl?: string;
  status: 'rendering' | 'ready' | 'error';
  width?: number;
  height?: number;
}

export const OrganizePdfTool: React.FC<OrganizePdfToolProps> = ({ onNavigate }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [processedBytes, setProcessedBytes] = useState<Uint8Array | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const engineRef = useRef<PdfThumbnailEngine | null>(null);

  React.useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, []);

  const handleFile = async (selectedFile: File) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      setProcessedBytes(null);

      const buffer = await selectedFile.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });

      if (engineRef.current) {
        engineRef.current.destroy();
      }
      const engine = new PdfThumbnailEngine();
      await engine.loadDocument(buffer);
      engineRef.current = engine;

      const summary = await getPdfDocumentSummary(buffer);

      const initialPages: PageItem[] = summary.pages.map((p, idx) => ({
        id: `page-${idx}-${Date.now()}`,
        originalIndex: idx,
        rotation: 0,
        label: `Page ${idx + 1}`,
        status: 'rendering',
        width: p.width,
        height: p.height,
      }));

      setPdfDoc(doc);
      setPages(initialPages);
      setFile(selectedFile);

      // Render thumbnails asynchronously
      for (const p of summary.pages) {
        engine
          .renderPageThumbnail(p.pageNumber, p, 0.45)
          .then((thumb) => {
            setPages((prev) =>
              prev.map((item) =>
                item.originalIndex === p.pageNumber - 1
                  ? { ...item, thumbnailUrl: thumb, status: 'ready' }
                  : item
              )
            );
          })
          .catch(() => {
            setPages((prev) =>
              prev.map((item) =>
                item.originalIndex === p.pageNumber - 1 ? { ...item, status: 'error' } : item
              )
            );
          });
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to read PDF document.');
    } finally {
      setIsLoading(false);
    }
  };

  const movePage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= pages.length || fromIndex === toIndex) return;
    const updated = [...pages];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setPages(updated);
    setProcessedBytes(null);
  };

  const rotatePage = (index: number) => {
    setPages((prev) =>
      prev.map((p, i) => (i === index ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
    );
    setProcessedBytes(null);
  };

  const rotateAllPages = () => {
    setPages((prev) => prev.map((p) => ({ ...p, rotation: (p.rotation + 90) % 360 })));
    setProcessedBytes(null);
  };

  const deletePage = (index: number) => {
    if (pages.length <= 1) {
      setErrorMessage('Cannot delete the last remaining page.');
      return;
    }
    setPages((prev) => prev.filter((_, i) => i !== index));
    setProcessedBytes(null);
  };

  const resetPages = () => {
    if (!pdfDoc) return;
    const count = pdfDoc.getPageCount();
    const existingByOriginal = new Map(pages.map((p) => [p.originalIndex, p]));
    const reset: PageItem[] = Array.from({ length: count }, (_, idx) => {
      const prev = existingByOriginal.get(idx);
      return {
        id: `page-reset-${idx}-${Date.now()}`,
        originalIndex: idx,
        rotation: 0,
        label: `Page ${idx + 1}`,
        thumbnailUrl: prev?.thumbnailUrl,
        status: prev?.thumbnailUrl ? 'ready' : 'rendering',
        width: prev?.width,
        height: prev?.height,
      };
    });
    setPages(reset);
    setProcessedBytes(null);
    setErrorMessage(null);
  };

  const handleGeneratePdf = async () => {
    if (!pdfDoc || !file || pages.length === 0) return;
    try {
      setIsProcessing(true);
      setErrorMessage(null);

      const targetDoc = await PDFDocument.create();
      for (const p of pages) {
        const [copiedPage] = await targetDoc.copyPages(pdfDoc, [p.originalIndex]);
        if (p.rotation !== 0) {
          const currentRotation = copiedPage.getRotation().angle;
          copiedPage.setRotation(degrees((currentRotation + p.rotation) % 360));
        }
        targetDoc.addPage(copiedPage);
      }

      const bytes = await targetDoc.save();
      setProcessedBytes(bytes);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to reorder and save PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedBytes || !file) return;
    const defaultName = getSuggestedDefaultFileName(file.name, 'organize-pdf', 'organized');
    downloadBytesAsFile(processedBytes, defaultName, 'application/pdf');
  };

  const organizeTool =
    TOOLS_DATA.find((t) => t.slug === 'organize-pdf') || {
      id: 'organize-pdf',
      name: 'Organize PDF',
      slug: 'organize-pdf',
      category: 'pdf' as const,
      categoryLabel: 'Organize PDF',
      shortDesc: 'Sort, reorder, rotate, duplicate, or delete pages with visual thumbnails.',
      longDesc: 'Rearrange PDF pages visually. Drag or shift pages to reorder, delete blank pages, or rotate individual sheets.',
      iconName: 'Layers',
      badge: 'Popular',
      keywords: ['organize', 'pages', 'reorder', 'rotate'],
    };

  const faqs = [
    {
      q: 'How do I move pages in Organize PDF?',
      a: 'Use the left and right arrow buttons on any page card to shift its position backward or forward instantly.',
    },
    {
      q: 'Can I rotate individual pages?',
      a: 'Yes, click the rotate button on any card to rotate that page 90 degrees clockwise, or use "Rotate All" in the header.',
    },
    {
      q: 'Are my pages uploaded to any cloud server?',
      a: 'No. All operations are performed 100% locally in your browser memory via WebAssembly.',
    },
  ];

  return (
    <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn text-slate-100">
      <ToolHeader tool={organizeTool} onNavigate={onNavigate} />

      {!file ? (
        <div className="space-y-4">
          <FileUploadZone
            accept=".pdf,application/pdf"
            multiple={false}
            disabled={isLoading}
            title="Select or Drag a PDF to Organize Pages"
            subtitle="Visual thumbnail workspace • Drag cards to reorder, rotate, delete, or retry previews"
            fileTypeLabel="PDF (.pdf)"
            onFilesSelected={(files) => {
              if (files[0]) handleFile(files[0]);
            }}
          />
          {isLoading && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-center gap-2 font-semibold">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading PDF document &amp; generating page previews...</span>
            </div>
          )}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      ) : (
        /* Interactive Page Organization Grid */
        <div className="bg-[#0c101d] border border-amber-500/25 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span className="truncate max-w-xs sm:max-w-md">{file.name}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
                  {pages.length} Pages
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Use arrows to move pages, rotate sideways scans, or delete unwanted pages.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={rotateAllPages}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-[#080c16] hover:bg-slate-800 border border-amber-500/25 text-amber-300 transition flex items-center gap-1.5 cursor-pointer"
                title="Rotate all pages clockwise by 90 degrees"
              >
                <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Rotate All</span>
              </button>
              <button
                type="button"
                onClick={resetPages}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-[#080c16] hover:bg-slate-800 border border-amber-500/25 text-slate-300 transition flex items-center gap-1.5 cursor-pointer"
                title="Reset to original order"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPages([]);
                  setProcessedBytes(null);
                }}
                className="px-3 py-1.5 text-xs font-bold rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition cursor-pointer"
              >
                Change File
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Pages Grid with Drag & Drop Reordering */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pages.map((item, idx) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => setDraggedIdx(idx)}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (draggedIdx !== null && draggedIdx !== idx) {
                    setDragOverIdx(idx);
                  }
                }}
                onDragLeave={() => setDragOverIdx((prev) => (prev === idx ? null : prev))}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedIdx !== null && draggedIdx !== idx) {
                    movePage(draggedIdx, idx);
                  }
                  setDraggedIdx(null);
                  setDragOverIdx(null);
                }}
                onDragEnd={() => {
                  setDraggedIdx(null);
                  setDragOverIdx(null);
                }}
                className={`rounded-xl transition-all cursor-grab active:cursor-grabbing ${
                  draggedIdx === idx ? 'opacity-40 scale-95' : ''
                } ${dragOverIdx === idx ? 'ring-2 ring-[#F3B542] ring-offset-2 ring-offset-[#0c101d]' : ''}`}
              >
                <PdfPageThumbnailCard
                  pageNumber={idx + 1}
                  thumbnailUrl={item.thumbnailUrl}
                  status={item.status}
                  isSelected={true}
                  rotation={item.rotation}
                  width={item.width}
                  height={item.height}
                  canMoveLeft={idx > 0}
                  canMoveRight={idx < pages.length - 1}
                  onMoveLeft={() => movePage(idx, idx - 1)}
                  onMoveRight={() => movePage(idx, idx + 1)}
                  onRotate={() => rotatePage(idx)}
                  onRemove={() => deletePage(idx)}
                  onRetry={() => {
                    if (engineRef.current) {
                      setPages((prev) =>
                        prev.map((p) => (p.id === item.id ? { ...p, status: 'rendering' } : p))
                      );
                      engineRef.current
                        .renderPageThumbnail(item.originalIndex + 1, undefined, 0.45)
                        .then((thumb) =>
                          setPages((prev) =>
                            prev.map((p) =>
                              p.id === item.id ? { ...p, thumbnailUrl: thumb, status: 'ready' } : p
                            )
                          )
                        )
                        .catch(() =>
                          setPages((prev) =>
                            prev.map((p) => (p.id === item.id ? { ...p, status: 'error' } : p))
                          )
                        );
                    }
                  }}
                />
              </div>
            ))}
          </div>

          {/* Bottom Execution Bar */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs text-slate-400">
              Total {pages.length} pages will be compiled in this exact arrangement.
            </span>

            <div className="flex items-center gap-3">
              {!processedBytes ? (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleGeneratePdf}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/25 transition flex items-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Layers className="w-4 h-4 stroke-[2.5]" />
                      <span>Save & Reorganize PDF</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/25 transition flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Download Reorganized PDF</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Per-tool Guide, Specs & Limitations */}
      <ToolGuideSection
        toolId="organize-pdf"
        toolName="Organize PDF"
        onNavigate={onNavigate}
        hideFaq
      />

      {/* FAQs */}
      <FaqSection faqs={faqs} />

      {/* Related Tools */}
      <RelatedToolsSection
        currentToolSlug="organize-pdf"
        category="pdf"
        onNavigate={onNavigate}
      />
    </div>
  );
};
