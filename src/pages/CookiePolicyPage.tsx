import React from 'react';
import { Cookie, Settings, Eye, HelpCircle, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface CookiePolicyPageProps {
  onNavigate: (path: string) => void;
}

export const CookiePolicyPage: React.FC<CookiePolicyPageProps> = ({ onNavigate }) => {
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
        <span className={`font-semibold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>Cookie Policy</span>
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
            <Cookie className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Cookie Policy
            </h1>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              How ToolCrest uses cookies and local storage to power web features and advertising.
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
          <h2 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
            1. What Are Cookies and Local Storage?
          </h2>
          <p>
            Cookies are small text files stored on your browser when visiting websites. Similar technologies include HTML5 local storage (localStorage and sessionStorage), which store client preferences directly on your device without sending data back to servers on every HTTP request.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Settings className="w-4 h-4 text-amber-500" />
            2. Types of Cookies and Storage We Use
          </h2>

          <div className="space-y-3">
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <h3 className={`font-bold text-xs ${isDark ? 'text-amber-300' : 'text-slate-900'}`}>A. Essential Functionality (Local Storage)</h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Used to remember your planner checklist state, currency selections ($ USD / £ GBP / € EUR), favorite tools, and dark/light color preferences. These do not track you across other websites.
              </p>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <h3 className={`font-bold text-xs ${isDark ? 'text-amber-300' : 'text-slate-900'}`}>B. Advertising & Monetization (AdSense)</h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Authorized ad networks may place cookies to serve non-intrusive advertisements, measure click-through performance, and prevent repetitive ad impressions. We never use invasive or unauthorized scripts.
              </p>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <h3 className={`font-bold text-xs ${isDark ? 'text-amber-300' : 'text-slate-900'}`}>C. Performance & Diagnostics (Google Analytics 4)</h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Anonymized browser metrics to identify crashes, slow loading times, and broken links across diverse device types with Google Consent Mode v2.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Eye className="w-4 h-4 text-amber-500" />
            3. How to Manage and Disable Cookies
          </h2>
          <p>
            You can modify your browser settings to accept, refuse, or delete cookies at any time:
          </p>
          <ul className={`list-disc list-inside space-y-1 ml-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            <li><strong>Google Chrome:</strong> Settings &rarr; Privacy and Security &rarr; Cookies and other site data</li>
            <li><strong>Apple Safari:</strong> Preferences &rarr; Privacy &rarr; Manage Website Data</li>
            <li><strong>Mozilla Firefox:</strong> Settings &rarr; Privacy & Security &rarr; Cookies and Site Data</li>
            <li><strong>Microsoft Edge:</strong> Settings &rarr; Cookies and site permissions</li>
          </ul>
        </section>

        <section className={`space-y-2 pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>4. Contact Our Team</h2>
          <p>
            If you have questions about how we use cookies, local storage, or data preferences, email us at{' '}
            <a href="mailto:info@toolcrest.site" className={`font-semibold underline ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>info@toolcrest.site</a>{' '}
            or call <a href="tel:+9230305881136" className={`font-semibold underline ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>+9230305881136</a>.
          </p>
        </section>
      </div>
    </div>
  );
};
