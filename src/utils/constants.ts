export const TCGDEX_BASE_URL = 'https://api.tcgdex.net/v2/en';

export const API_TIMEOUT_MS = 5000;
export const API_RETRY_COUNT = 2;
export const API_RETRY_DELAY_MS = 1000;

export const CARD_SUFFIXES = [
  'VMAX',
  'VSTAR',
  'V-UNION',
  'V',
  'ex',
  'GX',
  'EX',
  'BREAK',
  'TAG TEAM',
  'LV.X',
  'SP',
  'M',
  'Primal',
] as const;

export const SET_KEYWORDS = [
  'BASE',
  'JUNGLE',
  'FOSSIL',
  'SWORD',
  'SHIELD',
  'DARKNESS',
  'BRILLIANT',
  'ASTRA',
  'CROWN',
  'STELLAR',
  'PALDEA',
  'OBSIDIAN',
  'PARADOX',
  'TEMPORAL',
  'TWILIGHT',
  'SCARLET',
  'VIOLET',
  'DESTINY',
  'LEGEND',
  'MYSTERY',
  'POWER',
  'REBELLION',
] as const;

export const SCAN_AREA_ASPECT_RATIO = 1.4; // width / height (Pokémon card approx)

export const GRID_COLUMNS = 3;
export const GRID_SPACING = 8;
export const GRID_STAGGER_DELAY_MS = 50;
