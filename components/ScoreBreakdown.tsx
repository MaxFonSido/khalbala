"use client";

import { useState } from "react";

export type MatchLine = {
  matchId: string;
  label: string; // "Team A vs Team B"
  guess: string; // "2-1"
  pts: number;
};

export type BonusLine = {
  label: string; // "Champion pick" / "Top Scorer pick"
  guess: string; // team or player name, or "—" if not picked
  pts: number;
};

export default function ScoreBreakdown({
  matches,
  bonuses,
}: {
  matches: MatchLine[];
  bonuses: BonusLine[];
}) {
  const [open, setOpen] = useState(false);

  if (matches.length === 0 && bonuses.length === 0) return null;

  return (
    <div className="mt-2 pt-2 border-t border-surface-border">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between"
      >
        <span className="text-[10px] font-bold text-muted uppercase tracking-wide">
          How they scored
        </span>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={`text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="mt-2 space-y-1">
          {matches.map((m) => (
            <div key={m.matchId} className="flex items-center justify-between text-xs gap-2">
              <span className="text-muted truncate">{m.label}</span>
              <span className="flex items-center gap-2 shrink-0">
                <span className="text-muted-dim tnum">{m.guess}</span>
                <span className={`font-bold tnum ${m.pts > 0 ? "text-gold" : "text-muted-dim"}`}>
                  {m.pts > 0 ? `+${m.pts}` : m.pts}
                </span>
              </span>
            </div>
          ))}
          {bonuses.length > 0 && (
            <div className="pt-1 mt-1 border-t border-surface-border/50 space-y-1">
              {bonuses.map((b) => (
                <div key={b.label} className="flex items-center justify-between text-xs gap-2">
                  <span className="text-muted truncate">{b.label}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="text-muted-dim truncate max-w-[90px]">{b.guess}</span>
                    <span className={`font-bold tnum ${b.pts > 0 ? "text-gold" : "text-muted-dim"}`}>
                      {b.pts > 0 ? `+${b.pts}` : b.pts}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
