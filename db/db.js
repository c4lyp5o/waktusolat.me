import { Database } from "bun:sqlite";
import logger from "../utils/logger.js";

let dbInstance;
const DB_PATH = process.env.DB_PATH || "./db/visitors.sqlite";

/**
 * Initializes the SQLite database.
 * Ensures tables are created if they do not exist.
 * @returns {Database} The database instance.
 */
const initializeDatabase = async () => {
	if (!dbInstance) {
		try {
			dbInstance = new Database(DB_PATH, { create: true });

			dbInstance.exec(`
				CREATE TABLE IF NOT EXISTS visitors (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				ip_address TEXT,
				visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
				);
				-- insertVisitor's dedupe lookup (ip + recent date) on every /thanks.
				CREATE INDEX IF NOT EXISTS idx_visitors_ip_date ON visitors (ip_address, visit_date);
				-- Date-range / per-day aggregates in getVisitorStats.
				CREATE INDEX IF NOT EXISTS idx_visitors_date ON visitors (visit_date);
				-- Mosque TV settings (SPEC-mosque-registry.md). Only the edit
				-- token's sha256 is stored; nothing about who registered it.
				CREATE TABLE IF NOT EXISTS mosques (
				id TEXT PRIMARY KEY,
				name TEXT NOT NULL,
				zone TEXT NOT NULL,
				iqamah TEXT NOT NULL,
				jumaat INTEGER NOT NULL,
				solat INTEGER NOT NULL,
				token_hash TEXT NOT NULL,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL
				);
				-- A mosque's programmes (SPEC-programmes.md); deleted with it.
				CREATE TABLE IF NOT EXISTS programmes (
				id TEXT PRIMARY KEY,
				mosque_id TEXT NOT NULL,
				title TEXT NOT NULL,
				speaker TEXT,
				note TEXT,
				repeat TEXT NOT NULL,
				date TEXT,
				weekday INTEGER,
				at TEXT NOT NULL,
				from_date TEXT,
				until_date TEXT,
				skip_dates TEXT NOT NULL,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL
				);
				CREATE INDEX IF NOT EXISTS idx_programmes_mosque ON programmes (mosque_id);
				-- One speaker photo per programme: a cleaned JPEG.
				CREATE TABLE IF NOT EXISTS programme_photos (
				programme_id TEXT PRIMARY KEY,
				mosque_id TEXT NOT NULL,
				bytes BLOB NOT NULL,
				updated_at INTEGER NOT NULL
				);
				CREATE INDEX IF NOT EXISTS idx_photos_mosque ON programme_photos (mosque_id);
			`);
		} catch (error) {
			console.error("Error creating tables:", error.message);
			process.exit(1);
		}
	}

	logger.info(`[db] Database initialized at ${DB_PATH}`);
	return dbInstance;
};

export default initializeDatabase;
