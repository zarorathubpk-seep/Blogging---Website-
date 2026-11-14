import React, { useState, useEffect } from 'react';
import {
  Download,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Lock,
  Unlock,
} from 'lucide-react';
import { ToolHeader } from './ToolHeader';
import { FileUploadZone } from './FileUploadZone';
import { RelatedToolsSection } from './RelatedToolsSection';
import { FaqSection } from '../FaqSection';
import { TOOLS_DATA, ToolItem } from '../../data/toolsData';

export type ImageStudioMode = 'compress' | 'resize' | 'convert' | 'rotate';

interface ImageStudioToolProps {
  initialMode?: ImageStudioMode;
  targetFormat?: 'image/jpeg' | 'image/png' | 'image/webp';
  toolSlug?: string;
  onNavigate: (path: string) => void;
}

export const ImageStudioTool: React.FC<ImageStudioToolProps> = ({
  initialMode = 'compress',
  targetFormat = 'image/jpeg',
  toolSlug = 'compress-image',
  onNavigate,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [origDimensions, setOrigDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Mode & configuration
  const [mode, setMode] = useState<ImageStudioMode>(initialMode);
  const [outputFormat, setOutputFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>(targetFormat);
  const [quality, setQuality] = useState<number>(0.82);
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Result state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resultDataUrl, setResultDataUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WebP, BMP).');
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    const url = URL.createObjectURL(selectedFile);
    setResultDataUrl(null);
    setResultBlob(null);
    setErrorMessage(null);
    setSuccessInfo(null);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);

    const img = new Image();
    img.onload = () => {
      setFile(selectedFile);
      setPreviewUrl(url);
      setOrigDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      setTargetWidth(img.naturalWidth);
      setTargetHeight(img.naturalHeight);
      setAspectRatio(img.naturalWidth / Math.max(1, img.naturalHeight));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setFile(null);
      setPreviewUrl(null);
      setErrorMessage(`Could not read "${selectedFile.name}". The file may be corrupted or unsupported.`);
    };
    img.src = url;
  };

  const handleWidthChange = (w: number) => {
    const validW = Math.max(1, Math.min(10000, w || 1));
    setTargetWidth(validW);
    if (lockAspectRatio && aspectRatio > 0) {
      setTargetHeight(Math.round(validW / aspectRatio));
    }
  };

  const handleHeightChange = (h: number) => {
    const validH = Math.max(1, Math.min(10000, h || 1));
    setTargetHeight(validH);
    if (lockAspectRatio && aspectRatio > 0) {
      setTargetWidth(Math.round(validH * aspectRatio));
    }
  };

  const handleProcess = async () => {
    if (!file || !previewUrl) return;

    try {
      setIsProcessing(true);
      setErrorMessage(null);
      setSuccessInfo(null);

      const img = new Image();
      img.src = previewUrl;
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
      });

      const canvas = document.createElement('canvas');
      const w = mode === 'resize' ? targetWidth : origDimensions.width;
      const h = mode === 'resize' ? targetHeight : origDimensions.height;

      const isRotatedQuarter = rotation === 90 || rotation === 270;
      canvas.width = isRotatedQuarter ? h : w;
      canvas.height = isRotatedQuarter ? w : h;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // For JPEG, fill white background to prevent black transparent artifacts
      if (outputFormat === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();

      const blob = await new Promise<Blob>((res, rej) => {
        canvas.toBlob(
          (b) => {
            if (b) res(b);
            else rej(new Error('Canvas image encoding failed'));
          },
          outputFormat,
          outputFormat === 'image/png' ? undefined : quality
        );
      });

      const dataUrl = canvas.toDataURL(
        outputFormat,
        outputFormat === 'image/png' ? undefined : quality
      );

      setResultBlob(blob);
      setResultDataUrl(dataUrl);

      const origKb = (file.size / 1024).toFixed(1);
      const newKb = (blob.size / 1024).toFixed(1);
      const savings = Math.max(0, Math.round(((file.size - blob.size) / file.size) * 100));

      setSuccessInfo(
        `Processed successfully! Original: ${origKb} KB → Result: ${newKb} KB ${
          mode === 'compress' ? `(${savings}% reduction)` : ''
        }`
      );
    } catch (err: any) {
      console.error('Image processing error:', err);
      setErrorMessage(err.message || 'Failed to process image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultDataUrl || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    let ext = 'jpg';
    if (outputFormat === 'image/png') ext = 'png';
    else if (outputFormat === 'image/webp') ext = 'webp';

    const filename = `${baseName}-${mode}.${ext}`;
    const link = document.createElement('a');
    link.href = resultDataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toolData: ToolItem = TOOLS_DATA.find((t) => t.slug === toolSlug) || {
    id: 'image-studio',
    name:
      mode === 'compress'
        ? 'Image Compressor'
        : mode === 'resize'
        ? 'Image Resizer'
        : mode === 'rotate'
        ? 'Image Rotator & Flip'
        : 'Image Format Converter',
    slug: toolSlug,
    category: 'image' as any,
    categoryLabel: 'Image Tools',
    shortDesc: 'Fast, high-fidelity browser-based image compression, resizing, and format conversion.',
    longDesc: 'Optimize and transform images 100% locally in your browser. Reduce file size without quality loss, scale dimensions, and convert between JPG, PNG, and WebP.',
    iconName: 'FileImage',
    keywords: ['image compressor', 'resize image', 'convert image', 'rotate image'],
  };

  return (
    <div className="min-h-screen bg-[#101114] text-[#F5F5F5] py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <ToolHeader tool={toolData} onNavigate={onNavigate} />

        {/* Mode Selector Tabs */}
        <div className="mt-8 flex items-center gap-1.5 p-1 bg-[#1B1D22] border border-slate-800 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => {
              setMode('compress');
              setOutputFormat('image/jpeg');
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'compress'
                ? 'bg-[#D4AF37] text-[#101114]'
                : 'text-[#B5B8BE] hover:text-[#F5F5F5]'
            }`}
          >
            Compress
          </button>
          <button
            type="button"
            onClick={() => setMode('resize')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'resize'
                ? 'bg-[#D4AF37] text-[#101114]'
                : 'text-[#B5B8BE] hover:text-[#F5F5F5]'
            }`}
          >
            Resize
          </button>
          <button
            type="button"
            onClick={() => setMode('convert')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'convert'
                ? 'bg-[#D4AF37] text-[#101114]'
                : 'text-[#B5B8BE] hover:text-[#F5F5F5]'
            }`}
          >
            Convert Format
          </button>
          <button
            type="button"
            onClick={() => setMode('rotate')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'rotate'
                ? 'bg-[#D4AF37] text-[#101114]'
                : 'text-[#B5B8BE] hover:text-[#F5F5F5]'
            }`}
          >
            Rotate & Flip
          </button>
        </div>

        {/* Upload Zone */}
        {!file ? (
          <div className="mt-6 space-y-4">
            <FileUploadZone
              accept="image/jpeg,image/png,image/webp,image/bmp,.jpg,.jpeg,.png,.webp,.bmp"
              multiple={false}
              title="Select or Drag an Image to Optimize"
              subtitle="Supports JPG, PNG, WebP, and BMP • 100% In-Browser Processing"
              fileTypeLabel="JPG, PNG, WebP, BMP"
              onFilesSelected={(files) => {
                if (files[0]) handleFileSelect(files[0]);
              }}
            />
            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        ) : (
          /* Active Editor Canvas */
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Visual Preview */}
              <div className="lg:col-span-7 bg-[#1B1D22] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-[#B5B8BE]">
                  <span className="font-semibold truncate max-w-xs">{file.name}</span>
                  <span className="font-mono text-[#D4AF37]">
                    {origDimensions.width} × {origDimensions.height} px · {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>

                <div className="my-4 min-h-[300px] max-h-[460px] flex items-center justify-center bg-[#101114] rounded-xl p-3 overflow-hidden border border-slate-800">
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Source Preview"
                      className="max-h-full max-w-full object-contain rounded transition-transform duration-200"
                      style={{
                        transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                      }}
                    />
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreviewUrl(null);
                      setResultDataUrl(null);
                    }}
                    className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                  >
                    Change Image
                  </button>
                  <span className="text-[#B5B8BE]">Local Browser Processing</span>
                </div>
              </div>

              {/* Right Column: Controls Panel */}
              <div className="lg:col-span-5 bg-[#1B1D22] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-[#F5F5F5] pb-3 border-b border-slate-800 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#D4AF37]" />
                    <span>Options & Settings</span>
                  </h3>

                  <div className="mt-4 space-y-4">
                    {/* Compression Quality */}
                    {(mode === 'compress' || outputFormat !== 'image/png') && (
                      <div>
                        <div className="flex items-center justify-between text-xs font-semibold text-[#B5B8BE] mb-1.5">
                          <span>Quality Level</span>
                          <span className="font-mono text-[#D4AF37]">{Math.round(quality * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.3"
                          max="0.98"
                          step="0.02"
                          value={quality}
                          onChange={(e) => setQuality(parseFloat(e.target.value))}
                          className="w-full accent-[#D4AF37]"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                          <span>Smaller File</span>
                          <span>Balanced</span>
                          <span>Maximum Clarity</span>
                        </div>
                      </div>
                    )}

                    {/* Resize Dimensions */}
                    {mode === 'resize' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-[#B5B8BE] mb-1">
                              Width (px)
                            </label>
                            <input
                              type="number"
                              value={targetWidth}
                              onChange={(e) => handleWidthChange(parseInt(e.target.value, 10))}
                              className="w-full bg-[#101114] border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-[#F5F5F5] focus:border-[#D4AF37] focus:outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#B5B8BE] mb-1">
                              Height (px)
                            </label>
                            <input
                              type="number"
                              value={targetHeight}
                              onChange={(e) => handleHeightChange(parseInt(e.target.value, 10))}
                              className="w-full bg-[#101114] border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-[#F5F5F5] focus:border-[#D4AF37] focus:outline-hidden"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setLockAspectRatio(!lockAspectRatio)}
                          className="flex items-center gap-1.5 text-xs text-[#B5B8BE] hover:text-[#F5F5F5] cursor-pointer"
                        >
                          {lockAspectRatio ? (
                            <>
                              <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span>Aspect ratio locked ({aspectRatio.toFixed(2)}:1)</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3.5 h-3.5 text-slate-500" />
                              <span>Aspect ratio unlocked</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Output Format */}
                    <div>
                      <label className="block text-xs font-semibold text-[#B5B8BE] mb-1.5">
                        Target Format
                      </label>
                      <select
                        value={outputFormat}
                        onChange={(e) => setOutputFormat(e.target.value as any)}
                        className="w-full bg-[#101114] border border-slate-700 rounded-lg px-3 py-2 text-xs text-[#F5F5F5] focus:border-[#D4AF37] focus:outline-hidden"
                      >
                        <option value="image/jpeg">JPG (Standard web photo)</option>
                        <option value="image/png">PNG (Lossless & transparent)</option>
                        <option value="image/webp">WebP (Modern high-efficiency)</option>
                      </select>
                    </div>

                    {/* Rotation and Flip Controls */}
                    {mode === 'rotate' && (
                      <div className="space-y-2 pt-2">
                        <label className="block text-xs font-semibold text-[#B5B8BE]">
                          Orientation Adjustments
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setRotation((r) => (r + 90) % 360)}
                            className="p-2 rounded-lg bg-[#101114] border border-slate-700 hover:border-[#D4AF37] text-xs font-semibold text-[#F5F5F5] flex flex-col items-center gap-1 cursor-pointer"
                          >
                            <RotateCw className="w-4 h-4 text-[#D4AF37]" />
                            <span>Rotate 90°</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFlipH((f) => !f)}
                            className={`p-2 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer ${
                              flipH
                                ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]'
                                : 'bg-[#101114] border-slate-700 text-[#F5F5F5]'
                            }`}
                          >
                            <FlipHorizontal className="w-4 h-4" />
                            <span>Flip H</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFlipV((f) => !f)}
                            className={`p-2 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer ${
                              flipV
                                ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]'
                                : 'bg-[#101114] border-slate-700 text-[#F5F5F5]'
                            }`}
                          >
                            <FlipVertical className="w-4 h-4" />
                            <span>Flip V</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Trigger */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleProcess}
                    className="w-full py-3 bg-[#D4AF37] hover:bg-[#E6C768] text-[#101114] font-bold text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#101114]" />
                        <span>Processing Image...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Apply & Process</span>
                      </>
                    )}
                  </button>
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

            {/* Success & Download Strip */}
            {successInfo && resultDataUrl && (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex flex-wrap items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successInfo}</span>
                </div>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-4 py-2 bg-[#D4AF37] hover:bg-[#E6C768] text-[#101114] font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Image
                </button>
              </div>
            )}
          </div>
        )}

        {/* Informational SEO and FAQ Sections */}
        <div className="mt-16 space-y-12">
          <div className="bg-[#1B1D22] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-[#F5F5F5]">
              How to Optimize and Transform Images Online
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-bold text-[#D4AF37]">01. UPLOAD IMAGE</div>
                <h4 className="text-sm font-semibold text-[#F5F5F5]">Load File</h4>
                <p className="text-xs text-[#B5B8BE]">
                  Select any JPG, PNG, or WebP file from your computer or smartphone.
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-bold text-[#D4AF37]">02. CUSTOMIZE</div>
                <h4 className="text-sm font-semibold text-[#F5F5F5]">Set Parameters</h4>
                <p className="text-xs text-[#B5B8BE]">
                  Adjust quality slider, input target pixel dimensions, or rotate and flip.
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-bold text-[#D4AF37]">03. SAVE</div>
                <h4 className="text-sm font-semibold text-[#F5F5F5]">Instant Download</h4>
                <p className="text-xs text-[#B5B8BE]">
                  Download your optimized file with zero loss of private metadata.
                </p>
              </div>
            </div>
          </div>

          <FaqSection
            faqs={[
              {
                q: 'How does in-browser image compression work?',
                a: 'ToolCrest uses the HTML5 Canvas API and modern browser image encoders to re-compress images directly in your device RAM without uploading files to external cloud servers.',
              },
              {
                q: 'What is the best format for web images?',
                a: 'WebP provides 25-35% smaller file sizes than traditional JPEG while maintaining comparable visual clarity. PNG is recommended when transparent backgrounds are needed.',
              },
              {
                q: 'Will my image quality degrade?',
                a: 'You have full control over the quality slider. Setting quality to 80-85% typically reduces file size by 50-70% with virtually zero perceptible visual loss.',
              },
            ]}
          />

          <RelatedToolsSection
            currentToolSlug={toolSlug}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </div>
  );
};
