import { clsx } from "@/lib/clsx";
import { forwardRef } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(function Input({ className, invalid, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={clsx(
        "w-full rounded-field border bg-white px-4 py-3 text-base text-ink",
        "placeholder:text-ink-light/70 outline-none transition",
        "focus:ring-3 focus:ring-coral/30",
        invalid
          ? "border-error focus:border-error focus:ring-error/20"
          : "border-input focus:border-coral",
        className,
      )}
      {...props}
    />
  );
});
