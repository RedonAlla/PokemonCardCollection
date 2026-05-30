// Database row types matching SQLite schema

export interface ChildRow {
  id: number;
  name: string;
  color: string;
  avatar_emoji: string | null;
  created_at: string;
}

export interface ChildWithCount extends ChildRow {
  card_count: number;
}

export interface CardRow {
  id: number;
  tcgdex_id: string | null;
  name: string;
  set_name: string;
  set_id: string;
  edition: string;
  image_url: string | null;
  card_type: string | null;
  hp: string | null;
  rarity: string | null;
  created_at: string;
}

export interface CollectionRow {
  id: number;
  child_id: number;
  card_id: number;
  date_added: string;
}

export interface CardWithDateAdded extends CardRow {
  date_added: string;
}

export interface OwnershipRow {
  child_id: number;
  child_name: string;
  child_color: string;
  owns_card: number; // SQLite boolean: 0 or 1
}
