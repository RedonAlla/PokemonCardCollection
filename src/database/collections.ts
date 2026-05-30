import { getDatabase } from './init';
import { upsertCard } from './cards';
import type { CardWithDateAdded, OwnershipRow } from '../types/database';
import type { CardInput } from '../types/card';

export async function getCardsForChild(
  childId: number,
  searchQuery?: string
): Promise<CardWithDateAdded[]> {
  const database = await getDatabase();

  if (searchQuery && searchQuery.trim().length > 0) {
    return database.getAllAsync<CardWithDateAdded>(
      `SELECT c.*, col.date_added
       FROM cards c
       JOIN collection col ON c.id = col.card_id
       WHERE col.child_id = ? AND c.name LIKE '%' || ? || '%'
       ORDER BY col.date_added DESC`,
      [childId, searchQuery.trim()]
    );
  }

  return database.getAllAsync<CardWithDateAdded>(
    `SELECT c.*, col.date_added
     FROM cards c
     JOIN collection col ON c.id = col.card_id
     WHERE col.child_id = ?
     ORDER BY col.date_added DESC`,
    [childId]
  );
}

export async function getCardCount(childId: number): Promise<number> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM collection WHERE child_id = ?',
    [childId]
  );
  return result?.count ?? 0;
}

export async function getCardOwnership(tcgdexId: string): Promise<OwnershipRow[]> {
  const database = await getDatabase();
  return database.getAllAsync<OwnershipRow>(
    `SELECT
       ch.id                AS child_id,
       ch.name              AS child_name,
       ch.color             AS child_color,
       col.id IS NOT NULL   AS owns_card
     FROM children ch
     LEFT JOIN collection col
       ON ch.id = col.child_id
       AND col.card_id = (
         SELECT id FROM cards WHERE tcgdex_id = ?
       )
     ORDER BY ch.name ASC`,
    [tcgdexId],
  );
}

export async function assignCardToChildren(
  card: CardInput,
  childIds: number[]
): Promise<void> {
  const database = await getDatabase();

  await database.withTransactionAsync(async () => {
    // Upsert the card first
    const cardId = await upsertCard(card);

    // Assign to each selected child
    for (const childId of childIds) {
      await database.runAsync(
        'INSERT OR IGNORE INTO collection (child_id, card_id) VALUES (?, ?)',
        [childId, cardId],
      );
    }
  });
}

export async function removeCardFromChild(
  childId: number,
  cardId: number
): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'DELETE FROM collection WHERE child_id = ? AND card_id = ?',
    [childId, cardId]
  );
}

export async function getNonOwningChildIds(tcgdexId: string): Promise<number[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{ id: number }>(
    `SELECT ch.id
     FROM children ch
     WHERE ch.id NOT IN (
       SELECT col.child_id
       FROM collection col
       JOIN cards c ON c.id = col.card_id
       WHERE c.tcgdex_id = ?
     )
     ORDER BY ch.name ASC`,
    [tcgdexId],
  );
  return rows.map(r => r.id);
}
