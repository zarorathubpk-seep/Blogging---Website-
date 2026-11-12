import { Cookie, Settings, Eye, HelpCircle, ChevronRight, CheckCircle2, Sliders } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { openCookiePreferencesModal } from '../utils/analytics';

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                How ToolCrest uses cookies and storage to power web features and advertising.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openCookiePreferencesModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer self-start sm:self-auto"
          >
            <Sliders className="w-4 h-4" />
            Change Cookie Preferences
          </button>
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
            Cookies are small text files stored on your browser when visiting websites. Similar technologies include HTML5 local storage (localStorage and sessionStorage), which store client preferences directly on your device without transmitting data back to servers on every HTTP request.
          </p>
          <p>
            <strong>Important note regarding document privacy:</strong> None of ToolCrest's document conversion or PDF processing tools store your files in cookies or local storage. All document processing takes place entirely in-memory inside your browser.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Settings className="w-4 h-4 text-amber-500" />
            2. Categorization of Cookies and Storage Under Consent Mode v2
          </h2>

          <div className="space-y-3">
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <h3 className={`font-bold text-xs ${isDark ? 'text-amber-300' : 'text-slate-900'}`}>A. Strictly Necessary &amp; Functional Storage (Always Active)</h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Used to remember your planner checklist state, custom budget entries, currency selections ($ USD / £ GBP / € EUR), favorite tools, and dark/light color preferences. These do not track you across other websites and are essential for tool functionality.
              </p>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <h3 className={`font-bold text-xs ${isDark ? 'text-amber-300' : 'text-slate-900'}`}>B. Analytics &amp; Diagnostics (Google Analytics 4 — Optional)</h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Helps us measure site traffic, identify technical errors, and optimize tool speeds using aggregated metrics. Controlled via Google Consent Mode v2 (<code className="font-mono text-amber-400">analytics_storage</code>). Disabled by default until you grant consent.
              </p>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <h3 className={`font-bold text-xs ${isDark ? 'text-amber-300' : 'text-slate-900'}`}>C. Advertising &amp; Commercial Partners (RevBid &amp; Google AdSense — Optional)</h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Our advertising partners, including <strong>RevBid</strong> and <strong>Google AdSense</strong>, provide the advertising technology that keeps ToolCrest 100% free. When you grant advertising consent, authorized ad networks may set cookies to serve relevant advertisements, prevent ad fraud, frequency cap ads, and measure campaign effectiveness. These correspond to Google Consent Mode tags (<code className="font-mono text-amber-400">ad_storage</code>, <code className="font-mono text-amber-400">ad_user_data</code>, <code className="font-mono text-amber-400">ad_personalization</code>). If you reject advertising cookies, you will only see non-personalized ads.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Eye className="w-4 h-4 text-amber-500" />
            3. How to Change or Revoke Your Preferences at Any Time
          </h2>
          <p>
            You have full control over your cookie choices. You can modify your preferences at any moment by clicking the button below or using the "Manage Cookie Preferences" link in the footer of every page:
          </p>
          <div>
            <button
              type="button"
              onClick={() => openCookiePreferencesModal()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              Open Cookie Settings Modal
            </button>
          </div>
          <p className="text-xs pt-1">
            Additionally, you can configure your browser to block or clear cookies:
          </p>
          <ul className={`list-disc list-inside space-y-1 ml-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            <li><strong>Google Chrome:</strong> Settings &rarr; Privacy and Security &rarr; Third-party cookies</li>
            <li><strong>Apple Safari:</strong> Settings &rarr; Safari &rarr; Advanced &rarr; Block All Cookies</li>
            <li><strong>Mozilla Firefox:</strong> Settings &rarr; Privacy &amp; Security &rarr; Enhanced Tracking Protection</li>
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
