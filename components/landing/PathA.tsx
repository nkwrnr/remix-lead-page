import { PRODUCT_LABELS } from "@/lib/constants";
import type { Store } from "@/lib/types";

const FORMAT_LABEL: Record<string, string> = {
  SC: "Walmart Supercenter",
  NHM: "Walmart Neighborhood Market",
  D1: "Walmart",
};

function StoreCard({ store }: { store: Store }) {
  return (
    <div className="rounded-card border border-line bg-white p-4 text-left shadow-card">
      <p className="font-bold text-ink">
        {FORMAT_LABEL[store.format] || "Walmart"} #{store.storeNumber}
      </p>
      <p className="text-ink-light text-sm mt-0.5">
        {store.address}, {store.city}, {store.state}
      </p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {store.products.map((p) => (
          <span
            key={p}
            className="inline-flex items-center rounded-chip bg-success/10 px-2 py-1 text-xs font-semibold text-success"
          >
            ✓ {PRODUCT_LABELS[p]}
          </span>
        ))}
      </div>
    </div>
  );
}

export function StoreList({ stores, city }: { stores: Store[]; city: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-success font-semibold">
        <span aria-hidden>✅</span>
        <p>Good news, {city} — Remix is right around the corner. 🍃</p>
      </div>
      <div className="mt-4 grid gap-3">
        {stores.map((s) => (
          <StoreCard key={s.storeNumber} store={s} />
        ))}
      </div>
    </div>
  );
}

export function SoldOutBanner() {
  return (
    <div className="mt-5 rounded-fig bg-paper-2 border border-line p-5">
      <p className="font-display text-xl">
        Our online drops sell out <em>on purpose.</em>
      </p>
      <p className="mt-2 text-ink-light text-sm">
        We make small batches and they go fast. Get on the list and we&apos;ll tell
        you the second the next one lands — before everyone else.
      </p>
    </div>
  );
}
