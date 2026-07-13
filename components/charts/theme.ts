// Shared chart tokens — mirror the CSS custom properties in globals.css so
// Recharts (which needs concrete values) stays in sync with the design system.
// Palette validated against surface #ffffff (light) via the dataviz validator.

export const SERIES = [
  "#8f5810", // 1 brown
  "#ce9a28", // 2 gold
  "#be5525", // 3 terracotta
  "#0a7a5e", // 4 teal-green
  "#7c8a2a", // 5 olive
  "#a62a4a", // 6 wine
];

// Sequential ramp (light -> dark brown) for heatmap magnitude on white.
export const SEQ = [
  "#f5ecdc",
  "#e6cf9f",
  "#d3ac5e",
  "#bd8a2f",
  "#9a6a1e",
  "#6e4a12",
];

export const CHART = {
  ink: "#2c2219",
  ink2: "#6e6053",
  muted: "#9a8a76",
  grid: "#ece3d3",
  axis: "#dccdb5",
  surface: "#ffffff",
  surface2: "#f4ecdd",
  gold: "#b5842a",
  goldBright: "#8f6416",
};

export const AXIS_TICK = { fill: CHART.muted, fontSize: 11 };

// Shared tooltip container style (used by custom tooltips) — light card.
export const tooltipStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.98)",
  border: "1px solid var(--vp-line-strong)",
  borderRadius: 12,
  padding: "10px 12px",
  boxShadow: "0 10px 30px rgba(60,45,25,0.18)",
  color: CHART.ink,
  fontSize: 12,
};

// Map a series index to a hue, folding overflow into the last slot.
export function seriesColor(i: number): string {
  return SERIES[i] ?? SERIES[SERIES.length - 1];
}
