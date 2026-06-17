"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleLogin() {
    if (!name.trim() || !pin.trim()) {
      setError("Please enter your name and PIN.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: name.trim(), pin: pin.trim() }),
      });
      if (res.ok) {
        router.push("/game");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Wrong name or PIN.");
      }
    } catch {
      setError("Something went wrong — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="card-solid p-6 shadow-card">
        <h2 className="text-center font-bold text-white mb-6">Enter the Game</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-purple-300 mb-1.5 font-semibold">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kiarash"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-purple-300 mb-1.5 font-semibold">PIN</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="••••"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 text-sm"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={busy}
            className="btn-primary w-full mt-2"
          >
            {busy ? "Entering..." : "Let's Play 🃏"}
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-purple-400/60 mt-4">
        Use the same name & PIN as the main family app
      </p>
    </div>
  );
}
