import React, { useState, useMemo } from 'react';
import {
  Calculator,
  DollarSign,
  Percent,
  Calendar,
  Sparkles,
  RotateCcw,
  Download,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { TOOLS_DATA } from '../../data/toolsData';
import { ToolHeader } from './ToolHeader';
import { RelatedToolsSection } from './RelatedToolsSection';
import { FaqSection } from '../FaqSection';
import { sanitizeFileName, ensureFileExtension } from '../../utils/fileNaming';

interface LoanCalculatorToolProps {
  onNavigate: (path: string) => void;
}

export const LoanCalculatorTool: React.FC<LoanCalculatorToolProps> = ({ onNavigate }) => {
  const toolItem = TOOLS_DATA.find((t) => t.id === 'loan-calculator') || {
    id: 'loan-calculator',
    name: 'Loan & EMI Calculator',
    slug: 'loan-calculator',
    category: 'calculators' as const,
    categoryLabel: 'Financial & Math',
    shortDesc: 'Compute monthly EMI loan installments, total interest costs, and amortization schedules.',
    longDesc: 'Accurate loan repayment calculator with amortization breakdown table, interest ratio visualizer, and custom CSV schedule export.',
    iconName: 'Calculator',
    keywords: ['loan', 'calculator', 'emi', 'mortgage', 'interest', 'amortization'],
  };

  const [principal, setPrincipal] = useState<number>(250000);
  const [annualRate, setAnnualRate] = useState<number>(6.5);
  const [termYears, setTermYears] = useState<number>(30);
  const [customExportName, setCustomExportName] = useState<string>('loan_amortization_schedule');

  // Currency selector
  const [currency, setCurrency] = useState<string>('$');

  // Math calculation
  const calculations = useMemo(() => {
    const P = Math.max(100, principal);
    const r = annualRate / 100 / 12; // monthly rate
    const n = Math.max(1, termYears * 12); // total months

    let monthlyPayment = 0;
    if (r > 0) {
      monthlyPayment = (P * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
    } else {
      monthlyPayment = P / n;
    }

    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - P;
    const interestPercent = Math.round((totalInterest / totalPayment) * 100);
    const principalPercent = 100 - interestPercent;

    // Build Yearly Amortization Schedule
    const schedule: {
      year: number;
      principalPaid: number;
      interestPaid: number;
      remainingBalance: number;
    }[] = [];

    let balance = P;
    for (let year = 1; year <= termYears; year++) {
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;

      for (let month = 1; month <= 12; month++) {
        if (balance <= 0) break;
        const interestMonth = balance * r;
        const principalMonth = Math.min(balance, monthlyPayment - interestMonth);
        yearlyInterest += interestMonth;
        yearlyPrincipal += principalMonth;
        balance -= principalMonth;
      }

      schedule.push({
        year,
        principalPaid: Math.round(yearlyPrincipal),
        interestPaid: Math.round(yearlyInterest),
        remainingBalance: Math.max(0, Math.round(balance)),
      });

      if (balance <= 0) break;
    }

    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      interestPercent,
      principalPercent,
      schedule,
    };
  }, [principal, annualRate, termYears]);

  const sanitizedCsvName = ensureFileExtension(
    sanitizeFileName(customExportName, 'loan_amortization_schedule'),
    'csv' as any
  );

  const handleExportCsv = () => {
    let csv = `Year,Principal Paid (${currency}),Interest Paid (${currency}),Ending Balance (${currency})\n`;
    calculations.schedule.forEach((row) => {
      csv += `${row.year},${row.principalPaid},${row.interestPaid},${row.remainingBalance}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = sanitizedCsvName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const loanFaqs = [
    {
      q: 'How is the monthly loan payment (EMI) calculated?',
      a: 'The calculation uses the standard amortization formula: EMI = [P x r x (1 + r)^n] / [(1 + r)^n - 1], where P is loan principal, r is monthly interest rate, and n is number of monthly installments.',
    },
    {
      q: 'What is the benefit of increasing my monthly payment?',
      a: 'Extra principal payments directly decrease the remaining loan balance, substantially reducing the compounding interest over the life of the loan.',
    },
    {
      q: 'Can I export the full amortization schedule for my records?',
      a: 'Yes! Use the Custom File Name field and click "Download CSV Schedule" to get a clean spreadsheet of yearly principal and interest breakdowns.',
    },
  ];

  return (
    <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* 1. UNIFIED TOOL HEADER */}
      <ToolHeader tool={toolItem} onNavigate={onNavigate} />

      {/* 2. MAIN TOOL WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Loan Inputs & Controls (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>Loan Parameters</span>
            </h2>

            {/* Currency selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {['$', '£', '€', 'Rs'].map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => setCurrency(curr)}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    currency === curr ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          {/* Principal Amount */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <label>Loan Amount (Principal)</label>
              <span className="font-mono text-emerald-700">
                {currency} {principal.toLocaleString()}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                {currency}
              </span>
              <input
                type="number"
                min="1000"
                step="5000"
                value={principal}
                onChange={(e) => setPrincipal(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full text-base font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3.5 py-2.5 focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <input
              type="range"
              min="10000"
              max="1500000"
              step="5000"
              value={principal}
              onChange={(e) => setPrincipal(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-600"
            />
          </div>

          {/* Annual Interest Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <label>Annual Interest Rate</label>
              <span className="font-mono text-emerald-700">{annualRate}%</span>
            </div>
            <div className="relative">
              <input
                type="number"
                min="0.1"
                max="30"
                step="0.1"
                value={annualRate}
                onChange={(e) => setAnnualRate(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full text-base font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                %
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="0.25"
              value={annualRate}
              onChange={(e) => setAnnualRate(parseFloat(e.target.value))}
              className="w-full accent-emerald-600"
            />
          </div>

          {/* Loan Term (Years) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <label>Loan Term Duration</label>
              <span className="font-mono text-emerald-700">
                {termYears} Years ({termYears * 12} Months)
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[5, 15, 20, 30].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setTermYears(yr)}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    termYears === yr
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {yr} Years
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Results & Repayment Breakdown (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-linear-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-lg space-y-6">
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full inline-block">
              Monthly Repayment (EMI)
            </span>

            <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-white">
              {currency} {calculations.monthlyPayment.toLocaleString()}
              <span className="text-xs font-normal text-slate-300 ml-2 font-sans">/ month</span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-emerald-700/50">
              <div>
                <span className="text-[11px] font-bold text-slate-300 uppercase block">Total Interest</span>
                <span className="text-xl font-bold font-mono text-emerald-300">
                  {currency} {calculations.totalInterest.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-300 uppercase block">Total Cost of Loan</span>
                <span className="text-xl font-bold font-mono text-white">
                  {currency} {calculations.totalPayment.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Principal vs Interest Ratio Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-200">
                <span>Principal ({calculations.principalPercent}%)</span>
                <span>Interest ({calculations.interestPercent}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                <div
                  className="bg-emerald-400 h-full transition-all duration-500"
                  style={{ width: `${calculations.principalPercent}%` }}
                />
                <div
                  className="bg-amber-400 h-full transition-all duration-500"
                  style={{ width: `${calculations.interestPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Custom File Name & Schedule Export Box */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-3">
            <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Amortization Schedule</span>
            </label>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={customExportName}
                onChange={(e) => setCustomExportName(e.target.value)}
                placeholder="Schedule file name..."
                className="flex-1 text-xs sm:text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleExportCsv}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-99 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Download CSV</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Output file: <strong className="font-mono text-emerald-800">{sanitizedCsvName}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* 3. AMORTIZATION TABLE PREVIEW */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>Annual Amortization Breakdown Table</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {calculations.schedule.length} Years Schedule
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Year</th>
                <th className="py-2.5 px-3 text-right">Principal Paid</th>
                <th className="py-2.5 px-3 text-right">Interest Paid</th>
                <th className="py-2.5 px-3 text-right">Ending Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {calculations.schedule.slice(0, 10).map((row) => (
                <tr key={row.year} className="hover:bg-slate-50/70 transition">
                  <td className="py-2.5 px-3 font-bold text-slate-800">Year {row.year}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-700 font-semibold">
                    {currency} {row.principalPaid.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right text-amber-700">
                    {currency} {row.interestPaid.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-900 font-bold">
                    {currency} {row.remainingBalance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {calculations.schedule.length > 10 && (
          <p className="text-xs text-slate-400 text-center pt-2">
            Showing first 10 years preview. Download CSV above for all {calculations.schedule.length} years.
          </p>
        )}
      </div>

      {/* 4. HOW TO USE GUIDE */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-600" />
          <span>How to Plan Loan Repayments</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
              1
            </span>
            <h4 className="font-bold text-sm text-slate-900">Enter Principal & Rate</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Input the requested mortgage or personal loan total along with the annual interest rate quoted by your lender.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
              2
            </span>
            <h4 className="font-bold text-sm text-slate-900">Compare Term Durations</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Test shorter terms (15 years) vs longer terms (30 years) to analyze the trade-off between monthly payment and total lifetime interest.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
              3
            </span>
            <h4 className="font-bold text-sm text-slate-900">Download CSV Ledger</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Set your preferred file name and export the year-by-year amortization ledger directly to your spreadsheet app.
            </p>
          </div>
        </div>
      </div>

      {/* 5. FAQS */}
      <FaqSection
        title="Frequently Asked Questions: Loan Calculator"
        subtitle="Key insights about amortization, compound interest, and mortgage planning."
        faqs={loanFaqs}
      />

      {/* 6. RELATED TOOLS */}
      <RelatedToolsSection
        currentToolSlug="loan-calculator"
        category="calculators"
        onNavigate={onNavigate}
      />
    </div>
  );
};
