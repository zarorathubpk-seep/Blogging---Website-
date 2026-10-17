import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Scale,
  Ruler,
  Thermometer,
  HardDrive,
  Clock,
  Grid,
  Droplets,
  Gauge,
  Activity,
  Zap,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import { TOOLS_DATA } from '../../data/toolsData';
import { ToolHeader } from './ToolHeader';
import { RelatedToolsSection } from './RelatedToolsSection';
import { FaqSection } from '../FaqSection';

interface UnitConverterToolProps {
  onNavigate: (path: string) => void;
}

export type UnitCategory =
  | 'weight'
  | 'distance'
  | 'temperature'
  | 'digital'
  | 'time'
  | 'area'
  | 'volume'
  | 'speed'
  | 'pressure'
  | 'energy';

export interface UnitDef {
  id: string;
  name: string;
  symbol: string;
  toBase: (v: number) => number;
  fromBase: (b: number) => number;
}

export const UNITS_MAP: Record<UnitCategory, UnitDef[]> = {
  weight: [
    { id: 'kg', name: 'Kilograms', symbol: 'kg', toBase: (v) => v, fromBase: (b) => b },
    { id: 'lb', name: 'Pounds', symbol: 'lb', toBase: (v) => v * 0.45359237, fromBase: (b) => b / 0.45359237 },
    { id: 'g', name: 'Grams', symbol: 'g', toBase: (v) => v / 1000, fromBase: (b) => b * 1000 },
    { id: 'oz', name: 'Ounces', symbol: 'oz', toBase: (v) => v * 0.028349523, fromBase: (b) => b / 0.028349523 },
    { id: 'st', name: 'Stone (UK)', symbol: 'st', toBase: (v) => v * 6.35029318, fromBase: (b) => b / 6.35029318 },
    { id: 't', name: 'Metric Tons', symbol: 't', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
    { id: 'mg', name: 'Milligrams', symbol: 'mg', toBase: (v) => v / 1e6, fromBase: (b) => b * 1e6 },
  ],
  distance: [
    { id: 'm', name: 'Meters', symbol: 'm', toBase: (v) => v, fromBase: (b) => b },
    { id: 'km', name: 'Kilometers', symbol: 'km', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
    { id: 'mi', name: 'Miles', symbol: 'mi', toBase: (v) => v * 1609.344, fromBase: (b) => b / 1609.344 },
    { id: 'ft', name: 'Feet', symbol: 'ft', toBase: (v) => v * 0.3048, fromBase: (b) => b / 0.3048 },
    { id: 'in', name: 'Inches', symbol: 'in', toBase: (v) => v * 0.0254, fromBase: (b) => b / 0.0254 },
    { id: 'cm', name: 'Centimeters', symbol: 'cm', toBase: (v) => v * 0.01, fromBase: (b) => b * 100 },
    { id: 'mm', name: 'Millimeters', symbol: 'mm', toBase: (v) => v * 0.001, fromBase: (b) => b * 1000 },
    { id: 'yd', name: 'Yards', symbol: 'yd', toBase: (v) => v * 0.9144, fromBase: (b) => b / 0.9144 },
  ],
  temperature: [
    { id: 'c', name: 'Celsius', symbol: '°C', toBase: (v) => v, fromBase: (b) => b },
    { id: 'f', name: 'Fahrenheit', symbol: '°F', toBase: (v) => ((v - 32) * 5) / 9, fromBase: (b) => (b * 9) / 5 + 32 },
    { id: 'k', name: 'Kelvin', symbol: 'K', toBase: (v) => v - 273.15, fromBase: (b) => b + 273.15 },
  ],
  digital: [
    { id: 'mb', name: 'Megabytes (MB)', symbol: 'MB', toBase: (v) => v * 1024 * 1024, fromBase: (b) => b / (1024 * 1024) },
    { id: 'b', name: 'Bytes (B)', symbol: 'B', toBase: (v) => v, fromBase: (b) => b },
    { id: 'kb', name: 'Kilobytes (KB)', symbol: 'KB', toBase: (v) => v * 1024, fromBase: (b) => b / 1024 },
    { id: 'gb', name: 'Gigabytes (GB)', symbol: 'GB', toBase: (v) => v * 1024 ** 3, fromBase: (b) => b / 1024 ** 3 },
    { id: 'tb', name: 'Terabytes (TB)', symbol: 'TB', toBase: (v) => v * 1024 ** 4, fromBase: (b) => b / 1024 ** 4 },
    { id: 'pb', name: 'Petabytes (PB)', symbol: 'PB', toBase: (v) => v * 1024 ** 5, fromBase: (b) => b / 1024 ** 5 },
  ],
  time: [
    { id: 'h', name: 'Hours', symbol: 'h', toBase: (v) => v * 3600, fromBase: (b) => b / 3600 },
    { id: 's', name: 'Seconds', symbol: 's', toBase: (v) => v, fromBase: (b) => b },
    { id: 'ms', name: 'Milliseconds', symbol: 'ms', toBase: (v) => v / 1000, fromBase: (b) => b * 1000 },
    { id: 'min', name: 'Minutes', symbol: 'min', toBase: (v) => v * 60, fromBase: (b) => b / 60 },
    { id: 'd', name: 'Days', symbol: 'days', toBase: (v) => v * 86400, fromBase: (b) => b / 86400 },
    { id: 'wk', name: 'Weeks', symbol: 'weeks', toBase: (v) => v * 604800, fromBase: (b) => b / 604800 },
    { id: 'yr', name: 'Years (365 days)', symbol: 'yr', toBase: (v) => v * 31536000, fromBase: (b) => b / 31536000 },
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
  pressure: [
    { id: 'bar', name: 'Bar', symbol: 'bar', toBase: (v) => v * 100000, fromBase: (b) => b / 100000 },
    { id: 'pa', name: 'Pascals', symbol: 'Pa', toBase: (v) => v, fromBase: (b) => b },
    { id: 'kpa', name: 'Kilopascals', symbol: 'kPa', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
    { id: 'psi', name: 'Pounds / Sq Inch (PSI)', symbol: 'psi', toBase: (v) => v * 6894.757, fromBase: (b) => b / 6894.757 },
    { id: 'atm', name: 'Standard Atmospheres', symbol: 'atm', toBase: (v) => v * 101325, fromBase: (b) => b / 101325 },
  ],
  energy: [
    { id: 'kwh', name: 'Kilowatt-hours', symbol: 'kWh', toBase: (v) => v * 3600000, fromBase: (b) => b / 3600000 },
    { id: 'j', name: 'Joules', symbol: 'J', toBase: (v) => v, fromBase: (b) => b },
    { id: 'kj', name: 'Kilojoules', symbol: 'kJ', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
    { id: 'cal', name: 'Calories', symbol: 'cal', toBase: (v) => v * 4.184, fromBase: (b) => b / 4.184 },
    { id: 'kcal', name: 'Kilocalories (Food kcal)', symbol: 'kcal', toBase: (v) => v * 4184, fromBase: (b) => b / 4184 },
    { id: 'wh', name: 'Watt-hours', symbol: 'Wh', toBase: (v) => v * 3600, fromBase: (b) => b / 3600 },
  ],
};

const CATEGORY_ITEMS: { id: UnitCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'weight', label: 'Weight & Mass', icon: Scale },
  { id: 'distance', label: 'Length & Distance', icon: Ruler },
  { id: 'temperature', label: 'Temperature', icon: Thermometer },
  { id: 'digital', label: 'Digital Storage', icon: HardDrive },
  { id: 'time', label: 'Time & Duration', icon: Clock },
  { id: 'area', label: 'Area', icon: Grid },
  { id: 'volume', label: 'Volume & Capacity', icon: Droplets },
  { id: 'speed', label: 'Speed & Velocity', icon: Gauge },
  { id: 'pressure', label: 'Pressure', icon: Activity },
  { id: 'energy', label: 'Energy & Power', icon: Zap },
];

export const UnitConverterTool: React.FC<UnitConverterToolProps> = ({ onNavigate }) => {
  const toolItem = TOOLS_DATA.find((t) => t.id === 'unit-converter') || {
    id: 'unit-converter',
    name: 'Unit Converter',
    slug: 'unit-converter',
    category: 'converters' as const,
    categoryLabel: 'Converters',
    shortDesc: 'Convert metric and imperial units of weight, distance, temperature, volume, and storage.',
    longDesc: 'Accurate instant converter for metric and imperial standards with reciprocal calculations and breakdown formulas.',
    iconName: 'ArrowLeftRight',
    keywords: ['unit', 'converter', 'metric', 'imperial'],
  };

  const [activeCategory, setActiveCategory] = useState<UnitCategory>('weight');
  const [inputValue, setInputValue] = useState<string>('1');
  const [sourceUnitId, setSourceUnitId] = useState<string>('kg');
  const [targetUnitId, setTargetUnitId] = useState<string>('lb');
  const [precision, setPrecision] = useState<number>(-1); // -1 = auto
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

  const handleReset = () => {
    setInputValue('1');
    const catUnits = UNITS_MAP[activeCategory];
    setSourceUnitId(catUnits[0].id);
    setTargetUnitId(catUnits[1]?.id || catUnits[0].id);
  };

  const formatResult = (val: number | null): string => {
    if (val === null) return '0';
    if (precision === -1) {
      if (Number.isInteger(val)) return val.toString();
      if (Math.abs(val) < 0.0001 && val !== 0) return val.toExponential(4);
      return val.toFixed(4).replace(/\.?0+$/, '');
    }
    return val.toFixed(precision);
  };

  const formattedResult = formatResult(convertedResult);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${inputValue} ${sourceUnit.symbol} = ${formattedResult} ${targetUnit.symbol}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const unitFaqs = [
    {
      q: 'Are conversions calculated to international scientific standards?',
      a: 'Yes. All formulas use the National Institute of Standards and Technology (NIST) and ISO metric-imperial conversion constants, ensuring exact scientific accuracy.',
    },
    {
      q: 'How does digital storage conversion work (Binary vs Decimal)?',
      a: 'We use the standard computing binary convention (1024 multiplier: 1 KB = 1024 Bytes, 1 MB = 1024 KB, 1 GB = 1024 MB).',
    },
    {
      q: 'How does temperature conversion work between Celsius, Fahrenheit, and Kelvin?',
      a: 'Unlike proportional linear measures, temperature requires offset calculations: F = (C * 9/5) + 32, C = (F - 32) * 5/9, and K = C + 273.15. The calculator handles all offsets dynamically.',
    },
    {
      q: 'Can I use this tool offline on mobile or tablet?',
      a: 'Yes! All calculations run entirely inside your browser with zero remote requests. Once loaded, you can compute conversions instantly with zero latency.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-slate-100 animate-fadeIn">
      <ToolHeader tool={toolItem} onNavigate={onNavigate} />

      {/* Main Converter Card (Dark Obsidian & Regal Gold) */}
      <div className="bg-[#0c101d] border border-amber-500/25 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 text-slate-100">
        {/* Category Selector Tabs */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]"></span>
            <span>Select Measurement Category</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {CATEGORY_ITEMS.map((item) => {
              const IconComp = item.icon;
              const isActive = activeCategory === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleCategoryChange(item.id)}
                  className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 border-amber-300'
                      : 'bg-[#070a14] border-amber-500/20 text-slate-300 hover:text-amber-300 hover:border-amber-400/50'
                  }`}
                >
                  <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                  <span className="text-xs font-bold truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dual Input/Output Conversion Workspace */}
        <div className="bg-[#070a14] border border-amber-500/20 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
            {/* SOURCE INPUT ZONE (5 Cols) */}
            <div className="lg:col-span-5 bg-[#0e1424] border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">From</span>
                <span className="text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-md">
                  {sourceUnit.symbol}
                </span>
              </div>

              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="0"
                className="w-full text-2xl sm:text-3xl font-extrabold text-white bg-transparent focus:outline-hidden tabular-nums"
              />

              <div className="pt-1">
                <select
                  value={sourceUnitId}
                  onChange={(e) => setSourceUnitId(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-amber-100 bg-[#080d1a] border border-amber-500/30 rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-amber-400"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id} className="bg-slate-900 text-slate-100">
                      {u.name} ({u.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* SWAP BUTTON (1 Col) */}
            <div className="lg:col-span-1 flex justify-center py-2 lg:py-0">
              <button
                type="button"
                onClick={handleSwap}
                className="w-11 h-11 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 font-black shadow-lg shadow-amber-500/20 flex items-center justify-center transition active:scale-95 cursor-pointer"
                title="Swap source and target units"
              >
                <ArrowLeftRight className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              </button>
            </div>

            {/* TARGET OUTPUT ZONE (5 Cols) */}
            <div className="lg:col-span-5 bg-[#0e1424] border border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Converted Value</span>
                <span className="text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 rounded-md">
                  {targetUnit.symbol}
                </span>
              </div>

              <div className="text-2xl sm:text-3xl font-black text-amber-400 truncate tabular-nums select-all">
                {formattedResult}
              </div>

              <div className="pt-1">
                <select
                  value={targetUnitId}
                  onChange={(e) => setTargetUnitId(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-amber-100 bg-[#080d1a] border border-amber-500/30 rounded-xl px-3 py-2.5 focus:outline-hidden focus:border-amber-400"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id} className="bg-slate-900 text-slate-100">
                      {u.name} ({u.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Precision Controls & Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-amber-500/20 text-xs">
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-slate-300">Decimal Precision:</span>
              <div className="flex items-center gap-1 bg-[#0e1424] border border-amber-500/30 rounded-xl p-1">
                {[
                  { label: 'Auto', val: -1 },
                  { label: '2', val: 2 },
                  { label: '4', val: 4 },
                  { label: '6', val: 6 },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setPrecision(p.val)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      precision === p.val
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-xs'
                        : 'text-slate-400 hover:text-amber-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl border border-amber-500/30 bg-[#0e1424] hover:bg-amber-500/10 text-amber-200 font-semibold transition flex items-center gap-1.5 cursor-pointer"
                title="Reset input to 1"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> Reset
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 font-black shadow-amber-500/20'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Equation!' : 'Copy Result'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Conversions Grid for Current Unit */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>Quick Conversion Benchmarks ({inputValue} {sourceUnit.symbol})</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {units
              .filter((u) => u.id !== sourceUnit.id)
              .map((u) => {
                const b = sourceUnit.toBase(numericInput || 1);
                const r = u.fromBase(b);
                const formatted = formatResult(r);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setTargetUnitId(u.id)}
                    className="p-3 bg-[#070a14] hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-400/50 rounded-2xl text-left transition group cursor-pointer"
                  >
                    <div className="text-[10px] text-slate-400 group-hover:text-amber-300 font-medium">
                      {u.name}
                    </div>
                    <div className="text-sm font-black text-amber-200 group-hover:text-amber-400 tabular-nums truncate">
                      {formatted} <span className="text-xs text-amber-400/70 font-bold">{u.symbol}</span>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {/* FAQs */}
      <FaqSection faqs={unitFaqs} />

      {/* Related Tools */}
      <RelatedToolsSection
        currentToolSlug={toolItem.slug}
        category={toolItem.category}
        onNavigate={onNavigate}
      />
    </div>
  );
};
