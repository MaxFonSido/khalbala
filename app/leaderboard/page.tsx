import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import BottomNav from "@/components/BottomNav";
import BackButton from "@/components/BackButton";
import BadgeTooltip from "@/components/BadgeTooltip";
import ScoreBreakdown, { type MatchLine, type BonusLine } from "@/components/ScoreBreakdown";
import { scoreMatch, BONUS_CHAMPION_PTS, BONUS_TOP_SCORER_PTS } from "@/lib/scoring";
import { calculateBadges, ALL_BADGES } from "@/lib/badges";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const supabase = db();

  const [{ data: users }, { data: matches }, { data: preds }, { data: bonuses }, { data: meta }] =
    await Promise.all([
      supabase.from("kb_users").select("id, display_name, avatar_emoji"),
      supabase.from("kb_matches").select("id, stage, team_a, team_b, score_a, score_b, status, kickoff_utc").in("status", ["FINISHED", "PAUSED"]),
      supabase.from("kb_predictions").select("user_id, match_id, score_a, score_b, advances"),
      supabase.from("kb_bonus").select("user_id, champion, top_scorer"),
      supabase.from("kb_meta").select("key, value").in("key", ["actual_champion", "actual_top_scorer"]),
    ]);

  const actualChampion = meta?.find((m) => m.key === "actual_champion")?.value ?? null;
  const actualTopScorer = meta?.find((m) => m.key === "actual_top_scorer")?.value ?? null;

  const userScores = new Map<string, { name: string; emoji: string | null; pts: number; exact: number; correct: number }>();
  for (const u of users ?? []) {
    userScores.set(u.id, { name: u.display_name, emoji: u.avatar_emoji, pts: 0, exact: 0, correct: 0 });
  }

  const breakdownMap = new Map<string, { matches: (MatchLine & { kickoff: string })[]; bonuses: BonusLine[] }>();
  for (const u of users ?? []) {
    breakdownMap.set(u.id, { matches: [], bonuses: [] });
  }

  for (const m of matches ?? []) {
    const matchPreds = (preds ?? []).filter((p) => p.match_id === m.id);
    for (const p of matchPreds) {
      const result = scoreMatch(p.score_a, p.score_b, m.score_a, m.score_b, m.stage, p.advances, m.team_a, m.team_b);
      const entry = userScores.get(p.user_id);
      if (entry) {
        entry.pts += result.totalPoints;
        if (result.label === "exact") entry.exact++;
        if (result.label !== "wrong") entry.correct++;
      }
      const bd = breakdownMap.get(p.user_id);
      if (bd) {
        bd.matches.push({
          matchId: m.id,
          label: `${m.team_a} vs ${m.team_b}`,
          guess: `${p.score_a}-${p.score_b}`,
          pts: result.totalPoints,
          kickoff: m.kickoff_utc,
        });
      }
    }
  }

  for (const bd of breakdownMap.values()) {
    bd.matches.sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
  }

  for (const b of bonuses ?? []) {
    const bd = breakdownMap.get(b.user_id);
    if (bd) {
      if (b.champion) {
        bd.bonuses.push({
          label: "Champion pick",
          guess: b.champion,
          pts: actualChampion && b.champion === actualChampion ? BONUS_CHAMPION_PTS : 0,
        });
      }
      if (b.top_scorer) {
        bd.bonuses.push({
          label: "Top Scorer pick",
          guess: b.top_scorer,
          pts: actualTopScorer && b.top_scorer === actualTopScorer ? BONUS_TOP_SCORER_PTS : 0,
        });
      }
    }
  }

  const sorted = [...userScores.entries()]
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.pts - a.pts || b.exact - a.exact);

  // Calculate badges
  const badgeMap = calculateBadges(
    (users ?? []).map((u) => ({ id: u.id, name: u.display_name })),
    (matches ?? []).map((m) => ({ id: m.id, stage: m.stage, team_a: m.team_a, team_b: m.team_b, score_a: m.score_a, score_b: m.score_b, kickoff_utc: m.kickoff_utc })),
    (preds ?? []).map((p) => ({ user_id: p.user_id, match_id: p.match_id, score_a: p.score_a, score_b: p.score_b, advances: p.advances }))
  );

  return (
    <>
      <main className="mx-auto max-w-2xl px-4 py-6 has-bottom-nav">
        <div className="card-solid px-6 py-5 mb-6 text-center">
          <div className="flex items-center justify-between mb-2">
            <BackButton />
            <div />
          </div>
          <div className="text-3xl mb-1">🏅</div>
          <div className="text-xs font-bold tracking-widest text-gold uppercase">Ranking</div>
          <div className="text-ink-text font-bold mt-1">Khal Bala · خال بالا</div>
        </div>

        {sorted.length === 0 ? (
          <div className="card-solid p-8 text-center">
            <div className="text-4xl mb-3">⏳</div>
            <p className="text-muted text-sm">No results yet — check back after the first matches!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((u, i) => {
              const isMe = u.name === session.displayName;
              const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
              const userBadges = badgeMap.get(u.id) ?? [];
              return (
                <div
                  key={u.id}
                  className={`card-solid px-5 py-4 ${isMe ? "border-gold/30" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl w-8 text-center shrink-0">{medal}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold text-sm ${isMe ? "text-gold" : "text-ink-text"}`}>
                        {u.emoji && <span className="mr-1">{u.emoji}</span>}
                        {u.name} {isMe && "· you"}
                      </div>
                      <div className="text-xs text-muted mt-0.5">
                        {u.exact} exact · {u.correct} correct
                      </div>
                      {userBadges.length > 0 && (
                        <div className="flex gap-1.5 mt-1.5">
                          {userBadges.map((bKey) => {
                            const b = ALL_BADGES[bKey];
                            return b ? (
                              <BadgeTooltip
                                key={bKey}
                                emoji={b.emoji}
                                name={b.name}
                                description={b.description}
                              />
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xl font-extrabold text-gold">{u.pts}</div>
                      <div className="text-[10px] text-muted">pts</div>
                    </div>
                  </div>
                  <ScoreBreakdown
                    matches={(breakdownMap.get(u.id)?.matches ?? []).map(({ kickoff, ...rest }) => rest)}
                    bonuses={breakdownMap.get(u.id)?.bonuses ?? []}
                  />
                </div>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav active="ranking" />
    </>
  );
}
