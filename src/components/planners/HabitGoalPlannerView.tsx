import React from 'react';
import { HabitGoalPlannerData, HabitTrackerItem, TaskItem } from '../../types/planner';
import { ProgressBar } from '../ProgressBar';
import { Plus, Trash2, Check, Flame, Compass, Sparkles } from 'lucide-react';

interface HabitGoalPlannerViewProps {
  data: HabitGoalPlannerData;
  onChange: (updated: HabitGoalPlannerData) => void;
}

export const HabitGoalPlannerView: React.FC<HabitGoalPlannerViewProps> = ({
  data,
  onChange,
}) => {
  const totalDaysAcrossHabits = data.habits.length * 7;
  const completedHabitChecks = data.habits.reduce(
    (acc, h) => acc + h.daysCompleted.filter(Boolean).length,
    0
  );
  const totalActionSteps = data.actionSteps.length;
  const completedActionSteps = data.actionSteps.filter((a) => a.done).length;

  const totalPoints = totalDaysAcrossHabits + totalActionSteps;
  const completedPoints = completedHabitChecks + completedActionSteps;

  // Action steps
  const addActionStep = () => {
    const newStep: TaskItem = { id: `as-${Date.now()}`, text: '', done: false };
    onChange({ ...data, actionSteps: [...data.actionSteps, newStep] });
  };

  const toggleActionDone = (id: string) => {
    onChange({
      ...data,
      actionSteps: data.actionSteps.map((a) => (a.id === id ? { ...a, done: !a.done } : a)),
    });
  };

  const updateActionText = (id: string, text: string) => {
    onChange({
      ...data,
      actionSteps: data.actionSteps.map((a) => (a.id === id ? { ...a, text } : a)),
    });
  };

  const removeActionStep = (id: string) => {
    onChange({
      ...data,
      actionSteps: data.actionSteps.filter((a) => a.id !== id),
    });
  };

  // Habits
  const addHabit = () => {
    const newHabit: HabitTrackerItem = {
      id: `ht-${Date.now()}`,
      habitName: '',
      frequency: 'Daily',
      daysCompleted: [false, false, false, false, false, false, false],
    };
    onChange({ ...data, habits: [...data.habits, newHabit] });
  };

  const updateHabitName = (id: string, name: string) => {
    onChange({
      ...data,
      habits: data.habits.map((h) => (h.id === id ? { ...h, habitName: name } : h)),
    });
  };

  const updateHabitFreq = (id: string, freq: string) => {
    onChange({
      ...data,
      habits: data.habits.map((h) => (h.id === id ? { ...h, frequency: freq } : h)),
    });
  };

  const toggleHabitDay = (habitId: string, dayIdx: number) => {
    onChange({
      ...data,
      habits: data.habits.map((h) => {
        if (h.id !== habitId) return h;
        const newDays = [...h.daysCompleted];
        newDays[dayIdx] = !newDays[dayIdx];
        return { ...h, daysCompleted: newDays };
      }),
    });
  };

  const removeHabit = (id: string) => {
    onChange({
      ...data,
      habits: data.habits.filter((h) => h.id !== id),
    });
  };

  const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6">
      <ProgressBar completed={completedPoints} total={totalPoints} label="Goal & Habit Execution" />

      {/* Goal Title & Timeframe */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Core Target Goal
          </label>
          <input
            type="text"
            value={data.goalTitle}
            onChange={(e) => onChange({ ...data, goalTitle: e.target.value })}
            className="w-full font-bold text-lg text-slate-800 bg-transparent border border-slate-200 rounded-lg px-3 py-1.5 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Timeframe / Milestone
          </label>
          <input
            type="text"
            value={data.timeframe}
            onChange={(e) => onChange({ ...data, timeframe: e.target.value })}
            className="w-full text-slate-700 bg-transparent border border-slate-200 rounded-lg px-3 py-1.5 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Why This Matters Box */}
      <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1 flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-amber-600" />
          The Purpose Behind This Goal (Why It Matters)
        </label>
        <input
          type="text"
          value={data.whyThisMatters}
          onChange={(e) => onChange({ ...data, whyThisMatters: e.target.value })}
          placeholder="Why are you pursuing this? Remind yourself when motivation dips..."
          className="w-full text-xs text-slate-800 bg-white border border-amber-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
        />
      </div>

      {/* 7-Day Habit Tracking Matrix */}
      <div className="border border-slate-200 rounded-2xl p-4 bg-white">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Flame className="w-4 h-4 text-emerald-600" />
              Daily Habit Tracker (Mon – Sun)
            </h3>
            <p className="text-xs text-slate-500">
              Small repeated habits build momentum. Tap any day to log progress.
            </p>
          </div>
          <button
            type="button"
            onClick={addHabit}
            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md transition print:hidden"
          >
            <Plus className="w-3.5 h-3.5" /> Add habit
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-slate-600">
                <th className="p-2">Habit Name</th>
                <th className="p-2 w-28">Frequency</th>
                {dayHeaders.map((dh) => (
                  <th key={dh} className="p-2 w-10 text-center font-bold">
                    {dh}
                  </th>
                ))}
                <th className="p-2 w-14 text-center">Done</th>
                <th className="p-2 w-10 text-right print:hidden"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.habits.map((habit) => {
                const countDone = habit.daysCompleted.filter(Boolean).length;
                return (
                  <tr key={habit.id} className="hover:bg-slate-50/50">
                    <td className="p-2">
                      <input
                        type="text"
                        value={habit.habitName}
                        onChange={(e) => updateHabitName(habit.id, e.target.value)}
                        placeholder="e.g. 20-minute brisk walk..."
                        className="w-full font-medium text-slate-800 bg-transparent border-none focus:outline-hidden"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={habit.frequency}
                        onChange={(e) => updateHabitFreq(habit.id, e.target.value)}
                        placeholder="7x/week"
                        className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-600"
                      />
                    </td>
                    {habit.daysCompleted.map((isDone, dayIdx) => (
                      <td key={dayIdx} className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => toggleHabitDay(habit.id, dayIdx)}
                          className={`w-5 h-5 mx-auto rounded flex items-center justify-center border transition ${
                            isDone
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                              : 'border-slate-300 hover:border-slate-400 bg-white'
                          }`}
                        >
                          {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                      </td>
                    ))}
                    <td className="p-2 text-center font-mono font-bold text-emerald-800">
                      {countDone}/7
                    </td>
                    <td className="p-2 text-right print:hidden">
                      <button
                        type="button"
                        onClick={() => removeHabit(habit.id)}
                        className="p-1 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Steps & Weekly Reflection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Micro Action Steps */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-white">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Small Action Steps
              </h3>
              <p className="text-xs text-slate-500">Break big goals into bite-sized actions</p>
            </div>
            <button
              type="button"
              onClick={addActionStep}
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md transition print:hidden"
            >
              <Plus className="w-3.5 h-3.5" /> Add step
            </button>
          </div>

          <div className="space-y-2">
            {data.actionSteps.map((step) => (
              <div
                key={step.id}
                className="flex items-center gap-2 p-2 bg-slate-50/70 border border-slate-100 rounded-xl text-xs"
              >
                <button
                  type="button"
                  onClick={() => toggleActionDone(step.id)}
                  className={`w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${
                    step.done
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {step.done && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <input
                  type="text"
                  value={step.text}
                  onChange={(e) => updateActionText(step.id, e.target.value)}
                  placeholder="Tiny action step..."
                  className={`w-full bg-transparent border-none focus:outline-hidden ${
                    step.done ? 'line-through text-slate-400' : 'text-slate-800'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => removeActionStep(step.id)}
                  className="p-1 text-slate-400 hover:text-red-600 print:hidden"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Reflection */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-white">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Weekly Habit Reflection
          </label>
          <textarea
            value={data.weeklyReflection}
            onChange={(e) => onChange({ ...data, weeklyReflection: e.target.value })}
            placeholder="What worked well this week? Did you encounter resistance? How can you make next week 1% easier?"
            rows={4}
            className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-emerald-500 focus:outline-hidden resize-none"
          />
        </div>
      </div>
    </div>
  );
};
