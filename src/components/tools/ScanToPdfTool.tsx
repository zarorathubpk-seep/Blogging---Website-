import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  UploadCloud,
  FileText,
  Download,
  Trash2,
  Plus,
  Loader2,
  MoveLeft,
  MoveRight,
  ShieldCheck,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { ToolHeader } from './ToolHeader';
import { RelatedToolsSection } from './RelatedToolsSection';
import { FaqSection } from '../FaqSection';
import { downloadBytesAsFile } from '../../services/pdfEngine';
import { getSuggestedDefaultFileName } from '../../utils/fileNaming';
import { TOOLS_DATA } from '../../data/toolsData';

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
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'color' | 'grayscale' | 'contrast'>('color');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [processedBytes, setProcessedBytes] = useState<Uint8Array | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera when unmounting
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      setErrorMessage(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      setStream(mediaStream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      setErrorMessage(
        'Unable to access camera. Please allow camera permissions in your browser or upload photos directly.'
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply filters
    if (filterMode === 'grayscale') {
      ctx.filter = 'grayscale(100%)';
    } else if (filterMode === 'contrast') {
      ctx.filter = 'contrast(180%) grayscale(100%) brightness(110%)';
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    const newPage: ScannedPage = {
      id: `scan-${Date.now()}-${Math.random()}`,
      dataUrl,
      name: `Scan ${pages.length + 1}`,
    };
    setPages((prev) => [...prev, newPage]);
    setProcessedBytes(null);
  };

  const handleUploadImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    files.forEach((f, idx) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const newPage: ScannedPage = {
            id: `upload-${Date.now()}-${idx}-${Math.random()}`,
            dataUrl: ev.target.result as string,
            name: f.name,
          };
          setPages((prev) => [...prev, newPage]);
          setProcessedBytes(null);
        }
      };
      reader.readAsDataURL(f);
    });
  };

  const removePage = (index: number) => {
    setPages((prev) => prev.filter((_, i) => i !== index));
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

      const doc = await PDFDocument.create();

      for (const p of pages) {
        const imgBytes = await fetch(p.dataUrl).then((res) => res.arrayBuffer());
        let embeddedImage;
        try {
          embeddedImage = await doc.embedJpg(imgBytes);
        } catch {
          embeddedImage = await doc.embedPng(imgBytes);
        }

        const imgWidth = embeddedImage.width;
        const imgHeight = embeddedImage.height;

        let pageWidth = 595.28; // A4 standard pt
        let pageHeight = 841.89;

        if (orientation === 'landscape') {
          pageWidth = 841.89;
          pageHeight = 595.28;
        }

        const page = doc.addPage([pageWidth, pageHeight]);

        // Fit image preserving aspect ratio with 30pt margins
        const margin = 30;
        const availW = pageWidth - margin * 2;
        const availH = pageHeight - margin * 2;
        const scale = Math.min(availW / imgWidth, availH / imgHeight);

        const drawW = imgWidth * scale;
        const drawH = imgHeight * scale;
        const drawX = margin + (availW - drawW) / 2;
        const drawY = margin + (availH - drawH) / 2;

        page.drawImage(embeddedImage, {
          x: drawX,
          y: drawY,
          width: drawW,
          height: drawH,
        });
      }

      const bytes = await doc.save();
      setProcessedBytes(bytes);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to compile scanned document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedBytes) return;
    const defaultName = getSuggestedDefaultFileName('scanned_document.pdf', 'scan-to-pdf');
    downloadBytesAsFile(processedBytes, defaultName, 'application/pdf');
  };

  const tool =
    TOOLS_DATA.find((t) => t.slug === 'scan-to-pdf') || {
      id: 'scan-to-pdf',
      name: 'Scan to PDF',
      slug: 'scan-to-pdf',
      category: 'pdf' as const,
      categoryLabel: 'Scan to PDF',
      shortDesc: 'Capture receipts and physical documents with your camera and compile into PDF.',
      longDesc: 'Digitalize paper documents using your mobile or desktop webcam with real-time text contrast enhancement.',
      iconName: 'Camera',
      badge: 'New',
      keywords: ['scan', 'camera', 'photo', 'document'],
    };

  const faqs = [
    {
      q: 'Does ToolCrest store my captured camera photos?',
      a: 'Never. Captured camera frames stay entirely within local browser memory. No photos are ever sent across the network.',
    },
    {
      q: 'What is B&W Text filter mode?',
      a: 'The B&W Text filter enhances document legibility by boosting contrast, whiting out shadows, and darkening printed text for cleaner prints.',
    },
    {
      q: 'Can I combine camera scans and file uploads in the same document?',
      a: 'Yes. You can take live photo snapshots and mix them with existing JPG or PNG pictures on your device, rearrange their sequence, and compile them into one unified PDF.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn text-slate-100">
      <ToolHeader tool={tool} onNavigate={onNavigate} />

      <div className="bg-[#0c101d] border border-amber-500/25 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            {!isCameraActive ? (
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4 stroke-[2.5]" />
                <span>Open Device Camera</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 bg-[#080c16] hover:bg-slate-800 border border-amber-500/30 text-amber-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close Camera
              </button>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 border border-amber-500/30 bg-[#080c16] hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-amber-400" />
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
            <span className="text-xs text-slate-400 font-medium">Filter:</span>
            <div className="flex items-center bg-[#070a14] border border-amber-500/20 rounded-lg p-0.5">
              {(['color', 'grayscale', 'contrast'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setFilterMode(m)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md capitalize transition cursor-pointer ${
                    filterMode === m
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {m === 'contrast' ? 'B&W Text' : m}
                </button>
              ))}
            </div>

            <div className="flex items-center bg-[#070a14] border border-amber-500/20 rounded-lg p-0.5 ml-2">
              {(['portrait', 'landscape'] as const).map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOrientation(o)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md capitalize transition cursor-pointer ${
                    orientation === o
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Live Camera Viewport */}
        {isCameraActive && (
          <div className="bg-[#070a14] rounded-2xl overflow-hidden p-4 flex flex-col items-center space-y-4 border border-amber-500/30">
            <div className="relative max-w-lg w-full aspect-4/3 bg-black rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              {/* Document Alignment Frame */}
              <div className="absolute inset-8 border-2 border-dashed border-amber-400/80 rounded-lg pointer-events-none flex items-center justify-center">
                <span className="text-[11px] text-amber-300 bg-black/70 px-2.5 py-1 rounded font-mono font-bold">
                  Align Document Inside Box
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={captureSnapshot}
              className="px-6 py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-sm rounded-full shadow-lg shadow-amber-500/30 transition flex items-center gap-2 cursor-pointer transform hover:scale-105"
            >
              <Camera className="w-4 h-4 stroke-[2.5]" />
              <span>Capture Page #{pages.length + 1}</span>
            </button>
          </div>
        )}

        {/* Scanned Pages Gallery */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">
              Scanned Pages Queue ({pages.length})
            </h4>
            {pages.length > 0 && (
              <button
                type="button"
                onClick={() => setPages([])}
                className="text-xs text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>

          {pages.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-amber-500/25 rounded-2xl bg-[#070a14]">
              <p className="text-xs text-slate-400">
                No pages captured yet. Click &quot;Open Device Camera&quot; or &quot;Add From Photos&quot; to begin.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {pages.map((p, idx) => (
                <div
                  key={p.id}
                  className="bg-[#070a14] border border-amber-500/25 rounded-xl p-2.5 flex flex-col justify-between group shadow-md"
                >
                  <div className="flex items-center justify-between mb-1.5 text-[11px] font-bold text-amber-300">
                    <span>Page {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removePage(idx)}
                      className="text-slate-400 hover:text-rose-400 transition cursor-pointer"
                      title="Delete page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="w-full aspect-3/4 rounded-lg overflow-hidden border border-slate-700 bg-black mb-2">
                    <img src={p.dataUrl} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => movePage(idx, idx - 1)}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
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
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
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
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>100% private in-browser document compilation</span>
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
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 stroke-[2.5]" />
                      <span>Compile {pages.length} Pages into PDF</span>
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
