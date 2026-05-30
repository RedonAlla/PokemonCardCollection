import { getDatabase } from './init';

const CURRENT_SCHEMA_VERSION = 2;

export async function runMigrations(): Promise<void> {
  const database = await getDatabase();

  // Create schema_version table if it doesn't exist
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER NOT NULL
    );
  `);

  // Check current version
  const versionRow = await database.getFirstAsync<{ version: number }>(
    'SELECT version FROM schema_version LIMIT 1',
  );

  const currentVersion = versionRow?.version ?? 0;

  if (currentVersion < 1) {
    // Initial schema is created in init.ts, just record the version.
    // No-op: init.ts CREATE TABLE IF NOT EXISTS already ran.
    await database.runAsync(
      'INSERT INTO schema_version (version) VALUES (?)',
      [1],
    );
  }

  if (currentVersion < 3) {
    // V2: Ensure UNIQUE constraints exist on the cards table for databases
    // that were created before these constraints were added to the DDL.
    // SQLite cannot ALTER TABLE ADD CONSTRAINT, so we use UNIQUE indexes
    // which provide the same uniqueness enforcement.
    await database.execAsync(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_cards_tcgdex_id ON cards(tcgdex_id);
      CREATE UNIQUE INDEX IF NOT EXISTS uq_cards_name_tcgdex ON cards(name, tcgdex_id);
    `);
    await database.runAsync(
      'UPDATE schema_version SET version = ?',
      [CURRENT_SCHEMA_VERSION],
    );
  }
}
