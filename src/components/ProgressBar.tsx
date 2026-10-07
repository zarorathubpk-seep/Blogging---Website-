import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2 } from 'lucide-react';

interface ProgressBarProps {
  completed: number;
  total: number;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ completed, total, label = 'Task Progress' }) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const prevPercentageRef = useRef(percentage);

  useEffect(() => {
    if (percentage === 100 && prevPercentageRef.current < 100 && total > 0) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#0284c7'],
        });
      } catch {
        // Confetti fallback
      }
    }
    prevPercentageRef.current = percentage;
  }, [percentage, total]);

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs mb-5 print:hidden">
      <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-2">
        <span className="flex items-center gap-1.5 font-semibold text-slate-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {label}
        </span>
        <span className="tabular-nums font-mono text-slate-700">
          <strong className="text-emerald-700 font-semibold">{completed}</strong> / {total} done ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ease-out rounded-full ${
            percentage === 100
              ? 'bg-emerald-500'
              : percentage > 50
              ? 'bg-emerald-600'
              : 'bg-emerald-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
