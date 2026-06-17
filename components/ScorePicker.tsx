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
  initialScoreA, initialScoreB,
}: Props) {
  const [scoreA, setScoreA] = useState<number>(initialScoreA ?? 0);
  const [scoreB, setScoreB] = useState<number>(initialScoreB ?? 0);
  const [saved, setSaved] = useState(initialScoreA !== null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function adjust(team: "A" | "B", delta: number) {
    if (team === "A") setScoreA((v) => Math.max(0, Math.min(20, v + delta)));
    else setScoreB((v) => Math.max(0, Math.min(20, v + delta)));
    setSaved(false);
    setError("");
  }

  async function save() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, scoreA, scoreB }),
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

  const multiplier = stageLbl.match(/×(\d)/)?.[1];

  return (
    <div className={`card-solid px-5 py-4 transition-all ${saved ? "border-purple-600/40" : "border-white/07"}`}>
      {/* Stage + time */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wide">{stageLbl}</span>
        {multiplier && multiplier !== "1" && (
          <span className="text-[10px] font-bold text-gold bg-gold/10 rounded-full px-2 py-0.5">
            ×{multiplier} points!
          </span>
        )}
      </div>
      <div className="text-[10px] text-purple-300/50 mb-4">{fmtTime(kickoffUtc)}</div>

      {/* Score input */}
      <div className="flex items-center gap-3">
        {/* Team A */}
        <div className="flex-1 text-center">
          <div className="text-sm font-bold text-white mb-3">{teamA}</div>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => adjust("A", -1)}
              className="h-9 w-9 rounded-full bg-white/10 text-white font-bold text-lg hover:bg-white/20 active:scale-90 transition-all"
            >−</button>
            <span className="tnum text-3xl font-extrabold text-white w-10 text-center">{scoreA}</span>
            <button
              onClick={() => adjust("A", 1)}
              className="h-9 w-9 rounded-full bg-white/10 text-white font-bold text-lg hover:bg-white/20 active:scale-90 transition-all"
            >+</button>
          </div>
        </div>

        {/* VS */}
        <div className="text-purple-400/50 font-bold text-sm">–</div>

        {/* Team B */}
        <div className="flex-1 text-center">
          <div className="text-sm font-bold text-white mb-3">{teamB}</div>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => adjust("B", -1)}
              className="h-9 w-9 rounded-full bg-white/10 text-white font-bold text-lg hover:bg-white/20 active:scale-90 transition-all"
            >−</button>
            <span className="tnum text-3xl font-extrabold text-white w-10 text-center">{scoreB}</span>
            <button
              onClick={() => adjust("B", 1)}
              className="h-9 w-9 rounded-full bg-white/10 text-white font-bold text-lg hover:bg-white/20 active:scale-90 transition-all"
            >+</button>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={save}
          disabled={busy}
          className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all active:scale-95 ${
            saved
              ? "bg-purple-600/30 text-purple-300 border border-purple-600/40"
              : "bg-gradient-to-r from-purple-900 to-purple-700 text-white border border-purple-600/40 hover:from-purple-800 hover:to-purple-600"
          }`}
        >
          {busy ? "Saving..." : saved ? "✓ Saved" : "Save Prediction"}
        </button>
      </div>

      {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
    </div>
  );
}
