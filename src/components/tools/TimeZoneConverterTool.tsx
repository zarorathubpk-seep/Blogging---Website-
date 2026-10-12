import React, { useState, useEffect } from 'react';
import {
  Clock,
  Search,
  ArrowLeftRight,
  Globe,
  Plus,
  Trash2,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface TimeZoneConverterToolProps {
  onNavigate: (path: string) => void;
}

interface CityZone {
  id: string;
  city: string;
  country: string;
  timeZone: string;
  flag: string;
}

const POPULAR_ZONES: CityZone[] = [
  { id: 'nyc', city: 'New York', country: 'United States', timeZone: 'America/New_York', flag: '🇺🇸' },
  { id: 'lon', city: 'London', country: 'United Kingdom', timeZone: 'Europe/London', flag: '🇬🇧' },
  { id: 'lax', city: 'Los Angeles', country: 'United States', timeZone: 'America/Los_Angeles', flag: '🇺🇸' },
  { id: 'tok', city: 'Tokyo', country: 'Japan', timeZone: 'Asia/Tokyo', flag: '🇯🇵' },
  { id: 'syd', city: 'Sydney', country: 'Australia', timeZone: 'Australia/Sydney', flag: '🇦🇺' },
  { id: 'par', city: 'Paris', country: 'France', timeZone: 'Europe/Paris', flag: '🇫🇷' },
  { id: 'dxb', city: 'Dubai', country: 'United Arab Emirates', timeZone: 'Asia/Dubai', flag: '🇦🇪' },
  { id: 'sin', city: 'Singapore', country: 'Singapore', timeZone: 'Asia/Singapore', flag: '🇸🇬' },
  { id: 'tor', city: 'Toronto', country: 'Canada', timeZone: 'America/Toronto', flag: '🇨🇦' },
  { id: 'ber', city: 'Berlin', country: 'Germany', timeZone: 'Europe/Berlin', flag: '🇩🇪' },
  { id: 'bom', city: 'Mumbai', country: 'India', timeZone: 'Asia/Kolkata', flag: '🇮🇳' },
  { id: 'utc', city: 'UTC / GMT', country: 'Universal Time', timeZone: 'UTC', flag: '🌐' },
];

export const TimeZoneConverterTool: React.FC<TimeZoneConverterToolProps> = ({ onNavigate }) => {
  const [sourceZone, setSourceZone] = useState<CityZone>(POPULAR_ZONES[0]); // New York
  const [targetZone, setTargetZone] = useState<CityZone>(POPULAR_ZONES[1]); // London
  const [comparisonList, setComparisonList] = useState<CityZone[]>([
    POPULAR_ZONES[0],
    POPULAR_ZONES[1],
    POPULAR_ZONES[2],
    POPULAR_ZONES[3],
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [timeHour, setTimeHour] = useState<number>(() => new Date().getHours());
  const [timeMinute, setTimeMinute] = useState<number>(0);
  const [liveNow, setLiveNow] = useState(new Date());
  const [copied, setCopied] = useState(false);

  // Live timer tick
  useEffect(() => {
    const timer = setInterval(() => setLiveNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSwap = () => {
    const temp = sourceZone;
    setSourceZone(targetZone);
    setTargetZone(temp);
  };

  // Convert selected hour & minute to target timezone
  const getConvertedTime = (zone: string) => {
    try {
      const baseDate = new Date(`${currentDate}T${String(timeHour).padStart(2, '0')}:${String(timeMinute).padStart(2, '0')}:00`);
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: zone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      return formatter.format(baseDate);
    } catch {
      return '—';
    }
  };

  const getLiveTime = (zone: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: zone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(liveNow);
    } catch {
      return '—';
    }
  };

  const filteredZones = POPULAR_ZONES.filter(
    (z) =>
      z.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      z.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      z.timeZone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addCityToCompare = (zone: CityZone) => {
    if (!comparisonList.some((c) => c.id === zone.id)) {
      setComparisonList((prev) => [...prev, zone]);
    }
  };

  const removeCity = (id: string) => {
    setComparisonList((prev) => prev.filter((c) => c.id !== id));
  };

  const handleCopyMeetingSummary = () => {
    const summary = comparisonList
      .map((c) => `${c.city} (${c.flag}): ${getConvertedTime(c.timeZone)}`)
      .join('\n');
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
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
        <span className="text-slate-700 font-semibold">Time Zone Converter</span>
      </nav>

      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center font-bold shadow-2xs">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Global Time Zone Converter
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Calculate international meeting hours, compare city times, and account for daylight saving changes automatically.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50/80 px-3 py-1.5 rounded-xl border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>DST Compliant • Live Global Clocks</span>
          </div>
        </div>
      </div>

      {/* Main 2-City Direct Converter Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <input
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              setTimeHour(now.getHours());
              setTimeMinute(now.getMinutes());
              setCurrentDate(now.toISOString().split('T')[0]);
            }}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" /> Reset to Current Time
          </button>
        </div>

        {/* 2 Cities Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* Source City (5 cols) */}
          <div className="md:col-span-5 p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Source Location
              </span>
              <span className="text-xs font-mono text-emerald-700 font-semibold">
                Live: {getLiveTime(sourceZone.timeZone)}
              </span>
            </div>
            <select
              value={sourceZone.id}
              onChange={(e) => {
                const found = POPULAR_ZONES.find((z) => z.id === e.target.value);
                if (found) setSourceZone(found);
              }}
              className="w-full text-sm font-bold bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900"
            >
              {POPULAR_ZONES.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.flag} {z.city}, {z.country} ({z.timeZone})
                </option>
              ))}
            </select>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {getConvertedTime(sourceZone.timeZone)}
            </div>
          </div>

          {/* Swap Button (1 col) */}
          <div className="md:col-span-1 flex justify-center">
            <button
              type="button"
              onClick={handleSwap}
              className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full transition shadow-2xs hover:rotate-180"
              title="Swap cities"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>
          </div>

          {/* Target City (5 cols) */}
          <div className="md:col-span-5 p-5 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Target Location
              </span>
              <span className="text-xs font-mono text-emerald-700 font-semibold">
                Live: {getLiveTime(targetZone.timeZone)}
              </span>
            </div>
            <select
              value={targetZone.id}
              onChange={(e) => {
                const found = POPULAR_ZONES.find((z) => z.id === e.target.value);
                if (found) setTargetZone(found);
              }}
              className="w-full text-sm font-bold bg-white border border-emerald-200 rounded-xl px-3.5 py-2.5 text-slate-900"
            >
              {POPULAR_ZONES.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.flag} {z.city}, {z.country} ({z.timeZone})
                </option>
              ))}
            </select>
            <div className="text-2xl font-black text-emerald-950 font-mono">
              {getConvertedTime(targetZone.timeZone)}
            </div>
          </div>
        </div>

        {/* Hour Slider Control */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Drag Time Slider to Simulate Meeting Hours</span>
            <span className="font-mono text-emerald-700 font-bold">
              {String(timeHour).padStart(2, '0')}:{String(timeMinute).padStart(2, '0')} (24-hour)
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="23"
            value={timeHour}
            onChange={(e) => setTimeHour(parseInt(e.target.value, 10))}
            className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>12 AM (Midnight)</span>
            <span>6 AM</span>
            <span>12 PM (Noon)</span>
            <span>6 PM</span>
            <span>11 PM</span>
          </div>
        </div>
      </div>

      {/* Multi-City Meeting Planner Board */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              Multi-City Meeting Schedule Matrix
            </h3>
            <p className="text-xs text-slate-500">
              See what time this translates to across all team members simultaneously.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopyMeetingSummary}
            className="px-3.5 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition flex items-center gap-1.5 shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Summary Copied!' : 'Copy Meeting Invite Time'}
          </button>
        </div>

        {/* Cities Table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {comparisonList.map((c) => (
            <div
              key={c.id}
              className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl relative group space-y-1.5"
            >
              {comparisonList.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeCity(c.id)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 opacity-60 group-hover:opacity-100 transition"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <div className="flex items-center gap-1.5">
                <span className="text-lg">{c.flag}</span>
                <span className="font-bold text-xs text-slate-900">{c.city}</span>
              </div>
              <div className="text-lg font-black text-slate-900 font-mono">
                {getConvertedTime(c.timeZone)}
              </div>
              <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                <span>Live: {getLiveTime(c.timeZone)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Add City Buttons */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-600 mb-2">
            Add More Cities to Comparison:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_ZONES.filter((z) => !comparisonList.some((c) => c.id === z.id)).map((z) => (
              <button
                key={z.id}
                type="button"
                onClick={() => addCityToCompare(z)}
                className="px-2.5 py-1 text-xs bg-white border border-slate-200 hover:border-emerald-300 rounded-lg text-slate-700 hover:text-emerald-700 transition flex items-center gap-1 shadow-2xs"
              >
                <Plus className="w-3 h-3 text-emerald-600" />
                {z.flag} {z.city}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
