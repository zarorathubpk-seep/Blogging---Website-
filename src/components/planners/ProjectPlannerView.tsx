import React from 'react';
import { ProjectPlannerData, ProjectTaskItem, TaskItem } from '../../types/planner';
import { ProgressBar } from '../ProgressBar';
import { Plus, Trash2, Check, Target, Flag } from 'lucide-react';

interface ProjectPlannerViewProps {
  data: ProjectPlannerData;
  onChange: (updated: ProjectPlannerData) => void;
}

export const ProjectPlannerView: React.FC<ProjectPlannerViewProps> = ({ data, onChange }) => {
  const totalTasks = data.tasks.length + data.milestones.length;
  const completedTasks =
    data.tasks.filter((t) => t.status === 'Done').length +
    data.milestones.filter((m) => m.done).length;

  const updateTask = (id: string, field: keyof ProjectTaskItem, val: any) => {
    onChange({
      ...data,
      tasks: data.tasks.map((t) => (t.id === id ? { ...t, [field]: val } : t)),
    });
  };

  const addTask = () => {
    const newTask: ProjectTaskItem = {
      id: `pt-${Date.now()}`,
      task: '',
      owner: '',
      deadline: 'TBD',
      status: 'Not Started',
      priority: 'Medium',
    };
    onChange({ ...data, tasks: [...data.tasks, newTask] });
  };

  const removeTask = (id: string) => {
    onChange({
      ...data,
      tasks: data.tasks.filter((t) => t.id !== id),
    });
  };

  // Milestones
  const addMilestone = () => {
    const newM: TaskItem = { id: `pm-${Date.now()}`, text: '', done: false };
    onChange({ ...data, milestones: [...data.milestones, newM] });
  };

  const toggleMilestone = (id: string) => {
    onChange({
      ...data,
      milestones: data.milestones.map((m) => (m.id === id ? { ...m, done: !m.done } : m)),
    });
  };

  const updateMilestoneText = (id: string, text: string) => {
    onChange({
      ...data,
      milestones: data.milestones.map((m) => (m.id === id ? { ...m, text } : m)),
    });
  };

  const removeMilestone = (id: string) => {
    onChange({
      ...data,
      milestones: data.milestones.filter((m) => m.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      <ProgressBar completed={completedTasks} total={totalTasks} label="Project Delivery Progress" />

      {/* Meta Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-slate-200">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Project Name
          </label>
          <input
            type="text"
            value={data.projectName}
            onChange={(e) => onChange({ ...data, projectName: e.target.value })}
            className="w-full font-bold text-base text-slate-800 bg-transparent border border-slate-200 rounded-lg px-3 py-1.5 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Project Owner / Lead
          </label>
          <input
            type="text"
            value={data.projectLead}
            onChange={(e) => onChange({ ...data, projectLead: e.target.value })}
            className="w-full text-sm text-slate-700 bg-transparent border border-slate-200 rounded-lg px-3 py-1.5 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Target Completion Date
          </label>
          <input
            type="text"
            value={data.targetLaunchDate}
            onChange={(e) => onChange({ ...data, targetLaunchDate: e.target.value })}
            className="w-full text-sm text-slate-700 bg-transparent border border-slate-200 rounded-lg px-3 py-1.5 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Objective */}
      <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
          <Target className="w-4 h-4 text-emerald-600" />
          Primary Objective & Definition of Done
        </label>
        <input
          type="text"
          value={data.objective}
          onChange={(e) => onChange({ ...data, objective: e.target.value })}
          placeholder="What specific outcome defines total success for this project?"
          className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
        />
      </div>

      {/* Project Tasks Table */}
      <div className="border border-slate-200 rounded-2xl p-4 bg-white">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Action Items & Deliverables</h3>
            <p className="text-xs text-slate-500">Break project work into clear owners, dates, and status</p>
          </div>
          <button
            type="button"
            onClick={addTask}
            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md transition print:hidden"
          >
            <Plus className="w-3.5 h-3.5" /> Add Task
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-slate-600">
                <th className="p-2">Task Description</th>
                <th className="p-2 w-32">Owner</th>
                <th className="p-2 w-28">Deadline</th>
                <th className="p-2 w-28">Priority</th>
                <th className="p-2 w-32">Status</th>
                <th className="p-2 w-10 text-right print:hidden"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/50">
                  <td className="p-2">
                    <input
                      type="text"
                      value={task.task}
                      onChange={(e) => updateTask(task.id, 'task', e.target.value)}
                      placeholder="Task deliverable..."
                      className={`w-full bg-transparent border-none focus:outline-hidden font-medium ${
                        task.status === 'Done' ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={task.owner}
                      onChange={(e) => updateTask(task.id, 'owner', e.target.value)}
                      placeholder="Assignee"
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 focus:outline-hidden"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={task.deadline}
                      onChange={(e) => updateTask(task.id, 'deadline', e.target.value)}
                      placeholder="Date"
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-600 focus:outline-hidden text-center"
                    />
                  </td>
                  <td className="p-2">
                    <select
                      value={task.priority}
                      onChange={(e) => updateTask(task.id, 'priority', e.target.value as any)}
                      className={`w-full rounded px-2 py-1 text-[11px] font-semibold border ${
                        task.priority === 'High'
                          ? 'bg-rose-50 border-rose-200 text-rose-800'
                          : task.priority === 'Medium'
                          ? 'bg-amber-50 border-amber-200 text-amber-800'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <select
                      value={task.status}
                      onChange={(e) => updateTask(task.id, 'status', e.target.value as any)}
                      className={`w-full rounded px-2 py-1 text-[11px] font-semibold border ${
                        task.status === 'Done'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : task.status === 'In Progress'
                          ? 'bg-blue-50 border-blue-300 text-blue-800'
                          : task.status === 'Review'
                          ? 'bg-purple-50 border-purple-300 text-purple-800'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Review">Review</option>
                      <option value="Done">Done</option>
                    </select>
                  </td>
                  <td className="p-2 text-right print:hidden">
                    <button
                      type="button"
                      onClick={() => removeTask(task.id)}
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

      {/* Milestones & Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Major Milestones */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-white">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Flag className="w-4 h-4 text-emerald-600" />
                Major Milestones
              </h3>
              <p className="text-xs text-slate-500">Key phase gates and staging markers</p>
            </div>
            <button
              type="button"
              onClick={addMilestone}
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md transition print:hidden"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          <div className="space-y-2">
            {data.milestones.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-2 p-2 bg-slate-50/70 border border-slate-100 rounded-xl text-xs"
              >
                <button
                  type="button"
                  onClick={() => toggleMilestone(m.id)}
                  className={`w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${
                    m.done
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {m.done && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <input
                  type="text"
                  value={m.text}
                  onChange={(e) => updateMilestoneText(m.id, e.target.value)}
                  placeholder="Phase milestone..."
                  className={`w-full bg-transparent border-none focus:outline-hidden ${
                    m.done ? 'line-through text-slate-400' : 'text-slate-800'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => removeMilestone(m.id)}
                  className="p-1 text-slate-400 hover:text-red-600 print:hidden"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Project Notes */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-white">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Stakeholder & Architecture Notes
          </label>
          <textarea
            value={data.notes}
            onChange={(e) => onChange({ ...data, notes: e.target.value })}
            placeholder="Links to design files, meeting cadences, or client escalation procedures..."
            rows={4}
            className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-emerald-500 focus:outline-hidden resize-none"
          />
        </div>
      </div>
    </div>
  );
};
