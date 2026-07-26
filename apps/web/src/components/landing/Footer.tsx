import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-white py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 text-sm text-ink-500 sm:flex-row sm:justify-between sm:px-8">
        <span className="font-display text-base text-ink-950">SelfForge</span>
        <div className="flex items-center gap-6">
          <Link href="/sign-in" className="hover:text-ink-950">
            Sign in
          </Link>
          <span>&copy; {new Date().getFullYear()} SelfForge. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
