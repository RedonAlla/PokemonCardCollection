import { fetchSets } from './tcgdexApi';
import { fuzzyMatch, normalizeSetName } from '../utils/formatting';
import type { SetSummary } from '../types/api';

let knownSets: SetSummary[] | null = null;

/**
 * Initialize the set matcher by loading all known sets from TCGdex.
 * Should be called once on app startup.
 */
export async function initializeSetMatcher(): Promise<void> {
  try {
    knownSets = await fetchSets();
  } catch {
    // If API fails, start with empty set list; matcher will still work
    // with keyword-based heuristics
    knownSets = [];
  }
}

/**
 * Match raw OCR set text against the known set list.
 * Returns the best matching set ID and display name.
 */
export function matchSetText(setText: string | null): {
  setId: string;
  displayName: string;
} | null {
  if (!setText) {
    return null;
  }

  const normalized = normalizeSetName(setText);

  // If we have known sets, try fuzzy matching
  if (knownSets && knownSets.length > 0) {
    let bestMatch: SetSummary | null = null;
    let bestScore = 0;

    for (const set of knownSets) {
      const nameScore = fuzzyMatch(normalized, set.name.toUpperCase());
      const idScore = fuzzyMatch(normalized, set.id.toUpperCase());

      const score = Math.max(nameScore, idScore);

      if (score > bestScore) {
        bestScore = score;
        bestMatch = set;
      }
    }

    // Require minimum score to consider a valid match
    if (bestMatch && bestScore > 0.5) {
      return {
        setId: bestMatch.id,
        displayName: bestMatch.name,
      };
    }
  }

  // Fallback: return the raw set text as the ID
  return {
    setId: normalized.replace(/\s+/g, '-').toLowerCase(),
    displayName: setText.trim(),
  };
}

/**
 * Get the list of known sets (for manual entry picker).
 */
export function getKnownSets(): SetSummary[] {
  return knownSets ?? [];
}

/**
 * Reset the set matcher (for testing).
 */
export function resetSetMatcher(): void {
  knownSets = null;
}
