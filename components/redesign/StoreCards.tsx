import { PRODUCT_LABELS } from "@/lib/constants";
import type { Store } from "@/lib/types";
import { tracking } from "@/lib/tracking";

const FORMAT_LABEL: Record<string, string> = {
  SC: "Walmart Supercenter",
  NHM: "Walmart Neighborhood Market",
  D1: "Walmart",
};

/** Theme-scoped store cards (`.rd-*`). */
export function StoreCards({ stores }: { stores: Store[] }) {
  return (
    <div
      className="rd-stagger"
      style={{ display: "grid", gap: 12, marginTop: 4 }}
    >
      {stores.map((s) => (
        <div key={s.storeNumber} className="rd-card">
          <p style={{ fontWeight: 700 }}>
            {FORMAT_LABEL[s.format] || "Walmart"} #{s.storeNumber}
          </p>
          <p style={{ color: "var(--rd-ink-soft)", fontSize: "0.85rem", marginTop: 2 }}>
            {s.address}, {s.city}, {s.state}
          </p>
          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {s.products.map((p) => (
              <span key={p} className="rd-chip">
                ✓ {PRODUCT_LABELS[p]}
              </span>
            ))}
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${FORMAT_LABEL[s.format] || "Walmart"}, ${s.address}, ${s.city}, ${s.state}`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rd-cta cd-btn--ghost cd-store__maps"
            onClick={() => tracking.ctaClick({ cta: "maps_open", section: "zip_finder" })}
          >
            Open in Maps ↗
          </a>
        </div>
      ))}
    </div>
  );
}
