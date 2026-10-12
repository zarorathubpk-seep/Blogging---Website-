import React, { useState, useEffect, useMemo } from 'react';
import {
  TOOLS_DATA,
  CATEGORY_FILTERS,
  ToolItem,
  ToolCategory,
} from '../data/toolsData';
import { Article } from '../types/article';
import { resolveArticleImage } from '../utils/assets';
import { AppImage } from '../components/AppImage';
import {
  Search,
  Star,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Layers,
  Split,
  Minimize2,
  FileEdit,
  PenTool,
  RefreshCw,
  Image,
  FileImage,
  Scissors,
  Unlock,
  RotateCw,
  Trash2,
  FolderOutput,
  ArrowUpDown,
  Globe,
  ScanText,
  Stamp,
  Hash,
  Copy,
  GitCompare,
  EyeOff,
  FilePlus2,
  QrCode,
  ArrowLeftRight,
  Clock,
  CalendarDays,
  PiggyBank,
  Clock4,
  Briefcase,
  FolderGit2,
  GraduationCap,
  UtensilsCrossed,
  CheckCheck,
  Check,
  AlignLeft,
  Calculator,
  KeyRound,
  FileCode2,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onSelectTool: (slug: string) => void;
  articles: Article[];
}

// Icon mapper for tools
const TOOL_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Layers,
  Split,
  Minimize2,
  FileEdit,
  PenTool,
  RefreshCw,
  Image,
  FileImage,
  Scissors,
  Lock,
  Unlock,
  RotateCw,
  Trash2,
  FolderOutput,
  ArrowUpDown,
  Globe,
  ScanText,
  Stamp,
  Hash,
  Copy,
  GitCompare,
  Zap,
  EyeOff,
  FilePlus2,
  QrCode,
  ArrowLeftRight,
  Clock,
  CalendarDays,
  PiggyBank,
  Clock4,
  Briefcase,
  FolderGit2,
  GraduationCap,
  UtensilsCrossed,
  CheckCheck,
  AlignLeft,
  Calculator,
  KeyRound,
  FileCode2,
};

