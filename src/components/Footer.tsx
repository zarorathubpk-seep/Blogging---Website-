import React from 'react';
import { ToolCrestLogo } from './ToolCrestLogo';
import { ShieldCheck, ArrowUpRight } from 'lucide-react';
import { PlannerType } from '../types/planner';

interface FooterProps {
  onNavigate: (path: string) => void;
  onSelectPlannerType: (type: PlannerType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onSelectPlannerType }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 print:hidden text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-10 border-b border-slate-800">
          {/* Brand & Mission (Col 1 & 2) */}
          <div className="md:col-span-2 space-y-3">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="text-left focus:outline-hidden"
            >
              <ToolCrestLogo size="md" theme="dark" showTagline={true} />
            </button>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              ToolCrest delivers fast, private, and 100% free online browser tools. Convert documents, merge PDFs, build schedules, and calculate finances without sending files to external servers.
            </p>
            <div className="space-y-1 pt-1 text-slate-400 text-[11px]">
              <div>
                Email:{' '}
                <a href="mailto:info@toolcrest.site" className="text-cyan-400 font-semibold hover:underline">
                  info@toolcrest.site
                </a>
              </div>
              <div>
                Phone:{' '}
                <a href="tel:+9230305881136" className="text-cyan-400 font-semibold hover:underline">
                  +9230305881136
                </a>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-cyan-400 text-[11px] font-medium pt-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side Privacy Architecture
            </div>
          </div>

          {/* PDF Suite Tools (Col 3) */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Popular PDF Tools
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/tools/merge-pdf')}
                  className="hover:text-emerald-400 transition"
                >
                  Merge PDF Documents
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/tools/split-pdf')}
                  className="hover:text-emerald-400 transition"
                >
                  Split & Extract PDF Pages
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/tools/compress-pdf')}
                  className="hover:text-emerald-400 transition"
                >
                  Compress PDF Size
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/tools/images-to-pdf')}
                  className="hover:text-emerald-400 transition"
                >
                  Images to PDF
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/tools/sign-pdf')}
                  className="hover:text-emerald-400 transition"
                >
                  Sign PDF
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/tools/qr-generator')}
                  className="hover:text-emerald-400 transition"
                >
                  QR Code Generator
                </button>
              </li>
            </ul>
          </div>

          {/* Productivity Planners (Col 4) */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Productivity Planners
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectPlannerType('weekly');
                    onNavigate('/planner');
                  }}
                  className="hover:text-emerald-400 transition"
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
                  className="hover:text-emerald-400 transition"
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
                  className="hover:text-emerald-400 transition"
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
                  className="hover:text-emerald-400 transition"
                >
                  Office Work Planner
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/tools/unit-converter')}
                  className="hover:text-emerald-400 transition"
                >
                  Universal Unit Converter
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/tools/time-zone-converter')}
                  className="hover:text-emerald-400 transition"
                >
                  Time Zone Converter
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Company (Col 5) */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Company & Legal
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/about-us')}
                  className="hover:text-emerald-400 transition"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/contact-us')}
                  className="hover:text-emerald-400 transition"
                >
                  Contact & Support
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/privacy-policy')}
                  className="hover:text-emerald-400 transition"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/terms-and-conditions')}
                  className="hover:text-emerald-400 transition"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/disclaimer')}
                  className="hover:text-emerald-400 transition"
                >
                  Disclaimer
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/cookie-policy')}
                  className="hover:text-emerald-400 transition"
                >
                  Cookie Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/sitemap')}
                  className="hover:text-emerald-400 transition flex items-center gap-1"
                >
                  Sitemap <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Compliance */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} ToolCrest. All tools execute locally in your web browser. Free for personal and commercial use.
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/privacy-policy')}
              className="hover:text-slate-300"
            >
              Privacy
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onNavigate('/terms-and-conditions')}
              className="hover:text-slate-300"
            >
              Terms
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onNavigate('/contact-us')}
              className="hover:text-slate-300"
            >
              Contact
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onNavigate('/admin')}
              className="hover:text-slate-300"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
