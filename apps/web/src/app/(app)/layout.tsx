import { AppSidebar } from "@/components/app/AppSidebar";
import { OnboardingSync } from "@/components/app/OnboardingSync";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col md:flex-row">
      <OnboardingSync />
      <AppSidebar />
      <main className="flex-1 bg-ink-50">{children}</main>
    </div>
  );
}
