"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

type Tab = "waitlist" | "feedback" | "roadmap" | "kpis";

const TABS: { id: Tab; label: string }[] = [
  { id: "kpis", label: "Overview" },
  { id: "waitlist", label: "Waitlist" },
  { id: "feedback", label: "Feedback" },
  { id: "roadmap", label: "Roadmap" },
];

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-ink-200 bg-white p-5">
      <div className="font-display text-3xl text-ink-950">{value}</div>
      <div className="mt-1 text-sm text-ink-500">{label}</div>
    </div>
  );
}

function KpisTab() {
  const { data, isLoading } = trpc.admin.kpis.useQuery();
  if (isLoading || !data) return <p className="text-ink-500">Loading…</p>;
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <KpiCard label="Waitlist signups" value={data.waitlistTotal} />
      <KpiCard label="Invited" value={data.invited} />
      <KpiCard label="Joined" value={data.joined} />
      <KpiCard label="Activation rate" value={`${data.activationRate}%`} />
      <KpiCard label="Feedback received" value={data.feedbackTotal} />
      <KpiCard label="Bug reports" value={data.bugTotal} />
      <KpiCard label="Feature requests" value={data.featureRequestTotal} />
    </div>
  );
}

const WAITLIST_STATUS_STYLES: Record<string, string> = {
  waiting: "bg-ink-100 text-ink-600",
  invited: "bg-blue-50 text-blue-700",
  joined: "bg-green-50 text-green-700",
};

function WaitlistTab() {
  const { data, isLoading, refetch } = trpc.waitlist.adminList.useQuery();
  const invite = trpc.waitlist.adminInvite.useMutation({
    onSuccess: () => refetch(),
  });

  if (isLoading) return <p className="text-ink-500">Loading…</p>;
  if (!data || data.length === 0) return <p className="text-ink-500">No waitlist signups yet.</p>;

  return (
    <div className="overflow-x-auto rounded-lg border border-ink-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
          <tr>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Referrals</th>
            <th className="px-4 py-3">Joined waitlist</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="border-b border-ink-50 last:border-0">
              <td className="px-4 py-3 text-ink-950">
                {row.email}
                {row.name && <span className="text-ink-400"> · {row.name}</span>}
              </td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${WAITLIST_STATUS_STYLES[row.status]}`}>
                  {row.status}
                </span>
              </td>
              <td className="px-4 py-3 text-ink-600">{row.referralCount}</td>
              <td className="px-4 py-3 text-ink-500">{new Date(row.createdAt).toLocaleDateString()}</td>
              <td className="px-4 py-3">
                {row.status === "waiting" && (
                  <button
                    onClick={() => invite.mutate({ id: row.id })}
                    disabled={invite.isPending}
                    className="rounded-full bg-ink-950 px-4 py-1.5 text-xs font-medium text-white disabled:opacity-40"
                  >
                    Invite
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const FEEDBACK_STATUS_STYLES: Record<string, string> = {
  new: "bg-ink-100 text-ink-600",
  reviewed: "bg-blue-50 text-blue-700",
  resolved: "bg-green-50 text-green-700",
};

function FeedbackTab() {
  const { data, isLoading, refetch } = trpc.feedback.adminList.useQuery();
  const updateStatus = trpc.feedback.adminUpdateStatus.useMutation({
    onSuccess: () => refetch(),
  });

  if (isLoading) return <p className="text-ink-500">Loading…</p>;
  if (!data || data.length === 0) return <p className="text-ink-500">No feedback yet.</p>;

  return (
    <div className="flex flex-col gap-3">
      {data.map((item) => (
        <div key={item.id} className="rounded-lg border border-ink-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                item.type === "bug" ? "bg-red-50 text-red-700" : "bg-ink-100 text-ink-600"
              }`}
            >
              {item.type}
            </span>
            <select
              value={item.status}
              onChange={(e) =>
                updateStatus.mutate({ id: item.id, status: e.target.value as "new" | "reviewed" | "resolved" })
              }
              className={`rounded-full border-0 px-2 py-0.5 text-xs font-medium ${FEEDBACK_STATUS_STYLES[item.status]}`}
            >
              <option value="new">New</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <p className="mt-2 text-sm text-ink-950">{item.message}</p>
          <p className="mt-2 text-xs text-ink-400">
            {item.pageUrl} · {new Date(item.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}

const REQUEST_STATUS_OPTIONS = ["open", "planned", "shipped", "declined"] as const;

function AdminRoadmapTab() {
  const { data, isLoading, refetch } = trpc.featureRequests.list.useQuery();
  const updateStatus = trpc.featureRequests.adminUpdateStatus.useMutation({
    onSuccess: () => refetch(),
  });

  if (isLoading) return <p className="text-ink-500">Loading…</p>;
  if (!data || data.length === 0) return <p className="text-ink-500">No feature requests yet.</p>;

  return (
    <div className="flex flex-col gap-3">
      {data.map((item) => (
        <div key={item.id} className="rounded-lg border border-ink-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-base text-ink-950">{item.title}</h3>
            <select
              value={item.status}
              onChange={(e) =>
                updateStatus.mutate({ id: item.id, status: e.target.value as (typeof REQUEST_STATUS_OPTIONS)[number] })
              }
              className="rounded-full border border-ink-200 px-2 py-1 text-xs font-medium capitalize text-ink-600"
            >
              {REQUEST_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-1 text-sm text-ink-500">{item.description}</p>
          <p className="mt-2 text-xs text-ink-400">{item.voteCount} votes</p>
        </div>
      ))}
    </div>
  );
}

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("kpis");

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-12">
      <h1 className="font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">Beta Admin</h1>
      <p className="mt-2 text-ink-500">Waitlist, feedback, and roadmap for the private beta.</p>

      <div className="mt-6 flex gap-2 border-b border-ink-100">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.id ? "border-b-2 border-ink-950 text-ink-950" : "text-ink-400 hover:text-ink-950"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "kpis" && <KpisTab />}
        {tab === "waitlist" && <WaitlistTab />}
        {tab === "feedback" && <FeedbackTab />}
        {tab === "roadmap" && <AdminRoadmapTab />}
      </div>
    </div>
  );
}
