# Tasks: redesign (SPEC-redesign.md)

- [x] 1. Tokens and type: Bricolage Grotesque + Noto Naskh Arabic bundled (Inter dropped), `--sheet`, skies retuned toward Langit, `scripts/contrast.mjs` (96 pairs, 0 under 4.5:1)
- [x] 2. Zone page in Langit: whole-page sky (navbar too, via `useZoneSky`), the arc as a half ellipse with the countdown inside, times on the sheet (a row of 7 from md up); dev-only `?now=` on the site (`siteNow.js`). Phone 390×844: Isyak ends ~620px
- [x] 3. Rest of the site: a `SkySheet` layout route (the navbar's sky runs on, the page sits on the sheet) for Quran, hadith, radio, chat, about, 404, /m/baru, the editor and the landing picker; ground fills moved to the sheet
- [x] 4. TV: layout/theme split (`tv.css` layout, `themes/langit.css` tokens per sky on `.tv[data-tema][data-sky]`), burn-in drift on an inner wrapper, three.js reads `--arc`/`--sun` (a first version drew the arc before its geometry existed, so it vanished; caught in the browser), contrast 156 pairs
- [x] 5. TV: Takwim and Songket themes, each a lazy chunk with its fonts (`useTheme`: Langit until it is in), `?tema=` validated in `parseConfig` (+ test), contrast 176 pairs; checked countdown, iqamah and solat states
- [x] 6. `tema` on mosques: validated field (400 otherwise), `addMissingColumns` adds the column to an existing DB (+ test on the old schema), `mosqueConfig` maps it, `TemaPicker` in Tetapan. Browser: an API edit to songket reached the TV in 57 s with no reload. Found on the way: `db.js` read `DB_PATH` at import, so a test importing it first sent the mosque tests to the dev DB; now read at open (40 stray dev rows removed)
- [x] 7. README (`tema` parameter, theme picker, contrast script), `tv-shots.mjs` shoots every zone state in each theme (39 shots at 1080p reviewed; Songket's star band now hidden on full-screen states)
- [x] 8. Owner check on the Android TV: each theme, and switching theme from the phone (owner: "looks good", 2026-10-24)
