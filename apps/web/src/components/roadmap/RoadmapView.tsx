"use client";

import { useState } from "react";
import { ArrowBigUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { QueryError } from "@/components/app/QueryError";

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  planned: "Planned",
  shipped: "Shipped",
  declined: "Declined",
};

const STATUS_STYLES: Record<string, string> = {
  open: "bg-ink-100 text-ink-600",
  planned: "bg-blue-50 text-blue-700",
  shipped: "bg-green-50 text-green-700",
  declined: "bg-ink-100 text-ink-400",
};

function NewRequestForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const create = trpc.featureRequests.create.useMutation({
    onSuccess: () => {
      setTitle("");
      setDescription("");
      setOpen(false);
      onCreated();
    },
  });

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="h-11 rounded-full bg-ink-950 px-6 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
      >
        Suggest something
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        create.mutate({ title, description });
      }}
      className="rounded-lg border border-ink-200 bg-white p-5"
    >
      <input
        required
        maxLength={140}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Short title"
        className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-950 outline-none placeholder:text-ink-400 focus:border-ink-950"
      />
      <textarea
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What would this let you do?"
        rows={3}
        className="mt-3 w-full resize-none rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-950 outline-none placeholder:text-ink-400 focus:border-ink-950"
      />
      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={create.isPending}
          className="h-10 rounded-full bg-ink-950 px-5 text-sm font-medium text-white disabled:opacity-40"
        >
          {create.isPending ? "Posting…" : "Post"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="h-10 rounded-full px-5 text-sm text-ink-500 hover:bg-ink-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function RoadmapView() {
  const { data, isLoading, isError, refetch } = trpc.featureRequests.list.useQuery();
  const utils = trpc.useUtils();
  const vote = trpc.featureRequests.toggleVote.useMutation({
    onSuccess: () => utils.featureRequests.list.invalidate(),
  });

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8 sm:py-12">
      <h1 className="font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">Roadmap</h1>
      <p className="mt-2 text-ink-500">Suggest what we should build next, and upvote what matters to you.</p>

      <div className="mt-6">
        <NewRequestForm onCreated={() => refetch()} />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {isLoading ? (
          <p className="text-ink-500">Loading…</p>
        ) : isError ? (
          <QueryError message="Couldn't load the roadmap." onRetry={() => refetch()} />
        ) : data && data.length > 0 ? (
          data.map((item) => (
            <div key={item.id} className="flex gap-4 rounded-lg border border-ink-200 bg-white p-4">
              <button
                onClick={() => vote.mutate({ featureRequestId: item.id })}
                className={`flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-lg border transition-colors ${
                  item.votedByMe
                    ? "border-ink-950 bg-ink-950 text-white"
                    : "border-ink-200 text-ink-600 hover:border-ink-950"
                }`}
              >
                <ArrowBigUp size={16} />
                <span className="text-sm font-medium">{item.voteCount}</span>
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-base text-ink-950">{item.title}</h2>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[item.status]}`}
                  >
                    {STATUS_LABELS[item.status]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-500">{item.description}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-ink-200 bg-white p-6 text-ink-500">
            No requests yet — be the first to suggest something.
          </div>
        )}
      </div>
    </div>
  );
}
