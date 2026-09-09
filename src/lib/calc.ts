import type {
  ActivityLevel,
  ExerciseEntry,
  FoodEntry,
  Profile,
  WeightEntry,
} from '../types';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentario (poco o ningún ejercicio)',
  light: 'Ligero (1-3 días/semana)',
  moderate: 'Moderado (3-5 días/semana)',
  active: 'Activo (6-7 días/semana)',
  very_active: 'Muy activo (trabajo físico o 2x/día)',
};

/** kcal per kg of body fat, used to translate a weekly rate into a daily deficit */
const KCAL_PER_KG_FAT = 7700;

export function calcBMR(profile: Profile): number {
  const { sex, age, heightCm, currentWeightKg } = profile;
  const base = 10 * currentWeightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

export function calcTDEE(profile: Profile): number {
  return calcBMR(profile) * ACTIVITY_MULTIPLIERS[profile.activityLevel];
}

/**
 * Daily calorie target based on goal and desired weekly rate of change.
 * Deficits/surpluses are capped so recommendations never push an unsafe
 * daily change (max ~1kg/week, and never below 1200/1500 kcal floor).
 */
export function calcTargetCalories(profile: Profile): {
  target: number;
  tdee: number;
  dailyDelta: number;
} {
  const tdee = calcTDEE(profile);
  const safeWeeklyRate = Math.min(Math.max(profile.weeklyRateKg, 0), 1);
  const dailyDeltaMagnitude = (safeWeeklyRate * KCAL_PER_KG_FAT) / 7;

  let target: number;
  let dailyDelta: number;

  if (profile.goal === 'lose') {
    dailyDelta = -dailyDeltaMagnitude;
    const floor = profile.sex === 'male' ? 1500 : 1200;
    target = Math.max(tdee + dailyDelta, floor);
    dailyDelta = target - tdee;
  } else if (profile.goal === 'gain') {
    dailyDelta = dailyDeltaMagnitude;
    target = tdee + dailyDelta;
  } else {
    target = tdee;
    dailyDelta = 0;
  }

  return { target: Math.round(target), tdee: Math.round(tdee), dailyDelta: Math.round(dailyDelta) };
}

export function sumCaloriesForDate(foodLog: FoodEntry[], date: string): number {
  return foodLog
    .filter((f) => f.date === date)
    .reduce((sum, f) => sum + (f.kcalPer100g * f.quantityGrams) / 100, 0);
}

export function sumBurnedForDate(exerciseLog: ExerciseEntry[], date: string): number {
  return exerciseLog
    .filter((e) => e.date === date)
    .reduce((sum, e) => sum + e.kcalBurned, 0);
}

/** Standard MET formula: kcal = MET * weight(kg) * duration(hours) */
export function kcalFromMet(met: number, weightKg: number, durationMin: number): number {
  return Math.round(met * weightKg * (durationMin / 60));
}

export function latestWeight(profile: Profile, weightLog: WeightEntry[]): number {
  if (weightLog.length === 0) return profile.currentWeightKg;
  const sorted = [...weightLog].sort((a, b) => a.date.localeCompare(b.date));
  return sorted[sorted.length - 1].weightKg;
}

export function isGoalReached(profile: Profile, weightLog: WeightEntry[]): boolean {
  const current = latestWeight(profile, weightLog);
  const tolerance = 0.3;
  if (profile.goal === 'lose') return current <= profile.goalWeightKg + tolerance;
  if (profile.goal === 'gain') return current >= profile.goalWeightKg - tolerance;
  return Math.abs(current - profile.goalWeightKg) <= tolerance;
}

export interface Recommendation {
  headline: string;
  detail: string;
  tone: 'good' | 'warn' | 'info';
}

export function buildRecommendation(
  profile: Profile,
  netToday: number,
  target: number,
  weightLog: WeightEntry[],
): Recommendation {
  const goalReached = isGoalReached(profile, weightLog);
  const diff = netToday - target;

  if (goalReached && profile.goal !== 'maintain') {
    return {
      headline: '¡Objetivo de peso alcanzado! 🎉',
      detail:
        'Has llegado a tu peso objetivo. Cambia a modo mantenimiento: come cerca de tu gasto calórico total (TDEE) y pésate una vez por semana. Si subes o bajas más de 1 kg, ajusta ±100-150 kcal/día.',
      tone: 'good',
    };
  }

  if (profile.goal === 'maintain') {
    if (Math.abs(diff) <= 100) {
      return {
        headline: 'Vas bien encaminado para mantener tu peso',
        detail: `Tu ingesta neta de hoy (${Math.round(netToday)} kcal) está dentro de ±100 kcal de tu objetivo de mantenimiento (${target} kcal).`,
        tone: 'good',
      };
    }
    return {
      headline: diff > 0 ? 'Ligero superávit hoy' : 'Ligero déficit hoy',
      detail: `Estás a ${Math.round(Math.abs(diff))} kcal de tu objetivo de mantenimiento (${target} kcal). Ajusta la próxima comida o el ejercicio para acercarte.`,
      tone: 'info',
    };
  }

  // goal: lose or gain, not yet reached
  if (profile.goal === 'lose') {
    if (diff <= 50) {
      return {
        headline: 'En camino hacia tu déficit calórico',
        detail: `Llevas ${Math.round(netToday)} kcal netas hoy, tu objetivo es ${target} kcal. Sigue así: prioriza proteína (1.6-2.2 g/kg), verduras y agua para saciarte.`,
        tone: 'good',
      };
    }
    if (diff <= 300) {
      return {
        headline: 'Cerca del objetivo, ajusta un poco',
        detail: `Vas ${Math.round(diff)} kcal por encima de tu objetivo de ${target} kcal. Prueba una caminata de 20-30 min o reduce una porción en la próxima comida.`,
        tone: 'warn',
      };
    }
    return {
      headline: 'Hoy te has pasado del objetivo calórico',
      detail: `Llevas ${Math.round(netToday)} kcal netas frente a un objetivo de ${target} kcal (+${Math.round(diff)} kcal). No pasa nada puntualmente: mañana retoma el plan, no compenses con ayunos extremos.`,
      tone: 'warn',
    };
  }

  // gain
  if (diff >= -50) {
    return {
      headline: 'Buen ritmo para ganar peso de forma controlada',
      detail: `Llevas ${Math.round(netToday)} kcal netas, tu objetivo es ${target} kcal. Combina el superávit con entrenamiento de fuerza para priorizar masa muscular.`,
      tone: 'good',
    };
  }
  return {
    headline: 'Te falta ingesta para tu objetivo de hoy',
    detail: `Vas ${Math.round(Math.abs(diff))} kcal por debajo de tu objetivo de ${target} kcal. Añade un snack calórico-denso (frutos secos, batido, aguacate).`,
    tone: 'info',
  };
}

/** Basic MET (Metabolic Equivalent of Task) reference table for common activities. */
export const MET_TABLE: { name: string; category: string; met: number }[] = [
  { name: 'Caminar (5 km/h)', category: 'Cardio', met: 3.3 },
  { name: 'Caminar rápido (6.5 km/h)', category: 'Cardio', met: 4.5 },
  { name: 'Correr (8 km/h)', category: 'Cardio', met: 8.3 },
  { name: 'Correr (10 km/h)', category: 'Cardio', met: 9.8 },
  { name: 'Ciclismo moderado', category: 'Cardio', met: 6.8 },
  { name: 'Ciclismo intenso', category: 'Cardio', met: 10.0 },
  { name: 'Nadar', category: 'Cardio', met: 6.0 },
  { name: 'Saltar la cuerda', category: 'Cardio', met: 10.0 },
  { name: 'Elíptica', category: 'Cardio', met: 5.0 },
  { name: 'Remo (máquina)', category: 'Cardio', met: 7.0 },
  { name: 'HIIT', category: 'Cardio', met: 8.0 },
  { name: 'Entrenamiento de fuerza (pesas)', category: 'Fuerza', met: 5.0 },
  { name: 'Calistenia', category: 'Fuerza', met: 4.0 },
  { name: 'Yoga', category: 'Flexibilidad', met: 2.5 },
  { name: 'Pilates', category: 'Flexibilidad', met: 3.0 },
  { name: 'Estiramientos', category: 'Flexibilidad', met: 2.3 },
  { name: 'Baile', category: 'Cardio', met: 5.5 },
  { name: 'Fútbol', category: 'Deporte', met: 7.0 },
  { name: 'Baloncesto', category: 'Deporte', met: 6.5 },
  { name: 'Tenis', category: 'Deporte', met: 7.3 },
  { name: 'Senderismo', category: 'Cardio', met: 6.0 },
  { name: 'Subir escaleras', category: 'Cardio', met: 8.8 },
  { name: 'Limpieza doméstica intensa', category: 'Diario', met: 3.5 },
];

const DEFAULT_MET = 5.0;

/**
 * Estimates a MET value for a free-text exercise name/category coming from
 * an external source (e.g. wger) by matching against the local MET table.
 * Falls back to a moderate-intensity default when nothing matches.
 */
export function estimateMet(name: string, category?: string): number {
  const haystack = `${name} ${category ?? ''}`.toLowerCase();
  const match = MET_TABLE.find(
    (m) =>
      haystack.includes(m.name.toLowerCase()) ||
      haystack.includes(m.category.toLowerCase()) ||
      m.name.toLowerCase().includes(haystack),
  );
  return match?.met ?? DEFAULT_MET;
}
