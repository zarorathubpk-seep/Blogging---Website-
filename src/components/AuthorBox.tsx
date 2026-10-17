import React from 'react';
import { Users, CheckCircle2 } from 'lucide-react';

export const AuthorBox: React.FC = () => {
  return (
    <div className="bg-[#0c101d] border border-amber-500/25 rounded-2xl p-5 shadow-2xl text-slate-100">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-black text-base shrink-0 shadow-lg shadow-amber-500/20">
          <Users className="w-6 h-6 text-slate-950" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-sm text-white">ToolCrest Team</h4>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3 text-amber-400" /> Editorial & Technical Staff
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            ToolCrest offers free online browser tools, document utilities, and in-depth guides to help you organize your week, your work, and your documents. Everything executes 100% locally in your web browser.
          </p>
        </div>
      </div>
    </div>
  );
};
