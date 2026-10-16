import React, { useState, useRef, useEffect } from 'react';
import { ToolCrestLogo } from './ToolCrestLogo';
import { AllPdfToolsMegaMenu } from './AllPdfToolsMegaMenu';
import {
  Wrench,
  FileText,
  CalendarCheck2,
  BookOpen,
  Menu,
  X,
  Shield,
  Search,
  Sparkles,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Layers,
  Split,
  Minimize2,
  RefreshCw,
  Image,
  Table,
  Presentation,
  Archive,
} from 'lucide-react';
import { Currency } from '../types/planner';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  onOpenToolSelector?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  onNavigate,
  currency,
  onCurrencyChange,
  onOpenToolSelector,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [convertDropdownOpen, setConvertDropdownOpen] = useState(false);
  const convertDropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        convertDropdownRef.current &&
        !convertDropdownRef.current.contains(e.target as Node)
      ) {
        setConvertDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { label: 'Planner Generator', path: '/planner', icon: CalendarCheck2 },
    { label: 'Blog', path: '/blog', icon: BookOpen },
    { label: 'About Us', path: '/about-us' },
    { label: 'Contact', path: '/contact-us' },
  ];

  const handleNavClick = (path: string) => {
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
    setConvertDropdownOpen(false);
    if (path.startsWith('/#')) {
      if (currentPath !== '/') {
        onNavigate('/');
        setTimeout(() => {
          const el = document.querySelector(path.replace('/', ''));
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        const el = document.querySelector(path.replace('/', ''));
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      onNavigate(path);
    }
  };

  const handleToolDirect = (slug: string) => {
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
    setConvertDropdownOpen(false);
    onNavigate(`/tools/${slug}`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 print:hidden transition-all">
        {/* Top micro announcement bar */}
        <div className="bg-slate-900 text-slate-300 py-1.5 px-4 sm:px-6 lg:px-8 text-[11px] flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span className="text-slate-300 font-medium">
              100% Free Client-Side Tools • Zero Cloud Uploads • Private & Fast
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-400">
            <a
              href="mailto:info@toolcrest.site"
              className="hover:text-cyan-400 transition flex items-center gap-1.5"
            >
              <Mail className="w-3 h-3 text-cyan-400" /> info@toolcrest.site
            </a>
            <a
              href="tel:+9230305881136"
              className="hover:text-cyan-400 transition flex items-center gap-1.5"
            >
              <Phone className="w-3 h-3 text-cyan-400" /> +9230305881136
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="flex items-center text-left focus:outline-hidden"
            >
              <ToolCrestLogo size="md" showTagline={true} />
            </button>

            {/* Middle Nav Bar: Direct PDF Shortcuts matching the screenshot */}
            <div className="hidden xl:flex items-center gap-1 font-bold text-xs">
              {/* MERGE PDF (Highlighted Rose Accent) */}
              <button
                type="button"
                onClick={() => handleToolDirect('merge-pdf')}
                className={`px-3 py-1.5 rounded-xl transition uppercase tracking-wider ${
                  currentPath === '/tools/merge-pdf'
                    ? 'text-rose-600 bg-rose-50 font-extrabold'
                    : 'text-slate-700 hover:text-rose-600 hover:bg-rose-50/60'
                }`}
              >
                Merge PDF
              </button>

              {/* SPLIT PDF */}
              <button
                type="button"
                onClick={() => handleToolDirect('split-pdf')}
                className={`px-3 py-1.5 rounded-xl transition uppercase tracking-wider ${
                  currentPath === '/tools/split-pdf'
                    ? 'text-blue-600 bg-blue-50 font-extrabold'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                Split PDF
              </button>

              {/* COMPRESS PDF */}
              <button
                type="button"
                onClick={() => handleToolDirect('compress-pdf')}
                className={`px-3 py-1.5 rounded-xl transition uppercase tracking-wider ${
                  currentPath === '/tools/compress-pdf'
                    ? 'text-emerald-600 bg-emerald-50 font-extrabold'
                    : 'text-slate-700 hover:text-emerald-600 hover:bg-slate-50'
                }`}
              >
                Compress PDF
              </button>

              {/* CONVERT PDF DROPDOWN */}
              <div className="relative" ref={convertDropdownRef}>
                <button
                  type="button"
                  onClick={() => setConvertDropdownOpen((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-xl transition uppercase tracking-wider flex items-center gap-1 ${
                    convertDropdownOpen
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Convert PDF</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      convertDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {convertDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-3 z-50 animate-fadeIn text-xs">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 pb-1.5">
                      Convert to PDF
                    </div>
                    <div className="space-y-0.5">
                      <button
                        type="button"
                        onClick={() => handleToolDirect('images-to-pdf')}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-slate-700 hover:text-slate-900"
                      >
                        <Image className="w-3.5 h-3.5 text-amber-500" />
                        <span>JPG to PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToolDirect('word-to-pdf')}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-slate-700 hover:text-slate-900"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        <span>WORD to PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToolDirect('powerpoint-to-pdf')}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-slate-700 hover:text-slate-900"
                      >
                        <Presentation className="w-3.5 h-3.5 text-orange-500" />
                        <span>POWERPOINT to PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToolDirect('excel-to-pdf')}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-slate-700 hover:text-slate-900"
                      >
                        <Table className="w-3.5 h-3.5 text-emerald-500" />
                        <span>EXCEL to PDF</span>
                      </button>
                    </div>

                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 pt-3 pb-1.5 border-t border-slate-100 mt-2">
                      Convert from PDF
                    </div>
                    <div className="space-y-0.5">
                      <button
                        type="button"
                        onClick={() => handleToolDirect('pdf-to-images')}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-slate-700 hover:text-slate-900"
                      >
                        <Image className="w-3.5 h-3.5 text-amber-500" />
                        <span>PDF to JPG</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToolDirect('pdf-to-word')}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-slate-700 hover:text-slate-900"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        <span>PDF to WORD</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToolDirect('pdf-to-excel')}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-slate-700 hover:text-slate-900"
                      >
                        <Table className="w-3.5 h-3.5 text-emerald-500" />
                        <span>PDF to EXCEL</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToolDirect('pdf-to-pdfa')}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-slate-700 hover:text-slate-900"
                      >
                        <Archive className="w-3.5 h-3.5 text-purple-500" />
                        <span>PDF to PDF/A</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ALL PDF TOOLS (Trigger for the 7-Column Mega Menu) */}
              <button
                type="button"
                onClick={() => setMegaMenuOpen((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl transition uppercase tracking-wider flex items-center gap-1.5 ${
                  megaMenuOpen
                    ? 'bg-rose-50 text-rose-600 font-extrabold shadow-2xs'
                    : 'text-slate-900 hover:text-rose-600 hover:bg-slate-50'
                }`}
              >
                <span>All PDF Tools</span>
                {megaMenuOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-rose-600" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Desktop Navigation Links & Actions */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Search Trigger Pill in Header */}
              {onOpenToolSelector && (
                <button
                  type="button"
                  onClick={onOpenToolSelector}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-full text-xs text-slate-500 hover:text-slate-800 transition shadow-2xs group"
                  title="Open Quick Tool Launcher (Cmd+K)"
                >
                  <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  <span className="hidden xl:inline">Find Tool...</span>
                  <kbd className="font-mono text-[10px] bg-white text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs font-semibold">
                    ⌘K
                  </kbd>
                </button>
              )}

              {navLinks.map((item) => {
                const isActive =
                  item.path === '/'
                    ? currentPath === '/'
                    : currentPath.startsWith(item.path);

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleNavClick(item.path)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'text-blue-700 bg-blue-50/90 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}

              {/* Currency Selector (For Budget Planner & financial tools) */}
              <div className="flex items-center bg-slate-100 rounded-xl p-0.5 ml-1 border border-slate-200/80">
                {(['USD', 'GBP', 'EUR'] as Currency[]).map((cur) => (
                  <button
                    key={cur}
                    type="button"
                    onClick={() => onCurrencyChange(cur)}
                    className={`px-2 py-1 text-xs font-bold rounded-lg transition ${
                      currency === cur
                        ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title={`Switch currency to ${cur}`}
                  >
                    {cur === 'USD' ? '$' : cur === 'GBP' ? '£' : '€'}
                  </button>
                ))}
              </div>

              {/* Admin Console Icon */}
              <button
                type="button"
                onClick={() => onNavigate('/admin')}
                className={`p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition ml-0.5 ${
                  currentPath === '/admin' ? 'text-blue-700 bg-blue-50' : ''
                }`}
                title="Admin Article Management"
              >
                <Shield className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => setMegaMenuOpen((prev) => !prev)}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200/80 flex items-center gap-1"
              >
                <span>PDF Tools</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
              <button
                type="button"
                onClick={() => handleToolDirect('merge-pdf')}
                className="p-2 text-left rounded-xl bg-rose-50 text-rose-700 font-bold text-xs"
              >
                Merge PDF
              </button>
              <button
                type="button"
                onClick={() => handleToolDirect('split-pdf')}
                className="p-2 text-left rounded-xl bg-blue-50 text-blue-700 font-bold text-xs"
              >
                Split PDF
              </button>
              <button
                type="button"
                onClick={() => handleToolDirect('compress-pdf')}
                className="p-2 text-left rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs"
              >
                Compress PDF
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setMegaMenuOpen(true);
                }}
                className="p-2 text-left rounded-xl bg-purple-50 text-purple-700 font-bold text-xs"
              >
                All 33 PDF Tools →
              </button>
            </div>

            <nav className="flex flex-col space-y-1">
              <button
                type="button"
                onClick={() => handleNavClick('/')}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                All Tools
              </button>
              {navLinks.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleNavClick(item.path)}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Currency:</span>
              <div className="flex items-center gap-1">
                {(['USD', 'GBP', 'EUR'] as Currency[]).map((cur) => (
                  <button
                    key={cur}
                    type="button"
                    onClick={() => onCurrencyChange(cur)}
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      currency === cur ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Full 7-column mega menu matching the user's uploaded image */}
      <AllPdfToolsMegaMenu
        isOpen={megaMenuOpen}
        onClose={() => setMegaMenuOpen(false)}
        onSelectTool={handleToolDirect}
      />
    </>
  );
};
