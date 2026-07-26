"use client";

import { motion } from "framer-motion";
import { Flame, TrendingUp } from "lucide-react";

const easeOut = [0.16, 1, 0.3, 1] as const;

function ConsistencyRing({ percent }: { percent: number }) {
  const size = 84;
  const stroke = 7;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - percent / 100);

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="var(--color-ink-200)"
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="var(--color-ink-950)"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function Sparkline() {
  return (
    <svg viewBox="0 0 160 48" className="h-12 w-full" preserveAspectRatio="none">
      <polyline
        points="0,40 20,38 40,32 60,34 80,24 100,26 120,14 140,16 160,4"
        fill="none"
        stroke="var(--color-ink-950)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DashboardPreview() {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">
              A dashboard that shows you the whole picture.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-500">
              Streaks, confidence score, consistency, and a progress timeline with
              your before/after gallery — so momentum is something you can see,
              not just feel.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: easeOut }}
            className="rounded-xl border border-ink-200 bg-white p-6 shadow-raised sm:p-8"
          >
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
              <div className="col-span-2 flex flex-col justify-between rounded-md bg-ink-950 p-5 text-white sm:col-span-1">
                <Flame size={20} strokeWidth={1.75} />
                <div>
                  <div className="font-display text-2xl">14</div>
                  <div className="text-xs text-ink-400">day streak</div>
                </div>
              </div>

              <div className="col-span-2 flex flex-col justify-between rounded-md border border-ink-200 p-5 sm:col-span-1">
                <TrendingUp size={20} strokeWidth={1.75} className="text-ink-950" />
                <div>
                  <div className="font-display text-2xl text-ink-950">8.4</div>
                  <div className="text-xs text-ink-500">confidence score</div>
                </div>
              </div>

              <div className="col-span-2 flex items-center gap-4 rounded-md border border-ink-200 p-5">
                <ConsistencyRing percent={87} />
                <div>
                  <div className="font-display text-xl text-ink-950">87%</div>
                  <div className="text-xs text-ink-500">consistency, last 30 days</div>
                </div>
              </div>

              <div className="col-span-2 flex flex-col justify-between rounded-md border border-ink-200 p-5">
                <div className="text-xs text-ink-500">confidence, last 90 days</div>
                <Sparkline />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
