import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { matchId, scoreA, scoreB } = await req.json();
  if (!matchId || scoreA == null || scoreB == null) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (!Number.isInteger(scoreA) || !Number.isInteger(scoreB) || scoreA < 0 || scoreB < 0 || scoreA > 20 || scoreB > 20) {
    return NextResponse.json({ error: "Invalid scores" }, { status: 400 });
  }

  const supabase = db();

  // Check match is not locked
  const { data: match } = await supabase
    .from("kb_matches")
    .select("status, kickoff_utc")
    .eq("id", matchId)
    .maybeSingle();

  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });
  if (match.status === "IN_PLAY" || match.status === "FINISHED") {
    return NextResponse.json({ error: "Match is locked" }, { status: 400 });
  }
  if (new Date(match.kickoff_utc) <= new Date()) {
    return NextResponse.json({ error: "Match has started" }, { status: 400 });
  }

  const { error } = await supabase
    .from("kb_predictions")
    .upsert(
      { user_id: session.userId, match_id: matchId, score_a: scoreA, score_b: scoreB },
      { onConflict: "user_id,match_id" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
