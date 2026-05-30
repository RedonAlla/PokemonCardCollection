// API response types

export interface TCGdexSet {
  id: string;
  name: string;
  cardCount: {
    official: number;
    total: number;
  };
  releaseDate?: string;
  logo?: string;
  symbol?: string;
}

export interface TCGdexCardSearchResult {
  id: string;
  name: string;
  image?: string;
  set?: {
    id: string;
    name: string;
  };
}

export interface SetSummary {
  id: string;
  name: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public url?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface OcrParseResult {
  cardName: string | null;
  setText: string | null;
  confidence: 'high' | 'medium' | 'low';
}

export interface CardMatchResult {
  tcgdexId: string;
  name: string;
  setId: string;
  setDisplayName: string;
  edition: string;
  imageUrl: string | null;
  cardType: string | null;
  hp: string | null;
  rarity: string | null;
  matchScore: number;
}
