import { describe, it, expect } from "vitest";
import {
  calculateBMR,
  calculateTDEE,
  calculateCalorieTarget,
  calculateMacros,
  calculateBMI,
  bmiCategory,
  calculateAge,
  ACTIVITY_MULTIPLIERS,
} from "@/lib/nutrition";

describe("calculateBMR (Mifflin-St Jeor)", () => {
  it("calculates BMR for male correctly", () => {
    // 80kg, 175cm, 36yo male: 10*80 + 6.25*175 - 5*36 + 5 = 800 + 1093.75 - 180 + 5 = 1718.75
    const bmr = calculateBMR(80, 175, 36, "male");
    expect(bmr).toBeCloseTo(1718.75, 1);
  });

  it("calculates BMR for female correctly", () => {
    // 62kg, 165cm, 31yo female: 10*62 + 6.25*165 - 5*31 - 161 = 620 + 1031.25 - 155 - 161 = 1335.25
    const bmr = calculateBMR(62, 165, 31, "female");
    expect(bmr).toBeCloseTo(1335.25, 1);
  });

  it("calculates BMR for other gender (average offset)", () => {
    // 70kg, 170cm, 30yo other: 10*70 + 6.25*170 - 5*30 - 78 = 700 + 1062.5 - 150 - 78 = 1534.5
    const bmr = calculateBMR(70, 170, 30, "other");
    expect(bmr).toBeCloseTo(1534.5, 1);
  });

  it("male has higher BMR than female at same stats", () => {
    const male = calculateBMR(70, 170, 30, "male");
    const female = calculateBMR(70, 170, 30, "female");
    expect(male).toBeGreaterThan(female);
  });
});

describe("calculateTDEE", () => {
  it("applies sedentary multiplier (1.2)", () => {
    const tdee = calculateTDEE(1500, "sedentary");
    expect(tdee).toBeCloseTo(1800, 1);
  });

  it("applies moderate multiplier (1.55)", () => {
    const tdee = calculateTDEE(1500, "moderate");
    expect(tdee).toBeCloseTo(2325, 1);
  });

  it("applies very_active multiplier (1.9)", () => {
    const tdee = calculateTDEE(1500, "very_active");
    expect(tdee).toBeCloseTo(2850, 1);
  });

  it("defaults to sedentary for unknown level", () => {
    const tdee = calculateTDEE(1500, "unknown" as never);
    expect(tdee).toBeCloseTo(1800, 1);
  });
});

describe("calculateCalorieTarget", () => {
  it("subtracts 500 for weight loss", () => {
    expect(calculateCalorieTarget(2500, "lose")).toBe(2000);
  });

  it("adds 400 for weight gain", () => {
    expect(calculateCalorieTarget(2500, "gain")).toBe(2900);
  });

  it("keeps TDEE for maintenance", () => {
    expect(calculateCalorieTarget(2500, "maintain")).toBe(2500);
  });

  it("enforces minimum 1200 for weight loss", () => {
    expect(calculateCalorieTarget(1500, "lose")).toBe(1200);
  });
});

describe("calculateMacros", () => {
  it("returns balanced macros by default", () => {
    const m = calculateMacros(2000, "balanced");
    // Default split ~30/40/30 → 150g protein, 200g carbs, ~67g fat
    expect(m.proteinTarget).toBeGreaterThan(100);
    expect(m.carbTarget).toBeGreaterThan(m.proteinTarget);
    expect(m.fatTarget).toBeGreaterThan(40);
  });

  it("keto reduces carbs drastically", () => {
    const m = calculateMacros(2000, "keto");
    const balanced = calculateMacros(2000, "balanced");
    expect(m.carbTarget).toBeLessThan(balanced.carbTarget / 2);
    expect(m.fatTarget).toBeGreaterThan(balanced.fatTarget);
  });

  it("high-protein increases protein", () => {
    const m = calculateMacros(2000, "high-protein");
    const balanced = calculateMacros(2000, "balanced");
    expect(m.proteinTarget).toBeGreaterThan(balanced.proteinTarget);
  });

  it("macros sum to approximately the calorie target", () => {
    const m = calculateMacros(2000, "balanced");
    const totalCal = m.proteinTarget * 4 + m.carbTarget * 4 + m.fatTarget * 9;
    expect(totalCal).toBeGreaterThan(1900);
    expect(totalCal).toBeLessThan(2100);
  });
});

describe("calculateBMI", () => {
  it("calculates BMI correctly", () => {
    // 70kg, 175cm: 70 / (1.75^2) = 70 / 3.0625 = 22.86
    expect(calculateBMI(70, 175)).toBeCloseTo(22.86, 1);
  });

  it("returns higher BMI for heavier weight at same height", () => {
    expect(calculateBMI(90, 175)).toBeGreaterThan(calculateBMI(70, 175));
  });
});

describe("bmiCategory", () => {
  it("classifies underweight", () => {
    expect(bmiCategory(17)).toBe("Underweight");
  });

  it("classifies healthy", () => {
    expect(bmiCategory(22)).toBe("Healthy");
  });

  it("classifies overweight", () => {
    expect(bmiCategory(27)).toBe("Overweight");
  });

  it("classifies obese", () => {
    expect(bmiCategory(32)).toBe("Obese");
  });
});

describe("calculateAge", () => {
  it("calculates age from date of birth", () => {
    const dob = new Date("1990-01-15");
    const age = calculateAge(dob);
    expect(age).toBeGreaterThanOrEqual(35);
  });

  it("handles birthday not yet passed this year", () => {
    const dob = new Date("1990-12-31");
    const age = calculateAge(dob);
    expect(age).toBeGreaterThanOrEqual(34);
  });
});

describe("ACTIVITY_MULTIPLIERS", () => {
  it("has all five activity levels", () => {
    expect(Object.keys(ACTIVITY_MULTIPLIERS)).toHaveLength(5);
  });

  it("multipliers are in ascending order", () => {
    expect(ACTIVITY_MULTIPLIERS.sedentary).toBeLessThan(ACTIVITY_MULTIPLIERS.light);
    expect(ACTIVITY_MULTIPLIERS.light).toBeLessThan(ACTIVITY_MULTIPLIERS.moderate);
    expect(ACTIVITY_MULTIPLIERS.moderate).toBeLessThan(ACTIVITY_MULTIPLIERS.active);
    expect(ACTIVITY_MULTIPLIERS.active).toBeLessThan(ACTIVITY_MULTIPLIERS.very_active);
  });
});
