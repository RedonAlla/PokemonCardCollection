import { getDatabase } from './init';
import type { CardRow } from '../types/database';
import type { CardInput as CardInputType } from '../types/card';

export async function upsertCard(card: CardInputType): Promise<number> {
  const database = await getDatabase();

  // Step 1 — check if a card with this tcgdex_id already exists.
  const existing = await database.getFirstAsync<{ id: number }>(
    'SELECT id FROM cards WHERE tcgdex_id = ?',
    [card.tcgdexId],
  );

  if (existing) {
    // Step 2a — update the existing row (only overwrite non-null fields).
    await database.runAsync(
      `UPDATE cards SET
         name      = ?,
         set_name  = ?,
         set_id    = ?,
         edition   = ?,
         image_url = COALESCE(?, image_url),
         card_type = COALESCE(?, card_type),
         hp        = COALESCE(?, hp),
         rarity    = COALESCE(?, rarity)
       WHERE id = ?`,
      [
        card.name,
        card.setName,
        card.setId,
        card.edition,
        card.imageUrl ?? null,
        card.cardType ?? null,
        card.hp ?? null,
        card.rarity ?? null,
        existing.id,
      ],
    );
    return existing.id;
  }

  // Step 2b — insert a new row.
  const result = await database.runAsync(
    `INSERT INTO cards (tcgdex_id, name, set_name, set_id, edition, image_url, card_type, hp, rarity)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      card.tcgdexId ?? null,
      card.name,
      card.setName,
      card.setId,
      card.edition,
      card.imageUrl ?? null,
      card.cardType ?? null,
      card.hp ?? null,
      card.rarity ?? null,
    ],
  );
  return result.lastInsertRowId;
}

export async function getCardByNameAndSet(name: string, tcgdexId: string): Promise<CardRow | null> {
  const database = await getDatabase();
  return database.getFirstAsync<CardRow>(
    'SELECT * FROM cards WHERE name = ? AND tcgdex_id = ?',
    [name, tcgdexId],
  );
}

export async function getCardById(id: number): Promise<CardRow | null> {
  const database = await getDatabase();
  return database.getFirstAsync<CardRow>(
    'SELECT * FROM cards WHERE id = ?',
    [id]
  );
}

export async function searchCards(query: string): Promise<CardRow[]> {
  const database = await getDatabase();
  return database.getAllAsync<CardRow>(
    `SELECT * FROM cards WHERE name LIKE '%' || ? || '%' ORDER BY name ASC LIMIT 20`,
    [query]
  );
}
