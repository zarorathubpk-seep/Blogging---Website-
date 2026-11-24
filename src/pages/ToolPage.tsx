import React from 'react';
import { TOOLS_DATA, ToolItem } from '../data/toolsData';
import { PdfToolView } from '../components/tools/PdfToolView';
import { QrGeneratorTool } from '../components/tools/QrGeneratorTool';
import { UnitConverterTool } from '../components/tools/UnitConverterTool';
import { TimeZoneConverterTool } from '../components/tools/TimeZoneConverterTool';
import { TextCounterTool } from '../components/tools/TextCounterTool';
import { LoanCalculatorTool } from '../components/tools/LoanCalculatorTool';
import { PasswordGeneratorTool } from '../components/tools/PasswordGeneratorTool';
import { MarkdownEditorTool } from '../components/tools/MarkdownEditorTool';
import { AdvancedSplitPdfTool } from '../components/tools/AdvancedSplitPdfTool';
import { OrganizePdfTool } from '../components/tools/OrganizePdfTool';
import { ScanToPdfTool } from '../components/tools/ScanToPdfTool';
import { ImageToPdfTool } from '../components/tools/ImageToPdfTool';
import { PdfToImageTool } from '../components/tools/PdfToImageTool';
import { MergePdfTool } from '../components/tools/MergePdfTool';
import { ImageStudioTool } from '../components/tools/ImageStudioTool';
import { VisualPdfEditorTool } from '../components/tools/VisualPdfEditorTool';
import { PlannerType, StoredPlannerState } from '../types/planner';
import { PlannerPage } from './PlannerPage';
import { Article } from '../types/article';
import { ArrowLeft } from 'lucide-react';

interface ToolPageProps {
  toolSlug: string;
  onNavigate: (path: string) => void;
  plannerState: StoredPlannerState;
  onUpdatePlannerState: (updated: StoredPlannerState) => void;
  onResetPlanner: (all?: boolean) => void;
  articles: Article[];
}

