export type NutritionGoal = 'fat-loss' | 'maintenance' | 'muscle-gain';

export type MacronutrientTargets = {
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
};

export type NutritionTargets = {
  goal: NutritionGoal;
  calories: number;
  macros: MacronutrientTargets;
  hydrationLiters: number;
};

export type MealLogShortcut = {
  id: string;
  label: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  enabled: boolean;
};

const calorieMultipliers: Record<NutritionGoal, number> = {
  'fat-loss': 30,
  maintenance: 34,
  'muscle-gain': 38,
};

const macroSplits: Record<NutritionGoal, { protein: number; carbs: number; fats: number }> = {
  'fat-loss': { protein: 0.35, carbs: 0.35, fats: 0.3 },
  maintenance: { protein: 0.3, carbs: 0.4, fats: 0.3 },
  'muscle-gain': { protein: 0.28, carbs: 0.47, fats: 0.25 },
};

export function buildNutritionTargets(goal: NutritionGoal, bodyweightKg: number): NutritionTargets {
  const calories = Math.round(bodyweightKg * calorieMultipliers[goal]);
  const split = macroSplits[goal];

  return {
    goal,
    calories,
    hydrationLiters: Number((bodyweightKg * 0.04).toFixed(1)),
    macros: {
      proteinGrams: Math.round((calories * split.protein) / 4),
      carbsGrams: Math.round((calories * split.carbs) / 4),
      fatsGrams: Math.round((calories * split.fats) / 9),
    },
  };
}

export const defaultNutritionTargets: NutritionTargets = buildNutritionTargets('maintenance', 74);

export const mealLogShortcuts: MealLogShortcut[] = [
  {
    id: 'overnight-oats',
    label: 'Overnight oats + whey',
    calories: 510,
    proteinGrams: 42,
    carbsGrams: 58,
    fatsGrams: 14,
    enabled: true,
  },
  {
    id: 'rice-chicken-bowl',
    label: 'Rice + chicken bowl',
    calories: 680,
    proteinGrams: 55,
    carbsGrams: 78,
    fatsGrams: 16,
    enabled: true,
  },
  {
    id: 'yogurt-fruit-snack',
    label: 'Greek yogurt + fruit',
    calories: 290,
    proteinGrams: 24,
    carbsGrams: 35,
    fatsGrams: 6,
    enabled: false,
  },
];
