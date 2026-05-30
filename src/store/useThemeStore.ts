import { create } from 'zustand';

export type ThemeMode = 'dark' | 'light';

interface ThemeState {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'dark',
  toggleTheme: () => set((s) => ({ mode: s.mode === 'dark' ? 'light' : 'dark' })),
  setTheme: (mode) => set({ mode }),
}));
