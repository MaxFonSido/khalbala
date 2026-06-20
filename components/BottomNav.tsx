"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

type NavItem = { key: string; label: string; icon: string; path: string };

const tabs: NavItem[] = [
  { key: "predict", label: "Predict", icon: "🃏", path: "/game" },
  { key: "results", label: "Results", icon: "📋", path: "/results" },
  { key: "ranking", label: "Ranking", icon: "🏅", path: "/leaderboard" },
  { key: "more", label: "More", icon: "···", path: "" },
];

export default function BottomNav({ active }: { active?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  const current = active ?? (
    pathname.startsWith("/game") ? "predict" :
    pathname.startsWith("/results") ? "results" :
    pathname.startsWith("/leaderboard") ? "ranking" :
    pathname.startsWith("/bonus") ? "more" : ""
  );

  function handleTab(tab: NavItem) {
    if (tab.key === "more") {
      setShowMore((v) => !v);
    } else {
      setShowMore(false);
      router.push(tab.path);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.close();
    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 300);
  }

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)}>
          <div
            className="absolute bottom-[64px] right-4 w-44 rounded-xl bg-surface border border-surface-border shadow-card overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { setShowMore(false); router.push("/bonus"); }}
              className="w-full px-4 py-3 text-left text-sm font-semibold text-ink-text flex items-center gap-3 active:bg-surface-btn transition-colors"
            >
              <span>⭐</span> Bonus
            </button>
            <div className="h-px bg-surface-border" />
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 text-left text-sm font-semibold text-ember flex items-center gap-3 active:bg-surface-btn transition-colors"
            >
              <span>🚪</span> Exit
            </button>
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-surface-border bg-ink/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {tabs.map((tab) => {
            const isActive = tab.key === current || (tab.key === "more" && showMore);
            return (
              <button
                key={tab.key}
                onClick={() => handleTab(tab)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                  isActive ? "text-gold" : "text-muted"
                }`}
              >
                <span className={`text-lg ${isActive ? "" : "opacity-50"}`}>
                  {tab.key === "more" ? (
                    <span className="text-sm font-bold tracking-widest">•••</span>
                  ) : tab.icon}
                </span>
                <span className="text-[10px] font-bold">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
