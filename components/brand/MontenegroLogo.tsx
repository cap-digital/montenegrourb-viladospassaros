export function MontenegroMark({
  size = 48,
  color = "currentColor",
}: {
  size?: number;
  color?: string;
}) {
  // Rounded-square "house" mark with a roof chevron and an inner downward triangle.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="4"
        width="56"
        height="56"
        rx="14"
        stroke={color}
        strokeWidth="3"
      />
      <path
        d="M18 30 L32 18 L46 30"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M22 34 L42 34 L32 48 Z" fill={color} />
    </svg>
  );
}

export function MontenegroLogo({
  color = "var(--mn-cream)",
}: {
  color?: string;
}) {
  return (
    <div className="leading-none">
      <div
        className="text-[1.4rem] font-semibold tracking-[0.24em]"
        style={{ color }}
      >
        MONTENEGRO
      </div>
      <div
        className="mt-1 text-[0.72rem] font-medium tracking-[0.46em] opacity-80"
        style={{ color }}
      >
        URBANISMO
      </div>
    </div>
  );
}
