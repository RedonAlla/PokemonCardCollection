import { create } from 'zustand';
import type { SetSummary } from '../types/api';

interface AppState {
  isDbReady: boolean;
  isSetsLoaded: boolean;
  knownSets: SetSummary[];
  isOnline: boolean;

  setDbReady: (ready: boolean) => void;
  setSetsLoaded: (sets: SetSummary[]) => void;
  setIsOnline: (online: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isDbReady: false,
  isSetsLoaded: false,
  knownSets: [],
  isOnline: true,

  setDbReady: (ready) => set({ isDbReady: ready }),
  setSetsLoaded: (sets) => set({ knownSets: sets, isSetsLoaded: true }),
  setIsOnline: (online) => set({ isOnline: online }),
}));
