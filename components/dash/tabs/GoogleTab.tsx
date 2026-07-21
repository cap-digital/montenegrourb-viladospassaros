"use client";

import { useMemo } from "react";
import type { GoogleRow } from "@/lib/types";
import {
  cpc,
  cpm,
  cpv,
  ctr,
  groupByDay,
  normalizeGoogle,
  num,
  sumRows,
  type Totals,
} from "@/lib/metrics";
import {
  formatBRL,
  formatBRLCompact,
  formatCompact,
  formatDayShort,
  formatDec,
  formatInt,
  formatPct,
} from "@/lib/format";
import { ChartCard } from "@/components/dash/ChartCard";
import { KpiCard } from "@/components/dash/KpiCard";
import { InfoHint } from "@/components/dash/InfoHint";
import { EmptyState } from "@/components/dash/ui";
import { Funnel } from "@/components/charts/Funnel";
import { ComboSpendMetric } from "@/components/charts/ComboSpendMetric";
import { SelectableBars } from "@/components/charts/SelectableBars";
import { TopCreatives } from "@/components/charts/TopCreatives";
import { SERIES } from "@/components/charts/theme";
import {
  IconEye,
  IconGoogle,
  IconHeart,
  IconMoney,
  IconPlay,
} from "@/components/dash/icons";

