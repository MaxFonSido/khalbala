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

  // Verify the token from the prediction app
  let displayName: string;
  try {
    const secret = new TextEncoder().encode(sharedSecret);
    const { payload } = await jwtVerify(token, secret);
    displayName = payload.displayName as string;
    if (!displayName) throw new Error("No displayName in token");
  } catch {
    // Invalid or expired token
    return NextResponse.redirect(new URL("/?error=invalid", req.url));
  }

  const supabase = db();

  // Find or create the user in kb_users
  let { data: user } = await supabase
    .from("kb_users")
    .select("id, display_name")
    .eq("display_name", displayName)
    .maybeSingle();

  if (!user) {
    // Auto-create — generate a random PIN (never used, manual login is disabled)
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    const { data: newUser, error } = await supabase
      .from("kb_users")
      .insert({ display_name: displayName, pin: randomPin })
      .select("id, display_name")
      .single();

    if (error || !newUser) {
      // Likely a duplicate (row already exists despite our lookup missing it) —
      // try fetching it directly before giving up.
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

  // Create session and redirect to game
  await createSession({ userId: user.id, displayName: user.display_name });

  // Build absolute URL for the game page
  const gameUrl = new URL("/game", req.url);
  return NextResponse.redirect(gameUrl);
}
