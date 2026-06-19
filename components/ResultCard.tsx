import { scoreMatch, scoreLabel, stageLabel, type Stage } from "@/lib/scoring";

type Props = {
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  stage: Stage;
  predScoreA: number | null;
  predScoreB: number | null;
  predAdvances: string | null;
};

export default function ResultCard({
  teamA, teamB, scoreA, scoreB, stage,
  predScoreA, predScoreB, predAdvances,
}: Props) {
  const hasPick = predScoreA !== null && predScoreB !== null;
  const result = hasPick ? scoreMatch(predScoreA!, predScoreB!, scoreA, scoreB, stage) : null;

  // Accent bar color by outcome
  const accent = !hasPick
    ? "border-l-white/15"
    : result!.label === "exact"
    ? "border-l-gold"
    : result!.label === "winner+gd"
    ? "border-l-green-500"
    : result!.label === "winner"
    ? "border-l-purple-400"
    : "border-l-white/20";

  const ptsColor = !hasPick
    ? "text-purple-400/40"
    : result!.totalPoints > 0
    ? "text-gold"
    : "text-purple-400/50";

  const isDraw = scoreA === scoreB;

  return (
    <div className={`card-solid border-l-[3px] ${accent} rounded-l-md px-4 py-3.5`}>
      {/* Stage + points */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wide">
          {stageLabel(stage)}
        </span>
        <span className={`text-xs font-bold ${ptsColor}`}>
          {hasPick ? (result!.totalPoints > 0 ? `+${result!.totalPoints} pt${result!.totalPoints !== 1 ? "s" : ""}` : "0 pts") : "No pick"}
        </span>
      </div>

      {/* Score line */}
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[15px] font-bold text-white truncate">
          {teamA} <span className="tnum text-purple-300/80">{scoreA}–{scoreB}</span> {teamB}
        </span>
      </div>

      {/* Your pick */}
      {hasPick ? (
        <div className="text-xs text-purple-300/60 mt-1.5 flex items-center gap-1.5">
          <span>You guessed {predScoreA}–{predScoreB}</span>
          {isDraw && predAdvances && (
            <span className="text-purple-400/50">· {predAdvances} on pens</span>
          )}
        </div>
      ) : (
        <div className="text-xs text-purple-400/40 mt-1.5">You didn't predict this one</div>
      )}
    </div>
  );
}
