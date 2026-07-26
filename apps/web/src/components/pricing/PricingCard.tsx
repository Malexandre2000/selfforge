"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Check } from "lucide-react";
import { trpc } from "@/lib/trpc";

const FEATURES = [
  "AI Coach — a conversation that remembers your goals and history",
  "Personalized daily missions across workout, nutrition, skincare, grooming, and mindset",
  "Habit tracking with real streaks",
  "Progress tracking — weight, measurements, before/after photos",
  "Your roadmap adjusts as you change",
];

const PLANS = {
  monthly: { label: "Monthly", price: 24, period: "mo", sub: "billed monthly" },
  annual: { label: "Annual", price: 16.6, period: "mo", sub: "billed as $199/yr — save 31%" },
} as const;

export function PricingCard() {
  const [plan, setPlan] = useState<"monthly" | "annual">("annual");
  const { isSignedIn } = useUser();
  const router = useRouter();

  const createCheckout = trpc.billing.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      window.location.href = data.url;
    },
  });

  function handleSubscribe() {
    if (!isSignedIn) {
      router.push("/sign-up");
      return;
    }
    createCheckout.mutate({ plan });
  }

  const active = PLANS[plan];

  return (
    <section className="relative mx-auto -mt-10 max-w-lg px-5 pb-24 sm:px-8">
      <div className="rounded-2xl border border-ink-200 bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-16px_rgba(0,0,0,0.15)] sm:p-10">
        <div className="flex items-center justify-center">
          <div className="inline-flex rounded-full bg-ink-100 p-1">
            {(["monthly", "annual"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPlan(p)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  plan === p ? "bg-ink-950 text-white" : "text-ink-500 hover:text-ink-800"
                }`}
              >
                {PLANS[p].label}
                {p === "annual" && (
                  <span className={`ml-1.5 text-xs ${plan === p ? "text-ink-300" : "text-success"}`}>
                    Save 31%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="flex items-baseline justify-center gap-1">
            <span className="font-display text-5xl tracking-tight text-ink-950">
              ${active.price % 1 === 0 ? active.price : active.price.toFixed(2)}
            </span>
            <span className="text-ink-500">/{active.period}</span>
          </div>
          <p className="mt-2 text-sm text-ink-500">{active.sub}</p>
        </div>

        <button
          onClick={handleSubscribe}
          disabled={createCheckout.isPending}
          className="mt-8 flex h-13 w-full items-center justify-center rounded-full bg-ink-950 px-6 text-base font-medium text-white transition-transform hover:scale-[1.01] disabled:opacity-50"
        >
          {createCheckout.isPending ? "Redirecting…" : "Start your 7-day free trial"}
        </button>
        <p className="mt-3 text-center text-xs text-ink-400">
          No charge today. Cancel anytime before your trial ends and you won&apos;t be billed.
        </p>

        <div className="mt-8 flex flex-col gap-3 border-t border-ink-100 pt-8">
          {FEATURES.map((feature) => (
            <div key={feature} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink-950">
                <Check size={12} className="text-white" strokeWidth={2.5} />
              </span>
              <span className="text-sm text-ink-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
