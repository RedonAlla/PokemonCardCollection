import { useState, useEffect, useCallback } from 'react';
import * as collectionsDb from '../database/collections';
import type { CardWithDateAdded } from '../types/database';

interface UseCardsResult {
  cards: CardWithDateAdded[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useCards(childId: number, searchQuery?: string): UseCardsResult {
  const [cards, setCards] = useState<CardWithDateAdded[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await collectionsDb.getCardsForChild(
        childId,
        searchQuery && searchQuery.trim().length > 0 ? searchQuery : undefined
      );
      setCards(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load cards';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [childId, searchQuery]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  return { cards, isLoading, error, refresh: fetchCards };
}
