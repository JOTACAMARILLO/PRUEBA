import { useState, type FormEvent } from 'react';
import { useApp } from '../context/AppContext';
import { searchExercises, type ExerciseResult } from '../services/wger';
import { estimateMet, kcalFromMet, latestWeight, MET_TABLE, sumBurnedForDate } from '../lib/calc';

export default function ExerciseTab() {
  const { state, today, addExercise, removeExercise } = useApp();
  const profile = state.profile!;
  const weight = latestWeight(profile, state.weightLog);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [durations, setDurations] = useState<Record<number, number>>({});

  const [manualMet, setManualMet] = useState(MET_TABLE[0].met);
  const [manualName, setManualName] = useState(MET_TABLE[0].name);
  const [manualDuration, setManualDuration] = useState(30);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await searchExercises(query);
      setResults(res);
      if (res.length === 0) {
        setError('Sin resultados en wger. Prueba con otro término o usa la lista rápida de abajo.');
      }
    } catch {
      setError('No se pudo consultar wger.de. Revisa tu conexión o usa la lista rápida de abajo.');
    } finally {
      setLoading(false);
    }
  }

  function handleAddFromSearch(ex: ExerciseResult) {
    const durationMin = durations[ex.id] ?? 30;
    const met = estimateMet(ex.name, ex.category);
    addExercise({
      date: today,
      name: ex.name,
      category: ex.category,
      durationMin,
      met,
      kcalBurned: kcalFromMet(met, weight, durationMin),
      source: 'wger',
    });
  }

  function handleAddManual(e: FormEvent) {
    e.preventDefault();
    addExercise({
      date: today,
      name: manualName,
      durationMin: manualDuration,
      met: manualMet,
      kcalBurned: kcalFromMet(manualMet, weight, manualDuration),
      source: 'manual',
    });
  }

  const todayExercises = state.exerciseLog.filter((e) => e.date === today);
  const todayTotal = sumBurnedForDate(state.exerciseLog, today);

  return (
    <div className="stack">
      <div className="card">
        <h3>Buscar ejercicio (wger.de)</h3>
        <p className="muted small">
          wger no publica calorías por ejercicio, así que estimamos las
          calorías quemadas con el método MET estándar (MET × peso × horas)
          usando tu peso actual ({weight.toFixed(1)} kg).
        </p>
        <form className="search-row" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Ej: sentadilla, running, yoga..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
        {error && <p className="error-text">{error}</p>}

        <ul className="result-list">
          {results.map((ex) => (
            <li key={ex.id} className="result-item">
              <div className="result-info">
                <div className="result-name">{ex.name}</div>
                {ex.category && <div className="muted small">{ex.category}</div>}
              </div>
              <div className="result-actions">
                <input
                  type="number"
                  min={1}
                  value={durations[ex.id] ?? 30}
                  onChange={(e) =>
                    setDurations((d) => ({ ...d, [ex.id]: Number(e.target.value) }))
                  }
                  className="grams-input"
                />
                <span className="muted small">min</span>
                <button type="button" className="btn small" onClick={() => handleAddFromSearch(ex)}>
                  Añadir
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3>Lista rápida (tabla MET local)</h3>
        <form className="form-grid" onSubmit={handleAddManual}>
          <label>
            Actividad
            <select
              value={manualName}
              onChange={(e) => {
                const m = MET_TABLE.find((m) => m.name === e.target.value);
                setManualName(e.target.value);
                if (m) setManualMet(m.met);
              }}
            >
              {MET_TABLE.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Duración (min)
            <input
              type="number"
              min={1}
              value={manualDuration}
              onChange={(e) => setManualDuration(Number(e.target.value))}
            />
          </label>
          <button type="submit" className="btn primary">
            Añadir ({kcalFromMet(manualMet, weight, manualDuration)} kcal)
          </button>
        </form>
      </div>

      <div className="card">
        <div className="row-between">
          <h3>Ejercicio de hoy</h3>
          <span className="muted">{Math.round(todayTotal)} kcal quemadas</span>
        </div>
        {todayExercises.length === 0 ? (
          <p className="muted">Todavía no has registrado ejercicio hoy.</p>
        ) : (
          <ul className="log-list">
            {todayExercises.map((ex) => (
              <li key={ex.id} className="log-item">
                <div>
                  <div className="result-name">{ex.name}</div>
                  <div className="muted small">
                    {ex.durationMin} min · MET {ex.met} · {ex.kcalBurned} kcal
                  </div>
                </div>
                <button type="button" className="btn ghost small" onClick={() => removeExercise(ex.id)}>
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
