"use client";

import { formatInt, formatPct } from "@/lib/format";

export interface FunnelStage {
  label: string;
  value: number;
}

// Video retention funnel. Ordinal brown ramp (light -> deep) down the stages;
// each bar width is proportional to the first stage, with retention % vs top
// and step-to-step drop shown as direct labels.
const STEP_COLORS = ["#e2c074", "#cfa64f", "#b5842a", "#9a6d24", "#7f571f"];
// Readable ink per step (dark on light steps, cream on deep steps).
const STEP_INK = ["#3a2a12", "#3a2a12", "#2c2013", "#faf5ea", "#faf5ea"];

export function Funnel({ stages }: { stages: FunnelStage[] }) {
  const top = stages[0]?.value || 0;
  return (
    <div className="space-y-2.5">
      {stages.map((s, i) => {
        const pctOfTop = top > 0 ? s.value / top : 0;
        const prev = i > 0 ? stages[i - 1].value : s.value;
        const drop = prev > 0 ? 1 - s.value / prev : 0;
        const width = Math.max(pctOfTop * 100, 2);
        return (
          <div key={s.label}>
            <div className="mb-1 flex items-baseline justify-between text-xs">
              <span className="font-medium text-vp-ink2">{s.label}</span>
              <span className="tabular-nums text-vp-muted">
                {formatPct(pctOfTop, 1)} do total
              </span>
            </div>
            <div className="relative h-9 overflow-hidden rounded-lg bg-vp-surface2">
              <div
                className="flex h-full items-center rounded-lg px-3 transition-all"
                style={{
                  width: `${width}%`,
                  background: STEP_COLORS[i % STEP_COLORS.length],
                  minWidth: 64,
                }}
              >
                <span
                  className="text-xs font-semibold tabular-nums"
                  style={{ color: STEP_INK[i % STEP_INK.length] }}
                >
                  {formatInt(s.value)}
                </span>
              </div>
              {i > 0 && drop > 0.001 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.7rem] tabular-nums text-vp-muted">
                  ▼ {formatPct(drop, 0)}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
