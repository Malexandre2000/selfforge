import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-ink-50 px-6 py-16">
      <SignUp />
      <p className="mt-6 max-w-xs text-center text-xs text-ink-500">
        By signing up, you agree to SelfForge&apos;s{" "}
        <Link href="/terms" className="underline hover:text-ink-950">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline hover:text-ink-950">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
