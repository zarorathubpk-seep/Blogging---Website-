import React, { useState, useRef, useEffect } from 'react';
import {
  GripVertical,
  Trash2,
  Download,
  Plus,
  MoveUp,
  MoveDown,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
} from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';
import { ToolHeader } from './ToolHeader';
import { FileUploadZone } from './FileUploadZone';
import { RelatedToolsSection } from './RelatedToolsSection';
import { ToolGuideSection } from './ToolGuideSection';
import { FaqSection } from '../FaqSection';
import { downloadBytesAsFile } from '../../services/pdfEngine';
import {
  PdfThumbnailEngine,
  getPdfDocumentSummary,
  PageInfo,
} from '../../services/pdfThumbnailRenderer';
import { PdfPageThumbnailCard } from '../pdf/PdfPageThumbnailCard';
import { TOOLS_DATA, ToolItem } from '../../data/toolsData';

interface MergePageItem {
  id: string;
  originalPageNumber: number; // 1-based
  rotation: number;
  isExcluded: boolean;
  thumbnailUrl?: string;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
}

interface MergeDocItem {
  id: string;
  file: File;
  pageCount: number;
  fileSize: number;
  isExpanded: boolean;
  pages: MergePageItem[];
  engine: PdfThumbnailEngine;
}

interface MergePdfToolProps {
  onNavigate: (path: string) => void;
}

