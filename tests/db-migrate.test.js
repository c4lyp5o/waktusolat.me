// DB: columns added after a table first shipped (db/db.js addMissingColumns).
import { Database } from "bun:sqlite";
import { describe, expect, test } from "bun:test";
import { addMissingColumns } from "../db/db.js";

// The mosques table as it was before themes (SPEC-redesign.md).
const OLD_MOSQUES = `CREATE TABLE mosques (
	id TEXT PRIMARY KEY, name TEXT NOT NULL, zone TEXT NOT NULL, iqamah TEXT NOT NULL,
	jumaat INTEGER NOT NULL, solat INTEGER NOT NULL, token_hash TEXT NOT NULL,
	created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
)`;

describe("addMissingColumns", () => {
	test("an old mosques table gains tema; existing rows read langit", () => {
		const db = new Database(":memory:");
		db.exec(OLD_MOSQUES);
		db.prepare(
			"INSERT INTO mosques VALUES ('abc', 'Masjid', 'wly01', '{}', 30, 10, 'h', 1, 1)",
		).run();
		addMissingColumns(db);
		expect(db.prepare("SELECT tema FROM mosques WHERE id = 'abc'").get()).toEqual({
			tema: "langit",
		});
	});

	test("idempotent: a second run (every later start) changes nothing", () => {
		const db = new Database(":memory:");
		db.exec(OLD_MOSQUES);
		addMissingColumns(db);
		addMissingColumns(db);
		const names = db
			.prepare("PRAGMA table_info(mosques)")
			.all()
			.map((c) => c.name);
		expect(names.filter((n) => n === "tema")).toHaveLength(1);
	});
});
