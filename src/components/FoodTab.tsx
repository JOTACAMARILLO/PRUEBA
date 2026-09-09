import { useState, type FormEvent } from 'react';
import { useApp } from '../context/AppContext';
import { searchFoods, type FoodResult } from '../services/openFoodFacts';
import { searchRecipes, type Recipe } from '../services/mealDb';
import { sumCaloriesForDate } from '../lib/calc';

export default function FoodTab() {
  const { state, today, addFood, removeFood } = useApp();
  const [mode, setMode] = useState<'foods' | 'recipes'>('foods');

  const [foodQuery, setFoodQuery] = useState('');
  const [foodResults, setFoodResults] = useState<FoodResult[]>([]);
  const [foodLoading, setFoodLoading] = useState(false);
  const [foodError, setFoodError] = useState<string | null>(null);
  const [grams, setGrams] = useState<Record<string, number>>({});

  const [recipeQuery, setRecipeQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeError, setRecipeError] = useState<string | null>(null);
  const [openRecipe, setOpenRecipe] = useState<string | null>(null);

  async function handleFoodSearch(e: FormEvent) {
    e.preventDefault();
    if (!foodQuery.trim()) return;
    setFoodLoading(true);
    setFoodError(null);
    try {
      const results = await searchFoods(foodQuery);
      setFoodResults(results);
      if (results.length === 0) {
        setFoodError('Sin resultados. Prueba con otro término (en inglés suele dar más resultados).');
      }
    } catch {
      setFoodError('No se pudo consultar Open Food Facts. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setFoodLoading(false);
    }
  }

  async function handleRecipeSearch(e: FormEvent) {
    e.preventDefault();
    if (!recipeQuery.trim()) return;
    setRecipeLoading(true);
    setRecipeError(null);
    try {
      const results = await searchRecipes(recipeQuery);
      setRecipes(results);
      if (results.length === 0) {
        setRecipeError('Sin resultados. Prueba con otro plato (en inglés, ej. "chicken", "salad").');
      }
    } catch {
      setRecipeError('No se pudo consultar TheMealDB. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setRecipeLoading(false);
    }
  }

  function handleAddFood(f: FoodResult) {
    const qty = grams[f.id] ?? 100;
    addFood({
      date: today,
      name: f.name,
      brand: f.brand,
      quantityGrams: qty,
      kcalPer100g: f.kcalPer100g,
      source: 'openfoodfacts',
    });
  }

  const todayFoods = state.foodLog.filter((f) => f.date === today);
  const todayTotal = sumCaloriesForDate(state.foodLog, today);

  return (
    <div className="stack">
      <div className="tabs-inline">
        <button
          className={mode === 'foods' ? 'chip active' : 'chip'}
          onClick={() => setMode('foods')}
          type="button"
        >
          Buscar calorías
        </button>
        <button
          className={mode === 'recipes' ? 'chip active' : 'chip'}
          onClick={() => setMode('recipes')}
          type="button"
        >
          Recetas y cómo cocinar
        </button>
      </div>

      {mode === 'foods' && (
        <div className="card">
          <h3>Buscar alimentos (Open Food Facts)</h3>
          <form className="search-row" onSubmit={handleFoodSearch}>
            <input
              type="text"
              placeholder="Ej: pechuga de pollo, arroz, manzana..."
              value={foodQuery}
              onChange={(e) => setFoodQuery(e.target.value)}
            />
            <button type="submit" className="btn primary" disabled={foodLoading}>
              {foodLoading ? 'Buscando...' : 'Buscar'}
            </button>
          </form>
          {foodError && <p className="error-text">{foodError}</p>}

          <ul className="result-list">
            {foodResults.map((f) => (
              <li key={f.id} className="result-item">
                {f.imageUrl && <img src={f.imageUrl} alt="" className="result-thumb" />}
                <div className="result-info">
                  <div className="result-name">{f.name}</div>
                  {f.brand && <div className="muted small">{f.brand}</div>}
                  <div className="muted small">{f.kcalPer100g} kcal / 100g</div>
                </div>
                <div className="result-actions">
                  <input
                    type="number"
                    min={1}
                    value={grams[f.id] ?? 100}
                    onChange={(e) =>
                      setGrams((g) => ({ ...g, [f.id]: Number(e.target.value) }))
                    }
                    className="grams-input"
                  />
                  <span className="muted small">g</span>
                  <button type="button" className="btn small" onClick={() => handleAddFood(f)}>
                    Añadir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {mode === 'recipes' && (
        <div className="card">
          <h3>Buscar recetas (TheMealDB)</h3>
          <form className="search-row" onSubmit={handleRecipeSearch}>
            <input
              type="text"
              placeholder="Ej: chicken, salad, pasta..."
              value={recipeQuery}
              onChange={(e) => setRecipeQuery(e.target.value)}
            />
            <button type="submit" className="btn primary" disabled={recipeLoading}>
              {recipeLoading ? 'Buscando...' : 'Buscar'}
            </button>
          </form>
          {recipeError && <p className="error-text">{recipeError}</p>}

          <div className="recipe-grid">
            {recipes.map((r) => (
              <div key={r.id} className="recipe-card">
                {r.thumbnail && <img src={r.thumbnail} alt={r.name} className="recipe-thumb" />}
                <div className="recipe-body">
                  <div className="result-name">{r.name}</div>
                  <div className="muted small">
                    {r.category} {r.area && `· ${r.area}`}
                  </div>
                  <button
                    type="button"
                    className="btn small"
                    onClick={() => setOpenRecipe(openRecipe === r.id ? null : r.id)}
                  >
                    {openRecipe === r.id ? 'Ocultar' : 'Ver receta'}
                  </button>
                  {openRecipe === r.id && (
                    <div className="recipe-detail">
                      <strong>Ingredientes</strong>
                      <ul>
                        {r.ingredients.map((ing, i) => (
                          <li key={i}>
                            {ing.measure} {ing.name}
                          </li>
                        ))}
                      </ul>
                      <strong>Preparación</strong>
                      <p className="recipe-instructions">{r.instructions}</p>
                      {r.youtubeUrl && (
                        <a href={r.youtubeUrl} target="_blank" rel="noreferrer">
                          Ver vídeo de preparación
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="row-between">
          <h3>Comidas de hoy</h3>
          <span className="muted">{Math.round(todayTotal)} kcal totales</span>
        </div>
        {todayFoods.length === 0 ? (
          <p className="muted">Todavía no has añadido comidas hoy.</p>
        ) : (
          <ul className="log-list">
            {todayFoods.map((f) => (
              <li key={f.id} className="log-item">
                <div>
                  <div className="result-name">{f.name}</div>
                  <div className="muted small">
                    {f.quantityGrams} g · {Math.round((f.kcalPer100g * f.quantityGrams) / 100)} kcal
                  </div>
                </div>
                <button type="button" className="btn ghost small" onClick={() => removeFood(f.id)}>
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
