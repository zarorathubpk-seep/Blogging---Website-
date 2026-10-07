import React from 'react';
import { DailyPlannerData, TimeBlock, TaskItem } from '../../types/planner';
import { ProgressBar } from '../ProgressBar';
import { Plus, Trash2, Check, ArrowUp, ArrowDown, Droplets } from 'lucide-react';

interface DailyPlannerViewProps {
  data: DailyPlannerData;
  onChange: (updated: DailyPlannerData) => void;
}

export const DailyPlannerView: React.FC<DailyPlannerViewProps> = ({ data, onChange }) => {
  const totalTasks = data.timeBlocks.length + data.todoList.length + data.dailyWins.length;
  const completedTasks =
    data.timeBlocks.filter((t) => t.done).length +
    data.todoList.filter((t) => t.done).length +
    data.dailyWins.filter((t) => t.done).length;

  // Time blocks
  const addTimeBlock = () => {
    const newBlock: TimeBlock = {
      id: `tb-${Date.now()}`,
      time: '02:00 PM - 03:00 PM',
      activity: '',
      done: false,
    };
    onChange({ ...data, timeBlocks: [...data.timeBlocks, newBlock] });
  };

  const updateTimeBlock = (id: string, field: 'time' | 'activity', val: string) => {
    onChange({
      ...data,
      timeBlocks: data.timeBlocks.map((b) => (b.id === id ? { ...b, [field]: val } : b)),
    });
  };

  const toggleTimeBlockDone = (id: string) => {
    onChange({
      ...data,
      timeBlocks: data.timeBlocks.map((b) => (b.id === id ? { ...b, done: !b.done } : b)),
    });
  };

  const removeTimeBlock = (id: string) => {
    onChange({
      ...data,
      timeBlocks: data.timeBlocks.filter((b) => b.id !== id),
    });
  };

  const moveTimeBlock = (index: number, dir: 'up' | 'down') => {
    const target = dir === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= data.timeBlocks.length) return;
    const blocks = [...data.timeBlocks];
    const [moved] = blocks.splice(index, 1);
    blocks.splice(target, 0, moved);
    onChange({ ...data, timeBlocks: blocks });
  };

  // Todo list
  const addTodoItem = () => {
    const newItem: TaskItem = {
      id: `td-${Date.now()}`,
      text: '',
      done: false,
    };
    onChange({ ...data, todoList: [...data.todoList, newItem] });
  };

  const updateTodoText = (id: string, text: string) => {
    onChange({
      ...data,
      todoList: data.todoList.map((t) => (t.id === id ? { ...t, text } : t)),
    });
  };

  const toggleTodoDone = (id: string) => {
    onChange({
      ...data,
      todoList: data.todoList.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    });
  };

  const removeTodoItem = (id: string) => {
    onChange({
      ...data,
      todoList: data.todoList.filter((t) => t.id !== id),
    });
  };

  const moveTodo = (index: number, dir: 'up' | 'down') => {
    const target = dir === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= data.todoList.length) return;
    const items = [...data.todoList];
    const [moved] = items.splice(index, 1);
    items.splice(target, 0, moved);
    onChange({ ...data, todoList: items });
  };

  // Daily wins
  const addDailyWin = () => {
    const newWin: TaskItem = {
      id: `dw-${Date.now()}`,
      text: '',
      done: false,
    };
    onChange({ ...data, dailyWins: [...data.dailyWins, newWin] });
  };

  const updateWinText = (id: string, text: string) => {
    onChange({
      ...data,
      dailyWins: data.dailyWins.map((w) => (w.id === id ? { ...w, text } : w)),
    });
  };

  const toggleWinDone = (id: string) => {
    onChange({
      ...data,
      dailyWins: data.dailyWins.map((w) => (w.id === id ? { ...w, done: !w.done } : w)),
    });
  };

  const removeDailyWin = (id: string) => {
    onChange({
      ...data,
      dailyWins: data.dailyWins.filter((w) => w.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      <ProgressBar completed={completedTasks} total={totalTasks} label="Today's Task Completion" />

      {/* Header Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Planner Title
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
            Date
          </label>
          <input
            type="text"
            value={data.dateStr}
            onChange={(e) => onChange({ ...data, dateStr: e.target.value })}
            className="w-full text-slate-700 bg-transparent border border-slate-200 rounded-lg px-3 py-1.5 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Primary Focus Goal */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1">
          Today's Single Must-Win Focus
        </label>
        <input
          type="text"
          value={data.focusGoal}
          onChange={(e) => onChange({ ...data, focusGoal: e.target.value })}
          placeholder="If you only accomplished ONE thing today, what would make today a win?"
          className="w-full text-sm font-medium text-emerald-950 bg-white border border-emerald-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
        />
      </div>

      {/* Two columns: Time Blocks (Left) and To-Do & Wins (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Blocks */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-white">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Time Blocks</h3>
              <p className="text-xs text-slate-500">Assign hours to focus and meetings</p>
            </div>
            <button
              type="button"
              onClick={addTimeBlock}
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md transition print:hidden"
            >
              <Plus className="w-3.5 h-3.5" />
              Add block
            </button>
          </div>

          <div className="space-y-2">
            {data.timeBlocks.map((block, idx) => (
              <div
                key={block.id}
                className="flex items-center gap-2 p-2 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 group transition text-xs"
              >
                <button
                  type="button"
                  onClick={() => toggleTimeBlockDone(block.id)}
                  className={`w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${
                    block.done
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {block.done && <Check className="w-3 h-3 stroke-[3]" />}
                </button>

                <input
                  type="text"
                  value={block.time}
                  onChange={(e) => updateTimeBlock(block.id, 'time', e.target.value)}
                  className="w-28 font-mono text-[11px] text-slate-500 bg-white border border-slate-200 rounded px-1.5 py-0.5 shrink-0"
                  placeholder="09:00 - 10:30"
                />

                <input
                  type="text"
                  value={block.activity}
                  onChange={(e) => updateTimeBlock(block.id, 'activity', e.target.value)}
                  placeholder="Focus work or meeting..."
                  className={`w-full bg-transparent border-none focus:outline-hidden ${
                    block.done ? 'line-through text-slate-400' : 'text-slate-800'
                  }`}
                />

                <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 print:hidden">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveTimeBlock(idx, 'up')}
                    className="p-0.5 hover:bg-slate-200 text-slate-400 hover:text-slate-700 disabled:opacity-20 rounded"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === data.timeBlocks.length - 1}
                    onClick={() => moveTimeBlock(idx, 'down')}
                    className="p-0.5 hover:bg-slate-200 text-slate-400 hover:text-slate-700 disabled:opacity-20 rounded"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeTimeBlock(block.id)}
                    className="p-0.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Short To-Do & Daily Wins */}
        <div className="space-y-6">
          {/* Short To-Do List */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-white">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Short To-Do List</h3>
                <p className="text-xs text-slate-500">Keep it short so you finish it</p>
              </div>
              <button
                type="button"
                onClick={addTodoItem}
                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md transition print:hidden"
              >
                <Plus className="w-3.5 h-3.5" />
                Add task
              </button>
            </div>

            <div className="space-y-2">
              {data.todoList.map((task, idx) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2 p-2 rounded-xl border border-slate-100 bg-white hover:border-slate-200 group transition text-xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleTodoDone(task.id)}
                    className={`w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${
                      task.done
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {task.done && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>

                  <input
                    type="text"
                    value={task.text}
                    onChange={(e) => updateTodoText(task.id, e.target.value)}
                    placeholder="Small actionable task..."
                    className={`w-full bg-transparent border-none focus:outline-hidden ${
                      task.done ? 'line-through text-slate-400' : 'text-slate-800'
                    }`}
                  />

                  <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 print:hidden">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveTodo(idx, 'up')}
                      className="p-0.5 hover:bg-slate-200 text-slate-400 disabled:opacity-20 rounded"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === data.todoList.length - 1}
                      onClick={() => moveTodo(idx, 'down')}
                      className="p-0.5 hover:bg-slate-200 text-slate-400 disabled:opacity-20 rounded"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeTodoItem(task.id)}
                      className="p-0.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Wins Section */}
          <div className="border border-purple-200/80 bg-purple-50/30 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-purple-100">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Daily Wins & Gratitude</h3>
                <p className="text-xs text-slate-500">Record small victories achieved today</p>
              </div>
              <button
                type="button"
                onClick={addDailyWin}
                className="inline-flex items-center gap-1 text-xs font-medium text-purple-800 bg-purple-100 hover:bg-purple-200 px-2 py-1 rounded-md transition print:hidden"
              >
                <Plus className="w-3.5 h-3.5" />
                Add win
              </button>
            </div>

            <div className="space-y-2">
              {data.dailyWins.map((win) => (
                <div
                  key={win.id}
                  className="flex items-center gap-2 p-2 rounded-xl bg-white border border-purple-200/60 text-xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleWinDone(win.id)}
                    className={`w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${
                      win.done
                        ? 'bg-purple-600 border-purple-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {win.done && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>

                  <input
                    type="text"
                    value={win.text}
                    onChange={(e) => updateWinText(win.id, e.target.value)}
                    placeholder="Notice a positive win or completed goal..."
                    className="w-full bg-transparent border-none focus:outline-hidden text-slate-700"
                  />

                  <button
                    type="button"
                    onClick={() => removeDailyWin(win.id)}
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

      {/* Water Tracking & Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="border border-slate-200 rounded-2xl p-4 bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-sky-500" />
              Hydration Tracker (8 Glasses)
            </span>
            <span className="text-xs font-mono font-bold text-sky-700">
              {data.waterGlasses} / 8
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {Array.from({ length: 8 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() =>
                  onChange({
                    ...data,
                    waterGlasses: i + 1 === data.waterGlasses ? i : i + 1,
                  })
                }
                className={`w-8 h-8 rounded-lg flex items-center justify-center border transition text-xs font-semibold ${
                  i < data.waterGlasses
                    ? 'bg-sky-500 text-white border-sky-600 shadow-2xs'
                    : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-sky-50'
                }`}
              >
                💧
              </button>
            ))}
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl p-4 bg-white">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Evening Reflection & Shutdown Notes
          </label>
          <textarea
            value={data.notes}
            onChange={(e) => onChange({ ...data, notes: e.target.value })}
            placeholder="What drained your energy today? What will you do differently tomorrow?"
            rows={2}
            className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-emerald-500 focus:outline-hidden resize-none"
          />
        </div>
      </div>
    </div>
  );
};
