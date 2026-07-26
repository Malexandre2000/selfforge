import Link from "next/link";
import { PricingCard } from "@/components/pricing/PricingCard";

export function PaywallScreen({ firstMissionDone }: { firstMissionDone: boolean }) {
  return (
    <div className="flex flex-1 flex-col">
      <section className="relative overflow-hidden bg-ink-950 px-5 pb-20 pt-16 text-center sm:px-8 sm:pt-20">
        <div
          className="pointer-events-none absolute left-1/2 top-[-10%] h-[400px] w-[400px] -translate-x-1/2 rounded-full opacity-[0.15] blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 70%)",
          }}
        />
        <div className="relative mx-auto max-w-lg">
          <span className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-ink-300">
            {firstMissionDone ? "Nice work on mission one" : "7-day free trial"}
          </span>
          <h1 className="mt-6 font-display text-3xl tracking-tight text-white sm:text-4xl">
            {firstMissionDone
              ? "That's the first step. Keep the momentum."
              : "This is part of your Premium roadmap."}
          </h1>
          <p className="mt-4 text-ink-300">
            {firstMissionDone
              ? "You just completed your first mission — subscribe to keep your streak, your coach, and your full roadmap going."
              : "Finish today's first mission for a free taste, or unlock everything right now."}
          </p>
          {!firstMissionDone && (
            <Link
              href="/missions"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-full border border-white/20 px-6 text-sm font-medium text-white transition-colors hover:bg-white/5"
            >
              Try today&apos;s mission free
            </Link>
          )}
        </div>
      </section>
      <PricingCard />
    </div>
  );
}
