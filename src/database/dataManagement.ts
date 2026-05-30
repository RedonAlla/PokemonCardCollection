import { getDatabase } from './init';
import type { ChildRow, CardRow, CollectionRow } from '../types/database';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Structured snapshot of all data in the database. */
export interface DatabaseExport {
  exported_at: string;
  children: ChildRow[];
  cards: CardRow[];
  collection: CollectionRow[];
}

/** Result summary returned by importFromJson. */
export interface ImportSummary {
  children: number;
  cards: number;
  collection: number;
}

// ---------------------------------------------------------------------------
// Reset
// ---------------------------------------------------------------------------

/** Wipe all data from every table. Resets auto-increment counters. */
export async function resetAllData(): Promise<void> {
  const database = await getDatabase();
  await database.withTransactionAsync(async () => {
    await database.runAsync('DELETE FROM collection');
    await database.runAsync('DELETE FROM cards');
    await database.runAsync('DELETE FROM children');
  });
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

/** Read every row from all three tables and return a structured snapshot. */
export async function exportAllData(): Promise<DatabaseExport> {
  const database = await getDatabase();

  const children = await database.getAllAsync<ChildRow>(
    'SELECT * FROM children ORDER BY id ASC',
  );
  const cards = await database.getAllAsync<CardRow>(
    'SELECT * FROM cards ORDER BY id ASC',
  );
  const collection = await database.getAllAsync<CollectionRow>(
    'SELECT * FROM collection ORDER BY id ASC',
  );

  return {
    exported_at: new Date().toISOString(),
    children,
    cards,
    collection,
  };
}

// ---------------------------------------------------------------------------
// Import
// ---------------------------------------------------------------------------

/**
 * Validate a parsed JSON object as a DatabaseExport.
 * Returns an array of error messages, or an empty array if valid.
 */
function validateExport(data: unknown): string[] {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return ['JSON root must be an object.'];
  }

  const obj = data as Record<string, unknown>;

  if (!Array.isArray(obj.children)) {
    errors.push('Missing or invalid "children" array.');
  }
  if (!Array.isArray(obj.cards)) {
    errors.push('Missing or invalid "cards" array.');
  }
  if (!Array.isArray(obj.collection)) {
    errors.push('Missing or invalid "collection" array.');
  }

  return errors;
}

/**
 * Import data from a validated DatabaseExport object.
 * Uses INSERT OR IGNORE to skip duplicate rows.
 * Returns a summary of how many rows were imported per table.
 */
export async function importFromJson(data: unknown): Promise<ImportSummary> {
  const validationErrors = validateExport(data);
  if (validationErrors.length > 0) {
    throw new Error(validationErrors.join('\n'));
  }

  const { children, cards, collection } = data as DatabaseExport;
  const database = await getDatabase();

  let importedChildren = 0;
  let importedCards = 0;
  let importedCollection = 0;

  await database.withTransactionAsync(async () => {
    // Import children
    for (const child of children) {
      if (!child.name) continue;
      const result = await database.runAsync(
        `INSERT OR IGNORE INTO children (id, name, color, avatar_emoji, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [child.id ?? null, child.name, child.color ?? '#4A90D9', child.avatar_emoji ?? null, child.created_at ?? new Date().toISOString()],
      );
      if (result.changes > 0) importedChildren++;
    }

    // Import cards
    for (const card of cards) {
      if (!card.name) continue;
      const result = await database.runAsync(
        `INSERT OR IGNORE INTO cards (id, tcgdex_id, name, set_name, set_id, edition, image_url, card_type, hp, rarity, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          card.id ?? null, card.tcgdex_id ?? null, card.name, card.set_name,
          card.set_id, card.edition ?? 'unlimited', card.image_url ?? null,
          card.card_type ?? null, card.hp ?? null, card.rarity ?? null,
          card.created_at ?? new Date().toISOString(),
        ],
      );
      if (result.changes > 0) importedCards++;
    }

    // Import collection entries
    for (const col of collection) {
      if (col.child_id == null || col.card_id == null) continue;
      const result = await database.runAsync(
        `INSERT OR IGNORE INTO collection (id, child_id, card_id, date_added)
         VALUES (?, ?, ?, ?)`,
        [col.id ?? null, col.child_id, col.card_id, col.date_added ?? new Date().toISOString()],
      );
      if (result.changes > 0) importedCollection++;
    }
  });

  return { children: importedChildren, cards: importedCards, collection: importedCollection };
}
