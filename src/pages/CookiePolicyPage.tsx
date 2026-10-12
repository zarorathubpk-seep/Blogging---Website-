import React from 'react';
import { Cookie, Settings, Eye, HelpCircle, ChevronRight, CheckCircle2 } from 'lucide-react';

interface CookiePolicyPageProps {
  onNavigate: (path: string) => void;
}

export const CookiePolicyPage: React.FC<CookiePolicyPageProps> = ({ onNavigate }) => {
  return (
    <div className="py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="hover:text-emerald-700 transition"
        >
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-700 font-semibold">Cookie Policy</span>
      </nav>

      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center font-bold shadow-2xs">
            <Cookie className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Cookie Policy
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              How ToolCrest uses cookies and local storage to power web features and advertising.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs text-sm text-slate-700 leading-relaxed space-y-6">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            1. What Are Cookies and Local Storage?
          </h2>
          <p>
            Cookies are small text files stored on your browser when visiting websites. Similar technologies include HTML5 local storage (localStorage and sessionStorage), which store client preferences directly on your device without sending data back to servers on every HTTP request.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-4 h-4 text-emerald-600" />
            2. Types of Cookies We Use
          </h2>

          <div className="space-y-3">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <h3 className="font-bold text-xs text-slate-900">A. Essential Functionality (Local Storage)</h3>
              <p className="text-xs text-slate-600 mt-1">
                Used to remember your planner checklist state, currency selections ($ USD / £ GBP / € EUR), favorite tools, and dark/light color preferences. These do not track you across other websites.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <h3 className="font-bold text-xs text-slate-900">B. Advertising & Monetization (AdSense, RevBid)</h3>
              <p className="text-xs text-slate-600 mt-1">
                Third-party ad networks may place cookies to serve non-intrusive advertisements, measure click-through performance, and prevent repetitive ad impressions.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <h3 className="font-bold text-xs text-slate-900">C. Performance & Diagnostics</h3>
              <p className="text-xs text-slate-600 mt-1">
                Anonymized browser metrics to identify crashes, slow loading times, and broken links across diverse device types.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-600" />
            3. How to Manage and Disable Cookies
          </h2>
          <p>
            You can modify your browser settings to accept, refuse, or delete cookies at any time:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2 text-slate-600 text-xs">
            <li><strong>Google Chrome:</strong> Settings &rarr; Privacy and Security &rarr; Cookies and other site data</li>
            <li><strong>Apple Safari:</strong> Preferences &rarr; Privacy &rarr; Manage Website Data</li>
            <li><strong>Mozilla Firefox:</strong> Settings &rarr; Privacy & Security &rarr; Cookies and Site Data</li>
            <li><strong>Microsoft Edge:</strong> Settings &rarr; Cookies and site permissions</li>
          </ul>
        </section>

        <section className="space-y-2 pt-2 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900">4. Contact Our Team</h2>
          <p>
            If you have questions about how we use cookies, local storage, or data preferences, email us at{' '}
            <a href="mailto:info@toolcrest.site" className="text-emerald-700 font-semibold underline">info@toolcrest.site</a>{' '}
            or call <a href="tel:+9230305881136" className="text-emerald-700 font-semibold underline">+9230305881136</a>.
          </p>
        </section>
      </div>
    </div>
  );
};
