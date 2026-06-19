import { clsx } from "@/lib/clsx";

/**
 * A friendly Remix genie in pure SVG — a clear face up top, little crossed arms,
 * and a smoke wisp tapering down toward the lamp/orb below. No external assets.
 */
export function Genie({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 220"
      className={clsx("h-full w-full overflow-visible", className)}
      role="img"
      aria-label="Remix genie"
    >
      <defs>
        <linearGradient id="genieBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f2a08f" />
          <stop offset="55%" stopColor="#e88472" />
          <stop offset="100%" stopColor="#cf6450" />
        </linearGradient>
        <radialGradient id="genieGlow" cx="50%" cy="34%" r="60%">
          <stop offset="0%" stopColor="#ffe7a6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffe7a6" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* soft glow */}
      <ellipse cx="80" cy="80" rx="78" ry="92" fill="url(#genieGlow)" />

      {/* smoke wisp tail — wide at the shoulders, tapering to a point toward the lamp */}
      <path
        d="M52 104
           C 40 140, 66 156, 80 212
           C 94 156, 120 140, 108 104
           C 96 120, 64 120, 52 104 Z"
        fill="url(#genieBody)"
      />
      {/* a curl on the wisp for movement */}
      <path
        d="M80 150 C 96 158, 96 178, 80 184 C 88 176, 86 162, 80 150 Z"
        fill="#cf6450"
        opacity="0.5"
      />

      {/* crossed arms */}
      <path
        d="M50 104 C 66 94, 94 94, 110 104 C 96 116, 64 116, 50 104 Z"
        fill="#cf6450"
      />
      {/* citron sash gem */}
      <circle cx="80" cy="104" r="6.5" fill="#e9e034" stroke="#cf6450" strokeWidth="1.5" />

      {/* head */}
      <circle cx="80" cy="58" r="38" fill="url(#genieBody)" />

      {/* topknot */}
      <path d="M80 8 C 88 18, 88 24, 80 30 C 72 24, 72 18, 80 8 Z" fill="#e9e034" />
      <circle cx="80" cy="16" r="5" fill="#e9e034" />
      {/* forehead gem */}
      <circle cx="80" cy="40" r="3.4" fill="#e9e034" />

      {/* face */}
      <circle cx="67" cy="58" r="5" fill="#16130f" />
      <circle cx="93" cy="58" r="5" fill="#16130f" />
      <circle cx="68.8" cy="56" r="1.6" fill="#fff" />
      <circle cx="94.8" cy="56" r="1.6" fill="#fff" />
      {/* cheeks */}
      <circle cx="56" cy="70" r="5.5" fill="#ef9a87" opacity="0.75" />
      <circle cx="104" cy="70" r="5.5" fill="#ef9a87" opacity="0.75" />
      {/* smile */}
      <path
        d="M66 70 Q 80 84 94 70"
        fill="none"
        stroke="#16130f"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** A speech bubble that points down toward the genie. */
export function SpeechBubble({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("relative inline-block", className)}>
      <div className="rounded-2xl border border-line bg-white px-5 py-3 text-center shadow-lift">
        {children}
      </div>
      <div className="absolute left-1/2 -bottom-2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-line bg-white" />
    </div>
  );
}
