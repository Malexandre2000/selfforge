"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Sparkles,
  TrendingUp,
  ListChecks,
  Target,
  User,
  Settings,
  Menu,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const navItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ai-coach", label: "AI Coach", icon: Sparkles },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/habits", label: "Habits", icon: ListChecks },
  { href: "/missions", label: "Daily Missions", icon: Target },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
              active
                ? "bg-ink-950 text-white"
                : "text-ink-600 hover:bg-ink-100 hover:text-ink-950"
            }`}
          >
            <Icon size={18} strokeWidth={1.75} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-100 bg-white px-4 py-6 md:flex">
        <Link href="/" className="mb-8 px-2 font-display text-lg tracking-tight text-ink-950">
          SelfForge
        </Link>
        <NavLinks />
        <div className="mt-auto flex items-center gap-3 border-t border-ink-100 px-2 pt-4">
          <UserButton />
          <span className="text-sm text-ink-500">Your account</span>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b border-ink-100 bg-white px-5 py-4 md:hidden">
        <Link href="/" className="font-display text-lg tracking-tight text-ink-950">
          SelfForge
        </Link>
        <div className="flex items-center gap-4">
          <UserButton />
          <button onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={22} className="text-ink-950" />
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 bg-white md:hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <span className="font-display text-lg tracking-tight text-ink-950">SelfForge</span>
            <button onClick={() => setOpen(false)} aria-label="Close menu">
              <X size={22} className="text-ink-950" />
            </button>
          </div>
          <div className="px-4">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
