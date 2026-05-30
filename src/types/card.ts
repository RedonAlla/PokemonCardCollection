// Card types for the app domain and API responses

export interface CardSummary {
  id: string;
  name: string;
  image?: string;
  set?: {
    id: string;
    name: string;
  };
}

export interface CardDetail {
  id: string;
  name: string;
  category: string;
  image?: string;
  set: {
    id: string;
    name: string;
    cardCount: {
      official: number;
      total: number;
    };
  };
  variants?: {
    normal?: boolean;
    reverse?: boolean;
    holo?: boolean;
    firstEdition?: boolean;
  };
  dexId?: number[];
  hp?: number;
  types?: string[];
  rarity?: string;
  description?: string;
  illustrator?: string;
}

export interface CardInput {
  tcgdexId: string | null;
  name: string;
  setName: string;
  setId: string;
  edition: string;
  imageUrl: string | null;
  cardType: string | null;
  hp: string | null;
  rarity: string | null;
}

export interface ScannedCardResult {
  cardName: string;
  setId: string;
  setDisplayName: string;
  edition: string;
  imageUrl: string | null;
  cardType: string | null;
  hp: string | null;
  rarity: string | null;
  tcgdexId: string | null;
  rawOcrText: string;
}
