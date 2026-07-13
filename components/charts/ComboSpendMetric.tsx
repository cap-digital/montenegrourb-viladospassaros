"use client";

import { useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AXIS_TICK, CHART, SERIES, tooltipStyle } from "./theme";

export interface ComboMetric {
  key: string;
  name: string;
  color: string;
  fmt: (v: number) => string;
}

// Combo chart: bars = investimento (eixo esquerdo) + linha da métrica
// selecionável (eixo direito). Eixo duplo é intencional aqui (investimento em
// R$ vs. métrica em outra unidade), a pedido — cada eixo é rotulado.
export function ComboSpendMetric({
  data,
  spendFmt,
  metrics,
  height = 300,
}: {
  data: Array<Record<string, number | string>>;
  spendFmt: (v: number) => string;
  metrics: ComboMetric[];
  height?: number;
}) {
  const [sel, setSel] = useState(metrics[0].key);
  const metric = metrics.find((m) => m.key === sel) ?? metrics[0];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-vp-muted">Comparar investimento com:</span>
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
        <span className="ml-auto flex items-center gap-3 text-xs text-vp-ink2">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: SERIES[0] }}
            />
            Investimento
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-4 rounded-full"
              style={{ background: metric.color }}
            />
            {metric.name}
          </span>
        </span>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={CHART.grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={{ stroke: CHART.axis }}
            dy={6}
          />
          <YAxis
            yAxisId="left"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={56}
            tickFormatter={(v) => spendFmt(Number(v))}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={52}
            tickFormatter={(v) => metric.fmt(Number(v))}
          />
          <Tooltip
            cursor={{ fill: "rgba(120,90,40,0.06)" }}
            contentStyle={tooltipStyle}
            labelStyle={{ color: CHART.ink2, fontWeight: 600, marginBottom: 4 }}
            formatter={(value, name) => {
              const v = Number(value);
              if (name === "Investimento") return [spendFmt(v), name];
              return [metric.fmt(v), String(name)];
            }}
          />
          <Bar
            yAxisId="left"
            dataKey="spend"
            name="Investimento"
            fill={SERIES[0]}
            radius={[4, 4, 0, 0]}
            maxBarSize={38}
            isAnimationActive={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey={metric.key}
            name={metric.name}
            stroke={metric.color}
            strokeWidth={2.5}
            dot={{ r: 3, strokeWidth: 0, fill: metric.color }}
            activeDot={{ r: 5, strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
