import { BillingSection } from "@/components/settings/BillingSection";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8 sm:py-12">
      <h1 className="font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">
        Settings
      </h1>
      <p className="mt-2 text-ink-500">Manage your account and subscription.</p>

      <div className="mt-8">
        <BillingSection />
      </div>
    </div>
  );
}
