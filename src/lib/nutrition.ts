// Nutrition calculation utilities — Mifflin-St Jeor BMR + activity multipliers + goal adjustments

export type Gender = "male" | "female" | "other";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";
export type Goal = "lose" | "maintain" | "gain";

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentary (little or no exercise)",
  light: "Lightly active (1-3 days/week)",
  moderate: "Moderately active (3-5 days/week)",
  active: "Very active (6-7 days/week)",
  very_active: "Extra active (physical job + training)",
};

/** Mifflin-St Jeor equation */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  gender: Gender,
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  if (gender === "male") return base + 5;
  if (gender === "female") return base - 161;
  return base - 78; // average for other
}

export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const m = today.getMonth() - dateOfBirth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
}

export function calculateTDEE(bmr: number, activity: ActivityLevel): number {
  return bmr * (ACTIVITY_MULTIPLIERS[activity] ?? 1.2);
}

/** Adjusts TDEE for weight goal: lose=-500/day, gain=+400/day */
export function calculateCalorieTarget(
  tdee: number,
  goal: Goal,
): number {
  if (goal === "lose") return Math.max(1200, tdee - 500);
  if (goal === "gain") return tdee + 400;
  return tdee;
}

/**
 * Macro split based on diet type + goal.
 * Returns grams per day for protein/carbs/fat at the given calorie target.
 */
export function calculateMacros(
  calorieTarget: number,
  dietType: string = "balanced",
  goal: Goal = "maintain",
) {
  let proteinPct = 0.3;
  let carbPct = 0.4;
  let fatPct = 0.3;

  const d = dietType.toLowerCase();
  if (d.includes("keto") || d.includes("low-carb")) {
    proteinPct = 0.25;
    carbPct = 0.1;
    fatPct = 0.65;
  } else if (d.includes("high-protein")) {
    proteinPct = 0.4;
    carbPct = 0.35;
    fatPct = 0.25;
  } else if (d.includes("mediterranean")) {
    proteinPct = 0.25;
    carbPct = 0.45;
    fatPct = 0.3;
  }

  if (goal === "lose") {
    proteinPct = Math.min(0.4, proteinPct + 0.05);
  }

  // Normalize
  const total = proteinPct + carbPct + fatPct;
  proteinPct /= total;
  carbPct /= total;
  fatPct /= total;

  return {
    proteinTarget: Math.round((calorieTarget * proteinPct) / 4), // 4 cal/g
    carbTarget: Math.round((calorieTarget * carbPct) / 4),
    fatTarget: Math.round((calorieTarget * fatPct) / 9), // 9 cal/g
  };
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const h = heightCm / 100;
  return weightKg / (h * h);
}

export function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Healthy";
  if (bmi < 30) return "Overweight";
  return "Obese";
}
