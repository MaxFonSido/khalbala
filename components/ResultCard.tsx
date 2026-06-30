"use client";

import { useState } from "react";
import { scoreMatch, stageLabel, type Stage } from "@/lib/scoring";

type FamilyPick = { name: string; avatarEmoji: string | null; scoreA: number; scoreB: number; advances: string | null; isMe: boolean };

type Props = {
  teamA: string;
  teamB: string;
  teamACrest: string | null;
  teamBCrest: string | null;
  scoreA: number;
  scoreB: number;
  stage: Stage;
  status: string;
  kickoffUtc: string;
  predScoreA: number | null;
  predScoreB: number | null;
  predAdvances: string | null;
  familyPicks: FamilyPick[];
};

function Crest({ url, name }: { url: string | null; name: string }) {
  if (!url) return <span className="text-base">🏳️</span>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={name} className="h-5 w-5 object-contain inline-block" />;
}

export default function ResultCard({
  teamA, teamB, teamACrest, teamBCrest, scoreA, scoreB, stage, status, kickoffUtc,
  predScoreA, predScoreB, predAdvances, familyPicks,
}: Props) {
  const [picksOpen, setPicksOpen] = useState(false);

  const matchDate = new Date(kickoffUtc).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  });

  const hasPick = predScoreA !== null && predScoreB !== null;
  const isLive = status === "IN_PLAY" || status === "PAUSED";
  const isFinished = status === "FINISHED" || status === "PAUSED";
  const result = hasPick && isFinished ? scoreMatch(predScoreA!, predScoreB!, scoreA, scoreB, stage, predAdvances, teamA, teamB) : null;

  const accent = isLive
    ? "border-l-gold"
    : !hasPick
    ? "border-l-muted-dim"
    : result!.label === "exact"
    ? "border-l-gold"
    : result!.label === "winner+gd"
    ? "border-l-accent-green"
    : result!.label === "winner"
    ? "border-l-accent-purple"
    : "border-l-muted-dim";

  const ptsColor = isLive
    ? "text-gold"
    : !hasPick
    ? "text-muted-dim"
    : result!.totalPoints > 0
    ? "text-gold"
    : "text-muted-dim";

  const isDraw = scoreA === scoreB;

  return (
    <div className={`card-solid border-l-[3px] ${accent} rounded-l-md px-4 py-3.5`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-muted uppercase tracking-wide">
          {stageLabel(stage)} <span className="text-muted-dim normal-case">· {matchDate}</span>
        </span>
        <span className={`text-xs font-bold ${ptsColor}`}>
          {isLive ? (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"></span>
              LIVE
            </span>
          ) : hasPick ? (
            result!.totalPoints > 0 ? `+${result!.totalPoints} pt${result!.totalPoints !== 1 ? "s" : ""}` : "0 pts"
          ) : "No pick"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Crest url={teamACrest} name={teamA} />
        <span className="text-[15px] font-bold text-ink-text truncate">
          {teamA} <span className="tnum text-muted">{scoreA ?? "–"}–{scoreB ?? "–"}</span> {teamB}
        </span>
        <Crest url={teamBCrest} name={teamB} />
      </div>

      {hasPick ? (
        <div className="text-xs text-muted mt-1.5 flex items-center gap-1.5">
          <span>You guessed {predScoreA}–{predScoreB}</span>
          {isDraw && predAdvances && (
            <span className="text-muted-dim">· {predAdvances} on pens</span>
          )}
        </div>
      ) : (
        <div className="text-xs text-muted-dim mt-1.5">You didn&apos;t predict this one</div>
      )}

      {/* Family Picks accordion */}
      {familyPicks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-surface-border">
          <button
            onClick={() => setPicksOpen((v) => !v)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wide">Family Picks</span>
              <span className="text-[10px] font-bold bg-surface-btn text-gold rounded-full px-2 py-0.5">
                {familyPicks.length}
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
              {[...familyPicks].sort((a, b) => {
                const ptsA = isFinished ? (scoreMatch(a.scoreA, a.scoreB, scoreA, scoreB, stage, a.advances, teamA, teamB)?.totalPoints ?? 0) : 0;
                const ptsB = isFinished ? (scoreMatch(b.scoreA, b.scoreB, scoreA, scoreB, stage, b.advances, teamA, teamB)?.totalPoints ?? 0) : 0;
                return ptsB - ptsA;
              }).map((p) => {
                const pickResult = isFinished
                  ? scoreMatch(p.scoreA, p.scoreB, scoreA, scoreB, stage, p.advances, teamA, teamB)
                  : null;
                const pts = pickResult?.totalPoints ?? null;
                const isDraw = p.scoreA === p.scoreB;
                const pickedA = !isDraw && p.scoreA > p.scoreB;
                const winnerName = isDraw && p.advances ? p.advances : pickedA ? teamA : teamB;
                const winnerCrest = isDraw && p.advances
                  ? (p.advances === teamA ? teamACrest : teamBCrest)
                  : pickedA ? teamACrest : teamBCrest;
                const displayScore = isDraw
                  ? `${p.scoreA}–${p.scoreB}`
                  : pickedA ? `${p.scoreA}–${p.scoreB}` : `${p.scoreB}–${p.scoreA}`;
                const label = isDraw && p.advances ? "pens" : "wins";

                return (
                  <div
                    key={`${p.name}-${p.scoreA}-${p.scoreB}`}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2 ${p.isMe ? "bg-gold/10 border border-gold/20" : "bg-surface-btn"}`}
                  >
                    <span className="text-base leading-none">{p.avatarEmoji ?? "👤"}</span>
                    <span className={`text-xs font-semibold flex-1 ${p.isMe ? "text-gold" : "text-ink-text"}`}>
                      {p.name}{p.isMe && <span className="text-[10px] text-gold ml-1">(you)</span>}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {winnerCrest
                        ? <img src={winnerCrest} alt={winnerName} className="h-3.5 w-5 object-cover rounded-sm" />
                        : <span className="text-xs">🏳️</span>
                      }
                      <span className="text-[10px] text-muted font-semibold">{winnerName} {label}</span>
                      <span className="text-xs font-bold text-gold tnum ml-1">{displayScore}</span>
                      {pts !== null && (
                        <span className={`text-[10px] font-bold ml-1 ${pts > 0 ? "text-gold" : "text-muted"}`}>
                          {pts > 0 ? `+${pts}` : "0"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
