"use client";

import { useMemo } from "react";
import type { MetaRow } from "@/lib/types";
import {
  cpc,
  cpm,
  cpv,
  ctr,
  frequency,
  groupByAdset,
  groupByDay,
  groupByObjective,
  num,
  shortAdset,
  sumRows,
  type Totals,
} from "@/lib/metrics";
import {
  formatBRL,
  formatBRLCompact,
  formatCompact,
  formatDayShort,
  formatInt,
  formatPct,
} from "@/lib/format";
import { ChartCard } from "@/components/dash/ChartCard";
import { KpiCard } from "@/components/dash/KpiCard";
import { TimeSeries } from "@/components/charts/TimeSeries";
import { ComboSpendMetric } from "@/components/charts/ComboSpendMetric";
import { MultiBars } from "@/components/charts/MultiBars";
import { Donut } from "@/components/charts/Donut";
import { SelectableBars } from "@/components/charts/SelectableBars";
import { SERIES } from "@/components/charts/theme";
import {
  IconEye,
  IconHeart,
  IconMoney,
  IconPlay,
  IconTarget,
  IconUsers,
} from "@/components/dash/icons";

// Cores de identidade por plataforma (usadas no comparativo).
const P_META = SERIES[0]; // marrom
const P_GOOGLE = SERIES[3]; // verde-azulado

