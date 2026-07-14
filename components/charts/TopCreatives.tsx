"use client";

import { useState } from "react";
import { IconInstagram } from "@/components/dash/icons";

export interface TopMetric<T> {
  key: string;
  name: string;
  fmt: (v: number) => string;
  value: (item: T) => number;
  lowerIsBetter?: boolean;
}

// Top 3 criativos por métrica selecionável — miniatura, botão de link e uma
// análise descritiva que é reformulada sempre que a métrica muda.
export function TopCreatives<T>({
  items,
  name,
  thumb,
  permalink,
  metrics,
}: {
  items: T[];
  name: (item: T) => string;
  thumb: (item: T) => string;
  permalink: (item: T) => string;
  metrics: TopMetric<T>[];
}) {
  const [sel, setSel] = useState(metrics[0].key);
  const metric = metrics.find((m) => m.key === sel) ?? metrics[0];

  const ranked = [...items].sort((a, b) =>
    metric.lowerIsBetter
      ? metric.value(a) - metric.value(b)
      : metric.value(b) - metric.value(a),
  );
  const top = ranked.slice(0, 3);

  const medals = ["#c9a227", "#a9a9a9", "#b07a3c"]; // ouro, prata, bronze

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
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
      </div>

      {/* Top 3 */}
      <ul className="space-y-3">
        {top.map((c, i) => (
          <li
            key={name(c)}
            className="flex items-center gap-3 rounded-xl border border-vpline p-2.5"
          >
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-[#2a1c12]"
              style={{ background: medals[i] }}
            >
              {i + 1}
            </span>
            <div className="h-12 w-20 shrink-0 overflow-hidden rounded-md bg-vp-surface2">
              {thumb(c) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumb(c)}
                  alt={name(c)}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-vp-ink" title={name(c)}>
                {name(c)}
              </p>
              <p className="text-xs text-vp-muted">
                {metric.name}:{" "}
                <span className="font-semibold text-vp-goldDeep">
                  {metric.fmt(metric.value(c))}
                </span>
              </p>
            </div>
            {permalink(c) && (
              <a
                href={permalink(c)}
                target="_blank"
                rel="noopener noreferrer"
                title="Ver publicação"
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-vpline bg-vp-surface2 px-2.5 py-1.5 text-xs font-medium text-vp-ink2 transition hover:border-vp-gold hover:text-vp-goldDeep"
              >
                <IconInstagram size={14} />
                Ver
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
