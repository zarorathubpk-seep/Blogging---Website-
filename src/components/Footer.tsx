import React from 'react';
import { ToolCrestLogo } from './ToolCrestLogo';
import { ShieldCheck, ArrowUpRight } from 'lucide-react';
import { PlannerType } from '../types/planner';
import { Theme } from '../context/ThemeContext';

interface FooterProps {
  onNavigate: (path: string) => void;
  onSelectPlannerType: (type: PlannerType) => void;
  theme?: Theme;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onSelectPlannerType,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  return (
    <footer
      className={`pt-12 pb-8 border-t print:hidden text-xs transition-colors duration-200 ${
        isDark
          ? 'bg-[#050811] text-slate-300 border-amber-500/20'
          : 'bg-slate-50/90 text-slate-700 border-slate-200/90 shadow-2xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 md:grid-cols-5 gap-8 pb-10 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          {/* Brand & Mission (Col 1 & 2) */}
          <div className="md:col-span-2 space-y-3">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="text-left focus:outline-hidden cursor-pointer"
            >
              <ToolCrestLogo size="md" theme={isDark ? 'dark' : 'light'} showTagline={true} />
            </button>
            <p className={`text-xs leading-relaxed max-w-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              ToolCrest delivers fast, private, and 100% free online browser tools. Convert documents, merge PDFs, build schedules, and calculate finances without sending files to external servers.
            </p>
            <div className="space-y-1.5 pt-1 text-xs">
              <div className="flex items-center">
                <span className={`w-14 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Email:</span>
                <a href="mailto:info@toolcrest.site" className={`font-bold hover:underline transition ${isDark ? 'text-amber-400' : 'text-amber-700 hover:text-amber-900'}`}>
                  info@toolcrest.site
                </a>
              </div>
              <div className="flex items-center">
                <span className={`w-14 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Phone:</span>
                <a href="tel:+9230305881136" className={`font-bold hover:underline transition ${isDark ? 'text-amber-400' : 'text-amber-700 hover:text-amber-900'}`}>
                  +9230305881136
                </a>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-bold pt-1 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side Privacy Architecture
            </div>
          </div>

          {/* PDF Suite Tools (Col 3) */}
          <div>
            <h3 className={`font-bold text-sm mb-3 ${isDark ? 'text-amber-300' : 'text-slate-900'}`}>
              Popular PDF Tools
            </h3>
            <ul className={`space-y-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/tools/merge-pdf')}
                  className={`transition cursor-pointer ${isDark ? 'hover:text-amber-300' : 'hover:text-amber-800'}`}
                >
                  Merge PDF Documents
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/tools/split-pdf')}
                  className={`transition cursor-pointer ${isDark ? 'hover:text-amber-300' : 'hover:text-amber-800'}`}
                >
                  Split & Extract PDF Pages
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/tools/compress-pdf')}
                  className={`transition cursor-pointer ${isDark ? 'hover:text-amber-300' : 'hover:text-amber-800'}`}
                >
                  Compress PDF Size
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/tools/images-to-pdf')}
                  className={`transition cursor-pointer ${isDark ? 'hover:text-amber-300' : 'hover:text-amber-800'}`}
                >
                  Images to PDF
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/tools/sign-pdf')}
                  className={`transition cursor-pointer ${isDark ? 'hover:text-amber-300' : 'hover:text-amber-800'}`}
                >
                  Sign PDF
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/tools/qr-generator')}
                  className={`transition cursor-pointer ${isDark ? 'hover:text-amber-300' : 'hover:text-amber-800'}`}
                >
                  QR Code Generator
                </button>
              </li>
            </ul>
          </div>

          {/* Productivity Planners (Col 4) */}
          <div>
            <h3 className={`font-bold text-sm mb-3 ${isDark ? 'text-amber-300' : 'text-slate-900'}`}>
              Productivity Planners
            </h3>
            <ul className={`space-y-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectPlannerType('weekly');
                    onNavigate('/planner');
                  }}
                  className={`transition cursor-pointer ${isDark ? 'hover:text-amber-300' : 'hover:text-amber-800'}`}
                >
                  Weekly Planner Generator
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectPlannerType('budget');
                    onNavigate('/planner');
                  }}
                  className={`transition cursor-pointer ${isDark ? 'hover:text-amber-300' : 'hover:text-amber-800'}`}
                >
                  Monthly Budget Planner (50/30/20)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectPlannerType('daily');
                    onNavigate('/planner');
                  }}
                  className={`transition cursor-pointer ${isDark ? 'hover:text-amber-300' : 'hover:text-amber-800'}`}
                >
                  Daily Time-Block Planner
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectPlannerType('office');
                    onNavigate('/planner');
                  }}
                  className={`transition cursor-pointer ${isDark ? 'hover:text-amber-300' : 'hover:text-amber-800'}`}
                >
                  Office Work Planner
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/tools/unit-converter')}
                  className={`transition cursor-pointer ${isDark ? 'hover:text-amber-300' : 'hover:text-amber-800'}`}
                >
                  Universal Unit Converter
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/tools/time-zone-converter')}
                  className={`transition cursor-pointer ${isDark ? 'hover:text-amber-300' : 'hover:text-amber-800'}`}
                >
                  Time Zone Converter
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Company (Col 5) */}
          <div>
            <h3 className={`font-bold text-sm mb-3 ${isDark ? 'text-amber-300' : 'text-slate-900'}`}>
              Company &amp; Legal
            </h3>
            <ul className={`space-y-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/about-us')}
                  className="hover:text-amber-300 transition cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/contact-us')}
                  className="hover:text-amber-300 transition cursor-pointer"
                >
                  Contact &amp; Support
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/privacy-policy')}
                  className="hover:text-amber-300 transition cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/terms-and-conditions')}
                  className="hover:text-amber-300 transition cursor-pointer"
                >
                  Terms &amp; Conditions
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/disclaimer')}
                  className="hover:text-amber-300 transition cursor-pointer"
                >
                  Disclaimer
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/cookie-policy')}
                  className="hover:text-amber-300 transition cursor-pointer"
                >
                  Cookie Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/sitemap')}
                  className="hover:text-amber-300 transition cursor-pointer"
                >
                  Sitemap
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Compliance */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} ToolCrest. All tools execute locally in your web browser. Free for personal and commercial use.
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/privacy-policy')}
              className="hover:text-amber-400 cursor-pointer"
            >
              Privacy
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onNavigate('/terms-and-conditions')}
              className="hover:text-amber-400 cursor-pointer"
            >
              Terms
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onNavigate('/contact-us')}
              className="hover:text-amber-400 cursor-pointer"
            >
              Contact
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onNavigate('/admin')}
              className="hover:text-amber-400 cursor-pointer"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
