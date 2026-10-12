import React, { useState, useMemo } from 'react';
import {
  Calculator,
  DollarSign,
  Percent,
  Calendar,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  RotateCcw,
  PieChart,
} from 'lucide-react';

interface LoanCalculatorToolProps {
  onNavigate: (path: string) => void;
}

export const LoanCalculatorTool: React.FC<LoanCalculatorToolProps> = ({ onNavigate }) => {
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [loanAmount, setLoanAmount] = useState<number>(25000);
  const [interestRate, setInterestRate] = useState<number>(5.5);
  const [loanYears, setLoanYears] = useState<number>(5);

  const results = useMemo(() => {
    const P = loanAmount;
    const r = interestRate / 100 / 12; // monthly interest rate
    const n = loanYears * 12; // total monthly payments

    if (P <= 0 || loanYears <= 0) {
      return {
        monthlyPayment: 0,
        totalPayment: 0,
        totalInterest: 0,
        principalPercent: 100,
        interestPercent: 0,
        schedule: [],
      };
    }

    let monthlyPayment = 0;
    if (r === 0) {
      monthlyPayment = P / n;
    } else {
      monthlyPayment = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - P;
    const principalPercent = (P / totalPayment) * 100;
    const interestPercent = (totalInterest / totalPayment) * 100;

    // Generate yearly schedule
    let remainingBalance = P;
    const schedule: Array<{
      year: number;
      principalPaid: number;
      interestPaid: number;
      balance: number;
    }> = [];

    for (let yr = 1; yr <= loanYears; yr++) {
      let yrPrincipal = 0;
      let yrInterest = 0;

      for (let m = 1; m <= 12; m++) {
        const interest = remainingBalance * r;
        const principal = monthlyPayment - interest;
        yrInterest += interest;
        yrPrincipal += principal;
        remainingBalance = Math.max(0, remainingBalance - principal);
      }

      schedule.push({
        year: yr,
        principalPaid: Math.round(yrPrincipal),
        interestPaid: Math.round(yrInterest),
        balance: Math.round(remainingBalance),
      });
    }

    return {
      monthlyPayment,
      totalPayment,
      totalInterest,
      principalPercent,
      interestPercent,
      schedule,
    };
  }, [loanAmount, interestRate, loanYears]);

  return (
    <div className="py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="hover:text-emerald-700 transition"
        >
          Tools
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-semibold">Loan & EMI Calculator</span>
      </nav>

      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold shadow-2xs">
              <Calculator className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Loan & EMI Calculator
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Accurate EMI
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                Calculate monthly loan installments, total interest charges, and amortization schedules with instant interactive controls.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {['$', '£', '€'].map((sym) => (
              <button
                key={sym}
                type="button"
                onClick={() => setCurrencySymbol(sym)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  currencySymbol === sym
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Inputs vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Loan Parameters
          </h2>

          {/* Principal Input */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="font-bold text-slate-700">Loan Amount</label>
              <span className="font-extrabold text-emerald-700">
                {currencySymbol}{loanAmount.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={1000}
              max={500000}
              step={1000}
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="relative mt-2">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                {currencySymbol}
              </span>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Math.max(0, Number(e.target.value)))}
                className="w-full pl-8 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Interest Rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="font-bold text-slate-700">Annual Interest Rate</label>
              <span className="font-extrabold text-emerald-700">{interestRate}%</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={25}
              step={0.1}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="relative mt-2">
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                %
              </span>
              <input
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Loan Term */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="font-bold text-slate-700">Loan Term (Years)</label>
              <span className="font-extrabold text-emerald-700">{loanYears} Years ({loanYears * 12} Mos)</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={loanYears}
              onChange={(e) => setLoanYears(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex gap-2 pt-1">
              {[1, 3, 5, 10, 15, 30].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setLoanYears(yr)}
                  className={`flex-1 py-1 text-xs font-semibold rounded-lg border transition ${
                    loanYears === yr
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {yr}y
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Interest compounded monthly</span>
            <button
              type="button"
              onClick={() => {
                setLoanAmount(25000);
                setInterestRate(5.5);
                setLoanYears(5);
              }}
              className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>

        {/* Results Summary (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Monthly Payment Hero Box */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-md">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
              Estimated Monthly Payment
            </span>
            <div className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {currencySymbol}{results.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-sm font-normal text-slate-400 ml-2">/ month</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-700/80">
              <div>
                <span className="text-xs text-slate-400 block">Total Interest Paid</span>
                <span className="text-lg sm:text-xl font-extrabold text-amber-400">
                  {currencySymbol}{Math.round(results.totalInterest).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Total Amount Paid</span>
                <span className="text-lg sm:text-xl font-extrabold text-emerald-400">
                  {currencySymbol}{Math.round(results.totalPayment).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Visual ratio bar */}
            <div className="mt-6 space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Principal ({results.principalPercent.toFixed(1)}%)</span>
                <span>Interest ({results.interestPercent.toFixed(1)}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${results.principalPercent}%` }}
                />
                <div
                  className="bg-amber-400 h-full transition-all duration-300"
                  style={{ width: `${results.interestPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Yearly Amortization Table */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" /> Yearly Amortization Schedule
              </h3>
              <span className="text-xs text-slate-400">{results.schedule.length} Total Years</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <th className="py-2.5 px-3 font-bold">Year</th>
                    <th className="py-2.5 px-3 font-bold">Principal Paid</th>
                    <th className="py-2.5 px-3 font-bold">Interest Paid</th>
                    <th className="py-2.5 px-3 font-bold text-right">Remaining Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.schedule.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50/60">
                      <td className="py-2 px-3 font-bold text-slate-900">Year {row.year}</td>
                      <td className="py-2 px-3 text-slate-700">{currencySymbol}{row.principalPaid.toLocaleString()}</td>
                      <td className="py-2 px-3 text-amber-600">{currencySymbol}{row.interestPaid.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">
                        {currencySymbol}{row.balance.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
