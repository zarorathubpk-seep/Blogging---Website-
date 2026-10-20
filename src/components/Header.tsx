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
  Sun,
  Moon,
} from 'lucide-react';
import { Currency } from '../types/planner';
import { Theme } from '../context/ThemeContext';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  onOpenToolSelector?: () => void;
  theme?: Theme;
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  onNavigate,
  currency,
  onCurrencyChange,
  onOpenToolSelector,
  theme = 'dark',
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';
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
      <header
        className={`sticky top-0 z-40 backdrop-blur-md border-b print:hidden transition-colors duration-200 ${
          isDark
            ? 'bg-slate-950/95 border-amber-500/20 text-slate-100'
            : 'bg-white/95 border-slate-200/90 text-slate-800 shadow-xs'
        }`}
      >
        {/* Micro Announcement & Trust Bar at Top of Header */}
        <div
          className={`py-1.5 px-4 sm:px-6 lg:px-8 text-xs flex items-center justify-between border-b transition-colors duration-200 ${
            isDark
              ? 'bg-[#050812] text-slate-300 border-amber-500/15'
              : 'bg-gradient-to-r from-amber-50/90 via-yellow-50/70 to-amber-50/90 text-slate-700 border-amber-200/60'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
            <span className={`font-medium text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              100% Free Client-Side Tools • Zero Cloud Uploads • Private &amp; Fast
            </span>
          </div>
          <div className={`hidden sm:flex items-center gap-4 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            <a
              href="mailto:info@toolcrest.site"
              className="hover:text-amber-500 transition flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-amber-500" /> info@toolcrest.site
            </a>
            <a
              href="tel:+9230305881136"
              className="hover:text-amber-500 transition flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-amber-500" /> +9230305881136
            </a>
          </div>
        </div>

        {/* Primary Navigation Bar & Brand Identity */}
        <nav aria-label="Main Navigation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo with Dynamic Theme */}
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="flex items-center text-left focus:outline-hidden cursor-pointer"
            >
              <ToolCrestLogo size="md" showTagline={true} theme={isDark ? 'dark' : 'light'} />
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
                      ? isDark
                        ? 'text-amber-300 bg-slate-900 border border-amber-500/40 shadow-xs'
                        : 'text-amber-900 bg-amber-100/70 border border-amber-300 shadow-xs'
                      : isDark
                      ? 'text-slate-200 hover:text-amber-300 hover:bg-slate-900/80'
                      : 'text-slate-700 hover:text-amber-800 hover:bg-amber-50/80'
                  }`}
                  aria-expanded={convertDropdownOpen}
                  aria-haspopup="true"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-500" />
                  <span>PDF &amp; Document Tools</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      convertDropdownOpen ? 'rotate-180 text-amber-500' : ''
                    }`}
                  />
                </button>

                {convertDropdownOpen && (
                  <div
                    className={`absolute left-0 top-full mt-2 w-80 rounded-2xl shadow-2xl p-3 z-50 animate-fadeIn text-xs ${
                      isDark
                        ? 'bg-slate-950 border border-amber-500/30 text-slate-200'
                        : 'bg-white border border-slate-200/90 text-slate-800 shadow-xl'
                    }`}
                  >
                    <div
                      className={`text-xs font-bold px-2 pb-1.5 flex items-center justify-between border-b mb-1 ${
                        isDark ? 'text-amber-300 border-amber-500/20' : 'text-amber-800 border-amber-200/80'
                      }`}
                    >
                      <span>Popular PDF Actions</span>
                      <span className={`text-[10px] font-normal ${isDark ? 'text-amber-400/80' : 'text-amber-700'}`}>
                        Free &amp; Client-Side
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 py-1">
                      <button
                        type="button"
                        onClick={() => handleToolDirect('merge-pdf')}
                        className={`text-left px-2.5 py-2 rounded-xl flex items-center gap-2 transition ${
                          isDark
                            ? 'text-slate-200 hover:text-amber-300 hover:bg-amber-500/15'
                            : 'text-slate-700 hover:text-amber-900 hover:bg-amber-50'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="font-semibold">Merge PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToolDirect('split-pdf')}
                        className={`text-left px-2.5 py-2 rounded-xl flex items-center gap-2 transition ${
                          isDark
                            ? 'text-slate-200 hover:text-amber-300 hover:bg-amber-500/15'
                            : 'text-slate-700 hover:text-amber-900 hover:bg-amber-50'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="font-semibold">Split PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToolDirect('compress-pdf')}
                        className={`text-left px-2.5 py-2 rounded-xl flex items-center gap-2 transition ${
                          isDark
                            ? 'text-slate-200 hover:text-amber-300 hover:bg-amber-500/15'
                            : 'text-slate-700 hover:text-amber-900 hover:bg-amber-50'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-semibold">Compress PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToolDirect('images-to-pdf')}
                        className={`text-left px-2.5 py-2 rounded-xl flex items-center gap-2 transition ${
                          isDark
                            ? 'text-slate-200 hover:text-amber-300 hover:bg-amber-500/15'
                            : 'text-slate-700 hover:text-amber-900 hover:bg-amber-50'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="font-semibold">Images to PDF</span>
                      </button>
                    </div>

                    <div className={`pt-2 border-t mt-1 ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
                      <button
                        type="button"
                        onClick={() => {
                          setConvertDropdownOpen(false);
                          setMegaMenuOpen(true);
                        }}
                        className="w-full text-center py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-105 text-slate-950 font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
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
                    ? isDark
                      ? 'text-amber-300 bg-slate-900 border border-amber-500/40 shadow-xs'
                      : 'text-amber-900 bg-amber-100/70 border border-amber-300 shadow-xs'
                    : isDark
                    ? 'text-slate-200 hover:text-amber-300 hover:bg-slate-900/80'
                    : 'text-slate-700 hover:text-amber-800 hover:bg-amber-50/80'
                }`}
              >
                <CalendarCheck2 className="w-3.5 h-3.5 text-amber-500" />
                <span>Planners</span>
              </button>

              {/* 3. Calculators & Utilities */}
              <button
                type="button"
                onClick={() => handleNavClick('/#directory')}
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer font-bold ${
                  isDark
                    ? 'text-slate-200 hover:text-amber-300 hover:bg-slate-900/80'
                    : 'text-slate-700 hover:text-amber-800 hover:bg-amber-50/80'
                }`}
              >
                <Table className="w-3.5 h-3.5 text-amber-500" />
                <span>Calculators &amp; Directory</span>
              </button>

              {/* 4. Blog & Guides */}
              <button
                type="button"
                onClick={() => handleNavClick('/blog')}
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer font-bold ${
                  currentPath.startsWith('/blog')
                    ? isDark
                      ? 'text-amber-300 bg-slate-900 border border-amber-500/40 shadow-xs'
                      : 'text-amber-900 bg-amber-100/70 border border-amber-300 shadow-xs'
                    : isDark
                    ? 'text-slate-200 hover:text-amber-300 hover:bg-slate-900/80'
                    : 'text-slate-700 hover:text-amber-800 hover:bg-amber-50/80'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                <span>Blog &amp; Guides</span>
              </button>
            </div>

            {/* Desktop Right Utilities & Action Center */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Search Trigger Pill in Header */}
              {onOpenToolSelector && currentPath !== '/' && currentPath !== '' && (
                <button
                  type="button"
                  onClick={onOpenToolSelector}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs transition shadow-xs group cursor-pointer ${
                    isDark
                      ? 'bg-slate-900/90 hover:bg-slate-900 border border-amber-500/30 hover:border-amber-400/60 text-slate-300 hover:text-white'
                      : 'bg-slate-100 hover:bg-slate-200/80 border border-slate-300 text-slate-700 hover:text-slate-900'
                  }`}
                  title="Open Quick Tool Launcher (Cmd+K)"
                  aria-label="Open quick tool launcher"
                >
                  <Search className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                  <span className="hidden xl:inline font-medium">Find Tool...</span>
                  <kbd
                    className={`font-mono text-xs px-1.5 py-0.5 rounded-lg font-bold border ${
                      isDark
                        ? 'bg-slate-950 text-amber-300 border-amber-500/30'
                        : 'bg-white text-amber-700 border-slate-300'
                    }`}
                  >
                    ⌘K
                  </kbd>
                </button>
              )}

              {/* Light / Dark Mode Toggle Switch (Best Color Combination Upgrade) */}
              {onToggleTheme && (
                <button
                  type="button"
                  onClick={onToggleTheme}
                  aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                  title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                  className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-center ${
                    isDark
                      ? 'text-amber-400 hover:text-amber-300 hover:bg-slate-900 border border-slate-800'
                      : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/70 border border-amber-300/80 shadow-xs'
                  }`}
                >
                  {isDark ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-amber-700" />
                  )}
                </button>
              )}

              {/* Secondary Navigation & Settings Dropdown */}
              <div className="relative group">
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    isDark
                      ? 'text-slate-300 hover:text-amber-300 hover:bg-slate-900 border border-slate-800'
                      : 'text-slate-700 hover:text-amber-900 hover:bg-slate-100 border border-slate-200'
                  }`}
                  title="More options, currency, and company information"
                >
                  <span>More</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                <div
                  className={`absolute right-0 top-full mt-2 w-56 rounded-2xl shadow-2xl p-2.5 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all text-xs ${
                    isDark
                      ? 'bg-slate-950 border border-amber-500/30 text-slate-200'
                      : 'bg-white border border-slate-200/90 text-slate-800 shadow-xl'
                  }`}
                >
                  {/* Currency Switcher nested cleanly inside More menu */}
                  <div className={`px-2 py-1.5 mb-1.5 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    <span className="text-[10px] uppercase font-bold opacity-75 tracking-wider block mb-1.5">
                      Display Currency
                    </span>
                    <div
                      role="radiogroup"
                      aria-label="Currency selection"
                      className={`flex items-center rounded-lg p-0.5 border ${
                        isDark ? 'bg-[#070a14] border-slate-800' : 'bg-slate-100 border-slate-200'
                      }`}
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
                            className={`flex-1 py-1 text-[11px] font-bold rounded-md transition cursor-pointer flex items-center justify-center gap-0.5 ${
                              isSelected
                                ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                                : isDark
                                ? 'text-slate-400 hover:text-amber-300'
                                : 'text-slate-600 hover:text-amber-800'
                            }`}
                          >
                            <span>{symbol}</span>
                            <span>{cur}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNavClick('/about-us')}
                    className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between ${
                      isDark ? 'hover:bg-amber-500/10 hover:text-amber-300' : 'hover:bg-amber-50 hover:text-amber-800'
                    }`}
                  >
                    <span>About Us</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick('/contact-us')}
                    className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between ${
                      isDark ? 'hover:bg-amber-500/10 hover:text-amber-300' : 'hover:bg-amber-50 hover:text-amber-800'
                    }`}
                  >
                    <span>Contact Support</span>
                  </button>
                  <div className={`border-t my-1 ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />
                  <button
                    type="button"
                    onClick={() => handleNavClick('/admin')}
                    className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center gap-2 ${
                      isDark
                        ? 'hover:bg-amber-500/10 hover:text-amber-300 text-slate-400'
                        : 'hover:bg-amber-50 hover:text-amber-800 text-slate-600'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-500" />
                    <span>Admin Portal</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Actions: Theme Switcher & Hamburger Button */}
            <div className="flex items-center gap-2 lg:hidden">
              {onToggleTheme && (
                <button
                  type="button"
                  onClick={onToggleTheme}
                  aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                  className={`p-2 rounded-xl transition cursor-pointer ${
                    isDark
                      ? 'text-amber-400 hover:bg-slate-900 border border-slate-800'
                      : 'text-amber-700 hover:bg-amber-100 border border-amber-300/70'
                  }`}
                >
                  {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-amber-700" />}
                </button>
              )}

              {/* Mobile Theme Toggle Button */}
              {onToggleTheme && (
                <button
                  type="button"
                  onClick={onToggleTheme}
                  aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                  title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                  className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-center ${
                    isDark
                      ? 'text-amber-400 hover:text-amber-300 hover:bg-slate-900 border border-slate-800'
                      : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/70 border border-amber-300/80 shadow-xs'
                  }`}
                >
                  {isDark ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-amber-700" />
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => setMegaMenuOpen((prev) => !prev)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1 ${
                  isDark
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-amber-100/70 text-amber-900 border-amber-300'
                }`}
              >
                <span>PDF Tools</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className={`p-2 rounded-xl transition ${
                  isDark
                    ? 'text-slate-300 hover:text-white hover:bg-slate-900'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div
            className={`lg:hidden border-t px-4 pt-3 pb-6 space-y-3 animate-fadeIn transition-colors duration-200 ${
              isDark
                ? 'border-amber-500/20 bg-slate-950 text-slate-200'
                : 'border-slate-200 bg-white text-slate-800 shadow-xl'
            }`}
          >
            <div className={`grid grid-cols-2 gap-2 pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <button
                type="button"
                onClick={() => handleToolDirect('merge-pdf')}
                className={`p-2 text-left rounded-xl font-bold text-xs ${
                  isDark
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'bg-amber-100/80 text-amber-900 border border-amber-300'
                }`}
              >
                Merge PDF
              </button>
              <button
                type="button"
                onClick={() => handleToolDirect('split-pdf')}
                className={`p-2 text-left rounded-xl font-bold text-xs border ${
                  isDark
                    ? 'bg-slate-900 text-slate-200 border-slate-800'
                    : 'bg-slate-50 text-slate-800 border-slate-200'
                }`}
              >
                Split PDF
              </button>
              <button
                type="button"
                onClick={() => handleToolDirect('compress-pdf')}
                className={`p-2 text-left rounded-xl font-bold text-xs border ${
                  isDark
                    ? 'bg-slate-900 text-slate-200 border-slate-800'
                    : 'bg-slate-50 text-slate-800 border-slate-200'
                }`}
              >
                Compress PDF
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setMegaMenuOpen(true);
                }}
                className={`p-2 text-left rounded-xl font-bold text-xs border ${
                  isDark
                    ? 'bg-amber-500/20 text-yellow-200 border-amber-500/40'
                    : 'bg-amber-200/60 text-amber-950 border-amber-400'
                }`}
              >
                All 33 PDF Tools →
              </button>
            </div>

            <nav className="flex flex-col space-y-1">
              <button
                type="button"
                onClick={() => handleNavClick('/')}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition ${
                  isDark
                    ? 'text-slate-300 hover:bg-slate-900 hover:text-amber-300'
                    : 'text-slate-700 hover:bg-amber-50 hover:text-amber-900'
                }`}
              >
                All Tools
              </button>
              {navLinks.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleNavClick(item.path)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition ${
                    isDark
                      ? 'text-slate-300 hover:bg-slate-900 hover:text-amber-300'
                      : 'text-slate-700 hover:bg-amber-50 hover:text-amber-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Mobile Theme Toggle Row */}
            {onToggleTheme && (
              <div className={`pt-3 border-t flex items-center justify-between text-xs ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Appearance Mode:</span>
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isDark
                      ? 'bg-slate-900 text-amber-300 border border-slate-700'
                      : 'bg-amber-100/80 text-amber-900 border border-amber-300'
                  }`}
                >
                  {isDark ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>Dark (Switch to Light)</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-amber-700" />
                      <span>Light (Switch to Dark)</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <div className={`pt-2 border-t flex items-center justify-between text-xs ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Currency:</span>
              <div className="flex items-center gap-1">
                {(['USD', 'GBP', 'EUR'] as Currency[]).map((cur) => (
                  <button
                    key={cur}
                    type="button"
                    onClick={() => onCurrencyChange(cur)}
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      currency === cur
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : isDark
                        ? 'bg-slate-900 text-slate-400'
                        : 'bg-slate-100 text-slate-600'
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
