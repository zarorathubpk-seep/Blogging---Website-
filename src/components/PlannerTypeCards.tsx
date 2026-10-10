import React from 'react';
import { PlannerType } from '../types/planner';
import { PLANNER_PREVIEW_IMAGES } from '../utils/assets';
import { AppImage } from './AppImage';
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
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Select Planner Type
          </h2>
          <p className="text-xs text-slate-500">Choose from 8 browser-based planning systems</p>
        </div>
        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          Ready to Edit & Print
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PLANNER_CARDS.map((card) => {
          const Icon = card.icon;
          const isActive = activeType === card.type;
          const previewImg = PLANNER_PREVIEW_IMAGES[card.type];

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
              className={`rounded-2xl text-left border transition relative flex flex-col justify-between overflow-hidden group ${
                isActive
                  ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/25 shadow-md'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/70 shadow-2xs hover:shadow-xs'
              }`}
            >
              {/* Preview Image Thumbnail Header */}
              {previewImg && (
                <div className="w-full h-24 overflow-hidden bg-slate-100 relative">
                  <AppImage
                    src={previewImg}
                    alt={`${card.title} preview`}
                    className="w-full h-full object-cover group-hover:scale-104 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/60 via-transparent to-transparent flex items-end justify-between p-2">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-2xs ${
                        isActive
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white/90 text-slate-800 backdrop-blur-xs'
                      }`}
                    >
                      {card.badge}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition ${
                        isActive
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-700'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                    </div>
                    <h3
                      className={`font-bold text-xs leading-tight ${
                        isActive ? 'text-emerald-950 font-extrabold' : 'text-slate-900'
                      }`}
                    >
                      {card.title}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal line-clamp-2 mt-1">
                    {card.desc}
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <span
                    className={`font-semibold ${
                      isActive ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  >
                    {isActive ? '● Active' : 'Click to edit'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
