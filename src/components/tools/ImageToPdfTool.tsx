import React, { useState, useRef, useEffect } from 'react';
import {
  GripVertical,
  Trash2,
  Download,
  RotateCw,
  Plus,
  CheckSquare,
  Square,
  MoveLeft,
  MoveRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Settings,
  Sparkles,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { ToolHeader } from './ToolHeader';
import { FileUploadZone } from './FileUploadZone';
import { RelatedToolsSection } from './RelatedToolsSection';
import { ToolGuideSection } from './ToolGuideSection';
import { FaqSection } from '../FaqSection';
import { downloadBytesAsFile } from '../../services/pdfEngine';
import { getSuggestedDefaultFileName } from '../../utils/fileNaming';
import { TOOLS_DATA, ToolItem } from '../../data/toolsData';

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  rotation: number;
  isSelected: boolean;
}

interface ImageToPdfToolProps {
  onNavigate: (path: string) => void;
}

export const ImageToPdfTool: React.FC<ImageToPdfToolProps> = ({ onNavigate }) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape' | 'auto'>('portrait');
  const [margin, setMargin] = useState<number>(20); // 0, 10, 20 mm
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain');

  const [isProcessing, setIsProcessing] = useState(false);
  const [processedBytes, setProcessedBytes] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const addMoreInputRef = useRef<HTMLInputElement | null>(null);
  const activeUrlsRef = useRef<Set<string>>(new Set());

  // Clean up all remaining object URLs on unmount
  useEffect(() => {
    const urlSet = activeUrlsRef.current;
    return () => {
      urlSet.forEach((url) => URL.revokeObjectURL(url));
      urlSet.clear();
    };
  }, []);

  const getImageDimensions = (url: string): Promise<{ width: number; height: number } | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          resolve({ width: img.naturalWidth, height: img.naturalHeight });
        } else {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  const handleAddFiles = async (fileList: FileList | File[]) => {
    setErrorMessage(null);
    setProcessedBytes(null);
    setSuccessInfo(null);

    const incoming = Array.from(fileList);
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp'];
    const invalidNames: string[] = [];
    const candidateFiles: File[] = [];

    for (const f of incoming) {
      const lowerName = f.name.toLowerCase();
      const isSupported =
        f.type.startsWith('image/') ||
        validTypes.some((t) => lowerName.endsWith(`.${t.replace('image/', '')}`)) ||
        lowerName.endsWith('.jpg') ||
        lowerName.endsWith('.jpeg');
      if (isSupported && !lowerName.endsWith('.svg')) {
        candidateFiles.push(f);
      } else {
        invalidNames.push(f.name);
      }
    }

    if (candidateFiles.length === 0) {
      setErrorMessage(
        invalidNames.length > 0
          ? `Unsupported file(s): ${invalidNames.join(', ')}. Please select JPG, JPEG, PNG, WebP, or BMP images.`
          : 'Please select valid image files (JPG, PNG, WebP, BMP).'
      );
      return;
    }

    const loadedItems: ImageItem[] = [];
    const corruptNames: string[] = [];

    await Promise.all(
      candidateFiles.map(async (file, idx) => {
        const previewUrl = URL.createObjectURL(file);
        const dims = await getImageDimensions(previewUrl);
        if (!dims) {
          URL.revokeObjectURL(previewUrl);
          corruptNames.push(file.name);
          return;
        }
        activeUrlsRef.current.add(previewUrl);
        loadedItems.push({
          id: `img-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
          file,
          previewUrl,
          width: dims.width,
          height: dims.height,
          rotation: 0,
          isSelected: true,
        });
      })
    );

    if (loadedItems.length > 0) {
      setImages((prev) => [...prev, ...loadedItems]);
    }

    const allSkipped = [...invalidNames, ...corruptNames];
    if (allSkipped.length > 0) {
      setErrorMessage(
        `Could not load unreadable or unsupported image(s): ${allSkipped.join(', ')}.`
      );
    }
  };

  const toggleSelect = (id: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, isSelected: !img.isSelected } : img))
    );
    setProcessedBytes(null);
  };

  const selectAll = () => {
    setImages((prev) => prev.map((img) => ({ ...img, isSelected: true })));
    setProcessedBytes(null);
  };

  const deselectAll = () => {
    setImages((prev) => prev.map((img) => ({ ...img, isSelected: false })));
    setProcessedBytes(null);
  };

  const rotateImage = (id: string) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, rotation: (img.rotation + 90) % 360 } : img
      )
    );
    setProcessedBytes(null);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
        activeUrlsRef.current.delete(target.previewUrl);
      }
      return prev.filter((img) => img.id !== id);
    });
    setProcessedBytes(null);
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const copy = [...images];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    setImages(copy);
    setProcessedBytes(null);
  };

  const reorderImage = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0 || fromIdx >= images.length || toIdx >= images.length) {
      return;
    }
    const copy = [...images];
    const [moved] = copy.splice(fromIdx, 1);
    copy.splice(toIdx, 0, moved);
    setImages(copy);
    setProcessedBytes(null);
  };

  const selectedCount = images.filter((img) => img.isSelected).length;

  const handleConvert = async () => {
    const selectedImages = images.filter((img) => img.isSelected);
    if (selectedImages.length === 0) {
      setErrorMessage('Please select at least one image to include in the PDF.');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage(null);
      setProcessedBytes(null);

      const pdf = await PDFDocument.create();

      // Convert mm margins to PDF points (1 inch = 25.4 mm = 72 pt -> 1 mm ≈ 2.83465 pt)
      const marginPt = margin * 2.83465;

      for (const item of selectedImages) {
        // Standard points for page sizes
        // A4: 595.28 x 841.89 pt
        // Letter: 612.00 x 792.00 pt
        let pWidth = 595.28;
        let pHeight = 841.89;

        if (pageSize === 'letter') {
          pWidth = 612.0;
          pHeight = 792.0;
        }

        // Handle auto or manual orientation
        const isRotatedQuarter = item.rotation === 90 || item.rotation === 270;
        const effectiveImgWidth = isRotatedQuarter ? item.height : item.width;
        const effectiveImgHeight = isRotatedQuarter ? item.width : item.height;

        let targetOrientation = orientation;
        if (targetOrientation === 'auto') {
          targetOrientation = effectiveImgWidth > effectiveImgHeight ? 'landscape' : 'portrait';
        }

        if (targetOrientation === 'landscape' && pageSize !== 'fit') {
          const temp = pWidth;
          pWidth = pHeight;
          pHeight = temp;
        }

        // Fit to image page dimensions
        if (pageSize === 'fit') {
          pWidth = effectiveImgWidth + marginPt * 2;
          pHeight = effectiveImgHeight + marginPt * 2;
        }

        // Draw image via canvas to guarantee rotation and format compatibility (PNG, JPG, WebP)
        const canvas = document.createElement('canvas');
        canvas.width = effectiveImgWidth;
        canvas.height = effectiveImgHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not initialize canvas for image conversion');

        const tempImg = new Image();
        tempImg.src = item.previewUrl;
        await new Promise((res, rej) => {
          tempImg.onload = res;
          tempImg.onerror = rej;
        });

        // Apply rotation onto canvas
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((item.rotation * Math.PI) / 180);
        ctx.drawImage(tempImg, -item.width / 2, -item.height / 2, item.width, item.height);
        ctx.restore();

        // Export high-quality JPEG
        const jpegBlob = await new Promise<Blob>((res) =>
          canvas.toBlob((b) => res(b!), 'image/jpeg', 0.95)
        );
        const jpegBuffer = await jpegBlob.arrayBuffer();
        const embeddedImage = await pdf.embedJpg(jpegBuffer);

        const page = pdf.addPage([pWidth, pHeight]);

        const availW = Math.max(10, pWidth - marginPt * 2);
        const availH = Math.max(10, pHeight - marginPt * 2);

        let drawW = availW;
        let drawH = availH;

        if (fitMode === 'contain') {
          const scale = Math.min(availW / effectiveImgWidth, availH / effectiveImgHeight);
          drawW = effectiveImgWidth * scale;
          drawH = effectiveImgHeight * scale;
        }

        const posX = marginPt + (availW - drawW) / 2;
        const posY = marginPt + (availH - drawH) / 2;

        page.drawImage(embeddedImage, {
          x: posX,
          y: posY,
          width: drawW,
          height: drawH,
        });

        // Clear canvas
        canvas.width = 0;
        canvas.height = 0;
      }

      const bytes = await pdf.save();
      setProcessedBytes(bytes);
      setSuccessInfo(
        `Successfully generated PDF with ${selectedImages.length} image${
          selectedImages.length > 1 ? 's' : ''
        } (${(bytes.byteLength / 1024 / 1024).toFixed(2)} MB).`
      );
    } catch (err: any) {
      console.error('Image to PDF error:', err);
      setErrorMessage(err.message || 'Failed to convert images to PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedBytes) return;
    const defaultName = getSuggestedDefaultFileName(images[0]?.file.name || 'document', 'images-to-pdf');
    downloadBytesAsFile(processedBytes, defaultName, 'application/pdf');
  };

  const toolData: ToolItem = TOOLS_DATA.find((t) => t.id === 'images-to-pdf') || {
    id: 'images-to-pdf',
    name: 'Image to PDF Converter',
    slug: 'images-to-pdf',
    category: 'pdf',
    categoryLabel: 'Convert to PDF',
    shortDesc: 'Convert JPG, PNG, and WebP images into a single professional PDF document.',
    longDesc: 'Turn photos and digital images into high-quality PDF files. Reorder, rotate, select page dimensions, and adjust margins with 100% in-browser processing.',
    iconName: 'FileImage',
    keywords: ['images to pdf', 'image to pdf', 'jpg to pdf', 'png to pdf'],
  };

  return (
    <div className="min-h-screen bg-[#101114] text-[#F5F5F5] py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <ToolHeader tool={toolData} onNavigate={onNavigate} />

        {/* Upload Zone / Empty State */}
        {images.length === 0 ? (
          <div className="mt-8">
            <FileUploadZone
              onFilesSelected={handleAddFiles}
              accept="image/jpeg,image/png,image/webp,image/bmp,.jpg,.jpeg,.png,.webp,.bmp"
              multiple={true}
              maxFiles={50}
              maxSizeMB={50}
              title="Drag & drop images here, or click to browse"
              subtitle="Supports JPG, JPEG, PNG, WebP, and BMP. 100% private in-browser conversion."
              fileTypeLabel="JPG, PNG, WebP, BMP"
            />
          </div>
        ) : (
          /* Active Image Workspace */
          <div className="mt-8 space-y-6">
            {/* Compact Drag-and-Drop Add More Zone */}
            <FileUploadZone
              compact={true}
              onFilesSelected={handleAddFiles}
              accept="image/jpeg,image/png,image/webp,image/bmp,.jpg,.jpeg,.png,.webp,.bmp"
              multiple={true}
              maxFiles={50}
              maxSizeMB={50}
              title="Drag & drop more images here, or click to add"
              fileTypeLabel="JPG, PNG, WebP, BMP"
            />

            {/* Action Bar */}
            <div className="bg-[#1B1D22] border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[#F5F5F5]">
                  {selectedCount} of {images.length} images selected
                </span>
                <span className="text-slate-600">|</span>
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-xs font-semibold text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  Select All
                </button>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="text-xs font-semibold text-[#B5B8BE] hover:text-[#F5F5F5] flex items-center gap-1 cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5" />
                  Deselect All
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={addMoreInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/bmp"
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
                  Add More Images
                </button>
                <button
                  type="button"
                  onClick={() => {
                    images.forEach((img) => {
                      URL.revokeObjectURL(img.previewUrl);
                      activeUrlsRef.current.delete(img.previewUrl);
                    });
                    setImages([]);
                    setProcessedBytes(null);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Images Grid with Drag-and-Drop Reordering */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((item, idx) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => {
                    setDraggedIdx(idx);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (draggedIdx !== null && draggedIdx !== idx) {
                      setDragOverIdx(idx);
                    }
                  }}
                  onDragLeave={() => setDragOverIdx(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedIdx !== null) {
                      reorderImage(draggedIdx, idx);
                    }
                    setDraggedIdx(null);
                    setDragOverIdx(null);
                  }}
                  onDragEnd={() => {
                    setDraggedIdx(null);
                    setDragOverIdx(null);
                  }}
                  className={`group relative rounded-xl border transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-grab active:cursor-grabbing ${
                    dragOverIdx === idx
                      ? 'border-amber-300 ring-2 ring-amber-400 scale-[1.02]'
                      : draggedIdx === idx
                      ? 'opacity-40 border-amber-500/40'
                      : item.isSelected
                      ? 'bg-[#1B1D22] border-[#D4AF37] ring-1 ring-[#D4AF37]/50 shadow-md shadow-[#D4AF37]/5'
                      : 'bg-[#141519] border-slate-800 opacity-60'
                  }`}
                >
                  {/* Card Header: Position & Selection */}
                  <div className="flex items-center justify-between p-2 bg-[#101114]/90 border-b border-slate-800/60 z-10">
                    <div className="flex items-center gap-1.5">
                      <GripVertical className="w-3.5 h-3.5 text-slate-500" />
                      <button
                        type="button"
                        onClick={() => toggleSelect(item.id)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                          item.isSelected
                            ? 'bg-[#D4AF37] text-[#101114]'
                            : 'bg-[#101114] border border-slate-600 hover:border-[#D4AF37]'
                        }`}
                        title={item.isSelected ? 'Unselect' : 'Select'}
                      >
                        {item.isSelected && <CheckSquare className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-mono font-bold text-[#D4AF37] px-1.5 py-0.5 rounded bg-[#101114] border border-slate-800">
                        #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => rotateImage(item.id)}
                        className="p-1 rounded text-[#B5B8BE] hover:text-[#D4AF37] transition cursor-pointer"
                        title="Rotate 90° clockwise"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(item.id)}
                        className="p-1 rounded text-[#B5B8BE] hover:text-rose-400 transition cursor-pointer"
                        title="Remove image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail Preview */}
                  <div
                    className="relative w-full h-44 p-2 flex items-center justify-center bg-[#101114] overflow-hidden cursor-pointer select-none"
                    onClick={() => toggleSelect(item.id)}
                  >
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      draggable={false}
                      className="max-h-full max-w-full object-contain rounded shadow-xs transition-transform duration-200"
                      style={{ transform: `rotate(${item.rotation}deg)` }}
                    />
                  </div>

                  {/* Card Footer: Metadata & Reordering */}
                  <div className="p-2 bg-[#121317] border-t border-slate-800 flex items-center justify-between text-[11px] text-[#B5B8BE]">
                    <div className="truncate max-w-[90px]" title={item.file.name}>
                      {item.file.name}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveImage(idx, 'left')}
                        className="p-1 rounded text-[#B5B8BE] hover:text-[#F5F5F5] disabled:opacity-20 cursor-pointer"
                        title="Move left"
                      >
                        <MoveLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === images.length - 1}
                        onClick={() => moveImage(idx, 'right')}
                        className="p-1 rounded text-[#B5B8BE] hover:text-[#F5F5F5] disabled:opacity-20 cursor-pointer"
                        title="Move right"
                      >
                        <MoveRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PDF Options Bar */}
            <div className="bg-[#1B1D22] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Settings className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-sm font-bold text-[#F5F5F5]">PDF Configuration</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Page Size */}
                <div>
                  <label className="block text-xs font-semibold text-[#B5B8BE] mb-1.5">
                    Page Size
                  </label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value as any)}
                    className="w-full bg-[#101114] border border-slate-700 rounded-lg px-3 py-2 text-xs text-[#F5F5F5] focus:border-[#D4AF37] focus:outline-hidden"
                  >
                    <option value="a4">A4 (Standard 210 × 297 mm)</option>
                    <option value="letter">US Letter (8.5 × 11 in)</option>
                    <option value="fit">Fit to Image Dimensions</option>
                  </select>
                </div>

                {/* Orientation */}
                <div>
                  <label className="block text-xs font-semibold text-[#B5B8BE] mb-1.5">
                    Orientation
                  </label>
                  <select
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value as any)}
                    disabled={pageSize === 'fit'}
                    className="w-full bg-[#101114] border border-slate-700 rounded-lg px-3 py-2 text-xs text-[#F5F5F5] focus:border-[#D4AF37] focus:outline-hidden disabled:opacity-40"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                    <option value="auto">Auto (Match Image)</option>
                  </select>
                </div>

                {/* Margins */}
                <div>
                  <label className="block text-xs font-semibold text-[#B5B8BE] mb-1.5">
                    Page Margins
                  </label>
                  <select
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    className="w-full bg-[#101114] border border-slate-700 rounded-lg px-3 py-2 text-xs text-[#F5F5F5] focus:border-[#D4AF37] focus:outline-hidden"
                  >
                    <option value={0}>None (0 mm)</option>
                    <option value={10}>Small (10 mm)</option>
                    <option value={20}>Normal (20 mm)</option>
                  </select>
                </div>

                {/* Image Fit Mode */}
                <div>
                  <label className="block text-xs font-semibold text-[#B5B8BE] mb-1.5">
                    Image Fit
                  </label>
                  <select
                    value={fitMode}
                    onChange={(e) => setFitMode(e.target.value as any)}
                    disabled={pageSize === 'fit'}
                    className="w-full bg-[#101114] border border-slate-700 rounded-lg px-3 py-2 text-xs text-[#F5F5F5] focus:border-[#D4AF37] focus:outline-hidden disabled:opacity-40"
                  >
                    <option value="contain">Fit (Maintain Aspect Ratio)</option>
                    <option value="cover">Fill Page</option>
                  </select>
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
                    Download PDF
                  </button>
                )}
              </div>
            )}

            {/* Convert Action Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <div className="text-xs text-[#B5B8BE]">
                {selectedCount === 0 ? (
                  <span className="text-rose-400">Please select at least 1 image to convert.</span>
                ) : (
                  <span>Ready to compile {selectedCount} images into your document.</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={selectedCount === 0 || isProcessing}
                  onClick={handleConvert}
                  className="px-6 py-3 bg-[#D4AF37] hover:bg-[#E6C768] disabled:opacity-30 disabled:pointer-events-none text-[#101114] font-bold text-sm rounded-xl transition shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#101114]" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Convert {selectedCount} Images to PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Informational SEO and FAQ Sections */}
        <div className="mt-16 space-y-12">
          <ToolGuideSection
            toolId="images-to-pdf"
            toolName="Images to PDF"
            onNavigate={onNavigate}
            hideSteps
            hideFaq
          />

          {/* How It Works */}
          <div className="bg-[#1B1D22] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-[#F5F5F5]">
              How to Convert Images to PDF Online
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-bold text-[#D4AF37]">01. UPLOAD IMAGES</div>
                <h4 className="text-sm font-semibold text-[#F5F5F5]">Select Photos</h4>
                <p className="text-xs text-[#B5B8BE]">
                  Drag and drop JPG, PNG, or WebP files. You can upload up to 50 images at once.
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-bold text-[#D4AF37]">02. REORDER & ROTATE</div>
                <h4 className="text-sm font-semibold text-[#F5F5F5]">Organize Pages</h4>
                <p className="text-xs text-[#B5B8BE]">
                  Adjust page sequence, rotate sideways pictures, choose paper margins and dimensions.
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-bold text-[#D4AF37]">03. DOWNLOAD PDF</div>
                <h4 className="text-sm font-semibold text-[#F5F5F5]">Instant Output</h4>
                <p className="text-xs text-[#B5B8BE]">
                  Click Convert to compile. Your PDF generates 100% locally in your browser.
                </p>
              </div>
            </div>
          </div>

          <FaqSection
            faqs={[
              {
                q: 'Which image formats are supported?',
                a: 'ToolCrest supports JPG, JPEG, PNG, WebP, and BMP images. All formats are converted smoothly into clean PDF pages.',
              },
              {
                q: 'Are my images uploaded to any server?',
                a: 'No. All processing occurs 100% locally inside your web browser. Your confidential photos and documents never touch external servers.',
              },
              {
                q: 'Can I reorder or rotate images before converting?',
                a: 'Yes. Use the arrow buttons on each card to shift sequence, or the rotate button to fix orientation.',
              },
              {
                q: 'How do unselected images behave?',
                a: 'Only checked images are included in the compiled PDF. Any unselected images are excluded automatically.',
              },
            ]}
          />

          <RelatedToolsSection
            currentToolSlug="images-to-pdf"
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </div>
  );
};
