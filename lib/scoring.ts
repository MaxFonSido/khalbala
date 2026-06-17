// ─── Khal Bala Scoring Engine ────────────────────────────────
// Points per match:
//   Exact score:              5 pts
//   Correct winner + goal diff: 3 pts
//   Correct winner only:      1 pt
//   Wrong:                    0 pts
//
// Knockout multipliers:
//   Round of 32:   ×1
//   Quarter-finals: ×2
//   Semi-finals:   ×3
//   Final:         ×4
//
// Bonus predictions:
//   Champion:      +10 pts
//   Top Scorer:    +8 pts

export type Stage =
  | "LAST_16"
  | "QUARTER_FINALS"
  | "SEMI_FINALS"
  | "FINAL"
  | string;

export function stageMultiplier(stage: Stage): number {
  if (stage === "FINAL") return 4;
  if (stage === "SEMI_FINALS") return 3;
  if (stage === "QUARTER_FINALS") return 2;
  return 1; // LAST_16 and anything else
}

export function stageLabel(stage: Stage): string {
  if (stage === "FINAL") return "Final ×4";
  if (stage === "SEMI_FINALS") return "Semi-finals ×3";
  if (stage === "QUARTER_FINALS") return "Quarter-finals ×2";
  if (stage === "LAST_16") return "Round of 32 ×1";
  return stage;
}

export type ScoreResult = {
  basePoints: number;
  multiplier: number;
  totalPoints: number;
  label: "exact" | "winner+gd" | "winner" | "wrong";
};

export function scoreMatch(
  predictedA: number,
  predictedB: number,
  actualA: number,
  actualB: number,
  stage: Stage
): ScoreResult {
  const multiplier = stageMultiplier(stage);

  // Exact score
  if (predictedA === actualA && predictedB === actualB) {
    return { basePoints: 5, multiplier, totalPoints: 5 * multiplier, label: "exact" };
  }

  const predictedWinner = Math.sign(predictedA - predictedB); // 1, 0, -1
  const actualWinner = Math.sign(actualA - actualB);
  const correctWinner = predictedWinner === actualWinner;

  if (correctWinner) {
    const predictedGD = Math.abs(predictedA - predictedB);
    const actualGD = Math.abs(actualA - actualB);

    // Correct winner + goal difference
    if (predictedGD === actualGD) {
      return { basePoints: 3, multiplier, totalPoints: 3 * multiplier, label: "winner+gd" };
    }

    // Correct winner only
    return { basePoints: 1, multiplier, totalPoints: 1 * multiplier, label: "winner" };
  }

  return { basePoints: 0, multiplier, totalPoints: 0, label: "wrong" };
}

export const BONUS_CHAMPION_PTS = 10;
export const BONUS_TOP_SCORER_PTS = 8;

export function scoreLabel(label: ScoreResult["label"]): string {
  if (label === "exact") return "⭐ Exact Score!";
  if (label === "winner+gd") return "✅ Right winner + goal diff";
  if (label === "winner") return "👍 Right winner";
  return "❌ Wrong";
}
