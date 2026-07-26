"use client";

import { Flame, Check } from "lucide-react";
import { currentStreak, last7DayLabels } from "@selfforge/types";

const dayLabels = last7DayLabels();

export function HabitCard({
  title,
  history,
  onToggleToday,
}: {
  title: string;
  history: boolean[];
  onToggleToday: () => void;
}) {
  const streak = currentStreak(history);

  return (
    <div className="rounded-lg border border-ink-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-ink-950">{title}</h3>
        <div className="flex items-center gap-1.5 text-ink-500">
          <Flame size={16} strokeWidth={1.75} className={streak > 0 ? "text-ink-950" : ""} />
          <span className="text-sm font-medium">{streak}</span>
        </div>
      </div>

      <div className="mt-4 flex justify-between">
        {history.map((done, i) => {
          const isToday = i === history.length - 1;
          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className="text-xs text-ink-400">{dayLabels[i]}</span>
              <button
                onClick={isToday ? onToggleToday : undefined}
                disabled={!isToday}
                aria-label={isToday ? (done ? "Mark today not done" : "Mark today done") : undefined}
                className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                  done
                    ? "border-ink-950 bg-ink-950 text-white"
                    : "border-ink-200 bg-white text-transparent"
                } ${isToday ? "ring-2 ring-ink-950 ring-offset-2" : ""} ${
                  isToday ? "cursor-pointer" : "cursor-default"
                }`}
              >
                {done && <Check size={14} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