const FAVORITES_KEY = 'toolcrest_favorites_v1';

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectTool,
  articles,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'favorites'>('all');
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_KEY);
      return saved ? JSON.parse(saved) : ['merge-pdf', 'qr-generator', 'budget-planner'];
    } catch {
      return ['merge-pdf', 'qr-generator', 'budget-planner'];
    }
  });

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavoriteIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Filter tools based on category and search query
  const filteredTools = useMemo(() => {
    return TOOLS_DATA.filter((tool) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedCategory === 'favorites') {
        return favoriteIds.includes(tool.id);
      }
      if (selectedCategory === 'all') {
        return true;
      }
      return tool.category === selectedCategory;
    });
  }, [searchQuery, selectedCategory, favoriteIds]);

  const popularTools = useMemo(() => {
    return TOOLS_DATA.filter((t) => t.isPopular).slice(0, 6);
  }, []);

  const recentTools = useMemo(() => {
    return TOOLS_DATA.filter((t) => t.isRecent).slice(0, 4);
  }, []);

  const renderToolCard = (tool: ToolItem) => {
    const IconComponent = TOOL_ICON_MAP[tool.iconName] || Layers;
    const isFav = favoriteIds.includes(tool.id);

    return (
      <div
        key={tool.id}
        onClick={() => onSelectTool(tool.slug)}
        className="group relative bg-white border border-slate-200/90 hover:border-emerald-400 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-50 group-hover:bg-emerald-50 text-slate-700 group-hover:text-emerald-700 border border-slate-200/80 group-hover:border-emerald-200 flex items-center justify-center transition shadow-2xs">
              <IconComponent className="w-5 h-5 group-hover:scale-110 transition duration-300" />
            </div>

            <div className="flex items-center gap-1.5">
              {tool.badge && (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50/90 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {tool.badge}
                </span>
              )}
              <button
                type="button"
                onClick={(e) => toggleFavorite(e, tool.id)}
                className={`p-1.5 rounded-xl transition ${
                  isFav
                    ? 'text-amber-500 hover:text-amber-600 bg-amber-50'
                    : 'text-slate-300 hover:text-amber-400 hover:bg-slate-50'
                }`}
                title={isFav ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
              </button>
            </div>
          </div>

          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-emerald-800 transition leading-snug">
            {tool.name}
          </h3>

          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
            {tool.shortDesc}
          </p>
        </div>

        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-[11px] font-semibold text-slate-400 group-hover:text-slate-600">
            {tool.categoryLabel}
          </span>
          <span className="font-bold text-emerald-700 flex items-center gap-1 group-hover:translate-x-0.5 transition">
            Use Tool <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12 pb-16">
      {/* 1. HERO DISCOVERY SECTION */}
      <section className="pt-8 pb-10 sm:pt-12 sm:pb-14 border-b border-slate-200/80 bg-linear-to-b from-white via-slate-50/60 to-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-4">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>ToolCrest • 100% Free Online Tools & Document Suite</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            All Your Essential Online Tools in One Place
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Fast, private, and free browser-based tools for PDFs, QR codes, unit conversions, time zones, and daily productivity planners.
          </p>

          {/* Prominent Search Bar */}
          <div className="max-w-2xl mx-auto pt-2">
            <div className="relative flex items-center shadow-sm rounded-2xl bg-white border-2 border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition">
              <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a tool (e.g. Merge PDF, QR Generator, Budget Planner)..."
                className="w-full text-xs sm:text-sm text-slate-800 bg-transparent px-3 py-3.5 focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mr-3 text-xs text-slate-400 hover:text-slate-700 font-bold px-2 py-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap pt-3">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setSelectedCategory('favorites')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1 ${
                selectedCategory === 'favorites'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>Favorites ({favoriteIds.length})</span>
            </button>
          </div>

          {/* Privacy & Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-600 pt-3">
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Runs 100% in your browser
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <Lock className="w-4 h-4 text-emerald-600" />
              Zero server file uploads
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <Zap className="w-4 h-4 text-emerald-600" />
              No sign-up needed
            </span>
          </div>
        </div>
      </section>

      {/* 2. SEARCH / FILTER RESULTS OR POPULAR SECTIONS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* If user is actively searching or filtering specific category */}
        {searchQuery.trim() !== '' || selectedCategory !== 'all' ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  {selectedCategory === 'favorites'
                    ? 'Your Saved Favorite Tools'
                    : `Matching Tools (${filteredTools.length})`}
                </h2>
                <p className="text-xs text-slate-500">
                  {searchQuery ? `Search results for "${searchQuery}"` : 'Filtered collection'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                Reset Filters
              </button>
            </div>

            {filteredTools.length === 0 ? (
              <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-3">
                <p className="text-sm text-slate-600">
                  No tools found matching your current search criteria.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl"
                >
                  View All Tools
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTools.map(renderToolCard)}
              </div>
            )}
          </section>
        ) : (
          <>
            {/* POPULAR TOOLS SECTION */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    Popular Tools
                  </h2>
                  <p className="text-xs text-slate-500">
                    Most frequently used tools by professionals and students
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
                {popularTools.map(renderToolCard)}
              </div>
            </section>

            {/* RECENTLY ADDED TOOLS */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Zap className="w-5 h-5 text-emerald-600" />
                    Recently Added Tools
                  </h2>
                  <p className="text-xs text-slate-500">
                    New utilities and conversion engines added to ToolCrest
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentTools.map(renderToolCard)}
              </div>
            </section>

            {/* COMPLETE TOOLS DIRECTORY (All tools by category) */}
            <section className="space-y-6 pt-4">
              <div className="pb-3 border-b border-slate-200">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Explore Full Tools Directory
                </h2>
                <p className="text-xs text-slate-500">
                  Browse our complete suite of 24 PDF tools, converters, calculators, and planners
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTools.map(renderToolCard)}
              </div>
            </section>
          </>
        )}

        {/* 3. PRODUCTIVITY PLANNER HUB SPOTLIGHT BANNER */}
        <section className="bg-linear-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-lg overflow-hidden relative">
          <div className="max-w-2xl space-y-3 relative z-10">
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
              Full Productivity Suite
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Free Weekly & Budget Planner Generator
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Design weekly schedules, 50/30/20 budget ledgers in USD/GBP/EUR, project milestones, and habit trackers. Includes drag-and-drop reordering, progress tracking, and instant PDF/print export.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate('/planner')}
                className="px-5 py-2.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-xl shadow-xs transition flex items-center gap-2"
              >
                Open Planner Generator <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* 4. LATEST BLOG & TUTORIALS PREVIEW */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Latest Articles & Productivity Guides
              </h2>
              <p className="text-xs text-slate-500">
                In-depth tutorials on time management, budgeting, and tool workflows
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/blog')}
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              Browse All Blog Guides <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.slice(0, 3).map((article) => {
              const img = resolveArticleImage(article.slug, article.imageUrl);
              return (
                <div
                  key={article.id}
                  onClick={() => onNavigate(`/blog/${article.slug}`)}
                  className="bg-white border border-slate-200/90 hover:border-emerald-300 rounded-3xl overflow-hidden shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-full h-44 overflow-hidden bg-slate-100 relative">
                      <AppImage
                        src={img}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="font-bold text-[10px] text-emerald-950 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md uppercase tracking-wider shadow-2xs">
                          {article.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-emerald-700 transition leading-snug line-clamp-2 mb-2">
                        {article.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {article.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                    <span className="text-[11px] text-slate-400">By {article.author}</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition">
                      Read guide <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