export const MergePdfTool: React.FC<MergePdfToolProps> = ({ onNavigate }) => {
  const [docs, setDocs] = useState<MergeDocItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [processedBytes, setProcessedBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  const [draggedDocIdx, setDraggedDocIdx] = useState<number | null>(null);
  const [dragOverDocIdx, setDragOverDocIdx] = useState<number | null>(null);

  const addMoreInputRef = useRef<HTMLInputElement | null>(null);
  const docsRef = useRef<MergeDocItem[]>([]);

  useEffect(() => {
    docsRef.current = docs;
  }, [docs]);

  // Clean up engines on unmount
  useEffect(() => {
    return () => {
      docsRef.current.forEach((d) => d.engine.destroy());
    };
  }, []);

  const handleAddFiles = async (fileList: FileList | File[]) => {
    setIsLoadingFiles(true);
    setErrorMessage(null);
    setProcessedBytes(null);
    setSuccessInfo(null);

    const validFiles: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      if (f.name.toLowerCase().endsWith('.pdf') || f.type === 'application/pdf') {
        validFiles.push(f);
      }
    }

    if (validFiles.length === 0) {
      setErrorMessage('Please select valid PDF documents.');
      setIsLoadingFiles(false);
      return;
    }

    try {
      const newDocs: MergeDocItem[] = [];

      for (const file of validFiles) {
        const buffer = await file.arrayBuffer();
        const summary = await getPdfDocumentSummary(buffer);

        const engine = new PdfThumbnailEngine();
        await engine.loadDocument(buffer);

        const pageItems: MergePageItem[] = summary.pages.map((p) => ({
          id: `page-${file.name}-${p.pageNumber}-${Math.random().toString(36).slice(2, 6)}`,
          originalPageNumber: p.pageNumber,
          rotation: 0,
          isExcluded: false,
          width: p.width,
          height: p.height,
          orientation: p.orientation,
        }));

        const docItem: MergeDocItem = {
          id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          file,
          pageCount: summary.pageCount,
          fileSize: file.size,
          isExpanded: true,
          pages: pageItems,
          engine,
        };

        newDocs.push(docItem);

        // Load thumbnails asynchronously
        loadDocThumbnails(docItem);
      }

      setDocs((prev) => [...prev, ...newDocs]);
    } catch (err: any) {
      console.error('Error loading documents for merge:', err);
      setErrorMessage(err.message || 'Failed to inspect one or more documents.');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const loadDocThumbnails = async (docItem: MergeDocItem) => {
    for (const page of docItem.pages) {
      try {
        const thumb = await docItem.engine.renderPageThumbnail(page.originalPageNumber, undefined, 0.45);
        setDocs((prev) =>
          prev.map((d) =>
            d.id === docItem.id
              ? {
                  ...d,
                  pages: d.pages.map((p) =>
                    p.id === page.id ? { ...p, thumbnailUrl: thumb } : p
                  ),
                }
              : d
          )
        );
      } catch (e) {
        console.warn('Thumbnail load error in merge:', e);
      }
    }
  };

  const reorderDoc = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= docs.length || toIndex >= docs.length) {
      return;
    }
    const copy = [...docs];
    const [moved] = copy.splice(fromIndex, 1);
    copy.splice(toIndex, 0, moved);
    setDocs(copy);
    setProcessedBytes(null);
  };

  const moveDoc = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= docs.length) return;
    reorderDoc(index, targetIndex);
  };

  const removeDoc = (docId: string) => {
    setDocs((prev) => {
      const target = prev.find((d) => d.id === docId);
      if (target) target.engine.destroy();
      return prev.filter((d) => d.id !== docId);
    });
    setProcessedBytes(null);
  };

  const toggleDocExpand = (docId: string) => {
    setDocs((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, isExpanded: !d.isExpanded } : d))
    );
  };

  const toggleExcludePage = (docId: string, pageId: string) => {
    setDocs((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              pages: d.pages.map((p) =>
                p.id === pageId ? { ...p, isExcluded: !p.isExcluded } : p
              ),
            }
          : d
      )
    );
    setProcessedBytes(null);
  };

  const rotatePage = (docId: string, pageId: string) => {
    setDocs((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              pages: d.pages.map((p) =>
                p.id === pageId ? { ...p, rotation: (p.rotation + 90) % 360 } : p
              ),
            }
          : d
      )
    );
    setProcessedBytes(null);
  };

  const movePage = (docId: string, pageIdx: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? pageIdx - 1 : pageIdx + 1;
    setDocs((prev) =>
      prev.map((d) => {
        if (d.id !== docId) return d;
        if (targetIdx < 0 || targetIdx >= d.pages.length) return d;
        const copyPages = [...d.pages];
        const [moved] = copyPages.splice(pageIdx, 1);
        copyPages.splice(targetIdx, 0, moved);
        return { ...d, pages: copyPages };
      })
    );
    setProcessedBytes(null);
  };

  const totalIncludedPages = docs.reduce(
    (acc, d) => acc + d.pages.filter((p) => !p.isExcluded).length,
    0
  );

  const handleMerge = async () => {
    if (docs.length < 1) {
      setErrorMessage('Please upload at least one PDF document to merge.');
      return;
    }

    if (totalIncludedPages === 0) {
      setErrorMessage('All pages are excluded. Please include at least one page.');
      return;
    }

    try {
      setIsMerging(true);
      setErrorMessage(null);
      setProcessedBytes(null);

      const mergedPdf = await PDFDocument.create();

      for (const docItem of docs) {
        const activePages = docItem.pages.filter((p) => !p.isExcluded);
        if (activePages.length === 0) continue;

        const buffer = await docItem.file.arrayBuffer();
        const srcPdf = await PDFDocument.load(buffer, { ignoreEncryption: true });

        // Map to 0-based indices
        const pageIndices = activePages.map((p) => p.originalPageNumber - 1);
        const copiedPages = await mergedPdf.copyPages(srcPdf, pageIndices);

        copiedPages.forEach((page, idx) => {
          const rotationOffset = activePages[idx].rotation;
          if (rotationOffset > 0) {
            const current = page.getRotation().angle;
            page.setRotation(degrees((current + rotationOffset) % 360));
          }
          mergedPdf.addPage(page);
        });
      }

      const bytes = await mergedPdf.save();
      setProcessedBytes(bytes);
      setSuccessInfo(
        `Successfully merged ${docs.length} document${docs.length > 1 ? 's' : ''} into a ${totalIncludedPages}-page PDF (${(
          bytes.byteLength / 1024 / 1024
        ).toFixed(2)} MB).`
      );
    } catch (err: any) {
      console.error('Merge error:', err);
      setErrorMessage(err.message || 'Failed to merge documents. Please try again.');
    } finally {
      setIsMerging(false);
    }
  };

  const handleDownload = () => {
    if (!processedBytes) return;
    const baseName = docs[0]?.file.name.replace(/\.[^/.]+$/, '') || 'merged_document';
    downloadBytesAsFile(processedBytes, `${baseName}-merged.pdf`, 'application/pdf');
  };

  const toolData: ToolItem = TOOLS_DATA.find((t) => t.id === 'merge-pdf') || {
    id: 'merge-pdf',
    name: 'Merge PDF',
    slug: 'merge-pdf',
    category: 'pdf',
    categoryLabel: 'Organize PDF',
    shortDesc: 'Combine multiple PDF files into a single unified document with visual page controls.',
    longDesc: 'Combine two or more PDF documents into one cleanly formatted file. Reorder pages and files seamlessly in your browser with zero data uploaded to servers.',
    iconName: 'Layers',
    keywords: ['merge pdf', 'combine pdf', 'join pdf', 'combine pages'],
  };

  return (
    <div className="min-h-screen bg-[#101114] text-[#F5F5F5] py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <ToolHeader tool={toolData} onNavigate={onNavigate} />

        {/* Upload Zone */}
        {docs.length === 0 ? (
          <div className="mt-8 space-y-4">
            <FileUploadZone
              onFilesSelected={handleAddFiles}
              accept=".pdf,application/pdf"
              multiple={true}
              maxFiles={40}
              maxSizeMB={100}
              disabled={isLoadingFiles}
              title={isLoadingFiles ? 'Inspecting PDF documents...' : 'Drag & drop multiple PDFs to merge, or browse files'}
              subtitle="Rearrange document sequence, exclude unwanted pages, rotate, and compile 100% locally."
              fileTypeLabel="PDF"
            />
            {isLoadingFiles && (
              <div className="flex items-center justify-center gap-2 text-xs text-amber-300 font-semibold">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Inspecting PDF pages and generating thumbnails...</span>
              </div>
            )}
          </div>
        ) : (
          /* Active Document Stack */
          <div className="mt-8 space-y-6">
            <FileUploadZone
              compact={true}
              onFilesSelected={handleAddFiles}
              accept=".pdf,application/pdf"
              multiple={true}
              maxFiles={40}
              maxSizeMB={100}
              title="Drag & drop more PDFs here to append, or click to browse"
              fileTypeLabel="PDF"
            />

            {/* Top Toolbar */}
            <div className="bg-[#1B1D22] border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[#F5F5F5]">
                  {docs.length} Document{docs.length > 1 ? 's' : ''} ({totalIncludedPages} total pages)
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-xs text-[#B5B8BE]">
                  Drag cards or use arrows to adjust sequence. Expand documents to manage individual pages.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={addMoreInputRef}
                  type="file"
                  multiple
                  accept=".pdf,application/pdf"
                  onChange={(e) => {
                    if (e.target.files) handleAddFiles(e.target.files);
                    e.target.value = '';
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => addMoreInputRef.current?.click()}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#101114] border border-slate-700 hover:border-[#D4AF37] text-[#F5F5F5] transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#D4AF37]" />
                  Add More PDFs
                </button>
                <button
                  type="button"
                  onClick={() => {
                    docs.forEach((d) => d.engine.destroy());
                    setDocs([]);
                    setProcessedBytes(null);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Document Cards List */}
            <div className="space-y-4">
              {docs.map((doc, docIdx) => (
                <div
                  key={doc.id}
                  draggable
                  onDragStart={() => setDraggedDocIdx(docIdx)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (draggedDocIdx !== null && draggedDocIdx !== docIdx) {
                      setDragOverDocIdx(docIdx);
                    }
                  }}
                  onDragLeave={() => setDragOverDocIdx(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedDocIdx !== null) reorderDoc(draggedDocIdx, docIdx);
                    setDraggedDocIdx(null);
                    setDragOverDocIdx(null);
                  }}
                  onDragEnd={() => {
                    setDraggedDocIdx(null);
                    setDragOverDocIdx(null);
                  }}
                  className={`bg-[#1B1D22] border rounded-2xl overflow-hidden shadow-lg transition-all ${
                    dragOverDocIdx === docIdx
                      ? 'border-amber-400 ring-2 ring-amber-400/60'
                      : draggedDocIdx === docIdx
                      ? 'opacity-50 border-amber-500/40'
                      : 'border-slate-800'
                  }`}
                >
                  {/* Document Header Bar */}
                  <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 bg-[#16181D] border-b border-slate-800/80 cursor-grab active:cursor-grabbing">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="w-7 h-7 rounded-lg bg-[#101114] border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-[#D4AF37]">
                        #{docIdx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#D4AF37]" />
                          <h3 className="font-bold text-sm sm:text-base text-[#F5F5F5] truncate max-w-xs sm:max-w-md">
                            {doc.file.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[#B5B8BE] mt-0.5">
                          <span>{doc.pageCount} Pages</span>
                          <span>·</span>
                          <span>{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                          <span>·</span>
                          <span className="text-[#D4AF37]">
                            {doc.pages.filter((p) => !p.isExcluded).length} Included
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={docIdx === 0}
                        onClick={() => moveDoc(docIdx, 'up')}
                        className="p-1.5 rounded-lg text-[#B5B8BE] hover:text-[#F5F5F5] hover:bg-[#101114] disabled:opacity-20 cursor-pointer"
                        title="Move document up"
                      >
                        <MoveUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={docIdx === docs.length - 1}
                        onClick={() => moveDoc(docIdx, 'down')}
                        className="p-1.5 rounded-lg text-[#B5B8BE] hover:text-[#F5F5F5] hover:bg-[#101114] disabled:opacity-20 cursor-pointer"
                        title="Move document down"
                      >
                        <MoveDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleDocExpand(doc.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#101114] text-xs font-semibold text-[#B5B8BE] hover:text-[#F5F5F5] border border-slate-700 flex items-center gap-1 cursor-pointer"
                      >
                        {doc.isExpanded ? (
                          <>
                            <span>Hide Pages</span>
                            <ChevronUp className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            <span>Show Pages</span>
                            <ChevronDown className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeDoc(doc.id)}
                        className="p-1.5 rounded-lg text-[#B5B8BE] hover:text-rose-400 hover:bg-rose-950/20 cursor-pointer"
                        title="Remove document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Page Thumbnails Grid */}
                  {doc.isExpanded && (
                    <div className="p-4 sm:p-5 bg-[#121317]">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {doc.pages.map((p, pIdx) => (
                          <PdfPageThumbnailCard
                            key={p.id}
                            pageNumber={p.originalPageNumber}
                            thumbnailUrl={p.thumbnailUrl}
                            status={p.thumbnailUrl ? 'ready' : 'rendering'}
                            isSelected={!p.isExcluded}
                            isExcluded={p.isExcluded}
                            rotation={p.rotation}
                            width={p.width}
                            height={p.height}
                            orientation={p.orientation}
                            compact={true}
                            canMoveLeft={pIdx > 0}
                            canMoveRight={pIdx < doc.pages.length - 1}
                            onMoveLeft={() => movePage(doc.id, pIdx, 'left')}
                            onMoveRight={() => movePage(doc.id, pIdx, 'right')}
                            onToggleExclude={() => toggleExcludePage(doc.id, p.id)}
                            onRotate={() => rotatePage(doc.id, p.id)}
                            onRetry={() => {
                              doc.engine
                                .renderPageThumbnail(p.originalPageNumber, undefined, 0.45)
                                .then((thumb) =>
                                  setDocs((prev) =>
                                    prev.map((d) =>
                                      d.id === doc.id
                                        ? {
                                            ...d,
                                            pages: d.pages.map((item) =>
                                              item.id === p.id ? { ...item, thumbnailUrl: thumb } : item
                                            ),
                                          }
                                        : d
                                    )
                                  )
                                );
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Notification */}
            {successInfo && (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successInfo}</span>
                </div>
                {processedBytes && (
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-4 py-2 bg-[#D4AF37] hover:bg-[#E6C768] text-[#101114] font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Merged PDF
                  </button>
                )}
              </div>
            )}

            {/* Merge Action Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <div className="text-xs text-[#B5B8BE]">
                {totalIncludedPages === 0 ? (
                  <span className="text-rose-400">All pages are excluded. Please include at least 1 page.</span>
                ) : (
                  <span>Ready to combine {totalIncludedPages} pages across {docs.length} documents into one PDF.</span>
                )}
              </div>

              <button
                type="button"
                disabled={totalIncludedPages === 0 || isMerging}
                onClick={handleMerge}
                className="px-6 py-3 bg-[#D4AF37] hover:bg-[#E6C768] disabled:opacity-30 disabled:pointer-events-none text-[#101114] font-bold text-sm rounded-xl transition shadow-lg flex items-center gap-2 cursor-pointer"
              >
                {isMerging ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#101114]" />
                    <span>Merging Documents...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Merge {docs.length} PDFs ({totalIncludedPages} Pages)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Informational SEO and FAQ Sections */}
        <div className="mt-16 space-y-12">
          <ToolGuideSection
            toolId="merge-pdf"
            toolName="Merge PDF"
            onNavigate={onNavigate}
            hideSteps
            hideFaq
          />

          <div className="bg-[#1B1D22] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-[#F5F5F5]">
              How to Merge PDF Files Online for Free
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-bold text-[#D4AF37]">01. ADD DOCUMENTS</div>
                <h4 className="text-sm font-semibold text-[#F5F5F5]">Select PDFs</h4>
                <p className="text-xs text-[#B5B8BE]">
                  Choose two or more PDF files from your computer or phone.
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-bold text-[#D4AF37]">02. ARRANGE & PRUNE</div>
                <h4 className="text-sm font-semibold text-[#F5F5F5]">Visual Layout</h4>
                <p className="text-xs text-[#B5B8BE]">
                  Shift file sequence, expand documents to view pages, rotate or exclude unwanted pages.
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-bold text-[#D4AF37]">03. COMBINE & SAVE</div>
                <h4 className="text-sm font-semibold text-[#F5F5F5]">One-Click Download</h4>
                <p className="text-xs text-[#B5B8BE]">
                  Click Merge to compile your PDF locally and download the combined document instantly.
                </p>
              </div>
            </div>
          </div>

          <FaqSection
            faqs={[
              {
                q: 'Can I reorder individual pages within a document before merging?',
                a: 'Yes. Click "Show Pages" on any document to expand its visual page grid. You can move pages left or right, rotate them, or exclude specific pages entirely.',
              },
              {
                q: 'Is there a limit on how many PDFs I can merge?',
                a: 'Because ToolCrest processes documents directly in your browser, you can merge dozens of files without subscription fees or artificial limits.',
              },
              {
                q: 'Will bookmarks or text formatting be preserved?',
                a: 'Yes. ToolCrest preserves fonts, vectors, high-resolution images, and formatting during the merge process.',
              },
            ]}
          />

          <RelatedToolsSection
            currentToolSlug="merge-pdf"
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </div>
  );
};
