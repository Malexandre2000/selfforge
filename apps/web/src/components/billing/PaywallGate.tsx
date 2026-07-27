"use client";

import { trpc } from "@/lib/trpc";
import { PaywallScreen } from "./PaywallScreen";
import { QueryError } from "@/components/app/QueryError";

/**
 * Wraps a gated page. `allowPreview` lets a user through until they've
 * completed their first-ever mission (the free taste), after which even
 * this page shows the paywall. Pages without allowPreview are gated
 * immediately — the server enforces the same rule independently
 * (see paidProcedure), so this is a UX layer, not the actual security.
 *
 * A failed status check must never be treated as "no access" — that would
 * show a paying customer the paywall over a transient network blip. It
 * shows a retry state instead of guessing either way.
 */
export function PaywallGate({
  children,
  allowPreview = false,
}: {
  children: React.ReactNode;
  allowPreview?: boolean;
}) {
  const { data, isLoading, isError, refetch } = trpc.billing.getStatus.useQuery();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-ink-500">Loading…</div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <QueryError message="Couldn't check your subscription status." onRetry={() => refetch()} />
      </div>
    );
  }

  if (data?.hasAccess) return <>{children}</>;
  if (allowPreview && !data?.hasCompletedFirstMission) return <>{children}</>;

  return <PaywallScreen firstMissionDone={!!data?.hasCompletedFirstMission} />;
}
