export interface FoodResult {
  id: string;
  name: string;
  brand?: string;
  kcalPer100g: number;
  imageUrl?: string;
}

interface OffProduct {
  code: string;
  product_name?: string;
  product_name_es?: string;
  brands?: string;
  nutriments?: { 'energy-kcal_100g'?: number; energy_100g?: number };
  image_thumb_url?: string;
}

interface OffSearchResponse {
  products: OffProduct[];
}

/**
 * Searches Open Food Facts (free, no API key) for products matching a query
 * and returns their name, brand and calories per 100g.
 */
export async function searchFoods(query: string): Promise<FoodResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = new URL('https://world.openfoodfacts.org/cgi/search.pl');
  url.searchParams.set('search_terms', trimmed);
  url.searchParams.set('search_simple', '1');
  url.searchParams.set('action', 'process');
  url.searchParams.set('json', '1');
  url.searchParams.set('page_size', '20');
  url.searchParams.set('lc', 'es');
  url.searchParams.set(
    'fields',
    'code,product_name,product_name_es,brands,nutriments,image_thumb_url',
  );

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Open Food Facts: HTTP ${res.status}`);
  const data = (await res.json()) as OffSearchResponse;

  return (data.products ?? [])
    .map((p): FoodResult | null => {
      const name = p.product_name_es || p.product_name;
      const kcal = p.nutriments?.['energy-kcal_100g'] ?? p.nutriments?.energy_100g;
      if (!name || kcal == null || kcal <= 0) return null;
      return {
        id: p.code,
        name,
        brand: p.brands,
        kcalPer100g: Math.round(kcal),
        imageUrl: p.image_thumb_url,
      };
    })
    .filter((p): p is FoodResult => p !== null);
}
