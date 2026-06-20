import { db } from "./db";

const API = "https://api.football-data.org/v4/competitions/WC/matches";
const STALE_MS = 5 * 60 * 1000;

// Instead of filtering by a hardcoded stage list, we pull ALL matches
// from June 28 onward (knockout stage start). This ensures we capture
// the Round of 32 regardless of what label football-data.org uses.
const KNOCKOUT_START = "2026-06-28";

// Group stage labels to exclude (in case some group matches fall after June 28)
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

  const res = await fetch(`${API}?dateFrom=${KNOCKOUT_START}&dateTo=2026-07-20`, {
    headers: { "X-Auth-Token": token },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`football-data responded ${res.status}`);

  const data = (await res.json()) as { matches: ApiMatch[] };

  // Pull all non-group matches with real team names (not TBD)
  const knockout = (data.matches ?? []).filter(
    (m) =>
      !GROUP_STAGES.has(m.stage) &&
      m.homeTeam?.name &&
      m.awayTeam?.name &&
      m.homeTeam.name !== "TBD" &&
      m.awayTeam.name !== "TBD"
  );

  const supabase = db();

  const rows = knockout.map((m) => ({
    external_id: m.id,
    team_a: m.homeTeam.name!,
    team_b: m.awayTeam.name!,
    team_a_crest: m.homeTeam.crest ?? null,
    team_b_crest: m.awayTeam.crest ?? null,
    kickoff_utc: m.utcDate,
    stage: m.stage,
    status: m.status === "TIMED" || m.status === "SCHEDULED" ? "TIMED" : m.status,
    score_a: m.score?.fullTime?.home ?? null,
    score_b: m.score?.fullTime?.away ?? null,
  }));

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
