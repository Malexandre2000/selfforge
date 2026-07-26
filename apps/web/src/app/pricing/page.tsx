import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { PricingHero } from "@/components/pricing/PricingHero";
import { PricingCard } from "@/components/pricing/PricingCard";

export default function PricingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <main className="flex flex-1 flex-col bg-ink-50">
        <PricingHero />
        <PricingCard />
      </main>
      <Footer />
    </div>
  );
}
