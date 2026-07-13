"use client";

import { useState } from "react";
import { IconInfo } from "./icons";

// Small "i" affordance that reveals term definitions on hover/click.
export function InfoHint({
  items,
}: {
  items: { term: string; desc: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label="Ver definições"
        onClick={() => setOpen((o) => !o)}
        className="flex h-6 w-6 items-center justify-center rounded-full border border-vpline text-vp-muted transition hover:border-vplineStrong hover:text-vp-ink"
      >
        <IconInfo size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-30 w-64 rounded-xl border border-vpline bg-vp-surface p-3 text-left shadow-2xl">
          <ul className="space-y-2.5">
            {items.map((it) => (
              <li key={it.term} className="text-xs">
                <span className="font-semibold text-vp-ink">{it.term}</span>
                <p className="mt-0.5 leading-snug text-vp-ink2">{it.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
