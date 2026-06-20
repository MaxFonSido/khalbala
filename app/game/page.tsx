import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { syncIfStale } from "@/lib/football";
import BottomNav from "@/components/BottomNav";
import ScorePicker from "@/components/ScorePicker";
import RoundAccordion from "@/components/RoundAccordion";
import RulesPopup, { RulesButton } from "@/components/RulesPopup";
import { stageLabel } from "@/lib/scoring";

export const dynamic = "force-dynamic";

const ROUND_ORDER = ["LAST_16", "QUARTER_FINALS", "SEMI_FINALS", "THIRD_PLACE", "FINAL"];

export default async function GamePage() {
  const session = await getSession();
  if (!session) redirect("/");

  await syncIfStale();

  const supabase = db();
  const now = new Date();

  const [{ data: matches }, { data: allPreds }, { data: users }] = await Promise.all([
    supabase.from("kb_matches").select("*").order("kickoff_utc", { ascending: true }),
    supabase.from("kb_predictions").select("user_id, match_id, score_a, score_b, advances"),
    supabase.from("kb_users").select("id, display_name"),
  ]);

  const nameById = new Map((users ?? []).map((u) => [u.id, u.display_name as string]));

  // My picks
  const myPreds = (allPreds ?? []).filter((p) => p.user_id === session.userId);
  const predMap = new Map(
    myPreds.map((p) => [p.match_id, { scoreA: p.score_a, scoreB: p.score_b, advances: p.advances }])
  );

  // Other users' picks per match
  const otherPicksByMatch = new Map<string, { name: string; scoreA: number; scoreB: number; advances: string | null }[]>();
  for (const p of allPreds ?? []) {
    if (p.user_id === session.userId) continue;
    const list = otherPicksByMatch.get(p.match_id) ?? [];
    list.push({
      name: nameById.get(p.user_id) ?? "?",
      scoreA: p.score_a,
      scoreB: p.score_b,
      advances: p.advances,
    });
    otherPicksByMatch.set(p.match_id, list);
  }

  // Show ALL matches that haven't kicked off yet (no 24h window)
  const open = (matches ?? []).filter(
    (m) => ["TIMED", "SCHEDULED"].includes(m.status) && new Date(m.kickoff_utc) > now
  );

  // Group by round
  type RoundGroup = { stage: string; label: string; matches: typeof open };
  const roundMap = new Map<string, RoundGroup>();
  for (const m of open) {
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
      <RulesPopup />
      <main className="mx-auto max-w-2xl px-4 py-6 has-bottom-nav">
        {/* Header */}
        <div className="card-solid px-6 py-5 mb-6 text-center">
          <div className="flex items-center justify-end mb-2">
            <RulesButton />
          </div>
          <div className="text-xs font-bold tracking-widest text-gold uppercase">KHAL BALA · خال بالا</div>
          <div className="text-ink-text font-bold text-lg mt-1">
            Hi {session.displayName}! 👋
          </div>
          <div className="text-muted text-xs mt-1">
            {open.length} match{open.length !== 1 ? "es" : ""} open for prediction
          </div>
        </div>

        {rounds.length === 0 && (
          <div className="card-solid p-8 text-center">
            <div className="text-4xl mb-3">⏳</div>
            <div className="text-ink-text font-semibold">No matches open right now</div>
            <p className="text-muted text-sm mt-2">
              Check the Results tab for completed matches, or come back when new knockout rounds are announced.
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
            {round.matches.map((m) => (
              <ScorePicker
                key={m.id}
                matchId={m.id}
                teamA={m.team_a}
                teamB={m.team_b}
                teamACrest={m.team_a_crest ?? null}
                teamBCrest={m.team_b_crest ?? null}
                kickoffUtc={m.kickoff_utc}
                stage={m.stage}
                stageLabel={stageLabel(m.stage)}
                initialScoreA={predMap.get(m.id)?.scoreA ?? null}
                initialScoreB={predMap.get(m.id)?.scoreB ?? null}
                initialAdvances={predMap.get(m.id)?.advances ?? null}
                locked={false}
                otherPicks={otherPicksByMatch.get(m.id) ?? []}
              />
            ))}
          </RoundAccordion>
        ))}
      </main>
      <BottomNav active="predict" />
    </>
  );
}
