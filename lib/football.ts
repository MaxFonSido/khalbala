import { db } from "./db";

const API = "https://api.football-data.org/v4/competitions/WC/matches";
const STALE_MS = 5 * 60 * 1000;

// Group stage labels to exclude — fetch all matches and filter in code,
// same pattern as the main app (free tier token doesn't support dateFrom/dateTo).
const GROUP_STAGES = new Set(["GROUP_STAGE", "GROUP"]);

type ApiTeam = { name: string | null; tla: string | null; crest: string | null };
type ApiMatch = {
  id: number;
  utcDate: string;
  status: string;
  stage: string;
  homeTeam: ApiTeam;
  awayTeam: ApiTeam;
  score: { winner: string | null; fullTime: { home: number | null; away: number | null } };
};

export async function syncKnockoutMatches(): Promise<{ updated: number }> {
  const token = process.env.FOOTBALL_DATA_TOKEN;
  if (!token) throw new Error("Missing FOOTBALL_DATA_TOKEN");

  const res = await fetch(API, {
    headers: { "X-Auth-Token": token },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`football-data responded ${res.status}`);

  const data = (await res.json()) as { matches: ApiMatch[] };

  // Pull all non-group matches (including TBD teams — they'll update on next sync)
  const knockout = (data.matches ?? []).filter(
    (m) => !GROUP_STAGES.has(m.stage)
  );

  const supabase = db();

  // Fetch existing matches so we never overwrite a real team name with TBD
  const { data: existing } = await supabase
    .from("kb_matches")
    .select("external_id, team_a, team_b, team_a_crest, team_b_crest");

  const existingMap = new Map(
    (existing ?? []).map((r: { external_id: number; team_a: string; team_b: string; team_a_crest: string | null; team_b_crest: string | null }) => [r.external_id, r])
  );

  const isReal = (name: string | null) => !!name && name !== "TBD";

  const rows = knockout.map((m) => {
    const prev = existingMap.get(m.id);
    const teamA = isReal(m.homeTeam?.name) ? m.homeTeam.name! : (prev?.team_a ?? "TBD");
    const teamB = isReal(m.awayTeam?.name) ? m.awayTeam.name! : (prev?.team_b ?? "TBD");
    const crestA = m.homeTeam?.crest ?? prev?.team_a_crest ?? null;
    const crestB = m.awayTeam?.crest ?? prev?.team_b_crest ?? null;

    return {
      external_id: m.id,
      team_a: teamA,
      team_b: teamB,
      team_a_crest: crestA,
      team_b_crest: crestB,
      kickoff_utc: m.utcDate,
      stage: m.stage,
      status: m.status === "TIMED" || m.status === "SCHEDULED" ? "TIMED" : m.status,
      score_a: m.score?.fullTime?.home ?? null,
      score_b: m.score?.fullTime?.away ?? null,
    };
  });

  if (rows.length > 0) {
    const { error } = await supabase
      .from("kb_matches")
      .upsert(rows, { onConflict: "external_id" });
    if (error) throw new Error(error.message);
  }

  await supabase
    .from("kb_meta")
    .upsert({ key: "last_sync", value: new Date().toISOString() }, { onConflict: "key" });

  return { updated: rows.length };
}

export async function syncIfStale(): Promise<void> {
  try {
    const supabase = db();
    const { data } = await supabase
      .from("kb_meta")
      .select("value")
      .eq("key", "last_sync")
      .maybeSingle();
    const last = data?.value ? new Date(data.value).getTime() : 0;
    if (Date.now() - last < STALE_MS) return;

    await supabase
      .from("kb_meta")
      .upsert({ key: "last_sync", value: new Date().toISOString() }, { onConflict: "key" });

    await syncKnockoutMatches();
  } catch (e) {
    console.error("syncIfStale failed (ignored):", e);
  }
}
