"use client";

import { useState, useRef, useEffect } from "react";

type Player = { name: string; team: string };

type Props = {
  players: Player[];
  value: string;
  onChange: (name: string) => void;
  disabled?: boolean;
};

export default function PlayerSearch({ players, value, onChange, disabled }: Props) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query.length >= 2
    ? players.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.team.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 15)
    : [];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={query}
        disabled={disabled}
        placeholder="Type player name..."
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (!e.target.value) onChange("");
        }}
        onFocus={() => query.length >= 2 && setOpen(true)}
        className="w-full rounded-xl bg-ink border border-surface-border px-4 py-3 text-ink-text placeholder-muted-dim focus:outline-none focus:border-gold text-sm"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-30 left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl bg-surface border border-surface-border shadow-card">
          {filtered.map((p) => (
            <button
              key={`${p.team}-${p.name}`}
              onClick={() => {
                setQuery(p.name);
                onChange(p.name);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-surface-btn active:bg-surface-btn transition-colors border-b border-surface-border last:border-b-0"
            >
              <span className="text-ink-text font-medium">{p.name}</span>
              <span className="text-muted-dim text-xs">{p.team}</span>
            </button>
          ))}
        </div>
      )}
      {open && query.length >= 2 && filtered.length === 0 && (
        <div className="absolute z-30 left-0 right-0 mt-1 rounded-xl bg-surface border border-surface-border shadow-card px-4 py-3 text-center text-xs text-muted">
          No players found for "{query}"
        </div>
      )}
    </div>
  );
}
