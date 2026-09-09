import type { AppState } from '../types';

const STORAGE_KEY = 'peso-app-state-v1';

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as AppState;
    return {
      profile: parsed.profile ?? null,
      foodLog: parsed.foodLog ?? [],
      exerciseLog: parsed.exerciseLog ?? [],
      weightLog: parsed.weightLog ?? [],
    };
  } catch {
    return emptyState();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable (private mode, quota) - fail silently
  }
}

export function emptyState(): AppState {
  return { profile: null, foodLog: [], exerciseLog: [], weightLog: [] };
}

export function todayISO(): string {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10);
}

export function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
