"use client";

import { useRouter, usePathname } from "next/navigation";

const tabs = [
  { key: "predict", label: "Predict", icon: "🃏", path: "/game" },
  { key: "results", label: "Results", icon: "📋", path: "/results" },
  { key: "ranking", label: "Ranking", icon: "🏅", path: "/leaderboard" },
  { key: "bonus", label: "Bonus", icon: "⭐", path: "/bonus" },
];

export default function BottomNav({ active }: { active?: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const current = active ?? (
    pathname.startsWith("/game") ? "predict" :
    pathname.startsWith("/results") ? "results" :
    pathname.startsWith("/leaderboard") ? "ranking" :
    pathname.startsWith("/bonus") ? "bonus" : ""
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-surface-border bg-ink/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-2xl items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {tabs.map((tab) => {
          const isActive = tab.key === current;
          return (
            <button
              key={tab.key}
              onClick={() => router.push(tab.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                isActive ? "text-gold" : "text-muted"
              }`}
            >
              <span className={`text-lg ${isActive ? "" : "opacity-50"}`}>{tab.icon}</span>
              <span className="text-[10px] font-bold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
