import React, { useState } from 'react';
import {
  Clock,
  Globe,
  ArrowLeftRight,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';
import { TOOLS_DATA } from '../../data/toolsData';
import { ToolHeader } from './ToolHeader';
import { RelatedToolsSection } from './RelatedToolsSection';
import { FaqSection } from '../FaqSection';

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
  { id: 'london', city: 'London', country: 'United Kingdom', timeZone: 'Europe/London', flag: '🇬🇧' },
  { id: 'newyork', city: 'New York', country: 'United States', timeZone: 'America/New_York', flag: '🇺🇸' },
  { id: 'losangeles', city: 'Los Angeles', country: 'United States', timeZone: 'America/Los_Angeles', flag: '🇺🇸' },
  { id: 'tokyo', city: 'Tokyo', country: 'Japan', timeZone: 'Asia/Tokyo', flag: '🇯🇵' },
  { id: 'paris', city: 'Paris', country: 'France', timeZone: 'Europe/Paris', flag: '🇫🇷' },
  { id: 'dubai', city: 'Dubai', country: 'United Arab Emirates', timeZone: 'Asia/Dubai', flag: '🇦🇪' },
  { id: 'singapore', city: 'Singapore', country: 'Singapore', timeZone: 'Asia/Singapore', flag: '🇸🇬' },
  { id: 'sydney', city: 'Sydney', country: 'Australia', timeZone: 'Australia/Sydney', flag: '🇦🇺' },
  { id: 'karachi', city: 'Karachi', country: 'Pakistan', timeZone: 'Asia/Karachi', flag: '🇵🇰' },
  { id: 'berlin', city: 'Berlin', country: 'Germany', timeZone: 'Europe/Berlin', flag: '🇩🇪' },
  { id: 'toronto', city: 'Toronto', country: 'Canada', timeZone: 'America/Toronto', flag: '🇨🇦' },
  { id: 'mumbai', city: 'Mumbai', country: 'India', timeZone: 'Asia/Kolkata', flag: '🇮🇳' },
];

