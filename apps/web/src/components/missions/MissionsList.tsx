"use client";

import Link from "next/link";
import { missionCategoryLabels } from "@selfforge/types";
import { trpc } from "@/lib/trpc";
import { MissionCard } from "./MissionCard";
import { QueryError } from "@/components/app/QueryError";

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

export function MissionsList() {
  const utils = trpc.useUtils();
  const { data, isLoading, isError, refetch } = trpc.missions.getToday.useQuery();
  const toggle = trpc.missions.toggle.useMutation({
    onSuccess: () => {
      utils.missions.getToday.invalidate();
      // Small delay so a first-time free user sees their checkmark land
      // before the view swaps to the paywall, rather than the two
      // happening in the same instant.
      setTimeout(() => utils.billing.getStatus.invalidate(), 800);
    },
    onError: () => {
      utils.billing.getStatus.invalidate();
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8 sm:py-12">
        <h1 className="font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">
          Today&apos;s Missions
        </h1>
        <p className="mt-4 text-ink-500">Building your personalized plan…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8 sm:py-12">
        <h1 className="font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">
          Today&apos;s Missions
        </h1>
        <div className="mt-6">
          <QueryError
            message="Couldn't load today's missions."
            onRetry={() => refetch()}
          />
        </div>
      </div>
    );
  }

  if (!data || data.needsOnboarding) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-10 text-center sm:px-8 sm:py-12">
        <h1 className="font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">
          Today&apos;s Missions
        </h1>
        <p className="mt-4 text-ink-500">
          Complete your onboarding to get your personalized daily plan.
        </p>
        <Link
          href="/onboarding"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-ink-950 px-7 text-base font-medium text-white transition-transform hover:scale-[1.02]"
        >
          Start onboarding
        </Link>
      </div>
    );
  }

  const { missions, completions } = data;
  const doneCount = missions.filter((m) => completions[m.category]).length;
  const total = missions.length;
  const allDone = total > 0 && doneCount === total;

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8 sm:py-12">
      <h1 className="font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">
        Today&apos;s Missions
      </h1>
      <p className="mt-2 text-ink-500">{today}</p>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
          <div
            className="h-full rounded-full bg-ink-950 transition-all duration-300"
            style={{ width: `${(doneCount / total) * 100}%` }}
          />
        </div>
        <span className="text-sm text-ink-500">
          {doneCount} of {total}
        </span>
      </div>

      {allDone && (
        <div className="mt-6 rounded-lg bg-ink-950 px-5 py-4 text-center">
          <p className="font-display text-lg text-white">
            All done for today. That&apos;s the whole game.
          </p>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-4">
        {missions.map((mission) => (
          <MissionCard
            key={mission.id}
            mission={mission}
            label={missionCategoryLabels[mission.category]}
            completed={!!completions[mission.category]}
            onToggle={() => toggle.mutate({ category: mission.category })}
          />
        ))}
      </div>
    </div>
  );
}
