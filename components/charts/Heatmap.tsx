"use client";

import type { HeatCell } from "@/lib/metrics";
import { SEQ } from "./theme";

const GENDER_LABEL: Record<string, string> = {
  female: "Feminino",
  male: "Masculino",
};

// Sequential ramp (light -> dark): near-zero recedes toward the light surface.
function rampColor(t: number): string {
  if (t <= 0) return "#faf5ea";
  const idx = Math.min(SEQ.length - 1, Math.floor(t * (SEQ.length - 1) + 0.001));
  return SEQ[idx];
}

// Choose readable ink over each cell tone (light cells -> dark ink).
function inkFor(t: number): string {
  return t > 0.6 ? "#faf5ea" : "#2c2219";
}

export function Heatmap({
  ages,
  genders,
  cells,
  max,
  fmt,
}: {
  ages: string[];
  genders: string[];
  cells: HeatCell[];
  max: number;
  fmt: (v: number) => string;
}) {
  const get = (age: string, gender: string) =>
    cells.find((c) => c.age === age && c.gender === gender)?.value ?? 0;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[320px]">
        <div
          className="grid gap-1.5"
          style={{
            gridTemplateColumns: `72px repeat(${genders.length}, minmax(0,1fr))`,
          }}
        >
          {/* header row */}
          <div />
          {genders.map((g) => (
            <div
              key={g}
              className="pb-1 text-center text-xs font-medium text-vp-ink2"
            >
              {GENDER_LABEL[g] ?? g}
            </div>
          ))}
          {/* body */}
          {ages.map((age) => (
            <div key={age} className="contents">
              <div className="flex items-center text-xs text-vp-muted">
                {age}
              </div>
              {genders.map((g) => {
                const v = get(age, g);
                const t = max > 0 ? v / max : 0;
                return (
                  <div
                    key={g}
                    title={`${age} · ${GENDER_LABEL[g] ?? g}: ${fmt(v)}`}
                    className="flex h-11 items-center justify-center rounded-md text-xs font-semibold tabular-nums transition"
                    style={{ background: rampColor(t), color: inkFor(t) }}
                  >
                    {fmt(v)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {/* scale legend */}
        <div className="mt-3 flex items-center gap-2 text-[0.7rem] text-vp-muted">
          <span>menor</span>
          <div className="flex h-2.5 flex-1 overflow-hidden rounded-full">
            {SEQ.map((c) => (
              <span key={c} className="flex-1" style={{ background: c }} />
            ))}
          </div>
          <span>maior</span>
        </div>
      </div>
    </div>
  );
}
