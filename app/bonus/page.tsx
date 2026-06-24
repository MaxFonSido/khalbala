import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import BottomNav from "@/components/BottomNav";
import BackButton from "@/components/BackButton";
import BonusForm from "@/components/BonusForm";
import PrizeCard from "@/components/PrizeCard";
import { scoreMatch, BONUS_CHAMPION_PTS, BONUS_TOP_SCORER_PTS } from "@/lib/scoring";

export const dynamic = "force-dynamic";

const TOURNAMENT_END = new Date("2026-07-20T00:00:00Z");

export default async function BonusPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const supabase = db();
  const tournamentEnded = new Date() >= TOURNAMENT_END;

  const [{ data: bonus }, { data: meta }, { data: teams }, { data: players }] = await Promise.all([
    supabase.from("kb_bonus").select("champion, top_scorer").eq("user_id", session.userId).maybeSingle(),
    supabase.from("kb_meta").select("key, value").eq("key", "bonus_locked").maybeSingle(),
    supabase.from("kb_matches").select("team_a, team_b").order("kickoff_utc", { ascending: true }),
    supabase.from("kb_players").select("name, team").order("team").order("name"),
  ]);

  const locked = meta?.value === "true";
  const allTeams = [...new Set((teams ?? []).flatMap((m) => [m.team_a, m.team_b]))].sort();

  let winnerName: string | null = null;
  let winnerEmoji: string | null = null;
  let isWinner = false;

  if (tournamentEnded) {
    const [{ data: users }, { data: finishedMatches }, { data: preds }, { data: bonuses }, { data: metaAll }] =
      await Promise.all([
        supabase.from("kb_users").select("id, display_name, avatar_emoji"),
        supabase.from("kb_matches").select("id, stage, score_a, score_b, status, kickoff_utc").eq("status", "FINISHED"),
        supabase.from("kb_predictions").select("user_id, match_id, score_a, score_b"),
        supabase.from("kb_bonus").select("user_id, champion, top_scorer"),
        supabase.from("kb_meta").select("key, value").in("key", ["actual_champion", "actual_top_scorer"]),
      ]);

    const actualChampion = metaAll?.find((m) => m.key === "actual_champion")?.value ?? null;
    const actualTopScorer = metaAll?.find((m) => m.key === "actual_top_scorer")?.value ?? null;

    const scores = new Map<string, { name: string; emoji: string | null; pts: number }>();
    for (const u of users ?? []) {
      scores.set(u.id, { name: u.display_name, emoji: u.avatar_emoji, pts: 0 });
    }
    for (const m of finishedMatches ?? []) {
      for (const p of (preds ?? []).filter((p) => p.match_id === m.id)) {
        const result = scoreMatch(p.score_a, p.score_b, m.score_a, m.score_b, m.stage);
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

  return (
    <>
      <main className="mx-auto max-w-2xl px-4 py-6 has-bottom-nav">
        {/* Header */}
        <div className="card-solid px-6 py-5 mb-6 text-center">
          <div className="flex items-center justify-between mb-2">
            <BackButton />
            <div />
          </div>
          <div className="text-3xl mb-1">⭐</div>
          <div className="text-xs font-bold tracking-widest text-gold uppercase">Bonus Predictions</div>
          <div className="text-ink-text font-bold mt-1">Big points, big glory</div>
        </div>

        {/* Prize card — right under header */}
        <PrizeCard
          tournamentEnded={tournamentEnded}
          isWinner={isWinner}
          winnerName={winnerName}
          winnerEmoji={winnerEmoji}
        />

        {/* Bonus form */}
        <div className="mt-6">
          <BonusForm
            initialChampion={bonus?.champion ?? null}
            initialTopScorer={bonus?.top_scorer ?? null}
            locked={locked}
            teams={allTeams}
            players={(players ?? []).map((p) => ({ name: p.name, team: p.team }))}
          />
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
            These lock at the start of the knockout stage and pay out at the Final.
          </p>
        </div>
      </main>
      <BottomNav active="bonus" />
    </>
  );
}
