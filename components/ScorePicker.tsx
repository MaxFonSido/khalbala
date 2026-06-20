"use client";

import { useState } from "react";

type Props = {
  matchId: string;
  teamA: string;
  teamB: string;
  kickoffUtc: string;
  stage: string;
  stageLabel: string;
  initialScoreA: number | null;
  initialScoreB: number | null;
  initialAdvances: string | null;
  locked: boolean;
};

const TZ = "America/New_York";

function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      weekday: "short", month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit", timeZone: TZ
    }) + " ET";
  } catch { return ""; }
}

export default function ScorePicker({
  matchId, teamA, teamB, kickoffUtc, stageLabel: stageLbl,
  initialScoreA, initialScoreB, initialAdvances, locked,
}: Props) {
  const [scoreA, setScoreA] = useState<number>(initialScoreA ?? 0);
  const [scoreB, setScoreB] = useState<number>(initialScoreB ?? 0);
  const [advances, setAdvances] = useState<string | null>(initialAdvances);
  const [saved, setSaved] = useState(initialScoreA !== null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const isDraw = scoreA === scoreB;

  function adjust(team: "A" | "B", delta: number) {
    if (locked) return;
    if (team === "A") setScoreA((v) => Math.max(0, Math.min(20, v + delta)));
    else setScoreB((v) => Math.max(0, Math.min(20, v + delta)));
    setSaved(false);
    setAdvances(null);
    setError("");
  }

  async function save() {
    if (isDraw && !advances) {
      setError("Pick who advances on penalties!");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId, scoreA, scoreB,
          advances: isDraw ? advances : null,
        }),
      });
      if (res.ok) {
        setSaved(true);
      } else {
        const d = await res.json();
        setError(d.error ?? "Failed to save");
      }
    } catch {
      setError("Network error — try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`px-5 py-4 transition-all ${saved ? "card-active" : "card-solid"}`}>
      {/* Stage + time */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold text-muted uppercase tracking-wide">{stageLbl}</span>
      </div>
      <div className="text-[10px] text-muted-dim mb-4">{fmtTime(kickoffUtc)}</div>

      {/* Score input */}
      <div className="flex items-center gap-3">
        {/* Team A */}
        <div className="flex-1 text-center">
          <div className="text-sm font-bold text-ink-text mb-3">{teamA}</div>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => adjust("A", -1)}
              className="h-9 w-9 rounded-full bg-surface-btn text-ink-text font-bold text-lg active:scale-90 transition-all"
            >−</button>
            <span className={`tnum text-3xl font-extrabold w-10 text-center ${saved || scoreA > 0 ? "text-gold" : "text-ink-text"}`}>{scoreA}</span>
            <button
              onClick={() => adjust("A", 1)}
              className="h-9 w-9 rounded-full bg-surface-btn text-ink-text font-bold text-lg active:scale-90 transition-all"
            >+</button>
          </div>
        </div>

        {/* VS */}
        <div className="text-muted-dim font-bold text-sm">–</div>

        {/* Team B */}
        <div className="flex-1 text-center">
          <div className="text-sm font-bold text-ink-text mb-3">{teamB}</div>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => adjust("B", -1)}
              className="h-9 w-9 rounded-full bg-surface-btn text-ink-text font-bold text-lg active:scale-90 transition-all"
            >−</button>
            <span className={`tnum text-3xl font-extrabold w-10 text-center ${saved || scoreB > 0 ? "text-gold" : "text-ink-text"}`}>{scoreB}</span>
            <button
              onClick={() => adjust("B", 1)}
              className="h-9 w-9 rounded-full bg-surface-btn text-ink-text font-bold text-lg active:scale-90 transition-all"
            >+</button>
          </div>
        </div>
      </div>

      {/* Who advances? — only visible on draw */}
      {isDraw && !locked && (
        <div className="mt-4 rounded-xl bg-ink border border-surface-border p-3">
          <div className="text-[10px] font-bold text-gold uppercase tracking-wide text-center mb-2">
            Who advances on penalties?
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setAdvances(teamA); setSaved(false); }}
              className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${
                advances === teamA
                  ? "bg-gold text-gold-dark border border-gold"
                  : "bg-surface-btn text-muted border border-surface-border"
              }`}
            >
              {teamA}
            </button>
            <button
              onClick={() => { setAdvances(teamB); setSaved(false); }}
              className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${
                advances === teamB
                  ? "bg-gold text-gold-dark border border-gold"
                  : "bg-surface-btn text-muted border border-surface-border"
              }`}
            >
              {teamB}
            </button>
          </div>
        </div>
      )}

      {/* Locked draw — show who they picked */}
      {isDraw && locked && advances && (
        <div className="mt-3 text-center text-xs text-muted">
          Advances: <span className="font-bold text-gold">{advances}</span>
        </div>
      )}

      {/* Save button */}
      <div className="mt-4 flex items-center gap-3">
        {locked ? (
          <div className="flex-1 rounded-xl py-2.5 text-sm font-bold text-center text-muted bg-surface-btn border border-surface-border">
            🔒 Locked
          </div>
        ) : (
          <button
            onClick={save}
            disabled={busy}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all active:scale-95 ${
              saved
                ? "bg-surface-btn text-gold border border-gold/30"
                : "btn-primary"
            }`}
          >
            {busy ? "Saving..." : saved ? "✓ Saved" : "Save Prediction"}
          </button>
        )}
      </div>

      {error && <p className="text-ember text-xs mt-2 text-center">{error}</p>}
    </div>
  );
}
