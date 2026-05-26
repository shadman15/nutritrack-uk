"use client";

import { useEffect, useState } from "react";

export default function MacroBar({
  label,
  consumed,
  goal,
  colorClass,
}: {
  label: string;
  consumed: number;
  goal: number;
  colorClass: "protein" | "carbs" | "fat";
}) {
  const [progress, setProgress] = useState(0);

  const percentage = Math.min(100, (consumed / goal) * 100);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div>
      <div className="flex justify-between items-end mb-1">
        <span className="text-sm font-medium">{label}</span>
        <div className="text-xs">
          <span className="text-white font-medium">{Math.round(consumed)}g</span>
          <span className="text-[var(--color-text-muted)]"> / {Math.round(goal)}g</span>
        </div>
      </div>
      <div className="macro-bar">
        <div 
          className={`macro-fill ${colorClass}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
