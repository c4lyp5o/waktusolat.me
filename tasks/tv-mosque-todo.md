# Tasks: tv-mosque-mode (SPEC-tv-mosque-mode.md)

- [x] `lib/waktu/mosqueTv.js` (pure): settings -> config, cache, live programmes with the 2-hour drop-off, the Malay "when" line, the banner rotation; `tests/tv-mosque.test.js` (8, both timezones)
- [x] `TvApp.jsx` split: `TvScreen({ zone, config, feed, notice })`; `/tv/:zone` renders it from the URL as before
- [x] `MosqueTv.jsx` (/m/:id): boots from localStorage, polls mosque + feed every 60 s with If-None-Match; only a 404 means gone
- [x] `Banner.jsx`: every live programme, then one ayat or hadith; a card that stops being live leaves at once; `ProgrammeCard.jsx` + CSS (photo full slot height, nothing under 3.2vh)
- [x] `Header.jsx`: notice line; `lib/routes.js` `isTvPath` (no site chrome on /m/:id, chrome kept on /m/baru and /m/:id/edit)
- [x] Service worker: also scope /m/, shell only for TV pages, cache-first programme photos (100 max)
- [x] Editor and registration TV link -> `/m/:id`
- [x] README, `scripts/tv-shots.mjs` (`MOSQUE=<id>`)

## Success criteria
- [x] 1. Browser run at 1920×1080 (production build, scratch DB, real time). The header shows the mosque's name and the iqamah follows its settings. Three live programmes rotated, and the one already past today was dropped. An API edit reached the TV in 34 s with no reload. An offline reload kept the name, programmes and photo. A delete brought the "tidak lagi aktif" line with no card left. An unknown id gets its own message.
- [x] 2. Idle for 125 s: exactly 4 requests, all 304 (two a minute).
- [x] 3. `bun test` and Biome green; no new dependency. Main bundle +0.13 KB gzip; `/m/:id` loads a 0.8 KB chunk on top of the TV chunk.
- [x] 4. Owner check on the Android TV: open `/m/:id`, edit a programme on the phone, see it within a minute.

Found on the way: a programme card stayed on screen up to 20 s after its mosque was deleted (or its 2 hours ran out). It now leaves at once. A first version of that fix broke rendering ("shown is not defined"), and the browser run caught it before commit.

Taste inspector `--app` at 1920: `/m/:id` 0 FAIL 0 WARN. `/tv/wly01` 0 FAIL, 1 WARN (mixed-font-headline). Defended: it's the banner's existing Uthmanic ayat beside its reference, and depends on the random ayat shown.
