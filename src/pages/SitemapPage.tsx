import React from 'react';
import { Article } from '../types/article';
import { TOOLS_DATA } from '../data/toolsData';
import { PLANNER_CARDS } from '../components/PlannerTypeCards';
import { PlannerType } from '../types/planner';
import { Map, Calendar, BookOpen, ChevronRight, ArrowRight, Wrench, Shield, FileText } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 transition-colors duration-200 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
      {/* Breadcrumb */}
      <nav className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className={`cursor-pointer transition ${isDark ? 'hover:text-amber-300' : 'hover:text-amber-700'}`}
        >
          Home
        </button>
        <ChevronRight className={`w-3.5 h-3.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
        <span className={`font-semibold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>HTML Sitemap</span>
      </nav>

      {/* Header */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-200 ${
          isDark
            ? 'bg-[#0c101d] border-amber-500/25 shadow-xl'
            : 'bg-white border-slate-200/90 shadow-sm'
        }`}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-xs ${
                isDark
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              <Map className="w-6 h-6" />
            </div>
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              ToolCrest Website Sitemap
            </h1>
          </div>
          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Complete index of 35+ online tools, PDF manipulation engines, planners, published articles, and legal documents.
          </p>
        </div>
        <a
          href="/sitemap.xml"
          target="_blank"
          rel="noopener noreferrer"
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto transition shrink-0 border cursor-pointer ${
            isDark
              ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30'
              : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>View XML Sitemap (/sitemap.xml)</span>
        </a>
      </div>

      {/* Section 1: All Online Tools */}
      <div
        className={`rounded-3xl p-6 sm:p-8 space-y-4 border transition-colors duration-200 ${
          isDark
            ? 'bg-[#0c101d] border-amber-500/25 shadow-xl'
            : 'bg-white border-slate-200/90 shadow-sm'
        }`}
      >
        <h2 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <Wrench className="w-4 h-4 text-amber-500" />
          Online Tools & PDF Utilities ({TOOLS_DATA.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TOOLS_DATA.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => onNavigate(`/tools/${tool.slug}`)}
              className={`p-3 rounded-2xl text-left transition flex items-center justify-between group border cursor-pointer ${
                isDark
                  ? 'border-slate-800 bg-[#111827]/70 hover:border-amber-500/40 hover:bg-[#111827]'
                  : 'border-slate-100 bg-slate-50/50 hover:border-amber-300 hover:bg-amber-50/40'
              }`}
            >
              <div>
                <div className={`text-xs font-bold transition ${isDark ? 'text-slate-200 group-hover:text-amber-300' : 'text-slate-800 group-hover:text-amber-800'}`}>
                  {tool.name}
                </div>
                <div className={`text-[11px] line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{tool.shortDesc}</div>
              </div>
              <ArrowRight className={`w-3.5 h-3.5 shrink-0 ml-2 transition ${isDark ? 'text-slate-500 group-hover:text-amber-400' : 'text-slate-400 group-hover:text-amber-700'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Section 2: Planner Generator Tools */}
      <div
        className={`rounded-3xl p-6 sm:p-8 space-y-4 border transition-colors duration-200 ${
          isDark
            ? 'bg-[#0c101d] border-amber-500/25 shadow-xl'
            : 'bg-white border-slate-200/90 shadow-sm'
        }`}
      >
        <h2 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <Calendar className="w-4 h-4 text-amber-500" />
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
              className={`p-3 rounded-2xl text-left transition flex items-center justify-between group border cursor-pointer ${
                isDark
                  ? 'border-slate-800 bg-[#111827]/70 hover:border-amber-500/40 hover:bg-[#111827]'
                  : 'border-slate-100 bg-slate-50/50 hover:border-amber-300 hover:bg-amber-50/40'
              }`}
            >
              <div>
                <div className={`text-xs font-bold transition ${isDark ? 'text-slate-200 group-hover:text-amber-300' : 'text-slate-800 group-hover:text-amber-800'}`}>
                  {card.title}
                </div>
                <div className={`text-[11px] line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{card.desc}</div>
              </div>
              <ArrowRight className={`w-3.5 h-3.5 shrink-0 ml-2 transition ${isDark ? 'text-slate-500 group-hover:text-amber-400' : 'text-slate-400 group-hover:text-amber-700'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Section 3: Blog & Guides */}
      <div
        className={`rounded-3xl p-6 sm:p-8 space-y-4 border transition-colors duration-200 ${
          isDark
            ? 'bg-[#0c101d] border-amber-500/25 shadow-xl'
            : 'bg-white border-slate-200/90 shadow-sm'
        }`}
      >
        <h2 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <BookOpen className="w-4 h-4 text-amber-500" />
          Productivity & Planning Articles (/blog)
        </h2>
        <div className={`divide-y ${isDark ? 'divide-slate-800/80' : 'divide-slate-100'}`}>
          {articles.map((art) => (
            <div
              key={art.id}
              onClick={() => onSelectArticle(art.slug)}
              className={`py-3 cursor-pointer group flex items-center justify-between px-2 rounded-xl transition ${
                isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/70'
              }`}
            >
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider block mb-0.5 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                  {art.category}
                </span>
                <h3 className={`text-xs font-bold transition ${isDark ? 'text-slate-200 group-hover:text-amber-300' : 'text-slate-800 group-hover:text-amber-800'}`}>
                  {art.title}
                </h3>
                <p className={`text-[11px] font-mono mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>/blog/{art.slug}</p>
              </div>
              <span className={`text-xs font-medium shrink-0 ml-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {art.readingTime}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Legal & Policy Pages */}
      <div
        className={`rounded-3xl p-6 sm:p-8 space-y-4 border transition-colors duration-200 ${
          isDark
            ? 'bg-[#0c101d] border-amber-500/25 shadow-xl'
            : 'bg-white border-slate-200/90 shadow-sm'
        }`}
      >
        <h2 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <Shield className="w-4 h-4 text-amber-500" />
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
              className={`p-3 rounded-xl font-semibold text-left transition border cursor-pointer ${
                isDark
                  ? 'bg-[#111827]/70 hover:bg-[#111827] text-slate-200 hover:text-amber-300 border-slate-800 hover:border-amber-500/30'
                  : 'bg-slate-50 hover:bg-amber-50 hover:text-amber-800 border-slate-200 text-slate-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
