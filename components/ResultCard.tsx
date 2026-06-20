import { scoreMatch, stageLabel, type Stage } from "@/lib/scoring";

type Props = {
  teamA: string;
  teamB: string;
  teamACrest: string | null;
  teamBCrest: string | null;
  scoreA: number;
  scoreB: number;
  stage: Stage;
  status: string;
  predScoreA: number | null;
  predScoreB: number | null;
  predAdvances: string | null;
};

function Crest({ url, name }: { url: string | null; name: string }) {
  if (!url) return <span className="text-base">🏳️</span>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={name} className="h-5 w-5 object-contain inline-block" />;
}

export default function ResultCard({
  teamA, teamB, teamACrest, teamBCrest, scoreA, scoreB, stage, status,
  predScoreA, predScoreB, predAdvances,
}: Props) {
  const hasPick = predScoreA !== null && predScoreB !== null;
  const isLive = status === "IN_PLAY";
  const result = hasPick && !isLive ? scoreMatch(predScoreA!, predScoreB!, scoreA, scoreB, stage) : null;

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
          {stageLabel(stage)}
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
        <div className="text-xs text-muted-dim mt-1.5">You didn't predict this one</div>
      )}
    </div>
  );
}
