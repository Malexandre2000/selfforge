"use client";

import { trpc } from "@/lib/trpc";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  // This is only a UX nicety — every admin procedure independently checks
  // the ADMIN_EMAILS allowlist server-side, so there's no real gate here to
  // bypass by skipping this check.
  const { isLoading, isError } = trpc.admin.kpis.useQuery();

  if (isLoading) {
    return <div className="flex flex-1 items-center justify-center py-24 text-ink-500">Loading…</div>;
  }

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-center">
        <p className="text-ink-500">You don&apos;t have access to this page.</p>
      </div>
    );
  }

  return <AdminDashboard />;
}
