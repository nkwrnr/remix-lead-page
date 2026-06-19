import Image from "next/image";
import { Badge } from "./Chrome";
import { NUTRITION_BADGES } from "@/lib/constants";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-paper">
      {/* ambient editorial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 600px at 85% 8%, rgba(232,132,114,.20), transparent 60%), radial-gradient(800px 520px at 5% 98%, rgba(233,224,52,.14), transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-3xl px-6 pt-16 pb-20 text-center sm:pt-20">
        <p className="eyebrow mb-6">Big Flavor · Zero Proof</p>
        <h1 className="font-display text-ink text-[2.6rem] leading-[0.98] sm:text-[4.5rem]">
          Sold out online.
          <br />
          Not sold out <em>on you.</em>
        </h1>
        <p className="lede mx-auto mt-6 max-w-[38ch]">
          Big Flavor, Clean Ingredients, Zero Regrets. Drop your zip — we&apos;ll
          show you where Remix is hiding near you.
        </p>

        {/* the vessel: glowing citrus orb haloed behind the product */}
        <div className="relative mx-auto mt-14 flex h-80 w-80 items-center justify-center sm:h-96 sm:w-96">
          {/* soft outer glow */}
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl sm:h-72 sm:w-72"
            style={{ background: "radial-gradient(circle, rgba(232,132,114,.55), transparent 70%)" }}
          />
          {/* the orb */}
          <div
            className="vessel absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 sm:h-52 sm:w-52"
            aria-hidden
          />
          <Image
            src="/images/can-paloma.png"
            alt="Remix Perfect Paloma"
            width={400}
            height={400}
            priority
            className="relative z-10 h-auto w-60 drop-shadow-2xl sm:w-72"
          />
        </div>

        <div className="mt-12">
          <a
            href="#finder"
            className="inline-flex items-center justify-center gap-2 rounded-pill bg-coral px-9 py-4 text-base font-semibold text-white shadow-lift transition-colors hover:bg-ember min-h-[52px]"
          >
            Find Remix near me ↓
          </a>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {NUTRITION_BADGES.map((b) => (
            <Badge key={b}>{b}</Badge>
          ))}
        </div>
      </div>
    </section>
  );
}
