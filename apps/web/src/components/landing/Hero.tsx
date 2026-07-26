"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const easeOut = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink-950 pt-32 pb-28 sm:pt-40 sm:pb-36">
      {/* Ambient glow — the only "color" on the page, kept extremely subtle */}
      <div
        className="pointer-events-none absolute left-1/2 top-[-10%] h-[560px] w-[560px] -translate-x-1/2 rounded-full opacity-[0.15] blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 70%)",
        }}
      />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-5 text-center sm:px-8">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-ink-300"
        >
          Your AI self-improvement coach
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeOut, delay: 0.1 }}
          className="mt-8 font-display text-4xl leading-[1.08] tracking-tight text-white sm:text-6xl"
        >
          Become the most confident
          <br className="hidden sm:block" /> version of yourself.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeOut, delay: 0.22 }}
          className="mt-6 max-w-xl text-balance text-lg text-ink-300 sm:text-xl"
        >
          One roadmap across fitness, nutrition, skincare, style, and discipline —
          built for you, and coached by AI that remembers who you are, every single day.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeOut, delay: 0.34 }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link
            href="/onboarding"
            className="group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-6 text-base font-medium text-ink-950 transition-transform hover:scale-[1.02] sm:w-auto"
          >
            Start your roadmap
            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
          <a
            href="#how-it-works"
            className="flex h-12 w-full items-center justify-center rounded-full border border-white/15 px-6 text-base font-medium text-white transition-colors hover:bg-white/5 sm:w-auto"
          >
            See how it works
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-8 text-sm text-ink-500"
        >
          No generic advice. No chatbot small talk. Just your plan — every day.
        </motion.p>
      </div>
    </section>
  );
}
