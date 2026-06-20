import type { Metadata } from "next";
import { AnnouncementBar, Header, Footer } from "@/components/landing/Chrome";
import { GenieExperience } from "@/components/genie/GenieExperience";
import { Persuasion } from "@/components/landing/Persuasion";
import { StickyCta } from "@/components/landing/StickyCta";
import { TrackingProvider } from "@/components/tracking/TrackingProvider";

export const metadata: Metadata = {
  title: "Remix — Make a Wish",
  description:
    "Drop your zip and let the genie find Remix near you. Big Flavor, Clean Ingredients, Zero Regrets.",
};

export default function GeniePage() {
  return (
    <>
      <TrackingProvider pageVariant="genie_v2" />
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <GenieExperience />
        <Persuasion />
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
