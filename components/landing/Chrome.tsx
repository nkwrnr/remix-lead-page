import Image from "next/image";

export function AnnouncementBar() {
  return (
    <div className="bg-ink text-paper text-center text-[11px] sm:text-xs font-medium tracking-[0.16em] uppercase py-2.5 px-4">
      Now in 161 Walmart stores · Online drops sell out fast
    </div>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur border-b border-line-soft">
      <div className="mx-auto max-w-6xl flex items-center justify-center px-4 h-14">
        <Image
          src="/images/logo-dark.png"
          alt="Remix"
          width={120}
          height={30}
          priority
          className="h-7 w-auto"
        />
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="on-ink bg-ink text-paper">
      <div className="mx-auto max-w-6xl px-6 py-14 text-center">
        <Image
          src="/images/logo-dark.png"
          alt="Remix"
          width={120}
          height={30}
          className="mx-auto h-7 w-auto"
        />
        <p className="mt-4 font-display italic text-lg text-paper/80">
          Big Flavor, Clean Ingredients, Zero Regrets.
        </p>
        <nav className="mt-6 flex flex-wrap justify-center gap-x-7 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-paper/70">
          <a href="https://drinkremix.co" className="hover:text-paper">Shop</a>
          <a href="https://drinkremix.co/pages/find-us" className="hover:text-paper">Find Us</a>
          <a href="/privacy" className="hover:text-paper">Privacy</a>
        </nav>
        <p className="mt-7 text-xs text-paper/50 leading-relaxed">
          Remix · Vista, California · © {new Date().getFullYear()} Remix Beverages.
          <br />
          Not affiliated with Walmart Inc. Store availability subject to change.
        </p>
      </div>
    </footer>
  );
}

/** Small editorial citron chip for nutrition/value badges. */
export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-pill bg-citron px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-citron-ink">
      {children}
    </span>
  );
}
