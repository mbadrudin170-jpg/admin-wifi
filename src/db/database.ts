import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("app.db");

export function initDb() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS pelanggan_aktif (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
