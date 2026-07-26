import { currentUser } from "@clerk/nextjs/server";
import { PaywallGate } from "@/components/billing/PaywallGate";
import { DashboardStats } from "@/components/dashboard/DashboardStats";

export default async function DashboardPage() {
  const user = await currentUser();
  const firstName = user?.firstName;

  return (
    <PaywallGate>
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-12">
        <h1 className="font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">
          {firstName ? `Welcome back, ${firstName}.` : "Welcome back."}
        </h1>
        <p className="mt-2 text-ink-500">Here&apos;s where your roadmap stands today.</p>

        <DashboardStats />
      </div>
    </PaywallGate>
  );
}