// Extrai o id do vídeo de uma URL do YouTube (watch, shorts, embed, youtu.be).
function ytId(url: string): string {
  const m = url.match(/(?:v=|\/shorts\/|youtu\.be\/|\/embed\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : "";
}
function ytThumb(url: string): string {
  const id = ytId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : url;
}
// millis → "11,9 s"
function formatSec(ms: number): string {
  return `${formatDec(ms / 1000, 1)} s`;
}

interface VideoRow {
  title: string;
  thumb: string;
  url: string;
  watchMs: number;
  totals: Totals;
}

export function GoogleTab({ rows }: { rows: GoogleRow[] }) {
  const norm = useMemo(() => normalizeGoogle(rows), [rows]);
  const t = useMemo(() => sumRows(norm), [norm]);

  // Tempo médio assistido ponderado por impressões (métrica exclusiva do Google).
  const avgWatchMs = useMemo(() => {
    let wsum = 0;
    let isum = 0;
    for (const r of rows) {
      const imp = num(r.impressions);
      wsum += num(r.average_video_watch_time_duration_millis) * imp;
      isum += imp;
    }
    return isum > 0 ? wsum / isum : 0;
  }, [rows]);

  // Entrega por dia para o gráfico combinado.
  const byDay = useMemo(
    () =>
      groupByDay(norm).map((g) => ({
        label: formatDayShort(g.key + "T00:00:00Z"),
        spend: +g.totals.spend.toFixed(2),
        impressions: g.totals.impressions,
        videoViews: g.totals.videoViews,
        clicks: g.totals.clicks,
        engagement: g.totals.postEngagement,
        ctr: +(ctr(g.totals) * 100).toFixed(3),
        cpm: +cpm(g.totals).toFixed(2),
      })),
    [norm],
  );

  // Vídeos veiculados (agrupados pelo título — o feed repete o mesmo ad_name).
  const videos = useMemo<VideoRow[]>(() => {
    const map = new Map<string, GoogleRow[]>();
    for (const r of rows) {
      const key = String(r.video_title || r.ad_name || "—");
      const arr = map.get(key);
      if (arr) arr.push(r);
      else map.set(key, [r]);
    }
    return Array.from(map.entries())
      .map(([title, rs]) => {
        let wsum = 0;
        let isum = 0;
        for (const r of rs) {
          const imp = num(r.impressions);
          wsum += num(r.average_video_watch_time_duration_millis) * imp;
          isum += imp;
        }
        const url = String(rs.find((r) => r.thumbnail_url)?.thumbnail_url ?? "");
        return {
          title,
          thumb: ytThumb(url),
          url,
          watchMs: isum > 0 ? wsum / isum : 0,
          totals: sumRows(normalizeGoogle(rs)),
        };
      })
      .sort((a, b) => b.totals.spend - a.totals.spend);
  }, [rows]);

  // Funil de retenção: reproduções por quartil relativas às impressões.
  const funnel = useMemo(
    () => [
      { label: "Impressões", value: t.impressions },
      { label: "Assistiram 25%", value: t.p25 },
      { label: "Assistiram 50%", value: t.p50 },
      { label: "Assistiram 75%", value: t.p75 },
      { label: "Assistiram 100%", value: t.p100 },
    ],
    [t],
  );

  const viewRate = t.impressions > 0 ? t.videoViews / t.impressions : 0;
  const completion = t.impressions > 0 ? t.p100 / t.impressions : 0;
  const engRate = t.impressions > 0 ? t.postEngagement / t.impressions : 0;

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<IconGoogle size={30} />}
        title="Campanha em breve"
        message="A campanha de Google Ads ainda não está em veiculação — não há dados no período. Assim que os anúncios entrarem no ar, os indicadores aparecerão aqui automaticamente."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs principais — campanha de vídeo (YouTube / TrueView) */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Investimento"
          value={formatBRL(t.spend)}
          hint={`CPM ${formatBRL(cpm(t))} · CPC ${formatBRL(cpc(t))}`}
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
          label="Visualizações"
          value={formatInt(t.videoViews)}
          hint={`TrueView · CPV ${formatBRL(cpv(t))}`}
          icon={<IconPlay size={18} />}
          accent="var(--series-5)"
          emphasis
        />
        <KpiCard
          label="Engajamentos"
          value={formatInt(t.postEngagement)}
          hint={`${formatPct(engRate)} das impressões`}
          icon={<IconHeart size={18} />}
          accent="var(--series-6)"
          emphasis
        />
      </div>

      {/* Funil de retenção + card de qualidade do vídeo */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Funil de retenção de vídeo"
          subtitle="Reproduções por quartil sobre as impressões"
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
                  term: "TrueView",
                  desc: "Visualização contabilizada pelo Google quando o usuário assiste 30s (ou o vídeo todo, se menor) ou interage.",
                },
                {
                  term: "Taxa de view",
                  desc: "Visualizações TrueView ÷ impressões — poder de atração do anúncio.",
                },
                {
                  term: "Conclusão (100%)",
                  desc: "% das impressões em que o vídeo foi assistido até o final.",
                },
                {
                  term: "CPV",
                  desc: "Custo por visualização (investimento ÷ visualizações TrueView).",
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
              <p className="mt-1 text-xs text-vp-muted">Visualizações TrueView</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="CPV" value={formatBRL(cpv(t))} />
              <MiniStat label="Taxa de view" value={formatPct(viewRate)} />
              <MiniStat label="Conclusão (100%)" value={formatPct(completion)} />
              <MiniStat label="Tempo médio" value={formatSec(avgWatchMs)} />
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Entrega por dia */}
      <ChartCard
        title="Investimento x entrega por dia"
        subtitle="Barras: investimento (R$) · Linha: métrica selecionada"
      >
        <ComboSpendMetric
          data={byDay}
          spendFmt={formatBRLCompact}
          metrics={[
            { key: "impressions", name: "Impressões", color: SERIES[3], fmt: formatCompact },
            { key: "videoViews", name: "Visualizações", color: SERIES[4], fmt: formatCompact },
            { key: "engagement", name: "Engajamentos", color: SERIES[5], fmt: formatCompact },
            { key: "clicks", name: "Cliques", color: SERIES[2], fmt: formatInt },
            { key: "ctr", name: "CTR (%)", color: SERIES[2], fmt: (v) => `${v.toFixed(2)}%` },
            { key: "cpm", name: "CPM (R$)", color: SERIES[0], fmt: formatBRL },
          ]}
        />
      </ChartCard>

      {/* Comparativo dinâmico de vídeos */}
      <ChartCard
        title="Comparativo de vídeos"
        subtitle="Escolha a métrica para ranquear as peças"
      >
        <SelectableBars
          items={videos}
          label={(v) => v.title}
          height={220}
          metrics={[
            { key: "views", name: "Visualizações", fmt: formatCompact, value: (v) => v.totals.videoViews },
            { key: "cpv", name: "CPV (R$)", fmt: formatBRL, value: (v) => cpv(v.totals), lowerIsBetter: true },
            { key: "completion", name: "Conclusão 100% (%)", fmt: (x) => `${x.toFixed(1)}%`, value: (v) => (v.totals.impressions > 0 ? (v.totals.p100 / v.totals.impressions) * 100 : 0) },
            { key: "watch", name: "Tempo médio (s)", fmt: (x) => `${x.toFixed(1)} s`, value: (v) => v.watchMs / 1000 },
            { key: "spend", name: "Investimento (R$)", fmt: formatBRL, value: (v) => v.totals.spend },
            { key: "impr", name: "Impressões", fmt: formatCompact, value: (v) => v.totals.impressions },
          ]}
        />
      </ChartCard>

      {/* Top 3 criativos (miniaturas + link para o vídeo) */}
      <ChartCard
        title="Top 3 criativos"
        subtitle="Melhores vídeos pela métrica selecionada"
      >
        <TopCreatives
          items={videos}
          name={(v) => v.title}
          thumb={(v) => v.thumb}
          permalink={(v) => v.url}
          linkLabel="Ver vídeo"
          linkIcon={<IconPlay size={14} />}
          metrics={[
            { key: "views", name: "Visualizações", fmt: formatCompact, value: (v) => v.totals.videoViews },
            { key: "cpv", name: "CPV", fmt: formatBRL, value: (v) => cpv(v.totals), lowerIsBetter: true },
            { key: "completion", name: "Conclusão 100%", fmt: (x) => `${x.toFixed(1)}%`, value: (v) => (v.totals.impressions > 0 ? (v.totals.p100 / v.totals.impressions) * 100 : 0) },
            { key: "watch", name: "Tempo médio", fmt: (x) => `${x.toFixed(1)} s`, value: (v) => v.watchMs / 1000 },
            { key: "spend", name: "Investimento", fmt: formatBRL, value: (v) => v.totals.spend },
            { key: "impr", name: "Impressões", fmt: formatCompact, value: (v) => v.totals.impressions },
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
