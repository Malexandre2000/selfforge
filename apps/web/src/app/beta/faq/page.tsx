import type { Metadata } from "next";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Beta FAQ — SelfForge",
};

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is the private beta?",
    a: "We're inviting a small group of people to use SelfForge before it's publicly available, so we can learn from real usage and feedback before opening up more broadly.",
  },
  {
    q: "How do I get access?",
    a: "Join the waitlist. We invite people in small batches so we can actually pay attention to feedback — you'll get an email with an invite link when a spot opens up.",
  },
  {
    q: "Does it cost anything?",
    a: "No. Beta access is completely free — no card required. If SelfForge later moves to a paid model, beta users will be told well in advance before anything changes.",
  },
  {
    q: "Can I skip the line?",
    a: "After you join, you get a personal referral link. Sharing it moves you up — we look at engaged referrals when picking the next batch to invite.",
  },
  {
    q: "How do I report a bug or leave feedback?",
    a: "Once you're in, there's a feedback button available on every page of the app. Use it for anything — bugs, ideas, or just \"this felt confusing.\" We read every submission.",
  },
  {
    q: "What happens to my data after the beta?",
    a: "Nothing changes — your account, progress, and history carry over exactly as they are. The beta doesn't have a separate database or a reset at the end.",
  },
  {
    q: "I have an invite code — now what?",
    a: "Head to the invite page and enter your code to get started.",
  },
];

export default function BetaFaqPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <main className="flex flex-1 flex-col bg-white pt-32 pb-24">
        <div className="mx-auto w-full max-w-2xl px-5 sm:px-8">
          <h1 className="font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">Beta FAQ</h1>
          <p className="mt-3 text-ink-500">Everything about the private beta, in one place.</p>

          <div className="mt-10 flex flex-col gap-8">
            {FAQS.map(({ q, a }) => (
              <div key={q}>
                <h2 className="font-display text-lg text-ink-950">{q}</h2>
                <p className="mt-2 leading-relaxed text-ink-600">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
