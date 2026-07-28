"use client";

import { trpc } from "@/lib/trpc";
import { WeightChart } from "./WeightChart";
import { MeasurementStats } from "./MeasurementStats";
import { BeforeAfterPhotos } from "./BeforeAfterPhotos";
import { LogEntryForm } from "./LogEntryForm";
import { QueryError } from "@/components/app/QueryError";

export function ProgressView() {
  const { data, isLoading, isError, refetch } = trpc.progress.get.useQuery();

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-12">
      <h1 className="font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">
        Progress Tracker
      </h1>
      <p className="mt-2 text-ink-500">Your measurements and photos, all in one place.</p>

      <div className="mt-8">
        <LogEntryForm />
      </div>

      {isError ? (
        <div className="mt-6">
          <QueryError message="Couldn't load your progress history." onRetry={() => refetch()} />
        </div>
      ) : (
        <>
          <div className="mt-6">
            {isLoading ? (
              <div className="rounded-lg border border-ink-200 bg-white p-6 text-ink-500">
                Loading your history…
              </div>
            ) : data && data.weightHistory.length >= 2 ? (
              <WeightChart history={data.weightHistory} />
            ) : data && data.weightHistory.length === 1 ? (
              <div className="rounded-lg border border-ink-200 bg-white p-6">
                <h2 className="font-display text-xl text-ink-950">Weight</h2>
                <div className="mt-2 font-display text-3xl text-ink-950">
                  {data.weightHistory[0].weight} kg
                </div>
                <p className="mt-1 text-sm text-ink-500">
                  Log another check-in to start seeing your trend.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-ink-200 bg-white p-6 text-ink-500">
                Log your first check-in above to start tracking your weight.
              </div>
            )}
          </div>

          <div className="mt-6">
            {data && data.measurements.length > 0 ? (
              <MeasurementStats measurements={data.measurements} />
            ) : !isLoading ? (
              <div className="rounded-lg border border-ink-200 bg-white p-6 text-ink-500">
                Add a waist, chest, or arm measurement above to start tracking.
              </div>
            ) : null}
          </div>
        </>
      )}

      <div className="mt-6">
        <BeforeAfterPhotos photos={data?.photos ?? { before: null, after: null }} />
      </div>
    </div>
  );
}
