import { getDatabase } from './init';
import type { ChildRow, ChildWithCount } from '../types/database';

export async function getAllChildren(): Promise<ChildWithCount[]> {
  const database = await getDatabase();
  return database.getAllAsync<ChildWithCount>(
    `SELECT ch.*, COUNT(col.id) AS card_count
     FROM children ch
     LEFT JOIN collection col ON ch.id = col.child_id
     GROUP BY ch.id
     ORDER BY ch.name ASC`
  );
}

export async function getChildById(id: number): Promise<ChildRow | null> {
  const database = await getDatabase();
  return database.getFirstAsync<ChildRow>(
    'SELECT * FROM children WHERE id = ?',
    [id]
  );
}

export async function addChild(name: string, color: string, avatarEmoji?: string): Promise<number> {
  const database = await getDatabase();
  const result = await database.runAsync(
    'INSERT INTO children (name, color, avatar_emoji) VALUES (?, ?, ?)',
    [name.trim(), color, avatarEmoji ?? null]
  );
  return result.lastInsertRowId;
}

export async function renameChild(id: number, name: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'UPDATE children SET name = ? WHERE id = ?',
    [name.trim(), id]
  );
}

export async function deleteChild(id: number): Promise<{ deletedCards: number }> {
  const database = await getDatabase();
  await database.withTransactionAsync(async () => {
    // Count cards only owned by this child (to report what gets removed)
    // Delete child; FK CASCADE removes collection entries
    await database.runAsync('DELETE FROM children WHERE id = ?', [id]);
  });

  // Count orphaned cards (cards no longer in any collection)
  const orphanCount = await database.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) AS count FROM cards c
     WHERE NOT EXISTS (SELECT 1 FROM collection col WHERE col.card_id = c.id)`
  );

  return { deletedCards: orphanCount?.count ?? 0 };
}

export async function isChildNameDuplicate(name: string, excludeId?: number): Promise<boolean> {
  const database = await getDatabase();
  let query = 'SELECT COUNT(*) AS count FROM children WHERE LOWER(name) = LOWER(?)';
  const params: (string | number)[] = [name.trim()];

  if (excludeId !== undefined) {
    query += ' AND id != ?';
    params.push(excludeId);
  }

  const result = await database.getFirstAsync<{ count: number }>(query, params);
  return (result?.count ?? 0) > 0;
}
