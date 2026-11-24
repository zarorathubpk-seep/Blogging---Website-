import React from 'react';
import { TOOL_GUIDES } from '../../data/toolGuides';
import { INITIAL_ARTICLES } from '../../data/defaultArticles';
import { FaqSection } from '../FaqSection';
import { useTheme } from '../../context/ThemeContext';
import {
  HelpCircle,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  FileInput,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cloud,
} from 'lucide-react';

interface ToolGuideSectionProps {
  toolId: string;
  toolName: string;
  onNavigate: (path: string) => void;
  hideSteps?: boolean;
  hideFaq?: boolean;
}

export const ToolGuideSection: React.FC<ToolGuideSectionProps> = ({
  toolId,
  toolName,
  onNavigate,
  hideSteps = false,
  hideFaq = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const guide = TOOL_GUIDES[toolId];

  if (!guide) return null;

  const relatedArticles = guide.relatedBlogSlugs
    .map((slug) => INITIAL_ARTICLES.find((a) => a.slug === slug))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  const cardSurface = isDark
    ? 'bg-[#0c101d] border-amber-500/25 text-slate-100'
    : 'bg-white border-slate-200/90 text-slate-900 shadow-sm';

  const innerSurface = isDark
    ? 'bg-[#070a14] border-amber-500/20 text-slate-300'
    : 'bg-slate-50 border-slate-200 text-slate-700';

  return (
    <div className="space-y-8">
      {/* 1. Overview, Input/Output Specs & Worked Example */}
      <section className={`border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 ${cardSurface}`}>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className={`text-lg sm:text-xl font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>About {toolName}: Capabilities, Example &amp; Specifications</span>
            </h2>
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full border ${
                guide.processingMode === 'hybrid-ai'
                  ? isDark
                    ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                    : 'bg-sky-50 text-sky-800 border-sky-200'
                  : isDark
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {guide.processingMode === 'hybrid-ai' ? (
                <>
                  <Cloud className="w-3.5 h-3.5" />
                  <span>Local Extraction + Encrypted AI API</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% Browser-Local Execution</span>
                </>
              )}
            </span>
          </div>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {guide.overview}
          </p>
        </div>

        {/* Input / Output & Practical Example */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className={`border rounded-2xl p-4 sm:p-5 space-y-3 ${innerSurface}`}>
            <h3 className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
              <FileInput className="w-4 h-4 text-amber-500" />
              <span>Supported Inputs &amp; Outputs</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className={`font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>Input Format:</span>
                <span>{guide.inputs}</span>
              </div>
              <div>
                <span className={`font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>Output Result:</span>
                <span>{guide.outputs}</span>
              </div>
            </div>
          </div>

          <div className={`border rounded-2xl p-4 sm:p-5 space-y-2.5 ${innerSurface}`}>
            <h3 className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>Practical Example: {guide.example.scenario}</span>
            </h3>
            <div className="space-y-1.5 text-xs">
              <p>
                <strong className={isDark ? 'text-slate-200' : 'text-slate-900'}>Input:</strong>{' '}
                <span>{guide.example.input}</span>
              </p>
              <p>
                <strong className={isDark ? 'text-emerald-300' : 'text-emerald-800'}>Result:</strong>{' '}
                <span>{guide.example.output}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Common Use Cases vs Honest Technical Limitations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`border rounded-2xl p-4 sm:p-5 space-y-2.5 ${innerSurface}`}>
            <h3 className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Best Everyday Use Cases</span>
            </h3>
            <ul className="space-y-1.5 text-xs">
              {guide.useCases.map((uc) => (
                <li key={uc} className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold mt-0.5">•</span>
                  <span>{uc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={`border rounded-2xl p-4 sm:p-5 space-y-2.5 ${innerSurface}`}>
            <h3 className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Known Scope &amp; Limitations</span>
            </h3>
            <ul className="space-y-1.5 text-xs">
              {guide.limitations.map((lim) => (
                <li key={lim} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold mt-0.5">•</span>
                  <span>{lim}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 2. Tool-Specific Step-by-Step Guide */}
      {!hideSteps && guide.steps.length > 0 && (
        <section className={`border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 ${cardSurface}`}>
          <h2 className={`text-base sm:text-lg font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <span>How to Use {toolName} ({guide.steps.length} Steps)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {guide.steps.map((step, idx) => (
              <div key={step.title} className={`p-4 border rounded-2xl space-y-1.5 ${innerSurface}`}>
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-black flex items-center justify-center">
                  {idx + 1}
                </span>
                <h3 className={`font-bold text-xs sm:text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {step.title}
                </h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {step.detail}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Tool-Specific FAQs */}
      {!hideFaq && guide.faqs.length > 0 && (
        <FaqSection
          title={`Frequently Asked Questions: ${toolName}`}
          subtitle={`Answers about ${toolName} file handling, compatibility, and accuracy.`}
          faqs={guide.faqs}
        />
      )}

      {/* 4. Related Knowledge Center Guides */}
      {relatedArticles.length > 0 && (
        <section className={`border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 ${cardSurface}`}>
          <div className="flex items-center justify-between gap-2">
            <h2 className={`text-base font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>Helpful Guides for This Workflow</span>
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('/blog')}
              className={`text-xs font-bold flex items-center gap-1 cursor-pointer hover:underline ${
                isDark ? 'text-amber-400' : 'text-amber-700'
              }`}
            >
              <span>All Guides</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {relatedArticles.map((art) => (
              <button
                key={art.id}
                type="button"
                onClick={() => onNavigate(`/blog/${art.slug}`)}
                className={`p-4 border rounded-2xl text-left transition cursor-pointer group flex items-start justify-between gap-3 ${innerSurface} ${
                  isDark ? 'hover:border-amber-400/50' : 'hover:border-amber-400'
                }`}
              >
                <div className="space-y-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                    {art.category} • {art.readingTime}
                  </span>
                  <h3 className={`text-xs sm:text-sm font-bold transition ${isDark ? 'text-white group-hover:text-amber-300' : 'text-slate-900 group-hover:text-amber-800'}`}>
                    {art.title}
                  </h3>
                  <p className={`text-xs line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {art.subtitle}
                  </p>
                </div>
                <ArrowRight className={`w-4 h-4 shrink-0 mt-1 transition group-hover:translate-x-0.5 ${isDark ? 'text-amber-400' : 'text-amber-700'}`} />
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
