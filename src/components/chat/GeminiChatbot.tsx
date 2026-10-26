import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Search,
  Globe,
  Loader2,
  Bot,
  User as UserIcon,
  Minimize2,
  Maximize2,
  Trash2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  groundingChunks?: { title: string; uri: string }[];
  webSearchQueries?: string[];
  modelUsed?: string;
}

interface GeminiChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  isOpen,
  onClose,
  initialPrompt,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello! I am **ToolCrest AI**, your document workflows and productivity assistant powered by Gemini. Ask me anything about PDF tools, conversions, planning methods, or toggle **Google Search** for real-time web research.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-4-argon'>('gemini-3.8-flash');
  const [useSearch, setUseSearch] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            content: m.content,
          })),
          model: selectedModel,
          useSearch,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: data.text || 'I could not generate an answer at this time.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingChunks: data.groundingChunks || [],
        webSearchQueries: data.webSearchQueries || [],
        modelUsed: data.model || selectedModel,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Connection Issue**: ${err.message || 'Could not communicate with the Gemini service.'} Please try again or switch to standard Flash mode.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Conversation history cleared. How can I assist you with ToolCrest today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-300 flex flex-col shadow-2xl ${
        isExpanded
          ? 'inset-3 sm:inset-6 md:inset-10 rounded-3xl'
          : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[94vw] sm:w-[460px] h-[640px] max-h-[88vh] rounded-3xl'
      } ${
        isDark
          ? 'bg-[#0B1020] border border-[#F3B542]/40 text-slate-100'
          : 'bg-white border border-slate-200 text-slate-900 shadow-xl'
      }`}
    >
      {/* Header */}
      <div
        className={`px-5 py-4 border-b flex items-center justify-between shrink-0 rounded-t-3xl ${
          isDark ? 'bg-[#0e1528] border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F3B542] to-amber-300 text-slate-950 flex items-center justify-center font-bold shadow-md">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm tracking-tight text-white dark:text-white">
                ToolCrest AI
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F3B542]/20 text-[#F3B542] border border-[#F3B542]/30 font-semibold">
                {selectedModel === 'gemini-4-argon' ? 'Argon 4' : selectedModel === 'gemini-3.1-flash-lite' ? 'Lite' : 'Flash 3.8'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {useSearch ? 'Search Grounding Active' : 'Offline Knowledge Engine'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/60 transition cursor-pointer"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
            title={isExpanded ? 'Collapse' : 'Expand Viewport'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
            title="Close Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Control Bar: Model Selector + Google Search Toggle */}
      <div
        className={`px-4 py-2 border-b flex items-center justify-between text-xs shrink-0 ${
          isDark ? 'bg-[#080d1a] border-slate-800/80 text-slate-300' : 'bg-slate-100/70 border-slate-200 text-slate-700'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400">Model:</span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as any)}
            className={`text-xs py-1 px-2 rounded-lg border font-medium focus:outline-hidden cursor-pointer ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-slate-200'
                : 'bg-white border-slate-300 text-slate-800'
            }`}
          >
            <option value="gemini-3.8-flash">gemini-3.8-flash (General + Search)</option>
            <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast Tasks)</option>
            <option value="gemini-4-argon">gemini-4-argon (Complex Tasks)</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => setUseSearch((prev) => !prev)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-[11px] transition cursor-pointer border ${
            useSearch
              ? 'bg-amber-500/20 text-[#F3B542] border-[#F3B542]/40'
              : 'bg-slate-800/50 text-slate-400 border-slate-700'
          }`}
          title="Toggle Google Search live grounding"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Google Search {useSearch ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Scrollable Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-[#F3B542]/20 border border-[#F3B542]/40 text-[#F3B542] flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-[#F3B542] to-amber-500 text-slate-950 font-medium shadow-md'
                  : isDark
                  ? 'bg-[#111827] border border-slate-800 text-slate-200 shadow-sm'
                  : 'bg-slate-100 border border-slate-200 text-slate-800'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Citations / Grounding sources */}
              {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-700/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400">
                    <Search className="w-3 h-3" />
                    <span>Grounding Sources:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.groundingChunks.map((chunk, i) => (
                      <a
                        key={i}
                        href={chunk.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-[10px] text-amber-300 hover:text-amber-200 transition"
                      >
                        <span className="truncate max-w-[180px]">{chunk.title}</span>
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div
                className={`text-[10px] mt-1.5 text-right opacity-70 ${
                  msg.role === 'user' ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#F3B542]/20 border border-[#F3B542]/40 text-[#F3B542] flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-3 flex items-center gap-2 text-xs text-slate-300">
              <Loader2 className="w-4 h-4 animate-spin text-[#F3B542]" />
              <span>Thinking with {selectedModel}{useSearch ? ' & Grounding' : ''}...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts (when only welcome message) */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {[
            'How do I password-protect a PDF in ToolCrest?',
            'Explain the 50/30/20 budget method',
            'What is ISO 19005-1b PDF/A?',
            'Latest news in tech productivity',
          ].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(prompt)}
              className="text-[11px] px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-300 hover:border-[#F3B542]/60 hover:text-[#F3B542] transition cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className={`p-3 sm:p-4 border-t shrink-0 rounded-b-3xl ${
          isDark ? 'bg-[#0c1222] border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask ToolCrest AI anything..."
            disabled={isLoading}
            className={`flex-1 text-xs sm:text-sm px-4 py-3 rounded-2xl border focus:outline-hidden ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-[#F3B542]'
                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-[#F3B542]'
            }`}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 rounded-2xl bg-[#F3B542] hover:bg-[#dfa234] text-slate-950 font-bold transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </form>
    </div>
  );
};
