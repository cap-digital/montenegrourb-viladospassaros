import { ReactNode } from "react";

export function ChartCard({
  title,
  subtitle,
  right,
  children,
  className = "",
  height,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  height?: number;
}) {
  return (
    <section
      className={`rounded-2xl border border-vpline bg-vp-surface p-5 ${className}`}
      style={{ boxShadow: "0 6px 20px -12px rgba(60,45,25,0.25)" }}
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-vp-ink">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-vp-muted">{subtitle}</p>
          )}
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </header>
      <div style={height ? { height } : undefined}>{children}</div>
    </section>
  );
}
