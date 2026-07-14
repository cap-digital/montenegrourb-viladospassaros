"use client";

import { useMemo } from "react";
import type { MetaRow } from "@/lib/types";
import {
  cpc,
  cpm,
  cpv,
  ctr,
  ctrLink,
  costPerThruplay,
  groupByAdset,
  groupByCampaign,
  groupByCreative,
  groupByDay,
  holdRate,
  hookRate,
  parseObjective,
  shortCreative,
  sumRows,
  vtr,
  type Totals,
} from "@/lib/metrics";
import {
  formatBRL,
  formatCompact,
  formatDayShort,
  formatInt,
  formatPct,
} from "@/lib/format";
import { ChartCard } from "@/components/dash/ChartCard";
import { KpiCard } from "@/components/dash/KpiCard";
import { InfoHint } from "@/components/dash/InfoHint";
import { DataTable, type Column } from "@/components/dash/DataTable";
import { Funnel } from "@/components/charts/Funnel";
import { IndexedLines } from "@/components/charts/IndexedLines";
import { SelectableBars } from "@/components/charts/SelectableBars";
import { TopCreatives } from "@/components/charts/TopCreatives";
import { SERIES } from "@/components/charts/theme";
import {
  IconChat,
  IconClick,
  IconEye,
  IconHeart,
  IconPlay,
} from "@/components/dash/icons";

interface AdsetRow {
  adset: string;
  objective: string;
  totals: Totals;
}

