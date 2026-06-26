import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const API = "https://api.football-data.org/v4/competitions/WC/matches";
const GROUP_STAGES = new Set(["GROUP_STAGE", "GROUP"]);

export async function GET() {
  const log: Record<string, unknown> = {};

  try {
    // Step 1: check env vars
    const token = process.env.FOOTBALL_DATA_TOKEN;
    log.has_token = !!token;
    log.supabase_url = process.env.SUPABASE_URL ? "set" : "missing";
    log.supabase_key = process.env.SUPABASE_SERVICE_ROLE_KEY ? "set" : "missing";

    if (!token) return NextResponse.json({ error: "Missing FOOTBALL_DATA_TOKEN", log });

    // Step 2: call football-data.org
    const res = await fetch(API, {
      headers: { "X-Auth-Token": token },
      cache: "no-store",
    });
    log.api_status = res.status;
    log.api_ok = res.ok;

    const text = await res.text();
    log.api_response_preview = text.slice(0, 300);

    if (!res.ok) return NextResponse.json({ error: `API returned ${res.status}`, log });

    const data = JSON.parse(text) as { matches: any[] };
    const allMatches = data.matches ?? [];
    log.total_matches = allMatches.length;

    const knockout = allMatches.filter((m) => !GROUP_STAGES.has(m.stage));
    log.knockout_matches = knockout.length;
    log.stages_found = [...new Set(allMatches.map((m: any) => m.stage))];
    log.sample_knockout = knockout.slice(0, 2).map((m: any) => ({
      id: m.id,
      stage: m.stage,
      home: m.homeTeam?.name,
      away: m.awayTeam?.name,
      date: m.utcDate,
    }));

    // Step 3: try upsert
    const supabase = db();
    const rows = knockout.map((m: any) => ({
      external_id: m.id,
      team_a: m.homeTeam?.name ?? "TBD",
      team_b: m.awayTeam?.name ?? "TBD",
      team_a_crest: m.homeTeam?.crest ?? null,
      team_b_crest: m.awayTeam?.crest ?? null,
      kickoff_utc: m.utcDate,
      stage: m.stage,
      status: m.status === "TIMED" || m.status === "SCHEDULED" ? "TIMED" : m.status,
      score_a: m.score?.fullTime?.home ?? null,
      score_b: m.score?.fullTime?.away ?? null,
    }));

    log.rows_to_upsert = rows.length;

    if (rows.length > 0) {
      const { error, data: upsertData } = await supabase
        .from("kb_matches")
        .upsert(rows, { onConflict: "external_id" });
      log.upsert_error = error?.message ?? null;
      log.upsert_success = !error;
    }

    return NextResponse.json({ success: true, log });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? String(e), log });
  }
}
