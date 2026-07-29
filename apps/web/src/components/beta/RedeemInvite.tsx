"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc";

export function RedeemInvite() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const attempted = useRef(false);

  const redeem = trpc.beta.redeemInvite.useMutation({
    onSuccess: () => router.push("/onboarding"),
  });

  useEffect(() => {
    if (code && !attempted.current) {
      attempted.current = true;
      redeem.mutate({ code });
    }
  }, [code, redeem]);

  if (!code) {
    return <p className="text-ink-500">Missing invite code.</p>;
  }

  if (redeem.isError) {
    return (
      <div className="max-w-sm text-center">
        <p className="text-ink-950">Couldn&apos;t redeem that invite — it may have already been used.</p>
        <Link href="/beta" className="mt-4 inline-block text-sm text-ink-500 underline hover:text-ink-950">
          Back to the waitlist
        </Link>
      </div>
    );
  }

  return <p className="text-ink-500">Setting up your account…</p>;
}
