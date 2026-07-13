// pt-BR formatting helpers.

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const int0 = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

export function formatBRL(v: number): string {
  if (!isFinite(v)) return "R$ 0,00";
  return brl.format(v);
}

export function formatInt(v: number): string {
  if (!isFinite(v)) return "0";
  return int0.format(Math.round(v));
}

export function formatDec(v: number, digits = 2): string {
  if (!isFinite(v)) return "0";
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(v);
}

// Percentage from a ratio (0.012 -> "1,20%")
export function formatPct(ratio: number, digits = 2): string {
  if (!isFinite(ratio)) return "0%";
  return (
    new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(ratio * 100) + "%"
  );
}

// Compact abbreviation for axis labels / tight KPI space (12.340 -> "12,3 mil")
export function formatCompact(v: number): string {
  if (!isFinite(v)) return "0";
  const abs = Math.abs(v);
  if (abs >= 1_000_000)
    return formatDec(v / 1_000_000, 1).replace(/,0$/, "") + " mi";
  if (abs >= 1_000) return formatDec(v / 1_000, 1).replace(/,0$/, "") + " mil";
  return formatInt(v);
}

// Compact currency for axis ticks
export function formatBRLCompact(v: number): string {
  if (!isFinite(v)) return "R$ 0";
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return "R$ " + formatDec(v / 1_000_000, 1) + " mi";
  if (abs >= 1_000) return "R$ " + formatDec(v / 1_000, 1) + " mil";
  return "R$ " + formatInt(v);
}

// "2026-07-10T03:00:00.000Z" -> "10/07"
export function formatDayShort(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

// "2026-07-10T03:00:00.000Z" -> "10 jul 2026"
export function formatDayLong(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(d);
}
