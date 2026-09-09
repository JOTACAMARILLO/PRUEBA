export interface ExerciseResult {
  id: number;
  name: string;
  category?: string;
  description?: string;
  imageUrl?: string;
}

interface WgerSearchSuggestion {
  data: {
    id?: number;
    base_id?: number;
    name?: string;
    category?: string;
    image?: string | null;
  };
}

interface WgerSearchResponse {
  suggestions: WgerSearchSuggestion[];
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Searches wger.de's public exercise database (free, no API key) by name.
 * wger doesn't publish MET/calorie values, so calorie burn is estimated
 * locally from a MET table (see lib/calc.ts) once an exercise is logged.
 */
export async function searchExercises(query: string): Promise<ExerciseResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = new URL('https://wger.de/api/v2/exercise/search/');
  url.searchParams.set('term', trimmed);
  url.searchParams.set('language', 'es');
  url.searchParams.set('format', 'json');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`wger: HTTP ${res.status}`);
  const data = (await res.json()) as WgerSearchResponse;

  return (data.suggestions ?? [])
    .map((s): ExerciseResult | null => {
      const d = s.data;
      if (!d.name || d.id == null) return null;
      return {
        id: d.id,
        name: stripHtml(d.name),
        category: d.category,
        imageUrl: d.image ?? undefined,
      };
    })
    .filter((e): e is ExerciseResult => e !== null);
}
