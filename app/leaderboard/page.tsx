import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import BottomNav from "@/components/BottomNav";
import { scoreMatch, BONUS_CHAMPION_PTS, BONUS_TOP_SCORER_PTS } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const supabase = db();

  const [{ data: users }, { data: matches }, { data: preds }, { data: bonuses }, { data: meta }] =
    await Promise.all([
      supabase.from("kb_users").select("id, display_name"),
      supabase.from("kb_matches").select("id, stage, score_a, score_b, status").eq("status", "FINISHED"),
      supabase.from("kb_predictions").select("user_id, match_id, score_a, score_b"),
      supabase.from("kb_bonus").select("user_id, champion, top_scorer"),
      supabase.from("kb_meta").select("key, value").in("key", ["actual_champion", "actual_top_scorer"]),
    ]);

  const actualChampion = meta?.find((m) => m.key === "actual_champion")?.value ?? null;
  const actualTopScorer = meta?.find((m) => m.key === "actual_top_scorer")?.value ?? null;

  const userScores = new Map<string, { name: string; pts: number; exact: number; correct: number }>();
  for (const u of users ?? []) {
    userScores.set(u.id, { name: u.display_name, pts: 0, exact: 0, correct: 0 });
  }

  for (const m of matches ?? []) {
    const matchPreds = (preds ?? []).filter((p) => p.match_id === m.id);
    for (const p of matchPreds) {
      const result = scoreMatch(p.score_a, p.score_b, m.score_a, m.score_b, m.stage);
      const entry = userScores.get(p.user_id);
      if (entry) {
        entry.pts += result.totalPoints;
        if (result.label === "exact") entry.exact++;
        if (result.label !== "wrong") entry.correct++;
      }
    }
  }

  for (const b of bonuses ?? []) {
    const entry = userScores.get(b.user_id);
    if (!entry) continue;
    if (actualChampion && b.champion === actualChampion) entry.pts += BONUS_CHAMPION_PTS;
    if (actualTopScorer && b.top_scorer === actualTopScorer) entry.pts += BONUS_TOP_SCORER_PTS;
  }

  const sorted = [...userScores.values()].sort((a, b) => b.pts - a.pts || b.exact - a.exact);

  return (
    <>
      <main className="mx-auto max-w-2xl px-4 py-6 has-bottom-nav">
        <div className="card-solid px-6 py-5 mb-6 text-center">
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
              return (
                <div
                  key={u.name}
                  className={`card-solid px-5 py-4 flex items-center gap-4 ${isMe ? "border-gold/30" : ""}`}
                >
                  <span className="text-xl w-8 text-center">{medal}</span>
                  <div className="flex-1">
                    <div className={`font-bold text-sm ${isMe ? "text-gold" : "text-ink-text"}`}>
                      {u.name} {isMe && "· you"}
                    </div>
                    <div className="text-xs text-muted mt-0.5">
                      {u.exact} exact · {u.correct} correct
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-extrabold text-gold">{u.pts}</div>
                    <div className="text-[10px] text-muted">pts</div>
                  </div>
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
