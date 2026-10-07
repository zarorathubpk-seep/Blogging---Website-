import React, { useState } from 'react';
import { Article } from '../types/article';
import { AuthorBox } from '../components/AuthorBox';
import {
  Clock,
  Calendar,
  Share2,
  Copy,
  Check,
  Twitter,
  Linkedin,
  Facebook,
  Mail,
  ChevronRight,
  ArrowRight,
  Sparkles,
  List,
} from 'lucide-react';

interface ArticlePageProps {
  article: Article;
  allArticles: Article[];
  onSelectArticle: (slug: string) => void;
  onNavigate: (path: string) => void;
}

export const ArticlePage: React.FC<ArticlePageProps> = ({
  article,
  allArticles,
  onSelectArticle,
  onNavigate,
}) => {
  const [copied, setCopied] = useState(false);

  // Extract headings for Table of Contents
  const headings = article.content
    .split('\n')
    .filter((line) => line.startsWith('### ') || line.startsWith('**Step ') || line.startsWith('**1. ') || line.startsWith('**Your Sunday routine'))
    .map((line, idx) => {
      const cleanText = line.replace(/###\s*|\*\*/g, '').trim();
      const id = `section-${idx}`;
      return { text: cleanText, id };
    });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(article.title);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(article.title);
    const body = encodeURIComponent(`Read this article on Zarorat Hub:\n\n${window.location.href}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // Render markdown with nice headings, tables, and lists
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let tableBuffer: string[] = [];
    let inTable = false;
    let headingCounter = 0;

    const flushTable = () => {
      if (tableBuffer.length > 0) {
        const headerLine = tableBuffer[0];
        const rows = tableBuffer.slice(2); // Skip separator line

        const headers = headerLine
          .split('|')
          .map((c) => c.trim())
          .filter((c) => c.length > 0);

        elements.push(
          <div key={`table-${elements.length}`} className="my-6 overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-800 font-bold">
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="p-3 border-b border-slate-200">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {rows.map((rowStr, rIdx) => {
                  const cells = rowStr
                    .split('|')
                    .map((c) => c.trim())
                    .filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
                  return (
                    <tr key={rIdx} className="hover:bg-slate-50">
                      {cells.map((cell, cIdx) => (
                        <td key={cIdx} className="p-3 text-slate-700">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        tableBuffer = [];
      }
      inTable = false;
    };

    lines.forEach((line, idx) => {
      // Table lines
      if (line.trim().startsWith('|')) {
        inTable = true;
        tableBuffer.push(line);
        return;
      } else if (inTable) {
        flushTable();
      }

      // Headings
      if (line.startsWith('### ')) {
        const text = line.replace('### ', '').trim();
        const hid = `section-${headingCounter++}`;
        elements.push(
          <h3
            key={idx}
            id={hid}
            className="text-lg sm:text-xl font-bold text-slate-900 mt-8 mb-3 scroll-mt-24"
          >
            {text}
          </h3>
        );
        return;
      }

      // Bold lead / Steps
      if (line.startsWith('**') && line.endsWith('**')) {
        const boldText = line.replace(/\*\*/g, '');
        elements.push(
          <p key={idx} className="font-bold text-slate-900 mt-4 mb-2">
            {boldText}
          </p>
        );
        return;
      }

      // Bullet lists
      if (line.trim().startsWith('- ')) {
        const bulletText = line.trim().replace('- ', '');
        elements.push(
          <li key={idx} className="text-slate-700 leading-relaxed text-sm sm:text-base ml-4 list-disc mb-1.5">
            {bulletText}
          </li>
        );
        return;
      }

      // Numbered lists
      if (/^\d+\.\s/.test(line.trim())) {
        elements.push(
          <li key={idx} className="text-slate-700 leading-relaxed text-sm sm:text-base ml-4 list-decimal mb-1.5">
            {line.trim().replace(/^\d+\.\s/, '')}
          </li>
        );
        return;
      }

      // Empty line
      if (!line.trim()) {
        return;
      }

      // Standard paragraphs
      elements.push(
        <p key={idx} className="text-slate-700 leading-relaxed text-sm sm:text-base my-3">
          {line}
        </p>
      );
    });

    if (inTable) flushTable();

    return elements;
  };

  const relatedArticles = allArticles.filter((a) => a.id !== article.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500">
          <button
            type="button"
            onClick={() => onNavigate('/planner')}
            className="hover:text-emerald-700"
          >
            Planner
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <button
            type="button"
            onClick={() => onNavigate('/blog')}
            className="hover:text-emerald-700"
          >
            Blog
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-semibold line-clamp-1">{article.title}</span>
        </nav>

        {/* Article Header Card */}
        <header className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
          {/* Hero Banner Image */}
          {article.imageUrl && (
            <div className="w-full h-64 sm:h-80 md:h-96 overflow-hidden bg-slate-100">
              <img
                src={article.imageUrl}
                alt={article.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
            </div>
          )}

          <div className="p-6 sm:p-8 space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="font-bold text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                {article.category}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {article.readingTime}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {article.publishedAt}
              </span>
              <span>•</span>
              <span className="font-medium text-slate-700">By {article.author}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {article.title}
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {article.subtitle}
            </p>

            {/* Social Share Buttons Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-slate-400" /> Share this guide:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition text-xs font-semibold flex items-center gap-1"
                  title="Copy article link"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareTwitter}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-600 transition"
                  title="Share on X / Twitter"
                >
                  <Twitter className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleShareLinkedIn}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition"
                  title="Share on LinkedIn"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleShareFacebook}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition"
                  title="Share on Facebook"
                >
                  <Facebook className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleShareEmail}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  title="Share via Email"
                >
                  <Mail className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Table of Contents */}
        {headings.length > 0 && (
          <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-4 sm:p-5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <List className="w-4 h-4 text-emerald-600" />
              Table of Contents
            </h3>
            <ul className="space-y-1.5 text-xs">
              {headings.map((h) => (
                <li key={h.id}>
                  <a
                    href={`#${h.id}`}
                    className="text-slate-600 hover:text-emerald-700 transition flex items-center gap-1.5"
                  >
                    <span className="text-slate-400">•</span>
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Main Article Content */}
        <main className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs prose prose-slate max-w-none">
          {renderFormattedContent(article.content)}

          {/* Call to action at end linking back to planner generator */}
          <div className="mt-10 p-5 bg-linear-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-1">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Ready to put this into practice?
              </div>
              <p className="text-xs text-slate-600">
                Generate your personalized planner in seconds. Free, interactive, and runs entirely in your browser.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/planner')}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition shrink-0 flex items-center gap-1.5"
            >
              Open Planner Tool <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </main>

        {/* Author Box */}
        <AuthorBox />

        {/* Related Articles */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <h3 className="font-bold text-base text-slate-900">Related Articles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedArticles.map((rel) => (
              <div
                key={rel.id}
                onClick={() => {
                  onSelectArticle(rel.slug);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-slate-50/50 transition cursor-pointer flex flex-col justify-between group overflow-hidden"
              >
                {rel.imageUrl && (
                  <div className="w-full h-28 overflow-hidden bg-slate-100">
                    <img
                      src={rel.imageUrl}
                      alt={rel.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                )}
                <div className="p-3.5">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                    {rel.category}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition line-clamp-2 mb-1">
                    {rel.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 mt-2 block flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {rel.readingTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