export const TimeZoneConverterTool: React.FC<TimeZoneConverterToolProps> = ({ onNavigate }) => {
  const toolItem = TOOLS_DATA.find((t) => t.id === 'time-zone-converter') || {
    id: 'time-zone-converter',
    name: 'Time Zone Converter',
    slug: 'time-zone-converter',
    category: 'converters' as const,
    categoryLabel: 'Converter',
    shortDesc: 'Convert hours across global time zones, schedule meetings, and check DST.',
    longDesc: 'Synchronize international team calls and personal schedules with instant multi-city clock comparison.',
    iconName: 'Clock',
    keywords: ['time', 'zone', 'converter', 'dst', 'clock'],
  };

  const [sourceZone, setSourceZone] = useState<CityZone>(POPULAR_ZONES[0]); // London
  const [targetZone, setTargetZone] = useState<CityZone>(POPULAR_ZONES[1]); // New York
  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [timeHour, setTimeHour] = useState<number>(new Date().getHours());
  const [timeMinute, setTimeMinute] = useState<number>(new Date().getMinutes());
  const [copied, setCopied] = useState<boolean>(false);

  const [comparisonList, setComparisonList] = useState<CityZone[]>([
    POPULAR_ZONES[3], // Tokyo
    POPULAR_ZONES[4], // Paris
    POPULAR_ZONES[5], // Dubai
    POPULAR_ZONES[8], // Karachi
  ]);

  const handleSwap = () => {
    const prev = sourceZone;
    setSourceZone(targetZone);
    setTargetZone(prev);
  };

  const getSourceDateObj = (): Date => {
    const [year, month, day] = currentDate.split('-').map(Number);
    const date = new Date();
    date.setFullYear(year, month - 1, day);
    date.setHours(timeHour, timeMinute, 0, 0);
    return date;
  };

  const getConvertedTime = (targetTz: string): string => {
    try {
      const date = getSourceDateObj();
      return new Intl.DateTimeFormat('en-US', {
        timeZone: targetTz,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }).format(date);
    } catch {
      return '--:--';
    }
  };

  const getLiveTime = (targetTz: string): string => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: targetTz,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(new Date());
    } catch {
      return '--:--';
    }
  };

  const handleAddCity = (cityId: string) => {
    const found = POPULAR_ZONES.find((z) => z.id === cityId);
    if (found && !comparisonList.some((c) => c.id === found.id)) {
      setComparisonList((prev) => [...prev, found]);
    }
  };

  const handleRemoveCity = (cityId: string) => {
    setComparisonList((prev) => prev.filter((c) => c.id !== cityId));
  };

  const handleCopyMeetingTimes = () => {
    const summary = `${sourceZone.city}: ${timeHour.toString().padStart(2, '0')}:${timeMinute.toString().padStart(2, '0')} -> ${targetZone.city}: ${getConvertedTime(targetZone.timeZone)}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tzFaqs = [
    {
      q: 'Does ToolCrest automatically factor in Daylight Saving Time (DST)?',
      a: 'Yes. The calculation uses native browser Internationalization (Intl.DateTimeFormat) with standard IANA time zone databases, which automatically applies Daylight Saving rules for each respective date.',
    },
    {
      q: 'Can I check cross-border team hours for future dates?',
      a: 'Yes. Use the date picker to choose any upcoming date. If daylight saving transitions occur between now and that date, the converter computes the exact future offset.',
    },
    {
      q: 'Is there a limit on how many cities I can compare simultaneously?',
      a: 'No limit. You can add as many global hubs as you need to plan team sprint ceremonies, webinars, and client presentations across continents.',
    },
  ];

  return (
    <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* 1. UNIFIED TOOL HEADER */}
      <ToolHeader tool={toolItem} onNavigate={onNavigate} />

      {/* 2. MAIN TOOL WORKSPACE */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Date and Time Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
            <input
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                setTimeHour(now.getHours());
                setTimeMinute(now.getMinutes());
                setCurrentDate(now.toISOString().split('T')[0]);
              }}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 transition"
            >
              <Sparkles className="w-3.5 h-3.5" /> Reset to Current Time
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={handleCopyMeetingTimes}
              className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Slot'}</span>
            </button>
          </div>
        </div>

        {/* 2 Cities Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* Source City (5 cols) */}
          <div className="md:col-span-5 p-5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
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
              className="w-full text-sm font-bold bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900"
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
          <div className="md:col-span-1 flex justify-center py-2 md:py-0">
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

        {/* Interactive 24-Hour Timeline Slider */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Drag Time Hour Slider ({timeHour.toString().padStart(2, '0')}:00)</span>
            <span className="font-mono text-emerald-700">{timeHour}:00</span>
          </div>
          <input
            type="range"
            min="0"
            max="23"
            value={timeHour}
            onChange={(e) => setTimeHour(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-600"
          />
        </div>

        {/* Global Multi-City Comparison Deck */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>Multi-City Team Roster</span>
            </h3>

            <div className="flex items-center gap-2">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddCity(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="text-xs bg-slate-100 border border-slate-300 rounded-xl px-2.5 py-1 text-slate-700 font-semibold"
                defaultValue=""
              >
                <option value="" disabled>
                  + Add City
                </option>
                {POPULAR_ZONES.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.flag} {z.city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {comparisonList.map((c) => (
              <div
                key={c.id}
                className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-1 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">
                    {c.flag} {c.city}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCity(c.id)}
                    className="text-slate-300 hover:text-rose-500 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-base font-black text-slate-900 font-mono">
                  {getConvertedTime(c.timeZone)}
                </div>
                <p className="text-[10px] text-slate-400 truncate">{c.timeZone}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. HOW TO USE THIS TOOL */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-600" />
          <span>How to Coordinate Cross-Timezone Meetings</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
              1
            </span>
            <h4 className="font-bold text-sm text-slate-900">Select Locations</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pick your primary city and recipient timezone from our roster of international business hubs.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
              2
            </span>
            <h4 className="font-bold text-sm text-slate-900">Drag 24-Hour Slider</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Scrub the timeline to find overlapping business hours suitable for both morning and evening calls.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
              3
            </span>
            <h4 className="font-bold text-sm text-slate-900">Copy Meeting Time</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tap Copy Slot to copy the dual-city timezone invite directly into your email or calendar invite.
            </p>
          </div>
        </div>
      </div>

      {/* 4. FREQUENTLY ASKED QUESTIONS */}
      <FaqSection
        title="Frequently Asked Questions: Time Zone Converter"
        subtitle="Helpful answers about Daylight Saving Time, international meeting hours, and time offsets."
        faqs={tzFaqs}
      />

      {/* 5. RELATED TOOLS SUGGESTIONS */}
      <RelatedToolsSection
        currentToolSlug="time-zone-converter"
        category="converters"
        onNavigate={onNavigate}
      />
    </div>
  );
};
