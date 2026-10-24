# Spec: `redesign`

Status: **approved 2026-10-24**. It replaces the art direction from `SPEC-site-revamp.md` and `SPEC-tv-display.md`, which came from the taste skill, now removed. Mockups: [design canvas](https://claude.ai/artifact/UaEJ5FujuBwq22pRhp7FGy).

## Objective

1. **The website takes direction A, Langit.** The whole page is painted in the colour of the sky over your zone right now, and the **sun ellipse** is the hero, with the countdown inside its arc. Type changes to Bricolage Grotesque. The times sit on a light panel below.
2. **The TV gets three themes, and a mosque chooses one:** Langit (the default), Takwim (a dark printed almanac with one red) and Songket (night green and gold with a star pattern). **All three share one layout.** Only colour, type, the pattern and the ellipse's stroke change. The sun ellipse is in every theme.

The data, behaviour, offline support and APIs don't change, apart from one new mosque field.

## User stories / acceptance

### Website (Langit)
1. **The zone page `/times/:zone`:**
   - The whole page background, not only the lead band, is the current sky (`skyPhase`: malam, subuh, pagi, zohor, asar, senja).
   - The ellipse is large and centred. "Maghrib dalam" and the countdown sit inside the arc, with the sun on it.
   - The 7 times sit on a light panel (`--sheet`) with rounded top corners, and the next prayer's row is filled with the sky colour. The pulse dot stays.
   - On a 390×844 phone, every time and the bottom bar fit **without scrolling** (as now).
   - The state mosque photo stays, below the panel.
2. **The other pages** (landing, Quran index and reader, hadith, radio, chat, about, 404, `/m/baru`, the mosque editor) use the same type and tokens:
   - The header band takes the sky of the **remembered zone** (`lib/zoneMemory.js`). With no zone remembered, it uses WLY01's sky. Below the band, reading surfaces stay calm in `--sheet`/`--ground`, so long Quran and hadith text is never set on a coloured sky.
3. **Light/dark:** the sky band is the same in both modes, because it is the sky. The toggle sets the sheet and the reading surfaces: light is the current light, dark is near-black.
4. **The sun ellipse** on the website keeps its current geometry (`lib/waktu/daytrack.js`) and stars at night. Only its drawing changes: a 2px ink line, the travelled part as a wider faint stroke, the sun as an outlined disc.

### TV themes
5. **One layout, three themes:**
   - `tv.css` is split into the shared layout and per-theme tokens: `[data-tema="langit|takwim|songket"]` on `.tv`.
   - A theme sets colours, fonts, the header pattern (Songket only) and the ellipse strokes.
   - All sizes stay in `vh`. Nothing read from the hall is under 3.2vh.
6. **Langit on the TV:** the sky fills the screen, like the site. At night (malam/subuh/senja) it is dark, so a TV in a dark hall isn't a lamp. The ellipse and countdown follow the site.
7. **Takwim:** `#121212` ground, ivory ink, red `#ff5a52` for next and the sun, Newsreader numerals, a ruled times table, the hadith in italic. (The mockup's dotted arc ahead of the sun is left out: the three.js renderer, which most TVs use, draws no dashes, and both renderers must look alike.)
8. **Songket:** `#0c1c17` ground, gold `#d9ae55`, Reem Kufi numerals over Readex Pro, a faint 8-point star pattern behind the header, the next prayer filled with gold, a gold sun with a halo.
9. **Burn-in drift, the solat screen, the iqamah countdown, programme cards and offline** behave the same in every theme. Each theme is checked in every TV state.

### Choosing
10. **A registered mosque** picks its theme in the editor's Tetapan. The picker is three cards, each a small preview of the theme. The TV applies a change within 60 s without a reload, through the poll it already does.
11. **A zone-only TV** picks it in the URL: `/tv/wly01?tema=songket`. An unknown or missing `tema` means `langit`.
12. **The API:** `tema` becomes a mosque field: `"langit" | "takwim" | "songket"`, defaulting to `"langit"`. Any other value returns `400`. `GET /api/v1/mosques/:id` returns it.

## Data

- `mosques.tema TEXT NOT NULL DEFAULT 'langit'`.
- `CREATE TABLE IF NOT EXISTS` doesn't add columns to an existing table, so startup runs `ALTER TABLE mosques ADD COLUMN tema …` when `PRAGMA table_info(mosques)` lacks it. It's idempotent, and existing mosques get `langit`.
- **Backward compatible:** older clients ignore the field. The new client treats a missing field as `langit`.

## Type and tokens

- **Fonts are self-hosted** (bundled from `@fontsource` packages, like Inter was), so the TV works offline and nothing comes from Google at run time:
  - Bricolage Grotesque (site and Langit)
  - Noto Naskh Arabic (Jawi on the site)
  - Newsreader and IBM Plex Sans (Takwim)
  - Reem Kufi and Readex Pro (Songket)
- Only the TV's chosen theme loads its fonts. The site loads Bricolage and Noto Naskh only.
- Inter is dropped.
- The six sky token sets in `main.css` are kept and adjusted, and `--sheet` and `--sheet-ink` are added.
- Contrast: text **4.5:1** on its own ground in every sky and theme, including spent times. This is checked with a script over the token table, not by eye.

## Not in this change

- new pages or features
- per-mosque colours
- a different TV layout for each theme
- azan audio

## Checks

- `bun test` (new tests: the `tema` validation, the migration on an old DB, `parseConfig` `tema`) and Biome are green.
- A contrast script over every sky and TV theme token pair reports 0 failures.
- Screenshots:
  - each site page at 390, 768 and 1440, in both modes and for at least 3 skies (malam, zohor, senja) via `?now=`
  - `scripts/tv-shots.mjs` for every TV state in each of the three themes at 1080p
- Bundle: the main bundle grows by no more than **+15 KB gzip** (fonts are separate files, not JS). The TV theme fonts load only on the TV.
- **The owner's check:** the Android TV with each theme, and switching theme from the phone.

## Slices (each one is a commit on `development`)

1. **Tokens and type:** self-hosted fonts, tokens and the contrast script. No visual change yet beyond the font.
2. **The zone page** in Langit (whole-page sky, ellipse hero, panel).
3. **The rest of the site:** landing, Quran, hadith, radio, chat, about, 404, `/m/baru` and the editor.
4. **TV layout/theme split** with Langit on the TV.
5. **Takwim and Songket** TV themes, plus `?tema=`.
6. **`tema` on mosques:** the API, the migration and the editor picker, so the TV follows the mosque.
7. README, screenshots and the owner check.

## Decisions (owner, 2026-10-24)

1. **Takwim and Songket stay TV-only.** The website has one look, Langit.
2. **Langit on the TV keeps the light daytime skies.** A mosque that wants a dark screen all day picks Takwim or Songket.
