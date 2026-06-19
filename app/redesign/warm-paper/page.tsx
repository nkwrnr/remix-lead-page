import { AnnouncementBar, Header, Footer } from "@/components/landing/Chrome";
import { HeroSection } from "@/components/landing/HeroSection";
import { LandingFunnel } from "@/components/landing/LandingFunnel";
import { Persuasion } from "@/components/landing/Persuasion";
import { StickyCta } from "@/components/landing/StickyCta";

export const metadata = {
  title: "Remix — Warm Paper (Archived)",
  robots: { index: false, follow: false },
};

/**
 * Warm Paper — archived v1 landing page
 * This is the original editorial design from launch (cream paper, Fraunces serif,
 * coral spot color). Now in the redesign lab as a historical reference.
 * The live site is now chrome-drop. See /redesign for other variants.
 */

export default function WarmPaperPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <HeroSection />
        <LandingFunnel />
        <Persuasion />
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
