/** Minimal className combiner (no dependency). */
export function clsx(
  ...parts: (string | false | null | undefined)[]
): string {
  return parts.filter(Boolean).join(" ");
}
