# Spec: `tema-bundles`

Module 6 of the [capability map](CAPABILITY-MAP.md). Status: **built 2026-11-23**. Supersedes the "TV themes" section of [SPEC-redesign.md](SPEC-redesign.md) (one layout, three themes, TV only) and the "landscape only" decision in the capability map.

## Objective

One **tema** per mosque and per visitor, and that tema paints every surface: the website, the landscape TV and the tall panel. A mosque that picks Papan gets a green board in the hall and a green site when a jemaah opens the link; a visitor who prefers the printed almanac reads a printed almanac.

**The one idea:** a tema is a palette plus **one layout per surface**. Layouts are a shared pool; a tema only points at one. Adding a tema is a token file and three names — no new component, no second list of ids anywhere.

**Not in this module:** a per-surface tema (a mosque cannot mix Papan on TV with Takwim on the web), user accounts, and any tema the registry does not name.

## Decisions

1. **One registry.** `shared/temas.js` is imported by the client and the server (through the Vite alias and `fs.allow`, and `COPY shared` in the image). A value valid on one side is valid on both; there is no second list to drift.
2. **A tema owns:** `id`, `name`, `note` (one line, shown in the pickers), `mode` (`auto` follows the system light/dark setting; `fixed` ignores it), `web` (whether the site has a page for it), `swatch` (three colours for the pickers' drawings), `tv.layout` and `tvPortrait.layout`.
3. **Layouts are a pool**, not a property of a tema: `ellipse` (the sky screen with the day track), `malam` (draft TV 02: one column of times beside the countdown), `jalur` (draft TV 03: the answer with the day band under it), `dail` (draft TV 07: a ring beside the printed day), `kaca` (draft TV 04: the photograph, the veil, the glass panel), `program` (draft TV 08: the answer, the grid, the programme sheet), `sorotan` (draft TV 06: one lamp, one number), `senyap` (draft TV 10: nothing but the number), `papan` (the board: masthead, one huge answer, seven columns with jawi) and `potret` (the tall panel, used by every tema in portrait). A tema names one per surface; two temas may share one, and one tema may use different ones per surface.
4. **Surfaces, not devices.** A tall viewport (`surfaceOf(w, h)`, square counts as landscape) gets the portrait layout on the TV routes. The website's own responsive layout is separate and stays CSS.
5. **Fifteen temas, 2026-11-23:** all ten TV drafts and all ten web drafts are now real temas. the ten TV drafts are complete, and the web page pool has two pages of its own. Langit (sky, `auto`, default), Takwim (dark with one red; the printed almanac on the web), Malam (near-black, amber, the seven times as a dotted rail; its own TV layout), Jalur (the day as a gradient band with the prayers marked on it; own TV layout, shared `DayRibbon`), Dail (the day as a ring with the times printed beside it; own TV layout, shared `DayDial`), Kad (cards, one deep-green hero — its own web layout, draft 04), Mihrab (an arch holding the answer — its own web layout, draft 05), Editorial (a two-page magazine spread — its own web layout, draft 10), Poster (a kraft sheet in two inks — its own web layout, draft 08), Siang (the daylit page — its own web layout, draft 03), Senyap (one number, no boxes, no rules — TV only), Sorotan (a black room with one amber spotlight; the countdown is the whole board — TV only), Program (the day's 8-cell grid plus the week's programmes — the first TV-only tema: `web: false`, and `isWebTema` keeps it out of the site menu), Kaca (a photograph behind glass — the zone page *is* the photo, the board shows it under a veil; the image ships as a hashed asset so the TV keeps it offline), Papan (deep green and gold). Songket is retired — it had no live mosque, and its two rows were test data. The rest of the ten design drafts (Jalur, Kaca, Dail, Sorotan, Program, Senyap, Mihrab/Poster/Editorial/Foto/Kad…) are still `lab/` HTML and each becomes a tema the same way: a palette, a page and/or a layout, registered and tested.
6. **The website has two zone pages.** Langit is the sky page (`ZoneTimes.jsx`: sky field, sun arc, list, table). Takwim and Papan share the almanak page (`ZoneAlmanak.jsx`: masthead, one answer with its countdown, seven times as dotted leaders, then the week or month). Both run the same data path — `siteClock.js`, `rows.js`, `schedule.js`, `TimesTable.jsx` — so the two pages cannot disagree on a time.
7. **The sky belongs to Langit.** `SkySheet`, the navbar band and `Landing` paint sky only when the active tema is Langit; a printed tema starts at its own ground colour. No half-painted page is possible.
8. **Picking on the site:** the **Tema** button on a zone page opens a native `<dialog>` of cards built from `WEB_TEMAS`. Picking applies `data-tema` on `<html>`, stores `waktu:tema`, and fires a bubbling `waktu:tema` event on `document`; the page, the navbar and the sheet re-render from it. **No reload.** Precedence stays: URL `?tema=` > remembered > Langit.
9. **Picking on the TV:** the mosque editor's Tetapan shows one card per registered tema, each drawing both screens the tema owns (landscape and tall panel). The TV applies a saved change within 60 s through the poll it already does, with no reload. A zone-only TV picks in the URL: `/tv/wly01?tema=papan`.
10. **Validation:** `tema` is a mosque field; anything not in `TEMA_IDS` is a `400` with `field: "tema"`. On the site, an id with no page (`web: false`) resolves to Langit instead of painting an unstyled page — enforced in `resolveTema` and again in the pre-paint script.
11. **Fixed temas and dark mode:** `mode: "fixed"` means one light. `client/index.html` reads the modes from the registry before first paint, so a printed tema never flashes dark and never follows `prefers-color-scheme`.
12. **Fonts** are self-hosted and load with the tema's chunk: Reem Kufi for Papan, Newsreader for the TV numbers and the almanak's headlines, Bricolage and Noto Naskh site-wide.

## Files

| What | Where |
| --- | --- |
| Registry (ids, names, modes, swatches, layout names) | `shared/temas.js` |
| Site palettes | `client/src/web/themes/{langit,takwim,papan}.css` |
| Almanak page layout (leaders, rules) | `client/src/web/almanak.css` |
| Zone pages | `client/src/components/ZoneTimes.jsx`, `ZoneAlmanak.jsx` |
| Tema resolution, apply, event | `client/src/lib/tema.js`, `lib/useTemaId.js` |
| Site picker | `client/src/components/TemaMenu.jsx` |
| TV layouts | `client/src/tv/layouts/{ellipse,papan-layout,potret}.css` + `{PapanScreen,PortraitScreen}.jsx` |
| TV palettes | `client/src/tv/themes/{langit,takwim,papan}.{css,js}` |
| Surfaces | `client/src/tv/surface.js`, `useTv.js` |
| Editor picker | `client/src/mosque/TemaPicker.jsx` |
| Contrast gate | `scripts/contrast.mjs` |
| Tests | `tests/tema-registry.test.js`, `tema-resolve.test.js`, `tv-surface.test.js`, `mosques.test.js` |

## Checks

- **Contrast:** every text token against every ground it is set on, for each tema block (site and TV) and each sky phase, **4.5:1 minimum**. Run by `node scripts/contrast.mjs`; 444 pairs, 0 failures at 2026-11-23.
- **Registry:** every tema names a layout for each surface, has a six-digit swatch, and every `web: true` id resolves on the site; unknown ids never win.
- **Surfaces:** `surfaceOf` is pure and tested (square = landscape, junk = landscape).
- **API:** every registered id is accepted by create and patch; anything else is `400`.
- **By eye, per release:** three temas × three surfaces (site, TV landscape, TV panel), plus the solat state and the picker sheets, at 390, 1280, 1920 and 1080×1920.