export const ToolPage: React.FC<ToolPageProps> = ({
  toolSlug,
  onNavigate,
  plannerState,
  onUpdatePlannerState,
  onResetPlanner,
  articles,
}) => {
  const normalizedSlug =
    toolSlug === 'image-to-pdf'
      ? 'images-to-pdf'
      : toolSlug === 'pdf-to-image' || toolSlug === 'pdf-to-jpg'
      ? 'pdf-to-images'
      : toolSlug;

  const tool = TOOLS_DATA.find((t) => t.slug === normalizedSlug || t.id === normalizedSlug);

  if (!tool) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-xl w-full bg-[#0c101d] border border-amber-500/25 rounded-3xl p-8 text-center space-y-5 text-slate-100 shadow-2xl">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
            404 • Tool Not Found
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            We could not find “{toolSlug}”
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            The requested tool link may be outdated or misspelled. Browse all {TOOLS_DATA.length} utilities on the homepage or jump directly to a popular tool below.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {[
              { label: 'Merge PDF', slug: 'merge-pdf' },
              { label: 'Split PDF', slug: 'split-pdf' },
              { label: 'Edit PDF', slug: 'edit-pdf' },
              { label: 'QR Generator', slug: 'qr-generator' },
            ].map((item) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => onNavigate(`/tools/${item.slug}`)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/25 hover:border-amber-400 text-xs font-bold text-amber-300 cursor-pointer transition"
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Homepage
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/sitemap')}
              className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-bold text-xs cursor-pointer hover:border-amber-400/50"
            >
              View Full Sitemap
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If it's a planner tool, map to PlannerPage with the relevant active planner type
  if (tool.category === 'productivity' && tool.id.includes('-planner')) {
    let plannerType: PlannerType = 'weekly';
    if (tool.id === 'budget-planner') plannerType = 'budget';
    else if (tool.id === 'daily-planner') plannerType = 'daily';
    else if (tool.id === 'office-planner') plannerType = 'office';
    else if (tool.id === 'project-planner') plannerType = 'project';
    else if (tool.id === 'study-planner') plannerType = 'study';
    else if (tool.id === 'meal-planner') plannerType = 'meal';
    else if (tool.id === 'habit-planner') plannerType = 'habit';

    const customizedState: StoredPlannerState = {
      ...plannerState,
      activeType: plannerType,
    };

    return (
      <PlannerPage
        state={customizedState}
        onUpdateState={onUpdatePlannerState}
        onResetPlanner={onResetPlanner}
        articles={articles}
        onSelectArticle={(slug) => onNavigate(`/blog/${slug}`)}
        onNavigate={onNavigate}
      />
    );
  }

  // Budget planner calculator
  if (tool.id === 'budget-planner') {
    const customizedState: StoredPlannerState = {
      ...plannerState,
      activeType: 'budget',
    };
    return (
      <PlannerPage
        state={customizedState}
        onUpdateState={onUpdatePlannerState}
        onResetPlanner={onResetPlanner}
        articles={articles}
        onSelectArticle={(slug) => onNavigate(`/blog/${slug}`)}
        onNavigate={onNavigate}
      />
    );
  }

  // QR Generator
  if (tool.id === 'qr-generator') {
    return <QrGeneratorTool onNavigate={onNavigate} />;
  }

  // Unit Converter
  if (tool.id === 'unit-converter') {
    return <UnitConverterTool onNavigate={onNavigate} />;
  }

  // Time Zone Converter
  if (tool.id === 'time-zone-converter') {
    return <TimeZoneConverterTool onNavigate={onNavigate} />;
  }

  // Text Counter
  if (tool.id === 'text-counter') {
    return <TextCounterTool onNavigate={onNavigate} />;
  }

  // Loan Calculator
  if (tool.id === 'loan-calculator') {
    return <LoanCalculatorTool onNavigate={onNavigate} />;
  }

  // Password Generator
  if (tool.id === 'password-generator') {
    return <PasswordGeneratorTool onNavigate={onNavigate} />;
  }

  // Markdown Live Editor
  if (tool.id === 'markdown-previewer') {
    return <MarkdownEditorTool onNavigate={onNavigate} />;
  }

  // Image to PDF Converter (Dedicated high-fidelity workflow)
  if (tool.id === 'images-to-pdf' || toolSlug === 'images-to-pdf' || toolSlug === 'image-to-pdf') {
    return <ImageToPdfTool onNavigate={onNavigate} />;
  }

  // PDF to Image Converter (PNG, JPG, ZIP exports)
  if (
    tool.id === 'pdf-to-images' ||
    toolSlug === 'pdf-to-images' ||
    toolSlug === 'pdf-to-image' ||
    toolSlug === 'pdf-to-jpg'
  ) {
    return <PdfToImageTool onNavigate={onNavigate} />;
  }

  // Merge PDF (Visual document & page reordering)
  if (tool.id === 'merge-pdf' || toolSlug === 'merge-pdf') {
    return <MergePdfTool onNavigate={onNavigate} />;
  }

  // Advanced Split PDF Tool (5 Modes, Visual Thumbnails, Ranges, ZIPs, Image Exports)
  if (tool.id === 'split-pdf' || tool.id === 'extract-pdf-pages' || toolSlug === 'split-pdf') {
    return <AdvancedSplitPdfTool onNavigate={onNavigate} />;
  }

  // Visual Page Organization
  if (tool.id === 'organize-pdf' || toolSlug === 'organize-pdf') {
    return <OrganizePdfTool onNavigate={onNavigate} />;
  }

  // Camera / Document Scanner
  if (tool.id === 'scan-to-pdf' || toolSlug === 'scan-to-pdf') {
    return <ScanToPdfTool onNavigate={onNavigate} />;
  }

  // Interactive Sejda-Style Visual PDF Editor
  if (tool.id === 'edit-pdf' || toolSlug === 'edit-pdf') {
    return <VisualPdfEditorTool onNavigate={onNavigate} />;
  }

  // Image Utilities Studio
  if (toolSlug === 'compress-image') {
    return <ImageStudioTool initialMode="compress" toolSlug="compress-image" onNavigate={onNavigate} />;
  }
  if (toolSlug === 'resize-image') {
    return <ImageStudioTool initialMode="resize" toolSlug="resize-image" onNavigate={onNavigate} />;
  }
  if (toolSlug === 'rotate-image') {
    return <ImageStudioTool initialMode="rotate" toolSlug="rotate-image" onNavigate={onNavigate} />;
  }
  if (toolSlug === 'jpg-to-png') {
    return <ImageStudioTool initialMode="convert" targetFormat="image/png" toolSlug="jpg-to-png" onNavigate={onNavigate} />;
  }
  if (toolSlug === 'png-to-jpg') {
    return <ImageStudioTool initialMode="convert" targetFormat="image/jpeg" toolSlug="png-to-jpg" onNavigate={onNavigate} />;
  }
  if (toolSlug === 'webp-converter') {
    return <ImageStudioTool initialMode="convert" targetFormat="image/webp" toolSlug="webp-converter" onNavigate={onNavigate} />;
  }

  // PDF Suite Tools
  return (
    <PdfToolView
      tool={tool}
      onNavigate={onNavigate}
      onSelectTool={(slug) => onNavigate(`/tools/${slug}`)}
    />
  );
};
