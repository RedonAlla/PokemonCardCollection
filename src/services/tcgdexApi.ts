import { TCGDEX_BASE_URL, API_TIMEOUT_MS, API_RETRY_COUNT, API_RETRY_DELAY_MS } from '../utils/constants';
import { ApiError } from '../types/api';
import type { TCGdexSet, TCGdexCardSearchResult, SetSummary, CardMatchResult } from '../types/api';
import type { CardDetail } from '../types/card';
import { fuzzyMatch, normalizeCardName, normalizeSetName } from '../utils/formatting';

// In-memory cache for session lifetime
const cardDetailCache = new Map<string, CardDetail>();
const setListCache: { sets: SetSummary[]; timestamp: number } | null = null;
const SET_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = API_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchWithRetry<T>(
  url: string,
  retries: number = API_RETRY_COUNT,
  delayMs: number = API_RETRY_DELAY_MS
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url);

      if (!response.ok) {
        throw new ApiError(
          `Request failed: ${response.statusText}`,
          response.status,
          url
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on abort (timeout), API errors, or last attempt
      if (
        error instanceof ApiError ||
        (error instanceof DOMException && error.name === 'AbortError') ||
        attempt === retries
      ) {
        break;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
    }
  }

  throw lastError ?? new Error('Unknown fetch error');
}

// Fetch and cache the list of all TCGdex sets
export async function fetchSets(forceRefresh = false): Promise<SetSummary[]> {
  if (
    !forceRefresh &&
    setListCache &&
    Date.now() - setListCache.timestamp < SET_CACHE_TTL
  ) {
    return setListCache.sets;
  }

  const sets = await fetchWithRetry<TCGdexSet[]>(`${TCGDEX_BASE_URL}/sets`);

  const summaries: SetSummary[] = sets.map(s => ({
    id: s.id,
    name: s.name,
  }));

  // Update cache
  // Note: setListCache is const, so we update it via Object.assign or similar
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (setListCache as any) = { sets: summaries, timestamp: Date.now() };

  return summaries;
}

// Search cards by name prefix
export async function searchCardsByName(
  name: string,
  signal?: AbortSignal
): Promise<TCGdexCardSearchResult[]> {
  const encoded = encodeURIComponent(name.trim());
  const url = `${TCGDEX_BASE_URL}/cards?name=${encoded}`;

  try {
    const response = await fetchWithTimeout(url, signal ? { signal } : {});

    if (!response.ok) {
      throw new ApiError('Card search failed', response.status, url);
    }

    return (await response.json()) as TCGdexCardSearchResult[];
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Search cancelled', 0, url);
    }
    throw new ApiError('Network error during card search', 0, url);
  }
}

// Fetch full card details by TCGdex ID
export async function fetchCardDetail(
  id: string,
  signal?: AbortSignal
): Promise<CardDetail> {
  // Check cache first
  const cached = cardDetailCache.get(id);
  if (cached) return cached;

  const url = `${TCGDEX_BASE_URL}/cards/${encodeURIComponent(id)}`;

  try {
    const response = await fetchWithTimeout(url, signal ? { signal } : {});

    if (!response.ok) {
      throw new ApiError('Card detail fetch failed', response.status, url);
    }

    const data: CardDetail = await response.json();
    cardDetailCache.set(id, data);
    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Network error during card detail fetch', 0, url);
  }
}

// Match OCR text against TCGdex API to find the best card match
export async function matchCardFromOcr(
  cardName: string,
  setId?: string | null,
  signal?: AbortSignal
): Promise<CardMatchResult | null> {
  // Step 1: Search by card name
  const normalizedName = normalizeCardName(cardName);

  let results = await searchCardsByName(normalizedName, signal);

  // Step 2: If no results, try base name (remove suffixes like VMAX, ex, etc.)
  if (results.length === 0) {
    const baseName = stripCardSuffixes(normalizedName);
    if (baseName !== normalizedName) {
      results = await searchCardsByName(baseName, signal);
    }
  }

  if (results.length === 0) return null;

  // Step 3: Score and rank results
  const scored = results.map(r => {
    let score = fuzzyMatch(r.name, normalizedName);

    // Boost score if set matches
    if (setId && r.set) {
      const setNameScore = fuzzyMatch(
        normalizeSetName(r.set.name),
        normalizeSetName(setId)
      );
      if (setNameScore > 0.7) {
        score += 0.3;
      }
    }

    // Prefer results with images
    if (r.image) score += 0.1;

    return {
      tcgdexId: r.id,
      name: r.name,
      setId: r.set?.id ?? '',
      setDisplayName: r.set?.name ?? 'Unknown',
      edition: 'unlimited',
      imageUrl: r.image ? `${r.image}/high.webp` : null,
      cardType: null,
      hp: null,
      rarity: null,
      matchScore: score,
    };
  });

  // Sort by score descending
  scored.sort((a, b) => b.matchScore - a.matchScore);

  // Step 4: If clear winner (score gap > 0.3), auto-select
  // Otherwise return the best match (caller can decide to show disambiguation)
  const best = scored[0];

  // Fetch full detail for enrichment
  try {
    const detail = await fetchCardDetail(best.tcgdexId, signal);
    return {
      ...best,
      cardType: detail.category ?? null,
      hp: detail.hp?.toString() ?? null,
      rarity: detail.rarity ?? null,
    };
  } catch {
    // Return best match without enrichment if detail fetch fails
  }

  return best;
}

// Strip card name suffixes like VMAX, ex, GX, etc.
function stripCardSuffixes(name: string): string {
  const suffixPatterns = [
    /\s+VMAX$/i,
    /\s+VSTAR$/i,
    /\s+V-UNION$/i,
    /\s+V$/i,
    /\s+ex$/i,
    /\s+GX$/i,
    /\s+EX$/i,
    /\s+BREAK$/i,
    /\s+LV\.X$/i,
    /\s+SP$/i,
    /\s+M$/i,
    /\s+Primal$/i,
  ];

  for (const pattern of suffixPatterns) {
    const stripped = name.replace(pattern, '').trim();
    if (stripped !== name) return stripped;
  }

  return name;
}

// Clear caches (for testing or on app reset)
export function clearApiCache(): void {
  cardDetailCache.clear();
}
