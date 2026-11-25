import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("app.db");

export function initDb() {
  db.execSync(`
    DROP TABLE IF EXISTS pelanggan_aktif;
    CREATE TABLE pelanggan_aktif (
      id TEXT PRIMARY KEY,
      nama TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

initDb();
