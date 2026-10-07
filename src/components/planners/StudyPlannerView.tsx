import React from 'react';
import { StudyPlannerData, StudySessionItem, ExamDateItem, TaskItem } from '../../types/planner';
import { ProgressBar } from '../ProgressBar';
import { Plus, Trash2, Check, BookOpen, Calendar, CheckSquare } from 'lucide-react';

interface StudyPlannerViewProps {
  data: StudyPlannerData;
  onChange: (updated: StudyPlannerData) => void;
}

export const StudyPlannerView: React.FC<StudyPlannerViewProps> = ({ data, onChange }) => {
  const totalTasks = data.studySessions.length + data.revisionChecklist.length;
  const completedTasks =
    data.studySessions.filter((s) => s.completed).length +
    data.revisionChecklist.filter((r) => r.done).length;

  // Study sessions
  const addStudySession = () => {
    const newSession: StudySessionItem = {
      id: `ss-${Date.now()}`,
      subject: '',
      topic: '',
      scheduledTime: '10:00 AM',
      durationMinutes: 60,
      completed: false,
    };
    onChange({ ...data, studySessions: [...data.studySessions, newSession] });
  };

  const updateStudySession = (id: string, field: keyof StudySessionItem, val: any) => {
    onChange({
      ...data,
      studySessions: data.studySessions.map((s) => (s.id === id ? { ...s, [field]: val } : s)),
    });
  };

  const removeStudySession = (id: string) => {
    onChange({
      ...data,
      studySessions: data.studySessions.filter((s) => s.id !== id),
    });
  };

  // Exam dates
  const addExamDate = () => {
    const newExam: ExamDateItem = {
      id: `ed-${Date.now()}`,
      subject: '',
      date: 'TBD',
      location: 'Hall A',
      targetGrade: 'A',
    };
    onChange({ ...data, examDates: [...data.examDates, newExam] });
  };

  const updateExamDate = (id: string, field: keyof ExamDateItem, val: any) => {
    onChange({
      ...data,
      examDates: data.examDates.map((e) => (e.id === id ? { ...e, [field]: val } : e)),
    });
  };

  const removeExamDate = (id: string) => {
    onChange({
      ...data,
      examDates: data.examDates.filter((e) => e.id !== id),
    });
  };

  // Revision checklist
  const addRevisionItem = () => {
    const newItem: TaskItem = { id: `rc-${Date.now()}`, text: '', done: false };
    onChange({ ...data, revisionChecklist: [...data.revisionChecklist, newItem] });
  };

  const toggleRevisionDone = (id: string) => {
    onChange({
      ...data,
      revisionChecklist: data.revisionChecklist.map((r) =>
        r.id === id ? { ...r, done: !r.done } : r
      ),
    });
  };

  const updateRevisionText = (id: string, text: string) => {
    onChange({
      ...data,
      revisionChecklist: data.revisionChecklist.map((r) => (r.id === id ? { ...r, text } : r)),
    });
  };

  const removeRevisionItem = (id: string) => {
    onChange({
      ...data,
      revisionChecklist: data.revisionChecklist.filter((r) => r.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      <ProgressBar completed={completedTasks} total={totalTasks} label="Study & Revision Progress" />

      {/* Header Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Study Plan Name
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
            Term or Revision Week
          </label>
          <input
            type="text"
            value={data.termOrWeek}
            onChange={(e) => onChange({ ...data, termOrWeek: e.target.value })}
            className="w-full text-slate-700 bg-transparent border border-slate-200 rounded-lg px-3 py-1.5 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Exam Dates Grid */}
      <div className="border border-amber-200/80 bg-amber-50/20 rounded-2xl p-4">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-100">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              Key Exam & Assessment Dates
            </h3>
            <p className="text-xs text-slate-600">Keep deadlines in front of you so you plan backwards</p>
          </div>
          <button
            type="button"
            onClick={addExamDate}
            className="inline-flex items-center gap-1 text-xs font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded-md transition print:hidden"
          >
            <Plus className="w-3.5 h-3.5" /> Add exam
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {data.examDates.map((exam) => (
            <div
              key={exam.id}
              className="bg-white border border-amber-200/60 rounded-xl p-3 shadow-2xs text-xs relative group"
            >
              <button
                type="button"
                onClick={() => removeExamDate(exam.id)}
                className="absolute top-2 right-2 text-slate-300 hover:text-red-600 print:hidden"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <input
                type="text"
                value={exam.subject}
                onChange={(e) => updateExamDate(exam.id, 'subject', e.target.value)}
                placeholder="Subject name..."
                className="font-bold text-slate-800 w-11/12 border-none bg-transparent focus:outline-hidden mb-1"
              />
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Date</span>
                  <input
                    type="text"
                    value={exam.date}
                    onChange={(e) => updateExamDate(exam.id, 'date', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-700"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Target</span>
                  <input
                    type="text"
                    value={exam.targetGrade || ''}
                    onChange={(e) => updateExamDate(exam.id, 'targetGrade', e.target.value)}
                    placeholder="Grade (e.g. A)"
                    className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 rounded px-1.5 py-0.5 font-bold"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Study Sessions Table */}
      <div className="border border-slate-200 rounded-2xl p-4 bg-white">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              Scheduled Study Sessions
            </h3>
            <p className="text-xs text-slate-500">Dedicated blocks for deep revision</p>
          </div>
          <button
            type="button"
            onClick={addStudySession}
            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md transition print:hidden"
          >
            <Plus className="w-3.5 h-3.5" /> Add session
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-slate-600">
                <th className="p-2 w-10 text-center">Done</th>
                <th className="p-2 w-36">Subject</th>
                <th className="p-2">Topic / Chapter</th>
                <th className="p-2 w-32">When</th>
                <th className="p-2 w-24">Mins</th>
                <th className="p-2 w-10 text-right print:hidden"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.studySessions.map((session) => (
                <tr key={session.id} className="hover:bg-slate-50/50">
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => updateStudySession(session.id, 'completed', !session.completed)}
                      className={`w-4 h-4 mx-auto rounded flex items-center justify-center border transition ${
                        session.completed
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {session.completed && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={session.subject}
                      onChange={(e) => updateStudySession(session.id, 'subject', e.target.value)}
                      placeholder="Subject"
                      className="w-full font-semibold text-slate-800 bg-transparent border-none focus:outline-hidden"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={session.topic}
                      onChange={(e) => updateStudySession(session.id, 'topic', e.target.value)}
                      placeholder="Specific chapter or formula set..."
                      className={`w-full bg-transparent border-none focus:outline-hidden ${
                        session.completed ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={session.scheduledTime}
                      onChange={(e) => updateStudySession(session.id, 'scheduledTime', e.target.value)}
                      placeholder="Mon 2:00 PM"
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-600"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={session.durationMinutes || ''}
                      onChange={(e) =>
                        updateStudySession(session.id, 'durationMinutes', Number(e.target.value) || 0)
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-center font-mono text-slate-700"
                    />
                  </td>
                  <td className="p-2 text-right print:hidden">
                    <button
                      type="button"
                      onClick={() => removeStudySession(session.id)}
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

      {/* Revision Checklist & Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revision Checklist */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-white">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                Revision Checklists
              </h3>
              <p className="text-xs text-slate-500">Flashcards, past papers, summary notes</p>
            </div>
            <button
              type="button"
              onClick={addRevisionItem}
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md transition print:hidden"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          <div className="space-y-2">
            {data.revisionChecklist.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-2 bg-slate-50/70 border border-slate-100 rounded-xl text-xs"
              >
                <button
                  type="button"
                  onClick={() => toggleRevisionDone(item.id)}
                  className={`w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${
                    item.done
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {item.done && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => updateRevisionText(item.id, e.target.value)}
                  placeholder="Review task or practice exam..."
                  className={`w-full bg-transparent border-none focus:outline-hidden ${
                    item.done ? 'line-through text-slate-400' : 'text-slate-800'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => removeRevisionItem(item.id)}
                  className="p-1 text-slate-400 hover:text-red-600 print:hidden"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Study Notes */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-white">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Revision Methodology & Notes
          </label>
          <textarea
            value={data.studyTipsNotes}
            onChange={(e) => onChange({ ...data, studyTipsNotes: e.target.value })}
            placeholder="Pomodoro technique: 25m study / 5m active rest. Active recall & past papers beat passive re-reading."
            rows={4}
            className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-emerald-500 focus:outline-hidden resize-none"
          />
        </div>
      </div>
    </div>
  );
};
