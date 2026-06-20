"use client";

import { useState } from "react";

type Props = {
  initialChampion: string | null;
  initialTopScorer: string | null;
  locked: boolean;
  teams: string[];
};

export default function BonusForm({ initialChampion, initialTopScorer, locked, teams }: Props) {
  const [champion, setChampion] = useState(initialChampion ?? "");
  const [topScorer, setTopScorer] = useState(initialTopScorer ?? "");
  const [saved, setSaved] = useState(!!(initialChampion || initialTopScorer));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/bonus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ champion: champion || null, topScorer: topScorer || null }),
      });
      if (res.ok) setSaved(true);
      else {
        const d = await res.json();
        setError(d.error ?? "Failed to save");
      }
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  if (locked) {
    return (
      <div className="card-solid p-5 text-center mb-4">
        <div className="text-3xl mb-2">🔒</div>
        <div className="text-ink-text font-bold">Bonus picks are locked</div>
        <div className="text-muted text-sm mt-1">
          {initialChampion && <div>Champion: <strong className="text-gold">{initialChampion}</strong></div>}
          {initialTopScorer && <div>Top Scorer: <strong className="text-gold">{initialTopScorer}</strong></div>}
        </div>
      </div>
    );
  }

  return (
    <div className="card-solid p-5 mb-4">
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gold mb-1.5 font-semibold">🏆 World Cup Champion</label>
          <select
            value={champion}
            onChange={(e) => { setChampion(e.target.value); setSaved(false); }}
            className="w-full rounded-xl bg-ink border border-surface-border px-4 py-3 text-ink-text focus:outline-none focus:border-gold text-sm"
          >
            <option value="">— Pick a team —</option>
            {teams.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gold mb-1.5 font-semibold">⚽ Tournament Top Scorer</label>
          <input
            type="text"
            value={topScorer}
            onChange={(e) => { setTopScorer(e.target.value); setSaved(false); }}
            placeholder="e.g. Mbappé"
            className="w-full rounded-xl bg-ink border border-surface-border px-4 py-3 text-ink-text placeholder-muted-dim focus:outline-none focus:border-gold text-sm"
          />
          <p className="text-xs text-muted mt-1">Type any player name</p>
        </div>

        {error && <p className="text-ember text-xs">{error}</p>}

        <button
          onClick={save}
          disabled={busy || (!champion && !topScorer)}
          className={`w-full rounded-xl py-3 text-sm font-bold transition-all active:scale-95 ${
            saved
              ? "bg-surface-btn text-gold border border-gold/30"
              : "btn-primary"
          }`}
        >
          {busy ? "Saving..." : saved ? "✓ Bonus Picks Saved" : "Save Bonus Picks"}
        </button>
      </div>
    </div>
  );
}
