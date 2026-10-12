import React from 'react';
import { ShieldCheck, Lock, Eye, Server, Cookie, HelpCircle, ChevronRight } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onNavigate: (path: string) => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onNavigate }) => {
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
        <span className="text-slate-700 font-semibold">Privacy Policy</span>
      </nav>

      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center font-bold shadow-2xs">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Last Updated: October 12, 2026 • Effective Date: January 1, 2026
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs text-sm text-slate-700 leading-relaxed space-y-6">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            1. Core Privacy Principle: Zero Server File Retention
          </h2>
          <p>
            At <strong>ToolCrest</strong> (accessible via toolcrest.site), your privacy and document security are our highest priorities. When you use our PDF tools, converters, calculators, QR generators, and productivity planners, <strong>all document processing occurs directly within your local web browser</strong> using client-side JavaScript execution.
          </p>
          <p>
            We do <strong>not</strong> upload, store, copy, analyze, or transmit your confidential PDF documents, signature drawings, image files, or personal numbers to any remote web server. Once you close your browser tab or clear your browser cache, all temporary memory allocations are instantly cleared.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-600" />
            2. Information We Collect
          </h2>
          <p>
            Because we do not require account registration to access our free online tools, we collect minimal operational information:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2 text-slate-600">
            <li>
              <strong>Browser Storage (localStorage):</strong> We store your planner checklist state and favorite tool selections solely in your device’s local browser memory so you can resume work when you revisit.
            </li>
            <li>
              <strong>Standard Server Logs:</strong> Basic connection telemetry (anonymized IP addresses, browser user-agent, referring URLs) collected automatically for network routing and DDoS security.
            </li>
            <li>
              <strong>Voluntary Communications:</strong> If you contact us via email or our contact form, we collect your name, email address, and inquiry to provide customer support.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Cookie className="w-4 h-4 text-emerald-600" />
            3. Cookies and Advertising Partners (AdSense & RevBid)
          </h2>
          <p>
            We may partner with reputable third-party advertising networks, such as Google AdSense and RevBid, to serve relevant advertisements. These partners may use cookies, web beacons, and similar technologies to measure ad performance and serve ads based on prior visits to our site or other websites.
          </p>
          <p>
            You have full control over cookie preferences. You may disable cookies through your individual browser options or opt out of personalized advertising by visiting{' '}
            <a
              href="https://www.aboutads.info/choices/"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-700 font-semibold underline"
            >
              AboutAds.info
            </a>{' '}
            or Google’s Ads Settings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-600" />
            4. GDPR & CCPA Compliance
          </h2>
          <p>
            We adhere to the European General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA):
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2 text-slate-600">
            <li>We do not sell personal data to any third party.</li>
            <li>You have the right to request access, rectification, or deletion of any personal communications sent to us.</li>
            <li>You have the right to non-discrimination for exercising your privacy rights.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            5. Contact Our Privacy Officer
          </h2>
          <p>
            If you have questions, feedback, or concerns regarding our privacy practices, please contact us at:
          </p>
          <p className="font-mono text-xs bg-slate-100 p-3 rounded-xl text-slate-800">
            Email: info@toolcrest.site • Phone: +9230305881136 • ToolCrest Legal & Compliance Office
          </p>
        </section>
      </div>
    </div>
  );
};
