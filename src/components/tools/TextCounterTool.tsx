import React, { useState, useMemo } from 'react';
import {
  AlignLeft,
  Copy,
  Check,
  RotateCcw,
  Clock,
  Mic,
  FileText,
  Sparkles,
  BarChart3,
  HelpCircle,
} from 'lucide-react';
import { TOOLS_DATA } from '../../data/toolsData';
import { ToolHeader } from './ToolHeader';
import { RelatedToolsSection } from './RelatedToolsSection';
import { FaqSection } from '../FaqSection';

interface TextCounterToolProps {
  onNavigate: (path: string) => void;
}

export const TextCounterTool: React.FC<TextCounterToolProps> = ({ onNavigate }) => {
  const toolItem = TOOLS_DATA.find((t) => t.id === 'text-counter') || {
    id: 'text-counter',
    name: 'Word & Character Counter',
    slug: 'text-counter',
    category: 'productivity' as const,
    categoryLabel: 'Productivity',
    shortDesc: 'Analyze words, characters, reading time, and keyword frequency in real-time.',
    longDesc: 'Instant text analysis engine measuring words, characters with/without spaces, sentences, paragraphs, reading speed, and keyword density.',
    iconName: 'AlignLeft',
    keywords: ['word', 'character', 'counter', 'reading', 'time', 'keywords'],
  };

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
    } catch {}
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

  const textFaqs = [
    {
      q: 'How does reading time calculation work?',
      a: 'Average adult reading speed across modern research is ~225 words per minute. Speaking time is calculated at ~130 words per minute for clear presentations.',
    },
    {
      q: 'Is my pasted text kept private?',
      a: 'Yes, 100%. The analysis occurs directly in client memory. No characters or pasted documents are ever uploaded to any cloud server.',
    },
    {
      q: 'What are common character limits for social platforms?',
      a: 'Twitter/X is 280 characters, LinkedIn posts allow 3,000 characters, and Instagram captions allow up to 2,200 characters.',
    },
  ];

  return (
    <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-slate-100 animate-fadeIn">
      {/* 1. UNIFIED TOOL HEADER */}
      <ToolHeader tool={toolItem} onNavigate={onNavigate} />

      {/* 2. STATS KPI GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="bg-[#0c101d] border border-amber-500/25 rounded-2xl p-4 shadow-xl text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Words</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono tabular-nums">
            {stats.words}
          </span>
        </div>

        <div className="bg-[#0c101d] border border-amber-500/25 rounded-2xl p-4 shadow-xl text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Characters</span>
          <span className="text-2xl sm:text-3xl font-black text-white font-mono tabular-nums">
            {stats.characters}
          </span>
        </div>

        <div className="bg-[#0c101d] border border-amber-500/25 rounded-2xl p-4 shadow-xl text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">No Spaces</span>
          <span className="text-2xl sm:text-3xl font-black text-white font-mono tabular-nums">
            {stats.charactersNoSpaces}
          </span>
        </div>

        <div className="bg-[#0c101d] border border-amber-500/25 rounded-2xl p-4 shadow-xl text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Sentences</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-200 font-mono tabular-nums">
            {stats.sentences}
          </span>
        </div>

        <div className="bg-[#0c101d] border border-amber-500/25 rounded-2xl p-4 shadow-xl text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Reading</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tabular-nums flex items-center justify-center gap-1">
            <Clock className="w-4 h-4 text-amber-400 inline" /> {stats.readingTimeMinutes}m
          </span>
        </div>

        <div className="bg-[#0c101d] border border-amber-500/25 rounded-2xl p-4 shadow-xl text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Speaking</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tabular-nums flex items-center justify-center gap-1">
            <Mic className="w-4 h-4 text-amber-400 inline" /> {stats.speakingTimeMinutes}m
          </span>
        </div>
      </div>

      {/* 3. TEXT EDITOR WORKSPACE */}
      <div className="bg-[#0c101d] border border-amber-500/25 rounded-3xl p-6 shadow-2xl space-y-4">
        {/* Formatting Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleCaseChange('upper')}
              className="px-2.5 py-1 text-xs font-bold text-amber-200 bg-[#070a14] hover:bg-amber-500/15 border border-amber-500/25 rounded-lg transition cursor-pointer"
            >
              UPPERCASE
            </button>
            <button
              type="button"
              onClick={() => handleCaseChange('lower')}
              className="px-2.5 py-1 text-xs font-bold text-amber-200 bg-[#070a14] hover:bg-amber-500/15 border border-amber-500/25 rounded-lg transition cursor-pointer"
            >
              lowercase
            </button>
            <button
              type="button"
              onClick={() => handleCaseChange('title')}
              className="px-2.5 py-1 text-xs font-bold text-amber-200 bg-[#070a14] hover:bg-amber-500/15 border border-amber-500/25 rounded-lg transition cursor-pointer"
            >
              Title Case
            </button>
            <button
              type="button"
              onClick={() => handleCaseChange('sentence')}
              className="px-2.5 py-1 text-xs font-bold text-amber-200 bg-[#070a14] hover:bg-amber-500/15 border border-amber-500/25 rounded-lg transition cursor-pointer"
            >
              Sentence case
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setText('')}
              className="px-3 py-1 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 rounded-lg transition flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-1.5 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 rounded-lg transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" /> : <Copy className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>
        </div>

        {/* Text Area */}
        <textarea
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here to begin instant real-time analysis..."
          className="w-full text-sm leading-relaxed text-slate-100 bg-[#070a14] border border-amber-500/30 rounded-2xl p-4 focus:border-amber-400 focus:outline-hidden transition resize-y font-sans placeholder:text-slate-500"
        />
      </div>

      {/* 4. KEYWORD DENSITY */}
      {stats.topKeywords.length > 0 && (
        <div className="bg-[#0c101d] border border-amber-500/25 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>Top Keyword Frequency & Density</span>
            </h3>
            <span className="text-xs text-slate-400">Excludes common stop words</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {stats.topKeywords.map((item) => (
              <div
                key={item.keyword}
                className="bg-[#070a14] border border-amber-500/20 rounded-xl p-3 text-center"
              >
                <span className="font-bold text-xs text-amber-200 block truncate">
                  "{item.keyword}"
                </span>
                <span className="text-xs text-amber-400 font-extrabold font-mono">
                  {item.count}x <span className="text-[10px] text-slate-400 font-normal">({item.percent}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. HOW TO USE GUIDE */}
      <div className="bg-[#0c101d] border border-amber-500/25 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <h3 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-400" />
          <span>How to Optimize Text Length for SEO & Content</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          <div className="p-4 bg-[#070a14] border border-amber-500/20 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
              1
            </span>
            <h4 className="font-bold text-sm text-amber-200">Blog Posts & Articles</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standard blog articles average 1,000–1,500 words, while cornerstone guides frequently target 2,500+ words.
            </p>
          </div>

          <div className="p-4 bg-[#070a14] border border-amber-500/20 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
              2
            </span>
            <h4 className="font-bold text-sm text-amber-200">Social Character Caps</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Keep Twitter/X posts under 280 characters and meta descriptions between 150–160 characters.
            </p>
          </div>

          <div className="p-4 bg-[#070a14] border border-amber-500/20 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
              3
            </span>
            <h4 className="font-bold text-sm text-amber-200">Case Transformation</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instantly toggle between UPPERCASE, Title Case, and sentence case with one click before copying.
            </p>
          </div>
        </div>
      </div>

      {/* 6. FAQS */}
      <FaqSection
        title="Frequently Asked Questions: Text Counter"
        subtitle="Common queries about reading metrics, word limits, and security."
        faqs={textFaqs}
      />

      {/* 7. RELATED TOOLS */}
      <RelatedToolsSection
        currentToolSlug="text-counter"
        category="productivity"
        onNavigate={onNavigate}
      />
    </div>
  );
};
