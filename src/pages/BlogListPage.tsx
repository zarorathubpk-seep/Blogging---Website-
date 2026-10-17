import React, { useState } from 'react';
import { Article } from '../types/article';
import { SUGGESTED_NEXT_ARTICLES } from '../data/defaultArticles';
import { AuthorBox } from '../components/AuthorBox';
import { AppImage } from '../components/AppImage';
import { resolveArticleImage } from '../utils/assets';
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
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="hover:text-amber-300 transition cursor-pointer"
          >
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-amber-500/40" />
          <span className="text-amber-300 font-bold">Blog & Guides</span>
        </nav>

        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-300 text-xs font-bold shadow-xs">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Practical Productivity & Routine Guides</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            ToolCrest Knowledge Center & <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">Guides</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Straightforward guides to help you organize your week, your work, and your money. Written in plain, friendly English for readers in the United States and the United Kingdom.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="bg-[#0c101d] border border-amber-500/25 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by title, topic, or keyword..."
                className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-[#070a14] border border-amber-500/30 text-white rounded-xl focus:outline-hidden focus:border-amber-400 placeholder:text-slate-500"
              />
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-amber-300 hover:text-amber-200 shrink-0 font-bold cursor-pointer"
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                    : 'bg-[#070a14] text-slate-300 border border-amber-500/20 hover:border-amber-400/50 hover:text-amber-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid with Visual Thumbnails */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((article) => {
            const resolvedImg = resolveArticleImage(article.slug, article.imageUrl);
            return (
              <article
                key={article.id}
                onClick={() => onSelectArticle(article.slug)}
                className="bg-[#0c101d] border border-amber-500/25 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-amber-400/60 transition duration-300 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Article Image Banner */}
                  <div className="w-full h-44 overflow-hidden bg-slate-900 relative">
                    <AppImage
                      src={resolvedImg}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="font-black text-[10px] text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-500 px-2.5 py-1 rounded-md uppercase tracking-wider shadow-md">
                        {article.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="flex items-center gap-1 text-[11px] text-amber-300/80">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        {article.readingTime}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        {article.publishedAt}
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-white group-hover:text-amber-300 transition leading-snug mb-2">
                      {article.title}
                    </h2>

                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                      {article.subtitle}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 flex items-center justify-between text-xs border-t border-amber-500/15">
                  <span className="text-slate-400 text-[11px]">By {article.author}</span>
                  <span className="text-amber-300 font-bold group-hover:translate-x-1 transition flex items-center gap-1">
                    Read guide <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-[#0c101d] rounded-2xl border border-amber-500/25">
            <p className="text-slate-400 text-sm">No articles match your search criteria.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-3 text-xs font-bold text-amber-400 hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* Suggested Next Articles (Part 4) */}
        <div className="bg-[#0c101d] border border-amber-500/25 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-extrabold text-base text-white">
                Suggested Next Articles & Coming Topics
              </h3>
              <p className="text-xs text-slate-400">
                Topics currently being prepared by the editorial desk
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {SUGGESTED_NEXT_ARTICLES.map((sug) => (
              <div
                key={sug.title}
                className="border border-amber-500/20 rounded-xl p-3.5 bg-[#070a14] hover:border-amber-400/40 transition"
              >
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  {sug.tag}
                </span>
                <h4 className="text-xs font-bold text-amber-100 mb-1">{sug.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{sug.desc}</p>
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
