import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { WaitlistForm } from "@/components/beta/WaitlistForm";

export const metadata: Metadata = {
  title: "SelfForge — Private Beta",
};

export default function BetaPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <main className="relative flex flex-1 flex-col overflow-hidden bg-ink-950 pt-32 pb-24">
        <div
          className="pointer-events-none absolute left-1/2 top-[-10%] h-[560px] w-[560px] -translate-x-1/2 rounded-full opacity-[0.15] blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 70%)",
          }}
        />

        <div className="relative mx-auto flex w-full max-w-2xl flex-col items-center px-5 text-center sm:px-8">
          <span className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-ink-300">
            Private beta
          </span>
          <h1 className="mt-8 font-display text-4xl leading-[1.08] tracking-tight text-white sm:text-5xl">
            SelfForge is in private beta.
          </h1>
          <p className="mt-6 max-w-xl text-balance text-lg text-ink-300">
            We&apos;re inviting a small group of people to use SelfForge for free while we build it with them,
            not for them. Join the waitlist and we&apos;ll send you an invite.
          </p>

          <div className="mt-10 w-full max-w-lg">
            <Suspense fallback={<div className="h-12" />}>
              <WaitlistForm />
            </Suspense>
          </div>

          <p className="mt-6 text-sm text-ink-500">
            Already have an invite code?{" "}
            <Link href="/beta/join" className="text-ink-300 underline hover:text-white">
              Enter it here
            </Link>
            . Questions?{" "}
            <Link href="/beta/faq" className="text-ink-300 underline hover:text-white">
              Read the FAQ
            </Link>
            .
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
