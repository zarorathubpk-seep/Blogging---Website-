import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Are ToolCrest tools free to use?',
    a: 'Yes. All tools on ToolCrest are 100% free with no hidden subscriptions or scan limits.',
  },
  {
    q: 'Do I need an account or registration?',
    a: 'No. Nothing is sent to an external server. Your files and computations stay private in your browser.',
  },
  {
    q: 'Can I print or save output files with custom names?',
    a: 'Yes. All tools offer custom output file naming and instant local file downloads.',
  },
  {
    q: 'Can I edit or reload my plan later?',
    a: 'Yes. Your plan is saved in your browser storage on this device, so you can revisit and edit anytime.',
  },
  {
    q: 'Is this financial or professional legal advice?',
    a: 'No. ToolCrest calculators and organizers are productivity tools. For personal decisions, speak with a qualified advisor.',
  },
];

interface FaqSectionProps {
  title?: string;
  subtitle?: string;
  faqs?: FaqItem[];
  className?: string;
}

export const FaqSection: React.FC<FaqSectionProps> = ({
  title = 'Frequently Asked Questions',
  subtitle = 'Everything you need to know about ToolCrest Online Tools & Privacy',
  faqs = FAQ_ITEMS,
  className = '',
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const activeFaqs = faqs && faqs.length > 0 ? faqs : FAQ_ITEMS;

  return (
    <section id="faq" className={`py-8 bg-[#0c101d] border border-amber-500/25 rounded-3xl p-6 sm:p-8 print:hidden text-slate-100 shadow-2xl ${className}`}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="space-y-3">
          {activeFaqs.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.q}
                className="bg-[#070a14] border border-amber-500/20 hover:border-amber-400/50 rounded-2xl overflow-hidden shadow-md transition"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full text-left p-4 sm:p-4.5 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-200 hover:text-amber-300 transition cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'transform rotate-180 text-amber-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-4.5 sm:pb-4.5 pt-0 text-xs text-slate-300 leading-relaxed border-t border-slate-800">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
