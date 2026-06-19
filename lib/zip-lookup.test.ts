import { describe, expect, it } from "vitest";
import { lookupZip, normalizeZip } from "./zip-lookup";
import type { ServedZips } from "./types";
import served from "../public/data/served-zips.json";

const data = served as ServedZips;

describe("normalizeZip", () => {
  it("strips zip+4, spaces and dashes", () => {
    expect(normalizeZip("72601-1234")).toBe("72601");
    expect(normalizeZip(" 72601 ")).toBe("72601");
    expect(normalizeZip("726011234")).toBe("72601");
  });
});

describe("lookupZip", () => {
  it("returns served for a real Walmart zip", () => {
    const r = lookupZip("72601", data);
    expect(r.status).toBe("served");
    if (r.status === "served") {
      expect(r.stores.length).toBeGreaterThan(0);
      expect(r.stores[0].city).toBe("Harrison");
    }
  });

  it("returns 2 stores for a zip with two locations", () => {
    const r = lookupZip("40160", data);
    expect(r.status).toBe("served");
    if (r.status === "served") expect(r.stores.length).toBe(2);
  });

  it("returns unserved for a valid but unstocked zip", () => {
    const r = lookupZip("99999", data);
    expect(r.status).toBe("unserved");
  });

  it("returns invalid for malformed zips", () => {
    expect(lookupZip("123", data).status).toBe("invalid");
    expect(lookupZip("00000", data).status).toBe("invalid");
    expect(lookupZip("abcde", data).status).toBe("invalid");
  });

  it("dataset has the expected size", () => {
    expect(Object.keys(data).length).toBe(157);
  });
});
