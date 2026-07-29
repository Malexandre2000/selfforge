import type { Metadata } from "next";
import { Suspense } from "react";
import { JoinInviteFlow } from "@/components/beta/JoinInviteFlow";

export const metadata: Metadata = {
  title: "Join the beta — SelfForge",
};

export default function BetaJoinPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-ink-50 px-6 py-16">
      <Suspense fallback={<p className="text-ink-500">Loading…</p>}>
        <JoinInviteFlow />
      </Suspense>
    </div>
  );
}