export function MetaTab({ rows }: { rows: MetaRow[] }) {
  const t = useMemo(() => sumRows(rows), [rows]);

  // Funil de retenção baseado em visualizações de 3s (video_play/autoplay é
  // inflado e faz os quartis parecerem zerados).
  const funnel = useMemo(
    () => [
      { label: "Visualizações (3s)", value: t.videoViews },
      { label: "25% assistido", value: t.p25 },
      { label: "50% assistido", value: t.p50 },
      { label: "75% assistido", value: t.p75 },
      { label: "100% assistido", value: t.p100 },
    ],
    [t],
  );

  // Investimento por dia + métricas (para o gráfico combinado).
  const byDay = useMemo(
    () =>
      groupByDay(rows).map((g) => ({
        label: formatDayShort(g.key + "T00:00:00Z"),
        spend: +g.totals.spend.toFixed(2),
        impressions: g.totals.impressions,
        reach: g.totals.reach,
        clicks: g.totals.clicks,
        videoViews: g.totals.videoViews,
        postEngagement: g.totals.postEngagement,
        ctr: +(ctr(g.totals) * 100).toFixed(3),
        cpm: +cpm(g.totals).toFixed(2),
      })),
    [rows],
  );


  // Conjuntos de anúncios (para o comparativo dinâmico de custos/taxas).
  const adsetGroups = useMemo(() => groupByAdset(rows), [rows]);

  // Criativos (para o Top 3).
  const creatives = useMemo(
    () =>
      groupByCreative(rows).map((g) => ({
        name: shortCreative(g.key),
        thumb: g.rows.find((r) => r.thumbnail_url)?.thumbnail_url ?? "",
        permalink:
          g.rows.find((r) => r.instagram_permalink_url)
            ?.instagram_permalink_url ?? "",
        totals: g.totals,
      })),
    [rows],
  );

  // Detailed table: one row per campaign × adset.
  const tableRows: AdsetRow[] = useMemo(() => {
    const out: AdsetRow[] = [];
    for (const camp of groupByCampaign(rows)) {
      const objective = parseObjective(camp.key);
      for (const as of groupByAdset(camp.rows)) {
        out.push({ adset: as.key, objective, totals: as.totals });
      }
    }
    return out;
  }, [rows]);

  const cols: Column<AdsetRow>[] = [
    {
      key: "adset",
      header: "Conjunto",
      render: (r) => (
        <span className="font-medium text-vp-ink">{r.adset}</span>
      ),
      sortValue: (r) => r.adset,
    },
    {
      key: "obj",
      header: "Objetivo",
      render: (r) => r.objective,
      sortValue: (r) => r.objective,
    },
    {
      key: "spend",
      header: "Investido",
      align: "right",
      render: (r) => formatBRL(r.totals.spend),
      sortValue: (r) => r.totals.spend,
    },
    {
      key: "impr",
      header: "Impressões",
      align: "right",
      render: (r) => formatInt(r.totals.impressions),
      sortValue: (r) => r.totals.impressions,
    },
    {
      key: "reach",
      header: "Alcance",
      align: "right",
      render: (r) => formatInt(r.totals.reach),
      sortValue: (r) => r.totals.reach,
    },
    {
      key: "ctr",
      header: "CTR",
      align: "right",
      render: (r) => formatPct(ctr(r.totals)),
      sortValue: (r) => ctr(r.totals),
    },
    {
      key: "cpc",
      header: "CPC",
      align: "right",
      render: (r) => formatBRL(cpc(r.totals)),
      sortValue: (r) => cpc(r.totals),
    },
    {
      key: "cpm",
      header: "CPM",
      align: "right",
      render: (r) => formatBRL(cpm(r.totals)),
      sortValue: (r) => cpm(r.totals),
    },
    {
      key: "cpv",
      header: "CPV",
      align: "right",
      render: (r) => formatBRL(cpv(r.totals)),
      sortValue: (r) => cpv(r.totals),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 2 KPIs de clique/vídeo (o resto de engajamento vira componente próprio) */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Cliques no link"
          value={formatInt(t.linkClicks)}
          hint={`CTR link ${formatPct(ctrLink(t))}`}
          accent="var(--series-3)"
          icon={<IconClick size={18} />}
          emphasis
        />
        <KpiCard
          label="ThruPlays"
          value={formatInt(t.thruplay)}
          hint={`Custo ${formatBRL(costPerThruplay(t))}`}
          accent="var(--series-4)"
          icon={<IconPlay size={18} />}
          emphasis
        />
        <KpiCard
          label="Visualizações"
          value={formatInt(t.videoViews)}
          hint={`CPV ${formatBRL(cpv(t))}`}
          accent="var(--series-5)"
          icon={<IconPlay size={18} />}
          emphasis
        />
        <KpiCard
          label="Frequência"
          value={`${(t.reach > 0 ? t.impressions / t.reach : 0).toFixed(2)}×`}
          hint={`CPM ${formatBRL(cpm(t))}`}
          accent="var(--series-2)"
          icon={<IconEye size={18} />}
          emphasis
        />
      </div>

      {/* Combo (investimento x métrica) + Engajamento */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Evolução indexada: investimento x métrica"
          subtitle="Crescimento relativo dia a dia (base 100 no 1º dia)"
          className="lg:col-span-2"
        >
          <IndexedLines
            data={byDay}
            spendFmt={formatBRL}
            metrics={[
              { key: "impressions", name: "Impressões", color: SERIES[3], fmt: formatCompact },
              { key: "reach", name: "Alcance", color: SERIES[1], fmt: formatCompact },
              { key: "clicks", name: "Cliques", color: SERIES[2], fmt: formatInt },
              { key: "videoViews", name: "Video Views", color: SERIES[4], fmt: formatCompact },
              { key: "postEngagement", name: "Engajamento", color: SERIES[5], fmt: formatCompact },
              { key: "cpm", name: "CPM (R$)", color: SERIES[0], fmt: formatBRL },
            ]}
          />
        </ChartCard>
        <ChartCard title="Engajamento" subtitle="Interações com as publicações">
          <EngagementBreakdown t={t} />
        </ChartCard>
      </div>

      {/* Detailed table (movido para cima do funil) */}
      <ChartCard
        title="Detalhamento por conjunto"
        subtitle="Métricas e custos calculados — clique no cabeçalho para ordenar"
      >
        <DataTable
          columns={cols}
          rows={tableRows}
          initialSort={{ key: "spend", dir: "desc" }}
        />
      </ChartCard>

      {/* Funnel + single video summary */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Funil de retenção de vídeo"
          subtitle="Da visualização de 3s até 100% assistido"
          className="lg:col-span-2"
        >
          <Funnel stages={funnel} />
        </ChartCard>
        <ChartCard
          title="Qualidade do vídeo"
          subtitle="Eficiência e retenção"
          right={
            <InfoHint
              items={[
                {
                  term: "Hook rate",
                  desc: "% das impressões que viraram visualização de 3s — mede o poder de “fisgada” do vídeo nos primeiros segundos.",
                },
                {
                  term: "Hold rate",
                  desc: "Dos que assistiram 3s, % que chegou ao fim (100%) — mede a retenção até o final.",
                },
                {
                  term: "Taxa ThruPlay",
                  desc: "Dos que viram 3s, % que assistiu ao ThruPlay (15s ou vídeo completo).",
                },
                {
                  term: "CPV",
                  desc: "Custo por visualização de vídeo (investimento ÷ video views).",
                },
              ]}
            />
          }
        >
          <div className="flex h-full flex-col justify-center gap-4 py-2">
            <div>
              <p className="text-4xl font-semibold tabular-nums text-vp-ink">
                {formatCompact(t.videoViews)}
              </p>
              <p className="mt-1 text-xs text-vp-muted">Video Views (3s)</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="CPV" value={formatBRL(cpv(t))} />
              <MiniStat label="Hook rate" value={formatPct(hookRate(t))} />
              <MiniStat label="Hold rate" value={formatPct(holdRate(t))} />
              <MiniStat label="Taxa ThruPlay" value={formatPct(vtr(t))} />
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Dynamic costs / rates by adset */}
      <ChartCard
        title="Custos e taxas por conjunto"
        subtitle="Escolha a métrica para comparar os conjuntos de anúncios"
      >
        <SelectableBars
          items={adsetGroups}
          label={(g) => g.key}
          height={200}
          metrics={[
            { key: "cpm", name: "CPM (R$)", fmt: formatBRL, value: (g) => cpm(g.totals), lowerIsBetter: true },
            { key: "cpc", name: "CPC (R$)", fmt: formatBRL, value: (g) => cpc(g.totals), lowerIsBetter: true },
            { key: "cpv", name: "CPV (R$)", fmt: formatBRL, value: (g) => cpv(g.totals), lowerIsBetter: true },
            { key: "ctr", name: "CTR (%)", fmt: (v) => `${v.toFixed(2)}%`, value: (g) => ctr(g.totals) * 100 },
            { key: "ctrLink", name: "CTR link (%)", fmt: (v) => `${v.toFixed(2)}%`, value: (g) => ctrLink(g.totals) * 100 },
            { key: "freq", name: "Frequência", fmt: (v) => `${v.toFixed(2)}×`, value: (g) => (g.totals.reach > 0 ? g.totals.impressions / g.totals.reach : 0) },
            { key: "spend", name: "Investimento (R$)", fmt: formatBRL, value: (g) => g.totals.spend },
          ]}
        />
      </ChartCard>

      {/* Top 3 criativos (no final) */}
      <ChartCard
        title="Top 3 criativos"
        subtitle="Melhores peças pela métrica selecionada"
      >
        <TopCreatives
          items={creatives}
          name={(c) => c.name}
          thumb={(c) => c.thumb}
          permalink={(c) => c.permalink}
          metrics={[
            { key: "ctr", name: "CTR", fmt: (v) => `${v.toFixed(2)}%`, value: (c) => ctr(c.totals) * 100 },
            { key: "cpv", name: "CPV", fmt: formatBRL, value: (c) => cpv(c.totals), lowerIsBetter: true },
            { key: "spend", name: "Investimento", fmt: formatBRL, value: (c) => c.totals.spend },
            { key: "impr", name: "Impressões", fmt: formatCompact, value: (c) => c.totals.impressions },
            { key: "views", name: "Video Views", fmt: formatCompact, value: (c) => c.totals.videoViews },
            { key: "clicks", name: "Cliques", fmt: formatInt, value: (c) => c.totals.clicks },
            { key: "eng", name: "Engajamento", fmt: formatCompact, value: (c) => c.totals.postEngagement },
          ]}
        />
      </ChartCard>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-vpline bg-vp-surface2 px-3 py-2">
      <div className="text-[0.65rem] uppercase tracking-wide text-vp-muted">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold tabular-nums text-vp-ink">
        {value}
      </div>
    </div>
  );
}

// Agrupa os tipos de engajamento (reações, comentários, salvamentos) num único
// componente, com o total em destaque e barras proporcionais entre eles.
function EngagementBreakdown({ t }: { t: Totals }) {
  const items = [
    { label: "Reações", value: t.reactions, icon: <IconHeart size={16} />, color: SERIES[5] },
    { label: "Comentários", value: t.comments, icon: <IconChat size={16} />, color: SERIES[3] },
    { label: "Salvamentos", value: t.saves, icon: <IconPlay size={16} />, color: SERIES[1] },
  ];
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="flex h-full flex-col gap-4 py-1">
      <div>
        <p className="text-3xl font-semibold tabular-nums text-vp-ink">
          {formatInt(t.postEngagement)}
        </p>
        <p className="mt-1 text-xs text-vp-muted">Engajamento total nas publicações</p>
      </div>
      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-vp-ink2">
                <span style={{ color: it.color }}>{it.icon}</span>
                {it.label}
              </span>
              <span className="tabular-nums font-semibold text-vp-ink">
                {formatInt(it.value)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-vp-surface2">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max((it.value / max) * 100, 2)}%`,
                  background: it.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
