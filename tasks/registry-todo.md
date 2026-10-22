# Tasks: mosque-registry (SPEC-mosque-registry.md)

Small module (backend only), built as one slice.

- [x] Table `mosques` in `db/db.js` (created at startup on an existing DB; e2e: visitor rows kept)
- [x] `controllers/mosques.js`: validation, ids, tokens, five handlers; `isAdmin()` split out of `middlewares/auth.js`
- [x] Routes in `routes/api.js` (bodies parsed in the controller)
- [x] `tests/mosques.test.js`: 28 cases, one or more per user story
- [x] README "Mosque Endpoints"
- [x] End to end through the node:http bridge: create, ETag, patch, bad JSON 400, admin delete; the token never appears in the log

## Success criteria
- [x] 1. All seven user stories pass as route tests.
- [x] 2. No response or log line contains a token except creation and rotation (test + e2e log grep).
- [x] 3. The table appears on an existing DB at startup without touching `visitors` (e2e on a copy of the dev DB).
- [x] 4. `bun test` (175, local and New York TZ) and Biome green; no new dependency.

## Checkpoint
- [x] Owner review (2026-10-23: "alright!!! ok lets go."). Next module: `programmes`.
