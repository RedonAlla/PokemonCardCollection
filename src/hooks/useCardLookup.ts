import { useState, useCallback, useRef, useEffect } from 'react';
import { matchCardFromOcr, searchCardsByName } from '../services/tcgdexApi';
import type { CardMatchResult } from '../types/api';
import type { TCGdexCardSearchResult } from '../types/api';

interface UseCardLookupResult {
  isSearching: boolean;
  error: string | null;
  results: TCGdexCardSearchResult[];
  search: (query: string) => Promise<void>;
  lookupByOcr: (cardName: string, setId?: string | null) => Promise<CardMatchResult | null>;
  clearResults: () => void;
}

export function useCardLookup(): UseCardLookupResult {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<TCGdexCardSearchResult[]>([]);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Cancel any in-flight request on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    // Cancel previous search
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsSearching(true);
    setError(null);

    try {
      const data = await searchCardsByName(query, controller.signal);
      setResults(data);
    } catch (err) {
      if (err instanceof Error && err.name === 'ApiError' && (err as unknown as { status: number }).status === 0) {
        // Aborted — ignore
        return;
      }
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const lookupByOcr = useCallback(
    async (cardName: string, setId?: string | null): Promise<CardMatchResult | null> => {
      // Cancel previous request
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsSearching(true);
      setError(null);

      try {
        const result = await matchCardFromOcr(cardName, setId, controller.signal);
        return result;
      } catch (err) {
        if (
          err instanceof Error &&
          err.name === 'ApiError' &&
          (err as unknown as { status: number }).status === 0
        ) {
          return null;
        }
        setError(err instanceof Error ? err.message : 'Card lookup failed');
        return null;
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return { isSearching, error, results, search, lookupByOcr, clearResults };
}
