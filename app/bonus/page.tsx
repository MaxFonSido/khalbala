import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import BottomNav from "@/components/BottomNav";
import BackButton from "@/components/BackButton";
import BonusForm from "@/components/BonusForm";

export const dynamic = "force-dynamic";

export default async function BonusPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const supabase = db();

  const [{ data: bonus }, { data: meta }, { data: teams }] = await Promise.all([
    supabase.from("kb_bonus").select("champion, top_scorer").eq("user_id", session.userId).maybeSingle(),
    supabase.from("kb_meta").select("key, value").eq("key", "bonus_locked").maybeSingle(),
    supabase.from("kb_matches").select("team_a, team_b").order("kickoff_utc", { ascending: true }),
  ]);

  const locked = meta?.value === "true";
  const allTeams = [...new Set((teams ?? []).flatMap((m) => [m.team_a, m.team_b]))].sort();

  return (
    <>
      <main className="mx-auto max-w-2xl px-4 py-6 has-bottom-nav">
        <div className="card-solid px-6 py-5 mb-6 text-center">
          <div className="flex items-center justify-between mb-2">
            <BackButton />
            <div />
          </div>
          <div className="text-3xl mb-1">⭐</div>
          <div className="text-xs font-bold tracking-widest text-gold uppercase">Bonus Predictions</div>
          <div className="text-ink-text font-bold mt-1">Big points, big glory</div>
        </div>

        <BonusForm
          initialChampion={bonus?.champion ?? null}
          initialTopScorer={bonus?.top_scorer ?? null}
          locked={locked}
          teams={allTeams}
        />

        <div className="mt-4 card-solid p-4">
          <div className="text-xs font-bold text-gold uppercase tracking-widest mb-3">Points on offer</div>
          <div className="flex items-center justify-between py-2 border-b border-surface-border">
            <div className="flex items-center gap-2 text-sm text-ink-text">🏆 World Cup Champion</div>
            <div className="text-gold font-bold">+10 pts</div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2 text-sm text-ink-text">⚽ Tournament Top Scorer</div>
            <div className="text-gold font-bold">+8 pts</div>
          </div>
          <p className="text-xs text-muted mt-3">
            These lock at the start of the knockout stage and pay out at the Final.
          </p>
        </div>
      </main>
      <BottomNav active="bonus" />
    </>
  );
}
