# Spec: `mosque-registry`

Module 2 of the [capability map](CAPABILITY-MAP.md). Status: **approved 2026-10-23**.

## Objective

A mosque's TV settings saved on the server instead of in a long URL. Anyone can register a mosque in a few seconds without an account. They get back a short public TV link (`/m/:id`, used later by `tv-mosque-mode`) and a private edit link (used later by `mosque-editor`). This module is the **backend only**: a table and a small REST API. No pages ship in it.

**Users**
- **Mosque AJK** registering their mosque: names it, picks the zone, optionally sets iqamah offsets. They keep the edit link, which is the only thing that lets them change the settings.
- **The TV** (later): reads the public settings by id, without a token.
- **The owner (you):** deletes an abusive or junk entry with `ADMIN_API_KEY`.

**User stories / acceptance**
1. `POST /api/v1/mosques` with a name and a valid zone returns `201` with a new random id, the TV path, the edit path and the edit token. The token is shown **once** and is never readable again.
2. `GET /api/v1/mosques/:id` returns the public settings, never the token or its hash. An unknown id returns `404`.
3. `PATCH /api/v1/mosques/:id` with the right token changes any of the editable fields. With a missing or wrong token it returns `401` and changes nothing.
4. `POST /api/v1/mosques/:id/token` with the current token returns a new token. The old token stops working immediately (a "the link leaked" reset).
5. `DELETE /api/v1/mosques/:id` with the edit token (the mosque deleting itself) **or** `x-api-key: <ADMIN_API_KEY>` (the owner) removes the mosque. Without either it returns `401`. The admin path fails closed when the key is unset, like the existing admin routes.
6. Creation is rate-limited per client IP and capped globally per day, so a script cannot fill the database.
7. Every invalid input returns `400` with a short message naming the field. Nothing invalid is stored.

**Not in this module:** programmes (`programmes`), any UI (`mosque-editor`, `tv-mosque-mode`), a public directory or search (pages stay unlisted), GraphQL exposure, accounts, recovery of a lost edit link.

## Data

A new table in the existing sqlite DB (`DB_PATH`, already on the `/app/storage` volume). It is created by `CREATE TABLE IF NOT EXISTS` at startup like `visitors`, so no migration step is needed.

```sql
CREATE TABLE IF NOT EXISTS mosques (
  id          TEXT PRIMARY KEY,          -- 10 chars, random, see Ids
  name        TEXT NOT NULL,             -- 1..60 chars, trimmed
  zone        TEXT NOT NULL,             -- lower-case JAKIM code, must be in controllers/zones.js
  iqamah      TEXT NOT NULL,             -- JSON {"subuh":10,"zohor":10,"asar":10,"maghrib":10,"isyak":10}
  jumaat      INTEGER NOT NULL,          -- 0..90
  solat       INTEGER NOT NULL,          -- 1..60
  token_hash  TEXT NOT NULL,             -- sha256 hex of the edit token
  created_at  INTEGER NOT NULL,          -- epoch ms
  updated_at  INTEGER NOT NULL           -- epoch ms; bumped on every PATCH
);
```

- **No IP or personal data is stored with a mosque.** The rate limiter's memory is the only place an IP appears, and it ages out.
- **Field bounds match `tv-display`'s URL parameters** (`client/src/lib/waktu/config.js`), so a mosque and a `/tv/:zone?…` link mean the same thing. Defaults: iqamah 10 for every prayer, Jumaat 30, solat 10.

### Ids and tokens
- **Id:** 10 characters of lower-case Crockford base32 (`0123456789abcdefghjkmnpqrstvwxyz`, no i, l, o or u, so nothing is misread), from `crypto.randomBytes`. That is 50 bits, so ids cannot be guessed or enumerated. On the unlikely collision, it retries.
- **Edit token:** 32 random bytes, base64url (43 characters). It is stored only as its sha256. A token this random needs no slow hash or salt. It is compared with `timingSafeEqual`, like `ADMIN_API_KEY`.
- **The token travels in the URL fragment** of the edit link (`/m/:id/edit#k=<token>`), which browsers never send to the server or in a `Referer`. The editor page will send it as `Authorization: Bearer <token>`. It never appears in a query string or server log.

## API

