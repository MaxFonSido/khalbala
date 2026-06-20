import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getSession();
  if (session) redirect("/game");

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5">
      <div className="text-center mb-10">
        <div className="text-xs font-bold tracking-widest text-gold uppercase mb-2">
          Family World Cup 2026
        </div>
        <h1 className="text-4xl font-extrabold text-ink-text mb-1">Khal Bala</h1>
        <p className="text-gold text-lg" dir="rtl">خال بالا</p>
        <p className="text-muted text-sm mt-3 max-w-xs mx-auto">
          Advanced knockout stage predictions — exact scores, multipliers, and glory.
        </p>
      </div>

      <div className="w-full max-w-sm">
        <div className="card-solid p-6 text-center">
          <p className="text-ink-text font-semibold mb-2">Access via the Predictions App</p>
          <p className="text-muted text-sm">
            Tap the Khal Bala banner in the World Cup Predictions app to enter automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
