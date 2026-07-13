"use client";

import { CHART, tooltipStyle } from "./theme";

interface Item {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
}

// Generic themed tooltip. `fmt` maps a raw value (per dataKey) to a display string.
export function ChartTooltip({
  active,
  payload,
  label,
  fmt,
  labelText,
}: {
  active?: boolean;
  payload?: Item[];
  label?: string | number;
  fmt?: (value: number, key: string) => string;
  labelText?: (label: string | number) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div style={tooltipStyle}>
      {label !== undefined && (
        <div
          style={{
            color: CHART.ink2,
            marginBottom: 6,
            fontWeight: 600,
            letterSpacing: 0.2,
          }}
        >
          {labelText ? labelText(label) : String(label)}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {payload.map((it, i) => {
          const key = String(it.dataKey ?? it.name ?? i);
          const v = typeof it.value === "number" ? it.value : Number(it.value);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                justifyContent: "space-between",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 3,
                    background: it.color,
                    display: "inline-block",
                  }}
                />
                <span style={{ color: CHART.ink2 }}>{it.name}</span>
              </span>
              <span
                style={{
                  color: CHART.ink,
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {fmt ? fmt(v, key) : v}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
