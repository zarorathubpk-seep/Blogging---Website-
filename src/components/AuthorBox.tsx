import React from 'react';
import { Users, CheckCircle2 } from 'lucide-react';

export const AuthorBox: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
          <Users className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-sm text-slate-900">Zarorat Hub Team</h4>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Editorial Staff
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Zarorat Hub Planner Hub offers free tools and simple guides to help you organize your week, your work, and your money. Everything on this page is free to use, and we write our guides to be clear and practical for readers across the United States and the United Kingdom.
          </p>
        </div>
      </div>
    </div>
  );
};
