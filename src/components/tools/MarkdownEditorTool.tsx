import React, { useState } from 'react';
import {
  FileCode2,
  Copy,
  Check,
  Download,
  RotateCcw,
  Eye,
  Edit3,
  ChevronRight,
  ShieldCheck,
  Bold,
  Italic,
  Heading,
  List,
  Quote,
  Code,
} from 'lucide-react';

interface MarkdownEditorToolProps {
  onNavigate: (path: string) => void;
}

const DEFAULT_MARKDOWN = `# Welcome to ToolCrest Markdown Editor

ToolCrest provides **fast**, **private**, and **free** client-side browser tools.

## Key Highlights
- **100% In-Browser Execution:** Your files and notes never leave your computer.
- **Split-Screen Live Preview:** Instant side-by-side rendering.
- **Built for Writers:** Ideal for READMEs, blogs, and documentation.

### Formatting Cheatsheet
> *"Simplicity is the prerequisite for reliability."* — Edsger W. Dijkstra

Here is a quick code example:
\`\`\`javascript
const platform = "ToolCrest";
console.log(\`Running locally on \${platform}\`);
\`\`\`

- [x] Check weekly goals
- [x] Review monthly finances
- [ ] Read new productivity guides

Visit our [Home Page](/) to explore all PDF tools, calculators, and converters!
`;

export const MarkdownEditorTool: React.FC<MarkdownEditorToolProps> = ({ onNavigate }) => {
  const [markdown, setMarkdown] = useState<string>(DEFAULT_MARKDOWN);
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [copied, setCopied] = useState<boolean>(false);

  // Simple and safe markdown to html converter
  const renderMarkdown = (src: string): string => {
    let html = src
      // Escape HTML entities to prevent raw injection
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Code blocks ```
    html = html.replace(/```([a-z]*)\n([\s\S]*?)```/g, '<pre class="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto my-3"><code>$2</code></pre>');

    // Inline code `code`
    html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-emerald-800 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-slate-900 mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-slate-900 mt-6 mb-2 border-b border-slate-100 pb-1">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-xl sm:text-2xl font-black text-slate-900 mt-2 mb-3">$1</h1>');

    // Blockquotes
    html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-emerald-500 pl-4 py-1 italic text-slate-600 bg-emerald-50/50 my-3 rounded-r-lg">$1</blockquote>');

    // Checkboxes
    html = html.replace(/- \[x\] (.*$)/gim, '<div class="flex items-center gap-2 text-slate-700 my-1"><input type="checkbox" checked disabled class="accent-emerald-600 rounded"> <span class="line-through text-slate-400">$1</span></div>');
    html = html.replace(/- \[ \] (.*$)/gim, '<div class="flex items-center gap-2 text-slate-700 my-1"><input type="checkbox" disabled class="accent-emerald-600 rounded"> <span>$1</span></div>');

    // Unordered lists
    html = html.replace(/^\- (.*$)/gim, '<li class="ml-5 list-disc text-slate-700 my-0.5">$1</li>');

    // Bold & Italics
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-slate-900">$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>');

    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" class="text-emerald-700 font-semibold hover:underline">$1</a>');

    // Paragraph line breaks
    html = html.replace(/\n\n/g, '<p class="my-2.5 text-slate-700 leading-relaxed"></p>');

    return html;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  const insertSnippet = (prefix: string, suffix: string = '') => {
    setMarkdown((prev) => prev + `\n${prefix}Content${suffix}`);
  };

  return (
    <div className="py-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
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
        <span className="text-slate-800 font-semibold">Markdown Live Editor</span>
      </nav>

      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold shadow-2xs">
              <FileCode2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Markdown Live Editor
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Instant HTML
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                Write READMEs and documentation with real-time split-screen formatted preview and instant file export.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50/80 px-3 py-1.5 rounded-xl border border-emerald-200/80">
            <ShieldCheck className="w-4 h-4" /> 100% In-Browser Privacy
          </div>
        </div>
      </div>

      {/* Toolbar & View Toggles */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Quick Format Buttons */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => insertSnippet('**', '**')}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-bold"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('*', '*')}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-bold"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('## ')}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-bold"
            title="Heading 2"
          >
            <Heading className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('- ')}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-bold"
            title="List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('> ')}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-bold"
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('```javascript\n', '\n```')}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-bold"
            title="Code Block"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>

        {/* View Mode & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded-lg transition ${
                viewMode === 'split' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Split View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={`px-2.5 py-1 rounded-lg transition ${
                viewMode === 'edit' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 inline mr-1" /> Edit Only
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`px-2.5 py-1 rounded-lg transition ${
                viewMode === 'preview' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600'
              }`}
            >
              <Eye className="w-3.5 h-3.5 inline mr-1" /> Preview
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Download .md
          </button>
        </div>
      </div>

      {/* Editor & Preview Split Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Editor Pane */}
        {(viewMode === 'split' || viewMode === 'edit') && (
          <div className={`${viewMode === 'edit' ? 'lg:col-span-2' : ''} bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs font-bold text-slate-500">
              <span>MARKDOWN SOURCE</span>
              <span>{markdown.length} Characters</span>
            </div>
            <textarea
              rows={22}
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="w-full flex-1 mt-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs leading-relaxed focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-none"
            />
          </div>
        )}

        {/* Live Preview Pane */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className={`${viewMode === 'preview' ? 'lg:col-span-2' : ''} bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs font-bold text-slate-500">
              <span>LIVE RENDERED OUTPUT</span>
              <span className="text-emerald-700 font-extrabold">Instant</span>
            </div>
            <div
              className="w-full flex-1 mt-3 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-xs sm:text-sm overflow-y-auto max-h-[560px] prose prose-slate"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
