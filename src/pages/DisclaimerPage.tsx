import React from 'react';
import { AlertTriangle, Calculator, FileCheck, ShieldAlert, ChevronRight } from 'lucide-react';

interface DisclaimerPageProps {
  onNavigate: (path: string) => void;
}

export const DisclaimerPage: React.FC<DisclaimerPageProps> = ({ onNavigate }) => {
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
        <span className="text-slate-700 font-semibold">Disclaimer</span>
      </nav>

      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center font-bold shadow-2xs">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              General Disclaimer
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Important disclosures regarding calculations, planning tools, and editorial guides.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs text-sm text-slate-700 leading-relaxed space-y-6">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-amber-600" />
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
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-amber-600" />
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
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            3. "As Is" Warranty Disclaimer
          </h2>
          <p>
            We make every reasonable effort to keep our tool calculations, unit conversion rates, and time zone DST offsets current and accurate. However, we make no warranties, representations, or guarantees, express or implied, regarding the continuous availability, error-free operation, or absolute completeness of materials on the site.
          </p>
          <p className="pt-2 text-xs text-slate-500">
            Questions regarding our tools or documentation? Contact us anytime at{' '}
            <a href="mailto:info@toolcrest.site" className="text-emerald-700 font-semibold underline">info@toolcrest.site</a>{' '}
            or phone <a href="tel:+9230305881136" className="text-emerald-700 font-semibold underline">+9230305881136</a>.
          </p>
        </section>
      </div>
    </div>
  );
};
