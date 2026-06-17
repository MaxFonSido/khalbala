"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

const TABS = [
  { href: "/game", icon: "🃏", label: "Predict" },
  { href: "/leaderboard", icon: "🏅", label: "Ranking" },
  { href: "/bonus", icon: "⭐", label: "Bonus" },
];

export default function BottomNav({ displayName }: { displayName: string }) {
  const path = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#0f0a1a]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 pb-safe pt-2" style={{ paddingBottom: `calc(0.5rem + env(safe-area-inset-bottom, 0px))` }}>
        {TABS.map((tab) => {
          const active = path === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${
                active ? "text-purple-400" : "text-white/40 hover:text-white/70"
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-[10px] font-semibold">{tab.label}</span>
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-white/40 hover:text-white/70 transition-colors"
        >
          <span className="text-xl">🚪</span>
          <span className="text-[10px] font-semibold">Exit</span>
        </button>
      </div>
    </nav>
  );
}
