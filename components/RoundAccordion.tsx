"use client";

import { useState } from "react";

export default function RoundAccordion({
  label,
  matchCount,
  defaultOpen,
  children,
}: {
  label: string;
  matchCount: number;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg bg-surface px-4 py-3 transition-colors border border-surface-border"
      >
        <span className="text-sm font-bold text-ink-text">{label}</span>
        <span className="flex items-center gap-2">
          <span className="rounded-full bg-surface-btn px-2.5 py-0.5 text-xs font-semibold text-gold">
            {matchCount}
          </span>
          <span
            className={`text-sm text-muted transition-transform ${open ? "rotate-180" : ""}`}
          >
            ▾
          </span>
        </span>
      </button>
      {open && <div className="mt-2 space-y-2.5">{children}</div>}
    </div>
  );
}
