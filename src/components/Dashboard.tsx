import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  buildRecommendation,
  calcTargetCalories,
  latestWeight,
  sumBurnedForDate,
  sumCaloriesForDate,
} from '../lib/calc';
import StatTile from './StatTile';
import RecommendationCard from './RecommendationCard';

export default function Dashboard() {
  const { state, today } = useApp();
  const { profile, foodLog, exerciseLog, weightLog } = state;

  const stats = useMemo(() => {
    if (!profile) return null;
    const consumed = sumCaloriesForDate(foodLog, today);
    const burned = sumBurnedForDate(exerciseLog, today);
    const net = consumed - burned;
    const { target, tdee, dailyDelta } = calcTargetCalories(profile);
    const remaining = target - net;
    const rec = buildRecommendation(profile, net, target, weightLog);
    const current = latestWeight(profile, weightLog);
    const toGoal = current - profile.goalWeightKg;
    return { consumed, burned, net, target, tdee, dailyDelta, remaining, rec, current, toGoal };
  }, [profile, foodLog, exerciseLog, weightLog, today]);

  if (!profile || !stats) return null;

  return (
    <div className="stack">
      <RecommendationCard rec={stats.rec} />

      <div className="grid-stats">
        <StatTile label="Consumidas hoy" value={Math.round(stats.consumed)} unit="kcal" />
        <StatTile label="Quemadas (ejercicio)" value={Math.round(stats.burned)} unit="kcal" />
        <StatTile
          label="Neto hoy"
          value={Math.round(stats.net)}
          unit="kcal"
          accent={stats.net <= stats.target ? 'good' : 'warn'}
        />
        <StatTile label="Objetivo diario" value={stats.target} unit="kcal" />
        <StatTile
          label={stats.remaining >= 0 ? 'Disponibles hoy' : 'Excedidas'}
          value={Math.abs(Math.round(stats.remaining))}
          unit="kcal"
          accent={stats.remaining >= 0 ? 'good' : 'bad'}
        />
        <StatTile label="TDEE (mantenimiento)" value={stats.tdee} unit="kcal" />
      </div>

      <div className="card">
        <h3>Resumen de peso</h3>
        <div className="grid-stats">
          <StatTile label="Peso actual" value={stats.current.toFixed(1)} unit="kg" />
          <StatTile label="Peso objetivo" value={profile.goalWeightKg.toFixed(1)} unit="kg" />
          <StatTile
            label={stats.toGoal >= 0 ? 'Por perder' : 'Por ganar'}
            value={Math.abs(stats.toGoal).toFixed(1)}
            unit="kg"
          />
        </div>
      </div>

      {foodLog.filter((f) => f.date === today).length === 0 &&
        exerciseLog.filter((e) => e.date === today).length === 0 && (
          <div className="card muted-card">
            Aún no has registrado comidas ni ejercicio hoy. Ve a las pestañas
            <strong> Comida</strong> y <strong>Ejercicio</strong> para empezar.
          </div>
        )}
    </div>
  );
}
