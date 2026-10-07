import React, { useState } from 'react';
import { Printer, FileDown, Image, RotateCcw, Check, HelpCircle, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { PlannerType } from '../types/planner';

interface PlannerActionToolbarProps {
  plannerType: PlannerType;
  onReset: (allPlanners?: boolean) => void;
  lastSavedText: string;
}

export const PlannerActionToolbar: React.FC<PlannerActionToolbarProps> = ({
  plannerType,
  onReset,
  lastSavedText,
}) => {
  const [showResetModal, setShowResetModal] = useState(false);
  const [showPdfTip, setShowPdfTip] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleSaveAsPdf = () => {
    setShowPdfTip(true);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const handleDownloadImage = async () => {
    const node = document.getElementById('planner-print-container');
    if (!node) {
      alert('Planner container not found for download.');
      return;
    }

    try {
      setIsExportingImage(true);
      // Wait for layout to settle
      await new Promise((resolve) => setTimeout(resolve, 200));
      const dataUrl = await toPng(node, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        filter: (child: HTMLElement) => {
          // Exclude elements marked print:hidden if desired or keep full view
          return !child?.classList?.contains('hide-from-export');
        },
      });

      const link = document.createElement('a');
      link.download = `zarorat-hub-${plannerType}-planner.png`;
      link.href = dataUrl;
      link.click();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Error generating image export:', err);
    } finally {
      setIsExportingImage(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-xs mb-6 print:hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Autosave badge */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
          <span className="font-medium text-slate-700">Autosaved in your browser</span>
          <span className="text-slate-400">({lastSavedText})</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Print */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-98 transition"
            title="Print this planner on paper"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            Print
          </button>

          {/* Save as PDF */}
          <button
            type="button"
            onClick={handleSaveAsPdf}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-98 transition"
            title="Save planner layout as a PDF file"
          >
            <FileDown className="w-4 h-4 text-slate-600" />
            Save as PDF
          </button>

          {/* Download as image */}
          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={isExportingImage}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 active:scale-98 transition disabled:opacity-50"
            title="Download clean PNG image of planner"
          >
            {isExportingImage ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            ) : downloadSuccess ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Image className="w-4 h-4 text-emerald-600" />
            )}
            {isExportingImage
              ? 'Generating...'
              : downloadSuccess
              ? 'Downloaded!'
              : 'Download as image'}
          </button>

          {/* Reset */}
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 active:scale-98 transition"
            title="Reset this planner back to default template"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            Reset
          </button>
        </div>
      </div>

      {/* PDF tip notification */}
      {showPdfTip && (
        <div className="mt-3 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Tip for PDF:</strong> When the print dialog opens, set the Destination / Printer to <em>"Save as PDF"</em>.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowPdfTip(false)}
            className="text-blue-700 hover:text-blue-900 font-bold ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Confirmation Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-rose-600" />
              Reset Planner
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to reset your plan? You can reset just this current planner or clear all 8 saved planners back to default samples.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  onReset(false);
                  setShowResetModal(false);
                }}
                className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition"
              >
                Reset current planner only
              </button>
              <button
                type="button"
                onClick={() => {
                  onReset(true);
                  setShowResetModal(false);
                }}
                className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              >
                Reset all planners to defaults
              </button>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="w-full py-2 px-3 text-xs font-medium rounded-lg text-slate-500 hover:text-slate-800 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
