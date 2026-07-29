"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc";

export function WaitlistForm() {
  const searchParams = useSearchParams();
  const referredByCode = searchParams.get("ref") ?? undefined;

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [result, setResult] = useState<{ referralCode: string; alreadyOnList: boolean } | null>(null);

  const join = trpc.waitlist.join.useMutation({
    onSuccess: (data) => setResult(data),
  });

  if (result) {
    const shareUrl =
      typeof window !== "undefined" ? `${window.location.origin}/beta?ref=${result.referralCode}` : "";
    return (
      <div className="rounded-lg border border-white/15 bg-white/5 p-6 text-center">
        <p className="font-display text-lg text-white">
          {result.alreadyOnList ? "You're already on the list." : "You're on the list."}
        </p>
        <p className="mt-2 text-sm text-ink-300">
          We invite people in small batches. Sharing your link below moves you up faster.
        </p>
        <div className="mt-4 rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-sm text-ink-200 break-all">
          {shareUrl}
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        join.mutate({ email, name: name || undefined, referredByCode });
      }}
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (optional)"
          className="h-12 rounded-full border border-white/15 bg-white/5 px-5 text-white placeholder:text-ink-400 outline-none focus:border-white/40 sm:w-44"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="h-12 flex-1 rounded-full border border-white/15 bg-white/5 px-5 text-white placeholder:text-ink-400 outline-none focus:border-white/40"
        />
        <button
          type="submit"
          disabled={join.isPending}
          className="h-12 shrink-0 rounded-full bg-white px-6 text-base font-medium text-ink-950 transition-transform hover:scale-[1.02] disabled:opacity-50"
        >
          {join.isPending ? "Joining…" : "Join the waitlist"}
        </button>
      </div>
      {join.isError && <p className="text-sm text-red-400">Something went wrong. Try again.</p>}
    </form>
  );
}
