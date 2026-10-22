# Tasks: programmes (SPEC-programmes.md)

Backend only, built as one slice.

- [x] Tables `programmes` and `programme_photos` (`db/db.js`)
- [x] `controllers/programmes.js`: validation, 7-day occurrences in Malaysia dates, JPEG cleaner, handlers
- [x] `controllers/mosques.js`: token check, `touch()` and `nextVersion()` exported; deleting a mosque removes its programmes and photos in one transaction
- [x] Eight routes in `routes/api.js`
- [x] `tests/programmes.test.js`: 34 cases. Mutation check: disabling the metadata strip and the skip filter each turns tests red.
- [x] README under "Mosque Endpoints"
- [x] End to end through the node:http bridge with a real browser-made JPEG: upload, served byte-identical (only an ICC profile in it), cached immutable with nosniff + CSP, removed with the mosque; no token in the log

Found on the way: the first cleaner cut after the LAST end marker, which would have kept a phone's appended Multi-Picture image (with its own EXIF/GPS). It now walks the scan data and stops at the first end-of-image; the ICC colour profile is kept.

## Success criteria
- [x] 1. All eight user stories pass as route tests.
- [x] 2. Occurrence tests pass in both timezones, including Malaysia midnight.
- [x] 3. Deleting a mosque leaves no orphan programmes (or photos).
- [x] 4. `bun test` (209, local and New York TZ) and Biome green; no new dependency.

Not yet tried: a real phone photo (progressive JPEG with EXIF/MPF). The test fixtures cover each structure, and `mosque-editor` re-encodes through a canvas anyway.

## Checkpoint
- [ ] Owner review, then `mosque-editor` and `tv-mosque-mode`.
