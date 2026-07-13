"use client";

import { formatDateTime } from "@/lib/format";
import { IconRefresh } from "./icons";

export function Topbar({
  timestamp,
  onRefresh,
  refreshing,
}: {
  timestamp?: string;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  return (
    <div className="sticky top-4 z-10 mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-vpline bg-vp-header px-5 py-4 backdrop-blur-md shadow-sm">
      <div className="min-w-0">
        <h1 className="font-serif-display text-2xl font-semibold leading-tight tracking-wide text-vp-ink sm:text-[1.7rem]">
          Dashboard de Performance
        </h1>
        <p className="mt-0.5 text-sm text-vp-ink2">
          Campanha de mídia
          <span className="mx-1.5 text-vp-muted">·</span>
          <span className="font-medium text-vp-goldDeep">Vila dos Pássaros</span>
          <span className="mx-1.5 text-vp-muted">·</span>
          Meta &amp; Google Ads
        </p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <button
          onClick={onRefresh}
          disabled={refreshing}
          title="Atualizar dados"
          className="flex items-center gap-2 rounded-xl border border-vpline bg-vp-surface px-3.5 py-2 text-sm font-medium text-vp-ink transition hover:border-vplineStrong hover:bg-vp-surface2 disabled:opacity-60"
        >
          <IconRefresh
            size={15}
            className={
              refreshing ? "animate-spin text-vp-goldDeep" : "text-vp-muted"
            }
          />
          <span className="hidden sm:inline">
            {refreshing ? "Atualizando…" : "Atualizar"}
          </span>
        </button>
        {timestamp && (
          <p className="text-[0.72rem] text-vp-muted">
            Última atualização: {formatDateTime(timestamp)}
          </p>
        )}
      </div>
    </div>
  );
}
