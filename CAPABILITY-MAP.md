# Capability Map: Mosque TV Dashboard

Free waktu solat dashboard for mosque TVs, with each mosque's own programmes shown as a moving banner. The existing mobile and desktop site stays unchanged.

## Decisions already made (2026-10-22)

| Topic | Decision |
| --- | --- |
| How a TV enters dashboard mode | **Dedicated URL** bookmarked on the TV (`/tv/:zone`, later `/m/:id`). Aspect ratio never switches modes, so laptops and phones are unaffected. |
| Who edits programmes | **Secret edit link**, no accounts. Creating a mosque returns a public TV link and a private edit link that carries a token. |
| Orientation | **Landscape only** (16:9). Portrait is out of scope. |
| Stack additions | `three` (ambient background) and `motion` (transitions). Both are lazy-loaded on the TV routes only. Art direction via the taste skill. |
| Mosque URL | `/m/:id`: a short random id, so pages can't be guessed or enumerated. No slugs. |
| Who can create a mosque | Anyone, rate-limited. Pages are unlisted. You can delete one with `ADMIN_API_KEY`. |
| Jumaat | On Friday, Zohor is shown as **Jumaat**, with its own iqamah/khutbah offset. |
| Hijri date | Always JAKIM's Hijri date from the data. Mosques cannot adjust it. |
| Process | Spec first. No code until each module spec is approved. Map approved 2026-10-22. |

## Modules

| Module id | Responsibility | Depends on |
| --- | --- | --- |
| `tv-display` | Read-only `/tv/:zone` screen: clock, Hijri/Gregorian date, today's prayers, next-prayer and iqamah countdown, ambient sky (three.js) tied to prayer times, motion transitions. Runs on weak TV browsers: offline year cache, server-time sync, Wake Lock, burn-in drift, daily self-reload, WebGL → CSS fallback. Needs one small backend addition: `GET /api/v1/time`. | existing REST API |
| `mosque-registry` | Backend: `mosques` table (random short id, name, zone, iqamah offsets, Jumaat offset). Create a mosque (rate-limited). Public read. Edit token stored hashed, can be rotated. | — |
| `programmes` | Backend: programme records per mosque (title, speaker, venue note, either a one-off date/time or weekly day + time, show-from/until window). Public "upcoming" feed, input validation, per-mosque limits. | `mosque-registry` |
| `mosque-editor` | Phone-friendly edit page opened from the secret link: mosque settings, iqamah offsets, create/edit/delete programmes, share the TV link / QR code, rotate the token. | `mosque-registry`, `programmes` |
| `tv-mosque-mode` | `/m/:id`: the `tv-display` screen plus mosque name, the mosque's iqamah offsets, and the programmes banner (rotating cards plus an optional short ticker). Polls for updates. | `tv-display`, `programmes` |

Build order: **`tv-display`** → `mosque-registry` → `programmes` → `mosque-editor` and `tv-mosque-mode` (in parallel)

Each module ships on its own. `tv-display` gives mosques a usable screen before any backend work.

## Assumptions (correct any that are wrong)

1. **Target devices** are smart-TV browsers (Tizen, webOS, Android TV) and cheap HDMI sticks/mini-PCs, at 1920×1080 (sometimes 3840×2160 reported at a 2× ratio). Weak GPUs mean the target is 30fps for animation, not 60.
2. **Viewing distance** is 3–10 m, so the UI is designed for reading from across a room: very large type and high contrast.
3. **Language:** Malay is the primary UI language, with prayer names as JAKIM uses them (Imsak, Subuh, Syuruk, Zohor, Asar, Maghrib, Isyak). English is optional and not in phase 1.
4. **Iqamah offsets** default to per-prayer minutes (e.g. Subuh +10, Zohor +10, …). In `tv-display` they are set via URL query params. `mosque-registry` makes them persistent.
5. **Times source** is the existing `/api/v1/waktusolat/year/:zone`, cached on the TV, so the screen keeps working without internet once loaded.
6. **No audio.** Azan playback is out of scope.
7. **Moderation:** mosque pages are unlisted (no public directory). Abuse is handled by rate-limiting creation plus a way for you to delete a mosque with `ADMIN_API_KEY`.
8. **Storage:** mosques and programmes go in the existing sqlite DB at `/app/storage`. No new database.
9. **Fonts and assets** are self-hosted (no Google Fonts at runtime), so the screen survives flaky mosque internet.

## Open questions

None. All four were resolved on 2026-10-22 (see Decisions).
