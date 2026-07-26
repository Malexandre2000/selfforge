import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FinalCta() {
  return (
    <section id="pricing" className="bg-ink-950 py-24 sm:py-32">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-5 text-center sm:px-8">
        <h2 className="font-display text-3xl tracking-tight text-white sm:text-5xl">
          Your best self is one roadmap away.
        </h2>
        <p className="mt-5 max-w-lg text-lg text-ink-300">
          Start with a free roadmap. Upgrade when you're ready for daily coaching,
          progress tracking, and unlimited chat with your coach.
        </p>
        <Link
          href="/onboarding"
          className="group mt-9 flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 text-base font-medium text-ink-950 transition-transform hover:scale-[1.02]"
        >
          Start your roadmap
          <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}
