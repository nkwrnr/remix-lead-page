import type { CaptureStore } from "./store";
import { LocalCaptureStore } from "./local";

let instance: CaptureStore | null = null;

/** Returns the capture store singleton (local-only for now). */
export function getCaptureStore(): CaptureStore {
  if (instance) return instance;
  instance = new LocalCaptureStore();
  return instance;
}

/** For tests: reset singleton so a fresh instance is created. */
export function __resetCaptureStore() {
  instance = null;
}
