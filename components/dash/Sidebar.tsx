"use client";

import Link from "next/link";
import { BirdsMark, VilaLogo } from "@/components/brand/VilaLogo";
import {
  IconCollapse,
  IconCreative,
  IconGoogle,
  IconMeta,
  IconOverview,
} from "./icons";

export type TabId = "overview" | "meta" | "google" | "creativos";

const NAV: { id: TabId; label: string; icon: React.FC<{ size?: number }> }[] = [
  { id: "overview", label: "Visão Geral", icon: IconOverview },
  { id: "meta", label: "Meta Ads", icon: IconMeta },
  { id: "google", label: "Google Ads", icon: IconGoogle },
  { id: "creativos", label: "Criativos", icon: IconCreative },
];

export function Sidebar({
  active,
  onSelect,
  collapsed,
  onToggle,
}: {
  active: TabId;
  onSelect: (t: TabId) => void;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <aside
      className="vp-scroll sticky top-4 z-20 flex h-[calc(100vh-2rem)] flex-col rounded-3xl border border-[var(--sb-line)] bg-sb-bg text-sb-ink transition-[width] duration-300"
      style={{
        width: collapsed ? 84 : 244,
        boxShadow: "0 24px 60px -24px rgba(40,25,15,0.5)",
      }}
    >
      {/* Brand */}
      <div className="flex items-center justify-between px-4 py-5">
        {collapsed ? (
          <div className="mx-auto">
            <BirdsMark size={34} color="var(--sb-gold)" accent="var(--sb-ink)" />
          </div>
        ) : (
          <VilaLogo size="sm" color="var(--sb-ink)" mark="var(--sb-gold)" />
        )}
      </div>

      <div className="mx-4 mb-3 h-px bg-[var(--sb-line)]" />

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1.5 px-3">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              title={item.label}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-[rgba(220,189,130,0.16)] text-sb-gold"
                  : "text-sb-ink2 hover:bg-sb-surface hover:text-sb-ink"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <span
                className={
                  isActive
                    ? "text-sb-gold"
                    : "text-sb-muted group-hover:text-sb-ink"
                }
              >
                <Icon size={20} />
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {isActive && !collapsed && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sb-gold" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer: back link + collapse */}
      <div className="mt-2 space-y-2 px-3 pb-4">
        <Link
          href="/"
          title="Voltar ao início"
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sb-muted transition hover:bg-sb-surface hover:text-sb-ink ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <IconCollapse size={18} />
          {!collapsed && <span>Início</span>}
        </Link>
        <button
          onClick={onToggle}
          className={`flex w-full items-center gap-3 rounded-xl border border-[var(--sb-line)] px-3 py-2.5 text-sm text-sb-ink2 transition hover:bg-sb-surface ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <IconCollapse
            size={18}
            className={collapsed ? "rotate-180 transition" : "transition"}
          />
          {!collapsed && <span>Recolher</span>}
        </button>
      </div>
    </aside>
  );
}
