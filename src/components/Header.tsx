import React, { useState, useRef, useEffect } from 'react';
import { ToolCrestLogo } from './ToolCrestLogo';
import { AllPdfToolsMegaMenu } from './AllPdfToolsMegaMenu';
import {
  CalendarCheck2,
  BookOpen,
  Menu,
  X,
  Shield,
  Search,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  FileText,
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
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-amber-500/20 print:hidden transition-all text-slate-100">
        {/* Top micro announcement bar (Dark & Gold) */}
        <div className="bg-[#060911] text-slate-300 py-1.5 px-4 sm:px-6 lg:px-8 text-[11px] flex items-center justify-between border-b border-amber-500/15">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]"></span>
            <span className="text-slate-300 font-medium">
              100% Free Client-Side Tools • Zero Cloud Uploads • Private & Fast
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-400">
            <a
              href="mailto:info@toolcrest.site"
              className="hover:text-amber-300 transition flex items-center gap-1.5"
            >
              <Mail className="w-3 h-3 text-amber-400" /> info@toolcrest.site
            </a>
            <a
              href="tel:+9230305881136"
              className="hover:text-amber-300 transition flex items-center gap-1.5"
            >
              <Phone className="w-3 h-3 text-amber-400" /> +9230305881136
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo with Dark Theme */}
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="flex items-center text-left focus:outline-hidden cursor-pointer"
            >
              <ToolCrestLogo size="md" showTagline={true} theme="dark" />
            </button>

            {/* Middle Nav Bar: Direct PDF Shortcuts with Gold Highlights */}
            <div className="hidden xl:flex items-center gap-1 font-bold text-xs">
              {/* MERGE PDF (Gold Accent) */}
              <button
                type="button"
                onClick={() => handleToolDirect('merge-pdf')}
                className={`px-3 py-1.5 rounded-xl transition uppercase tracking-wider cursor-pointer ${
                  currentPath === '/tools/merge-pdf'
                    ? 'text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-500 font-black shadow-xs'
                    : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                }`}
              >
                Merge PDF
              </button>

              {/* SPLIT PDF */}
              <button
                type="button"
                onClick={() => handleToolDirect('split-pdf')}
                className={`px-3 py-1.5 rounded-xl transition uppercase tracking-wider cursor-pointer ${
                  currentPath === '/tools/split-pdf'
                    ? 'text-amber-300 bg-slate-900 font-black border border-amber-500/40'
                    : 'text-slate-300 hover:text-amber-300 hover:bg-slate-900'
                }`}
              >
                Split PDF
              </button>

              {/* COMPRESS PDF */}
              <button
                type="button"
                onClick={() => handleToolDirect('compress-pdf')}
                className={`px-3 py-1.5 rounded-xl transition uppercase tracking-wider cursor-pointer ${
                  currentPath === '/tools/compress-pdf'
                    ? 'text-amber-300 bg-slate-900 font-black border border-amber-500/40'
                    : 'text-slate-300 hover:text-amber-300 hover:bg-slate-900'
                }`}
              >
                Compress PDF
              </button>

              {/* CONVERT PDF DROPDOWN */}
              <div className="relative" ref={convertDropdownRef}>
                <button
                  type="button"
                  onClick={() => setConvertDropdownOpen((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-xl transition uppercase tracking-wider flex items-center gap-1 cursor-pointer ${
                    convertDropdownOpen
                      ? 'text-amber-300 bg-slate-900 border border-amber-500/30'
                      : 'text-slate-300 hover:text-amber-300 hover:bg-slate-900'
                  }`}
                >
                  <span>Convert PDF</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      convertDropdownOpen ? 'rotate-180 text-amber-400' : ''
                    }`}
                  />
                </button>

                {convertDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-72 bg-slate-950 rounded-2xl shadow-2xl border border-amber-500/30 p-3 z-50 animate-fadeIn text-xs text-slate-200">
                    <div className="text-[10px] font-black uppercase tracking-widest text-amber-400/90 px-2 pb-1.5">
                      Convert to PDF
                    </div>
                    <div className="space-y-0.5">
                      <button
                        type="button"
                        onClick={() => handleToolDirect('images-to-pdf')}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-900 flex items-center gap-2 text-slate-300 hover:text-white"
                      >
                        <Image className="w-3.5 h-3.5 text-amber-400" />
                        <span>JPG to PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToolDirect('word-to-pdf')}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-900 flex items-center gap-2 text-slate-300 hover:text-white"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                        <span>WORD to PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToolDirect('powerpoint-to-pdf')}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-900 flex items-center gap-2 text-slate-300 hover:text-white"
                      >
                        <Presentation className="w-3.5 h-3.5 text-amber-400" />
                        <span>POWERPOINT to PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToolDirect('excel-to-pdf')}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-900 flex items-center gap-2 text-slate-300 hover:text-white"
                      >
                        <Table className="w-3.5 h-3.5 text-emerald-400" />
                        <span>EXCEL to PDF</span>
                      </button>
                    </div>

                    <div className="text-[10px] font-black uppercase tracking-widest text-amber-400/90 px-2 pt-3 pb-1.5 border-t border-slate-800 mt-2">
                      Convert from PDF
                    </div>
                    <div className="space-y-0.5">
                      <button
                        type="button"
                        onClick={() => handleToolDirect('pdf-to-images')}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-900 flex items-center gap-2 text-slate-300 hover:text-white"
                      >
                        <Image className="w-3.5 h-3.5 text-amber-400" />
                        <span>PDF to JPG</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToolDirect('pdf-to-word')}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-900 flex items-center gap-2 text-slate-300 hover:text-white"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                        <span>PDF to WORD</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToolDirect('pdf-to-excel')}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-900 flex items-center gap-2 text-slate-300 hover:text-white"
                      >
                        <Table className="w-3.5 h-3.5 text-emerald-400" />
                        <span>PDF to EXCEL</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToolDirect('pdf-to-pdfa')}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-900 flex items-center gap-2 text-slate-300 hover:text-white"
                      >
                        <Archive className="w-3.5 h-3.5 text-purple-400" />
                        <span>PDF to PDF/A</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ALL PDF TOOLS (Trigger for Golden Mega Menu) */}
              <button
                type="button"
                onClick={() => setMegaMenuOpen((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl transition uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border ${
                  megaMenuOpen
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-sm font-extrabold'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                }`}
              >
                <span>All PDF Tools</span>
                {megaMenuOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-amber-300" />
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
                  className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900/90 hover:bg-slate-900 border border-amber-500/30 hover:border-amber-400/60 rounded-full text-xs text-slate-300 hover:text-white transition shadow-sm group cursor-pointer"
                  title="Open Quick Tool Launcher (Cmd+K)"
                >
                  <Search className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="hidden xl:inline text-slate-300 font-medium">Find Tool...</span>
                  <kbd className="font-mono text-[10px] bg-slate-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 font-bold">
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
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? 'text-amber-300 bg-amber-500/15 font-bold border border-amber-500/30'
                        : 'text-slate-300 hover:text-amber-300 hover:bg-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}

              {/* Currency Selector */}
              <div className="flex items-center bg-slate-900 rounded-xl p-0.5 ml-1 border border-amber-500/20">
                {(['USD', 'GBP', 'EUR'] as Currency[]).map((cur) => (
                  <button
                    key={cur}
                    type="button"
                    onClick={() => onCurrencyChange(cur)}
                    className={`px-2 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                      currency === cur
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-xs font-black'
                        : 'text-slate-400 hover:text-white'
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
                className={`p-2 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-slate-900 transition ml-0.5 cursor-pointer ${
                  currentPath === '/admin' ? 'text-amber-300 bg-amber-500/15' : ''
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
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1"
              >
                <span>PDF Tools</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-amber-500/20 bg-slate-950 px-4 pt-3 pb-6 space-y-3 animate-fadeIn text-slate-200">
            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-800">
              <button
                type="button"
                onClick={() => handleToolDirect('merge-pdf')}
                className="p-2 text-left rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold text-xs"
              >
                Merge PDF
              </button>
              <button
                type="button"
                onClick={() => handleToolDirect('split-pdf')}
                className="p-2 text-left rounded-xl bg-slate-900 text-slate-200 font-bold text-xs border border-slate-800"
              >
                Split PDF
              </button>
              <button
                type="button"
                onClick={() => handleToolDirect('compress-pdf')}
                className="p-2 text-left rounded-xl bg-slate-900 text-slate-200 font-bold text-xs border border-slate-800"
              >
                Compress PDF
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setMegaMenuOpen(true);
                }}
                className="p-2 text-left rounded-xl bg-amber-500/20 text-yellow-200 font-bold text-xs border border-amber-500/40"
              >
                All 33 PDF Tools →
              </button>
            </div>

            <nav className="flex flex-col space-y-1">
              <button
                type="button"
                onClick={() => handleNavClick('/')}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-900 hover:text-amber-300"
              >
                All Tools
              </button>
              {navLinks.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleNavClick(item.path)}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-900 hover:text-amber-300"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Currency:</span>
              <div className="flex items-center gap-1">
                {(['USD', 'GBP', 'EUR'] as Currency[]).map((cur) => (
                  <button
                    key={cur}
                    type="button"
                    onClick={() => onCurrencyChange(cur)}
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      currency === cur ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-900 text-slate-400'
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

      {/* Golden Mega Menu */}
      <AllPdfToolsMegaMenu
        isOpen={megaMenuOpen}
        onClose={() => setMegaMenuOpen(false)}
        onSelectTool={handleToolDirect}
      />
    </>
  );
};
