import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Pillars } from "@/components/landing/Pillars";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <main className="flex flex-1 flex-col">
        <Hero />
        <Pillars />
        <HowItWorks />
        <DashboardPreview />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
