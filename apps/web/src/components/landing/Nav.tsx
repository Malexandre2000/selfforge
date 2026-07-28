"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Show, UserButton } from "@clerk/nextjs";

const links = [
  { href: "#pillars", label: "Method" },
  { href: "#how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="font-display text-lg tracking-tight text-white">
          SelfForge
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-ink-300 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Show when="signed-out">
            <Link
              href="/sign-in"
              className="text-sm text-ink-300 transition-colors hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/onboarding"
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-ink-950 transition-transform hover:scale-[1.03]"
            >
              Get started
            </Link>
          </Show>
          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="text-sm text-ink-300 transition-colors hover:text-white"
            >
              Dashboard
            </Link>
            <UserButton />
          </Show>
        </div>

        <button
          className="text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 px-5 pb-6 md:hidden">
          <nav className="flex flex-col gap-1 pt-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-3 text-base text-ink-200 hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <Show when="signed-out">
              <Link
                href="/sign-in"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-3 text-base text-ink-200 hover:bg-white/5 hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/onboarding"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full bg-white px-4 py-3 text-center text-base font-medium text-ink-950"
              >
                Get started
              </Link>
            </Show>
            <Show when="signed-in">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full bg-white px-4 py-3 text-center text-base font-medium text-ink-950"
              >
                Go to dashboard
              </Link>
              <div className="mt-3 flex items-center gap-3 px-2">
                <UserButton />
                <span className="text-sm text-ink-300">Your account</span>
              </div>
            </Show>
          </nav>
        </div>
      )}
    </header>
  );
}
