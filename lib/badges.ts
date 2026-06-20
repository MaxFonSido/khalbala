import { scoreMatch, type Stage } from "./scoring";

export type Badge = {
  emoji: string;
  name: string;
  nameFA: string;
  description: string;
  descriptionFA: string;
};

export const ALL_BADGES: Record<string, Badge> = {
  oracle: {
    emoji: "🔮",
    name: "The Oracle",
    nameFA: "پیشگو",
    description: "Highest accuracy rate — most correct predictions out of total",
    descriptionFA: "بالاترین درصد پیش‌بینی صحیح",
  },
  sharpshooter: {
    emoji: "🎯",
    name: "Sharpshooter",
    nameFA: "تیرانداز",
    description: "Most exact-score predictions",
    descriptionFA: "بیشترین نتایج دقیق",
  },
  giantkiller: {
    emoji: "💀",
    name: "Giant Killer",
    nameFA: "غول‌کُش",
    description: "Correctly predicted the most upsets (away team wins)",
    descriptionFA: "بیشترین پیش‌بینی صحیح برد تیم مهمان",
  },
  onfire: {
    emoji: "🔥",
    name: "On Fire",
    nameFA: "آتیش‌پاره",
    description: "Longest current streak of correct predictions (3+)",
    descriptionFA: "طولانی‌ترین رشته پیش‌بینی صحیح (۳+)",
  },
  underdog: {
    emoji: "🐢",
    name: "Underdog",
    nameFA: "سرسخت",
    description: "Lowest score but still predicted on most matches — respect!",
    descriptionFA: "کمترین امتیاز ولی هنوز پابرجا — احترام!",
  },
};

type MatchData = { id: string; stage: string; score_a: number; score_b: number; kickoff_utc: string };
type PredData = { user_id: string; match_id: string; score_a: number; score_b: number };

export function calculateBadges(
  users: { id: string; name: string }[],
  finishedMatches: MatchData[],
  allPreds: PredData[]
): Map<string, string[]> {
  if (finishedMatches.length === 0) return new Map();

  const badges = new Map<string, string[]>();
  for (const u of users) badges.set(u.id, []);

  // Sort matches by kickoff for streak calculation
  const sortedMatches = [...finishedMatches].sort(
    (a, b) => new Date(a.kickoff_utc).getTime() - new Date(b.kickoff_utc).getTime()
  );

  const predMap = new Map<string, PredData>();
  for (const p of allPreds) {
    predMap.set(`${p.user_id}:${p.match_id}`, p);
  }

  // Per-user stats
  const stats = new Map<string, {
    total: number; correct: number; exact: number; upsets: number; streak: number; pts: number;
  }>();

  for (const u of users) {
    let correct = 0, exact = 0, total = 0, upsets = 0, pts = 0;
    let currentStreak = 0, maxStreak = 0;

    for (const m of sortedMatches) {
      const pred = predMap.get(`${u.id}:${m.id}`);
      if (!pred) { currentStreak = 0; continue; }
      total++;

      const result = scoreMatch(pred.score_a, pred.score_b, m.score_a, m.score_b, m.stage as Stage);
      pts += result.totalPoints;

      if (result.label !== "wrong") {
        correct++;
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);

        if (result.label === "exact") exact++;

        // Upset = team_b (away) won and user predicted it correctly
        if (m.score_b > m.score_a && pred.score_b > pred.score_a) {
          upsets++;
        }
      } else {
        currentStreak = 0;
      }
    }

    stats.set(u.id, { total, correct, exact, upsets, streak: maxStreak, pts });
  }

  // Only consider users who have predicted at least 1 match
  const active = users.filter((u) => (stats.get(u.id)?.total ?? 0) > 0);
  if (active.length === 0) return badges;

  // 🔮 Oracle — highest accuracy rate (correct/total)
  let bestAccuracy = -1;
  let oracleId = "";
  for (const u of active) {
    const s = stats.get(u.id)!;
    const rate = s.correct / s.total;
    if (rate > bestAccuracy) { bestAccuracy = rate; oracleId = u.id; }
  }
  if (oracleId && bestAccuracy > 0) badges.get(oracleId)!.push("oracle");

  // 🎯 Sharpshooter — most exact-score predictions
  let bestExact = 0;
  let sharpshooterId = "";
  for (const u of active) {
    const s = stats.get(u.id)!;
    if (s.exact > bestExact) { bestExact = s.exact; sharpshooterId = u.id; }
  }
  if (sharpshooterId && bestExact > 0) badges.get(sharpshooterId)!.push("sharpshooter");

  // 💀 Giant Killer — most correctly predicted upsets
  let bestUpsets = 0;
  let giantKillerId = "";
  for (const u of active) {
    const s = stats.get(u.id)!;
    if (s.upsets > bestUpsets) { bestUpsets = s.upsets; giantKillerId = u.id; }
  }
  if (giantKillerId && bestUpsets > 0) badges.get(giantKillerId)!.push("giantkiller");

  // 🔥 On Fire — longest current streak (must be 3+)
  let bestStreak = 2; // minimum 3 to qualify
  let onFireId = "";
  for (const u of active) {
    const s = stats.get(u.id)!;
    if (s.streak > bestStreak) { bestStreak = s.streak; onFireId = u.id; }
  }
  if (onFireId) badges.get(onFireId)!.push("onfire");

  // 🐢 Underdog — lowest score, but predicted on at least half of finished matches
  const minRequired = Math.ceil(finishedMatches.length / 2);
  let lowestPts = Infinity;
  let underdogId = "";
  for (const u of active) {
    const s = stats.get(u.id)!;
    if (s.total >= minRequired && s.pts < lowestPts) {
      lowestPts = s.pts; underdogId = u.id;
    }
  }
  if (underdogId && active.length > 1) badges.get(underdogId)!.push("underdog");

  return badges;
}
