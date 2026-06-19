import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getSession();
  if (session) redirect("/game");

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="text-6xl mb-4">🃏</div>
        <div className="text-xs font-bold tracking-widest text-purple-400 uppercase mb-2">
          Family World Cup 2026
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-1">Khal Bala</h1>
        <p className="text-purple-300 text-lg" dir="rtl">خال بالا</p>
        <p className="text-purple-300/70 text-sm mt-3 max-w-xs mx-auto">
          Advanced knockout stage predictions — exact scores, multipliers, and glory.
        </p>
      </div>

      <div className="w-full max-w-sm">
        <div className="card-solid p-6 shadow-card text-center">
          <p className="text-white font-semibold mb-2">Access via the Predictions App</p>
          <p className="text-purple-300/70 text-sm">
            Tap the Khal Bala banner in the World Cup Predictions app to enter automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
