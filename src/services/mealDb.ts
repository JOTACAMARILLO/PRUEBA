export interface Recipe {
  id: string;
  name: string;
  category?: string;
  area?: string;
  thumbnail?: string;
  instructions: string;
  ingredients: { name: string; measure: string }[];
  youtubeUrl?: string;
}

interface MealDbMeal {
  idMeal: string;
  strMeal: string;
  strCategory?: string;
  strArea?: string;
  strMealThumb?: string;
  strInstructions?: string;
  strYoutube?: string;
  [key: string]: string | undefined;
}

interface MealDbResponse {
  meals: MealDbMeal[] | null;
}

function extractIngredients(meal: MealDbMeal): { name: string; measure: string }[] {
  const ingredients: { name: string; measure: string }[] = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (name && name.trim()) {
      ingredients.push({ name: name.trim(), measure: (measure ?? '').trim() });
    }
  }
  return ingredients;
}

function toRecipe(meal: MealDbMeal): Recipe {
  return {
    id: meal.idMeal,
    name: meal.strMeal,
    category: meal.strCategory,
    area: meal.strArea,
    thumbnail: meal.strMealThumb,
    instructions: meal.strInstructions ?? '',
    ingredients: extractIngredients(meal),
    youtubeUrl: meal.strYoutube || undefined,
  };
}

/** Searches TheMealDB (free, no API key) for recipes by name. */
export async function searchRecipes(query: string): Promise<Recipe[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(trimmed)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TheMealDB: HTTP ${res.status}`);
  const data = (await res.json()) as MealDbResponse;
  return (data.meals ?? []).map(toRecipe);
}

/** Fetches a handful of random recipes for inspiration. */
export async function randomRecipe(): Promise<Recipe | null> {
  const res = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
  if (!res.ok) throw new Error(`TheMealDB: HTTP ${res.status}`);
  const data = (await res.json()) as MealDbResponse;
  const meal = data.meals?.[0];
  return meal ? toRecipe(meal) : null;
}
