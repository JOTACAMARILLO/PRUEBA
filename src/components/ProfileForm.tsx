import { useState, type FormEvent } from 'react';
import type { ActivityLevel, Goal, Profile, Sex } from '../types';
import { ACTIVITY_LABELS } from '../lib/calc';
import { useApp } from '../context/AppContext';

const DEFAULT_PROFILE: Profile = {
  name: '',
  sex: 'female',
  age: 30,
  heightCm: 165,
  currentWeightKg: 70,
  goalWeightKg: 65,
  activityLevel: 'light',
  goal: 'lose',
  weeklyRateKg: 0.5,
};

export default function ProfileForm({ onSaved }: { onSaved?: () => void }) {
  const { state, setProfile, addWeight } = useApp();
  const [form, setForm] = useState<Profile>(state.profile ?? DEFAULT_PROFILE);

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setProfile(form);
    if (!state.profile || state.profile.currentWeightKg !== form.currentWeightKg) {
      addWeight({
        date: new Date().toISOString().slice(0, 10),
        weightKg: form.currentWeightKg,
      });
    }
    onSaved?.();
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>{state.profile ? 'Tu perfil' : 'Cuéntanos sobre ti'}</h2>
      <p className="muted">
        Usamos estos datos para calcular tu metabolismo basal (BMR), tu gasto
        calórico total (TDEE) y un objetivo diario de calorías saludable.
      </p>

      <div className="form-grid">
        <label>
          Nombre
          <input
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Tu nombre"
          />
        </label>

        <label>
          Sexo
          <select
            value={form.sex}
            onChange={(e) => update('sex', e.target.value as Sex)}
          >
            <option value="female">Mujer</option>
            <option value="male">Hombre</option>
          </select>
        </label>

        <label>
          Edad
          <input
            type="number"
            min={14}
            max={100}
            value={form.age}
            onChange={(e) => update('age', Number(e.target.value))}
            required
          />
        </label>

        <label>
          Altura (cm)
          <input
            type="number"
            min={100}
            max={250}
            value={form.heightCm}
            onChange={(e) => update('heightCm', Number(e.target.value))}
            required
          />
        </label>

        <label>
          Peso actual (kg)
          <input
            type="number"
            min={30}
            max={300}
            step={0.1}
            value={form.currentWeightKg}
            onChange={(e) => update('currentWeightKg', Number(e.target.value))}
            required
          />
        </label>

        <label>
          Peso objetivo (kg)
          <input
            type="number"
            min={30}
            max={300}
            step={0.1}
            value={form.goalWeightKg}
            onChange={(e) => update('goalWeightKg', Number(e.target.value))}
            required
          />
        </label>

        <label>
          Nivel de actividad
          <select
            value={form.activityLevel}
            onChange={(e) => update('activityLevel', e.target.value as ActivityLevel)}
          >
            {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((level) => (
              <option key={level} value={level}>
                {ACTIVITY_LABELS[level]}
              </option>
            ))}
          </select>
        </label>

        <label>
          Objetivo
          <select
            value={form.goal}
            onChange={(e) => update('goal', e.target.value as Goal)}
          >
            <option value="lose">Perder peso</option>
            <option value="maintain">Mantener peso</option>
            <option value="gain">Ganar peso</option>
          </select>
        </label>

        {form.goal !== 'maintain' && (
          <label>
            Ritmo semanal (kg/semana)
            <input
              type="number"
              min={0.1}
              max={1}
              step={0.1}
              value={form.weeklyRateKg}
              onChange={(e) => update('weeklyRateKg', Number(e.target.value))}
            />
          </label>
        )}
      </div>

      <button type="submit" className="btn primary">
        Guardar y calcular
      </button>
    </form>
  );
}
