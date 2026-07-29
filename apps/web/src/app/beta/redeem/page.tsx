import type { Metadata } from "next";
import { Suspense } from "react";
import { RedeemInvite } from "@/components/beta/RedeemInvite";

export const metadata: Metadata = {
  title: "Setting up — SelfForge",
};

export default function BetaRedeemPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-ink-50 px-6 py-16">
      <Suspense fallback={<p className="text-ink-500">Setting up your account…</p>}>
        <RedeemInvite />
      </Suspense>
    </div>
  );
}
