import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import BottomNav from "@/components/BottomNav";
import BackButton from "@/components/BackButton";
import BonusPageClient from "@/components/BonusPageClient";
import PrizeCard from "@/components/PrizeCard";
import { scoreMatch, BONUS_CHAMPION_PTS, BONUS_TOP_SCORER_PTS } from "@/lib/scoring";

export const dynamic = "force-dynamic";

const TOURNAMENT_END = new Date("2026-07-20T00:00:00Z");
const BONUS_LOCK_DATE = new Date("2026-07-05T00:00:00Z");

export default async function BonusPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const supabase = db();
  const now = new Date();
  const tournamentEnded = now >= TOURNAMENT_END;
  const locked = now >= BONUS_LOCK_DATE;

  const [{ data: bonus }, { data: teams }, { data: players }, { data: allBonus }, { data: users }] = await Promise.all([
    supabase.from("kb_bonus").select("champion, top_scorer").eq("user_id", session.userId).maybeSingle(),
    supabase.from("kb_matches").select("team_a, team_b").order("kickoff_utc", { ascending: true }),
    supabase.from("kb_players").select("name, team").order("team").order("name"),
    supabase.from("kb_bonus").select("user_id, champion, top_scorer"),
    supabase.from("kb_users").select("id, display_name, avatar_emoji"),
  ]);

  const allTeams = [...new Set((teams ?? []).flatMap((m) => [m.team_a, m.team_b]).filter(Boolean))].sort();
  const playerTeamMap = new Map((players ?? []).map((p) => [p.name, p.team]));
  const bonusByUser = new Map((allBonus ?? []).map((b) => [b.user_id, b]));

  const familyPicks = (users ?? [])
    .filter((u) => bonusByUser.has(u.id))
    .sort((a, b) => {
      if (a.id === session.userId) return -1;
      if (b.id === session.userId) return 1;
      return a.display_name.localeCompare(b.display_name);
    })
    .map((u) => {
      const b = bonusByUser.get(u.id);
      return {
        name: u.display_name,
        avatarEmoji: u.avatar_emoji ?? null,
        champion: b?.champion ?? null,
        topScorer: b?.top_scorer ?? null,
        topScorerTeam: b?.top_scorer ? (playerTeamMap.get(b.top_scorer) ?? null) : null,
        isMe: u.id === session.userId,
      };
    });

  let winnerName: string | null = null;
  let winnerEmoji: string | null = null;
  let isWinner = false;

  if (tournamentEnded) {
    const [{ data: finishedMatches }, { data: preds }, { data: bonuses }, { data: metaAll }] = await Promise.all([
      supabase.from("kb_matches").select("id, stage, team_a, team_b, score_a, score_b, status, kickoff_utc").in("status", ["FINISHED", "PAUSED"]),
      supabase.from("kb_predictions").select("user_id, match_id, score_a, score_b, advances"),
      supabase.from("kb_bonus").select("user_id, champion, top_scorer"),
      supabase.from("kb_meta").select("key, value").in("key", ["actual_champion", "actual_top_scorer"]),
    ]);

    const actualChampion = metaAll?.find((m) => m.key === "actual_champion")?.value ?? null;
    const actualTopScorer = metaAll?.find((m) => m.key === "actual_top_scorer")?.value ?? null;

    const scores = new Map<string, { name: string; emoji: string | null; pts: number }>();
    for (const u of users ?? []) scores.set(u.id, { name: u.display_name, emoji: u.avatar_emoji, pts: 0 });
    for (const m of finishedMatches ?? []) {
      for (const p of (preds ?? []).filter((p) => p.match_id === m.id)) {
        const result = scoreMatch(p.score_a, p.score_b, m.score_a, m.score_b, m.stage, p.advances, m.team_a, m.team_b);
        const entry = scores.get(p.user_id);
        if (entry) entry.pts += result.totalPoints;
      }
    }
    for (const b of bonuses ?? []) {
      const entry = scores.get(b.user_id);
      if (!entry) continue;
      if (actualChampion && b.champion === actualChampion) entry.pts += BONUS_CHAMPION_PTS;
      if (actualTopScorer && b.top_scorer === actualTopScorer) entry.pts += BONUS_TOP_SCORER_PTS;
    }

    const sorted = [...scores.entries()].sort((a, b) => b[1].pts - a[1].pts);
    const [winnerId, winnerData] = sorted[0] ?? [];
    if (winnerId) {
      winnerName = winnerData.name;
      winnerEmoji = winnerData.emoji;
      isWinner = winnerId === session.userId;
    }
  }

  const myUser = (users ?? []).find((u) => u.id === session.userId);

  return (
    <>
      <main className="mx-auto max-w-2xl px-4 py-6 has-bottom-nav">
        <div className="card-solid px-6 py-5 mb-6 text-center">
          <div className="flex items-center justify-between mb-2">
            <BackButton />
            <div />
          </div>
          <div className="text-3xl mb-1">⭐</div>
          <div className="text-xs font-bold tracking-widest text-gold uppercase">Bonus Predictions</div>
          <div className="text-ink-text font-bold mt-1">Big points, big glory</div>
        </div>

        <PrizeCard
          tournamentEnded={tournamentEnded}
          isWinner={isWinner}
          winnerName={winnerName}
          winnerEmoji={winnerEmoji}
        />

        {/* Deadline / locked banner */}
        {!locked ? (
          <div className="mt-4 rounded-xl bg-ink border border-gold/30 px-4 py-3 flex items-center gap-3">
            <span className="text-lg">⏰</span>
            <div>
              <div className="text-xs font-bold text-gold">Locks when Round of 16 begins</div>
              <div className="text-xs text-muted mt-0.5">Make your picks before July 5 — after that they can&apos;t be changed</div>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-xl bg-ink border border-surface-border px-4 py-3 flex items-center gap-3">
            <span className="text-lg">🔒</span>
            <div>
              <div className="text-xs font-bold text-ink-text">Bonus picks are locked</div>
              <div className="text-xs text-muted mt-0.5">Round of 16 has begun — no more changes</div>
            </div>
          </div>
        )}

        <div className="mt-4">
          {locked ? (
            /* Locked: show family picks only, no form */
            <>
              {/* Family Champion picks */}
              <div className="card-solid overflow-hidden mb-4">
                <div className="px-4 py-2.5 border-b border-surface-border">
                  <span className="text-[10px] font-bold text-gold uppercase tracking-widest">🏆 World Cup Champion — Family Picks</span>
                </div>
                {familyPicks.map((p) => (
                  <div key={p.name} className={`flex items-center gap-3 px-4 py-2.5 border-b border-surface-border last:border-0 ${p.isMe ? "bg-gold/5" : ""}`}>
                    <span className="text-lg leading-none">{p.avatarEmoji ?? "👤"}</span>
                    <span className={`text-xs font-semibold flex-1 ${p.isMe ? "text-gold" : "text-ink-text"}`}>
                      {p.name}{p.isMe && <span className="text-[10px] text-gold ml-1">(you)</span>}
                    </span>
                    {p.champion
                      ? <span className="text-sm font-bold text-ink-text">{p.champion}</span>
                      : <span className="text-xs text-muted italic">No pick</span>}
                  </div>
                ))}
              </div>
              {/* Family Top Scorer picks */}
              <div className="card-solid overflow-hidden">
                <div className="px-4 py-2.5 border-b border-surface-border">
                  <span className="text-[10px] font-bold text-gold uppercase tracking-widest">⚽ Top Scorer — Family Picks</span>
                </div>
                {familyPicks.map((p) => (
                  <div key={p.name} className={`flex items-center gap-3 px-4 py-2.5 border-b border-surface-border last:border-0 ${p.isMe ? "bg-gold/5" : ""}`}>
                    <span className="text-lg leading-none">{p.avatarEmoji ?? "👤"}</span>
                    <span className={`text-xs font-semibold flex-1 ${p.isMe ? "text-gold" : "text-ink-text"}`}>
                      {p.name}{p.isMe && <span className="text-[10px] text-gold ml-1">(you)</span>}
                    </span>
                    {p.topScorer
                      ? <div className="text-right"><div className="text-sm font-bold text-ink-text">{p.topScorer}</div>{p.topScorerTeam && <div className="text-[10px] text-muted">{p.topScorerTeam}</div>}</div>
                      : <span className="text-xs text-muted italic">No pick</span>}
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Unlocked: form + family picks with optimistic update */
            <BonusPageClient
              initialChampion={bonus?.champion ?? null}
              initialTopScorer={bonus?.top_scorer ?? null}
              teams={allTeams}
              players={(players ?? []).map((p) => ({ name: p.name, team: p.team }))}
              initialPicks={familyPicks}
              myName={session.displayName}
              myEmoji={myUser?.avatar_emoji ?? null}
            />
          )}
        </div>

        {/* Points on offer */}
        <div className="mt-4 card-solid p-4">
          <div className="text-xs font-bold text-gold uppercase tracking-widest mb-3">Points on offer</div>
          <div className="flex items-center justify-between py-2 border-b border-surface-border">
            <div className="flex items-center gap-2 text-sm text-ink-text">🏆 World Cup Champion</div>
            <div className="text-gold font-bold">+10 pts</div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2 text-sm text-ink-text">⚽ Tournament Top Scorer</div>
            <div className="text-gold font-bold">+8 pts</div>
          </div>
          <p className="text-xs text-muted mt-3">
            These lock when Round of 16 begins (July 5) and pay out at the Final.
          </p>
        </div>
      </main>
      <BottomNav active="bonus" />
    </>
  );
}
