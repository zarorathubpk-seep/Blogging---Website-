import React, { useState } from 'react';
import { WeeklyPlannerData, TaskItem } from '../../types/planner';
import { ProgressBar } from '../ProgressBar';
import { Plus, Trash2, GripVertical, Check, ArrowUp, ArrowDown } from 'lucide-react';

interface WeeklyPlannerViewProps {
  data: WeeklyPlannerData;
  onChange: (updated: WeeklyPlannerData) => void;
}

export const WeeklyPlannerView: React.FC<WeeklyPlannerViewProps> = ({ data, onChange }) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragSource, setDragSource] = useState<{ dayIndex?: number; isPriority?: boolean } | null>(null);

  // Calculate task counts
  const totalTasks =
    data.topPriorities.length +
    data.days.reduce((acc, day) => acc + day.tasks.length, 0);
  const completedTasks =
    data.topPriorities.filter((t) => t.done).length +
    data.days.reduce((acc, day) => acc + day.tasks.filter((t) => t.done).length, 0);

  // Priorities manipulation
  const togglePriorityDone = (id: string) => {
    const updated = data.topPriorities.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item
    );
    onChange({ ...data, topPriorities: updated });
  };

  const updatePriorityText = (id: string, text: string) => {
    const updated = data.topPriorities.map((item) =>
      item.id === id ? { ...item, text } : item
    );
    onChange({ ...data, topPriorities: updated });
  };

  const addPriorityRow = () => {
    const newItem: TaskItem = {
      id: `wp-${Date.now()}`,
      text: '',
      done: false,
    };
    onChange({ ...data, topPriorities: [...data.topPriorities, newItem] });
  };

  const removePriorityRow = (id: string) => {
    onChange({
      ...data,
      topPriorities: data.topPriorities.filter((item) => item.id !== id),
    });
  };

  const movePriority = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= data.topPriorities.length) return;
    const items = [...data.topPriorities];
    const [moved] = items.splice(index, 1);
    items.splice(targetIndex, 0, moved);
    onChange({ ...data, topPriorities: items });
  };

  // Day tasks manipulation
  const toggleDayTaskDone = (dayIndex: number, taskId: string) => {
    const updatedDays = [...data.days];
    updatedDays[dayIndex].tasks = updatedDays[dayIndex].tasks.map((task) =>
      task.id === taskId ? { ...task, done: !task.done } : task
    );
    onChange({ ...data, days: updatedDays });
  };

  const updateDayTaskText = (dayIndex: number, taskId: string, text: string) => {
    const updatedDays = [...data.days];
    updatedDays[dayIndex].tasks = updatedDays[dayIndex].tasks.map((task) =>
      task.id === taskId ? { ...task, text } : task
    );
    onChange({ ...data, days: updatedDays });
  };

  const addDayTaskRow = (dayIndex: number) => {
    const updatedDays = [...data.days];
    const newTask: TaskItem = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: '',
      done: false,
    };
    updatedDays[dayIndex].tasks.push(newTask);
    onChange({ ...data, days: updatedDays });
  };

  const removeDayTaskRow = (dayIndex: number, taskId: string) => {
    const updatedDays = [...data.days];
    updatedDays[dayIndex].tasks = updatedDays[dayIndex].tasks.filter(
      (task) => task.id !== taskId
    );
    onChange({ ...data, days: updatedDays });
  };

  const moveDayTask = (dayIndex: number, taskIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? taskIndex - 1 : taskIndex + 1;
    const tasks = [...data.days[dayIndex].tasks];
    if (targetIndex < 0 || targetIndex >= tasks.length) return;
    const [moved] = tasks.splice(taskIndex, 1);
    tasks.splice(targetIndex, 0, moved);
    const updatedDays = [...data.days];
    updatedDays[dayIndex].tasks = tasks;
    onChange({ ...data, days: updatedDays });
  };

  // Drag & drop handlers
  const handleDragStart = (id: string, isPriority: boolean, dayIndex?: number) => {
    setDraggedTaskId(id);
    setDragSource({ isPriority, dayIndex });
  };

  const handleDayTaskDrop = (targetDayIndex: number, targetTaskIndex: number) => {
    if (!draggedTaskId || dragSource === null) return;

    if (dragSource.dayIndex !== undefined) {
      const sourceDayIndex = dragSource.dayIndex;
      const updatedDays = [...data.days];
      const sourceTasks = [...updatedDays[sourceDayIndex].tasks];
      const sourceIndex = sourceTasks.findIndex((t) => t.id === draggedTaskId);
      if (sourceIndex === -1) return;

      const [movedTask] = sourceTasks.splice(sourceIndex, 1);
      updatedDays[sourceDayIndex].tasks = sourceTasks;

      const targetTasks =
        sourceDayIndex === targetDayIndex ? sourceTasks : [...updatedDays[targetDayIndex].tasks];
      targetTasks.splice(targetTaskIndex, 0, movedTask);
      updatedDays[targetDayIndex].tasks = targetTasks;

      onChange({ ...data, days: updatedDays });
    }
    setDraggedTaskId(null);
    setDragSource(null);
  };

  return (
    <div className="space-y-6">
      <ProgressBar completed={completedTasks} total={totalTasks} label="Weekly Task Completion" />

      {/* Planner Header Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Planner Title
          </label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            className="w-full font-bold text-lg text-slate-800 bg-transparent border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg px-3 py-1.5 transition"
            placeholder="e.g. Weekly Focus & Execution"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Week / Dates
          </label>
          <input
            type="text"
            value={data.weekOf}
            onChange={(e) => onChange({ ...data, weekOf: e.target.value })}
            className="w-full text-slate-700 bg-transparent border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg px-3 py-1.5 transition"
            placeholder="e.g. October 12 – October 18"
          />
        </div>
      </div>

      {/* Top 3 Priorities Section */}
      <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
              Top Weekly Priorities (Max 3 Recommended)
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Lock in your most vital outcomes. Everything else this week is a bonus.
            </p>
          </div>
          <button
            type="button"
            onClick={addPriorityRow}
            className="inline-flex items-center gap-1 text-xs font-medium bg-amber-100 hover:bg-amber-200 text-amber-900 px-2.5 py-1.5 rounded-lg transition print:hidden"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Priority
          </button>
        </div>

        <div className="space-y-2">
          {data.topPriorities.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center gap-2 bg-white border border-amber-200/60 rounded-xl p-2 sm:px-3 sm:py-2 transition shadow-2xs group"
            >
              <button
                type="button"
                onClick={() => togglePriorityDone(item.id)}
                className={`w-5 h-5 rounded-md flex items-center justify-center border transition shrink-0 ${
                  item.done
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-slate-300 hover:border-slate-400 bg-white'
                }`}
                title={item.done ? 'Mark as incomplete' : 'Mark as completed'}
              >
                {item.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </button>

              <span className="text-xs font-mono font-semibold text-amber-800 shrink-0">
                #{idx + 1}
              </span>

              <input
                type="text"
                value={item.text}
                onChange={(e) => updatePriorityText(item.id, e.target.value)}
                placeholder="Enter core priority outcome..."
                className={`w-full text-sm bg-transparent border-none focus:outline-hidden px-1 ${
                  item.done ? 'line-through text-slate-400' : 'text-slate-800'
                }`}
              />

              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition print:hidden">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => movePriority(idx, 'up')}
                  className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-20 rounded"
                  title="Move up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === data.topPriorities.length - 1}
                  onClick={() => movePriority(idx, 'down')}
                  className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-20 rounded"
                  title="Move down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removePriorityRow(item.id)}
                  className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition"
                  title="Remove priority"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7 Days Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800 text-base">Seven-Day Action Plan</h3>
          <span className="text-xs text-slate-500">Drag or use arrows to reorder tasks</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.days.map((day, dayIndex) => (
            <div
              key={day.dayName}
              className={`border rounded-2xl p-4 bg-white shadow-2xs flex flex-col justify-between ${
                day.dayName === 'Saturday' || day.dayName === 'Sunday'
                  ? 'border-indigo-100 bg-indigo-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">{day.dayName}</span>
                    <span className="text-xs text-slate-400">
                      ({day.tasks.filter((t) => t.done).length}/{day.tasks.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => addDayTaskRow(dayIndex)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md transition print:hidden"
                  >
                    <Plus className="w-3 h-3" />
                    Add task
                  </button>
                </div>

                {/* Tasks inside day */}
                <div className="space-y-1.5 min-h-[60px]">
                  {day.tasks.length === 0 ? (
                    <div className="text-xs text-slate-400 italic py-3 text-center">
                      No tasks scheduled. Enjoy the open space or add a task.
                    </div>
                  ) : (
                    day.tasks.map((task, taskIndex) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(task.id, false, dayIndex)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDayTaskDrop(dayIndex, taskIndex)}
                        className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-xs group transition ${
                          task.done
                            ? 'bg-slate-50/60 border-slate-200/50'
                            : 'bg-white border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-600 px-0.5 print:hidden"
                          title="Drag to reorder"
                        >
                          <GripVertical className="w-3.5 h-3.5" />
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleDayTaskDone(dayIndex, task.id)}
                          className={`w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${
                            task.done
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 hover:border-slate-400 bg-white'
                          }`}
                        >
                          {task.done && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>

                        <input
                          type="text"
                          value={task.text}
                          onChange={(e) =>
                            updateDayTaskText(dayIndex, task.id, e.target.value)
                          }
                          placeholder="Task description..."
                          className={`w-full bg-transparent border-none focus:outline-hidden px-1 ${
                            task.done ? 'line-through text-slate-400' : 'text-slate-700'
                          }`}
                        />

                        <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition print:hidden">
                          <button
                            type="button"
                            disabled={taskIndex === 0}
                            onClick={() => moveDayTask(dayIndex, taskIndex, 'up')}
                            className="p-0.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-20 rounded"
                            title="Move up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={taskIndex === day.tasks.length - 1}
                            onClick={() => moveDayTask(dayIndex, taskIndex, 'down')}
                            className="p-0.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-20 rounded"
                            title="Move down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeDayTaskRow(dayIndex, task.id)}
                            className="p-0.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Habit & Notes Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="border border-slate-200 rounded-2xl p-4 bg-white">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Weekly Anchor Habit
          </label>
          <input
            type="text"
            value={data.weeklyHabit}
            onChange={(e) => onChange({ ...data, weeklyHabit: e.target.value })}
            placeholder="e.g. 10-minute work shutdown each afternoon"
            className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="border border-slate-200 rounded-2xl p-4 bg-white">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Weekly Notes & Reminders
          </label>
          <textarea
            value={data.notes}
            onChange={(e) => onChange({ ...data, notes: e.target.value })}
            placeholder="Add any reminders, breathing room notes, or phone numbers..."
            rows={2}
            className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-emerald-500 focus:outline-hidden resize-none"
          />
        </div>
      </div>
    </div>
  );
};
