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
  shortAdset,
  sumRows,
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

export function Overview({ rows }: { rows: MetaRow[] }) {
  const t = useMemo(() => sumRows(rows), [rows]);

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

  const byObjective = useMemo(
    () =>
      groupByObjective(rows).map((g, i) => ({
        label: g.key,
        value: +g.totals.spend.toFixed(2),
        color: SERIES[i % SERIES.length],
      })),
    [rows],
  );

  // Objective groups for the dynamic "métrica por objetivo" chart.
  const objectiveGroups = useMemo(() => groupByObjective(rows), [rows]);

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
  const hasMsg = t.messaging >= 1;

  return (
    <div className="space-y-6">
      {/* KPI grid — 5 indicadores principais, com custos/taxas como apoio */}
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
        <KpiCard
          label="Alcance"
          value={formatInt(t.reach)}
          hint={`Frequência ${frequency(t).toFixed(2)}×`}
          icon={<IconUsers size={18} />}
          accent="var(--series-2)"
          emphasis
        />
        <KpiCard
          label="Engajamento"
          value={formatInt(t.postEngagement)}
          hint={`${formatInt(t.reactions)} reações`}
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
        {/* Conditional conversion KPIs — only render when >= 1 */}
        {hasLeads && (
          <KpiCard
            label="Leads"
            value={formatInt(t.leads)}
            accent="var(--good)"
            icon={<IconTarget size={18} />}
            emphasis
          />
        )}
        {hasMsg && (
          <KpiCard
            label="Conversas"
            value={formatInt(t.messaging)}
            accent="var(--good)"
            emphasis
          />
        )}
      </div>

      {/* Row: objective share (left) + spend vs metric (right) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Investimento por objetivo"
          subtitle="Distribuição do gasto"
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
            label={(g) => g.key}
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
