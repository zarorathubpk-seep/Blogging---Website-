import React, { useState } from 'react';
import { Article } from '../types/article';
import { SUGGESTED_NEXT_ARTICLES } from '../data/defaultArticles';
import { AuthorBox } from '../components/AuthorBox';
import { AppImage } from '../components/AppImage';
import { resolveArticleImage } from '../utils/assets';
import { BookOpen, Clock, Calendar, ArrowRight, Sparkles, Search, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
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
    <div className={`min-h-screen py-10 transition-colors duration-200 ${isDark ? 'bg-[#0B0F19] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb */}
        <nav className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className={`transition cursor-pointer ${isDark ? 'hover:text-amber-300' : 'hover:text-amber-700'}`}
          >
            Home
          </button>
          <ChevronRight className={`w-3.5 h-3.5 ${isDark ? 'text-amber-500/40' : 'text-slate-400'}`} />
          <span className={`font-bold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>Blog & Guides</span>
        </nav>

        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div
            className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold shadow-xs border ${
              isDark
                ? 'bg-amber-500/15 border-amber-500/35 text-amber-300'
                : 'bg-amber-100 border-amber-300 text-amber-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            <span>Practical Productivity & Routine Guides</span>
          </div>
          <h1 className={`text-3xl sm:text-5xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            ToolCrest Knowledge Center &{' '}
            <span
              className={
                isDark
                  ? 'bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 bg-clip-text text-transparent'
              }
            >
              Guides
            </span>
          </h1>
          <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Straightforward guides to help you organize your week, your work, and your money. Written in plain, friendly English for readers in the United States and the United Kingdom.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div
          className={`rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 border ${
            isDark ? 'bg-[#0c101d] border-amber-500/25' : 'bg-white border-slate-200/90 shadow-sm'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by title, topic, or keyword..."
                className={`w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm rounded-xl focus:outline-hidden border ${
                  isDark
                    ? 'bg-[#070a14] border-amber-500/30 text-white placeholder:text-slate-500 focus:border-amber-400'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 shadow-xs'
                }`}
              />
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className={`text-xs shrink-0 font-bold cursor-pointer ${
                  isDark ? 'text-amber-300 hover:text-amber-200' : 'text-amber-700 hover:text-amber-900'
                }`}
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
                    : isDark
                    ? 'bg-[#070a14] text-slate-300 border border-amber-500/20 hover:border-amber-400/50 hover:text-amber-200'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-amber-300 hover:bg-amber-50'
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
                className={`border rounded-2xl overflow-hidden transition duration-300 cursor-pointer flex flex-col justify-between group ${
                  isDark
                    ? 'bg-[#0c101d] border-amber-500/25 hover:border-amber-400/60 shadow-xl hover:shadow-2xl'
                    : 'bg-white border-slate-200/90 hover:border-amber-400/80 shadow-sm hover:shadow-md'
                }`}
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
                    <div className={`flex items-center justify-between text-xs mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <span className={`flex items-center gap-1 text-[11px] ${isDark ? 'text-amber-300/80' : 'text-amber-800'}`}>
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        {article.readingTime}
                      </span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        {article.publishedAt}
                      </span>
                    </div>

                    <h2
                      className={`text-base font-bold transition leading-snug mb-2 ${
                        isDark ? 'text-white group-hover:text-amber-300' : 'text-slate-900 group-hover:text-amber-800'
                      }`}
                    >
                      {article.title}
                    </h2>

                    <p className={`text-xs leading-relaxed line-clamp-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {article.subtitle}
                    </p>
                  </div>
                </div>

                <div className={`px-5 pb-5 pt-3 flex items-center justify-between text-xs border-t ${isDark ? 'border-amber-500/15' : 'border-slate-100'}`}>
                  <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>By {article.author}</span>
                  <span className={`font-bold group-hover:translate-x-1 transition flex items-center gap-1 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                    Read guide <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className={`text-center py-12 rounded-2xl border ${isDark ? 'bg-[#0c101d] border-amber-500/25' : 'bg-white border-slate-200'}`}>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>No articles match your search criteria.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className={`mt-3 text-xs font-bold hover:underline cursor-pointer ${isDark ? 'text-amber-400' : 'text-amber-700'}`}
            >
              Reset filters
            </button>
          </div>
        )}

        {/* Suggested Next Articles */}
        <div
          className={`border rounded-2xl p-6 shadow-2xl space-y-4 ${
            isDark ? 'bg-[#0c101d] border-amber-500/25' : 'bg-white border-slate-200/90 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className={`font-extrabold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Suggested Next Articles & Coming Topics
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Topics currently being prepared by the editorial desk
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {SUGGESTED_NEXT_ARTICLES.map((sug) => (
              <div
                key={sug.title}
                className={`border rounded-xl p-3.5 transition ${
                  isDark
                    ? 'border-amber-500/20 bg-[#070a14] hover:border-amber-400/40'
                    : 'border-slate-200 bg-slate-50/70 hover:border-amber-300 hover:bg-amber-50/30'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                  {sug.tag}
                </span>
                <h4 className={`text-xs font-bold mb-1 ${isDark ? 'text-amber-100' : 'text-slate-900'}`}>{sug.title}</h4>
                <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{sug.desc}</p>
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
