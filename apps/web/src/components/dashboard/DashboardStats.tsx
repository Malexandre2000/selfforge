"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { StatCards } from "./StatCards";
import { Timeline } from "./Timeline";
import { BeforeAfterGallery } from "./BeforeAfterGallery";
import { QueryError } from "@/components/app/QueryError";

export function DashboardStats() {
  const { data, isLoading, isError, refetch } = trpc.dashboard.get.useQuery();

  if (isLoading) {
    return <p className="mt-10 text-ink-500">Loading your roadmap…</p>;
  }

  if (isError || !data) {
    return (
      <div className="mt-10">
        <QueryError message="Couldn't load your dashboard." onRetry={() => refetch()} />
      </div>
    );
  }

  if (data.needsOnboarding) {
    return (
      <div className="mt-10 rounded-lg border border-ink-200 bg-white p-8 text-center">
        <h2 className="font-display text-xl text-ink-950">Let&apos;s build your roadmap</h2>
        <p className="mt-2 text-ink-500">
          Complete your onboarding to get your personalized dashboard.
        </p>
        <Link
          href="/onboarding"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-ink-950 px-6 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
        >
          Start onboarding
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mt-10">
        <StatCards
          streak={data.streak}
          confidence={data.confidence}
          confidenceBaseline={data.confidenceBaseline}
          consistencyPercent={data.consistencyPercent}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Timeline items={data.timeline} />
        </div>
        <div className="lg:col-span-2">
          <BeforeAfterGallery photos={data.photos} />
        </div>
      </div>
    </>
  );
}
