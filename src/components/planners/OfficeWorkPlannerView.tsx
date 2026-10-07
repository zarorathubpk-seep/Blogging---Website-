import React from 'react';
import { OfficeWorkPlannerData, OfficeDayRow, OfficeFollowUpItem, TaskItem } from '../../types/planner';
import { ProgressBar } from '../ProgressBar';
import { Plus, Trash2, Check, Briefcase, Clock, UserCheck } from 'lucide-react';

interface OfficeWorkPlannerViewProps {
  data: OfficeWorkPlannerData;
  onChange: (updated: OfficeWorkPlannerData) => void;
}

export const OfficeWorkPlannerView: React.FC<OfficeWorkPlannerViewProps> = ({ data, onChange }) => {
  const totalTasks =
    data.threeOutcomes.length +
    data.schedule.length +
    data.followUps.length +
    data.shutdownRoutine.length;

  const completedTasks =
    data.threeOutcomes.filter((t) => t.done).length +
    data.schedule.filter((t) => t.done).length +
    data.followUps.filter((t) => t.resolved).length +
    data.shutdownRoutine.filter((t) => t.done).length;

  // Outcomes
  const toggleOutcomeDone = (id: string) => {
    onChange({
      ...data,
      threeOutcomes: data.threeOutcomes.map((o) => (o.id === id ? { ...o, done: !o.done } : o)),
    });
  };

  const updateOutcomeText = (id: string, text: string) => {
    onChange({
      ...data,
      threeOutcomes: data.threeOutcomes.map((o) => (o.id === id ? { ...o, text } : o)),
    });
  };

  const addOutcomeRow = () => {
    const newOutcome: TaskItem = { id: `oo-${Date.now()}`, text: '', done: false };
    onChange({ ...data, threeOutcomes: [...data.threeOutcomes, newOutcome] });
  };

  const removeOutcome = (id: string) => {
    onChange({
      ...data,
      threeOutcomes: data.threeOutcomes.filter((o) => o.id !== id),
    });
  };

  // Schedule row
  const updateScheduleRow = (id: string, field: keyof OfficeDayRow, val: any) => {
    onChange({
      ...data,
      schedule: data.schedule.map((row) => (row.id === id ? { ...row, [field]: val } : row)),
    });
  };

  const addScheduleRow = () => {
    const newRow: OfficeDayRow = {
      id: `os-${Date.now()}`,
      day: 'Extra Day / Overtime',
      topTask: '',
      meetings: '',
      focusBlock: '',
      done: false,
    };
    onChange({ ...data, schedule: [...data.schedule, newRow] });
  };

  const removeScheduleRow = (id: string) => {
    onChange({
      ...data,
      schedule: data.schedule.filter((r) => r.id !== id),
    });
  };

  // Follow ups
  const toggleFollowUpResolved = (id: string) => {
    onChange({
      ...data,
      followUps: data.followUps.map((f) => (f.id === id ? { ...f, resolved: !f.resolved } : f)),
    });
  };

  const updateFollowUp = (id: string, field: keyof OfficeFollowUpItem, val: any) => {
    onChange({
      ...data,
      followUps: data.followUps.map((f) => (f.id === id ? { ...f, [field]: val } : f)),
    });
  };

  const addFollowUpRow = () => {
    const newF: OfficeFollowUpItem = {
      id: `fu-${Date.now()}`,
      waitingOn: '',
      contactPerson: '',
      checkBackDate: '',
      resolved: false,
    };
    onChange({ ...data, followUps: [...data.followUps, newF] });
  };

  const removeFollowUpRow = (id: string) => {
    onChange({
      ...data,
      followUps: data.followUps.filter((f) => f.id !== id),
    });
  };

  // Shutdown routine
  const toggleShutdownDone = (id: string) => {
    onChange({
      ...data,
      shutdownRoutine: data.shutdownRoutine.map((s) => (s.id === id ? { ...s, done: !s.done } : s)),
    });
  };

  const updateShutdownText = (id: string, text: string) => {
    onChange({
      ...data,
      shutdownRoutine: data.shutdownRoutine.map((s) => (s.id === id ? { ...s, text } : s)),
    });
  };

  const addShutdownRow = () => {
    const newS: TaskItem = { id: `sdr-${Date.now()}`, text: '', done: false };
    onChange({ ...data, shutdownRoutine: [...data.shutdownRoutine, newS] });
  };

  const removeShutdownRow = (id: string) => {
    onChange({
      ...data,
      shutdownRoutine: data.shutdownRoutine.filter((s) => s.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      <ProgressBar completed={completedTasks} total={totalTasks} label="Office Workload Completion" />

      {/* Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Work Plan Title
          </label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            className="w-full font-bold text-lg text-slate-800 bg-transparent border border-slate-200 rounded-lg px-3 py-1.5 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Work Week
          </label>
          <input
            type="text"
            value={data.weekOf}
            onChange={(e) => onChange({ ...data, weekOf: e.target.value })}
            className="w-full text-slate-700 bg-transparent border border-slate-200 rounded-lg px-3 py-1.5 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* 3 Weekly Work Outcomes */}
      <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              Three Core Work Outcomes for the Week
            </h3>
            <p className="text-xs text-slate-600">Start with outcomes, not endless busywork.</p>
          </div>
          <button
            type="button"
            onClick={addOutcomeRow}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-800 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded-md transition print:hidden"
          >
            <Plus className="w-3.5 h-3.5" /> Add outcome
          </button>
        </div>

        <div className="space-y-2">
          {data.threeOutcomes.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center gap-2 bg-white border border-blue-200/60 rounded-xl p-2 text-xs"
            >
              <button
                type="button"
                onClick={() => toggleOutcomeDone(item.id)}
                className={`w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${
                  item.done
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {item.done && <Check className="w-3 h-3 stroke-[3]" />}
              </button>
              <span className="font-mono font-bold text-blue-800 shrink-0">#{idx + 1}</span>
              <input
                type="text"
                value={item.text}
                onChange={(e) => updateOutcomeText(item.id, e.target.value)}
                placeholder="Core strategic result needed..."
                className={`w-full bg-transparent border-none focus:outline-hidden ${
                  item.done ? 'line-through text-slate-400' : 'text-slate-800'
                }`}
              />
              <button
                type="button"
                onClick={() => removeOutcome(item.id)}
                className="p-1 text-slate-400 hover:text-red-600 print:hidden"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Office Schedule Table */}
      <div className="border border-slate-200 rounded-2xl p-4 bg-white">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Weekly Office Schedule Matrix</h3>
            <p className="text-xs text-slate-500">Day by day: Top Task, Meetings, and Focus Block</p>
          </div>
          <button
            type="button"
            onClick={addScheduleRow}
            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md transition print:hidden"
          >
            <Plus className="w-3.5 h-3.5" /> Add day
          </button>
        </div>

        {/* Schedule grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-slate-600">
                <th className="p-2 w-10 text-center">Done</th>
                <th className="p-2 w-28">Day</th>
                <th className="p-2">Top Task</th>
                <th className="p-2 w-48">Meetings</th>
                <th className="p-2 w-48">Focus Block</th>
                <th className="p-2 w-10 text-right print:hidden"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.schedule.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50">
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => updateScheduleRow(row.id, 'done', !row.done)}
                      className={`w-4 h-4 mx-auto rounded flex items-center justify-center border transition ${
                        row.done
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {row.done && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.day}
                      onChange={(e) => updateScheduleRow(row.id, 'day', e.target.value)}
                      className="w-full font-bold text-slate-700 bg-transparent border-none focus:outline-hidden"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.topTask}
                      onChange={(e) => updateScheduleRow(row.id, 'topTask', e.target.value)}
                      placeholder="One main outcome for this day..."
                      className={`w-full bg-transparent border-none focus:outline-hidden ${
                        row.done ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.meetings}
                      onChange={(e) => updateScheduleRow(row.id, 'meetings', e.target.value)}
                      placeholder="Sync, 1-on-1s, client call..."
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-600 focus:outline-hidden"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.focusBlock}
                      onChange={(e) => updateScheduleRow(row.id, 'focusBlock', e.target.value)}
                      placeholder="10:00 AM - 12:00 PM Deep Work"
                      className="w-full bg-emerald-50/50 border border-emerald-200 rounded px-2 py-1 text-emerald-900 focus:outline-hidden font-mono text-[11px]"
                    />
                  </td>
                  <td className="p-2 text-right print:hidden">
                    <button
                      type="button"
                      onClick={() => removeScheduleRow(row.id)}
                      className="p-1 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid: Follow-Ups (Left) and Daily Shutdown Routine (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Follow-Ups */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-white">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                Follow-Up & "Waiting On" List
              </h3>
              <p className="text-xs text-slate-500">Track dependencies without cluttering to-dos</p>
            </div>
            <button
              type="button"
              onClick={addFollowUpRow}
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md transition print:hidden"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          <div className="space-y-2">
            {data.followUps.map((item) => (
              <div
                key={item.id}
                className="p-2 border border-slate-100 rounded-xl bg-slate-50/60 text-xs space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleFollowUpResolved(item.id)}
                    className={`w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${
                      item.resolved
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {item.resolved && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                  <input
                    type="text"
                    value={item.waitingOn}
                    onChange={(e) => updateFollowUp(item.id, 'waitingOn', e.target.value)}
                    placeholder="Deliverable waiting on..."
                    className={`w-full bg-transparent border-none focus:outline-hidden font-medium ${
                      item.resolved ? 'line-through text-slate-400' : 'text-slate-800'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => removeFollowUpRow(item.id)}
                    className="text-slate-400 hover:text-red-600 p-1 print:hidden"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 pl-6">
                  <input
                    type="text"
                    value={item.contactPerson}
                    onChange={(e) => updateFollowUp(item.id, 'contactPerson', e.target.value)}
                    placeholder="From: Person/Team"
                    className="bg-white border border-slate-200 rounded px-2 py-0.5 text-[11px] text-slate-600"
                  />
                  <input
                    type="text"
                    value={item.checkBackDate}
                    onChange={(e) => updateFollowUp(item.id, 'checkBackDate', e.target.value)}
                    placeholder="Check back: Date/Time"
                    className="bg-white border border-slate-200 rounded px-2 py-0.5 text-[11px] text-slate-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2-Minute End-of-Day Shutdown */}
        <div className="border border-indigo-200/80 bg-indigo-50/20 rounded-2xl p-4">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-indigo-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                Two-Minute Daily Shutdown Routine
              </h3>
              <p className="text-xs text-slate-500">Log off with peace of mind every afternoon</p>
            </div>
            <button
              type="button"
              onClick={addShutdownRow}
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-800 bg-indigo-100 hover:bg-indigo-200 px-2 py-1 rounded-md transition print:hidden"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          <div className="space-y-2">
            {data.shutdownRoutine.map((step) => (
              <div
                key={step.id}
                className="flex items-center gap-2 p-2 bg-white border border-indigo-100 rounded-xl text-xs"
              >
                <button
                  type="button"
                  onClick={() => toggleShutdownDone(step.id)}
                  className={`w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${
                    step.done
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {step.done && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <input
                  type="text"
                  value={step.text}
                  onChange={(e) => updateShutdownText(step.id, e.target.value)}
                  placeholder="Shutdown step..."
                  className={`w-full bg-transparent border-none focus:outline-hidden ${
                    step.done ? 'line-through text-slate-400' : 'text-slate-800'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => removeShutdownRow(step.id)}
                  className="p-1 text-slate-400 hover:text-red-600 print:hidden"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
