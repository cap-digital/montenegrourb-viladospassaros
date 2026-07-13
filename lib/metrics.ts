import type { MetaRow } from "./types";

// ---- Coercion --------------------------------------------------------------

export function num(v: unknown): number {
  if (v === null || v === undefined || v === "") return 0;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return isFinite(n) ? n : 0;
}

// ---- Aggregated totals -----------------------------------------------------

export interface Totals {
  rows: number;
  spend: number;
  clicks: number;
  linkClicks: number;
  impressions: number;
  reach: number;
  postEngagement: number;
  thruplay: number;
  videoViews: number;
  p25: number;
  p50: number;
  p75: number;
  p100: number;
  reactions: number;
  comments: number;
  saves: number;
  leads: number;
  messaging: number;
}

const EMPTY: Totals = {
  rows: 0,
  spend: 0,
  clicks: 0,
  linkClicks: 0,
  impressions: 0,
  reach: 0,
  postEngagement: 0,
  thruplay: 0,
  videoViews: 0,
  p25: 0,
  p50: 0,
  p75: 0,
  p100: 0,
  reactions: 0,
  comments: 0,
  saves: 0,
  leads: 0,
  messaging: 0,
};

export function sumRows(rows: MetaRow[]): Totals {
  const t: Totals = { ...EMPTY };
  for (const r of rows) {
    t.rows += 1;
    t.spend += num(r.spend);
    t.clicks += num(r.clicks);
    t.linkClicks += num(r.actions_link_click);
    t.impressions += num(r.impressions);
    t.reach += num(r.reach);
    t.postEngagement += num(r.actions_post_engagement);
    t.thruplay += num(r.video_thruplay_watched_actions_video_view);
    t.videoViews += num(r.actions_video_view);
    t.p25 += num(r.video_p25_watched_actions_video_view);
    t.p50 += num(r.video_p50_watched_actions_video_view);
    t.p75 += num(r.video_p75_watched_actions_video_view);
    t.p100 += num(r.video_p100_watched_actions_video_view);
    t.reactions += num(r.actions_post_reaction);
    t.comments += num(r.actions_comment);
    t.saves += num(r.actions_onsite_conversion_post_save);
    t.leads +=
      num(r.actions_lead) +
      num(r.actions_offsite_conversion_fb_pixel_lead) +
      num(r.actions_onsite_conversion_lead_grouped);
    t.messaging += num(
      r.actions_onsite_conversion_messaging_conversation_started_7d,
    );
  }
  return t;
}

// ---- Derived rate / cost metrics (guard against divide-by-zero) ------------

const div = (a: number, b: number) => (b > 0 ? a / b : 0);

export const ctr = (t: Totals) => div(t.clicks, t.impressions); // ratio
export const ctrLink = (t: Totals) => div(t.linkClicks, t.impressions);
export const cpc = (t: Totals) => div(t.spend, t.clicks);
export const cpcLink = (t: Totals) => div(t.spend, t.linkClicks);
export const cpm = (t: Totals) => div(t.spend, t.impressions) * 1000;
export const cpv = (t: Totals) => div(t.spend, t.videoViews);
export const costPerThruplay = (t: Totals) => div(t.spend, t.thruplay);
export const frequency = (t: Totals) => div(t.impressions, t.reach);
export const engagementRate = (t: Totals) =>
  div(t.postEngagement, t.impressions);
// A API não expõe mais "video plays" (autoplay); usamos visualizações de 3s
// (actions_video_view) como base do vídeo e impressões para a taxa de "fisgada".
export const hookRate = (t: Totals) => div(t.videoViews, t.impressions); // 3s view rate
export const holdRate = (t: Totals) => div(t.p100, t.videoViews); // concluíram / viram 3s
export const vtr = (t: Totals) => div(t.thruplay, t.videoViews); // thruplay / views 3s

// ---- Phase parsing ---------------------------------------------------------

// "[CAP] [FASE 01 - AQUECIMENTO] [ABO] [ALCANCE]" -> "FASE 01 - AQUECIMENTO"
export function parsePhase(campaign: string): string {
  const m = campaign.match(/\[\s*(FASE\s*\d+[^\]]*)\]/i);
  return m ? m[1].trim() : "Sem fase";
}

export function listPhases(rows: MetaRow[]): string[] {
  const s = new Set<string>();
  for (const r of rows) s.add(parsePhase(r.campaign));
  return Array.from(s).sort();
}

