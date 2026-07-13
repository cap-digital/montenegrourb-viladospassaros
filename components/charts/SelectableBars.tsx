"use client";

import { useState } from "react";
import { BarsH } from "./Bars";
import { SERIES } from "./theme";

export interface BarMetric<T> {
  key: string;
  name: string;
  fmt: (v: number) => string;
  value: (item: T) => number;
  lowerIsBetter?: boolean; // sort ascending (e.g. custos onde menor é melhor)
}

// Horizontal bars with a metric dropdown. Color follows the entity (fixed by
// original order), not the rank — so changing the metric re-sorts without
// repainting a given category.
export function SelectableBars<T>({
  items,
  label,
  metrics,
  height = 220,
  initialKey,
  singleColor,
}: {
  items: T[];
  label: (item: T) => string;
  metrics: BarMetric<T>[];
  height?: number;
  initialKey?: string;
  singleColor?: string;
}) {
  const [sel, setSel] = useState(initialKey ?? metrics[0].key);
  const metric = metrics.find((m) => m.key === sel) ?? metrics[0];

  const colorMap = new Map(
    items.map((it, i) => [label(it), SERIES[i % SERIES.length]]),
  );

  const data = items
    .map((it) => ({
      label: label(it),
      value: +metric.value(it).toFixed(4),
      color: singleColor ?? colorMap.get(label(it)),
    }))
    .sort((a, b) =>
      metric.lowerIsBetter ? a.value - b.value : b.value - a.value,
    );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-vp-muted">Métrica:</span>
        <select
          value={sel}
          onChange={(e) => setSel(e.target.value)}
          className="cursor-pointer rounded-lg border border-vpline bg-vp-surface2 px-2.5 py-1.5 text-sm text-vp-ink outline-none"
        >
          {metrics.map((m) => (
            <option key={m.key} value={m.key} className="bg-vp-surface">
              {m.name}
            </option>
          ))}
        </select>
        {metric.lowerIsBetter && (
          <span className="text-xs text-vp-muted">(menor é melhor)</span>
        )}
      </div>
      <BarsH data={data} fmt={metric.fmt} height={height} />
    </div>
  );
}
