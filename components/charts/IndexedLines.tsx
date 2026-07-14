"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AXIS_TICK, CHART, SERIES, tooltipStyle } from "./theme";

export interface IdxMetric {
  key: string;
  name: string;
  color: string;
  fmt: (v: number) => string;
}

// Evolução indexada (base 100 no primeiro dia): duas linhas num único eixo,
// comparando o crescimento relativo do investimento com a métrica escolhida.
export function IndexedLines({
  data,
  spendFmt,
  metrics,
  height = 300,
}: {
  data: Array<Record<string, number | string>>;
  spendFmt: (v: number) => string;
  metrics: IdxMetric[];
  height?: number;
}) {
  const [sel, setSel] = useState(metrics[0].key);
  const metric = metrics.find((m) => m.key === sel) ?? metrics[0];

  const baseSpend = Number(data[0]?.spend) || 0;
  const baseMetric = Number(data[0]?.[metric.key]) || 0;

  const idx = data.map((d) => {
    const s = Number(d.spend);
    const m = Number(d[metric.key]);
    return {
      label: d.label,
      invest: baseSpend > 0 ? +((s / baseSpend) * 100).toFixed(1) : 100,
      metric: baseMetric > 0 ? +((m / baseMetric) * 100).toFixed(1) : 100,
      _spend: s,
      _metric: m,
    };
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-vp-muted">
          Comparar evolução do investimento com:
        </span>
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
              className="inline-block h-2.5 w-4 rounded-full"
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
        <LineChart data={idx} margin={{ top: 6, right: 10, bottom: 0, left: 0 }}>
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
            width={44}
            tickFormatter={(v) => `${v}`}
          />
          <ReferenceLine
            y={100}
            stroke={CHART.axis}
            strokeDasharray="4 4"
            ifOverflow="extendDomain"
          />
          <Tooltip
            cursor={{ stroke: CHART.axis, strokeWidth: 1 }}
            content={({ active, payload, label }) => {
              if (!active || !payload || payload.length === 0) return null;
              const p = payload[0]?.payload as {
                invest: number;
                metric: number;
                _spend: number;
                _metric: number;
              };
              return (
                <div style={tooltipStyle}>
                  <div
                    style={{
                      color: CHART.ink2,
                      marginBottom: 6,
                      fontWeight: 600,
                    }}
                  >
                    {String(label)}
                  </div>
                  <Row
                    color={SERIES[0]}
                    name="Investimento"
                    value={`${spendFmt(p._spend)} · ${p.invest}`}
                  />
                  <Row
                    color={metric.color}
                    name={metric.name}
                    value={`${metric.fmt(p._metric)} · ${p.metric}`}
                  />
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="invest"
            name="Investimento"
            stroke={SERIES[0]}
            strokeWidth={2.5}
            dot={{ r: 3, strokeWidth: 0, fill: SERIES[0] }}
            activeDot={{ r: 5, strokeWidth: 0 }}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="metric"
            name={metric.name}
            stroke={metric.color}
            strokeWidth={2.5}
            dot={{ r: 3, strokeWidth: 0, fill: metric.color }}
            activeDot={{ r: 5, strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="mt-2 text-xs text-vp-muted">
        Base 100 = primeiro dia. Acima de 100 = crescimento; abaixo = queda. O
        tooltip mostra o valor absoluto e o índice.
      </p>
    </div>
  );
}

function Row({
  color,
  name,
  value,
}: {
  color: string;
  name: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: 3,
            background: color,
            display: "inline-block",
          }}
        />
        <span style={{ color: CHART.ink2 }}>{name}</span>
      </span>
      <span
        style={{
          color: CHART.ink,
          fontWeight: 600,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </span>
    </div>
  );
}
