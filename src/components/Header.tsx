import React, { useState } from 'react';
import { ToolCrestLogo } from './ToolCrestLogo';
import {
  Wrench,
  FileText,
  CalendarCheck2,
  BookOpen,
  Menu,
  X,
  Shield,
  DollarSign,
  Search,
  Sparkles,
  Phone,
  Mail,
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

  const navLinks = [
    { label: 'All Tools', path: '/', icon: Wrench },
    { label: 'PDF Suite', path: '/#pdf-tools', icon: FileText },
    { label: 'Planner Generator', path: '/planner', icon: CalendarCheck2 },
    { label: 'Blog', path: '/blog', icon: BookOpen },
    { label: 'About Us', path: '/about-us' },
    { label: 'Contact', path: '/contact-us' },
  ];

  const handleNavClick = (path: string) => {
    setMobileMenuOpen(false);
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

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 print:hidden transition-all">
      {/* Top micro announcement bar */}
      <div className="bg-slate-900 text-slate-300 py-1.5 px-4 sm:px-6 lg:px-8 text-[11px] flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          <span className="text-slate-300 font-medium">100% Free Client-Side Tools • Zero Cloud Uploads • Private & Fast</span>
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

          {/* Search Trigger Pill in Header */}
          {onOpenToolSelector && (
            <button
              type="button"
              onClick={onOpenToolSelector}
              className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-full text-xs text-slate-500 hover:text-slate-800 transition shadow-2xs group"
              title="Open Quick Tool Launcher (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
              <span>Quick Tool Finder...</span>
              <kbd className="font-mono text-[10px] bg-white text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs font-semibold">
                ⌘K
              </kbd>
            </button>
          )}

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
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
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                    isActive
                      ? 'text-blue-700 bg-blue-50/90 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

            {/* Quick Tool Selector Trigger Button */}
            {onOpenToolSelector && (
              <button
                type="button"
                onClick={onOpenToolSelector}
                className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition flex items-center gap-1.5 shadow-xs"
                title="Launch tool selector modal"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                <span>Find Tool</span>
              </button>
            )}

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
              className={`p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition ml-1 ${
                currentPath === '/admin' ? 'text-blue-700 bg-blue-50' : ''
              }`}
              title="Admin Article Management"
            >
              <Shield className="w-4 h-4" />
            </button>
          </nav>

          {/* Mobile actions */}
          <div className="flex md:hidden items-center gap-2">
            {onOpenToolSelector && (
              <button
                type="button"
                onClick={onOpenToolSelector}
                className="p-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-200"
                aria-label="Search tools"
              >
                <Search className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 animate-fadeIn">
          {onOpenToolSelector && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenToolSelector();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold mb-3 shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" /> Open Tool Selector Popup
            </button>
          )}

          {navLinks.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleNavClick(item.path)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold ${
                currentPath === item.path
                  ? 'text-blue-700 bg-blue-50 font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" /> Currency:
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {(['USD', 'GBP', 'EUR'] as Currency[]).map((cur) => (
                <button
                  key={cur}
                  type="button"
                  onClick={() => onCurrencyChange(cur)}
                  className={`px-2.5 py-1 text-xs font-bold rounded ${
                    currency === cur
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-600" />
              <a href="mailto:info@toolcrest.site" className="text-emerald-700 font-semibold">
                info@toolcrest.site
              </a>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <a href="tel:+9230305881136" className="text-emerald-700 font-semibold">
                +9230305881136
              </a>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('/admin');
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2 pt-2 border-t border-slate-100 mt-2"
          >
            <Shield className="w-3.5 h-3.5 text-slate-500" /> Admin Article Management
          </button>
        </div>
      )}
    </header>
  );
};
