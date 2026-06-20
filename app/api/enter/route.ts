import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";
import { createSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const sharedSecret = process.env.KHALBALA_SHARED_SECRET;
  if (!sharedSecret) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  let displayName: string;
  let avatarEmoji: string | null = null;
  try {
    const secret = new TextEncoder().encode(sharedSecret);
    const { payload } = await jwtVerify(token, secret);
    displayName = payload.displayName as string;
    avatarEmoji = (payload.avatarEmoji as string) || null;
    if (!displayName) throw new Error("No displayName in token");
  } catch {
    return NextResponse.redirect(new URL("/?error=invalid", req.url));
  }

  const supabase = db();

  let { data: user } = await supabase
    .from("kb_users")
    .select("id, display_name")
    .eq("display_name", displayName)
    .maybeSingle();

  if (!user) {
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    const { data: newUser, error } = await supabase
      .from("kb_users")
      .insert({
        display_name: displayName,
        pin: randomPin,
        avatar_emoji: avatarEmoji,
      })
      .select("id, display_name")
      .single();

    if (error || !newUser) {
      const { data: existing } = await supabase
        .from("kb_users")
        .select("id, display_name")
        .eq("display_name", displayName)
        .maybeSingle();

      if (!existing) {
        return NextResponse.redirect(new URL("/?error=create", req.url));
      }
      user = existing;
    } else {
      user = newUser;
    }
  }

  // Update avatar_emoji on each login (in case it changed in the main app)
  if (avatarEmoji) {
    await supabase
      .from("kb_users")
      .update({ avatar_emoji: avatarEmoji })
      .eq("id", user.id);
  }

  await createSession({ userId: user.id, displayName: user.display_name });

  const gameUrl = new URL("/game", req.url);
  return NextResponse.redirect(gameUrl);
}