// "[CAP] [FASE 01 - AQUECIMENTO] [ABO] [ALCANCE]" -> "ALCANCE"
export function parseObjective(campaign: string): string {
  const parts = campaign.match(/\[([^\]]+)\]/g);
  if (!parts || parts.length === 0) return campaign;
  return parts[parts.length - 1].replace(/[[\]]/g, "").trim();
}

// "[CONSUMIDOR FINAL] [HM] [25+] [INSTA] [AUTO]" -> "Consumidor Final"
export function shortAdset(adset: string): string {
  const m = adset.match(/\[([^\]]+)\]/);
  if (!m) return adset;
  return m[1]
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/Incorp\./i, "Incorp.");
}

// "[AD] VIDEO TEASER - CORRETOR - 10.07" -> "Video Teaser - Corretor"
export function shortCreative(ad: string): string {
  return ad
    .replace(/^\[AD\]\s*/i, "")
    .replace(/\s*-\s*\d{2}\.\d{2}\s*$/i, "")
    .trim();
}

// ---- Filtering -------------------------------------------------------------

export interface Filter {
  from?: string; // ISO date (inclusive), compared on the day portion
  to?: string;
  phase?: string; // "all" or a phase label
}

function dayOf(iso: string): string {
  return iso.slice(0, 10); // YYYY-MM-DD
}

export function filterRows(rows: MetaRow[], f: Filter): MetaRow[] {
  return rows.filter((r) => {
    const d = dayOf(r.date);
    if (f.from && d < f.from) return false;
    if (f.to && d > f.to) return false;
    if (f.phase && f.phase !== "all" && parsePhase(r.campaign) !== f.phase)
      return false;
    return true;
  });
}

export function dateRange(rows: MetaRow[]): { min: string; max: string } {
  let min = "9999-99-99";
  let max = "0000-00-00";
  for (const r of rows) {
    const d = dayOf(r.date);
    if (d < min) min = d;
    if (d > max) max = d;
  }
  if (rows.length === 0) return { min: "", max: "" };
  return { min, max };
}

// ---- Group-by helpers ------------------------------------------------------

export interface Group {
  key: string;
  rows: MetaRow[];
  totals: Totals;
}

function groupBy(rows: MetaRow[], keyFn: (r: MetaRow) => string): Group[] {
  const map = new Map<string, MetaRow[]>();
  for (const r of rows) {
    const k = keyFn(r);
    const arr = map.get(k);
    if (arr) arr.push(r);
    else map.set(k, [r]);
  }
  return Array.from(map.entries()).map(([key, rs]) => ({
    key,
    rows: rs,
    totals: sumRows(rs),
  }));
}

export const groupByDay = (rows: MetaRow[]) =>
  groupBy(rows, (r) => dayOf(r.date)).sort((a, b) => a.key.localeCompare(b.key));

export const groupByCampaign = (rows: MetaRow[]) =>
  groupBy(rows, (r) => r.campaign);

export const groupByObjective = (rows: MetaRow[]) =>
  groupBy(rows, (r) => parseObjective(r.campaign));

export const groupByAdset = (rows: MetaRow[]) =>
  groupBy(rows, (r) => shortAdset(r.adset_name));

export const groupByCreative = (rows: MetaRow[]) =>
  groupBy(rows, (r) => r.ad_name);

const AGE_ORDER = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+", "Unknown"];

export const groupByAge = (rows: MetaRow[]) =>
  groupBy(rows, (r) => r.age || "Unknown").sort(
    (a, b) => AGE_ORDER.indexOf(a.key) - AGE_ORDER.indexOf(b.key),
  );

export const groupByGender = (rows: MetaRow[]) =>
  groupBy(rows, (r) => r.gender || "unknown");

// Age × gender matrix for the heatmap.
export interface HeatCell {
  age: string;
  gender: string;
  value: number;
}
export function ageGenderMatrix(
  rows: MetaRow[],
  metric: (t: Totals) => number,
): { ages: string[]; genders: string[]; cells: HeatCell[]; max: number } {
  const genders = ["female", "male"];
  const ages = AGE_ORDER.filter((a) => a !== "Unknown");
  const cells: HeatCell[] = [];
  let max = 0;
  for (const age of ages) {
    for (const gender of genders) {
      const sub = rows.filter(
        (r) => (r.age || "Unknown") === age && r.gender === gender,
      );
      const value = metric(sumRows(sub));
      max = Math.max(max, value);
      cells.push({ age, gender, value });
    }
  }
  return { ages, genders, cells, max };
}
