# Tasks: mosque-editor (SPEC-mosque-editor.md)

- [x] Pure libs with tests: `mosqueKeys.js` (fragment, phone memory), `programmeText.js` (Malay wording, "selepas Maghrib (7:01 malam)", next date for cuti), `photo.js` (centred square, 600 px JPEG under 200 KB), `mosqueApi.js` (Malay errors, TV link)
- [x] `/m/baru`: register, "save this link" screen with WhatsApp share and the TV link, "Masjid anda di telefon ini"
- [x] `/m/:id/edit`: week preview, programme list with "Cuti minggu ini"/"Batal cuti", programme sheet with photo, settings with steppers, TV link, rotate, type-the-name delete
- [x] `ZoneSearch` gains `onPick` (chips instead of photo tiles inside a form)
- [x] Entry points: landing card button, top bar ("Untuk Masjid" / "Masjid"), times page line, /about button
- [x] Backend: an empty PATCH no longer moves `updatedAt` (the editor checks a token with it)
- [x] `--danger` colour token, both themes

## Success criteria
- [x] 1. Journey on a 390×844 phone (scratch Playwright script, production build, scratch DB): register → save link → editor → weekly programme with a 4000×3000 photo → cuti → undo → second phone opens the link → rotate → old link refused → settings → delete. Desktop dark checked too.
- [x] 2. Token: address bar clean after load on both phones; 0 of 75 request URLs or Referers contain it; 0 occurrences in the server log.
- [x] 3. The 4000×3000 photo was uploaded as 600×600, 44 KB.
- [x] 4. `bun test` 219 pass (local and New York TZ), Biome clean. Main bundle +0.52 KB gzip (114.84 → 115.36); the pages are their own chunks (2 KB + 8 KB gzip). No new dependency.

Taste inspector `--app`: `/m/baru` 0 FAIL 0 WARN. Editor 0 FAIL, 1 WARN (below-fold at 1440). Defended: the page is phone-first, its one question ("Minggu ini di TV") is the first block, and the sticky section row reaches the rest in one tap.

Fixed on the way: Inter's contextual alternates drew "7x4" in an id as "7×4"; links now switch `calt` off. The interim TV link is now readable (plain commas).

Not done: the TV link is still the `/tv/:zone?…` form; it becomes `/m/:id` with `tv-mosque-mode`.

## Checkpoint
- [x] Owner review on a phone (2026-10-23: "Looks good. Lets move forward"). Next: `tv-mosque-mode`.
