import type { Metadata } from "next";
import { Header, Footer } from "@/components/landing/Chrome";

export const metadata: Metadata = {
  title: "Privacy Policy — Remix",
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="flex-1 mx-auto max-w-2xl px-5 py-12 prose-remix">
        <h1 className="font-display text-3xl">Privacy Policy</h1>
        <p className="text-ink-light mt-1 text-sm">Last updated: June 16, 2026</p>

        <Section title="What we collect">
          When you use this page we collect: your email address, the zip code you
          enter, whether Remix is currently stocked near that zip, the matched
          store (if any), basic campaign attribution (UTM parameters and
          referrer), and the time of your submission.
        </Section>

        <Section title="Why we collect it">
          To tell you when Remix is available near you, to notify you about online
          drops and restocks, and to understand which areas have the most demand
          so we can expand. We process your email on the basis of your consent.
        </Section>

        <Section title="Who we share it with">
          We send your email and the data above to our email marketing provider
          (e.g. Klaviyo) so we can contact you, and we keep a record in our own
          database. We do not sell your personal information.
        </Section>

        <Section title="Your choices">
          Every email includes an unsubscribe link, and you can unsubscribe at any
          time. You may request access to, or deletion of, your data by emailing{" "}
          <a className="text-coral underline" href="mailto:team@drinkremix.co">
            team@drinkremix.co
          </a>
          . California residents may exercise their CCPA/CPRA rights, including the
          right to know, delete, and opt out of sharing.
        </Section>

        <Section title="Data retention">
          We retain subscriber data while you remain subscribed and for up to 30
          days after you unsubscribe. Campaign attribution data is retained for up
          to 12 months.
        </Section>

        <Section title="Contact">
          Remix Beverages, Vista, California ·{" "}
          <a className="text-coral underline" href="mailto:team@drinkremix.co">
            team@drinkremix.co
          </a>
        </Section>

        <p className="mt-8">
          <a href="/" className="text-coral underline">
            ← Back to Remix
          </a>
        </p>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="font-bold text-lg">{title}</h2>
      <p className="mt-1.5 text-ink-light leading-relaxed">{children}</p>
    </section>
  );
}
