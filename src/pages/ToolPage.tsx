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
  const tool = TOOLS_DATA.find((t) => t.slug === toolSlug) || TOOLS_DATA[0];

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

  // Advanced Split PDF Tool (5 Modes, Visual Thumbnails, Ranges, ZIPs, Image Exports)
  if (tool.id === 'split-pdf' || tool.id === 'extract-pdf-pages') {
    return <AdvancedSplitPdfTool onNavigate={onNavigate} />;
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
