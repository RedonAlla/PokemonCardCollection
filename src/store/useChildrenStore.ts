import { create } from 'zustand';
import * as childrenDb from '../database/children';
import * as collectionsDb from '../database/collections';
import type { ChildWithCount } from '../types/database';

interface ChildrenState {
  children: ChildWithCount[];
  isLoading: boolean;
  error: string | null;

  fetchChildren: () => Promise<void>;
  addChild: (name: string, color: string, avatarEmoji?: string) => Promise<number>;
  renameChild: (id: number, name: string) => Promise<void>;
  deleteChild: (id: number) => Promise<void>;
  getChildCardCount: (childId: number) => Promise<number>;
}

export const useChildrenStore = create<ChildrenState>((set, get) => ({
  children: [],
  isLoading: false,
  error: null,

  fetchChildren: async () => {
    set({ isLoading: true, error: null });
    try {
      const children = await childrenDb.getAllChildren();
      set({ children, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load children';
      set({ error: message, isLoading: false });
    }
  },

  addChild: async (name: string, color: string, avatarEmoji?: string) => {
    // Check for duplicate name
    const isDuplicate = await childrenDb.isChildNameDuplicate(name);
    if (isDuplicate) {
      throw new Error(`A child named "${name}" already exists`);
    }

    const childId = await childrenDb.addChild(name, color, avatarEmoji);
    // Refresh the list
    await get().fetchChildren();
    return childId;
  },

  renameChild: async (id: number, name: string) => {
    const isDuplicate = await childrenDb.isChildNameDuplicate(name, id);
    if (isDuplicate) {
      throw new Error(`A child named "${name}" already exists`);
    }

    await childrenDb.renameChild(id, name);
    await get().fetchChildren();
  },

  deleteChild: async (id: number) => {
    await childrenDb.deleteChild(id);
    await get().fetchChildren();
  },

  getChildCardCount: async (childId: number) => {
    return collectionsDb.getCardCount(childId);
  },
}));
