"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AXIS_TICK, CHART } from "./theme";
import { ChartTooltip } from "./Tooltip";
import type { SeriesDef } from "./TimeSeries";

// Grouped (paired) or stacked vertical bars for multiple series per category.
// Stacked segments carry a 2px surface gap between fills (stroke = surface).
export function MultiBars({
  data,
  series,
  fmt,
  height = 280,
  stacked = false,
  legend = true,
}: {
  data: Array<Record<string, number | string>>;
  series: SeriesDef[];
  fmt: (v: number) => string;
  height?: number;
  stacked?: boolean;
  legend?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 8, right: 6, bottom: 0, left: 0 }}
        barCategoryGap={stacked ? "28%" : "22%"}
      >
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
          width={52}
          tickFormatter={(v) => fmt(Number(v))}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          content={<ChartTooltip fmt={(v) => fmt(v)} />}
        />
        {legend && (
          <Legend
            verticalAlign="top"
            align="right"
            height={30}
            iconType="circle"
            iconSize={9}
            wrapperStyle={{ fontSize: 12, color: CHART.ink2 }}
          />
        )}
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.name}
            fill={s.color}
            stackId={stacked ? "a" : undefined}
            radius={
              stacked
                ? i === series.length - 1
                  ? [4, 4, 0, 0]
                  : [0, 0, 0, 0]
                : [4, 4, 0, 0]
            }
            stroke={stacked ? CHART.surface : undefined}
            strokeWidth={stacked ? 2 : 0}
            maxBarSize={stacked ? 54 : 30}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
