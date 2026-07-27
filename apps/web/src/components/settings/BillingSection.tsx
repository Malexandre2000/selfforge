"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { QueryError } from "@/components/app/QueryError";

const STATUS_LABELS: Record<string, string> = {
  trialing: "Free trial",
  active: "Active",
  past_due: "Payment past due",
  canceled: "Canceled",
  incomplete: "Incomplete",
  incomplete_expired: "Expired",
  unpaid: "Unpaid",
  paused: "Paused",
  none: "No subscription",
};

export function BillingSection() {
  const { data, isLoading, isError, refetch } = trpc.billing.getStatus.useQuery();
  const createPortal = trpc.billing.createPortalSession.useMutation({
    onSuccess: (res) => {
      window.location.href = res.url;
    },
  });

  return (
    <div className="rounded-lg border border-ink-200 bg-white p-6">
      <h2 className="font-display text-xl text-ink-950">Billing</h2>

      {isLoading ? (
        <p className="mt-3 text-sm text-ink-500">Loading…</p>
      ) : isError ? (
        <div className="mt-3">
          <QueryError message="Couldn't load your billing status." onRetry={() => refetch()} />
        </div>
      ) : data?.status === "none" ? (
        <>
          <p className="mt-2 text-sm text-ink-500">You don&apos;t have an active subscription.</p>
          <Link
            href="/pricing"
            className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-ink-950 px-6 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
          >
            View plans
          </Link>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-ink-500">
            {STATUS_LABELS[data?.status ?? "none"]}
            {data?.plan ? ` — ${data.plan} plan` : ""}
            {data?.cancelAtPeriodEnd ? " (ending at period end)" : ""}
          </p>
          <button
            onClick={() => createPortal.mutate()}
            disabled={createPortal.isPending}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-ink-950 px-6 text-sm font-medium text-white transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            {createPortal.isPending ? "Redirecting…" : "Manage billing"}
          </button>
        </>
      )}
    </div>
  );
}
