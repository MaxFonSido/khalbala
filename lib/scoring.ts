// ─── Khal Bala Scoring Engine ────────────────────────────────
// Points per match:
//   Exact score:              5 pts × multiplier
//   Correct winner + goal diff: 3 pts × multiplier
//   Correct winner only:      1 pt × multiplier
//   Wrong:                   -1 pt (flat, no multiplier)
//
// Knockout multipliers:
//   Round of 32:   ×1
//   Round of 16:   ×1
//   Quarter-finals: ×2
//   Semi-finals:   ×3
//   Final:         ×4
//
// Bonus predictions:
//   Champion:      +10 pts
//   Top Scorer:    +8 pts

export type Stage =
  | "LAST_32"
  | "ROUND_OF_32"
  | "LAST_16"
  | "ROUND_OF_16"
  | "QUARTER_FINALS"
  | "SEMI_FINALS"
  | "THIRD_PLACE"
  | "FINAL"
  | string;

export function stageMultiplier(stage: Stage): number {
  if (stage === "FINAL") return 4;
  if (stage === "THIRD_PLACE") return 3;
  if (stage === "SEMI_FINALS") return 3;
  if (stage === "QUARTER_FINALS") return 2;
  // Round of 32 and Round of 16 both ×1
  return 1;
}

export function stageLabel(stage: Stage): string {
  if (stage === "FINAL") return "Final ×4";
  if (stage === "THIRD_PLACE") return "3rd Place ×3";
  if (stage === "SEMI_FINALS") return "Semi-finals ×3";
  if (stage === "QUARTER_FINALS") return "Quarter-finals ×2";
  if (stage === "LAST_16" || stage === "ROUND_OF_16") return "Round of 16 ×1";
  if (stage === "LAST_32" || stage === "ROUND_OF_32") return "Round of 32 ×1";
  return stage + " ×1";
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
  stage: Stage,
  advances?: string | null,
  teamA?: string,
  teamB?: string
): ScoreResult {
  const multiplier = stageMultiplier(stage);

  // Exact score
  if (predictedA === actualA && predictedB === actualB) {
    return { basePoints: 5, multiplier, totalPoints: 5 * multiplier, label: "exact" };
  }

  // Determine predicted winner — if draw predicted, use penalty advance pick
  const predictedDraw = predictedA === predictedB;
  let predictedWinner: number;
  if (predictedDraw && advances && teamA && teamB) {
    predictedWinner = advances === teamA ? 1 : advances === teamB ? -1 : 0;
  } else {
    predictedWinner = Math.sign(predictedA - predictedB);
  }

  const actualWinner = Math.sign(actualA - actualB);
  const correctWinner = predictedWinner === actualWinner;

  if (correctWinner) {
    const predictedGD = Math.abs(predictedA - predictedB);
    const actualGD = Math.abs(actualA - actualB);

    if (predictedGD === actualGD) {
      return { basePoints: 3, multiplier, totalPoints: 3 * multiplier, label: "winner+gd" };
    }

    return { basePoints: 1, multiplier, totalPoints: 1 * multiplier, label: "winner" };
  }

  // Wrong prediction: flat -1 penalty, no multiplier
  return { basePoints: -1, multiplier: 1, totalPoints: -1, label: "wrong" };
}

export const BONUS_CHAMPION_PTS = 10;
export const BONUS_TOP_SCORER_PTS = 8;

export function scoreLabel(label: ScoreResult["label"]): string {
  if (label === "exact") return "⭐ Exact Score!";
  if (label === "winner+gd") return "✅ Right winner + goal diff";
  if (label === "winner") return "👍 Right winner";
  return "❌ Wrong (-1)";
}
