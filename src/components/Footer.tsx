import React from 'react';
import { CalendarCheck2, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { PlannerType } from '../types/planner';

interface FooterProps {
  onNavigate: (path: string) => void;
  onSelectPlannerType: (type: PlannerType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onSelectPlannerType }) => {
  const plannerLinks: { type: PlannerType; label: string }[] = [
    { type: 'weekly', label: 'Weekly Planner Generator' },
    { type: 'daily', label: 'Daily Planner & Time Blocks' },
    { type: 'budget', label: 'Monthly Budget Planner (50/30/20)' },
    { type: 'office', label: 'Office Workload Planner' },
    { type: 'project', label: 'Project & Milestone Planner' },
    { type: 'study', label: 'Study & Exam Revision Planner' },
    { type: 'meal', label: 'Weekly Meal & Grocery Planner' },
    { type: 'habit', label: 'Habit & Goal Tracker' },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 print:hidden text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                <CalendarCheck2 className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-white text-base">Zarorat Hub</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Free browser-based tools and simple guides to help you organize your week, your work, and your money.
            </p>
            <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-medium pt-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Runs privately in your browser
            </div>
          </div>

          {/* Planner Tools */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Free Planner Tools
            </h4>
            <ul className="space-y-2">
              {plannerLinks.slice(0, 4).map((p) => (
                <li key={p.type}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectPlannerType(p.type);
                      onNavigate('/planner');
                    }}
                    className="hover:text-emerald-400 transition text-left"
                  >
                    {p.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* More Planners */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Specialized Planners
            </h4>
            <ul className="space-y-2">
              {plannerLinks.slice(4).map((p) => (
                <li key={p.type}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectPlannerType(p.type);
                      onNavigate('/planner');
                    }}
                    className="hover:text-emerald-400 transition text-left"
                  >
                    {p.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources & Trust */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              Resources & About
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/blog')}
                  className="hover:text-emerald-400 transition"
                >
                  Planner Blog & Guides
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/sitemap')}
                  className="hover:text-emerald-400 transition flex items-center gap-1"
                >
                  HTML Sitemap <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/admin')}
                  className="hover:text-emerald-400 transition"
                >
                  Admin Console (Firestore)
                </button>
              </li>
              <li>
                <span className="text-slate-500">Audience: United States & United Kingdom</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} Zarorat Hub. All planners run locally in your browser. Not financial or legal advice.
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onNavigate('/planner')}
              className="hover:text-slate-300"
            >
              Planner Generator
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onNavigate('/blog')}
              className="hover:text-slate-300"
            >
              Blog
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onNavigate('/sitemap')}
              className="hover:text-slate-300"
            >
              Sitemap
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
