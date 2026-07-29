"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { trpc } from "@/lib/trpc";

export function JoinInviteFlow() {
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get("code");
  const [code, setCode] = useState(codeFromUrl ?? "");
  const [submittedCode, setSubmittedCode] = useState(codeFromUrl);

  const check = trpc.waitlist.checkInvite.useQuery(
    { code: submittedCode ?? "" },
    { enabled: !!submittedCode },
  );

  if (submittedCode && check.data?.valid) {
    return <SignUp forceRedirectUrl={`/beta/redeem?code=${encodeURIComponent(submittedCode)}`} />;
  }

  if (submittedCode && check.data && !check.data.valid) {
    return (
      <div className="max-w-sm text-center">
        <p className="text-ink-950">
          That invite code is invalid or has already been used.
        </p>
        <Link href="/beta" className="mt-4 inline-block text-sm text-ink-500 underline hover:text-ink-950">
          Join the waitlist instead
        </Link>
      </div>
    );
  }

  if (submittedCode && check.isLoading) {
    return <p className="text-ink-500">Checking your invite…</p>;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmittedCode(code.trim().toUpperCase());
      }}
      className="flex w-full max-w-sm flex-col gap-3"
    >
      <label className="text-sm text-ink-500">Enter your invite code</label>
      <input
        type="text"
        required
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="e.g. K7M3P9QX"
        className="h-12 rounded-full border border-ink-200 px-5 text-center uppercase tracking-widest text-ink-950 outline-none focus:border-ink-950"
      />
      <button
        type="submit"
        className="h-12 rounded-full bg-ink-950 px-6 text-base font-medium text-white transition-transform hover:scale-[1.02]"
      >
        Continue
      </button>
      <Link href="/beta" className="text-center text-sm text-ink-500 underline hover:text-ink-950">
        Don&apos;t have a code? Join the waitlist
      </Link>
    </form>
  );
}
