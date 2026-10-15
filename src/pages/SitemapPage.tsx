import React from 'react';
import { Article } from '../types/article';
import { TOOLS_DATA } from '../data/toolsData';
import { PLANNER_CARDS } from '../components/PlannerTypeCards';
import { PlannerType } from '../types/planner';
import { Map, Calendar, BookOpen, ChevronRight, ArrowRight, Wrench, Shield, FileText } from 'lucide-react';

interface SitemapPageProps {
  articles: Article[];
  onNavigate: (path: string) => void;
  onSelectPlannerType: (type: PlannerType) => void;
  onSelectArticle: (slug: string) => void;
}

export const SitemapPage: React.FC<SitemapPageProps> = ({
  articles,
  onNavigate,
  onSelectPlannerType,
  onSelectArticle,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="hover:text-emerald-700"
          >
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-semibold">HTML Sitemap</span>
        </nav>

        {/* Header */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                <Map className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                ToolCrest Website Sitemap
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Complete index of 35+ online tools, PDF manipulation engines, planners, published articles, and legal documents.
            </p>
          </div>
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-1.5 self-start sm:self-auto transition shrink-0"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>View XML Sitemap (/sitemap.xml)</span>
          </a>
        </div>

        {/* Section 1: All Online Tools */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-emerald-600" />
            Online Tools & PDF Utilities ({TOOLS_DATA.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TOOLS_DATA.map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => onNavigate(`/tools/${tool.slug}`)}
                className="p-3 rounded-2xl border border-slate-100 hover:border-emerald-300 hover:bg-slate-50/70 text-left transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                    {tool.name}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1">{tool.shortDesc}</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Planner Generator Tools */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            Productivity & Planner Generators (/planner)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PLANNER_CARDS.map((card) => (
              <button
                key={card.type}
                type="button"
                onClick={() => {
                  onSelectPlannerType(card.type);
                  onNavigate('/planner');
                }}
                className="p-3 rounded-2xl border border-slate-100 hover:border-emerald-300 hover:bg-slate-50/70 text-left transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                    {card.title}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1">{card.desc}</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Blog & Guides */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            Productivity & Planning Articles (/blog)
          </h2>
          <div className="divide-y divide-slate-100">
            {articles.map((art) => (
              <div
                key={art.id}
                onClick={() => onSelectArticle(art.slug)}
                className="py-3 cursor-pointer group flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-xl transition"
              >
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-0.5">
                    {art.category}
                  </span>
                  <h3 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                    {art.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">/blog/{art.slug}</p>
                </div>
                <span className="text-xs text-slate-400 font-medium shrink-0 ml-4">
                  {art.readingTime}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Legal & Policy Pages */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            Company & Transparency Documents
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            {[
              { label: 'Privacy Policy', path: '/privacy-policy' },
              { label: 'About Us', path: '/about-us' },
              { label: 'Contact Us', path: '/contact-us' },
              { label: 'Terms & Conditions', path: '/terms-and-conditions' },
              { label: 'Disclaimer', path: '/disclaimer' },
              { label: 'Cookie Policy', path: '/cookie-policy' },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => onNavigate(p.path)}
                className="p-3 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 rounded-xl font-semibold text-slate-700 text-left transition"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
