import React from 'react';
import { FileText, ShieldAlert, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface TermsPageProps {
  onNavigate: (path: string) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onNavigate }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 transition-colors duration-200 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
      {/* Breadcrumb */}
      <nav className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className={`cursor-pointer transition ${isDark ? 'hover:text-amber-300' : 'hover:text-amber-700'}`}
        >
          Home
        </button>
        <ChevronRight className={`w-3.5 h-3.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
        <span className={`font-semibold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>Terms & Conditions</span>
      </nav>

      {/* Header */}
      <div
        className={`rounded-3xl p-6 sm:p-8 space-y-3 border transition-colors duration-200 ${
          isDark
            ? 'bg-[#0c101d] border-amber-500/25 shadow-xl'
            : 'bg-white border-slate-200/90 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-xs ${
              isDark
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}
          >
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Terms & Conditions
            </h1>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Effective Date: January 1, 2026 • Last Reviewed: October 2026
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className={`rounded-3xl p-6 sm:p-8 text-sm leading-relaxed space-y-6 border transition-colors duration-200 ${
          isDark
            ? 'bg-[#0c101d] border-amber-500/25 shadow-xl text-slate-300'
            : 'bg-white border-slate-200/90 shadow-sm text-slate-700'
        }`}
      >
        <section className="space-y-2">
          <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the website <strong>ToolCrest</strong> (toolcrest.site and associated subdomains), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must discontinue use of the site immediately.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>2. Free Permitted Use</h2>
          <p>
            ToolCrest grants you a personal, worldwide, royalty-free, non-exclusive license to use our online software tools, PDF processors, calculators, converters, planners, and blog tutorials for personal, educational, or commercial workflow purposes. All document processing takes place directly on your client device.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>3. Prohibited Activities</h2>
          <p>You agree not to:</p>
          <ul className={`list-disc list-inside space-y-1 ml-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            <li>Attempt to reverse-engineer, exploit, or bypass network rate limits through automated scrapers or bots.</li>
            <li>Use the site or PDF utilities to process illegal, malicious, copyright-infringing, or defamatory materials.</li>
            <li>Attempt to inject viruses, worms, or malicious code designed to degrade application performance.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>4. Intellectual Property</h2>
          <p>
            All original graphics, logos, branding, typography, UI layout designs, and editorial articles are the intellectual property of ToolCrest and protected by international copyright laws. Any third-party trademarks, company names, or brand logos referenced in tutorials remain property of their respective owners.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>5. Limitation of Liability</h2>
          <p>
            All online tools and calculations are provided on an <strong>"as is" and "as available" basis</strong> without warranties of any kind. While we strive for extreme mathematical precision and document processing reliability, ToolCrest shall not be liable for any direct, indirect, incidental, or consequential damages resulting from data loss, file errors, or reliance on calculations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>6. Amendments to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued use of ToolCrest following any revisions constitutes your acceptance of the updated terms.
          </p>
        </section>

        <section className={`space-y-2 pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>7. Legal Inquiries</h2>
          <p>
            For legal notices, terms inquiries, or licensing requests, contact us at{' '}
            <a href="mailto:info@toolcrest.site" className={`font-semibold hover:underline ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
              info@toolcrest.site
            </a>{' '}
            or call{' '}
            <a href="tel:+9230305881136" className={`font-semibold hover:underline ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
              +9230305881136
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
};
