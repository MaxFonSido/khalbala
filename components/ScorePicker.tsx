"use client";

import { useState } from "react";

type OtherPick = { name: string; avatarEmoji: string | null; scoreA: number; scoreB: number; advances: string | null; isMe: boolean };

type Props = {
  matchId: string;
  teamA: string;
  teamB: string;
  teamACrest: string | null;
  teamBCrest: string | null;
  kickoffUtc: string;
  stage: string;
  stageLabel: string;
  initialScoreA: number | null;
  initialScoreB: number | null;
  initialAdvances: string | null;
  locked: boolean;
  otherPicks: OtherPick[];
  myName: string;
  myEmoji: string | null;
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

function Crest({ url, name }: { url: string | null; name: string }) {
  if (!url) return <span className="text-xl">🏳️</span>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={name} className="h-6 w-6 object-contain" />;
}

export default function ScorePicker({
  matchId, teamA, teamB, teamACrest, teamBCrest, kickoffUtc, stageLabel: stageLbl,
  initialScoreA, initialScoreB, initialAdvances, locked, otherPicks, myName, myEmoji,
}: Props) {
  const [scoreA, setScoreA] = useState<number>(initialScoreA ?? 0);
  const [scoreB, setScoreB] = useState<number>(initialScoreB ?? 0);
  const [advances, setAdvances] = useState<string | null>(initialAdvances);
  const [saved, setSaved] = useState(initialScoreA !== null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [picksOpen, setPicksOpen] = useState(false);
  const [picks, setPicks] = useState<OtherPick[]>(otherPicks);

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
        // Optimistically update picks list
        setPicks((prev) => {
          const filtered = prev.filter((p) => !p.isMe);
          return [
            { name: myName, avatarEmoji: myEmoji, scoreA, scoreB, advances: isDraw ? advances : null, isMe: true },
            ...filtered,
          ];
        });
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
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold text-muted uppercase tracking-wide">{stageLbl}</span>
      </div>
      <div className="text-[10px] text-muted-dim mb-4">{fmtTime(kickoffUtc)}</div>

      {/* Score input */}
      <div className="flex items-center gap-3">
        {/* Team A */}
        <div className="flex-1 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <Crest url={teamACrest} name={teamA} />
            <span className="text-sm font-bold text-ink-text">{teamA}</span>
          </div>
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

        <div className="text-muted-dim font-bold text-sm">–</div>

        {/* Team B */}
        <div className="flex-1 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <Crest url={teamBCrest} name={teamB} />
            <span className="text-sm font-bold text-ink-text">{teamB}</span>
          </div>
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

      {/* Who advances? */}
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

      {/* Family Picks accordion */}
      <div className="mt-4 pt-3 border-t border-surface-border">
        <button
          onClick={() => setPicksOpen((v) => !v)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wide">Family Picks</span>
            <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${
              picks.length > 0 ? "bg-surface-btn text-gold" : "bg-surface-btn text-muted"
            }`}>
              {picks.length}
            </span>
          </div>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={`text-muted transition-transform duration-200 ${picksOpen ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {picksOpen && (
          <div className="mt-2 space-y-1.5">
            {picks.length === 0 ? (
              <div className="text-xs text-muted text-center py-2">No picks yet</div>
            ) : (
              picks.map((p) => {
                const isDraw = p.scoreA === p.scoreB;
                const pickedA = !isDraw && p.scoreA > p.scoreB;
                const flagCrest = isDraw && p.advances
                  ? (p.advances === teamA ? teamACrest : teamBCrest)
                  : pickedA ? teamACrest : teamBCrest;
                const winnerName = isDraw && p.advances
                  ? p.advances
                  : pickedA ? teamA : teamB;
                const displayScore = isDraw
                  ? `${p.scoreA}–${p.scoreB}`
                  : pickedA
                  ? `${p.scoreA}–${p.scoreB}`
                  : `${p.scoreB}–${p.scoreA}`;
                const label = isDraw && p.advances ? "pens" : "wins";

                return (
                  <div key={`${p.name}-${p.scoreA}-${p.scoreB}-${p.advances ?? ""}`} className={`flex items-center gap-2.5 rounded-xl px-3 py-2 ${p.isMe ? "bg-gold/10 border border-gold/20" : "bg-surface-btn"}`}>
                    <span className="text-base leading-none">{p.avatarEmoji ?? "👤"}</span>
                    <span className="text-xs font-semibold text-ink-text flex-1">
                      {p.name}
                      {p.isMe && <span className="text-[10px] text-gold ml-1">(you)</span>}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {flagCrest ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={flagCrest} alt={winnerName} className="h-3.5 w-5 object-cover rounded-sm" />
                      ) : (
                        <span className="text-xs">🏳️</span>
                      )}
                      <span className="text-[10px] text-muted font-semibold">{winnerName} {label}</span>
                      <span className="text-xs font-bold text-gold tnum ml-1">{displayScore}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
