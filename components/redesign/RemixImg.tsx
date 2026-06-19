import Image from "next/image";

/**
 * Thin next/image wrapper for redesign imagery (real brand assets only — cans
 * + lifestyle shots in /public/images). Keeps intrinsic ratio, responsive width.
 */
export function RemixImg({
  src,
  alt,
  width,
  height,
  className,
  style,
  priority,
  sizes = "(max-width: 640px) 100vw, 520px",
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={className}
      style={{ height: "auto", ...style }}
    />
  );
}
