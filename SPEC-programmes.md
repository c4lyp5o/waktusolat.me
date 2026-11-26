# Spec: `programmes`

Module 3 of the [capability map](CAPABILITY-MAP.md). Status: **approved 2026-10-23**, with the speaker photo added at the owner's request.

## Objective

Each registered mosque keeps a list of its programmes (kuliah, tazkirah, gotong-royong, kelas fardu ain…). The TV (`tv-mosque-mode`, later) shows the upcoming ones in its banner. This module is **backend only**: one table, edit routes guarded by the mosque's edit token, and a public "upcoming" feed. Pages come in `mosque-editor` and `tv-mosque-mode`.

**What a Malaysian mosque's programme looks like** (so the model fits it, not a generic calendar):
- Mostly **weekly** ("Kuliah Maghrib setiap Isnin"), some **one-off** ("Ceramah Maulidur Rasul, Sabtu 14 Nov").
- Usually timed **after a prayer** ("selepas Maghrib", "selepas Subuh"), not by the clock. The clock time moves with the prayer through the year. Clock times also exist ("9:00 pagi").
- A weekly class is sometimes **off for one week** (the ustaz is away). That shouldn't mean deleting it.
- Seasonal series run **between dates** (a Ramadan tazkirah series).

**User stories / acceptance**
1. With the mosque's edit token, `POST /api/v1/mosques/:id/programmes` adds a programme: a title, an optional speaker and note, and when it happens (once on a date, or weekly on a weekday), either at a clock time or after a named prayer.
2. With the token, a programme can be edited (`PATCH`) or deleted (`DELETE`). Without it: `401`, nothing changes.
3. A weekly programme can skip given dates ("cuti minggu ini") and can be limited to a date range (`from` / `until`).
4. `GET /api/v1/mosques/:id/programmes` (public) lists all of the mosque's programmes, for the editor.
5. `GET /api/v1/mosques/:id/programmes/upcoming` (public) returns the occurrences in the **next 7 days, from today in Malaysia time**, in date order, for the TV. Skipped dates, past one-offs and out-of-range dates are left out.
6. Any programme change makes the mosque's `ETag` change, so a polling TV notices with one cheap request. Deleting a mosque deletes its programmes.
7. A mosque holds at most **50** programmes. The 51st is a `400`, not a silent drop.
8. **Speaker photo:** with the token, a programme can have one photo (the ustaz's picture) uploaded, replaced or removed. The programme JSON carries its URL. The TV shows it beside the programme.

### Speaker photo
- **One optional photo per programme.** The same ustaz on two programmes is uploaded twice. That is simpler than a separate speakers list; a list can come later if wanted.
- **The browser does the heavy work** (in `mosque-editor`): it crops to a square and re-encodes to a JPEG of about 600×600, well under the limit. No image library on the server, so no new dependency.
- **The server still checks every upload, because a client can lie:**
  - JPEG only (by its bytes, not the declared type)
  - at most 200 KB
  - 64–1200 px a side
  - metadata segments stripped (EXIF, including GPS location and camera details; XMP; comments), and anything after the image's end marker cut off
- **Stored in sqlite** (`programme_photos`, one row per programme), in the same file and volume and backup as everything else.
- **Served** at `GET /api/v1/mosques/:id/programmes/:pid/photo?v=<version>` as `image/jpeg`, with these headers:
  - `nosniff`
  - `content-security-policy: default-src 'none'`
  - cached for a year when `v` is the current version, since a new upload changes the URL
- **Abuse limits:** 30 uploads per IP per hour, and a 1 GB total cap for all photos (`507` beyond it; a constant, easy to raise). Deleting the programme or the mosque deletes the photo. The owner can remove any mosque with `ADMIN_API_KEY`.
- **Consent:** the mosque uploads a photo of its own speaker. The editor page (later) will say so in one line.

**Not in this module:** pages (`mosque-editor`, `tv-mosque-mode`), posters or other images (only the speaker photo), monthly patterns ("first Friday of the month"), reminders or notifications, a public directory, English text.

## Data

```sql
CREATE TABLE IF NOT EXISTS programmes (
  id          TEXT PRIMARY KEY,      -- 8 chars, same alphabet as mosque ids
  mosque_id   TEXT NOT NULL,         -- mosques.id; rows deleted with the mosque
  title       TEXT NOT NULL,         -- 1..80
  speaker     TEXT,                  -- 0..60, e.g. "Ustaz Ahmad"
  note        TEXT,                  -- 0..80, e.g. "Dewan solat utama"
  repeat      TEXT NOT NULL,         -- "once" | "weekly"
  date        TEXT,                  -- "YYYY-MM-DD", when once
  weekday     INTEGER,               -- 0 (Ahad) .. 6 (Sabtu), when weekly
  at          TEXT NOT NULL,         -- "HH:MM" (24 h), or "after:maghrib" etc.
  from_date   TEXT,                  -- weekly only, optional, inclusive
  until_date  TEXT,                  -- weekly only, optional, inclusive
  skip_dates  TEXT NOT NULL,         -- JSON array of "YYYY-MM-DD", at most 20
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_programmes_mosque ON programmes (mosque_id);
```

- **"After a prayer" is stored as the prayer, not a clock time.** The server never resolves it to a time. The TV already holds the zone's year of prayer times and turns `after:maghrib` on 26 Oct into "selepas Maghrib (7:01 ptg)" itself. The feed stays simple and is never wrong by a minute.
- **Text is plain:** trimmed, no control characters, never HTML. React escapes it when shown.
- **Malaysia dates throughout:** "today" and weekdays are Malaysia time (UTC+8, `mytime` rules), whatever the server's timezone.

## API

All under `/api/v1/mosques/:id`. Writes need `Authorization: Bearer <edit token>` (same check as the registry). JSON in and out, under the existing global rate limit and body cap.

| Method and path | Auth | Body | Success |
| --- | --- | --- | --- |
| `GET /programmes` | none | — | `200 [programme…]` ordered by repeat, date/weekday, time |
| `POST /programmes` | token | programme fields | `201 programme` |
| `PATCH /programmes/:pid` | token | any programme fields | `200 programme` |
| `DELETE /programmes/:pid` | token | — | `204` |
| `GET /programmes/upcoming` | none | — | `200 { from, until, items: [{ date, at, programme }] }` |
| `PUT /programmes/:pid/photo` | token | the JPEG bytes (`content-type: image/jpeg`) | `200 programme` |
| `DELETE /programmes/:pid/photo` | token | — | `200 programme` |
| `GET /programmes/:pid/photo` | none | — | `200 image/jpeg` |

**Programme JSON**
```json
{
  "id": "k3m9x2ab",
  "title": "Kuliah Maghrib: Tafsir Al-Quran",
  "speaker": "Ustaz Ahmad",
  "note": null,
  "repeat": "weekly",
  "weekday": 1,
  "at": { "after": "maghrib" },
  "from": null,
  "until": null,
  "skip": ["2026-11-02"],
  "photo": "/api/v1/mosques/3h3efme7me/programmes/k3m9x2ab/photo?v=1792708634969",
  "updatedAt": 1792708634969
}
```
- A one-off has `"repeat": "once", "date": "2026-11-14"` and no `weekday`, `from`, `until` or `skip`.
- **`at`** is `{ "time": "21:00" }` or `{ "after": "subuh" | "zohor" | "asar" | "maghrib" | "isyak" }`. On a Friday, `after: "zohor"` is shown as after Jumaat by the TV.
- **Validation (`400 { message, field }`):**
  - the fields required for the repeat kind, and none of the other kind's fields
  - real calendar dates
  - `from` ≤ `until`
  - skip dates within `from`/`until` when set, at most 20, no duplicates
  - unknown fields rejected
  - a one-off in the past is allowed (the editor may tidy up later); it just never appears in `upcoming`

**Upcoming feed**
- The window is today plus the next 6 days, Malaysia time. `from` and `until` in the response are those dates.
- Each item is one occurrence: `{ date, at, programme }`. The same weekly programme appears once per matching day in the window (once a week, so once).
- The order is date, then clock times by time, and after-prayer items by prayer order (Subuh … Isyak) placed by the client. The server orders after-prayer items at a nominal time for each prayer (Subuh 06:00, Zohor 13:15, Asar 16:30, Maghrib 19:15, Isyak 20:30), so the list is stable and close to right. The TV re-sorts with the real times.
- **Caching:** `cache-control: no-cache`, with an `ETag` of the mosque's `updatedAt` plus today's date, because the feed changes when the day turns even if nothing was edited.

**Change tracking:** every programme `POST`, `PATCH` and `DELETE` bumps the mosque's `updated_at`. So `GET /mosques/:id`'s ETag also moves, and the TV can poll just that.

## Code layout

```
controllers/programmes.js  → validation, occurrence maths (pure, exported for tests), handlers
controllers/mosques.js     → export the token check and "touch" (bump updated_at); delete cascades
db/db.js                   → CREATE TABLE programmes + index
routes/api.js              → five routes
tests/programmes.test.js   → routes + occurrence maths (week boundaries, skip, range, timezone)
README.md                  → under "Mosque Endpoints"
```

Delete-with-mosque runs in one transaction (`DELETE programmes` then `DELETE mosque`), so it doesn't depend on sqlite's foreign-key pragma.

## Testing

`bun test` via `tests/app.js` (temp DB), run in both the local and `TZ=America/New_York` timezones like the rest:
- CRUD with and without the token, and on another mosque's programme id (`404`, so one mosque's token can't touch another's rows)
- each validation rule, and the 50-programme cap
- **occurrences:**
  - weekly across the window edge
  - a skip date
  - `from`/`until` cutting the window
  - a one-off today, in the past, and beyond 7 days
  - Malaysia midnight (23:30 UTC is already tomorrow in Malaysia)
- ETag: changes after an edit, and changes when the date turns (fake system time)
- deleting the mosque removes its programmes
- photo: upload, replace, remove, without the token (`401`), not a JPEG, too big or too small (`400`); EXIF and trailing bytes are gone from what's served; the per-IP and total caps

Biome clean; no new dependency.

## Boundaries
- **Always:** token check before any write, validate at the boundary, Malaysia dates via the shared rules, test the date maths at its edges.
- **Ask first:** monthly patterns, posters or more image kinds, an image library on the server, resolving prayer times on the server.
- **Never:** accept HTML, let one mosque's token reach another mosque's programmes, list programmes across mosques.

## Success criteria
1. All eight user stories pass as route tests.
2. Occurrence tests pass in both timezones, including Malaysia midnight.
3. Deleting a mosque leaves no orphan programmes.
4. `bun test` and Biome are green; no new dependency.

## Resolved questions (2026-10-23)
1. **Window:** 7 days.
2. **Limits:** 50 programmes per mosque and 20 skip dates per programme, approved.
3. **Times:** a clock time or "selepas {prayer}" is enough. No "sebelum", no end times.
4. **Added by the owner:** upload the ustaz's picture (see Speaker photo).
