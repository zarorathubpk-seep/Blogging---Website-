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
    <section id="how-it-works" className="py-8 bg-white border-b border-slate-200/80 print:hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Three simple steps to build your custom schedule in seconds
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs hover:border-slate-300 transition"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                  {step.num}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1 flex items-center gap-1.5">
                    <Icon className="w-4 h-4 text-emerald-600" />
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
