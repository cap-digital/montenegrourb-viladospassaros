import { ReactNode } from "react";

export interface KpiProps {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  accent?: string; // css color for the accent bar / icon
  emphasis?: boolean; // hero-style larger card
}

export function KpiCard({
  label,
  value,
  hint,
  icon,
  accent = "var(--vp-gold)",
  emphasis = false,
}: KpiProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-vpline bg-vp-surface p-4 transition hover:border-vplineStrong"
      style={{ boxShadow: "0 6px 20px -12px rgba(60,45,25,0.22)" }}
    >
      {/* accent edge */}
      <span
        className="absolute inset-y-3 left-0 w-1 rounded-full"
        style={{ background: accent, opacity: 0.85 }}
      />
      <div className="flex items-start justify-between pl-2">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.12em] text-vp-muted">
          {label}
        </p>
        {icon && (
          <span className="text-vp-muted" style={{ color: accent }}>
            {icon}
          </span>
        )}
      </div>
      <p
        className={`pl-2 font-semibold tabular-nums text-vp-ink ${
          emphasis ? "mt-2 text-3xl" : "mt-1.5 text-2xl"
        }`}
      >
        {value}
      </p>
      {hint && <p className="mt-1 pl-2 text-xs text-vp-ink2">{hint}</p>}
    </div>
  );
}
