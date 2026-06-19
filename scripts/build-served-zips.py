#!/usr/bin/env python3
"""
Build public/data/served-zips.json from the Remix store-locations spreadsheet.

Source of truth: ../remix-store-locations.xlsx (258 rows, one row per store+SKU).
Output: a zip -> [store, ...] map for the landing page's instant client-side lookup.

Run: npm run build:geo   (or: python3 scripts/build-served-zips.py)
Exits non-zero on any data-integrity assertion failure so CI catches a bad xlsx.
"""
import json
import sys
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
# The xlsx lives in the parent "remix" folder, alongside the lead-page app.
SOURCE = ROOT.parent / "remix-store-locations.xlsx"
OUT = ROOT / "public" / "data" / "served-zips.json"

# Canonical product slugs (typo in source "Mudled" normalized here).
ITEM_TO_SLUG = {
    "Remix Perfect Paloma 4/12c": "perfect-paloma",
    "Remix Mudled Berry Mojito 4/12c": "muddled-berry-mojito",
}


def normalize_zip(value) -> str:
    """Excel stores zips as ints; coerce to a 5-digit string, future-proofing leading zeros."""
    digits = "".join(ch for ch in str(value) if ch.isdigit())
    return digits[:5].zfill(5)


def main() -> int:
    if not SOURCE.exists():
        print(f"ERROR: source spreadsheet not found at {SOURCE}", file=sys.stderr)
        return 1

    df = pd.read_excel(SOURCE)
    df.columns = [str(c).strip() for c in df.columns]

    # Only active placements ship to the page (no-op today; future-proof for "Remove"/"OOS").
    df = df[df["Status"].astype(str).str.strip() == "Add"].copy()

    stores: dict[int, dict] = {}
    unmapped: set[str] = set()

    for _, row in df.iterrows():
        store_no = int(row["Store Number"])
        item = str(row["Item Name"]).strip()
        slug = ITEM_TO_SLUG.get(item)
        if slug is None:
            unmapped.add(item)
            continue

        if store_no not in stores:
            stores[store_no] = {
                "storeNumber": store_no,
                "address": str(row["Address"]).strip(),
                "city": str(row["City"]).strip(),
                "state": str(row["State"]).strip(),
                "zip": normalize_zip(row["Zip Code"]),
                "format": str(row["Store Format"]).strip(),
                "products": set(),
            }
        stores[store_no]["products"].add(slug)

    if unmapped:
        print(f"WARNING: skipped unmapped item names: {sorted(unmapped)}", file=sys.stderr)

    # Group stores by zip, deterministic order for clean git diffs.
    by_zip: dict[str, list[dict]] = {}
    for store_no in sorted(stores):
        s = stores[store_no]
        rec = {
            "storeNumber": s["storeNumber"],
            "address": s["address"],
            "city": s["city"],
            "state": s["state"],
            "format": s["format"],
            "products": sorted(s["products"]),
        }
        by_zip.setdefault(s["zip"], []).append(rec)

    # Integrity assertions (verified expectations from the data audit).
    total_stores = sum(len(v) for v in by_zip.values())
    states = sorted({r["state"] for v in by_zip.values() for r in v})
    valid_slugs = set(ITEM_TO_SLUG.values())

    assert all(len(z) == 5 and z.isdigit() for z in by_zip), "non-5-digit zip key found"
    assert total_stores == len(stores), "store count mismatch after grouping"
    assert all(
        p in valid_slugs for v in by_zip.values() for r in v for p in r["products"]
    ), "invalid product slug found"
    # A store must never appear under two different zips.
    seen = set()
    for v in by_zip.values():
        for r in v:
            assert r["storeNumber"] not in seen, f"store {r['storeNumber']} in two zips"
            seen.add(r["storeNumber"])

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, "w") as f:
        json.dump(by_zip, f, indent=2, sort_keys=True)
        f.write("\n")

    paloma = sum(1 for s in stores.values() if "perfect-paloma" in s["products"])
    mojito = sum(1 for s in stores.values() if "muddled-berry-mojito" in s["products"])
    both = sum(1 for s in stores.values() if len(s["products"]) == 2)
    print(f"OK  wrote {OUT.relative_to(ROOT)}")
    print(f"    {len(by_zip)} zips, {total_stores} stores, states: {', '.join(states)}")
    print(f"    paloma={paloma} mojito={mojito} both={both}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
