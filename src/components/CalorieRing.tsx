"use client";

import { useEffect, useState } from "react";
import { getCalorieProgress } from "@/lib/nutrition";

export default function CalorieRing({ consumed, goal }: { consumed: number; goal: number }) {
  const [progress, setProgress] = useState(0);
  
  // Calculate percentage, max 100 for the ring visual
  const percentage = getCalorieProgress(consumed, goal);
  
  // Animate on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const remaining = Math.max(0, goal - consumed);
  const isOver = consumed > goal;

  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      {/* SVG Definitions */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isOver ? "var(--color-warning)" : "var(--color-primary)"} />
            <stop offset="100%" stopColor={isOver ? "#FF7B72" : "var(--color-accent)"} />
          </linearGradient>
        </defs>
      </svg>

      {/* Ring */}
      <svg className="w-full h-full calorie-ring" viewBox="0 0 140 140">
        <circle
          cx="70"
          cy="70"
          r={radius}
          className="ring-bg"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          className="ring-progress"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
          }}
        />
      </svg>

      {/* Text Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={`text-3xl font-bold font-[family-name:var(--font-outfit)] leading-none ${isOver ? 'text-[var(--color-warning)]' : 'text-white'}`}>
          {Math.round(remaining)}
        </span>
        <span className="text-xs text-[var(--color-text-muted)] mt-1 font-medium uppercase tracking-wider">
          {isOver ? 'Over' : 'Remaining'}
        </span>
      </div>
    </div>
  );
}
