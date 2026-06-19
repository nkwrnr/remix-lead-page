import { clsx } from "@/lib/clsx";

const PIECES = [
  { left: "8%", delay: "0s", color: "var(--color-citron)", size: 10 },
  { left: "20%", delay: "0.15s", color: "var(--color-coral)", size: 8 },
  { left: "33%", delay: "0.05s", color: "var(--color-citron)", size: 12 },
  { left: "46%", delay: "0.25s", color: "var(--color-coral)", size: 7 },
  { left: "58%", delay: "0.1s", color: "var(--color-citron)", size: 11 },
  { left: "70%", delay: "0.3s", color: "var(--color-coral)", size: 9 },
  { left: "82%", delay: "0.08s", color: "var(--color-citron)", size: 10 },
  { left: "92%", delay: "0.2s", color: "var(--color-coral)", size: 8 },
];

/** A one-shot confetti/sparkle burst layered over a container. */
export function Sparkles({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={clsx("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {PIECES.map((p, i) => (
        <span
          key={i}
          className="animate-sparkle absolute top-0 block rounded-[2px]"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
}
