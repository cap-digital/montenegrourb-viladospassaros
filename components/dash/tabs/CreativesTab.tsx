"use client";

import { useMemo, useState } from "react";
import type { MetaRow } from "@/lib/types";
import {
  cpv,
  ctr,
  groupByCreative,
  holdRate,
  parsePhase,
  shortCreative,
  sumRows,
  type Totals,
} from "@/lib/metrics";
import { formatBRL, formatCompact, formatInt, formatPct } from "@/lib/format";
import { ChartCard } from "@/components/dash/ChartCard";
import { DataTable, type Column } from "@/components/dash/DataTable";
import { SelectableBars } from "@/components/charts/SelectableBars";
import { IconInstagram } from "@/components/dash/icons";

interface Creative {
  name: string;
  thumb: string;
  permalink: string;
  phase: string;
  platform: string;
  totals: Totals;
}

// "FASE 01 - AQUECIMENTO" -> "Fase 01"
function shortPhase(phase: string): string {
  const m = phase.match(/FASE\s*\d+/i);
  return m ? m[0].replace(/\s+/, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : phase;
}

function maxBy(list: Creative[], fn: (c: Creative) => number): Creative | null {
  if (list.length === 0) return null;
  return list.reduce((best, c) => (fn(c) > fn(best) ? c : best), list[0]);
}
function minBy(list: Creative[], fn: (c: Creative) => number): Creative | null {
  if (list.length === 0) return null;
  return list.reduce((best, c) => (fn(c) < fn(best) ? c : best), list[0]);
}

// Constrói a lista de criativos de uma fonte, marcando a plataforma. Ao chegar
// Google (mesma forma analítica), basta passar essas linhas — nada muda aqui.
function buildCreatives(rows: MetaRow[], platform: string): Creative[] {
  return groupByCreative(rows).map((g) => ({
    name: shortCreative(g.key),
    thumb: g.rows.find((r) => r.thumbnail_url)?.thumbnail_url ?? "",
    permalink:
      g.rows.find((r) => r.instagram_permalink_url)
        ?.instagram_permalink_url ?? "",
    phase: shortPhase(parsePhase(g.rows[0]?.campaign ?? "")),
    platform,
    totals: g.totals,
  }));
}

export function CreativesTab({
  rows,
  googleRows = [],
}: {
  rows: MetaRow[];
  googleRows?: MetaRow[];
}) {
  const creatives: Creative[] = useMemo(
    () =>
      [
        ...buildCreatives(rows, "Meta"),
        ...buildCreatives(googleRows, "Google"),
      ].sort((a, b) => b.totals.spend - a.totals.spend),
    [rows, googleRows],
  );

  // ---- Aggregates for the banner + descriptive analytics (Meta + Google) ----
  const t = useMemo(
    () => sumRows([...rows, ...googleRows]),
    [rows, googleRows],
  );
  const withViews = useMemo(
    () => creatives.filter((c) => c.totals.videoViews > 0),
    [creatives],
  );
  const bestCtr = useMemo(() => maxBy(creatives, (c) => ctr(c.totals)), [creatives]);
  const bestCpv = useMemo(() => minBy(withViews, (c) => cpv(c.totals)), [withViews]);
  const mostViews = useMemo(
    () => maxBy(creatives, (c) => c.totals.videoViews),
    [creatives],
  );
  const topSpend = creatives[0] ?? null;

  // Ordenação da galeria de cards (escolhida pelo usuário).
  const SORTS: {
    key: string;
    label: string;
    value: (c: Creative) => number;
    dir: "asc" | "desc";
  }[] = [
    { key: "spend", label: "Investimento", value: (c) => c.totals.spend, dir: "desc" },
    { key: "ctr", label: "CTR", value: (c) => ctr(c.totals), dir: "desc" },
    { key: "cpv", label: "CPV", value: (c) => cpv(c.totals), dir: "asc" },
    { key: "impr", label: "Impressões", value: (c) => c.totals.impressions, dir: "desc" },
    { key: "views", label: "Views", value: (c) => c.totals.videoViews, dir: "desc" },
    { key: "clicks", label: "Cliques", value: (c) => c.totals.clicks, dir: "desc" },
  ];
  const [sortKey, setSortKey] = useState("spend");
  const sortedCreatives = useMemo(() => {
    const s = SORTS.find((x) => x.key === sortKey) ?? SORTS[0];
    return [...creatives].sort((a, b) =>
      s.dir === "asc" ? s.value(a) - s.value(b) : s.value(b) - s.value(a),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creatives, sortKey]);

  const cols: Column<Creative>[] = [
    {
      key: "name",
      header: "Criativo",
      render: (c) => <span className="font-medium text-vp-ink">{c.name}</span>,
      sortValue: (c) => c.name,
    },
    {
      key: "platform",
      header: "Plataforma",
      render: (c) => (
        <span className="inline-flex items-center rounded-full border border-vpline bg-vp-surface2 px-2 py-0.5 text-xs font-medium text-vp-ink2">
          {c.platform}
        </span>
      ),
      sortValue: (c) => c.platform,
    },
    {
      key: "phase",
      header: "Fase",
      render: (c) => c.phase,
      sortValue: (c) => c.phase,
    },
    {
      key: "spend",
      header: "Investido",
      align: "right",
      render: (c) => formatBRL(c.totals.spend),
      sortValue: (c) => c.totals.spend,
    },
    {
      key: "impr",
      header: "Impressões",
      align: "right",
      render: (c) => formatInt(c.totals.impressions),
      sortValue: (c) => c.totals.impressions,
    },
    {
      key: "clicks",
      header: "Cliques",
      align: "right",
      render: (c) => formatInt(c.totals.clicks),
      sortValue: (c) => c.totals.clicks,
    },
    {
      key: "ctr",
      header: "CTR",
      align: "right",
      render: (c) => formatPct(ctr(c.totals)),
      sortValue: (c) => ctr(c.totals),
    },
    {
      key: "views",
      header: "Video Views",
      align: "right",
      render: (c) => formatInt(c.totals.videoViews),
      sortValue: (c) => c.totals.videoViews,
    },
    {
      key: "cpv",
      header: "CPV",
      align: "right",
      render: (c) => formatBRL(cpv(c.totals)),
      sortValue: (c) => cpv(c.totals),
    },
    {
      key: "hold",
      header: "Hold rate",
      align: "right",
      render: (c) => formatPct(holdRate(c.totals)),
      sortValue: (c) => holdRate(c.totals),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Big-number banner (brown strip) */}
      <div
        className="overflow-hidden rounded-2xl border border-[var(--sb-line)] p-5 text-sb-ink sm:p-6"
        style={{
          background:
            "linear-gradient(135deg, #3a2a21 0%, #2e211b 55%, #241914 100%)",
        }}
      >
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-sb-gold">
          Panorama dos criativos
        </p>
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
          <BannerStat
            big={formatInt(creatives.length)}
            label="Criativos ativos"
          />
          <BannerStat
            big={formatBRL(t.spend)}
            label="Investimento distribuído"
          />
          <BannerStat
            big={bestCtr ? formatPct(ctr(bestCtr.totals)) : "—"}
            label="Melhor CTR"
            sub={bestCtr?.name}
          />
          <BannerStat
            big={bestCpv ? formatBRL(cpv(bestCpv.totals)) : "—"}
            label="Menor CPV"
            sub={bestCpv?.name}
          />
          <BannerStat
            big={mostViews ? formatCompact(mostViews.totals.videoViews) : "—"}
            label="Mais visualizado"
            sub={mostViews?.name}
          />
        </div>
      </div>

      {/* Descriptive analytics */}
      <div className="rounded-2xl border border-vpline bg-vp-surface p-5">
        <h3 className="mb-3 text-sm font-semibold tracking-wide text-vp-ink">
          Leitura rápida
        </h3>
        <ul className="space-y-2 text-sm leading-relaxed text-vp-ink2">
          <li className="flex gap-2">
            <span className="text-vp-goldDeep">•</span>
            <span>
              A campanha veicula{" "}
              <strong className="text-vp-ink">{creatives.length} criativos</strong>{" "}
              com investimento total de{" "}
              <strong className="text-vp-ink">{formatBRL(t.spend)}</strong> e CTR
              médio de{" "}
              <strong className="text-vp-ink">{formatPct(ctr(t))}</strong>.
            </span>
          </li>
          {bestCtr && (
            <li className="flex gap-2">
              <span className="text-vp-goldDeep">•</span>
              <span>
                <strong className="text-vp-ink">{bestCtr.name}</strong> lidera em
                engajamento com CTR de{" "}
                <strong className="text-vp-ink">
                  {formatPct(ctr(bestCtr.totals))}
                </strong>{" "}
                — o melhor da campanha.
              </span>
            </li>
          )}
          {bestCpv && (
            <li className="flex gap-2">
              <span className="text-vp-goldDeep">•</span>
              <span>
                Em eficiência de vídeo,{" "}
                <strong className="text-vp-ink">{bestCpv.name}</strong> entrega o
                menor custo por visualização (
                <strong className="text-vp-ink">
                  {formatBRL(cpv(bestCpv.totals))}
                </strong>
                ).
              </span>
            </li>
          )}
          {topSpend && mostViews && (
            <li className="flex gap-2">
              <span className="text-vp-goldDeep">•</span>
              <span>
                <strong className="text-vp-ink">{topSpend.name}</strong> concentra
                o maior investimento, enquanto{" "}
                <strong className="text-vp-ink">{mostViews.name}</strong> acumula o
                maior volume de visualizações (
                {formatCompact(mostViews.totals.videoViews)}).
              </span>
            </li>
          )}
        </ul>
      </div>

      {/* Gallery sort controls */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm text-vp-muted">Ordenar por:</span>
        {SORTS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSortKey(s.key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              sortKey === s.key
                ? "border-vp-gold bg-[rgba(181,132,42,0.14)] text-vp-goldDeep"
                : "border-vpline bg-vp-surface text-vp-ink2 hover:border-vplineStrong"
            }`}
          >
            {s.label}
            {s.dir === "asc" && sortKey === s.key ? " ↑" : ""}
          </button>
        ))}
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sortedCreatives.map((c) => (
          <article
            key={c.name}
            className="overflow-hidden rounded-2xl border border-vpline bg-vp-surface shadow-sm transition hover:border-vplineStrong"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-vp-surface2">
              {c.thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.thumb}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-vp-muted">
                  sem prévia
                </div>
              )}
              <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-vp-gold px-2.5 py-1 text-[0.7rem] font-semibold text-[#2a1c12] shadow">
                  {c.platform}
                </span>
                <span className="rounded-full bg-[#2e211b]/90 px-2.5 py-1 text-[0.7rem] font-semibold text-[#efe6d6] shadow backdrop-blur">
                  {c.phase}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between gap-2">
                <h4
                  className="truncate text-sm font-semibold text-vp-ink"
                  title={c.name}
                >
                  {c.name}
                </h4>
                {c.permalink && (
                  <a
                    href={c.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ver publicação no Instagram"
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-vpline bg-vp-surface2 px-2.5 py-1 text-xs font-medium text-vp-ink2 transition hover:border-vp-gold hover:text-vp-goldDeep"
                  >
                    <IconInstagram size={14} />
                    Ver post
                  </a>
                )}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <Metric label="CTR" value={formatPct(ctr(c.totals))} />
                <Metric label="CPV" value={formatBRL(cpv(c.totals))} />
                <Metric label="Views" value={formatCompact(c.totals.videoViews)} />
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <Metric label="Impr." value={formatCompact(c.totals.impressions)} />
                <Metric label="Alcance" value={formatCompact(c.totals.reach)} />
                <Metric label="Cliques" value={formatInt(c.totals.clicks)} />
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Dynamic ranking */}
      <ChartCard
        title="Ranking de criativos"
        subtitle="Escolha a métrica para ranquear as peças"
      >
        <SelectableBars
          items={creatives}
          label={(c) => c.name}
          height={240}
          metrics={[
            { key: "ctr", name: "CTR (%)", fmt: (v) => `${v.toFixed(2)}%`, value: (c) => ctr(c.totals) * 100 },
            { key: "cpv", name: "CPV (R$)", fmt: formatBRL, value: (c) => cpv(c.totals), lowerIsBetter: true },
            { key: "spend", name: "Investimento (R$)", fmt: formatBRL, value: (c) => c.totals.spend },
            { key: "impr", name: "Impressões", fmt: formatCompact, value: (c) => c.totals.impressions },
            { key: "views", name: "Video Views", fmt: formatCompact, value: (c) => c.totals.videoViews },
            { key: "clicks", name: "Cliques", fmt: formatInt, value: (c) => c.totals.clicks },
          ]}
        />
      </ChartCard>

      {/* Comparison table */}
      <ChartCard
        title="Comparativo de criativos"
        subtitle="Clique no cabeçalho para ordenar"
      >
        <DataTable
          columns={cols}
          rows={creatives}
          initialSort={{ key: "spend", dir: "desc" }}
        />
      </ChartCard>
    </div>
  );
}

function BannerStat({
  big,
  label,
  sub,
}: {
  big: string;
  label: string;
  sub?: string;
}) {
  return (
    <div className="min-w-0">
      <div className="text-2xl font-semibold tabular-nums text-sb-ink sm:text-[1.75rem]">
        {big}
      </div>
      <div className="mt-1 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-sb-gold">
        {label}
      </div>
      {sub && (
        <div className="mt-0.5 truncate text-xs text-sb-ink2" title={sub}>
          {sub}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-vp-surface2 px-2 py-1.5">
      <div className="text-[0.65rem] uppercase tracking-wide text-vp-muted">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold tabular-nums text-vp-ink">
        {value}
      </div>
    </div>
  );
}
