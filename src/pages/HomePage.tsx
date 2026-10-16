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
import { ToolCard } from '../components/tools/ToolCard';
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
    return (
      <ToolCard
        key={tool.id}
        tool={tool}
        onSelect={onSelectTool}
        isFavorite={favoriteIds.includes(tool.id)}
        onToggleFavorite={toggleFavorite}
      />
    );
  };

  return (
    <div className="space-y-12 pb-16">
      {/* 1. HERO DISCOVERY SECTION */}
      <section className="pt-10 pb-12 sm:pt-16 sm:pb-16 border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50/70 to-slate-100/50 relative overflow-hidden">
        {/* Subtle decorative background gradient glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-10 right-1/4 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-28 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-400/10 rounded-full blur-2xl"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-5 relative z-10">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/90 text-blue-900 text-xs font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
            <span>ToolCrest • 39+ Free High-Precision Browser Tools</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            All Your Essential Online Tools <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              In One Premium Platform
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Fast, private, and 100% free browser-based tools for PDFs, QR codes, image conversions, units, time zones, and daily productivity planners. Zero server uploads.
          </p>

          {/* Prominent Search Bar */}
          <div className="max-w-2xl mx-auto pt-2">
            <div className="relative flex items-center shadow-xs rounded-2xl bg-white border-2 border-slate-200 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-500/15 transition-all">
              <Search className="w-5 h-5 text-blue-600 ml-4 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools (e.g. Merge PDF, QR Generator, Unit Converter, Budget Planner)..."
                className="w-full text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-transparent px-3 py-3.5 focus:outline-hidden font-medium"
              />
              <div className="mr-3 flex items-center gap-1.5">
                <kbd className="hidden sm:inline font-mono text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-md border border-slate-200 font-bold">
                  ⌘K
                </kbd>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-slate-400 hover:text-slate-800 font-bold px-2 py-1 rounded-md hover:bg-slate-100"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap pt-2">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs font-bold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setSelectedCategory('favorites')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
                selectedCategory === 'favorites'
                  ? 'bg-amber-500 text-white shadow-xs font-bold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>Favorites ({favoriteIds.length})</span>
            </button>
          </div>

          {/* Privacy & Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-slate-600 pt-3">
            <span className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200/90 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-cyan-600" />
              100% In-Browser Execution
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200/90 shadow-2xs">
              <Lock className="w-4 h-4 text-blue-600" />
              Zero Cloud Uploads
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200/90 shadow-2xs">
              <Zap className="w-4 h-4 text-amber-500" />
              Free Forever (No Sign-up)
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
                  Browse our complete suite of 35+ PDF tools, converters, financial calculators, and planners
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTools.map(renderToolCard)}
              </div>
            </section>
          </>
        )}

        {/* 3. PRODUCTIVITY PLANNER HUB SPOTLIGHT BANNER */}
        <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl overflow-hidden relative border border-slate-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-2xl space-y-3.5 relative z-10">
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-blue-500/20 text-cyan-300 border border-blue-500/30 px-3 py-1 rounded-full">
              Full Productivity Suite
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Free Weekly & Budget Planner Generator
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Design weekly schedules, 50/30/20 budget ledgers in USD/GBP/EUR, project milestones, and habit trackers. Includes drag-and-drop reordering, progress tracking, and instant PDF/print export.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate('/planner')}
                className="px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-md transition flex items-center gap-2"
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
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
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
                  className="bg-white border border-slate-200/90 hover:border-blue-400 rounded-3xl overflow-hidden shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-full h-44 overflow-hidden bg-slate-100 relative">
                      <AppImage
                        src={img}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="font-bold text-[10px] text-blue-900 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md uppercase tracking-wider shadow-2xs border border-blue-100">
                          {article.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition leading-snug line-clamp-2 mb-2">
                        {article.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {article.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                    <span className="text-[11px] text-slate-400">By {article.author}</span>
                    <span className="text-blue-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition">
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
