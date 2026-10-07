import React, { useState } from 'react';
import { Article } from '../types/article';
import { SUGGESTED_NEXT_ARTICLES } from '../data/defaultArticles';
import { AuthorBox } from '../components/AuthorBox';
import { BookOpen, Clock, Calendar, ArrowRight, Sparkles, Search, ChevronRight } from 'lucide-react';

interface BlogListPageProps {
  articles: Article[];
  onSelectArticle: (slug: string) => void;
  onNavigate: (path: string) => void;
}

export const BlogListPage: React.FC<BlogListPageProps> = ({
  articles,
  onSelectArticle,
  onNavigate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    'All',
    'Weekly Planning',
    'Planning Systems',
    'Money & Budget',
    'Work & Productivity',
    'Mindset & Habits',
  ];

  const filtered = articles.filter((art) => {
    const matchesCat = selectedCategory === 'All' || art.category === selectedCategory;
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500">
          <button
            type="button"
            onClick={() => onNavigate('/planner')}
            className="hover:text-emerald-700"
          >
            Home / Planner
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-semibold">Blog & Guides</span>
        </nav>

        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-800 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Practical Productivity & Routine Guides</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Zarorat Hub Planner Blog
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Straightforward guides to help you organize your week, your work, and your money. Written in plain, friendly English for readers in the United States and the United Kingdom.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by title, topic, or keyword..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-500 hover:text-slate-800 shrink-0 font-medium"
              >
                Clear Search
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid with Visual Thumbnails */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((article) => (
            <article
              key={article.id}
              onClick={() => onSelectArticle(article.slug)}
              className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md hover:border-emerald-300 transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Article Image Banner */}
                {article.imageUrl && (
                  <div className="w-full h-44 overflow-hidden bg-slate-100 relative">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-103 transition duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="font-bold text-[10px] text-emerald-950 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md uppercase tracking-wider shadow-2xs">
                        {article.category}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3.5 h-3.5" />
                      {article.readingTime}
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3.5 h-3.5" />
                      {article.publishedAt}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition leading-snug mb-2">
                    {article.title}
                  </h2>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {article.subtitle}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                <span className="text-slate-400 text-[11px]">By {article.author}</span>
                <span className="text-emerald-700 font-bold group-hover:translate-x-0.5 transition flex items-center gap-1">
                  Read guide <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 text-sm">No articles match your search criteria.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-3 text-xs font-bold text-emerald-600 hover:underline"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* Suggested Next Articles (Part 4) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Suggested Next Articles & Coming Topics
              </h3>
              <p className="text-xs text-slate-500">
                Topics currently being prepared by the editorial desk
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {SUGGESTED_NEXT_ARTICLES.map((sug) => (
              <div
                key={sug.title}
                className="border border-slate-200/80 rounded-xl p-3.5 bg-slate-50/50 hover:bg-slate-50 transition"
              >
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  {sug.tag}
                </span>
                <h4 className="text-xs font-bold text-slate-800 mb-1">{sug.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">{sug.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Author Box */}
        <AuthorBox />
      </div>
    </div>
  );
};
