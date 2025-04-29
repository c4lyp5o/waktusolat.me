import sqlite3 from "sqlite3";
import path from "node:path";

import logger from "../utils/logger.js";

const db = new sqlite3.Database(
	path.join(process.cwd(), "db", "visitors.db"),
	(err) => {
		if (err) {
			logger.error(
				"[sqlite3] Could not connect to the visitors database.",
				err.message,
			);
		}
		logger.info("[sqlite3] Connected to the visitors database.");
	},
);

const initiateDb = async () => {
	db.get(
		`SELECT name FROM sqlite_master WHERE type='table' AND name='visitors'`,
		(err, row) => {
			if (err) {
				logger.error(err.message);
			}
			if (!row) {
				db.run(
					`CREATE TABLE visitors(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip_address TEXT,
            visit_date TEXT
          )`,
					(err) => {
						if (err) {
							logger.error("[sqlite3] ", err.message);
						}
						logger.info("[sqlite3] Done initiating database");
					},
				);
			} else {
				logger.info(
					"[sqlite3] Visitors table already exists. Not intiating database.",
				);
			}
		},
	);

	return true;
};

export { db, initiateDb };
