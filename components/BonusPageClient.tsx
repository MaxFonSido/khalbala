"use client";

import { useState } from "react";
import PlayerSearch from "./PlayerSearch";

type Player = { name: string; team: string };

type BonusPick = {
  name: string;
  avatarEmoji: string | null;
  champion: string | null;
  topScorer: string | null;
  topScorerTeam: string | null;
  isMe: boolean;
};

type Props = {
  initialChampion: string | null;
  initialTopScorer: string | null;
  teams: string[];
  players: Player[];
  initialPicks: BonusPick[];
  myName: string;
  myEmoji: string | null;
};

function flagUrl(teamName: string | null): string | null {
  if (!teamName) return null;
  const map: Record<string, string> = {
    "Argentina": "ar", "Brazil": "br", "France": "fr", "England": "gb-eng",
    "Germany": "de", "Spain": "es", "Portugal": "pt", "Netherlands": "nl",
    "Italy": "it", "Belgium": "be", "Uruguay": "uy", "Croatia": "hr",
    "Morocco": "ma", "Japan": "jp", "South Korea": "kr", "Australia": "au",
    "United States": "us", "Mexico": "mx", "Canada": "ca", "Ecuador": "ec",
    "Senegal": "sn", "Ghana": "gh", "Cameroon": "cm", "Nigeria": "ng",
    "South Africa": "za", "Egypt": "eg", "Algeria": "dz", "Tunisia": "tn",
    "Saudi Arabia": "sa", "Iran": "ir", "Qatar": "qa", "Serbia": "rs",
    "Poland": "pl", "Switzerland": "ch", "Denmark": "dk", "Sweden": "se",
    "Turkey": "tr", "Ukraine": "ua", "Colombia": "co", "Chile": "cl",
    "Peru": "pe", "Panama": "pa", "Costa Rica": "cr", "Honduras": "hn",
    "Jamaica": "jm", "New Zealand": "nz", "Indonesia": "id",
    "Wales": "gb-wls", "Scotland": "gb-sct", "Slovakia": "sk",
    "Czech Republic": "cz", "Hungary": "hu", "Romania": "ro", "Greece": "gr",
    "Austria": "at", "Ireland": "ie", "Iceland": "is", "Ivory Coast": "ci",
    "Côte d'Ivoire": "ci", "Mali": "ml", "Burkina Faso": "bf",
    "Cape Verde": "cv", "Venezuela": "ve", "Paraguay": "py", "Bolivia": "bo",
    "El Salvador": "sv", "Guatemala": "gt", "Cuba": "cu",
    "Iraq": "iq", "Uzbekistan": "uz", "Bahrain": "bh", "Kuwait": "kw",
    "Jordan": "jo", "Lebanon": "lb", "Bulgaria": "bg", "Albania": "al",
    "Bosnia and Herzegovina": "ba", "Slovenia": "si", "Finland": "fi",
    "Luxembourg": "lu", "Norway": "no", "North Macedonia": "mk",
  };
  const iso = map[teamName];
  return iso ? `https://flagcdn.com/w40/${iso}.png` : null;
}

function Flag({ team, size = "lg" }: { team: string | null; size?: "sm" | "lg" }) {
  const url = flagUrl(team);
  if (!url || !team) return null;
  const cls = size === "lg"
    ? "h-5 w-7 object-cover rounded-sm flex-shrink-0"
    : "h-3.5 w-5 object-cover rounded-sm flex-shrink-0";
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={team} className={cls} />;
}

