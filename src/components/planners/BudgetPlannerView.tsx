import React from 'react';
import { BudgetPlannerData, BudgetItem, Currency } from '../../types/planner';
import { formatCurrency, getCurrencySymbol } from '../../utils/currency';
import { Plus, Trash2, DollarSign, Wallet, PiggyBank, Receipt, TrendingUp, AlertCircle } from 'lucide-react';

interface BudgetPlannerViewProps {
  data: BudgetPlannerData;
  onChange: (updated: BudgetPlannerData) => void;
  currentCurrency: Currency;
  onCurrencyChange: (cur: Currency) => void;
}

export const BudgetPlannerView: React.FC<BudgetPlannerViewProps> = ({
  data,
  onChange,
  currentCurrency,
  onCurrencyChange,
}) => {
  // Calculations
  const totalIncome = data.income.reduce((sum, item) => sum + (Number(item.planned) || 0), 0);
  const totalBills = data.fixedBills.reduce((sum, item) => sum + (Number(item.planned) || 0), 0);
  const totalWants = data.spendingWants.reduce((sum, item) => sum + (Number(item.planned) || 0), 0);
  const totalSavings = data.savingsGoals.reduce((sum, item) => sum + (Number(item.planned) || 0), 0);
  const totalExpenses = totalBills + totalWants;
  const remainingCash = totalIncome - (totalExpenses + totalSavings);

  // 50/30/20 benchmark calculations
  const needsPercent = totalIncome > 0 ? Math.round((totalBills / totalIncome) * 100) : 0;
  const wantsPercent = totalIncome > 0 ? Math.round((totalWants / totalIncome) * 100) : 0;
  const savingsPercent = totalIncome > 0 ? Math.round((totalSavings / totalIncome) * 100) : 0;

  // Manipulation helper
  const updateItem = (
    section: 'income' | 'fixedBills' | 'spendingWants' | 'savingsGoals',
    id: string,
    field: 'name' | 'planned' | 'category',
    val: string | number
  ) => {
    const list = data[section].map((item) =>
      item.id === id ? { ...item, [field]: field === 'planned' ? Number(val) || 0 : val } : item
    );
    onChange({ ...data, [section]: list });
  };

  const addItem = (section: 'income' | 'fixedBills' | 'spendingWants' | 'savingsGoals', defaultCategory: string) => {
    const newItem: BudgetItem = {
      id: `${section}-${Date.now()}`,
      category: defaultCategory,
      name: '',
      planned: 0,
      actual: 0,
    };
    onChange({ ...data, [section]: [...data[section], newItem] });
  };

  const removeItem = (section: 'income' | 'fixedBills' | 'spendingWants' | 'savingsGoals', id: string) => {
    onChange({
      ...data,
      [section]: data[section].filter((item) => item.id !== id),
    });
  };

  const symbol = getCurrencySymbol(currentCurrency);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="w-full sm:w-auto">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Budget Month & Year
          </label>
          <input
            type="text"
            value={data.monthYear}
            onChange={(e) => onChange({ ...data, monthYear: e.target.value })}
            className="font-bold text-lg text-slate-800 bg-transparent border border-slate-200 rounded-lg px-3 py-1.5 focus:border-emerald-500"
          />
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200/80 shrink-0">
          <span className="text-xs font-semibold text-slate-600 px-2 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Currency:
          </span>
          {(['USD', 'GBP', 'EUR'] as Currency[]).map((cur) => (
            <button
              key={cur}
              type="button"
              onClick={() => {
                onCurrencyChange(cur);
                onChange({ ...data, currency: cur });
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                currentCurrency === cur
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cur === 'USD' ? '$ USD' : cur === 'GBP' ? '£ GBP' : '€ EUR'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Income */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 sm:p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 mb-1">
            <Wallet className="w-4 h-4 text-emerald-600" /> Total Income
          </div>
          <div className="text-lg sm:text-2xl font-black text-emerald-950 font-mono">
            {formatCurrency(totalIncome, currentCurrency)}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1">Take-home earnings</div>
        </div>

        {/* Fixed Bills (Needs) */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3.5 sm:p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 mb-1">
            <Receipt className="w-4 h-4 text-blue-600" /> Fixed Bills (Needs)
          </div>
          <div className="text-lg sm:text-2xl font-black text-blue-950 font-mono">
            {formatCurrency(totalBills, currentCurrency)}
          </div>
          <div className="text-[11px] text-blue-700 mt-1">
            {needsPercent}% of income (target ~50%)
          </div>
        </div>

        {/* Wants Spending */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 sm:p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 mb-1">
            <TrendingUp className="w-4 h-4 text-amber-600" /> Spending (Wants)
          </div>
          <div className="text-lg sm:text-2xl font-black text-amber-950 font-mono">
            {formatCurrency(totalWants, currentCurrency)}
          </div>
          <div className="text-[11px] text-amber-700 mt-1">
            {wantsPercent}% of income (target ~30%)
          </div>
        </div>

        {/* Savings & Remaining */}
        <div
          className={`border rounded-2xl p-3.5 sm:p-4 ${
            remainingCash >= 0
              ? 'bg-purple-50/70 border-purple-200 text-purple-950'
              : 'bg-rose-50/80 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-semibold mb-1">
            <PiggyBank className="w-4 h-4 text-purple-600" /> Savings & Net
          </div>
          <div className="text-lg sm:text-2xl font-black font-mono">
            {formatCurrency(totalSavings, currentCurrency)}
          </div>
          <div className="text-[11px] mt-1 font-semibold flex items-center gap-1">
            Remaining:{' '}
            <span className={remainingCash < 0 ? 'text-rose-600 font-bold' : 'text-purple-700'}>
              {formatCurrency(remainingCash, currentCurrency)}
            </span>
          </div>
        </div>
      </div>

      {/* 50/30/20 Visual Health Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
          <span>50/30/20 Budget Breakdown</span>
          <span className="font-mono text-slate-500">
            Needs: {needsPercent}% | Wants: {wantsPercent}% | Savings: {savingsPercent}%
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-100 flex overflow-hidden">
          <div
            className="bg-blue-500 h-full transition-all"
            style={{ width: `${Math.min(needsPercent, 100)}%` }}
            title={`Needs: ${needsPercent}%`}
          />
          <div
            className="bg-amber-400 h-full transition-all"
            style={{ width: `${Math.min(wantsPercent, 100 - needsPercent)}%` }}
            title={`Wants: ${wantsPercent}%`}
          />
          <div
            className="bg-purple-500 h-full transition-all"
            style={{
              width: `${Math.min(savingsPercent, 100 - (needsPercent + wantsPercent))}%`,
            }}
            title={`Savings: ${savingsPercent}%`}
          />
        </div>
        {remainingCash < 0 && (
          <div className="flex items-center gap-1.5 text-xs text-rose-600 mt-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Expenses and savings exceed income by {formatCurrency(Math.abs(remainingCash), currentCurrency)}. Consider trimming discretionary spending.
          </div>
        )}
      </div>

      {/* Budget Tables */}
      <div className="space-y-6">
        {/* 1. Income Section */}
        <div className="border border-emerald-200 rounded-2xl bg-white p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                1. Monthly Income (After Tax)
              </h3>
              <p className="text-xs text-slate-500">Salaries, freelance pay, investments</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold font-mono text-emerald-800">
                {formatCurrency(totalIncome, currentCurrency)}
              </span>
              <button
                type="button"
                onClick={() => addItem('income', 'Income')}
                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md transition print:hidden"
              >
                <Plus className="w-3.5 h-3.5" /> Add row
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {data.income.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-2 items-center text-xs p-1.5 bg-slate-50/70 rounded-xl border border-slate-100"
              >
                <input
                  type="text"
                  value={item.category}
                  onChange={(e) => updateItem('income', item.id, 'category', e.target.value)}
                  placeholder="Category (e.g. Salary)"
                  className="col-span-3 sm:col-span-3 bg-white border border-slate-200 rounded px-2 py-1 text-slate-600"
                />
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem('income', item.id, 'name', e.target.value)}
                  placeholder="Source description..."
                  className="col-span-5 sm:col-span-6 bg-white border border-slate-200 rounded px-2 py-1 text-slate-800"
                />
                <div className="col-span-3 sm:col-span-2 relative flex items-center">
                  <span className="absolute left-2 text-slate-400 font-mono">{symbol}</span>
                  <input
                    type="number"
                    value={item.planned || ''}
                    onChange={(e) => updateItem('income', item.id, 'planned', e.target.value)}
                    placeholder="0"
                    className="w-full bg-white border border-slate-200 rounded pl-5 pr-2 py-1 font-mono text-right text-slate-800 font-semibold"
                  />
                </div>
                <div className="col-span-1 text-right print:hidden">
                  <button
                    type="button"
                    onClick={() => removeItem('income', item.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Fixed Bills (Needs) Section */}
        <div className="border border-blue-200 rounded-2xl bg-white p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-blue-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                2. Fixed Bills & Needs (Target: ~50%)
              </h3>
              <p className="text-xs text-slate-500">Rent/Mortgage, groceries, utilities, insurance</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold font-mono text-blue-800">
                {formatCurrency(totalBills, currentCurrency)}
              </span>
              <button
                type="button"
                onClick={() => addItem('fixedBills', 'Housing')}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition print:hidden"
              >
                <Plus className="w-3.5 h-3.5" /> Add row
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {data.fixedBills.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-2 items-center text-xs p-1.5 bg-slate-50/70 rounded-xl border border-slate-100"
              >
                <input
                  type="text"
                  value={item.category}
                  onChange={(e) => updateItem('fixedBills', item.id, 'category', e.target.value)}
                  placeholder="Category"
                  className="col-span-3 sm:col-span-3 bg-white border border-slate-200 rounded px-2 py-1 text-slate-600"
                />
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem('fixedBills', item.id, 'name', e.target.value)}
                  placeholder="Bill name / service..."
                  className="col-span-5 sm:col-span-6 bg-white border border-slate-200 rounded px-2 py-1 text-slate-800"
                />
                <div className="col-span-3 sm:col-span-2 relative flex items-center">
                  <span className="absolute left-2 text-slate-400 font-mono">{symbol}</span>
                  <input
                    type="number"
                    value={item.planned || ''}
                    onChange={(e) => updateItem('fixedBills', item.id, 'planned', e.target.value)}
                    placeholder="0"
                    className="w-full bg-white border border-slate-200 rounded pl-5 pr-2 py-1 font-mono text-right text-slate-800 font-semibold"
                  />
                </div>
                <div className="col-span-1 text-right print:hidden">
                  <button
                    type="button"
                    onClick={() => removeItem('fixedBills', item.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Discretionary Spending (Wants) Section */}
        <div className="border border-amber-200 rounded-2xl bg-white p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                3. Discretionary Spending & Wants (Target: ~30%)
              </h3>
              <p className="text-xs text-slate-500">Dining out, entertainment, subscriptions, hobbies</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold font-mono text-amber-800">
                {formatCurrency(totalWants, currentCurrency)}
              </span>
              <button
                type="button"
                onClick={() => addItem('spendingWants', 'Dining')}
                className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-md transition print:hidden"
              >
                <Plus className="w-3.5 h-3.5" /> Add row
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {data.spendingWants.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-2 items-center text-xs p-1.5 bg-slate-50/70 rounded-xl border border-slate-100"
              >
                <input
                  type="text"
                  value={item.category}
                  onChange={(e) => updateItem('spendingWants', item.id, 'category', e.target.value)}
                  placeholder="Category"
                  className="col-span-3 sm:col-span-3 bg-white border border-slate-200 rounded px-2 py-1 text-slate-600"
                />
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem('spendingWants', item.id, 'name', e.target.value)}
                  placeholder="Item description..."
                  className="col-span-5 sm:col-span-6 bg-white border border-slate-200 rounded px-2 py-1 text-slate-800"
                />
                <div className="col-span-3 sm:col-span-2 relative flex items-center">
                  <span className="absolute left-2 text-slate-400 font-mono">{symbol}</span>
                  <input
                    type="number"
                    value={item.planned || ''}
                    onChange={(e) => updateItem('spendingWants', item.id, 'planned', e.target.value)}
                    placeholder="0"
                    className="w-full bg-white border border-slate-200 rounded pl-5 pr-2 py-1 font-mono text-right text-slate-800 font-semibold"
                  />
                </div>
                <div className="col-span-1 text-right print:hidden">
                  <button
                    type="button"
                    onClick={() => removeItem('spendingWants', item.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Savings & Debt Goals Section */}
        <div className="border border-purple-200 rounded-2xl bg-white p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-purple-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                4. Savings Goals & Debt Paydown (Target: ~20%)
              </h3>
              <p className="text-xs text-slate-500">Emergency fund, retirement, extra debt payments</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold font-mono text-purple-800">
                {formatCurrency(totalSavings, currentCurrency)}
              </span>
              <button
                type="button"
                onClick={() => addItem('savingsGoals', 'Emergency')}
                className="inline-flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-md transition print:hidden"
              >
                <Plus className="w-3.5 h-3.5" /> Add row
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {data.savingsGoals.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-2 items-center text-xs p-1.5 bg-slate-50/70 rounded-xl border border-slate-100"
              >
                <input
                  type="text"
                  value={item.category}
                  onChange={(e) => updateItem('savingsGoals', item.id, 'category', e.target.value)}
                  placeholder="Category"
                  className="col-span-3 sm:col-span-3 bg-white border border-slate-200 rounded px-2 py-1 text-slate-600"
                />
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem('savingsGoals', item.id, 'name', e.target.value)}
                  placeholder="Savings pot / debt item..."
                  className="col-span-5 sm:col-span-6 bg-white border border-slate-200 rounded px-2 py-1 text-slate-800"
                />
                <div className="col-span-3 sm:col-span-2 relative flex items-center">
                  <span className="absolute left-2 text-slate-400 font-mono">{symbol}</span>
                  <input
                    type="number"
                    value={item.planned || ''}
                    onChange={(e) => updateItem('savingsGoals', item.id, 'planned', e.target.value)}
                    placeholder="0"
                    className="w-full bg-white border border-slate-200 rounded pl-5 pr-2 py-1 font-mono text-right text-slate-800 font-semibold"
                  />
                </div>
                <div className="col-span-1 text-right print:hidden">
                  <button
                    type="button"
                    onClick={() => removeItem('savingsGoals', item.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Budget Notes & Disclaimer */}
      <div className="border border-slate-200 rounded-2xl p-4 bg-white">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
          Budget Strategy Notes & Action Steps
        </label>
        <textarea
          value={data.notes}
          onChange={(e) => onChange({ ...data, notes: e.target.value })}
          placeholder="e.g. Cancel unused subscriptions this month, transfer $200 directly on payday..."
          rows={2}
          className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-emerald-500 focus:outline-hidden resize-none"
        />
        <p className="text-[11px] text-slate-500 mt-2 italic">
          Disclaimer: This budget planner is a general organization tool and does not constitute financial advice. For decisions about personal finance, please consult a certified financial advisor.
        </p>
      </div>
    </div>
  );
};
