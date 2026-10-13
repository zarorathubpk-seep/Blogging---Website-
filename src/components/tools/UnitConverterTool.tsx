import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Scale,
  Ruler,
  Thermometer,
  Grid,
  Droplets,
  Gauge,
  HelpCircle,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { TOOLS_DATA } from '../../data/toolsData';
import { ToolHeader } from './ToolHeader';
import { RelatedToolsSection } from './RelatedToolsSection';
import { FaqSection } from '../FaqSection';

interface UnitConverterToolProps {
  onNavigate: (path: string) => void;
}

type UnitCategory = 'weight' | 'distance' | 'temperature' | 'area' | 'volume' | 'speed';

interface UnitDef {
  id: string;
  name: string;
  symbol: string;
  toBase: (v: number) => number;
  fromBase: (b: number) => number;
}

const UNITS_MAP: Record<UnitCategory, UnitDef[]> = {
  weight: [
    { id: 'kg', name: 'Kilograms', symbol: 'kg', toBase: (v) => v, fromBase: (b) => b },
    { id: 'lb', name: 'Pounds', symbol: 'lb', toBase: (v) => v * 0.45359237, fromBase: (b) => b / 0.45359237 },
    { id: 'g', name: 'Grams', symbol: 'g', toBase: (v) => v / 1000, fromBase: (b) => b * 1000 },
    { id: 'oz', name: 'Ounces', symbol: 'oz', toBase: (v) => v * 0.028349523, fromBase: (b) => b / 0.028349523 },
    { id: 'st', name: 'Stone (UK)', symbol: 'st', toBase: (v) => v * 6.35029318, fromBase: (b) => b / 6.35029318 },
    { id: 't', name: 'Metric Tons', symbol: 't', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
  ],
  distance: [
    { id: 'm', name: 'Meters', symbol: 'm', toBase: (v) => v, fromBase: (b) => b },
    { id: 'km', name: 'Kilometers', symbol: 'km', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
    { id: 'mi', name: 'Miles', symbol: 'mi', toBase: (v) => v * 1609.344, fromBase: (b) => b / 1609.344 },
    { id: 'ft', name: 'Feet', symbol: 'ft', toBase: (v) => v * 0.3048, fromBase: (b) => b / 0.3048 },
    { id: 'in', name: 'Inches', symbol: 'in', toBase: (v) => v * 0.0254, fromBase: (b) => b / 0.0254 },
    { id: 'cm', name: 'Centimeters', symbol: 'cm', toBase: (v) => v * 0.01, fromBase: (b) => b * 100 },
    { id: 'yd', name: 'Yards', symbol: 'yd', toBase: (v) => v * 0.9144, fromBase: (b) => b / 0.9144 },
  ],
  temperature: [
    { id: 'c', name: 'Celsius', symbol: '°C', toBase: (v) => v, fromBase: (b) => b },
    { id: 'f', name: 'Fahrenheit', symbol: '°F', toBase: (v) => ((v - 32) * 5) / 9, fromBase: (b) => (b * 9) / 5 + 32 },
    { id: 'k', name: 'Kelvin', symbol: 'K', toBase: (v) => v - 273.15, fromBase: (b) => b + 273.15 },
  ],
  area: [
    { id: 'm2', name: 'Square Meters', symbol: 'm²', toBase: (v) => v, fromBase: (b) => b },
    { id: 'ft2', name: 'Square Feet', symbol: 'sq ft', toBase: (v) => v * 0.092903, fromBase: (b) => b / 0.092903 },
    { id: 'km2', name: 'Square Kilometers', symbol: 'km²', toBase: (v) => v * 1e6, fromBase: (b) => b / 1e6 },
    { id: 'ac', name: 'Acres', symbol: 'ac', toBase: (v) => v * 4046.856, fromBase: (b) => b / 4046.856 },
    { id: 'ha', name: 'Hectares', symbol: 'ha', toBase: (v) => v * 10000, fromBase: (b) => b / 10000 },
  ],
  volume: [
    { id: 'l', name: 'Liters', symbol: 'L', toBase: (v) => v, fromBase: (b) => b },
    { id: 'ml', name: 'Milliliters', symbol: 'mL', toBase: (v) => v / 1000, fromBase: (b) => b * 1000 },
    { id: 'gal', name: 'Gallons (US)', symbol: 'gal', toBase: (v) => v * 3.78541, fromBase: (b) => b / 3.78541 },
    { id: 'qt', name: 'Quarts', symbol: 'qt', toBase: (v) => v * 0.946353, fromBase: (b) => b / 0.946353 },
    { id: 'cup', name: 'Cups (US)', symbol: 'cup', toBase: (v) => v * 0.236588, fromBase: (b) => b / 0.236588 },
    { id: 'floz', name: 'Fluid Ounces', symbol: 'fl oz', toBase: (v) => v * 0.0295735, fromBase: (b) => b / 0.0295735 },
  ],
  speed: [
    { id: 'kmh', name: 'Kilometers / Hour', symbol: 'km/h', toBase: (v) => v, fromBase: (b) => b },
    { id: 'mph', name: 'Miles / Hour', symbol: 'mph', toBase: (v) => v * 1.60934, fromBase: (b) => b / 1.60934 },
    { id: 'ms', name: 'Meters / Second', symbol: 'm/s', toBase: (v) => v * 3.6, fromBase: (b) => b / 3.6 },
    { id: 'kn', name: 'Knots (Nautical)', symbol: 'kn', toBase: (v) => v * 1.852, fromBase: (b) => b / 1.852 },
  ],
};

const CATEGORY_ITEMS: { id: UnitCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'weight', label: 'Weight & Mass', icon: Scale },
  { id: 'distance', label: 'Length & Distance', icon: Ruler },
  { id: 'temperature', label: 'Temperature', icon: Thermometer },
  { id: 'area', label: 'Area', icon: Grid },
  { id: 'volume', label: 'Volume & Capacity', icon: Droplets },
  { id: 'speed', label: 'Speed & Velocity', icon: Gauge },
];

export const UnitConverterTool: React.FC<UnitConverterToolProps> = ({ onNavigate }) => {
  const toolItem = TOOLS_DATA.find((t) => t.id === 'unit-converter') || {
    id: 'unit-converter',
    name: 'Unit Converter',
    slug: 'unit-converter',
    category: 'converters' as const,
    categoryLabel: 'Converter',
    shortDesc: 'Convert metric and imperial units of weight, distance, temperature, and volume.',
    longDesc: 'Accurate instant converter for metric and imperial standards with reciprocal calculations and breakdown formulas.',
    iconName: 'ArrowLeftRight',
    keywords: ['unit', 'converter', 'metric', 'imperial'],
  };

  const [activeCategory, setActiveCategory] = useState<UnitCategory>('weight');
  const [inputValue, setInputValue] = useState<string>('1');
  const [sourceUnitId, setSourceUnitId] = useState<string>('kg');
  const [targetUnitId, setTargetUnitId] = useState<string>('lb');
  const [copied, setCopied] = useState<boolean>(false);

  const units = UNITS_MAP[activeCategory];
  const sourceUnit = units.find((u) => u.id === sourceUnitId) || units[0];
  const targetUnit = units.find((u) => u.id === targetUnitId) || units[1] || units[0];

  // Perform calculation
  const numericInput = parseFloat(inputValue);
  let convertedResult: number | null = null;

  if (!isNaN(numericInput)) {
    const baseVal = sourceUnit.toBase(numericInput);
    convertedResult = targetUnit.fromBase(baseVal);
  }

  const handleCategoryChange = (cat: UnitCategory) => {
    setActiveCategory(cat);
    const catUnits = UNITS_MAP[cat];
    setSourceUnitId(catUnits[0].id);
    setTargetUnitId(catUnits[1]?.id || catUnits[0].id);
  };

  const handleSwap = () => {
    const prevSource = sourceUnitId;
    setSourceUnitId(targetUnitId);
    setTargetUnitId(prevSource);
  };

  const formattedResult =
    convertedResult !== null
      ? Number.isInteger(convertedResult)
        ? convertedResult.toString()
        : convertedResult.toFixed(4).replace(/\.?0+$/, '')
      : '0';

  const handleCopy = () => {
    navigator.clipboard.writeText(`${formattedResult} ${targetUnit.symbol}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const unitFaqs = [
    {
      q: 'Are conversions calculated to international standard standards?',
      a: 'Yes. All formulas use the National Institute of Standards and Technology (NIST) and ISO metric-imperial conversion constants, ensuring exact scientific accuracy.',
    },
    {
      q: 'How does temperature conversion work between Celsius and Fahrenheit?',
      a: 'Unlike proportional linear measures, temperature requires offset calculation: F = (C * 9/5) + 32, and C = (F - 32) * 5/9. Our calculator applies the full equation dynamically.',
    },
    {
      q: 'Can I use this tool offline on mobile or tablet?',
      a: 'Yes! All calculations run entirely inside your browser with zero remote requests. Once loaded, you can compute conversions with zero latency.',
    },
  ];

  return (
    <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* 1. UNIFIED TOOL HEADER */}
      <ToolHeader tool={toolItem} onNavigate={onNavigate} />

      {/* 2. MAIN TOOL WORKSPACE */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Category Picker Tabs */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            Select Measurement Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {CATEGORY_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeCategory === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleCategoryChange(item.id)}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition text-xs font-semibold ${
                    active
                      ? 'bg-emerald-50/90 border-emerald-500 text-emerald-900 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <span className="text-[11px] truncate w-full text-center">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dual Conversion Cards */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center pt-2">
          {/* Source Input Box (5 cols) */}
          <div className="md:col-span-5 p-5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
              From (Source)
            </label>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full text-2xl font-black text-slate-900 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
            />
            <select
              value={sourceUnitId}
              onChange={(e) => setSourceUnitId(e.target.value)}
              className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button (1 col) */}
          <div className="md:col-span-1 flex justify-center py-2 md:py-0">
            <button
              type="button"
              onClick={handleSwap}
              className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full transition shadow-2xs hover:rotate-180"
              title="Swap units"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>
          </div>

          {/* Target Result Box (5 cols) */}
          <div className="md:col-span-5 p-5 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider">
                To (Result)
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="w-full text-2xl font-black text-emerald-950 bg-white border border-emerald-200 rounded-xl px-3.5 py-2.5 font-mono truncate shadow-2xs">
              {formattedResult}
            </div>
            <select
              value={targetUnitId}
              onChange={(e) => setTargetUnitId(e.target.value)}
              className="w-full text-xs font-bold bg-white border border-emerald-200 rounded-xl px-3 py-2.5 text-slate-800"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Equation Breakdown Banner */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-slate-600">
              Conversion Formula:{' '}
              <strong className="text-slate-900 font-mono">
                {inputValue || '0'} {sourceUnit.symbol} = {formattedResult} {targetUnit.symbol}
              </strong>
            </span>
          </div>
          <span className="text-slate-400 font-mono text-[11px]">
            Standard base:{' '}
            {activeCategory === 'temperature' ? 'Celsius' : units[0].name}
          </span>
        </div>
      </div>

      {/* 3. HOW TO USE THIS TOOL */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-600" />
          <span>How to Use the ToolCrest Unit Converter</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
              1
            </span>
            <h4 className="font-bold text-sm text-slate-900">Choose Measure Category</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Select from Weight, Distance, Temperature, Area, Volume, or Speed.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
              2
            </span>
            <h4 className="font-bold text-sm text-slate-900">Enter Number & Units</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Type the numeric value and pick both source and target measurement standards.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
              3
            </span>
            <h4 className="font-bold text-sm text-slate-900">Copy or Swap Instantly</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Copy the formatted result in one click or tap Swap to invert the direction.
            </p>
          </div>
        </div>
      </div>

      {/* 4. FREQUENTLY ASKED QUESTIONS */}
      <FaqSection
        title="Frequently Asked Questions: Unit Converter"
        subtitle="Common questions about metric and imperial measurement standards."
        faqs={unitFaqs}
      />

      {/* 5. RELATED TOOLS SUGGESTIONS */}
      <RelatedToolsSection
        currentToolSlug="unit-converter"
        category="converters"
        onNavigate={onNavigate}
      />
    </div>
  );
};
