"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AXIS_TICK, CHART } from "./theme";
import { ChartTooltip } from "./Tooltip";

export interface SeriesDef {
  key: string;
  name: string;
  color: string;
}

// Area/line time series. All series share ONE y-axis, so only pass series of
// the same unit. `fmt` formats both axis ticks and tooltip values.
export function TimeSeries({
  data,
  series,
  fmt,
  height = 260,
  mode = "area",
}: {
  data: Array<Record<string, number | string>>;
  series: SeriesDef[];
  fmt: (v: number) => string;
  height?: number;
  mode?: "area" | "line";
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 6, right: 6, bottom: 0, left: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient
              key={s.key}
              id={`grad-${s.key}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid stroke={CHART.grid} vertical={false} />
        <XAxis
          dataKey="label"
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={{ stroke: CHART.axis }}
          dy={6}
        />
        <YAxis
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          width={54}
          tickFormatter={(v) => fmt(Number(v))}
        />
        <Tooltip
          cursor={{ stroke: CHART.axis, strokeWidth: 1 }}
          content={<ChartTooltip fmt={(v) => fmt(v)} />}
        />
        {series.map((s) =>
          mode === "area" ? (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#grad-${s.key})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          ) : (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0, fill: s.color }}
              activeDot={{ r: 4, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          ),
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
