"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ApiResponse } from "@/lib/types";
import { dateRange, filterRows, listPhases } from "@/lib/metrics";
import { Sidebar, type TabId } from "@/components/dash/Sidebar";
import { Topbar } from "@/components/dash/Topbar";
import { Filters, toFilter, type FilterState } from "@/components/dash/Filters";
import { SectionTitle } from "@/components/dash/ui";
import { Overview } from "@/components/dash/tabs/Overview";
import { MetaTab } from "@/components/dash/tabs/MetaTab";
import { GoogleTab } from "@/components/dash/tabs/GoogleTab";
import { CreativesTab } from "@/components/dash/tabs/CreativesTab";

const TAB_META: Record<TabId, { title: string; hint: string }> = {
  overview: {
    title: "Visão Geral",
    hint: "Consolidado da campanha no período e fase selecionados",
  },
  meta: {
    title: "Meta Ads",
    hint: "Detalhamento da entrega no Meta Ads (Instagram / Facebook)",
  },
  google: { title: "Google Ads", hint: "Performance da campanha no Google Ads" },
  creativos: { title: "Criativos", hint: "Desempenho por peça criativa" },
};

export default function Dashboard() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tab, setTab] = useState<TabId>("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [filter, setFilter] = useState<FilterState | null>(null);

  // Deep-link the active tab via URL hash (shareable / survives refresh).
  useEffect(() => {
    const h = window.location.hash.replace("#", "");
    if (h === "meta" || h === "google" || h === "creativos" || h === "overview")
      setTab(h);
  }, []);
  const selectTab = useCallback((t: TabId) => {
    setTab(t);
    if (typeof window !== "undefined")
      window.history.replaceState(null, "", `#${t}`);
  }, []);

  const load = useCallback(async (isRefresh: boolean) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/data", { cache: "no-store" });
      const json = (await res.json()) as ApiResponse;
      if (!json.success && (!json.meta || json.meta.length === 0)) {
        throw new Error("Falha ao carregar os dados.");
      }
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  const meta = useMemo(() => data?.meta ?? [], [data]);
  const bounds = useMemo(() => dateRange(meta), [meta]);
  const phases = useMemo(() => listPhases(meta), [meta]);

  // Initialise the filter to the full range once data arrives.
  useEffect(() => {
    if (bounds.min && bounds.max && !filter) {
      setFilter({ from: bounds.min, to: bounds.max, phase: "all" });
    }
  }, [bounds, filter]);

  const filteredMeta = useMemo(
    () => (filter ? filterRows(meta, toFilter(filter)) : meta),
    [meta, filter],
  );

  // Google compartilha a mesma forma analítica — filtra igual quando houver dados.
  const google = useMemo(
    () => (data?.google ?? []) as unknown as typeof meta,
    [data],
  );
  const filteredGoogle = useMemo(
    () => (filter ? filterRows(google, toFilter(filter)) : google),
    [google, filter],
  );

  return (
    <div className="min-h-screen bg-vp-plane text-vp-ink">
      <div className="mx-auto flex max-w-[1600px] gap-4 px-4 pb-8">
        <Sidebar
          active={tab}
          onSelect={selectTab}
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
        />

        <main className="vp-scroll min-w-0 flex-1 py-4">
          <Topbar
            timestamp={data?.timestamp}
            refreshing={refreshing}
            onRefresh={() => load(true)}
          />

          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} onRetry={() => load(true)} />
          ) : (
            <>
              {/* Page title + filters row (filters below the title) */}
              <div className="mb-6">
                <SectionTitle hint={TAB_META[tab].hint}>
                  {TAB_META[tab].title}
                </SectionTitle>
                {filter && bounds.min && tab !== "google" && (
                  <div className="mt-3">
                    <Filters
                      bounds={bounds}
                      phases={phases}
                      value={filter}
                      onChange={setFilter}
                    />
                  </div>
                )}
              </div>

              {tab === "overview" && <Overview rows={filteredMeta} />}
              {tab === "meta" && <MetaTab rows={filteredMeta} />}
              {tab === "google" && <GoogleTab rows={data?.google ?? []} />}
              {tab === "creativos" && (
                <CreativesTab rows={filteredMeta} googleRows={filteredGoogle} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl border border-vpline bg-vp-surface"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="h-72 animate-pulse rounded-2xl border border-vpline bg-vp-surface lg:col-span-2" />
        <div className="h-72 animate-pulse rounded-2xl border border-vpline bg-vp-surface" />
      </div>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-vplineStrong bg-vp-surface p-10 text-center">
      <h3 className="text-lg font-semibold text-vp-ink">
        Não foi possível carregar
      </h3>
      <p className="mt-2 max-w-md text-sm text-vp-ink2">{message}</p>
      <button
        onClick={onRetry}
        className="mt-5 rounded-xl bg-vp-gold px-5 py-2.5 text-sm font-semibold text-vp-plane transition hover:brightness-110"
      >
        Tentar novamente
      </button>
    </div>
  );
}
