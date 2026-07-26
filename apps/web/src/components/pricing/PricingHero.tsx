"use client";

import { motion } from "framer-motion";

const easeOut = [0.16, 1, 0.3, 1] as const;

export function PricingHero() {
  return (
    <section className="relative overflow-hidden bg-ink-950 pt-32 pb-20 sm:pt-40 sm:pb-24">
      <div
        className="pointer-events-none absolute left-1/2 top-[-10%] h-[560px] w-[560px] -translate-x-1/2 rounded-full opacity-[0.15] blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 70%)",
        }}
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-5 text-center sm:px-8">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-ink-300"
        >
          7-day free trial
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeOut, delay: 0.1 }}
          className="mt-8 font-display text-4xl leading-[1.08] tracking-tight text-white sm:text-5xl"
        >
          You don&apos;t need another
          <br className="hidden sm:block" /> tracker. You need a coach.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeOut, delay: 0.22 }}
          className="mt-6 max-w-xl text-balance text-lg text-ink-300"
        >
          One subscription. Every day, SelfForge builds your workout, your meals, your
          skincare, and your mindset around who you actually are — then checks in like
          someone who remembers.
        </motion.p>
      </div>
    </section>
  );
}
