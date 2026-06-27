import { flagUrl } from "@/lib/flagUrl";

type BonusPick = {
  name: string;
  avatarEmoji: string | null;
  champion: string | null;
  topScorer: string | null;
  topScorerTeam: string | null;
  isMe: boolean;
};

type Props = { picks: BonusPick[] };

function Flag({ team }: { team: string }) {
  const url = flagUrl(team);
  if (!url) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={team} className="h-5 w-7 object-cover rounded-sm flex-shrink-0" />;
}

function Row({ p, right }: { p: BonusPick; right: React.ReactNode }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 border-b border-surface-border last:border-0 ${p.isMe ? "bg-gold/5" : ""}`}>
      <span className="text-lg leading-none">{p.avatarEmoji ?? "👤"}</span>
      <span className={`text-xs font-semibold flex-1 ${p.isMe ? "text-gold" : "text-ink-text"}`}>
        {p.name}{p.isMe && <span className="text-[10px] text-gold ml-1">(you)</span>}
      </span>
      {right}
    </div>
  );
}

export default function FamilyBonusPicks({ picks }: Props) {
  return (
    <div className="space-y-4 mt-4">
      {/* Champion picks */}
      <div className="card-solid overflow-hidden">
        <div className="px-4 py-2.5 border-b border-surface-border">
          <span className="text-[10px] font-bold text-gold uppercase tracking-widest">🏆 World Cup Champion — Family Picks</span>
        </div>
        {picks.map((p) => (
          <Row key={p.name} p={p} right={
            p.champion ? (
              <div className="flex items-center gap-2">
                <Flag team={p.champion} />
                <span className="text-sm font-bold text-ink-text">{p.champion}</span>
              </div>
            ) : (
              <span className="text-xs text-muted italic">No pick yet</span>
            )
          } />
        ))}
      </div>

      {/* Top scorer picks */}
      <div className="card-solid overflow-hidden">
        <div className="px-4 py-2.5 border-b border-surface-border">
          <span className="text-[10px] font-bold text-gold uppercase tracking-widest">⚽ Top Scorer — Family Picks</span>
        </div>
        {picks.map((p) => (
          <Row key={p.name} p={p} right={
            p.topScorer ? (
              <div className="flex items-center gap-2">
                {p.topScorerTeam && <Flag team={p.topScorerTeam} />}
                <div className="text-right">
                  <div className="text-sm font-bold text-ink-text">{p.topScorer}</div>
                  {p.topScorerTeam && <div className="text-[10px] text-muted">{p.topScorerTeam}</div>}
                </div>
              </div>
            ) : (
              <span className="text-xs text-muted italic">No pick yet</span>
            )
          } />
        ))}
      </div>
    </div>
  );
}
