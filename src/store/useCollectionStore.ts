import { create } from 'zustand';
import * as collectionsDb from '../database/collections';
import * as cardsDb from '../database/cards';
import type { CardWithDateAdded, OwnershipRow } from '../types/database';
import type { CardInput } from '../types/card';

interface CollectionState {
  getCardsForChild: (childId: number, searchQuery?: string) => Promise<CardWithDateAdded[]>;
  getCardCount: (childId: number) => Promise<number>;
  getCardOwnership: (tcgdexId: string) => Promise<OwnershipRow[]>;
  getNonOwningChildIds: (tcgdexId: string) => Promise<number[]>;
  assignCardToChildren: (card: CardInput, childIds: number[]) => Promise<void>;
  removeCardFromChild: (childId: number, cardId: number) => Promise<void>;
}

export const useCollectionStore = create<CollectionState>(() => ({
  getCardsForChild: async (childId: number, searchQuery?: string) => {
    return collectionsDb.getCardsForChild(childId, searchQuery);
  },

  getCardCount: async (childId: number) => {
    return collectionsDb.getCardCount(childId);
  },

  getCardOwnership: async (tcgdexId: string) => {
    return collectionsDb.getCardOwnership(tcgdexId);
  },

  getNonOwningChildIds: async (tcgdexId: string) => {
    return collectionsDb.getNonOwningChildIds(tcgdexId);
  },

  assignCardToChildren: async (card: CardInput, childIds: number[]) => {
    await collectionsDb.assignCardToChildren(card, childIds);
  },

  removeCardFromChild: async (childId: number, cardId: number) => {
    await collectionsDb.removeCardFromChild(childId, cardId);
  },
}));
