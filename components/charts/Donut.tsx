"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CHART, SERIES, tooltipStyle } from "./theme";

export interface DonutDatum {
  label: string;
  value: number;
  color?: string;
}

export function Donut({
  data,
  fmt,
  height = 260,
  centerLabel,
  centerValue,
}: {
  data: DonutDatum[];
  fmt: (v: number) => string;
  height?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative" style={{ width: height, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={2}
              stroke={CHART.surface}
              strokeWidth={2}
              isAnimationActive={false}
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.color ?? SERIES[i % SERIES.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v, n) => {
                const num = Number(v);
                return [
                  `${fmt(num)} (${total > 0 ? ((num / total) * 100).toFixed(1) : 0}%)`,
                  String(n),
                ];
              }}
              itemStyle={{ color: CHART.ink }}
              labelStyle={{ color: CHART.ink2 }}
            />
          </PieChart>
        </ResponsiveContainer>
        {(centerValue || centerLabel) && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            {centerValue && (
              <span className="text-xl font-semibold tabular-nums text-vp-ink">
                {centerValue}
              </span>
            )}
            {centerLabel && (
              <span className="mt-0.5 text-[0.65rem] uppercase tracking-widest text-vp-muted">
                {centerLabel}
              </span>
            )}
          </div>
        )}
      </div>
      {/* Legend with direct values */}
      <ul className="flex-1 space-y-2">
        {data.map((d, i) => (
          <li key={i} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-vp-ink2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ background: d.color ?? SERIES[i % SERIES.length] }}
              />
              {d.label}
            </span>
            <span className="tabular-nums text-vp-ink">
              {fmt(d.value)}
              <span className="ml-1 text-xs text-vp-muted">
                {total > 0 ? `${((d.value / total) * 100).toFixed(0)}%` : ""}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
