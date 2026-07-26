"use client";

import {
  Dumbbell,
  Utensils,
  Sparkles,
  Brush,
  Smile,
  ListChecks,
  Flame,
  Check,
  type LucideIcon,
} from "lucide-react";
import type { DailyMission, MissionCategory } from "@selfforge/types";

const categoryIcons: Record<MissionCategory, LucideIcon> = {
  workout: Dumbbell,
  nutrition: Utensils,
  skincare: Sparkles,
  grooming: Brush,
  confidence: Smile,
  habit: ListChecks,
  motivation: Flame,
};

export function MissionCard({
  mission,
  label,
  completed,
  onToggle,
}: {
  mission: DailyMission;
  label: string;
  completed: boolean;
  onToggle: () => void;
}) {
  const Icon = categoryIcons[mission.category];

  return (
    <div
      className={`flex gap-4 rounded-lg border p-5 transition-colors ${
        completed ? "border-ink-100 bg-ink-50" : "border-ink-200 bg-white"
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${
          completed ? "bg-ink-200 text-ink-500" : "bg-ink-950 text-white"
        }`}
      >
        <Icon size={20} strokeWidth={1.75} />
      </div>

      <div className="flex-1">
        <div className="text-xs font-medium uppercase tracking-[0.1em] text-ink-400">
          {label}
        </div>
        <h3
          className={`mt-1 font-display text-lg ${
            completed ? "text-ink-400 line-through decoration-ink-300" : "text-ink-950"
          }`}
        >
          {mission.title}
        </h3>
        <p className={`mt-1 text-sm leading-relaxed ${completed ? "text-ink-400" : "text-ink-500"}`}>
          {mission.description}
        </p>
      </div>

      <button
        onClick={onToggle}
        aria-label={completed ? "Mark incomplete" : "Mark complete"}
        className={`flex h-7 w-7 shrink-0 items-center justify-center self-start rounded-full border transition-colors ${
          completed
            ? "border-ink-950 bg-ink-950 text-white"
            : "border-ink-300 bg-white text-transparent hover:border-ink-950"
        }`}
      >
        <Check size={15} />
      </button>
    </div>
  );
}
