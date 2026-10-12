import React, { useState, useMemo } from 'react';
import {
  AlignLeft,
  Copy,
  Check,
  RotateCcw,
  Clock,
  Mic,
  FileText,
  ChevronRight,
  Sparkles,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';
import { FaqSection } from '../FaqSection';

interface TextCounterToolProps {
  onNavigate: (path: string) => void;
}

export const TextCounterTool: React.FC<TextCounterToolProps> = ({ onNavigate }) => {
  const [text, setText] = useState<string>(
    'ToolCrest is a modern, high-performance browser tools suite and knowledge platform. All calculations, conversions, and document processing happen 100% locally on your machine.'
  );
  const [copied, setCopied] = useState(false);

  // Stats calculation
  const stats = useMemo(() => {
    const raw = text.trim();
    if (!raw) {
      return {
        words: 0,
        characters: 0,
        charactersNoSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        readingTimeMinutes: 0,
        speakingTimeMinutes: 0,
        topKeywords: [],
      };
    }

    const wordsArray = raw.split(/\s+/).filter((w) => w.length > 0);
    const words = wordsArray.length;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s+/g, '').length;
    const sentences = raw.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
    const paragraphs = raw.split(/\n+/).filter((p) => p.trim().length > 0).length;

    // Reading time: 225 wpm, speaking time: 130 wpm
    const readingTimeMinutes = Math.max(1, Math.ceil(words / 225));
    const speakingTimeMinutes = Math.max(1, Math.ceil(words / 130));

    // Keyword density analysis
    const wordCounts: Record<string, number> = {};
    const stopWords = new Set([
      'the', 'and', 'a', 'to', 'of', 'in', 'i', 'is', 'that', 'it', 'on', 'you',
      'this', 'for', 'but', 'with', 'are', 'have', 'be', 'at', 'or', 'as', 'was',
      'so', 'if', 'out', 'not', 'an', 'all', 'your', 'from', 'we', 'our', 'by',
    ]);

    wordsArray.forEach((w) => {
      const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (clean.length > 2 && !stopWords.has(clean)) {
        wordCounts[clean] = (wordCounts[clean] || 0) + 1;
      }
    });

    const topKeywords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([keyword, count]) => ({
        keyword,
        count,
        percent: ((count / words) * 100).toFixed(1),
      }));

    return {
      words,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      readingTimeMinutes,
      speakingTimeMinutes,
      topKeywords,
    };
  }, [text]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCaseChange = (type: 'upper' | 'lower' | 'title' | 'sentence') => {
    if (type === 'upper') {
      setText(text.toUpperCase());
    } else if (type === 'lower') {
      setText(text.toLowerCase());
    } else if (type === 'title') {
      setText(
        text.replace(
          /\w\S*/g,
          (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
        )
      );
    } else if (type === 'sentence') {
      const lower = text.toLowerCase();
      setText(
        lower.replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase())
      );
    }
  };

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
        <span className="text-slate-800 font-semibold">Word & Character Counter</span>
      </nav>

      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold shadow-2xs">
              <AlignLeft className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Word & Character Counter
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Real-Time
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                Analyze words, characters, sentences, estimated reading time, and keyword density instantly as you type.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50/80 px-3 py-1.5 rounded-xl border border-emerald-200/80">
            <ShieldCheck className="w-4 h-4" /> 100% In-Browser Privacy
          </div>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Words
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">
            {stats.words.toLocaleString()}
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Characters
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-600">
            {stats.characters.toLocaleString()}
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            No Spaces
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">
            {stats.charactersNoSpaces.toLocaleString()}
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Sentences
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">
            {stats.sentences.toLocaleString()}
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Paragraphs
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">
            {stats.paragraphs.toLocaleString()}
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Read Time
          </span>
          <span className="text-xl sm:text-2xl font-black text-indigo-600 flex items-center justify-center gap-1">
            <Clock className="w-4 h-4 text-indigo-400" />
            {stats.readingTimeMinutes}m
          </span>
        </div>
      </div>

      {/* Editor & Actions */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
        {/* Quick Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 mr-2">Case Conversion:</span>
            <button
              type="button"
              onClick={() => handleCaseChange('sentence')}
              className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            >
              Sentence case
            </button>
            <button
              type="button"
              onClick={() => handleCaseChange('title')}
              className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            >
              Title Case
            </button>
            <button
              type="button"
              onClick={() => handleCaseChange('upper')}
              className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            >
              UPPERCASE
            </button>
            <button
              type="button"
              onClick={() => handleCaseChange('lower')}
              className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            >
              lowercase
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Text'}
            </button>
            <button
              type="button"
              onClick={() => setText('')}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
              title="Clear all text"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Text Area */}
        <textarea
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or start typing your content here to inspect words, character count, and keyword density..."
          className="w-full text-sm leading-relaxed p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition resize-y font-sans"
        />

        {/* Bottom Helper Bar */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Silent Reading: ~{stats.readingTimeMinutes} min
            </span>
            <span className="flex items-center gap-1">
              <Mic className="w-3.5 h-3.5 text-slate-400" /> Speech Presentation: ~{stats.speakingTimeMinutes} min
            </span>
          </div>
          <span>Auto-saved in memory • No characters sent to cloud</span>
        </div>
      </div>

      {/* Keyword Density & SEO Analysis */}
      {stats.topKeywords.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" /> Top Keyword Density
            </h3>
            <span className="text-xs text-slate-400">Excludes common stop words</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {stats.topKeywords.map((item) => (
              <div
                key={item.keyword}
                className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center"
              >
                <span className="font-bold text-xs text-slate-900 block truncate">
                  "{item.keyword}"
                </span>
                <span className="text-xs text-emerald-700 font-extrabold">
                  {item.count}x <span className="text-[10px] text-slate-400 font-normal">({item.percent}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guide & FAQs */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="text-lg font-bold text-slate-900">
          How to Use the ToolCrest Word Counter for SEO & Writing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 leading-relaxed">
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm">Blog & Article Writing</h4>
            <p>
              Target recommended word counts: short blog posts typically span 800–1,200 words, while in-depth pillar guides often reach 2,000–3,500 words.
            </p>
          </div>
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm">Social Media Character Limits</h4>
            <p>
              Monitor character lengths for social posts: Twitter/X (280 characters), LinkedIn posts (3,000), and Instagram captions (2,200).
            </p>
          </div>
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm">Reading & Speech Pacing</h4>
            <p>
              Average human silent reading speed is around 225 words per minute, whereas comfortable public speaking ranges between 130 and 150 words per minute.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
