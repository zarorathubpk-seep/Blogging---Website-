import React from 'react';
import { Lightbulb } from 'lucide-react';

export const ToolTipsBox: React.FC = () => {
  return (
    <div className="mt-6 p-4 bg-[#0c101d] border border-amber-500/25 rounded-2xl print:hidden text-slate-100 shadow-xl">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
          <Lightbulb className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-amber-300 mb-1.5 flex items-center gap-1.5">
            Quick Planner Tips
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <span>
                <strong className="text-amber-200">Start with three priorities per week.</strong> More than that is hard to finish.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <span>
                <strong className="text-amber-200">Leave some empty time.</strong> Plans work better with breathing room.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <span>
                <strong className="text-amber-200">Review your plan once a week and adjust.</strong> A Sunday routine keeps the system alive.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
