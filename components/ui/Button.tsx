import { clsx } from "@/lib/clsx";

type Variant = "primary" | "secondary" | "light";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-coral text-white hover:bg-ember shadow-lift active:translate-y-px",
  secondary:
    "border border-coral text-ember bg-transparent hover:bg-coral/10",
  light: "bg-white text-ink hover:bg-paper-hover shadow-card",
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-pill px-6 py-3 text-base font-semibold leading-none",
        "min-h-[48px] transition-colors disabled:opacity-60 disabled:cursor-not-allowed",
        "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-coral/40",
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
