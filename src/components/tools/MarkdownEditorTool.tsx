import React, { useState } from 'react';
import {
  FileCode2,
  Copy,
  Check,
  Download,
  RotateCcw,
  Eye,
  Edit3,
  HelpCircle,
  Sparkles,
  Bold,
  Italic,
  Heading,
  List,
  Quote,
  Code,
} from 'lucide-react';
import { TOOLS_DATA } from '../../data/toolsData';
import { ToolHeader } from './ToolHeader';
import { RelatedToolsSection } from './RelatedToolsSection';
import { FaqSection } from '../FaqSection';
import { sanitizeFileName, ensureFileExtension } from '../../utils/fileNaming';

interface MarkdownEditorToolProps {
  onNavigate: (path: string) => void;
}

export const MarkdownEditorTool: React.FC<MarkdownEditorToolProps> = ({ onNavigate }) => {
  const toolItem = TOOLS_DATA.find((t) => t.id === 'markdown-previewer') || {
    id: 'markdown-previewer',
    name: 'Markdown Live Editor',
    slug: 'markdown-previewer',
    category: 'productivity' as const,
    categoryLabel: 'Productivity',
    shortDesc: 'Write, preview, and format Markdown documents with live HTML rendering.',
    longDesc: 'Dual-pane live Markdown previewer with quick formatting toolbars, HTML syntax rendering, and instant custom file name export.',
    iconName: 'FileCode2',
    keywords: ['markdown', 'editor', 'preview', 'html', 'readme', 'docs'],
  };

  const [markdown, setMarkdown] = useState<string>(`# Welcome to ToolCrest Markdown Editor

ToolCrest provides fast, private, and 100% free browser tools.

## Key Features
- **Real-Time Preview**: Changes render instantly in the right pane.
- **Client-Side Security**: Your drafts never leave your device.
- **Export Options**: Download clean \`.md\` files with custom naming.

### Sample Code Block
\`\`\`typescript
const tool = "ToolCrest";
console.log(\`Powering \${tool} workflows!\`);
\`\`\`

> "Good design is as little design as possible." — Dieter Rams

Feel free to edit this text or paste your own README documentation!
`);

  const [activeTab, setActiveTab] = useState<'both' | 'edit' | 'preview'>('both');
  const [customFileName, setCustomFileName] = useState<string>('toolcrest_document');
  const [copied, setCopied] = useState<boolean>(false);

  // Helper formatting injectors
  const insertSyntax = (prefix: string, suffix: string = '') => {
    setMarkdown((prev) => `${prev}\n${prefix}Text${suffix}`);
  };

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const sanitizedFileName = ensureFileExtension(
    sanitizeFileName(customFileName, 'toolcrest_document'),
    'md' as any
  );

  const handleDownloadMd = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = sanitizedFileName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  // Safe lightweight markdown parser for preview
  const parseMarkdownToHtml = (md: string): string => {
    let html = md
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto my-3"><code>$1</code></pre>');
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-200">$1</code>');
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-slate-900 mt-4 mb-1">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-lg font-extrabold text-slate-900 mt-5 mb-2 border-b border-slate-100 pb-1">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-black text-slate-900 mt-2 mb-3 border-b border-slate-200 pb-2">$1</h1>');
    // Blockquote
    html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-emerald-500 pl-3 py-1 my-2 text-slate-600 italic bg-slate-50 rounded-r-lg">$1</blockquote>');
    // Bold / Italic
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
    // Lists
    html = html.replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-slate-700 my-0.5">$1</li>');
    // Paragraphs / newlines
    html = html.replace(/\n\n/g, '<p class="my-2 text-slate-700 leading-relaxed text-xs sm:text-sm"></p>');

    return html;
  };

  const mdFaqs = [
    {
      q: 'Can I export this document to GitHub or Notion?',
      a: 'Yes! Download the .md file using our Custom File Name tool and drop it directly into any GitHub repository, Obsidian vault, or Notion workspace.',
    },
    {
      q: 'Does this editor support standard CommonMark syntax?',
      a: 'Yes. Standard headers, bold, italics, blockquotes, unordered lists, inline code, and fenced code blocks are all supported.',
    },
    {
      q: 'Is my writing saved remotely?',
      a: 'No. All editing takes place in your local browser window with complete privacy.',
    },
  ];

  return (
    <div className="py-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* 1. UNIFIED TOOL HEADER */}
      <ToolHeader tool={toolItem} onNavigate={onNavigate} />

      {/* 2. MAIN TOOL WORKSPACE */}
      <div className="bg-[#0c101d] border border-amber-500/25 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 text-slate-100">
        {/* Top Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => insertSyntax('**', '**')}
              className="p-2 text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition border border-amber-500/20 cursor-pointer"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertSyntax('*', '*')}
              className="p-2 text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition border border-amber-500/20 cursor-pointer"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertSyntax('## ')}
              className="p-2 text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition border border-amber-500/20 cursor-pointer"
              title="Heading"
            >
              <Heading className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertSyntax('- ')}
              className="p-2 text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition border border-amber-500/20 cursor-pointer"
              title="List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertSyntax('> ')}
              className="p-2 text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition border border-amber-500/20 cursor-pointer"
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertSyntax('```\n', '\n```')}
              className="p-2 text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition border border-amber-500/20 cursor-pointer"
              title="Code Block"
            >
              <Code className="w-4 h-4" />
            </button>
          </div>

          {/* View Toggles on small screens */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#070a14] border border-amber-500/30 p-1 rounded-xl text-xs font-bold md:hidden">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  activeTab === 'edit'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-400 hover:text-amber-200'
                }`}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-400 hover:text-amber-200'
                }`}
              >
                Preview
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="px-3.5 py-1.5 text-xs font-bold text-amber-200 bg-[#070a14] hover:bg-amber-500/15 border border-amber-500/25 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Dual Split Editor & Live Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[380px]">
          {/* Left: Input Editor */}
          <div
            className={`flex flex-col space-y-1.5 ${
              activeTab === 'preview' ? 'hidden md:flex' : 'flex'
            }`}
          >
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>Markdown Input (.md)</span>
            </span>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Start drafting in Markdown..."
              className="w-full flex-1 min-h-[340px] text-xs sm:text-sm font-mono text-slate-100 bg-[#070a14] border border-amber-500/30 rounded-2xl p-4 focus:border-amber-400 focus:outline-hidden transition resize-y placeholder:text-slate-500"
            />
          </div>

          {/* Right: Live Rendered Output */}
          <div
            className={`flex flex-col space-y-1.5 ${
              activeTab === 'edit' ? 'hidden md:flex' : 'flex'
            }`}
          >
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>Live HTML Preview</span>
            </span>
            <div
              className="w-full flex-1 min-h-[340px] p-5 bg-[#070a14] border border-amber-500/30 rounded-2xl overflow-y-auto text-xs sm:text-sm text-slate-100 prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(markdown) }}
            />
          </div>
        </div>

        {/* Download Section with Custom File Name */}
        <div className="pt-3 border-t border-amber-500/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs font-bold text-amber-300 whitespace-nowrap">File Name:</span>
            <input
              type="text"
              value={customFileName}
              onChange={(e) => setCustomFileName(e.target.value)}
              placeholder="document name..."
              className="w-full sm:max-w-xs text-xs font-semibold bg-[#070a14] border border-amber-500/30 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-hidden"
            />
            <span className="text-xs font-mono font-bold text-amber-400">.md</span>
          </div>

          <button
            type="button"
            onClick={handleDownloadMd}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 active:scale-98 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>Download {sanitizedFileName}</span>
          </button>
        </div>
      </div>

      {/* 3. HOW TO USE GUIDE */}
      <div className="bg-[#0c101d] border border-amber-500/25 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <h3 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-400" />
          <span>Markdown Cheat Sheet & Quick Tips</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          <div className="p-4 bg-[#070a14] border border-amber-500/20 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
              1
            </span>
            <h4 className="font-bold text-sm text-amber-200">Headings & Lists</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              # H1 Title<br />
              ## H2 Section<br />
              - Bullet point item
            </p>
          </div>

          <div className="p-4 bg-[#070a14] border border-amber-500/20 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
              2
            </span>
            <h4 className="font-bold text-sm text-amber-200">Emphasis & Quotes</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              **Bold text**<br />
              *Italic text*<br />
              &gt; Blockquote highlight
            </p>
          </div>

          <div className="p-4 bg-[#070a14] border border-amber-500/20 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
              3
            </span>
            <h4 className="font-bold text-sm text-amber-200">Code & Export</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              `inline code`<br />
              ```fenced block```<br />
              Download .md file
            </p>
          </div>
        </div>
      </div>

      {/* 4. FAQS */}
      <FaqSection
        title="Frequently Asked Questions: Markdown Live Editor"
        subtitle="Learn about markdown syntax standards, export options, and client safety."
        faqs={mdFaqs}
      />

      {/* 5. RELATED TOOLS */}
      <RelatedToolsSection
        currentToolSlug="markdown-previewer"
        category="productivity"
        onNavigate={onNavigate}
      />
    </div>
  );
};
