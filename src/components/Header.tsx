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
        {/* Primary Navigation Bar & Brand Identity (Semantic Nav Landmark at Top) */}
        <nav aria-label="Main Navigation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo with Dark Theme */}
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="flex items-center text-left focus:outline-hidden cursor-pointer"
            >
              <ToolCrestLogo size="md" showTagline={true} theme="dark" />
            </button>

            {/* Consolidated Desktop Primary Navigation */}
            <div className="hidden lg:flex items-center gap-1.5 font-medium text-xs">
              {/* 1. Tools Suite Dropdown */}
              <div className="relative" ref={convertDropdownRef}>
                <button
                  type="button"
                  onClick={() => setConvertDropdownOpen((prev) => !prev)}
                  className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer font-bold ${
                    convertDropdownOpen || currentPath.startsWith('/tools/')
                      ? 'text-amber-300 bg-slate-900 border border-amber-500/40 shadow-xs'
                      : 'text-slate-200 hover:text-amber-300 hover:bg-slate-900/80'
                  }`}
                  aria-expanded={convertDropdownOpen}
                  aria-haspopup="true"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>PDF &amp; Document Tools</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      convertDropdownOpen ? 'rotate-180 text-amber-400' : ''
                    }`}
                  />
                </button>

                {convertDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-80 bg-slate-950 rounded-2xl shadow-2xl border border-amber-500/30 p-3 z-50 animate-fadeIn text-xs text-slate-200">
                    <div className="text-xs font-bold text-amber-300 px-2 pb-1.5 flex items-center justify-between border-b border-amber-500/20 mb-1">
                      <span>Popular PDF Actions</span>
                      <span className="text-[10px] text-amber-400/80 font-normal">Free &amp; Client-Side</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 py-1">
                      <button
                        type="button"
                        onClick={() => handleToolDirect('merge-pdf')}
                        className="text-left px-2.5 py-2 rounded-xl hover:bg-amber-500/15 flex items-center gap-2 text-slate-200 hover:text-amber-300 transition"
                      >
                        <span className="w-2 h-2 rounded-full bg-rose-400" />
                        <span className="font-semibold">Merge PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToolDirect('split-pdf')}
                        className="text-left px-2.5 py-2 rounded-xl hover:bg-amber-500/15 flex items-center gap-2 text-slate-200 hover:text-amber-300 transition"
                      >
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                        <span className="font-semibold">Split PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToolDirect('compress-pdf')}
                        className="text-left px-2.5 py-2 rounded-xl hover:bg-amber-500/15 flex items-center gap-2 text-slate-200 hover:text-amber-300 transition"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="font-semibold">Compress PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToolDirect('images-to-pdf')}
                        className="text-left px-2.5 py-2 rounded-xl hover:bg-amber-500/15 flex items-center gap-2 text-slate-200 hover:text-amber-300 transition"
                      >
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span className="font-semibold">Images to PDF</span>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setConvertDropdownOpen(false);
                          setMegaMenuOpen(true);
                        }}
                        className="w-full text-center py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
                      >
                        <span>Browse All 33 PDF Tools</span>
                        <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Planner Generator */}
              <button
                type="button"
                onClick={() => handleNavClick('/planner')}
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer font-bold ${
                  currentPath.startsWith('/planner')
                    ? 'text-amber-300 bg-slate-900 border border-amber-500/40 shadow-xs'
                    : 'text-slate-200 hover:text-amber-300 hover:bg-slate-900/80'
                }`}
              >
                <CalendarCheck2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Planners</span>
              </button>

              {/* 3. Calculators & Utilities */}
              <button
                type="button"
                onClick={() => handleNavClick('/#directory')}
                className="px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer font-bold text-slate-200 hover:text-amber-300 hover:bg-slate-900/80"
              >
                <Table className="w-3.5 h-3.5 text-amber-400" />
                <span>Calculators &amp; Directory</span>
              </button>

              {/* 4. Blog & Guides */}
              <button
                type="button"
                onClick={() => handleNavClick('/blog')}
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer font-bold ${
                  currentPath.startsWith('/blog')
                    ? 'text-amber-300 bg-slate-900 border border-amber-500/40 shadow-xs'
                    : 'text-slate-200 hover:text-amber-300 hover:bg-slate-900/80'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Blog &amp; Guides</span>
              </button>
            </div>

            {/* Desktop Right Utilities & Action Center */}
            <div className="hidden lg:flex items-center gap-2.5">
              {/* Search Trigger Pill in Header */}
              {onOpenToolSelector && (
                <button
                  type="button"
                  onClick={onOpenToolSelector}
                  className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900/90 hover:bg-slate-900 border border-amber-500/30 hover:border-amber-400/60 rounded-xl text-xs text-slate-300 hover:text-white transition shadow-xs group cursor-pointer"
                  title="Open Quick Tool Launcher (Cmd+K)"
                  aria-label="Open quick tool launcher"
                >
                  <Search className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="hidden xl:inline text-slate-300 font-medium">Find Tool...</span>
                  <kbd className="font-mono text-xs bg-slate-950 text-amber-300 px-1.5 py-0.5 rounded-lg border border-amber-500/30 font-bold">
                    ⌘K
                  </kbd>
                </button>
              )}

              {/* Currency Selector (Fix Issue 8: Distinct Button Affordance & Segmented Switcher) */}
              <div
                role="radiogroup"
                aria-label="Currency selection switcher"
                className="flex items-center bg-[#070a14] rounded-xl p-0.5 border border-amber-500/30 shadow-xs"
              >
                {(['USD', 'GBP', 'EUR'] as Currency[]).map((cur) => {
                  const isSelected = currency === cur;
                  const symbol = cur === 'USD' ? '$' : cur === 'GBP' ? '£' : '€';
                  return (
                    <button
                      key={cur}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => onCurrencyChange(cur)}
                      className={`px-2 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-0.5 ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-sm'
                          : 'text-slate-300 hover:text-amber-300 hover:bg-slate-900'
                      }`}
                      title={`Switch currency to ${cur} (${symbol})`}
                    >
                      <span>{symbol}</span>
                      <span className="text-[10px] font-semibold opacity-90">{cur}</span>
                    </button>
                  );
                })}
              </div>

              {/* Secondary Navigation Dropdown (About, Contact, Admin) */}
              <div className="relative group">
                <button
                  type="button"
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-amber-300 hover:bg-slate-900 border border-slate-800 transition flex items-center gap-1 cursor-pointer"
                  title="More options and company information"
                >
                  <span>More</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                <div className="absolute right-0 top-full mt-2 w-48 bg-slate-950 rounded-2xl shadow-2xl border border-amber-500/30 p-2 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all text-xs text-slate-200">
                  <button
                    type="button"
                    onClick={() => handleNavClick('/about-us')}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-amber-500/10 hover:text-amber-300 transition flex items-center justify-between"
                  >
                    <span>About Us</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick('/contact-us')}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-amber-500/10 hover:text-amber-300 transition flex items-center justify-between"
                  >
                    <span>Contact Support</span>
                  </button>
                  <div className="border-t border-slate-800 my-1" />
                  <button
                    type="button"
                    onClick={() => handleNavClick('/admin')}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-amber-500/10 hover:text-amber-300 transition flex items-center gap-2 text-slate-400"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>Admin Portal</span>
                  </button>
                </div>
              </div>
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
        </nav>

        {/* Micro Announcement & Trust Bar (Accessible text-xs, >= 12px) */}
        <div className="bg-[#060911]/90 text-slate-300 py-1.5 px-4 sm:px-6 lg:px-8 text-xs flex items-center justify-between border-t border-amber-500/15">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
            <span className="text-slate-300 font-medium text-xs">
              100% Free Client-Side Tools • Zero Cloud Uploads • Private &amp; Fast
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-400 text-xs">
            <a
              href="mailto:info@toolcrest.site"
              className="hover:text-amber-300 transition flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" /> info@toolcrest.site
            </a>
            <a
              href="tel:+9230305881136"
              className="hover:text-amber-300 transition flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" /> +9230305881136
            </a>
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
