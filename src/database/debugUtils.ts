import { Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

function getDbPath(): string {
  return Paths.join(Paths.document, 'SQLite', 'pokemon_collection.db');
}

export function logDatabasePath() {
  const dbPath = getDbPath();
  console.log('──────────────────────────────────────');
  console.log('Database Location:', dbPath);
  console.log('──────────────────────────────────────');
  console.log('');
  console.log('To open on Simulator:');
  console.log('  find ~/Library/Developer/CoreSimulator -name "pokemon_collection.db"');
  console.log('  sqlite3 <path>');
  console.log('  Or open with: https://sqlitebrowser.org/');
  console.log('──────────────────────────────────────');
}

export async function shareDatabase() {
  const dbPath = getDbPath();

  try {
    const info = await Paths.info(dbPath);
    if (!info.exists) {
      console.warn('Database file does not exist at:', dbPath);
      return;
    }
  } catch {
    // Paths.info may throw if path doesn't exist — continue anyway
  }

  if (!(await Sharing.isAvailableAsync())) {
    console.warn('Sharing is not available on this platform');
    return;
  }

  await Sharing.shareAsync(dbPath, {
    mimeType: 'application/x-sqlite3',
    dialogTitle: 'Export Pokemon Card Database',
  });
}
