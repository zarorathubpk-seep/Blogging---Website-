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

  // Secondary sub-category filtering & pagination for the Full Tools Directory (Issue 5)
  const directoryFilteredTools = useMemo(() => {
    if (directoryFilter === 'all') return TOOLS_DATA;
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
    <div className="space-y-12 pb-16 bg-[#090D16] text-slate-100">
      {/* 1. HERO DISCOVERY SECTION (Dark Obsidian & Regal Gold) */}
      <section className="pt-12 pb-16 sm:pt-20 sm:pb-20 border-b border-amber-500/20 bg-gradient-to-b from-[#050811] via-[#090D16] to-[#0D1220] relative overflow-hidden">
        {/* Ambient Golden Corona Halos */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 left-1/4 w-[28rem] h-[28rem] bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-10 right-1/4 w-96 h-96 bg-yellow-500/8 rounded-full blur-3xl"></div>
          <div className="absolute top-32 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-600/10 rounded-full blur-2xl"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black shadow-lg shadow-amber-500/10">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]"></span>
            <span>TOOLCREST • 39+ High-Precision Client-Side Tools</span>
          </div>

          {/* Main Headline with Gold Gradient */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            All Your Essential Online Tools <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(245,158,11,0.25)]">
              In One Premium Platform
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Ultra-fast, private, and 100% free browser-based tools for PDFs, QR codes, file conversions, units, financial calculators, and daily planners. Zero cloud uploads.
          </p>

          {/* Prominent Golden & Obsidian Search Bar */}
          <div className="max-w-2xl mx-auto pt-2">
            <div className="relative flex items-center rounded-2xl bg-[#0c111e]/90 border-2 border-amber-500/30 focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-500/20 shadow-2xl transition-all">
              <Search className="w-5 h-5 text-amber-400 ml-4 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools (e.g. Merge PDF, QR Generator, Unit Converter, Budget Planner)..."
                className="w-full text-xs sm:text-sm text-white placeholder:text-slate-400 bg-transparent px-3 py-3.5 focus:outline-hidden font-medium"
              />
              <div className="mr-3 flex items-center gap-1.5">
                <kbd className="hidden sm:inline font-mono text-xs bg-[#070a12] text-amber-300 px-2 py-1 rounded-md border border-amber-500/30 font-bold">
                  ⌘K
                </kbd>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-amber-400 hover:text-amber-200 font-bold px-2 py-1 rounded-md hover:bg-slate-800"
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
                    : 'bg-[#0e1424] border border-amber-500/20 text-slate-300 hover:text-amber-300 hover:border-amber-400/50 hover:bg-[#131b30]'
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
                  : 'bg-[#0e1424] border border-amber-500/20 text-slate-300 hover:text-amber-300 hover:border-amber-400/50 hover:bg-[#131b30]'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Favorites ({favoriteIds.length})</span>
            </button>
          </div>

          {/* Privacy & Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-slate-300 pt-3">
            <span className="flex items-center gap-1.5 bg-[#0e1424]/90 px-3.5 py-1.5 rounded-xl border border-amber-500/20 shadow-md">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              100% In-Browser Execution
            </span>
            <span className="flex items-center gap-1.5 bg-[#0e1424]/90 px-3.5 py-1.5 rounded-xl border border-amber-500/20 shadow-md">
              <Lock className="w-4 h-4 text-amber-400" />
              Zero Cloud Uploads
            </span>
            <span className="flex items-center gap-1.5 bg-[#0e1424]/90 px-3.5 py-1.5 rounded-xl border border-amber-500/20 shadow-md">
              <Zap className="w-4 h-4 text-amber-400" />
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
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
              <div>
                <h2 className="text-xl font-extrabold text-white">
                  {selectedCategory === 'favorites'
                    ? 'Your Saved Favorite Tools'
                    : `Matching Tools (${filteredTools.length})`}
                </h2>
                <p className="text-xs text-slate-400">
                  {searchQuery ? `Search results for "${searchQuery}"` : 'Filtered collection'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            </div>

            {filteredTools.length === 0 ? (
              <div className="p-12 text-center bg-[#0d1322] border border-amber-500/20 rounded-3xl space-y-3">
                <p className="text-sm text-slate-300">
                  No tools found matching your current search criteria.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="px-4 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-xl hover:brightness-110 cursor-pointer"
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
            {/* POPULAR TOOLS SECTION (Dark & Gold) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span>Popular Tools</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Most frequently used tools by professionals and students
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
                {popularTools.map(renderToolCard)}
              </div>
            </section>

            {/* ALL PDF TOOLS SUITE: Visual Card-Based Grid Layout (Issue 4, 9, 10-22, 25 Fixed) */}
            <section id="pdf-tools" className="space-y-6 pt-2 pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amber-500/20">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
                    <span className="text-xs font-bold text-amber-400">
                      All-in-One Document Workstation
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
                    <FileText className="w-6 h-6 text-amber-400" />
                    <span>Complete PDF Tools Suite</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    33 high-precision in-browser utilities organized into 7 distinct visual workflow cards.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 bg-amber-500/10 text-amber-300 rounded-full border border-amber-500/30">
                    100% Client-Side Processing
                  </span>
                </div>
              </div>

              {/* Visual Card Grid format (Issue 4) - Replaces cramped 7-columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {getPdfGroups().map((group) => {
                  const GroupIcon = TOOL_ICON_MAP[group.iconName] || Layers;
                  return (
                    <div
                      key={group.id}
                      className="bg-[#0c101d] rounded-2xl p-5 border border-amber-500/25 shadow-xl flex flex-col justify-between hover:border-amber-400/50 transition-all space-y-4"
                    >
                      <div>
                        {/* Workflow Card Header in Title Case (Issue 17 Fixed) */}
                        <div className="flex items-center justify-between pb-3 border-b border-amber-500/15 mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xs">
                              <GroupIcon className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-bold text-white tracking-tight">
                              {formatPdfGroupTitle(group.title)}
                            </h3>
                          </div>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#070a14] border border-amber-500/30 text-amber-300">
                            {group.tools.length} Tools
                          </span>
                        </div>

                        {/* List of tools with generous width (Issues 10-16, 18-22 Truncation Fixed) */}
                        <ul className="space-y-1.5">
                          {group.tools.map((tool) => {
                            const Icon = TOOL_ICON_MAP[tool.iconName] || Layers;
                            return (
                              <li key={tool.id}>
                                <button
                                  type="button"
                                  onClick={() => onSelectTool(tool.slug)}
                                  className="w-full text-left p-2 rounded-xl hover:bg-amber-500/10 flex items-center justify-between text-xs font-semibold text-slate-200 hover:text-amber-300 transition group cursor-pointer border border-transparent hover:border-amber-500/20"
                                >
                                  <div className="flex items-center gap-2 min-w-0 pr-1">
                                    <Icon className="w-3.5 h-3.5 text-amber-400/80 group-hover:text-amber-400 shrink-0" />
                                    <span className="whitespace-normal leading-snug break-words">
                                      {tool.name}
                                    </span>
                                  </div>
                                  {tool.badge && (
                                    <span className="text-xs font-bold uppercase px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0 ml-1">
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

            {/* RECENTLY ADDED TOOLS */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    <span>Recently Added Tools</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    New utilities and conversion engines added to ToolCrest
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {recentTools.map(renderToolCard)}
              </div>
            </section>

            {/* COMPLETE TOOLS DIRECTORY WITH SECONDARY SUB-FILTERS & PAGINATION (Issue 5 Fixed) */}
            <section className="space-y-6 pt-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-amber-500/20">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Explore Full Tools Directory
                  </h2>
                  <p className="text-xs text-slate-400">
                    Browse our complete suite of {TOOLS_DATA.length} PDF tools, converters, financial calculators, and planners
                  </p>
                </div>

                {/* Sub-Category Jump Filters to Prevent Wall of Content (Issue 5) */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'all', label: `All (${TOOLS_DATA.length})` },
                    { id: 'pdf', label: `PDF Suite (33)` },
                    { id: 'productivity', label: `Productivity (4)` },
                    { id: 'finance', label: `Finance & Unit (2)` },
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
                          : 'bg-[#0c101d] text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/20'
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

              {/* Pagination & Jump Navigation Bar (Issue 5) */}
              <div className="pt-4 border-t border-amber-500/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <span className="text-slate-400">
                  Showing{' '}
                  <strong className="text-white">
                    {Math.min(
                      directoryFilteredTools.length,
                      (directoryPage - 1) * DIRECTORY_PAGE_SIZE + 1
                    )}
                    –
                    {Math.min(
                      directoryFilteredTools.length,
                      directoryPage * DIRECTORY_PAGE_SIZE
                    )}
                  </strong>{' '}
                  of <strong className="text-amber-300">{directoryFilteredTools.length}</strong> tools
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={directoryPage === 1}
                    onClick={() => {
                      setDirectoryPage((prev) => Math.max(1, prev - 1));
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#0c101d] hover:bg-amber-500/10 border border-amber-500/25 text-slate-300 hover:text-amber-300 disabled:opacity-40 disabled:pointer-events-none transition font-semibold cursor-pointer"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalDirectoryPages }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        type="button"
                        onClick={() => setDirectoryPage(pg)}
                        className={`w-8 h-8 rounded-xl font-bold transition cursor-pointer flex items-center justify-center ${
                          directoryPage === pg
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-xs'
                            : 'bg-[#0c101d] text-slate-400 hover:text-amber-300 hover:bg-slate-800 border border-amber-500/20'
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
                    className="px-3.5 py-1.5 rounded-xl bg-[#0c101d] hover:bg-amber-500/10 border border-amber-500/25 text-slate-300 hover:text-amber-300 disabled:opacity-40 disabled:pointer-events-none transition font-semibold cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            </section>
          </>
        )}

        {/* 3. PRODUCTIVITY PLANNER HUB SPOTLIGHT BANNER (Regal Gold & Dark Obsidian) */}
        <section className="bg-gradient-to-br from-[#0c101d] via-[#141b30] to-[#080b14] rounded-2xl p-6 sm:p-10 text-white shadow-2xl overflow-hidden relative border border-amber-500/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-yellow-500/8 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl space-y-3.5 relative z-10">
            {/* Issue 23 Fixed: text-xs replaces text-[10px] */}
            <span className="text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-3.5 py-1 rounded-full">
              Full Productivity Suite
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Free Weekly &amp; Budget Planner Generator
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
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

        {/* 4. LATEST BLOG & TUTORIALS PREVIEW (Dark & Gold) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Latest Articles & Productivity Guides
              </h2>
              <p className="text-xs text-slate-400">
                In-depth tutorials on time management, budgeting, and tool workflows
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/blog')}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
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
                  className="bg-[#0d1322] border border-amber-500/20 hover:border-amber-400/60 rounded-2xl overflow-hidden shadow-lg hover:shadow-amber-500/10 transition cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-full h-44 overflow-hidden bg-slate-950 relative">
                      <AppImage
                        src={img}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="font-bold text-xs text-amber-300 bg-slate-950/90 backdrop-blur-xs px-2.5 py-1 rounded-md uppercase tracking-wider border border-amber-500/30">
                          {article.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-amber-300 transition leading-snug line-clamp-2 mb-2">
                        {article.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {article.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2 flex items-center justify-between text-xs border-t border-slate-800">
                    <span className="text-xs text-slate-400">By {article.author}</span>
                    <span className="text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition">
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
