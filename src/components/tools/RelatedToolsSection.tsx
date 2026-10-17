import React from 'react';
import { TOOLS_DATA, ToolCategory, ToolItem } from '../../data/toolsData';
import { ToolCard } from './ToolCard';
import { Sparkles, ArrowRight } from 'lucide-react';

interface RelatedToolsSectionProps {
  currentToolSlug: string;
  category?: ToolCategory;
  onNavigate: (path: string) => void;
  title?: string;
  subtitle?: string;
  maxItems?: number;
}

export const RelatedToolsSection: React.FC<RelatedToolsSectionProps> = ({
  currentToolSlug,
  category,
  onNavigate,
  title = 'Related Tools You May Need',
  subtitle = 'Discover more fast, private browser-based utilities to streamline your digital workflow.',
  maxItems = 3,
}) => {
  // Find related tools from same category, or fallback to popular tools
  const relatedTools = React.useMemo(() => {
    let pool: ToolItem[] = [];
    if (category && category !== 'all') {
      pool = TOOLS_DATA.filter((t) => t.category === category && t.slug !== currentToolSlug);
    }

    if (pool.length < maxItems) {
      const remaining = TOOLS_DATA.filter(
        (t) => t.slug !== currentToolSlug && !pool.some((p) => p.id === t.id)
      );
      pool = [...pool, ...remaining];
    }

    return pool.slice(0, maxItems);
  }, [currentToolSlug, category, maxItems]);

  if (relatedTools.length === 0) return null;

  return (
    <section className="bg-[#0c101d] border border-amber-500/25 rounded-3xl p-6 sm:p-8 space-y-5 text-slate-100 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="font-black text-base sm:text-lg text-white tracking-tight">
              {title}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        <button
          type="button"
          onClick={() => {
            onNavigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 self-start sm:self-auto transition cursor-pointer"
        >
          <span>Explore All 39+ Tools</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedTools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            onSelect={(slug) => {
              onNavigate(`/tools/${slug}`);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            compact={true}
          />
        ))}
      </div>
    </section>
  );
};
