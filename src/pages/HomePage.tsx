import React, { useState, useMemo } from 'react';
import {
  TOOLS_DATA,
  CATEGORY_FILTERS,
  getPdfGroups,
  ToolItem,
  ToolCategory,
} from '../data/toolsData';
import { Article } from '../types/article';
import { resolveArticleImage } from '../utils/assets';
import { AppImage } from '../components/AppImage';
import { ToolCard } from '../components/tools/ToolCard';
import { useTheme } from '../context/ThemeContext';
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
  AlignLeft,
  Calculator,
  KeyRound,
  FileCode2,
  Wrench,
  LayoutGrid,
  Camera,
  Archive,
  Crop,
  CheckSquare,
  Languages,
  Table,
  Presentation,
  FileText,
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
  Wrench,
  LayoutGrid,
  Camera,
  Archive,
  Crop,
  CheckSquare,
  Languages,
  Table,
  Presentation,
  FileText,
};

const FAVORITES_KEY = 'toolcrest_favorites_v1';

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectTool,
  articles,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
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

  const [directoryFilter, setDirectoryFilter] = useState<string>('all');
  const [directoryPage, setDirectoryPage] = useState<number>(1);
  const DIRECTORY_PAGE_SIZE = 12;

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

  // Secondary sub-category filtering & pagination for the Full Tools Directory (Fixes Issues 1, 3, 7)
  const directoryFilteredTools = useMemo(() => {
    if (directoryFilter === 'all') return TOOLS_DATA;
    if (directoryFilter === 'pdf') return TOOLS_DATA.filter((t) => t.category === 'pdf');
    if (directoryFilter === 'productivity') {
      return TOOLS_DATA.filter((t) => t.category === 'productivity' || t.category === 'qr');
    }
    if (directoryFilter === 'finance') {
      return TOOLS_DATA.filter((t) => t.category === 'calculators' || t.category === 'converters');
    }
    return TOOLS_DATA.filter((t) => t.category === directoryFilter);
  }, [directoryFilter]);

  const totalDirectoryPages = Math.ceil(directoryFilteredTools.length / DIRECTORY_PAGE_SIZE);
  const paginatedDirectoryTools = useMemo(() => {
    const start = (directoryPage - 1) * DIRECTORY_PAGE_SIZE;
    return directoryFilteredTools.slice(start, start + DIRECTORY_PAGE_SIZE);
  }, [directoryFilteredTools, directoryPage]);

  const popularTools = useMemo(() => {
    return TOOLS_DATA.filter((t) => t.isPopular).slice(0, 6);
  }, []);

  const recentTools = useMemo(() => {
    return TOOLS_DATA.filter((t) => t.isRecent).slice(0, 4);
  }, []);

  const formatPdfGroupTitle = (title: string) => {
    const upper = title.toUpperCase();
    if (upper === 'ORGANIZE PDF') return 'Organize PDF';
    if (upper === 'OPTIMIZE PDF') return 'Optimize PDF';
    if (upper === 'CONVERT TO PDF') return 'Convert to PDF';
    if (upper === 'CONVERT FROM PDF') return 'Convert from PDF';
    if (upper === 'EDIT PDF') return 'Edit & Enhance PDF';
    if (upper === 'SECURITY') return 'Security & Protection';
    if (upper === 'AI & SCAN') return 'AI & Scanner Tools';
    return title;
  };

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
    <div
      className={`space-y-12 pb-16 transition-colors duration-200 ${
        isDark ? 'bg-[#090D16] text-slate-100' : 'bg-[#F8FAFC] text-slate-800'
      }`}
    >
      {/* 1. HERO DISCOVERY SECTION (Dynamic Light & Dark Palette) */}
      <section
        className={`pt-12 pb-16 sm:pt-20 sm:pb-20 border-b relative overflow-hidden transition-colors duration-200 ${
          isDark
            ? 'border-amber-500/20 bg-gradient-to-b from-[#050811] via-[#090D16] to-[#0D1220]'
            : 'border-amber-200/60 bg-gradient-to-b from-amber-50/80 via-slate-50 to-[#F8FAFC]'
        }`}
      >
        {/* Ambient Golden Corona Halos */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none">
          <div
            className={`absolute -top-24 left-1/4 w-[28rem] h-[28rem] rounded-full blur-3xl ${
              isDark ? 'bg-amber-500/10' : 'bg-amber-400/15'
            }`}
          />
          <div
            className={`absolute top-10 right-1/4 w-96 h-96 rounded-full blur-3xl ${
              isDark ? 'bg-yellow-500/8' : 'bg-yellow-400/15'
            }`}
          />
          <div
            className={`absolute top-32 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-2xl ${
              isDark ? 'bg-amber-600/10' : 'bg-amber-500/10'
            }`}
          />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          {/* Tagline Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black shadow-lg transition-all ${
              isDark
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300 shadow-amber-500/10'
                : 'bg-amber-100/90 border border-amber-300 text-amber-900 shadow-amber-500/10'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
            <span>TOOLCREST • 39+ High-Precision Client-Side Tools</span>
          </div>

          {/* Main Headline with Gold Gradient */}
          <h1
            className={`text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            All Your Essential Online Tools <br className="hidden sm:inline" />
            <span
              className={
                isDark
                  ? 'bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(245,158,11,0.25)]'
                  : 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 bg-clip-text text-transparent'
              }
            >
              In One Premium Platform
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className={`text-base sm:text-lg max-w-2xl mx-auto leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            Ultra-fast, private, and 100% free browser-based tools for PDFs, QR codes, file conversions, units, financial calculators, and daily planners. Zero cloud uploads.
          </p>

          {/* Prominent Golden Search Bar */}
          <div className="max-w-2xl mx-auto pt-2">
            <div
              className={`relative flex items-center rounded-2xl border-2 shadow-2xl transition-all ${
                isDark
                  ? 'bg-[#0c111e]/90 border-amber-500/30 focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-500/20'
                  : 'bg-white border-amber-400/50 focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/15 shadow-amber-500/5'
              }`}
            >
              <Search className="w-5 h-5 text-amber-500 ml-4 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools (e.g. Merge PDF, QR Generator, Unit Converter, Budget Planner)..."
                className={`w-full text-xs sm:text-sm bg-transparent px-3 py-3.5 focus:outline-hidden font-medium ${
                  isDark ? 'text-white placeholder:text-slate-400' : 'text-slate-900 placeholder:text-slate-500'
                }`}
              />
              <div className="mr-3 flex items-center gap-1.5">
                <kbd
                  className={`hidden sm:inline font-mono text-xs px-2 py-1 rounded-xl border font-bold ${
                    isDark
                      ? 'bg-[#070a12] text-amber-300 border-amber-500/30'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  ⌘K
                </kbd>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-amber-500 hover:text-amber-600 font-bold px-2.5 py-1 rounded-xl hover:bg-amber-500/10 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Category Filter Tabs with Dark & Golden Styling */}
          <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                    : isDark
                    ? 'bg-[#0e1424] border border-amber-500/20 text-slate-300 hover:text-amber-300 hover:border-amber-400/50 hover:bg-[#131b30]'
                    : 'bg-white border border-slate-200/90 text-slate-700 hover:text-amber-900 hover:border-amber-300 hover:bg-amber-50 shadow-2xs'
                }`}
              >
                {cat.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setSelectedCategory('favorites')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === 'favorites'
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                  : isDark
                  ? 'bg-[#0e1424] border border-amber-500/20 text-slate-300 hover:text-amber-300 hover:border-amber-400/50 hover:bg-[#131b30]'
                  : 'bg-white border border-slate-200/90 text-slate-700 hover:text-amber-900 hover:border-amber-300 hover:bg-amber-50 shadow-2xs'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Favorites ({favoriteIds.length})</span>
            </button>
          </div>

          {/* Privacy & Trust Indicators */}
          <div
            className={`flex flex-wrap items-center justify-center gap-3 text-xs font-medium pt-3 ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}
          >
            <span
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border shadow-sm ${
                isDark ? 'bg-[#0e1424]/90 border-amber-500/20' : 'bg-white/90 border-slate-200/90'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              100% In-Browser Execution
            </span>
            <span
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border shadow-sm ${
                isDark ? 'bg-[#0e1424]/90 border-amber-500/20' : 'bg-white/90 border-slate-200/90'
              }`}
            >
              <Lock className="w-4 h-4 text-amber-500" />
              Zero Cloud Uploads
            </span>
            <span
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border shadow-sm ${
                isDark ? 'bg-[#0e1424]/90 border-amber-500/20' : 'bg-white/90 border-slate-200/90'
              }`}
            >
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
            <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-amber-500/20' : 'border-slate-200'}`}>
              <div>
                <h2 className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {selectedCategory === 'favorites'
                    ? 'Your Saved Favorite Tools'
                    : `Matching Tools (${filteredTools.length})`}
                </h2>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {searchQuery ? `Search results for "${searchQuery}"` : 'Filtered collection'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className={`text-xs font-bold hover:underline cursor-pointer ${isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-700 hover:text-amber-900'}`}
              >
                Reset Filters
              </button>
            </div>

            {filteredTools.length === 0 ? (
              <div className={`p-12 text-center rounded-3xl space-y-3 ${isDark ? 'bg-[#0d1322] border border-amber-500/20' : 'bg-white border border-slate-200 shadow-sm'}`}>
                <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  No tools found matching your current search criteria.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="px-4 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-xl hover:brightness-110 cursor-pointer shadow-md shadow-amber-500/20"
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
            {/* TOP ESSENTIALS QUICK BAR (Light & Dark Mode Harmonized) */}
            <section
              className={`rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 justify-start transition-colors duration-200 ${
                isDark
                  ? 'bg-[#0c101d] border border-amber-500/25'
                  : 'bg-white border border-amber-200/80 shadow-md shadow-amber-500/5'
              }`}
            >
              <div className="flex items-center gap-3 shrink-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                    isDark
                      ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                      : 'bg-amber-100 border border-amber-300 text-amber-800'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2
                    className={`text-sm sm:text-base font-bold tracking-tight flex items-center gap-2 ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    <span>Quick Launch Essentials</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isDark
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      Top 4
                    </span>
                  </h2>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Direct one-click access to essential daily utilities
                  </p>
                </div>
              </div>

              {/* Tightly grouped tools with theme-aware styling */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                {[
                  { name: 'Merge PDF', slug: 'merge-pdf' },
                  { name: 'Split PDF', slug: 'split-pdf' },
                  { name: 'Compress PDF', slug: 'compress-pdf' },
                  { name: 'Weekly Planner', slug: 'weekly-planner' },
                ].map((item) => (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => {
                      if (item.slug === 'weekly-planner') {
                        onNavigate('/planner');
                      } else {
                        onSelectTool(item.slug);
                      }
                    }}
                    className={`px-3.5 py-2 rounded-xl transition-all font-semibold text-xs flex items-center gap-1.5 cursor-pointer group ${
                      isDark
                        ? 'bg-slate-900 border border-amber-500/30 hover:border-amber-400/60 hover:bg-slate-800 text-slate-200 hover:text-amber-300 shadow-xs'
                        : 'bg-slate-50 border border-slate-200/90 hover:border-amber-400/80 hover:bg-amber-50/80 text-slate-700 hover:text-amber-900 shadow-2xs'
                    }`}
                  >
                    <span>{item.name}</span>
                    <ArrowRight className={`w-3 h-3 group-hover:translate-x-0.5 transition-transform ${isDark ? 'text-amber-400/70 group-hover:text-amber-400' : 'text-amber-700 group-hover:text-amber-900'}`} />
                  </button>
                ))}
              </div>
            </section>

            {/* ALL PDF TOOLS SUITE: Breathable 3/4-Column Workflow Cards (Light & Dark Harmony) */}
            <section id="pdf-tools" className="space-y-6 pt-2 pb-2">
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${isDark ? 'border-amber-500/20' : 'border-slate-200'}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
                    <span className={`text-xs font-bold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                      Complete Document Workflow Suite
                    </span>
                  </div>
                  <h2 className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <FileText className={`w-6 h-6 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                    <span>Complete PDF Tools Suite</span>
                  </h2>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    33 high-precision in-browser utilities organized into 7 distinct visual workflow cards.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-xs ${isDark ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' : 'bg-amber-100/80 text-amber-900 border-amber-300'}`}>
                    100% Client-Side Processing
                  </span>
                </div>
              </div>

              {/* Breathable 3/4-Column Layout with Generous Whitespace */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {getPdfGroups().map((group) => {
                  const GroupIcon = TOOL_ICON_MAP[group.iconName] || Layers;
                  return (
                    <div
                      key={group.id}
                      className={`rounded-2xl p-5 sm:p-6 border shadow-xl flex flex-col justify-between transition-all space-y-4 h-full ${
                        isDark
                          ? 'bg-[#0c101d] border-amber-500/25 hover:border-amber-400/50'
                          : 'bg-white border-slate-200/90 hover:border-amber-400/80 hover:shadow-md'
                      }`}
                    >
                      <div className="flex-1 flex flex-col">
                        {/* Workflow Card Header with Distinct Tool Count Metadata */}
                        <div className={`flex items-center justify-between pb-3.5 border-b mb-3.5 ${isDark ? 'border-amber-500/15' : 'border-slate-100'}`}>
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-xs ${isDark ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400' : 'bg-amber-100 border border-amber-300 text-amber-800'}`}>
                              <GroupIcon className="w-4 h-4" />
                            </div>
                            <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {formatPdfGroupTitle(group.title)}
                            </h3>
                          </div>
                          {/* Differentiated metadata styling */}
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${isDark ? 'bg-slate-900 border-slate-700/60 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                            {group.tools.length} Tools
                          </span>
                        </div>

                        {/* Generous Vertical Spacing Between List Items */}
                        <ul className="space-y-2.5 flex-1">
                          {group.tools.map((tool) => {
                            const Icon = TOOL_ICON_MAP[tool.iconName] || Layers;
                            return (
                              <li key={tool.id}>
                                <button
                                  type="button"
                                  onClick={() => onSelectTool(tool.slug)}
                                  className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between text-xs font-semibold transition group cursor-pointer border border-transparent ${
                                    isDark
                                      ? 'text-slate-200 hover:text-amber-300 hover:bg-amber-500/10 hover:border-amber-500/20'
                                      : 'text-slate-700 hover:text-amber-900 hover:bg-amber-50/80 hover:border-amber-200'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0 pr-1">
                                    <Icon className={`w-3.5 h-3.5 shrink-0 transition-colors ${isDark ? 'text-amber-400/80 group-hover:text-amber-400' : 'text-amber-600 group-hover:text-amber-800'}`} />
                                    <span className="whitespace-normal leading-snug break-words">
                                      {tool.name}
                                    </span>
                                  </div>
                                  {/* Semantic Color Badges */}
                                  {tool.badge && (
                                    <span
                                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ml-2 shadow-xs border ${
                                        tool.badge.toLowerCase() === 'new'
                                          ? isDark
                                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                                            : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                          : tool.badge.toLowerCase() === 'popular'
                                          ? isDark
                                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                            : 'bg-amber-100 text-amber-800 border-amber-200'
                                          : isDark
                                          ? 'bg-sky-500/15 text-sky-300 border-sky-500/40'
                                          : 'bg-sky-100 text-sky-800 border-sky-200'
                                      }`}
                                    >
                                      {tool.badge}
                                    </span>
                                  )}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* UNIFIED FULL TOOLS DIRECTORY (Light & Dark Harmony) */}
            <section id="directory" className="space-y-6 pt-4">
              <div className={`flex flex-col gap-3.5 pb-4 border-b ${isDark ? 'border-amber-500/20' : 'border-slate-200'}`}>
                <div>
                  <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Explore Full Tools Directory
                  </h2>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Browse our complete suite of {TOOLS_DATA.length} PDF tools, converters, financial calculators, and planners
                  </p>
                </div>

                {/* Sub-Category Jump Filters */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {[
                    { id: 'all', label: `All (${TOOLS_DATA.length})` },
                    { id: 'pdf', label: `PDF Suite (${TOOLS_DATA.filter((t) => t.category === 'pdf').length})` },
                    { id: 'productivity', label: `Productivity (${TOOLS_DATA.filter((t) => t.category === 'productivity' || t.category === 'qr').length})` },
                    { id: 'finance', label: `Finance & Unit (${TOOLS_DATA.filter((t) => t.category === 'calculators' || t.category === 'converters').length})` },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => {
                        setDirectoryFilter(sub.id);
                        setDirectoryPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        directoryFilter === sub.id
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold shadow-xs'
                          : isDark
                          ? 'bg-[#0c101d] text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/20'
                          : 'bg-white text-slate-700 hover:text-amber-900 hover:bg-amber-50/80 border border-slate-200/90 shadow-2xs'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Paginated Grid of Directory Tools */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {paginatedDirectoryTools.map(renderToolCard)}
              </div>

              {/* Pagination & Jump Navigation Bar */}
              <div className={`pt-6 border-t flex flex-col sm:flex-row items-center justify-center gap-4 text-xs ${isDark ? 'border-amber-500/15' : 'border-slate-200'}`}>
                <div
                  className={`inline-flex flex-wrap items-center justify-center gap-4 px-5 py-2.5 rounded-2xl border shadow-xl ${
                    isDark ? 'bg-[#0c101d] border-amber-500/25' : 'bg-white border-slate-200/90 shadow-sm'
                  }`}
                >
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                    {directoryFilteredTools.length === 0 ? (
                      <span>No tools currently available in this category</span>
                    ) : (
                      <>
                        Showing{' '}
                        <strong className={isDark ? 'text-white' : 'text-slate-900'}>
                          {(directoryPage - 1) * DIRECTORY_PAGE_SIZE + 1}
                          –
                          {Math.min(
                            directoryFilteredTools.length,
                            directoryPage * DIRECTORY_PAGE_SIZE
                          )}
                        </strong>{' '}
                        of <strong className={isDark ? 'text-amber-300' : 'text-amber-700 font-extrabold'}>{directoryFilteredTools.length}</strong> tools
                      </>
                    )}
                  </span>

                  <div className={`hidden sm:block h-4 w-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={directoryPage === 1}
                      onClick={() => {
                        setDirectoryPage((prev) => Math.max(1, prev - 1));
                      }}
                      className={`px-3 py-1.5 rounded-xl border disabled:opacity-40 disabled:pointer-events-none transition font-semibold cursor-pointer ${
                        isDark
                          ? 'bg-slate-900 hover:bg-amber-500/10 border-amber-500/25 text-slate-300 hover:text-amber-300'
                          : 'bg-slate-50 hover:bg-amber-50/80 border-slate-200 text-slate-700 hover:text-amber-900 shadow-2xs'
                      }`}
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalDirectoryPages }, (_, i) => i + 1).map((pg) => (
                        <button
                          key={pg}
                          type="button"
                          onClick={() => setDirectoryPage(pg)}
                          className={`w-7 h-7 rounded-lg font-bold transition cursor-pointer flex items-center justify-center text-xs ${
                            directoryPage === pg
                              ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-xs'
                              : isDark
                              ? 'bg-slate-900 text-slate-400 hover:text-amber-300 hover:bg-slate-800 border border-amber-500/20'
                              : 'bg-slate-100 text-slate-600 hover:text-amber-900 hover:bg-amber-50 border border-slate-200'
                          }`}
                        >
                          {pg}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={directoryPage >= totalDirectoryPages}
                      onClick={() => {
                        setDirectoryPage((prev) => Math.min(totalDirectoryPages, prev + 1));
                      }}
                      className={`px-3 py-1.5 rounded-xl border disabled:opacity-40 disabled:pointer-events-none transition font-semibold cursor-pointer ${
                        isDark
                          ? 'bg-slate-900 hover:bg-amber-500/10 border-amber-500/25 text-slate-300 hover:text-amber-300'
                          : 'bg-slate-50 hover:bg-amber-50/80 border-slate-200 text-slate-700 hover:text-amber-900 shadow-2xs'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* 3. PRODUCTIVITY PLANNER HUB SPOTLIGHT BANNER */}
        <section
          className={`rounded-2xl p-6 sm:p-10 shadow-2xl overflow-hidden relative border transition-colors duration-200 ${
            isDark
              ? 'bg-gradient-to-br from-[#0c101d] via-[#141b30] to-[#080b14] border-amber-500/30 text-white'
              : 'bg-gradient-to-br from-amber-500/15 via-amber-100/70 to-yellow-50 border-amber-300/80 text-slate-900 shadow-lg shadow-amber-500/5'
          }`}
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-yellow-500/8 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl space-y-3.5 relative z-10">
            <span
              className={`text-xs font-bold px-3.5 py-1 rounded-full border shadow-2xs ${
                isDark
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}
            >
              Full Productivity Suite
            </span>
            <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Free Weekly &amp; Budget Planner Generator
            </h2>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Design weekly schedules, 50/30/20 budget ledgers in USD/GBP/EUR, project milestones, and habit trackers. Includes drag-and-drop reordering, progress tracking, and instant PDF/print export.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate('/planner')}
                className="px-5 py-2.5 text-xs font-black bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
              >
                Open Planner Generator <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </section>

        {/* 4. LATEST BLOG & TUTORIALS PREVIEW */}
        <section className="space-y-4">
          <div className={`flex items-center justify-between pb-2 border-b ${isDark ? 'border-amber-500/20' : 'border-slate-200'}`}>
            <div>
              <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Latest Articles & Productivity Guides
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                In-depth tutorials on time management, budgeting, and tool workflows
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/blog')}
              className={`text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer ${
                isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-700 hover:text-amber-900'
              }`}
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
                  className={`border rounded-2xl overflow-hidden shadow-lg transition cursor-pointer flex flex-col justify-between group ${
                    isDark
                      ? 'bg-[#0d1322] border-amber-500/20 hover:border-amber-400/60 hover:shadow-amber-500/10'
                      : 'bg-white border-slate-200/90 hover:border-amber-400/80 shadow-xs hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="w-full h-44 overflow-hidden bg-slate-950 relative">
                      <AppImage
                        src={img}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span
                          className={`font-semibold text-xs px-2.5 py-1 rounded-full tracking-normal border shadow-xs ${
                            isDark
                              ? 'text-amber-300 bg-slate-950/90 backdrop-blur-xs border-amber-500/30'
                              : 'text-amber-900 bg-white/95 backdrop-blur-xs border-amber-300'
                          }`}
                        >
                          {article.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3
                        className={`font-bold text-sm sm:text-base leading-snug line-clamp-2 mb-2 transition ${
                          isDark ? 'text-white group-hover:text-amber-300' : 'text-slate-900 group-hover:text-amber-800'
                        }`}
                      >
                        {article.title}
                      </h3>
                      <p className={`text-xs line-clamp-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {article.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className={`px-5 pb-5 pt-2 flex items-center justify-between text-xs border-t ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                    <span className="text-xs">By {article.author}</span>
                    <span className={`font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
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
