import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession } from "@/lib/session";

export async function POST(req: Request) {
  const { displayName, pin } = await req.json();
  if (!displayName || !pin) {
    return NextResponse.json({ error: "Missing name or PIN" }, { status: 400 });
  }

  const supabase = db();
  const { data: user } = await supabase
    .from("kb_users")
    .select("id, display_name")
    .eq("display_name", displayName.trim())
    .eq("pin", pin.trim())
    .maybeSingle();

  if (!user) {
    return NextResponse.json({ error: "Wrong name or PIN." }, { status: 401 });
  }

  await createSession({ userId: user.id, displayName: user.display_name });
  return NextResponse.json({ ok: true });
}
