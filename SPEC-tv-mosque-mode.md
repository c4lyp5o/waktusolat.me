# Spec: `tv-mosque-mode`

Module 5 of the [capability map](CAPABILITY-MAP.md), the last one. Status: **approved 2026-10-23**.

## Objective

**`/m/:id`**: the `tv-display` screen for one registered mosque. It shows the mosque's name and uses its own iqamah, Jumaat and solat minutes. The banner also carries the mosque's **upcoming programmes**, with the ustaz's photo. The AJK changes something on the phone, and the hall's TV shows it within a minute, with no one touching the TV. The link is short enough to type with a TV remote: `waktusolat.me/m/7pb20m9j44`.

This module is mostly wiring. The screen, the offline behaviour and the APIs already exist.

**User stories / acceptance**
1. **The screen:** opening `/m/:id` on the TV shows the same screen as `/tv/:zone`, using the mosque's zone and settings:
   - the mosque's name in the header
   - its iqamah and Jumaat minutes driving the countdowns
   - its solat-screen length

   No query parameters are needed (any given are ignored).
2. **The banner:**
   - When the mosque has programmes in the next 7 days, they take turns with the ayat and hadith. The cycle shows each upcoming programme, then one ayat or hadith, then repeats.
   - Each programme card shows the photo (if any), the title, the speaker and when: "Malam ini · selepas Isyak (8:10 malam)", "Esok · 9:00 pagi", "Isnin, 26 Oktober · selepas Maghrib (7:01 malam)".
   - The times come from the zone's prayer times the TV already holds.
   - With no programmes, the banner is exactly as it is today.
3. **Live updates:** an edit on the phone shows on the TV within **60 s**.
   - The TV polls the mosque and its feed with `If-None-Match`, so an unchanged mosque costs two `304`s a minute.
   - A changed mosque name, zone or iqamah applies without a reload.
4. **Past programmes drop off:** an occurrence leaves the banner **2 hours after it starts**. There are no end times, so this is the rule. A kuliah "selepas Maghrib" at 7:01 is gone by 9:01.
5. **Offline:**
   - The TV caches the mosque's settings, its feed and the programme photos.
   - After one online load, a reload with the network off shows the full screen, the mosque's name and its programmes, and keeps rotating them, dropping each as its time passes.
   - The service worker covers `/m/` as it already covers `/tv/`.
6. **Gone or unknown:**
   - A mosque that was deleted (`404`) shows its last known zone's times with no name or programmes, plus a small line "Paparan masjid ini tidak lagi aktif".
   - An unknown id with nothing cached shows "Masjid tidak dijumpai".
   - Network errors are never treated as "gone".
7. **The editor's TV link becomes `/m/:id`**, shown large, with Buka opening it. `/tv/:zone?…` keeps working for anyone not registered.

**Not in this module:**
- a scrolling ticker (see Open questions)
- azan audio
- a QR code on the TV
- jemaah-facing pages for the programmes
- per-programme colours or posters

## Design

The taste sheet stays `true-black-flat` with lamp amber, as for `tv-display`.

**The programme card** sits in the banner's existing slot, at the same height and the same `--surface` card.
- **Photo:** a square, full card height (about 14 vh). With no photo, there is no placeholder: the text takes the width.
- **Text:**
  - the "when" line at `--fs-small` in amber (amber still means *now / next*)
  - the title at `--fs-row`
  - the speaker at `--fs-small` muted
- **Size:** nothing under 3.2 vh. Titles longer than two lines are clipped with an ellipsis, never shrunk.
- **Rotation:** a programme card stays for 20 s, the same as an ayat. It enters with the existing banner motion, and `prefers-reduced-motion` keeps only the fade.
- **Today's items:** they lead each cycle and say "Hari ini" or "Malam ini" (an evening programme, start at or after 18:00, gets "Malam ini").

## Code layout

```
client/src/tv/TvApp.jsx            takes { zone, config, mosque? } from its route; /tv/:zone unchanged
client/src/tv/MosqueTv.jsx         /m/:id: loads, caches and polls the mosque + feed, renders TvApp
client/src/tv/Banner.jsx           accepts the programme list; mixes it into the rotation
client/src/tv/ProgrammeCard.jsx    the card
client/src/lib/waktu/mosqueTv.js   pure: settings -> config, cache read/write, the rotation order,
                                   the 2-hour drop-off, the Malay "when" for the TV
client/public/tv-sw.js             also scope /m/; cache-first for programme photos (?v= URLs)
client/src/pages/MosqueEditor.jsx  TV link -> /m/:id (and MosqueNew's)
tests/tv-mosque.test.js
scripts/tv-shots.mjs               adds /m/ states (needs a seeded mosque; documented in the script)
```

**Mosque settings and config:** `{ iqamah, jumaat, solat, name }` maps onto `parseConfig`'s output shape, so `screenState` and everything below it are untouched. `?now=` still works in dev for screenshots.

## Testing

- **Unit (`bun test`, both timezones):**
  - settings → config
  - the rotation order: today first, then by time, one ayat or hadith per cycle, and empty → today's behaviour
  - the 2-hour drop-off across midnight and for after-prayer times
  - the Malay "when" line ("Malam ini", "Esok", dates)
  - cache read and write, with storage blocked
- **Browser (scratch Playwright, production build, scratch DB):**
  - seed a mosque with 3 programmes (one with a photo) and open `/m/:id` at 1920×1080: name, iqamah and a programme card are shown
  - edit on the API: the TV updates within 60 s, with no reload
  - offline reload: the name, programmes and photo are still there
  - delete the mosque: the "tidak lagi aktif" line
  - `/tv/wly01` unchanged (screenshot diff)
- **Checks:** taste `inspect.mjs --app` on `/m/:id` with no new FAIL. `three` and `motion` stay out of the main bundle.

## Boundaries
- **Always:** keep `/tv/:zone` behaviour identical, treat only a real `404` as "gone", and cache everything the TV needs to boot offline.
- **Ask first:** any backend change, a ticker, any new dependency.
- **Never:** a reload loop on errors, an edit token on the TV, a poll faster than 60 s.

## Success criteria
1. All seven user stories pass in the browser run, and the TV display's 8 original criteria still hold for `/m/:id` (offline boot, clock, no-WebGL fallback, 3.2 vh minimum).
2. With no edits, polling costs two `304`s per minute per TV.
3. `bun test` and Biome are green; no new dependency; the main bundle is unchanged within 0.5 KB.
4. Owner check on the Android TV: open `/m/:id`, edit a programme on the phone, and see it on the TV within a minute.

## Resolved questions (2026-10-23)
1. **Ticker:** none.
2. **Drop-off:** 2 hours after the start.
3. **Order:** every upcoming programme, then one ayat or hadith, repeat.
