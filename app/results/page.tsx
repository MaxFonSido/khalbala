import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { syncIfStale } from "@/lib/football";
import BottomNav from "@/components/BottomNav";
import BackButton from "@/components/BackButton";
import ResultCard from "@/components/ResultCard";
import RoundAccordion from "@/components/RoundAccordion";
import { stageLabel, type Stage } from "@/lib/scoring";

export const dynamic = "force-dynamic";

const ROUND_ORDER = ["LAST_32", "ROUND_OF_32", "LAST_16", "ROUND_OF_16", "QUARTER_FINALS", "SEMI_FINALS", "THIRD_PLACE", "FINAL"];

export default async function ResultsPage() {
  const session = await getSession();
  if (!session) redirect("/");

  await syncIfStale();

  const supabase = db();
  const now = new Date();

  const [{ data: matches }, { data: myPreds }, { data: allPreds }, { data: users }] = await Promise.all([
    supabase.from("kb_matches").select("*").order("kickoff_utc", { ascending: true }),
    supabase.from("kb_predictions")
      .select("match_id, score_a, score_b, advances")
      .eq("user_id", session.userId),
    supabase.from("kb_predictions")
      .select("user_id, match_id, score_a, score_b, advances"),
    supabase.from("kb_users").select("id, display_name, avatar_emoji"),
  ]);

  const userById = new Map((users ?? []).map((u) => [u.id, { name: u.display_name as string, emoji: u.avatar_emoji as string | null }]));

  // Build per-match family picks map
  type FamilyPick = { name: string; avatarEmoji: string | null; scoreA: number; scoreB: number; advances: string | null; isMe: boolean };
  const familyPicksByMatch = new Map<string, FamilyPick[]>();
  for (const p of allPreds ?? []) {
    const isMe = p.user_id === session.userId;
    const u = isMe ? { name: session.displayName, emoji: null } : userById.get(p.user_id);
    const list = familyPicksByMatch.get(p.match_id) ?? [];
    list.push({ name: u?.name ?? "?", avatarEmoji: u?.emoji ?? null, scoreA: p.score_a, scoreB: p.score_b, advances: p.advances, isMe });
    familyPicksByMatch.set(p.match_id, list);
  }

  const predMap = new Map(
    (myPreds ?? []).map((p) => [p.match_id, { scoreA: p.score_a, scoreB: p.score_b, advances: p.advances }])
  );

  // Show IN_PLAY, FINISHED, and locked (past kickoff but still TIMED)
  const results = (matches ?? []).filter(
    (m) => ["IN_PLAY", "FINISHED", "PAUSED"].includes(m.status) ||
    (["TIMED", "SCHEDULED"].includes(m.status) && new Date(m.kickoff_utc) <= now)
  );

  // Group by round
  type RoundGroup = { stage: string; label: string; matches: typeof results };
  const roundMap = new Map<string, RoundGroup>();
  for (const m of results) {
    if (!roundMap.has(m.stage)) {
      roundMap.set(m.stage, { stage: m.stage, label: stageLabel(m.stage), matches: [] });
    }
    roundMap.get(m.stage)!.matches.push(m);
  }
  const rounds = ROUND_ORDER
    .filter((s) => roundMap.has(s))
    .map((s) => roundMap.get(s)!);

  return (
    <>
      <main className="mx-auto max-w-2xl px-4 py-6 has-bottom-nav">
        <div className="card-solid px-6 py-5 mb-6 text-center">
          <div className="flex items-center justify-between mb-2">
            <BackButton />
            <div />
          </div>
          <div className="text-xs font-bold tracking-widest text-gold uppercase">Results</div>
          <div className="text-muted text-xs mt-1">
            {results.filter((m) => m.status === "FINISHED").length} finished · {results.filter((m) => m.status === "IN_PLAY").length} live
          </div>
        </div>

        {rounds.length === 0 && (
          <div className="card-solid p-8 text-center">
            <div className="text-4xl mb-3">📋</div>
            <div className="text-ink-text font-semibold">No results yet</div>
            <p className="text-muted text-sm mt-2">
              Results will appear here once knockout matches kick off.
            </p>
          </div>
        )}

        {rounds.map((round, i) => (
          <RoundAccordion
            key={round.stage}
            label={round.label}
            matchCount={round.matches.length}
            defaultOpen={i === 0}
          >
            {round.matches.map((m) => {
              const pred = predMap.get(m.id);
              return (
                <ResultCard
                  key={m.id}
                  teamA={m.team_a}
                  teamB={m.team_b}
                  teamACrest={m.team_a_crest ?? null}
                  teamBCrest={m.team_b_crest ?? null}
                  scoreA={m.score_a}
                  scoreB={m.score_b}
                  stage={m.stage as Stage}
                  status={m.status}
                  predScoreA={pred?.scoreA ?? null}
                  predScoreB={pred?.scoreB ?? null}
                  predAdvances={pred?.advances ?? null}
                  familyPicks={familyPicksByMatch.get(m.id) ?? []}
                />
              );
            })}
          </RoundAccordion>
        ))}
      </main>
      <BottomNav active="results" />
    </>
  );
}