export function Overview({
  meta,
  google,
  platform,
}: {
  meta: MetaRow[];
  google: MetaRow[]; // já normalizado para a forma Meta na página
  platform: string;
}) {
  const gNorm = google;

  // Linhas efetivas da visão conforme a plataforma selecionada no filtro.
  const rows = useMemo(() => {
    if (platform === "Meta") return meta;
    if (platform === "Google") return gNorm;
    return [...meta, ...gNorm];
  }, [platform, meta, gNorm]);

  const t = useMemo(() => sumRows(rows), [rows]);
  const mT = useMemo(() => sumRows(meta), [meta]);
  const gT = useMemo(() => sumRows(gNorm), [gNorm]);

  // Comparativo só faz sentido quando as duas plataformas estão no consolidado.
  const bothPlatforms =
    platform === "all" && meta.length > 0 && gNorm.length > 0;

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

  // Objetivos agrupados por plataforma. No consolidado (Meta + Google) cada
  // objetivo recebe a nota da plataforma de origem (ex.: "VIDEOVIEW · Meta"),
  // já que o mesmo objetivo pode existir nos dois canais.
  const objectiveGroups = useMemo(() => {
    const build = (rs: MetaRow[], plat: string) =>
      groupByObjective(rs).map((g) => ({ ...g, platform: plat }));
    if (platform === "Meta") return build(meta, "Meta");
    if (platform === "Google") return build(gNorm, "Google");
    return [...build(meta, "Meta"), ...build(gNorm, "Google")];
  }, [platform, meta, gNorm]);

  const byObjective = useMemo(
    () =>
      objectiveGroups.map((g, i) => ({
        label: bothPlatforms ? `${g.key} · ${g.platform}` : g.key,
        value: +g.totals.spend.toFixed(2),
        color: SERIES[i % SERIES.length],
      })),
    [objectiveGroups, bothPlatforms],
  );

  // Investimento por dia empilhado por plataforma (comparativo temporal).
  const spendByPlatform = useMemo(() => {
    if (!bothPlatforms) return [];
    const map = new Map<string, { Meta: number; Google: number }>();
    for (const r of meta) {
      const d = r.date.slice(0, 10);
      const e = map.get(d) ?? { Meta: 0, Google: 0 };
      e.Meta += num(r.spend);
      map.set(d, e);
    }
    for (const r of gNorm) {
      const d = r.date.slice(0, 10);
      const e = map.get(d) ?? { Meta: 0, Google: 0 };
      e.Google += num(r.spend);
      map.set(d, e);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([d, v]) => ({
        label: formatDayShort(d + "T00:00:00Z"),
        Meta: +v.Meta.toFixed(2),
        Google: +v.Google.toFixed(2),
      }));
  }, [bothPlatforms, meta, gNorm]);

  // Impressions per day split by adset (stacked).
  const adsetKeys = useMemo(
    () => groupByAdset(rows).map((g) => g.key),
    [rows],
  );
  const stackedByDay = useMemo(() => {
    const days = groupByDay(rows);
    return days.map((d) => {
      const row: Record<string, number | string> = {
        label: formatDayShort(d.key + "T00:00:00Z"),
      };
      for (const ak of adsetKeys) {
        const sub = d.rows.filter((r) => shortAdset(r.adset_name) === ak);
        row[ak] = sumRows(sub).impressions;
      }
      return row;
    });
  }, [rows, adsetKeys]);

  const hasLeads = t.leads >= 1;
  const showReach = platform !== "Google" && t.reach >= 1;

  return (
    <div className="space-y-6">
      {/* KPI grid — indicadores principais, com custos/taxas como apoio */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <KpiCard
          label="Investimento"
          value={formatBRL(t.spend)}
          hint={`CPC ${formatBRL(cpc(t))} · CPM ${formatBRL(cpm(t))}`}
          icon={<IconMoney size={18} />}
          accent="var(--series-1)"
          emphasis
        />
        <KpiCard
          label="Impressões"
          value={formatInt(t.impressions)}
          hint={`CTR ${formatPct(ctr(t))}`}
          icon={<IconEye size={18} />}
          accent="var(--series-4)"
          emphasis
        />
        {showReach ? (
          <KpiCard
            label="Alcance"
            value={formatInt(t.reach)}
            hint={`Frequência ${frequency(t).toFixed(2)}×`}
            icon={<IconUsers size={18} />}
            accent="var(--series-2)"
            emphasis
          />
        ) : (
          <KpiCard
            label="Cliques"
            value={formatInt(t.clicks)}
            hint={`CPC ${formatBRL(cpc(t))}`}
            icon={<IconUsers size={18} />}
            accent="var(--series-2)"
            emphasis
          />
        )}
        <KpiCard
          label="Engajamento"
          value={formatInt(t.postEngagement)}
          hint={
            t.reactions >= 1
              ? `${formatInt(t.reactions)} reações`
              : `${formatPct(t.impressions > 0 ? t.postEngagement / t.impressions : 0)} das impressões`
          }
          icon={<IconHeart size={18} />}
          accent="var(--series-6)"
          emphasis
        />
        <KpiCard
          label="Visualizações"
          value={formatInt(t.videoViews)}
          hint={`CPV ${formatBRL(cpv(t))}`}
          icon={<IconPlay size={18} />}
          accent="var(--series-5)"
          emphasis
        />
        {/* Conversão só aparece quando existe (Meta). Google não expõe. */}
        {hasLeads && (
          <KpiCard
            label="Leads"
            value={formatInt(t.leads)}
            accent="var(--good)"
            icon={<IconTarget size={18} />}
            emphasis
          />
        )}
      </div>

      {/* Comparativo entre plataformas — só no consolidado com Meta + Google */}
      {bothPlatforms && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ChartCard
            title="Investimento por plataforma"
            subtitle="Distribuição do gasto entre canais"
          >
            <Donut
              data={[
                { label: "Meta", value: +mT.spend.toFixed(2), color: P_META },
                { label: "Google", value: +gT.spend.toFixed(2), color: P_GOOGLE },
              ]}
              fmt={formatBRL}
              height={240}
              legend="bottom"
              centerValue={formatBRL(t.spend)}
              centerLabel="Total"
            />
          </ChartCard>
          <ChartCard
            title="Comparativo de métricas"
            subtitle="Meta (Instagram/Facebook) x Google (YouTube)"
            className="lg:col-span-2"
          >
            <PlatformCompare mT={mT} gT={gT} tT={t} />
          </ChartCard>
        </div>
      )}

      {/* Investimento por dia por plataforma (só no consolidado) */}
      {bothPlatforms && (
        <ChartCard
          title="Investimento por dia e plataforma"
          subtitle="Barras empilhadas: contribuição diária de cada canal"
        >
          <MultiBars
            data={spendByPlatform}
            series={[
              { key: "Meta", name: "Meta", color: P_META },
              { key: "Google", name: "Google", color: P_GOOGLE },
            ]}
            fmt={formatBRLCompact}
            stacked
            height={260}
          />
        </ChartCard>
      )}

      {/* Row: objective share (left) + spend vs metric (right) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Investimento por objetivo"
          subtitle={
            bothPlatforms
              ? "Gasto por objetivo · com a plataforma de origem"
              : "Distribuição do gasto"
          }
        >
          <Donut
            data={byObjective}
            fmt={formatBRL}
            height={260}
            legend="bottom"
            centerValue={formatBRL(t.spend)}
            centerLabel="Total"
          />
        </ChartCard>
        <ChartCard
          title="Investimento x métrica por dia"
          subtitle="Barras: investimento (R$) · Linha: métrica selecionada"
          className="lg:col-span-2"
        >
          <ComboSpendMetric
            data={byDay}
            spendFmt={formatBRLCompact}
            metrics={[
              { key: "impressions", name: "Impressões", color: SERIES[3], fmt: formatCompact },
              { key: "reach", name: "Alcance", color: SERIES[1], fmt: formatCompact },
              { key: "clicks", name: "Cliques", color: SERIES[2], fmt: formatInt },
              { key: "videoViews", name: "Video Views", color: SERIES[4], fmt: formatCompact },
              { key: "postEngagement", name: "Engajamento", color: SERIES[5], fmt: formatCompact },
              { key: "ctr", name: "CTR (%)", color: SERIES[2], fmt: (v) => `${v.toFixed(2)}%` },
              { key: "cpm", name: "CPM (R$)", color: SERIES[0], fmt: formatBRL },
            ]}
          />
        </ChartCard>
      </div>

      {/* Full-width reach vs impressions trend */}
      <ChartCard
        title="Alcance x Impressões por dia"
        subtitle="Volume de entrega diária"
      >
        <TimeSeries
          data={byDay}
          series={[
            { key: "impressions", name: "Impressões", color: SERIES[3] },
            { key: "reach", name: "Alcance", color: SERIES[1] },
          ]}
          fmt={formatCompact}
          mode="line"
          height={300}
        />
      </ChartCard>

      {/* Row: stacked adset + metric by objective */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Impressões por público (dia)"
          subtitle="Empilhado por conjunto de anúncios"
        >
          <MultiBars
            data={stackedByDay}
            series={adsetKeys.map((k, i) => ({
              key: k,
              name: k,
              color: SERIES[i % SERIES.length],
            }))}
            fmt={formatCompact}
            stacked
          />
        </ChartCard>
        <ChartCard
          title="Métrica por objetivo"
          subtitle="Compare os objetivos de campanha pela métrica escolhida"
        >
          <SelectableBars
            items={objectiveGroups}
            label={(g) => (bothPlatforms ? `${g.key} · ${g.platform}` : g.key)}
            height={220}
            metrics={[
              { key: "spend", name: "Investimento (R$)", fmt: formatBRL, value: (g) => g.totals.spend },
              { key: "impr", name: "Impressões", fmt: formatCompact, value: (g) => g.totals.impressions },
              { key: "reach", name: "Alcance", fmt: formatCompact, value: (g) => g.totals.reach },
              { key: "clicks", name: "Cliques", fmt: formatInt, value: (g) => g.totals.clicks },
              { key: "views", name: "Video Views", fmt: formatCompact, value: (g) => g.totals.videoViews },
            ]}
          />
        </ChartCard>
      </div>
    </div>
  );
}

// Tabela comparativa Meta x Google x Total. Volumes somam; taxas/custos são
// recalculados sobre o consolidado (não somam).
function PlatformCompare({
  mT,
  gT,
  tT,
}: {
  mT: Totals;
  gT: Totals;
  tT: Totals;
}) {
  const rows: { k: string; m: string; g: string; t: string }[] = [
    {
      k: "Investimento",
      m: formatBRL(mT.spend),
      g: formatBRL(gT.spend),
      t: formatBRL(tT.spend),
    },
    {
      k: "Impressões",
      m: formatCompact(mT.impressions),
      g: formatCompact(gT.impressions),
      t: formatCompact(tT.impressions),
    },
    {
      k: "Cliques",
      m: formatInt(mT.clicks),
      g: formatInt(gT.clicks),
      t: formatInt(tT.clicks),
    },
    {
      k: "Visualizações de vídeo",
      m: formatCompact(mT.videoViews),
      g: formatCompact(gT.videoViews),
      t: formatCompact(tT.videoViews),
    },
    {
      k: "Engajamento",
      m: formatCompact(mT.postEngagement),
      g: formatCompact(gT.postEngagement),
      t: formatCompact(tT.postEngagement),
    },
    {
      k: "CTR",
      m: formatPct(ctr(mT)),
      g: formatPct(ctr(gT)),
      t: formatPct(ctr(tT)),
    },
    {
      k: "CPM",
      m: formatBRL(cpm(mT)),
      g: formatBRL(cpm(gT)),
      t: formatBRL(cpm(tT)),
    },
    {
      k: "CPV",
      m: formatBRL(cpv(mT)),
      g: formatBRL(cpv(gT)),
      t: formatBRL(cpv(tT)),
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-vp-muted">
            <th className="pb-3 text-left font-medium">Métrica</th>
            <th className="pb-3 text-right font-medium">
              <span className="inline-flex items-center justify-end gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-sm"
                  style={{ background: P_META }}
                />
                Meta
              </span>
            </th>
            <th className="pb-3 text-right font-medium">
              <span className="inline-flex items-center justify-end gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-sm"
                  style={{ background: P_GOOGLE }}
                />
                Google
              </span>
            </th>
            <th className="pb-3 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.k} className="border-t border-vpline">
              <td className="py-2.5 text-left text-vp-ink2">{r.k}</td>
              <td className="py-2.5 text-right tabular-nums text-vp-ink">
                {r.m}
              </td>
              <td className="py-2.5 text-right tabular-nums text-vp-ink">
                {r.g}
              </td>
              <td className="py-2.5 text-right font-semibold tabular-nums text-vp-ink">
                {r.t}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-vp-muted">
        Volumes somam entre plataformas; taxas e custos (CTR, CPM, CPV) são
        recalculados sobre o consolidado. Alcance, leads e reações não são
        expostos pelo Google Ads.
      </p>
    </div>
  );
}
