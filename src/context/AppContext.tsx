import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import type {
  AppState,
  ExerciseEntry,
  FoodEntry,
  Profile,
  WeightEntry,
} from '../types';
import { loadState, saveState, uid, todayISO } from '../lib/storage';

type Action =
  | { type: 'SET_PROFILE'; profile: Profile }
  | { type: 'ADD_FOOD'; entry: Omit<FoodEntry, 'id' | 'createdAt'> }
  | { type: 'REMOVE_FOOD'; id: string }
  | { type: 'ADD_EXERCISE'; entry: Omit<ExerciseEntry, 'id' | 'createdAt'> }
  | { type: 'REMOVE_EXERCISE'; id: string }
  | { type: 'ADD_WEIGHT'; entry: Omit<WeightEntry, 'id' | 'createdAt'> }
  | { type: 'REMOVE_WEIGHT'; id: string }
  | { type: 'RESET' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_PROFILE':
      return { ...state, profile: action.profile };
    case 'ADD_FOOD':
      return {
        ...state,
        foodLog: [
          ...state.foodLog,
          { ...action.entry, id: uid(), createdAt: Date.now() },
        ],
      };
    case 'REMOVE_FOOD':
      return { ...state, foodLog: state.foodLog.filter((f) => f.id !== action.id) };
    case 'ADD_EXERCISE':
      return {
        ...state,
        exerciseLog: [
          ...state.exerciseLog,
          { ...action.entry, id: uid(), createdAt: Date.now() },
        ],
      };
    case 'REMOVE_EXERCISE':
      return {
        ...state,
        exerciseLog: state.exerciseLog.filter((e) => e.id !== action.id),
      };
    case 'ADD_WEIGHT': {
      const entry: WeightEntry = { ...action.entry, id: uid(), createdAt: Date.now() };
      const profile = state.profile
        ? { ...state.profile, currentWeightKg: entry.weightKg }
        : state.profile;
      return { ...state, weightLog: [...state.weightLog, entry], profile };
    }
    case 'REMOVE_WEIGHT':
      return { ...state, weightLog: state.weightLog.filter((w) => w.id !== action.id) };
    case 'RESET':
      return { profile: null, foodLog: [], exerciseLog: [], weightLog: [] };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  today: string;
  setProfile: (profile: Profile) => void;
  addFood: (entry: Omit<FoodEntry, 'id' | 'createdAt'>) => void;
  removeFood: (id: string) => void;
  addExercise: (entry: Omit<ExerciseEntry, 'id' | 'createdAt'>) => void;
  removeExercise: (id: string) => void;
  addWeight: (entry: Omit<WeightEntry, 'id' | 'createdAt'>) => void;
  removeWeight: (id: string) => void;
  resetAll: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      today: todayISO(),
      setProfile: (profile) => dispatch({ type: 'SET_PROFILE', profile }),
      addFood: (entry) => dispatch({ type: 'ADD_FOOD', entry }),
      removeFood: (id) => dispatch({ type: 'REMOVE_FOOD', id }),
      addExercise: (entry) => dispatch({ type: 'ADD_EXERCISE', entry }),
      removeExercise: (id) => dispatch({ type: 'REMOVE_EXERCISE', id }),
      addWeight: (entry) => dispatch({ type: 'ADD_WEIGHT', entry }),
      removeWeight: (id) => dispatch({ type: 'REMOVE_WEIGHT', id }),
      resetAll: () => dispatch({ type: 'RESET' }),
    }),
    [state],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return ctx;
}
