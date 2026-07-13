import { ReactNode } from "react";

export function SectionTitle({
  children,
  hint,
}: {
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-3 mt-1 flex items-baseline gap-3">
      <h2 className="font-serif-display text-2xl font-semibold tracking-wide text-vp-ink">
        {children}
      </h2>
      {hint && <span className="text-xs text-vp-muted">{hint}</span>}
    </div>
  );
}

export function EmptyState({
  title,
  message,
  icon,
}: {
  title: string;
  message: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-vplineStrong bg-vp-surface p-10 text-center">
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-vpline bg-vp-surface2 text-vp-muted">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-vp-ink">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-vp-ink2">{message}</p>
    </div>
  );
}

export function Badge({
  children,
  tone = "gold",
}: {
  children: ReactNode;
  tone?: "gold" | "muted";
}) {
  const cls =
    tone === "gold"
      ? "border-[rgba(181,132,42,0.35)] bg-[rgba(181,132,42,0.12)] text-vp-goldDeep"
      : "border-vpline bg-vp-surface2 text-vp-ink2";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {children}
    </span>
  );
}
