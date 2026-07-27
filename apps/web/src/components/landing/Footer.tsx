import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-white py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 text-sm text-ink-500 sm:flex-row sm:justify-between sm:px-8">
        <span className="font-display text-base text-ink-950">SelfForge</span>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <Link href="/sign-in" className="hover:text-ink-950">
            Sign in
          </Link>
          <Link href="/terms" className="hover:text-ink-950">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-ink-950">
            Privacy
          </Link>
          <span>&copy; {new Date().getFullYear()} SelfForge. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
