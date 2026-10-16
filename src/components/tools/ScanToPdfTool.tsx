import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  UploadCloud,
  FileText,
  Download,
  Trash2,
  RefreshCw,
  Plus,
  Loader2,
  CheckCircle2,
  Sliders,
  MoveLeft,
  MoveRight,
  ShieldCheck,
} from 'lucide-react';
import { ToolHeader } from './ToolHeader';
import { RelatedToolsSection } from './RelatedToolsSection';
import { FaqSection } from '../FaqSection';
import { imagesToPdf, downloadBytesAsFile } from '../../services/pdfEngine';

interface ScanToPdfToolProps {
  onNavigate: (path: string) => void;
}

interface ScannedPage {
  id: string;
  dataUrl: string;
  name: string;
}

export const ScanToPdfTool: React.FC<ScanToPdfToolProps> = ({ onNavigate }) => {
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [filterMode, setFilterMode] = useState<'color' | 'grayscale' | 'contrast'>('color');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [processedBytes, setProcessedBytes] = useState<Uint8Array | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start camera stream
  const startCamera = async () => {
    try {
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      setErrorMessage('Could not access camera. Please allow camera permissions or upload images directly.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Capture frame from video stream
  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d')!;

    // Draw frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Apply document contrast filters if requested
    if (filterMode === 'grayscale' || filterMode === 'contrast') {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        if (filterMode === 'contrast') {
          // Binarize / high contrast document scan
          const val = avg > 128 ? 255 : 0;
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
        } else {
          data[i] = avg;
          data[i + 1] = avg;
          data[i + 2] = avg;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setPages((prev) => [
      ...prev,
      {
        id: `scan-${Date.now()}`,
        dataUrl,
        name: `Scanned Page ${prev.length + 1}`,
      },
    ]);
    setProcessedBytes(null);
  };

  // Upload pictures from device
  const handleUploadImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPages((prev) => [
            ...prev,
            {
              id: `upload-${Date.now()}-${Math.random()}`,
              dataUrl: reader.result as string,
              name: file.name,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
    setProcessedBytes(null);
  };

  const removePage = (idx: number) => {
    setPages((prev) => prev.filter((_, i) => i !== idx));
    setProcessedBytes(null);
  };

  const movePage = (from: number, to: number) => {
    if (to < 0 || to >= pages.length) return;
    const updated = [...pages];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setPages(updated);
    setProcessedBytes(null);
  };

  const handleGeneratePdf = async () => {
    if (pages.length === 0) return;
    try {
      setIsProcessing(true);
      setErrorMessage(null);

      // Convert data URLs to File objects for imagesToPdf service
      const files: File[] = [];
      for (let i = 0; i < pages.length; i++) {
        const res = await fetch(pages[i].dataUrl);
        const blob = await res.blob();
        files.push(new File([blob], `page-${i + 1}.jpg`, { type: 'image/jpeg' }));
      }

      const bytes = await imagesToPdf(files, orientation);
      setProcessedBytes(bytes);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to compile scanned document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedBytes) return;
    downloadBytesAsFile(processedBytes, `Scanned_Document_${Date.now()}.pdf`);
  };

  const faqs = [
    {
      question: 'How does the Scan to PDF camera work?',
      answer:
        'You can snap pictures of documents, receipts, IDs, and book pages using your smartphone camera or computer webcam. The tool can also apply high-contrast B&W document enhancements to make text crystal clear before combining all shots into a single multi-page PDF.',
    },
    {
      question: 'Is my camera video sent to any server?',
      answer:
        'Never. Camera frames are processed entirely inside your local browser canvas. Zero imagery is ever saved or transmitted to any cloud server.',
    },
    {
      question: 'Can I combine camera scans and file uploads in the same document?',
      answer:
        'Yes. You can take live photo snapshots and mix them with existing JPG or PNG pictures on your device, rearrange their sequence, and compile them into one unified PDF.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      <ToolHeader
        title="Scan to PDF"
        subtitle="Capture physical documents using your device camera or upload photos and compile into PDF."
        badge="New"
        badgeColor="rose"
        onBack={() => onNavigate('/')}
      />

      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            {!isCameraActive ? (
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-2 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Open Device Camera</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close Camera
              </button>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-rose-600" />
              <span>Add From Photos</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleUploadImages}
              className="hidden"
            />
          </div>

          {/* Filter options */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Filter:</span>
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
              {(['color', 'grayscale', 'contrast'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setFilterMode(m)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md capitalize transition ${
                    filterMode === m ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {m === 'contrast' ? 'B&W Text' : m}
                </button>
              ))}
            </div>

            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 ml-2">
              {(['portrait', 'landscape'] as const).map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOrientation(o)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md capitalize transition ${
                    orientation === o ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Live Camera Viewport */}
        {isCameraActive && (
          <div className="bg-slate-900 rounded-2xl overflow-hidden p-4 flex flex-col items-center space-y-4">
            <div className="relative max-w-lg w-full aspect-4/3 bg-black rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              {/* Document Alignment Frame */}
              <div className="absolute inset-8 border-2 border-dashed border-rose-400/70 rounded-lg pointer-events-none flex items-center justify-center">
                <span className="text-[11px] text-white/80 bg-black/50 px-2 py-0.5 rounded font-mono">
                  Align Document Inside Box
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={captureSnapshot}
              className="px-6 py-3 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white font-extrabold text-sm rounded-full shadow-lg transition flex items-center gap-2 cursor-pointer transform hover:scale-105"
            >
              <Camera className="w-4 h-4" />
              <span>Capture Page #{pages.length + 1}</span>
            </button>
          </div>
        )}

        {/* Scanned Pages Gallery */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Scanned Pages Queue ({pages.length})
            </h4>
            {pages.length > 0 && (
              <button
                type="button"
                onClick={() => setPages([])}
                className="text-xs text-rose-600 hover:underline"
              >
                Clear All
              </button>
            )}
          </div>

          {pages.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
              <p className="text-xs text-slate-500">
                No pages captured yet. Click &quot;Open Device Camera&quot; or &quot;Add From Photos&quot; to begin.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {pages.map((p, idx) => (
                <div
                  key={p.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col justify-between group shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-1.5 text-[11px] font-bold text-slate-600">
                    <span>Page {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removePage(idx)}
                      className="text-slate-400 hover:text-rose-600 transition"
                      title="Delete page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="w-full aspect-3/4 rounded-lg overflow-hidden border border-slate-200 bg-white mb-2">
                    <img src={p.dataUrl} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/80">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => movePage(idx, idx - 1)}
                      className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                      title="Move left"
                    >
                      <MoveLeft className="w-3 h-3" />
                    </button>
                    <span className="text-[10px] text-slate-400 truncate max-w-[80px]">
                      {p.name}
                    </span>
                    <button
                      type="button"
                      disabled={idx === pages.length - 1}
                      onClick={() => movePage(idx, idx + 1)}
                      className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                      title="Move right"
                    >
                      <MoveRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        {pages.length > 0 && (
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% private in-browser document compilation</span>
            </span>

            <div className="flex items-center gap-3">
              {!processedBytes ? (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleGeneratePdf}
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>Compile {pages.length} Pages into PDF</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer animate-pulse"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Scanned PDF</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <FaqSection faqs={faqs} />

      <RelatedToolsSection
        currentToolSlug="scan-to-pdf"
        category="pdf"
        onNavigate={onNavigate}
      />
    </div>
  );
};
