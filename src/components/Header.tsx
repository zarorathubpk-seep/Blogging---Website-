import React, { useState } from 'react';
import { CalendarCheck2, BookOpen, Menu, X, Shield, DollarSign } from 'lucide-react';
import { Currency } from '../types/planner';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  onNavigate,
  currency,
  onCurrencyChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Planner Generator', path: '/planner', icon: CalendarCheck2 },
    { label: 'Blog & Guides', path: '/blog', icon: BookOpen },
    { label: 'How It Works', path: '#how-it-works' },
    { label: 'FAQ', path: '#faq' },
  ];

  const handleNavClick = (path: string) => {
    setMobileMenuOpen(false);
    if (path.startsWith('#')) {
      if (currentPath !== '/planner' && currentPath !== '/') {
        onNavigate('/planner');
        setTimeout(() => {
          const el = document.querySelector(path);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const el = document.querySelector(path);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      onNavigate(path);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 print:hidden transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <button
            type="button"
            onClick={() => onNavigate('/planner')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-700 transition">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-lg tracking-tight block leading-tight">
                Zarorat Hub
              </span>
              <span className="text-[11px] font-medium text-emerald-800 block -mt-0.5">
                Work Planner & Knowledge Hub
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleNavClick(item.path)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                    isActive
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

            {/* Currency Selector */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 ml-2 border border-slate-200/80">
              {(['USD', 'GBP', 'EUR'] as Currency[]).map((cur) => (
                <button
                  key={cur}
                  type="button"
                  onClick={() => onCurrencyChange(cur)}
                  className={`px-2 py-1 text-xs font-bold rounded-md transition ${
                    currency === cur
                      ? 'bg-white text-emerald-700 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title={`Switch default currency to ${cur}`}
                >
                  {cur === 'USD' ? '$' : cur === 'GBP' ? '£' : '€'}
                </button>
              ))}
            </div>

            {/* Admin Console Link */}
            <button
              type="button"
              onClick={() => onNavigate('/admin')}
              className={`p-2 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition ml-1 ${
                currentPath === '/admin' ? 'text-emerald-600 bg-emerald-50' : ''
              }`}
              title="Admin Article Management"
            >
              <Shield className="w-4 h-4" />
            </button>
          </nav>

          {/* Mobile hamburger menu */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
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
          {navLinks.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleNavClick(item.path)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
                currentPath === item.path
                  ? 'text-emerald-700 bg-emerald-50'
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
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('/admin');
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
          >
            <Shield className="w-3.5 h-3.5 text-slate-500" /> Admin Console
          </button>
        </div>
      )}
    </header>
  );
};
