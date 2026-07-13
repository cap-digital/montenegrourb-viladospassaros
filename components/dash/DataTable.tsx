"use client";

import { useState } from "react";

export interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "right";
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => number | string;
}

export function DataTable<T>({
  columns,
  rows,
  initialSort,
}: {
  columns: Column<T>[];
  rows: T[];
  initialSort?: { key: string; dir: "asc" | "desc" };
}) {
  const [sort, setSort] = useState(initialSort);

  const sorted = [...rows];
  if (sort) {
    const col = columns.find((c) => c.key === sort.key);
    if (col?.sortValue) {
      sorted.sort((a, b) => {
        const av = col.sortValue!(a);
        const bv = col.sortValue!(b);
        const cmp =
          typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av).localeCompare(String(bv));
        return sort.dir === "asc" ? cmp : -cmp;
      });
    }
  }

  const toggle = (key: string) => {
    const col = columns.find((c) => c.key === key);
    if (!col?.sortValue) return;
    setSort((s) =>
      s?.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "desc" },
    );
  };

  return (
    <div className="vp-scroll overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-vpline">
            {columns.map((c) => (
              <th
                key={c.key}
                onClick={() => toggle(c.key)}
                className={`whitespace-nowrap px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-vp-muted ${
                  c.align === "right" ? "text-right" : "text-left"
                } ${c.sortValue ? "cursor-pointer select-none hover:text-vp-ink2" : ""}`}
              >
                <span className="inline-flex items-center gap-1">
                  {c.header}
                  {sort?.key === c.key && (
                    <span className="text-vp-goldBright">
                      {sort.dir === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={i}
              className="border-b border-vpline transition hover:bg-vp-surface2"
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`whitespace-nowrap px-3 py-2.5 ${
                    c.align === "right"
                      ? "text-right tabular-nums text-vp-ink"
                      : "text-left text-vp-ink2"
                  }`}
                >
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
