import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('pokemon_collection.db');

  // Enable WAL mode for concurrent reads
  await db.execAsync('PRAGMA journal_mode = WAL');
  await db.execAsync('PRAGMA foreign_keys = ON');

  await createTables(db);

  return db;
}

async function createTables(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS children (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      color       TEXT    NOT NULL DEFAULT '#4A90D9',
      avatar_emoji TEXT,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cards (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      tcgdex_id   TEXT    UNIQUE,
      name        TEXT    NOT NULL,
      set_name    TEXT    NOT NULL,
      set_id      TEXT,
      edition     TEXT    NOT NULL DEFAULT 'unlimited',
      image_url   TEXT,
      card_type   TEXT,
      hp          TEXT,
      rarity      TEXT,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(name, tcgdex_id)
    );

    CREATE TABLE IF NOT EXISTS collection (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id    INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
      card_id     INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
      date_added  TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(child_id, card_id)
    );

    CREATE INDEX IF NOT EXISTS idx_collection_child ON collection(child_id);
    CREATE INDEX IF NOT EXISTS idx_collection_card ON collection(card_id);
    CREATE INDEX IF NOT EXISTS idx_collection_date ON collection(date_added);
  `);
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
