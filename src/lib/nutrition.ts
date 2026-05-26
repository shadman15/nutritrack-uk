// Nutrition calculation utilities

export function calculateTDEE({
  weightKg,
  heightCm,
  age,
  sex,
  activityLevel,
}: {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: string;
  activityLevel: string;
}): number {
  // Mifflin-St Jeor equation
  let bmr: number;
  if (sex === "male") {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  return Math.round(bmr * (multipliers[activityLevel] || 1.55));
}

export function calculateDailyCalories({
  tdee,
  weightGoal,
  weeklyGoalKg,
}: {
  tdee: number;
  weightGoal: string;
  weeklyGoalKg: number;
}): number {
  const dailyAdjustment = weeklyGoalKg * 7700 / 7; // 7700 kcal per kg

  if (weightGoal === "lose") {
    return Math.max(1200, Math.round(tdee - dailyAdjustment));
  } else if (weightGoal === "gain") {
    return Math.round(tdee + dailyAdjustment);
  }
  return tdee;
}

export function calculateMacros(
  calories: number,
  dietType: string
): { proteinG: number; carbsG: number; fatG: number } {
  const splits: Record<string, { protein: number; carbs: number; fat: number }> = {
    balanced: { protein: 0.3, carbs: 0.4, fat: 0.3 },
    high_protein: { protein: 0.4, carbs: 0.35, fat: 0.25 },
    keto: { protein: 0.3, carbs: 0.05, fat: 0.65 },
    vegan: { protein: 0.25, carbs: 0.5, fat: 0.25 },
    "5:2": { protein: 0.3, carbs: 0.4, fat: 0.3 },
  };

  const split = splits[dietType] || splits.balanced;

  return {
    proteinG: Math.round((calories * split.protein) / 4),
    carbsG: Math.round((calories * split.carbs) / 4),
    fatG: Math.round((calories * split.fat) / 9),
  };
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Healthy Weight";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export function estimateWeeksToGoal(
  currentWeightKg: number,
  targetWeightKg: number,
  weeklyGoalKg: number
): number {
  if (!targetWeightKg || weeklyGoalKg === 0) return 0;
  return Math.ceil(Math.abs(targetWeightKg - currentWeightKg) / weeklyGoalKg);
}

export function formatCalories(kcal: number): string {
  return Math.round(kcal).toLocaleString();
}

export function getCalorieProgress(consumed: number, goal: number): number {
  return Math.min(100, Math.round((consumed / goal) * 100));
}

export function getNutrientForQuantity(
  per100g: number,
  quantityG: number
): number {
  return Math.round(((per100g * quantityG) / 100) * 10) / 10;
}
