import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileImage,
  Download,
  CheckSquare,
  Square,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Settings,
  Archive,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import JSZip from 'jszip';
import { ToolHeader } from './ToolHeader';
import { RelatedToolsSection } from './RelatedToolsSection';
import { FaqSection } from '../FaqSection';
import {
  PdfThumbnailEngine,
  getPdfDocumentSummary,
  PageInfo,
} from '../../services/pdfThumbnailRenderer';
import { PdfPageThumbnailCard } from '../pdf/PdfPageThumbnailCard';
import { TOOLS_DATA, ToolItem } from '../../data/toolsData';

interface ConvertedImage {
  pageNumber: number;
  dataUrl: string;
  blob: Blob;
  format: 'png' | 'jpeg';
}

interface PdfToImageToolProps {
  onNavigate: (path: string) => void;
}

export const PdfToImageTool: React.FC<PdfToImageToolProps> = ({ onNavigate }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState<{ current: number; total: number } | null>(null);

  // Conversion settings
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [resolution, setResolution] = useState<'standard' | 'high' | 'ultra'>('high'); // standard=1.5, high=2.5, ultra=3.5
  const [quality, setQuality] = useState<number>(0.92);

  const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const engineRef = useRef<PdfThumbnailEngine | null>(null);

  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, []);

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.pdf') && selectedFile.type !== 'application/pdf') {
      setErrorMessage('Please select a valid PDF file.');
      return;
    }

    try {
      setIsLoadingDoc(true);
      setErrorMessage(null);
      setSuccessInfo(null);
      setConvertedImages([]);
      setThumbnails({});
      setFile(selectedFile);

      // Clean up previous engine
      if (engineRef.current) {
        engineRef.current.destroy();
      }

      // Initialize PDF Thumbnail Engine with buffer
      const buffer = await selectedFile.arrayBuffer();
      const engine = new PdfThumbnailEngine();
      await engine.loadDocument(buffer);
      engineRef.current = engine;

      // Extract metadata & page counts
      const summary = await getPdfDocumentSummary(buffer);
      setPages(summary.pages);

      // Default: select all pages
      const allNums = summary.pages.map((p) => p.pageNumber);
      setSelectedPages(allNums);

      // Progressively render visual thumbnails for all pages
      loadThumbnails(engine, summary.pages);
    } catch (err: any) {
      console.error('PDF inspection error:', err);
      setErrorMessage(err.message || 'Failed to inspect PDF. Ensure the file is valid and unencrypted.');
      setFile(null);
    } finally {
      setIsLoadingDoc(false);
    }
  };

  const loadThumbnails = async (engine: PdfThumbnailEngine, pageList: PageInfo[]) => {
    for (const p of pageList) {
      try {
        const thumb = await engine.renderPageThumbnail(p.pageNumber, p, 0.45);
        setThumbnails((prev) => ({ ...prev, [p.pageNumber]: thumb }));
      } catch (err) {
        console.warn(`Thumbnail load error on page ${p.pageNumber}:`, err);
      }
    }
  };

  const togglePageSelect = (pageNumber: number) => {
    setSelectedPages((prev) =>
      prev.includes(pageNumber) ? prev.filter((n) => n !== pageNumber) : [...prev, pageNumber].sort((a, b) => a - b)
    );
    setConvertedImages([]);
    setSuccessInfo(null);
  };

  const selectAll = () => {
    setSelectedPages(pages.map((p) => p.pageNumber));
    setConvertedImages([]);
  };

  const deselectAll = () => {
    setSelectedPages([]);
    setConvertedImages([]);
  };

  const handleConvert = async () => {
    if (!file || !engineRef.current) return;
    if (selectedPages.length === 0) {
      setErrorMessage('Please select at least one page to convert.');
      return;
    }

    try {
      setIsConverting(true);
      setErrorMessage(null);
      setSuccessInfo(null);
      setConvertedImages([]);

      const scaleMap = {
        standard: 1.5,
        high: 2.5,
        ultra: 3.5,
      };
      const scale = scaleMap[resolution];

      const results: ConvertedImage[] = [];
      const total = selectedPages.length;

      for (let i = 0; i < total; i++) {
        const pNum = selectedPages[i];
        setConversionProgress({ current: i + 1, total });

        const { blob, dataUrl } = await engineRef.current.renderPageToBlob(
          pNum,
          format,
          quality,
          scale
        );

        results.push({
          pageNumber: pNum,
          dataUrl,
          blob,
          format,
        });
      }

      setConvertedImages(results);
      setSuccessInfo(
        `Successfully rendered ${results.length} page${results.length > 1 ? 's' : ''} to ${format.toUpperCase()}.`
      );
    } catch (err: any) {
      console.error('Conversion error:', err);
      setErrorMessage(err.message || 'Failed to convert PDF pages to image. Please try again.');
    } finally {
      setIsConverting(false);
      setConversionProgress(null);
    }
  };

  const downloadSingleImage = (img: ConvertedImage) => {
    const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'document';
    const ext = img.format === 'jpeg' ? 'jpg' : 'png';
    const filename = `${baseName}-page-${img.pageNumber}.${ext}`;

    const link = document.createElement('a');
    link.href = img.dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllAsZip = async () => {
    if (convertedImages.length === 0 || !file) return;

    try {
      const zip = new JSZip();
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const ext = format === 'jpeg' ? 'jpg' : 'png';

      convertedImages.forEach((img) => {
        zip.file(`${baseName}-page-${img.pageNumber}.${ext}`, img.blob);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `${baseName}-images.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(link.href), 10000);
    } catch (err: any) {
      setErrorMessage('Failed to create ZIP package.');
    }
  };

  const toolData: ToolItem = TOOLS_DATA.find((t) => t.id === 'pdf-to-images') || {
    id: 'pdf-to-images',
    name: 'PDF to Image Converter',
    slug: 'pdf-to-images',
    category: 'pdf',
    categoryLabel: 'Convert from PDF',
    shortDesc: 'Convert PDF document pages into high-resolution JPG or PNG images with ZIP export.',
    longDesc: 'Turn PDF pages into crisp images. Select specific pages, choose resolution up to 300+ DPI, and download individual files or a consolidated ZIP.',
    iconName: 'FileImage',
    keywords: ['pdf to image', 'pdf to jpg', 'pdf to png', 'extract images'],
  };

  return (
    <div className="min-h-screen bg-[#101114] text-[#F5F5F5] py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <ToolHeader tool={toolData} onNavigate={onNavigate} />

        {/* Upload State */}
        {!file ? (
          <div className="mt-8 bg-[#1B1D22] border-2 border-dashed border-slate-700 hover:border-[#D4AF37] rounded-2xl p-10 sm:p-14 text-center transition-all shadow-xl">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
              className="hidden"
            />
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#101114] border border-slate-700 flex items-center justify-center text-[#D4AF37] shadow-md">
                <FileImage className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#F5F5F5]">Select a PDF to Convert to Images</h2>
                <p className="text-sm text-[#B5B8BE] mt-1">
                  Extract individual pages as crisp PNG or JPG graphics.
                </p>
              </div>
              <button
                type="button"
                disabled={isLoadingDoc}
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-[#D4AF37] hover:bg-[#E6C768] text-[#101114] font-bold rounded-xl transition shadow-lg cursor-pointer flex items-center gap-2 mx-auto disabled:opacity-40"
              >
                {isLoadingDoc ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-[#101114]" />
                    <span>Analyzing PDF...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-5 h-5" />
                    <span>Choose PDF Document</span>
                  </>
                )}
              </button>
              <p className="text-xs text-[#B5B8BE]/80">
                100% Client-Side • Private & Fast • Zero Server Uploads
              </p>
            </div>
          </div>
        ) : (
          /* Active Document Workspace */
          <div className="mt-8 space-y-6">
            {/* Top Toolbar */}
            <div className="bg-[#1B1D22] border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-lg">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#F5F5F5] truncate max-w-xs sm:max-w-md">
                    {file.name}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#101114] text-[#D4AF37] border border-slate-800">
                    {pages.length} Pages
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-[#B5B8BE]">
                  <span>{selectedPages.length} of {pages.length} selected</span>
                  <span className="text-slate-600">|</span>
                  <button
                    type="button"
                    onClick={selectAll}
                    className="font-semibold text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="font-semibold text-[#B5B8BE] hover:text-[#F5F5F5] flex items-center gap-1 cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5" />
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (engineRef.current) engineRef.current.destroy();
                    engineRef.current = null;
                    setFile(null);
                    setPages([]);
                    setThumbnails({});
                    setConvertedImages([]);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition cursor-pointer"
                >
                  Change File
                </button>
              </div>
            </div>

            {/* Page Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {pages.map((p) => (
                <PdfPageThumbnailCard
                  key={`page-${p.pageNumber}`}
                  pageNumber={p.pageNumber}
                  thumbnailUrl={thumbnails[p.pageNumber]}
                  status={thumbnails[p.pageNumber] ? 'ready' : 'rendering'}
                  isSelected={selectedPages.includes(p.pageNumber)}
                  width={p.width}
                  height={p.height}
                  orientation={p.orientation}
                  onToggleSelect={() => togglePageSelect(p.pageNumber)}
                  onRetry={() => {
                    if (engineRef.current) {
                      engineRef.current
                        .renderPageThumbnail(p.pageNumber, p, 0.45)
                        .then((thumb) =>
                          setThumbnails((prev) => ({ ...prev, [p.pageNumber]: thumb }))
                        );
                    }
                  }}
                />
              ))}
            </div>

            {/* Output Configuration Options */}
            <div className="bg-[#1B1D22] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Settings className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-sm font-bold text-[#F5F5F5]">Image Export Settings</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Format */}
                <div>
                  <label className="block text-xs font-semibold text-[#B5B8BE] mb-1.5">
                    Image Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as any)}
                    className="w-full bg-[#101114] border border-slate-700 rounded-lg px-3 py-2 text-xs text-[#F5F5F5] focus:border-[#D4AF37] focus:outline-hidden"
                  >
                    <option value="png">PNG (Lossless & Sharp Text)</option>
                    <option value="jpeg">JPG (Compact File Size)</option>
                  </select>
                </div>

                {/* Resolution */}
                <div>
                  <label className="block text-xs font-semibold text-[#B5B8BE] mb-1.5">
                    Output Resolution
                  </label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value as any)}
                    className="w-full bg-[#101114] border border-slate-700 rounded-lg px-3 py-2 text-xs text-[#F5F5F5] focus:border-[#D4AF37] focus:outline-hidden"
                  >
                    <option value="standard">Standard (150 DPI)</option>
                    <option value="high">High Definition (250 DPI)</option>
                    <option value="ultra">Ultra Crisp Print (350 DPI)</option>
                  </select>
                </div>

                {/* Quality */}
                <div>
                  <label className="block text-xs font-semibold text-[#B5B8BE] mb-1.5">
                    Encoding Quality ({Math.round(quality * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0.7"
                    max="1.0"
                    step="0.05"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    disabled={format === 'png'}
                    className="w-full accent-[#D4AF37] disabled:opacity-30"
                  />
                </div>
              </div>
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
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successInfo}</span>
                </div>
                {convertedImages.length > 0 && (
                  <button
                    type="button"
                    onClick={downloadAllAsZip}
                    className="px-4 py-2 bg-[#D4AF37] hover:bg-[#E6C768] text-[#101114] font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    Download All as ZIP
                  </button>
                )}
              </div>
            )}

            {/* Converted Previews & Download Strip */}
            {convertedImages.length > 0 && (
              <div className="bg-[#1B1D22] border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#F5F5F5]">
                    Converted Images ({convertedImages.length})
                  </h4>
                  <button
                    type="button"
                    onClick={downloadAllAsZip}
                    className="px-3.5 py-1.5 bg-[#D4AF37] hover:bg-[#E6C768] text-[#101114] font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    Download All as ZIP
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {convertedImages.map((img) => (
                    <div
                      key={`converted-${img.pageNumber}`}
                      className="bg-[#101114] border border-slate-800 rounded-xl p-2 flex flex-col items-center justify-between gap-2"
                    >
                      <div className="w-full h-32 flex items-center justify-center p-1 overflow-hidden bg-white rounded">
                        <img
                          src={img.dataUrl}
                          alt={`Page ${img.pageNumber}`}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="w-full flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                        <span className="font-mono text-[#D4AF37] font-bold">
                          Page {img.pageNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => downloadSingleImage(img)}
                          className="px-2 py-1 bg-[#1B1D22] hover:bg-[#D4AF37] hover:text-[#101114] text-[#F5F5F5] rounded text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conversion Trigger Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <div className="text-xs text-[#B5B8BE]">
                {selectedPages.length === 0 ? (
                  <span className="text-rose-400">Please select at least 1 page.</span>
                ) : (
                  <span>Ready to render {selectedPages.length} selected pages at {resolution} resolution.</span>
                )}
              </div>

              <button
                type="button"
                disabled={selectedPages.length === 0 || isConverting}
                onClick={handleConvert}
                className="px-6 py-3 bg-[#D4AF37] hover:bg-[#E6C768] disabled:opacity-30 disabled:pointer-events-none text-[#101114] font-bold text-sm rounded-xl transition shadow-lg flex items-center gap-2 cursor-pointer"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#101114]" />
                    <span>
                      {conversionProgress
                        ? `Converting Page ${conversionProgress.current} of ${conversionProgress.total}...`
                        : 'Rendering Pages...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Convert {selectedPages.length} Pages to {format.toUpperCase()}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Informational SEO and FAQ Sections */}
        <div className="mt-16 space-y-12">
          <div className="bg-[#1B1D22] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-[#F5F5F5]">
              How to Convert PDF to PNG or JPG Images
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-bold text-[#D4AF37]">01. UPLOAD PDF</div>
                <h4 className="text-sm font-semibold text-[#F5F5F5]">Load Document</h4>
                <p className="text-xs text-[#B5B8BE]">
                  Choose any standard PDF document. ToolCrest inspects pages in real time.
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-bold text-[#D4AF37]">02. SELECT PAGES</div>
                <h4 className="text-sm font-semibold text-[#F5F5F5]">Visual Grid</h4>
                <p className="text-xs text-[#B5B8BE]">
                  Click to select only the pages you need. Choose output format and DPI settings.
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-bold text-[#D4AF37]">03. DOWNLOAD</div>
                <h4 className="text-sm font-semibold text-[#F5F5F5]">Single or ZIP</h4>
                <p className="text-xs text-[#B5B8BE]">
                  Download single image pages directly or bundle all selected pages into a ZIP file.
                </p>
              </div>
            </div>
          </div>

          <FaqSection
            faqs={[
              {
                q: 'What is the difference between PNG and JPG output?',
                a: 'PNG is lossless and provides maximum clarity for text documents and diagrams. JPG is compressed and is ideal for photos or smaller file sizes.',
              },
              {
                q: 'Can I download all pages in a single ZIP file?',
                a: 'Yes. After conversion finishes, click "Download All as ZIP" to get every selected page neatly packaged in a zip archive.',
              },
              {
                q: 'Does ToolCrest store my PDF file?',
                a: 'Never. The conversion runs entirely in your local browser sandbox without uploading your pages to any external servers.',
              },
            ]}
          />

          <RelatedToolsSection
            currentToolSlug="pdf-to-images"
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </div>
  );
};
