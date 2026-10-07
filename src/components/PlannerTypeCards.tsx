import React from 'react';
import { PlannerType } from '../types/planner';
import {
  CalendarDays,
  Clock,
  PiggyBank,
  Briefcase,
  FolderGit2,
  GraduationCap,
  UtensilsCrossed,
  CheckCheck,
} from 'lucide-react';

interface PlannerTypeCardsProps {
  activeType: PlannerType;
  onSelectType: (type: PlannerType) => void;
}

interface PlannerCardConfig {
  type: PlannerType;
  title: string;
  desc: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const PLANNER_CARDS: PlannerCardConfig[] = [
  {
    type: 'weekly',
    title: 'Weekly Planner',
    desc: 'See all seven days at a glance, with top priorities, tasks, and a small notes area.',
    badge: 'Popular',
    icon: CalendarDays,
  },
  {
    type: 'daily',
    title: 'Daily Planner',
    desc: 'Time blocks, a short to-do list, and a daily wins section.',
    badge: 'High Focus',
    icon: Clock,
  },
  {
    type: 'budget',
    title: 'Budget Planner',
    desc: 'Track monthly income, fixed bills, spending, and savings goals in one table.',
    badge: 'Auto Totals',
    icon: PiggyBank,
  },
  {
    type: 'office',
    title: 'Office Work Planner',
    desc: 'Meetings, deadlines, focus blocks, and follow-ups for a busy work week.',
    badge: 'Productivity',
    icon: Briefcase,
  },
  {
    type: 'project',
    title: 'Project Planner',
    desc: 'Break a project into tasks, owners, deadlines, and status.',
    badge: 'Team & Solo',
    icon: FolderGit2,
  },
  {
    type: 'study',
    title: 'Study Planner',
    desc: 'Subjects, study sessions, exam dates, and revision checklists.',
    badge: 'Exams',
    icon: GraduationCap,
  },
  {
    type: 'meal',
    title: 'Meal and Grocery Planner',
    desc: 'Plan meals for the week and build a matching shopping list.',
    badge: 'Household',
    icon: UtensilsCrossed,
  },
  {
    type: 'habit',
    title: 'Habit and Goal Planner',
    desc: 'Pick a goal, break it into small steps, and track it day by day.',
    badge: 'Tracking',
    icon: CheckCheck,
  },
];

export const PlannerTypeCards: React.FC<PlannerTypeCardsProps> = ({
  activeType,
  onSelectType,
}) => {
  return (
    <div className="mb-6 print:hidden">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Select Planner Type
        </h2>
        <span className="text-xs text-slate-500">8 tailored layouts ready to edit</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {PLANNER_CARDS.map((card) => {
          const Icon = card.icon;
          const isActive = activeType === card.type;
          return (
            <button
              key={card.type}
              type="button"
              onClick={() => {
                onSelectType(card.type);
                const el = document.getElementById('planner-tool-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className={`p-3 rounded-2xl text-left border transition relative flex flex-col justify-between group ${
                isActive
                  ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-emerald-200/70 text-emerald-900'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {card.badge}
                  </span>
                </div>
                <h3
                  className={`font-bold text-xs leading-tight mb-1 ${
                    isActive ? 'text-emerald-950' : 'text-slate-900'
                  }`}
                >
                  {card.title}
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal line-clamp-3 mt-1">
                {card.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
