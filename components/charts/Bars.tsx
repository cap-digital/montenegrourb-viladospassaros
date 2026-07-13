"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AXIS_TICK, CHART, SERIES } from "./theme";
import { ChartTooltip } from "./Tooltip";

export interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

// Horizontal bars — one metric across categories. Each bar can carry its own
// hue (identity) via `color`; otherwise cycles the categorical order.
export function BarsH({
  data,
  fmt,
  height = 260,
  singleColor,
  showValues = true,
}: {
  data: BarDatum[];
  fmt: (v: number) => string;
  height?: number;
  singleColor?: string;
  showValues?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 2, right: showValues ? 56 : 8, bottom: 2, left: 4 }}
        barCategoryGap="22%"
      >
        <CartesianGrid stroke={CHART.grid} horizontal={false} />
        <XAxis
          type="number"
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => fmt(Number(v))}
        />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ fill: CHART.ink2, fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          width={130}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          content={<ChartTooltip fmt={(v) => fmt(v)} />}
        />
        <Bar
          dataKey="value"
          name="Valor"
          radius={[0, 4, 4, 0]}
          maxBarSize={26}
          isAnimationActive={false}
        >
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={d.color ?? singleColor ?? SERIES[i % SERIES.length]}
            />
          ))}
          {showValues && (
            <LabelList
              dataKey="value"
              position="right"
              formatter={(v) => fmt(Number(v))}
              style={{
                fill: CHART.ink2,
                fontSize: 11,
                fontVariantNumeric: "tabular-nums",
              }}
            />
          )}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Vertical bars — single metric across categories (e.g. by age).
export function BarsV({
  data,
  fmt,
  height = 260,
  singleColor,
}: {
  data: BarDatum[];
  fmt: (v: number) => string;
  height?: number;
  singleColor?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 6, bottom: 0, left: 0 }}>
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
          width={48}
          tickFormatter={(v) => fmt(Number(v))}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          content={<ChartTooltip fmt={(v) => fmt(v)} />}
        />
        <Bar
          dataKey="value"
          name="Valor"
          radius={[4, 4, 0, 0]}
          maxBarSize={46}
          isAnimationActive={false}
        >
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={d.color ?? singleColor ?? SERIES[i % SERIES.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
