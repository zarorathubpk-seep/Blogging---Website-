import React from 'react';
import { Article } from '../types/article';
import { PlannerType } from '../types/planner';
import { ArrowRight, Sparkles, BookOpen, Clock, HeartHandshake } from 'lucide-react';

interface BlogSidebarProps {
  articles: Article[];
  onSelectArticle: (slug: string) => void;
  onSelectPlannerType: (type: PlannerType) => void;
  activeType: PlannerType;
}

export const BlogSidebar: React.FC<BlogSidebarProps> = ({
  articles,
  onSelectArticle,
  onSelectPlannerType,
  activeType,
}) => {
  const popularTypes: { type: PlannerType; label: string; desc: string }[] = [
    { type: 'weekly', label: 'Weekly Planner', desc: '7 days + 3 key priorities' },
    { type: 'budget', label: 'Budget Planner (50/30/20)', desc: 'Needs, wants & savings totals' },
    { type: 'daily', label: 'Daily Planner', desc: 'Time blocks & daily wins' },
    { type: 'office', label: 'Office Work Planner', desc: 'Outcomes & weekly matrix' },
  ];

  return (
    <aside className="space-y-6 print:hidden">
      {/* Latest Articles Widget with Thumbnails */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            Latest Articles
          </h3>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
            Practical Guides
          </span>
        </div>

        <div className="space-y-3.5">
          {articles.slice(0, 5).map((article) => (
            <div
              key={article.id}
              className="group cursor-pointer pb-3 border-b border-slate-100 last:border-b-0 last:pb-0 flex items-start gap-3"
              onClick={() => onSelectArticle(article.slug)}
            >
              {article.imageUrl && (
                <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-0.5">
                  <span className="font-semibold text-emerald-800 uppercase tracking-wider">
                    {article.category}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {article.readingTime}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition leading-snug line-clamp-2">
                  {article.title}
                </h4>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onSelectArticle(articles[0]?.slug || 'how-to-plan-your-week-in-15-minutes')}
          className="w-full mt-4 py-2 px-3 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition flex items-center justify-center gap-1.5"
        >
          Browse All Guides <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Popular Planner Types Quick Switch */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Popular Planner Types
        </h3>
        <div className="space-y-2">
          {popularTypes.map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => {
                onSelectPlannerType(item.type);
                const el = document.getElementById('planner-tool-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`w-full text-left p-2.5 rounded-xl border text-xs transition flex items-center justify-between ${
                activeType === item.type
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                  : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div>
                <div className="font-bold">{item.label}</div>
                <div className="text-[11px] text-slate-500 font-normal">{item.desc}</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* How to Keep a Plan Going Tips Box */}
      <div className="bg-linear-to-br from-emerald-50/70 via-teal-50/40 to-white border border-emerald-200/80 rounded-2xl p-5 shadow-2xs">
        <h3 className="font-bold text-sm text-emerald-950 flex items-center gap-2 mb-3">
          <HeartHandshake className="w-4 h-4 text-emerald-700" />
          How to Keep a Plan Going
        </h3>
        <ul className="space-y-2 text-xs text-slate-700 leading-relaxed mb-4">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
            <span>
              <strong>Look at it daily,</strong> even for one minute. That small habit keeps the plan alive.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
            <span>
              <strong>Celebrate small wins.</strong> Every checked box is real momentum.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
            <span>
              <strong>Adjust it every week</strong> instead of abandoning it. Life shifts, and your plan should too.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
            <span>
              <strong>Share a goal with a friend</strong> for gentle accountability.
            </span>
          </li>
        </ul>

        <div className="bg-white/90 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-950 shadow-2xs">
          <span className="font-bold block mb-1 text-emerald-900">A helpful question:</span>
          <em>"If this plan were half as hard, would I do it? If yes, make it half as hard."</em>
        </div>
      </div>
    </aside>
  );
};