export default function BonusPageClient({
  initialChampion, initialTopScorer, teams, players, initialPicks, myName, myEmoji,
}: Props) {
  const [champion, setChampion] = useState(initialChampion ?? "");
  const [topScorer, setTopScorer] = useState(initialTopScorer ?? "");
  const [saved, setSaved] = useState(!!(initialChampion || initialTopScorer));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [picks, setPicks] = useState<BonusPick[]>(initialPicks);

  const playerTeamMap = new Map(players.map((p) => [p.name, p.team]));

  async function save() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/bonus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ champion: champion || null, topScorer: topScorer || null }),
      });
      if (res.ok) {
        setSaved(true);
        // Optimistically update my pick in the family list
        setPicks((prev) => {
          const others = prev.filter((p) => !p.isMe);
          return [{
            name: myName,
            avatarEmoji: myEmoji,
            champion: champion || null,
            topScorer: topScorer || null,
            topScorerTeam: topScorer ? (playerTeamMap.get(topScorer) ?? null) : null,
            isMe: true,
          }, ...others];
        });
      } else {
        const d = await res.json();
        setError(d.error ?? "Failed to save");
      }
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Form */}
      <div className="card-solid p-5 mb-4">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gold mb-1.5 font-semibold">🏆 World Cup Champion</label>
            <select
              value={champion}
              onChange={(e) => { setChampion(e.target.value); setSaved(false); }}
              className="w-full rounded-xl bg-ink border border-surface-border px-4 py-3 text-ink-text focus:outline-none focus:border-gold text-sm"
            >
              <option value="">— Pick a team —</option>
              {teams.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gold mb-1.5 font-semibold">⚽ Tournament Top Scorer</label>
            <PlayerSearch
              players={players}
              value={topScorer}
              onChange={(name) => { setTopScorer(name); setSaved(false); }}
            />
            <p className="text-xs text-muted mt-1">Search by player or team name</p>
          </div>

          {error && <p className="text-ember text-xs">{error}</p>}

          <button
            onClick={save}
            disabled={busy || (!champion && !topScorer)}
            className={`w-full rounded-xl py-3 text-sm font-bold transition-all active:scale-95 ${
              saved ? "bg-surface-btn text-gold border border-gold/30" : "btn-primary"
            }`}
          >
            {busy ? "Saving..." : saved ? "✓ Bonus Picks Saved" : "Save Bonus Picks"}
          </button>
        </div>
      </div>

      {/* Family Champion picks */}
      <div className="card-solid overflow-hidden mb-4">
        <div className="px-4 py-2.5 border-b border-surface-border">
          <span className="text-[10px] font-bold text-gold uppercase tracking-widest">🏆 World Cup Champion — Family Picks</span>
        </div>
        {picks.map((p) => (
          <div key={p.name} className={`flex items-center gap-3 px-4 py-2.5 border-b border-surface-border last:border-0 ${p.isMe ? "bg-gold/5" : ""}`}>
            <span className="text-lg leading-none">{p.avatarEmoji ?? "👤"}</span>
            <span className={`text-xs font-semibold flex-1 ${p.isMe ? "text-gold" : "text-ink-text"}`}>
              {p.name}{p.isMe && <span className="text-[10px] text-gold ml-1">(you)</span>}
            </span>
            {p.champion ? (
              <div className="flex items-center gap-2">
                <Flag team={p.champion} size="lg" />
                <span className="text-sm font-bold text-ink-text">{p.champion}</span>
              </div>
            ) : (
              <span className="text-xs text-muted italic">No pick yet</span>
            )}
          </div>
        ))}
      </div>

      {/* Family Top Scorer picks */}
      <div className="card-solid overflow-hidden">
        <div className="px-4 py-2.5 border-b border-surface-border">
          <span className="text-[10px] font-bold text-gold uppercase tracking-widest">⚽ Top Scorer — Family Picks</span>
        </div>
        {picks.map((p) => (
          <div key={p.name} className={`flex items-center gap-3 px-4 py-2.5 border-b border-surface-border last:border-0 ${p.isMe ? "bg-gold/5" : ""}`}>
            <span className="text-lg leading-none">{p.avatarEmoji ?? "👤"}</span>
            <span className={`text-xs font-semibold flex-1 ${p.isMe ? "text-gold" : "text-ink-text"}`}>
              {p.name}{p.isMe && <span className="text-[10px] text-gold ml-1">(you)</span>}
            </span>
            {p.topScorer ? (
              <div className="flex items-center gap-2">
                <Flag team={p.topScorerTeam} size="sm" />
                <div className="text-right">
                  <div className="text-sm font-bold text-ink-text">{p.topScorer}</div>
                  {p.topScorerTeam && <div className="text-[10px] text-muted">{p.topScorerTeam}</div>}
                </div>
              </div>
            ) : (
              <span className="text-xs text-muted italic">No pick yet</span>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
