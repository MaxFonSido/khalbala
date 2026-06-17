import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { champion, topScorer } = await req.json();

  const supabase = db();

  // Check if bonus picks are still open
  const { data: meta } = await supabase
    .from("kb_meta")
    .select("value")
    .eq("key", "bonus_locked")
    .maybeSingle();

  if (meta?.value === "true") {
    return NextResponse.json({ error: "Bonus picks are locked" }, { status: 400 });
  }

  const { error } = await supabase
    .from("kb_bonus")
    .upsert(
      { user_id: session.userId, champion: champion ?? null, top_scorer: topScorer ?? null },
      { onConflict: "user_id" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const supabase = db();
  const { data } = await supabase
    .from("kb_bonus")
    .select("champion, top_scorer")
    .eq("user_id", session.userId)
    .maybeSingle();

  return NextResponse.json(data ?? { champion: null, top_scorer: null });
}
