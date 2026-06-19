import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { syncIfStale } from "@/lib/football";
import BottomNav from "@/components/BottomNav";
import ScorePicker from "@/components/ScorePicker";
import RulesPopup, { RulesButton } from "@/components/RulesPopup";
import { stageLabel } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export default async function GamePage() {
  const session = await getSession();
  if (!session) redirect("/");

  // Sync knockout matches from football-data.org if stale (≥5 min)
  await syncIfStale();

  const supabase = db();
  const now = new Date();

  const [{ data: matches }, { data: myPreds }] = await Promise.all([
    supabase.from("kb_matches").select("*").order("kickoff_utc", { ascending: true }),
    supabase.from("kb_predictions")
      .select("match_id, score_a, score_b, advances")
      .eq("user_id", session.userId),
  ]);

  const predMap = new Map(
    (myPreds ?? []).map((p) => [p.match_id, { scoreA: p.score_a, scoreB: p.score_b, advances: p.advances }])
  );

  const upcoming = (matches ?? []).filter((m) => m.status !== "FINISHED");
  const finished = (matches ?? []).filter((m) => m.status === "FINISHED");

  return (
    <>
      <RulesPopup />
      <main className="mx-auto max-w-2xl px-4 py-6 has-bottom-nav">
        {/* Header */}
        <div className="rounded-3xl bg-gradient-to-br from-purple-900 via-purple-950 to-[#0f0a1a] px-6 py-5 mb-6 text-center border border-purple-800/30">
          <div className="flex items-center justify-between mb-2">
            <div className="w-16" />
            <div className="text-3xl">🃏</div>
            <div className="w-16 flex justify-end">
              <RulesButton />
            </div>
          </div>
          <div className="text-xs font-bold tracking-widest text-purple-400 uppercase">Khal Bala · خال بالا</div>
          <div className="text-white font-bold mt-1">
            Hi {session.displayName}! 👋
          </div>
          <div className="text-purple-300/70 text-xs mt-1">
            {upcoming.filter((m) => new Date(m.kickoff_utc) > now).length} match{upcoming.filter((m) => new Date(m.kickoff_utc) > now).length !== 1 ? "es" : ""} open for prediction
          </div>
        </div>

        {/* Upcoming matches */}
        {upcoming.length === 0 && finished.length === 0 && (
          <div className="card-solid p-8 text-center">
            <div className="text-4xl mb-3">⏳</div>
            <div className="text-white font-semibold">Knockout matches coming soon!</div>
            <p className="text-purple-300/70 text-sm mt-2">
              Predictions open when the knockout stage begins on June 28.
            </p>
          </div>
        )}

        {upcoming.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold tracking-widest text-purple-400 uppercase mb-3">
              Open for Prediction
            </h2>
            <div className="space-y-3">
              {upcoming.map((m) => {
                const locked = new Date(m.kickoff_utc) <= now || m.status === "IN_PLAY";
                return (
                  <ScorePicker
                    key={m.id}
                    matchId={m.id}
                    teamA={m.team_a}
                    teamB={m.team_b}
                    kickoffUtc={m.kickoff_utc}
                    stage={m.stage}
                    stageLabel={stageLabel(m.stage)}
                    initialScoreA={predMap.get(m.id)?.scoreA ?? null}
                    initialScoreB={predMap.get(m.id)?.scoreB ?? null}
                    initialAdvances={predMap.get(m.id)?.advances ?? null}
                    locked={locked}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Finished matches */}
        {finished.length > 0 && (
          <div>
            <h2 className="text-xs font-bold tracking-widest text-purple-400 uppercase mb-3">
              Results
            </h2>
            <div className="space-y-3">
              {finished.map((m) => {
                const pred = predMap.get(m.id);
                return (
                  <div key={m.id} className="card-solid px-5 py-4">
                    <div className="text-xs text-purple-400/70 mb-2">{stageLabel(m.stage)}</div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-white flex-1">{m.team_a}</div>
                      <div className="text-center px-4">
                        <div className="text-xl font-extrabold text-gold">{m.score_a}–{m.score_b}</div>
                        <div className="text-[10px] text-purple-400/60">Final</div>
                        {pred && (
                          <div className="text-[10px] text-purple-300/60 mt-0.5">
                            Your pick: {pred.scoreA}–{pred.scoreB}
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-bold text-white flex-1 text-right">{m.team_b}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
      <BottomNav displayName={session.displayName} />
    </>
  );
}
