"use client";

import { currentStreak } from "@selfforge/types";
import { trpc } from "@/lib/trpc";
import { HabitCard } from "./HabitCard";
import { QueryError } from "@/components/app/QueryError";

export function HabitsList() {
  const utils = trpc.useUtils();
  const { data: habits, isLoading, isError, refetch } = trpc.habits.list.useQuery();
  const toggle = trpc.habits.toggleToday.useMutation({
    onSuccess: () => utils.habits.list.invalidate(),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8 sm:py-12">
        <h1 className="font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">
          Your Habits
        </h1>
        <p className="mt-4 text-ink-500">Loading your habits…</p>
      </div>
    );
  }

  if (isError || !habits) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8 sm:py-12">
        <h1 className="font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">
          Your Habits
        </h1>
        <div className="mt-6">
          <QueryError message="Couldn't load your habits." onRetry={() => refetch()} />
        </div>
      </div>
    );
  }

  const doneToday = habits.filter((h) => h.history[h.history.length - 1]).length;
  const bestStreak = habits.length ? Math.max(...habits.map((h) => currentStreak(h.history))) : 0;

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8 sm:py-12">
      <h1 className="font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">
        Your Habits
      </h1>
      <p className="mt-2 text-ink-500">
        {habits.length} active habits · {doneToday} of {habits.length} done today · best streak{" "}
        {bestStreak} days
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {habits.map((habit) => (
          <HabitCard
            key={habit.id}
            title={habit.title}
            history={habit.history}
            onToggleToday={() => toggle.mutate({ habitId: habit.id })}
          />
        ))}
      </div>
    </div>
  );
}