All under `/api/v1`, JSON in and out, inside the existing global rate limit (100/min per IP) and 1 MiB body cap.

| Method and path | Auth | Body | Success |
| --- | --- | --- | --- |
| `POST /mosques` | none (creation limit) | `{ name, zone, iqamah?, jumaat?, solat? }` | `201 { mosque, token, tvPath: "/m/:id", editPath: "/m/:id/edit#k=…" }` |
| `GET /mosques/:id` | none | — | `200 { id, name, zone, iqamah, jumaat, solat, updatedAt }` |
| `PATCH /mosques/:id` | `Authorization: Bearer <token>` | any of `{ name, zone, iqamah, jumaat, solat }` | `200` with the public settings |
| `POST /mosques/:id/token` | `Authorization: Bearer <token>` | — | `200 { token, editPath }` |
| `DELETE /mosques/:id` | `Authorization: Bearer <token>` or `x-api-key` | — | `204` |

- **`iqamah`** is accepted as an object with all five keys, each an integer 0–60. A partial object is a `400`, so a typo never silently leaves a prayer at its default.
- **Unknown body fields** are a `400`, so a client bug is caught instead of ignored.
- **Errors:** `400 { message, field }`, `401 { message: "Unauthorized" }`, `404 { message: "Not found" }`, `429` (existing limiter shape).
- **Caching:** `GET /mosques/:id` is sent with `cache-control: no-cache` and an `ETag` built from `updated_at`, so a polling TV gets a cheap `304` until something changes. It is not put in the in-memory response cache, so an edit shows on the next poll.
- **Wrong token versus unknown id:** `PATCH` and `token` on an unknown id return `404`. Ids are public (they're on the TV link), so this reveals nothing.

### Creation limits
- **Per IP:** 5 creations per hour (a mosque office registering a few screens is fine; a loop is not). A separate `RateLimiter` instance, keyed on the same resolved client IP as the global limiter.
- **Global:** 500 creations per day across all IPs, as a backstop against a spread-out flood. When it trips, creation returns `429` and everything else keeps working.
- Both limits are constants in one place, easy to change.

## Code layout

```
controllers/mosques.js   → validation, id/token generation, handlers (pure parts exported for tests)
db/db.js                 → CREATE TABLE mosques (next to visitors)
routes/api.js            → the five routes; DELETE inside the existing adminRoutes guard
tests/mosques.test.js    → route-level tests through tests/app.js (temp DB)
README.md                → "Mosque endpoints" section
```

Style follows the current handlers: plain functions, validation runs before the creation limit (so typos don't use up an AJK's hourly allowance), bun:sqlite prepared statements, `logger` for creation and deletion (id only, never the token).

## Testing

`bun test`, through the existing `tests/app.js` harness (temp sqlite file, `apiRoutes.handle`). Cases:
- create → get → patch → get reflects the change, and `updatedAt` moves
- the token is never in any `GET` response, and the stored value is a hash
- wrong, missing or rotated-away token → `401`, nothing changes
- every field's bounds, plus a bad zone, a partial `iqamah`, an unknown field, and a non-JSON body → `400`
- per-IP creation limit → `429` on the 6th; other IPs are unaffected
- delete: with the token `204`; with the admin key `204`, then `404`; with neither `401`; admin key unset → `401`
- `ETag` / `If-None-Match` → `304`

Biome clean. All existing tests still green in both timezones.

## Boundaries
- **Always:** validate at the boundary, store only the token hash, prepared statements, tests for every route.
- **Ask first:** any new dependency, exposing mosques in GraphQL, storing anything about the person who registered.
- **Never:** return a token after creation or rotation, put a token in a query string or log, add a listing endpoint.

## Success criteria
1. All seven user stories pass as route tests.
2. No response body or log line contains a token, except the one-time creation and rotation responses.
3. The `mosques` table appears on an existing DB at startup without touching `visitors` data.
4. `bun run test` and Biome are green; no new dependency.

## Resolved questions (2026-10-23)
1. **Lost edit link:** no self-service recovery. The AJK asks the owner, or registers again and the owner deletes the old entry.
2. **Self-delete:** yes, the token holder can delete their own mosque, as well as the owner with `ADMIN_API_KEY`.
3. **Creation limits:** 5 per IP per hour and 500 per day, approved.
