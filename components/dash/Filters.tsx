"use client";

import { useState } from "react";
import { formatDayLong } from "@/lib/format";
import type { Filter, PhaseOption } from "@/lib/metrics";
import { IconCalendar, IconLayers, IconStack } from "./icons";

export interface FilterState {
  from: string;
  to: string;
  phase: string;
  platform: string; // "all" | "Meta" | "Google"
}

// Number of days between two YYYY-MM-DD strings, inclusive.
function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86400000) + 1;
}

function addDays(date: string, delta: number): string {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

export function Filters({
  bounds,
  phases,
  platforms = [],
  showPlatform = false,
  value,
  onChange,
}: {
  bounds: { min: string; max: string };
  phases: PhaseOption[];
  platforms?: string[];
  showPlatform?: boolean;
  value: FilterState;
  onChange: (f: FilterState) => void;
}) {
  const [open, setOpen] = useState(false);
  const totalDays =
    bounds.min && bounds.max ? daysBetween(bounds.min, bounds.max) : 0;

  const presets: { label: string; from: string; to: string }[] = [
    { label: "Todo o período", from: bounds.min, to: bounds.max },
  ];
  if (totalDays >= 3)
    presets.push({
      label: "Últimos 3 dias",
      from: addDays(bounds.max, -2),
      to: bounds.max,
    });
  if (totalDays >= 7)
    presets.push({
      label: "Últimos 7 dias",
      from: addDays(bounds.max, -6),
      to: bounds.max,
    });

  const isPreset = (p: { from: string; to: string }) =>
    p.from === value.from && p.to === value.to;

  const rangeLabel =
    value.from === value.to
      ? formatDayLong(value.from)
      : `${formatDayLong(value.from)} — ${formatDayLong(value.to)}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Platform filter */}
      {showPlatform && (
        <div className="flex items-center gap-2 rounded-xl border border-vpline bg-vp-surface px-3 py-2">
          <IconStack size={15} className="text-vp-muted" />
          <select
            value={value.platform}
            onChange={(e) => onChange({ ...value, platform: e.target.value })}
            className="cursor-pointer bg-transparent text-sm text-vp-ink outline-none"
          >
            <option value="all" className="bg-vp-surface text-vp-ink">
              Todas as plataformas
            </option>
            {platforms.map((p) => (
              <option key={p} value={p} className="bg-vp-surface text-vp-ink">
                {p}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Phase filter */}
      <div className="flex items-center gap-2 rounded-xl border border-vpline bg-vp-surface px-3 py-2">
        <IconLayers size={15} className="text-vp-muted" />
        <select
          value={value.phase}
          onChange={(e) => onChange({ ...value, phase: e.target.value })}
          className="cursor-pointer bg-transparent text-sm text-vp-ink outline-none"
        >
          <option value="all" className="bg-vp-surface text-vp-ink">
            Todas as fases
          </option>
          {phases.map((p) => (
            <option
              key={p.key}
              value={p.key}
              className="bg-vp-surface text-vp-ink"
            >
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Period filter */}
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-xl border border-vpline bg-vp-surface px-3 py-2 text-sm text-vp-ink transition hover:border-vplineStrong"
        >
          <IconCalendar size={15} className="text-vp-muted" />
          <span className="tabular-nums">{rangeLabel}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {open && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setOpen(false)}
            />
            <div className="absolute right-0 z-40 mt-2 w-72 rounded-2xl border border-vpline bg-vp-surface p-3 shadow-2xl">
              <p className="mb-2 px-1 text-[0.7rem] uppercase tracking-widest text-vp-muted">
                Períodos
              </p>
              <div className="space-y-1">
                {presets.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => {
                      onChange({ ...value, from: p.from, to: p.to });
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                      isPreset(p)
                        ? "bg-[rgba(181,132,42,0.15)] text-vp-goldDeep"
                        : "text-vp-ink2 hover:bg-vp-surface2"
                    }`}
                  >
                    {p.label}
                    {isPreset(p) && <span className="text-vp-goldBright">✓</span>}
                  </button>
                ))}
              </div>
              <div className="my-3 h-px bg-vpline" />
              <p className="mb-2 px-1 text-[0.7rem] uppercase tracking-widest text-vp-muted">
                Personalizado
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={value.from}
                  min={bounds.min}
                  max={value.to}
                  onChange={(e) =>
                    onChange({ ...value, from: e.target.value })
                  }
                  className="w-full rounded-lg border border-vpline bg-vp-surface2 px-2 py-1.5 text-xs text-vp-ink outline-none"
                />
                <span className="text-vp-muted">—</span>
                <input
                  type="date"
                  value={value.to}
                  min={value.from}
                  max={bounds.max}
                  onChange={(e) => onChange({ ...value, to: e.target.value })}
                  className="w-full rounded-lg border border-vpline bg-vp-surface2 px-2 py-1.5 text-xs text-vp-ink outline-none"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function toFilter(f: FilterState): Filter {
  return { from: f.from, to: f.to, phase: f.phase };
}
