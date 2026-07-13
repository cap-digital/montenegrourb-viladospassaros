export function BirdsMark({
  size = 48,
  color = "var(--vp-gold)",
  accent = "var(--vp-ink)",
}: {
  size?: number;
  color?: string;
  accent?: string;
}) {
  // Two stylised doves in flight, echoing the Vila dos Pássaros emblem.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      {/* upper bird */}
      <path
        d="M34 14c4-3 9-4 14-2-3 1-5 3-6 6 3-1 6-1 9 1-4 1-7 3-9 6-2-3-5-5-9-5 2-3 2-5 1-6z"
        fill={color}
      />
      <circle cx="35.5" cy="16.5" r="1.6" fill={accent} />
      {/* lower bird */}
      <path
        d="M20 30c5-3 11-4 17-1-4 1-6 3-7 7 4-2 8-2 12 1-5 1-9 3-11 8-2-4-6-7-11-7 3-4 2-7 0-8z"
        fill={color}
        opacity="0.92"
      />
      <circle cx="21.5" cy="32.5" r="1.7" fill={accent} />
    </svg>
  );
}

export function VilaLogo({
  size = "md",
  color = "var(--vp-ink)",
  mark = "var(--vp-gold)",
}: {
  size?: "sm" | "md";
  color?: string;
  mark?: string;
}) {
  const title = size === "sm" ? "text-lg" : "text-2xl";
  return (
    <div className="flex items-center gap-3">
      <BirdsMark size={size === "sm" ? 34 : 44} color={mark} accent={color} />
      <div className="leading-tight">
        <div
          className={`font-serif-display ${title} font-semibold tracking-[0.14em]`}
          style={{ color }}
        >
          VILA DOS
        </div>
        <div
          className={`font-serif-display ${title} -mt-1 font-semibold tracking-[0.14em]`}
          style={{ color }}
        >
          PÁSSAROS
        </div>
      </div>
    </div>
  );
}
