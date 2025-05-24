import { Database } from "bun:sqlite";
import logger from "../utils/logger.js";

let dbInstance;

/**
 * Initializes the SQLite database.
 * Ensures tables are created if they do not exist.
 * @returns {Database} The database instance.
 */
const initializeDatabase = async () => {
	if (!dbInstance) {

		try {
			dbInstance = new Database(process.env.DB_PATH || "./db/visitors.sqlite", { create: true });

			dbInstance.exec(`
				CREATE TABLE IF NOT EXISTS visitors (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				ip_address TEXT,
				visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
				);
			`);
		} catch (error) {
			console.error("Error creating tables:", error.message);
			process.exit(1);
		}
	}

	logger.info(
		`[db] Database initialized at ${process.env.DB_PATH || "./database/visitors.sqlite"}`,
	);
	return dbInstance;
};

export default initializeDatabase;