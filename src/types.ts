export type Sex = 'male' | 'female';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active';

export type Goal = 'lose' | 'maintain' | 'gain';

export interface Profile {
  name: string;
  sex: Sex;
  age: number;
  heightCm: number;
  currentWeightKg: number;
  goalWeightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  /** kg to lose (or gain) per week, e.g. 0.5 */
  weeklyRateKg: number;
}

export interface FoodEntry {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  brand?: string;
  quantityGrams: number;
  kcalPer100g: number;
  source: 'openfoodfacts' | 'manual';
  createdAt: number;
}

export interface ExerciseEntry {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  category?: string;
  durationMin: number;
  met: number;
  kcalBurned: number;
  source: 'wger' | 'manual';
  createdAt: number;
}

export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  createdAt: number;
}

export interface AppState {
  profile: Profile | null;
  foodLog: FoodEntry[];
  exerciseLog: ExerciseEntry[];
  weightLog: WeightEntry[];
}
