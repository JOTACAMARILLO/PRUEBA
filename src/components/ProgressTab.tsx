import { useState, type FormEvent } from 'react';
import { useApp } from '../context/AppContext';
import WeightChart from './WeightChart';
import { isGoalReached, latestWeight } from '../lib/calc';

export default function ProgressTab() {
  const { state, addWeight, removeWeight } = useApp();
  const profile = state.profile!;
  const [weight, setWeight] = useState(latestWeight(profile, state.weightLog));
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    addWeight({ date, weightKg: weight });
  }

  const sorted = [...state.weightLog].sort((a, b) => b.date.localeCompare(a.date));
  const goalReached = isGoalReached(profile, state.weightLog);

  return (
    <div className="stack">
      <div className="card">
        <h3>Registrar peso</h3>
        <form className="search-row" onSubmit={handleAdd}>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <input
            type="number"
            step={0.1}
            min={30}
            max={300}
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
          />
          <span className="muted small">kg</span>
          <button type="submit" className="btn primary">
            Guardar
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Tendencia de peso</h3>
        {goalReached && (
          <p className="recommendation recommendation-good">
            ¡Has alcanzado tu peso objetivo! Considera cambiar tu objetivo a
            "Mantener peso" en la pestaña Perfil.
          </p>
        )}
        <WeightChart entries={state.weightLog} goalWeightKg={profile.goalWeightKg} />
      </div>

      <div className="card">
        <h3>Historial</h3>
        {sorted.length === 0 ? (
          <p className="muted">Sin registros todavía.</p>
        ) : (
          <ul className="log-list">
            {sorted.map((w) => (
              <li key={w.id} className="log-item">
                <div>
                  <div className="result-name">{w.weightKg.toFixed(1)} kg</div>
                  <div className="muted small">{w.date}</div>
                </div>
                <button type="button" className="btn ghost small" onClick={() => removeWeight(w.id)}>
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
