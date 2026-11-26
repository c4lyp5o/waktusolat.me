// app.js — shared test harness for route-level tests.
//
// visitors.js opens the sqlite DB at import time, and bun shares the module
// cache across test files, so the DB path is fixed once here (before the
// dynamic import) and removed when the test process exits.
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const dbPath = join(tmpdir(), `waktusolat-test-${process.pid}.sqlite`);
process.env.DB_PATH = dbPath;
process.on("exit", () => {
	for (const suffix of ["", "-wal", "-shm"]) rmSync(`${dbPath}${suffix}`, { force: true });
});

export const { apiRoutes } = await import("../routes/api.js");
export const { default: initializeDatabase } = await import("../db/db.js");

// apiRoutes.handle() bypasses the node:http bridge, so the resolved client
// IP header is supplied by the caller (as the bridge would).
export const call = (path, { method = "GET", headers = {}, body } = {}) =>
	apiRoutes.handle(new Request(`http://localhost/api/v1${path}`, { method, headers, body }));
