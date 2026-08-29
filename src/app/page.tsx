import { LandingHero } from "@/components/landing/hero";
import { LandingFeatures } from "@/components/landing/features";
import { LandingAI } from "@/components/landing/ai-section";
import { LandingCTA } from "@/components/landing/cta";
import { LandingNav } from "@/components/landing/nav";
import { LandingFooter } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <main className="min-h-[100dvh] bg-[var(--color-bg)]">
      <LandingNav />
      <LandingHero />
      <LandingFeatures />
      <LandingAI />
      <LandingCTA />
      <LandingFooter />
    </main>
  );
}
