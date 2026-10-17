import React from 'react';
import { LayoutGrid, PenLine, Download } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '1',
      title: 'Choose a planner type.',
      desc: 'Pick from Weekly, Daily, Budget, Office, Project, Study, Meal, or Habit templates.',
      icon: LayoutGrid,
    },
    {
      num: '2',
      title: 'Add your tasks, goals, or numbers.',
      desc: 'Quickly fill in your priorities, schedule time blocks, or calculate monthly income and expenses.',
      icon: PenLine,
    },
    {
      num: '3',
      title: 'Generate, print, or download your planner.',
      desc: 'Use Print, Save as PDF, or Download as image. Your changes stay automatically saved in localStorage.',
      icon: Download,
    },
  ];

  return (
    <section id="how-it-works" className="py-8 bg-[#090d18] border-b border-amber-500/20 print:hidden text-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]"></span>
            <span>How It Works</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Three simple steps to build your custom schedule in seconds
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative bg-[#0c101d] border border-amber-500/25 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xl hover:border-amber-400/50 transition"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                  {step.num}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-amber-200 mb-1 flex items-center gap-1.5">
                    <Icon className="w-4 h-4 text-amber-400" />
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
