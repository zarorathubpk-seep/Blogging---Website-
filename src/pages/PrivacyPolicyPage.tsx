import React from 'react';
import { ShieldCheck, Lock, Eye, Server, Cookie, HelpCircle, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface PrivacyPolicyPageProps {
  onNavigate: (path: string) => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onNavigate }) => {
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
        <span className={`font-semibold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>Privacy Policy</span>
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
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Privacy Policy
            </h1>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Last Updated: October 2026 • Effective Date: January 1, 2026
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
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            1. Core Principle: 100% Client-Side In-Browser Processing
          </h2>
          <p>
            At <strong>ToolCrest</strong> (accessible via toolcrest.site), your document confidentiality and privacy are our highest priority. All PDF manipulation features—including password protection, restriction removal, coordinate redaction, page merging, cropping, watermarking, and PDF/A archival generation—<strong>execute strictly inside your web browser’s local memory</strong> via client-side JavaScript.
          </p>
          <p>
            Your confidential files are <strong>never</strong> transmitted to our servers, uploaded to cloud storage, or reviewed by third parties. Once your browser session ends or the tab is closed, all working memory buffers are immediately purged.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Server className="w-4 h-4 text-amber-500" />
            2. Information We Collect
          </h2>
          <p>
            We operate under a zero-account-requirement model for our free tools. The minimal operational data we process includes:
          </p>
          <ul className={`list-disc list-inside space-y-1.5 ml-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            <li>
              <strong>Local Preferences (localStorage):</strong> We store your planner task checkboxes, custom budget entries, selected currency ($ USD, £ GBP, € EUR), and dark/light display preferences locally on your device.
            </li>
            <li>
              <strong>Support Inquiries (Firestore):</strong> If you submit an inquiry through our Contact Form, your name, email, subject, and message are securely saved in our Google Cloud Firestore database so our support staff can review and respond.
            </li>
            <li>
              <strong>Anonymous Telemetry (Google Analytics 4 with Consent Mode v2):</strong> We collect aggregated, anonymized interaction metrics (page views, tool launches) to improve site performance. Google Analytics cookies are disabled by default until you grant consent.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Cookie className="w-4 h-4 text-amber-500" />
            3. Advertising & Cookies Disclosure
          </h2>
          <p>
            ToolCrest complies strictly with Google publisher policies and industry standards:
          </p>
          <ul className={`list-disc list-inside space-y-1.5 ml-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            <li>We do not automate traffic, execute artificial clicks, or deploy unauthorized ad scripts.</li>
            <li>Our <code className={`px-1.5 py-0.5 rounded text-xs font-mono ${isDark ? 'bg-slate-800 text-amber-300' : 'bg-slate-100 text-slate-800'}`}>ads.txt</code> file contains only authorized digital seller declarations and contains no scripts or malicious HTML.</li>
            <li>Advertising partners (such as Google AdSense) may utilize non-personalized or personalized cookies only in compliance with your explicit cookie choices and applicable regional privacy laws.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Eye className="w-4 h-4 text-amber-500" />
            4. GDPR & CCPA Compliance
          </h2>
          <p>
            In accordance with the European Union General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA):
          </p>
          <ul className={`list-disc list-inside space-y-1 ml-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            <li>We never sell, rent, or trade your personal information.</li>
            <li>You may request complete deletion of any support message you have sent us at any time.</li>
            <li>You retain complete rights to access, inspect, or rectify your records without discrimination.</li>
          </ul>
        </section>

        <section className={`space-y-2 pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <h2 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <HelpCircle className="w-4 h-4 text-amber-500" />
            5. Contact Our Privacy Office
          </h2>
          <p>
            For privacy inquiries, GDPR rights requests, or feedback regarding document processing, please reach out to us:
          </p>
          <div className={`p-4 rounded-2xl text-xs font-mono space-y-1 border ${
            isDark ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <p><strong>Email:</strong> info@toolcrest.site</p>
            <p><strong>Phone:</strong> +9230305881136</p>
            <p><strong>Organization:</strong> ToolCrest Privacy & Technical Operations</p>
          </div>
        </section>
      </div>
    </div>
  );
};
