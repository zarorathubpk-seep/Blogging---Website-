import React from 'react';
import { AlertTriangle, Calculator, FileCheck, ShieldAlert, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface DisclaimerPageProps {
  onNavigate: (path: string) => void;
}

export const DisclaimerPage: React.FC<DisclaimerPageProps> = ({ onNavigate }) => {
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
        <span className={`font-semibold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>Disclaimer</span>
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
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              General Disclaimer
            </h1>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Important disclosures regarding calculations, planning tools, and editorial guides.
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
            <Calculator className="w-4 h-4 text-amber-500" />
            1. No Financial, Legal, or Professional Advice
          </h2>
          <p>
            The tools, calculators (including the Monthly Budget Planner, 50/30/20 ledger, and currency conversions), and productivity guides provided on <strong>ToolCrest</strong> are designed strictly as <strong>informational and organizational aids</strong>.
          </p>
          <p>
            Nothing on this website constitutes professional financial, tax, investment, accounting, or legal advice. Financial organizing methodologies like the 50/30/20 rule are general frameworks that may not suit every individual’s specific economic circumstance. Before making significant personal finance decisions, consult a qualified Certified Financial Planner (CFP) or certified accountant.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <FileCheck className="w-4 h-4 text-amber-500" />
            2. Document Processing & File Accuracy
          </h2>
          <p>
            While our client-side PDF manipulation algorithms use industry-standard binary parsing engines, users are advised to verify output documents (such as merged contracts, redacted records, or rotated pages) prior to filing with courts, tax authorities, or enterprise clients.
          </p>
          <p>
            ToolCrest does not inspect or review user documents and assumes no responsibility for formatting alterations or omissions resulting from corrupted input files.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            3. "As Is" Warranty Disclaimer
          </h2>
          <p>
            We make every reasonable effort to keep our tool calculations, unit conversion rates, and time zone DST offsets current and accurate. However, we make no warranties, representations, or guarantees, express or implied, regarding the continuous availability, error-free operation, or absolute completeness of materials on the site.
          </p>
          <p className={`pt-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Questions regarding our tools or documentation? Contact us anytime at{' '}
            <a href="mailto:info@toolcrest.site" className={`font-semibold underline ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>info@toolcrest.site</a>{' '}
            or phone <a href="tel:+9230305881136" className={`font-semibold underline ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>+9230305881136</a>.
          </p>
        </section>
      </div>
    </div>
  );
};
