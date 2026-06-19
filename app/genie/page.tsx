import type { Metadata } from "next";
import { AnnouncementBar, Header, Footer } from "@/components/landing/Chrome";
import { GenieExperience } from "@/components/genie/GenieExperience";
import { Persuasion } from "@/components/landing/Persuasion";
import { StickyCta } from "@/components/landing/StickyCta";

export const metadata: Metadata = {
  title: "Remix — Make a Wish",
  description:
    "Drop your zip and let the genie find Remix near you. Big Flavor, Clean Ingredients, Zero Regrets.",
};

export default function GeniePage() {
  return (
    <>
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
