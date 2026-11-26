# Changelog

All notable changes to this project. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] — 2026-11-23

The theme reset: one **tema** per mosque and per visitor, painting every surface — the website, the landscape TV and the tall panel. Spec: [`SPEC-tema-bundles.md`](SPEC-tema-bundles.md).

### Added

- **A tema registry** (`shared/temas.js`) imported by the client and the server: ids, names, modes, picker swatches and one layout name per surface. The API, the pre-paint script and both pickers read it, so they cannot drift.
- **Tema: Malam** — near-black with warm amber (draft 02/TV 02): the seven times as a quiet column beside the countdown on the TV, and a dotted rail on the web page. Its own TV layout, `malam`.
- **Fix: past rows were never dimmed.** `rowStates` emits `passed`, not `past`, and every layout written in this redesign keyed off `[data-state="past"]` — a selector that never matched. The almanak page had carried the same dead selector since before this work. All 13 stylesheets that read a schedule row now use `passed`; verified by reading the computed colour of a passed row against an upcoming one on Siang, Poster, Mihrab, Kad, Takwim, Editorial and four TV boards.
- **Tema: Kad** — the day as cards (web draft 04): a quiet grey-green page, one deep-green hero card holding the next prayer and its countdown ("2:44 jam", "48 minit" inside the last hour), then the *other six* prayers as white cards with name, jawi, time and state — the hero is one of the seven, never repeated in the grid. The draft's in-page bottom nav is deliberately not drawn: the site already has one.
- **Tema: Mihrab** — the answer in an arch (web draft 05): a deep green ground lit from above, ivory ink, one gold. The arch is the answer — jawi, prayer, countdown and azan live inside it — and its floor is the divider under "Waktu hari ini". The day lists in Newsreader with its jawi, the next in gold; two columns above 760px with Isyak closing the day across the width. Past and faint inks lifted to `#86958a` / `#8b9a8d` so the quiet rows still pass AA on the dark green.
- **Tema: Editorial** — a magazine spread (web draft 10): warm paper on the left with the prayer in Newsreader, the date as an italic standfirst, the azan time at 170px, a countdown in words ("dalam 2j 48m 53s · azan belum masuk") and a week strip of Maghrib times; a dark rounded panel on the right with time / name / jawi / state in four columns. Two-page above 900px, one column on a phone (where the week strip steps out, as in the draft). The panel's dark inks are literals because they only ever sit on the panel, not site tokens the contrast sweep would check against paper.
- **Tema: Poster** — the day as a printed poster (web draft 08): kraft paper, a 4px masthead rule over a hairline, the kicker as a red dot and a date, the prayer in full with its jawi, the **azan time set enormous** instead of a countdown, a `2j 58m 12s lagi` line beneath it, seven ruled rows with the next one knocked out in reverse ink, and a fill row carrying the Hijri date. The draft's red-on-black time in the reversed row would have failed (3.3:1), so the reversed row is paper-on-ink with the red kept for the kicker where it passes.
- **ZoneAlmanak now uses `useZoneSchedule`** — the page no longer carries its own copy of the fetch/window/rows plumbing (the follow-up flagged when Siang landed). Every printed page now shares one source of the day.
- **Web layout pool + Tema: Siang** — the site gets what the TV already had: a tema now names a page (`webLayout`: `sky`, `almanak`, `siang`) and `client/src/web/layouts` is the single mapping from name to component, so `/times/:zone` stops branching on tema ids. Siang (web draft 03) is the first page built on it: cream paper, one teal, the day as a band, one answer in words with a `2j 08m` countdown, seven plain rows, a quiet foot. Schedule data comes from `useZoneSchedule`, shared by every printed page. No TV draft, so its board stays the ellipse in day colours.
- **Tema: Senyap** — the quietest board (draft TV 10): no rules, no boxes, no glow. One column: the header whispers in uppercase, the countdown is the entire room at `min(40vh, 19vw)`, the prayer name and jawi sit under it with azan/iqamah, and the day lies on a single hairline at the bottom. TV only. The draft's washed past times (`#3f3f3d`, ~1.7:1) were lifted to `#7d7c78` — quiet, but AA.
- **Tema: Sorotan** — one lamp, one number (draft TV 06): a black room with an amber spotlight behind an enormous Newsreader countdown, the prayer name and its jawi above it, the seven times as a quiet strip along the floor. TV only (`web: false`). The countdown is capped by `min(33vh, 17vw)` so a long `H:MM:SS` can never run off the wall.
- **Tema: Program** — the board a masjid actually needs (draft TV 08): the answer over an 8-cell grid (seven times plus tomorrow's Syuruk) on the left, the week's next three programmes on the right with when / title / speaker, and a JAKIM foot. It is the first **TV-only** tema (`web: false`): `isWebTema` already refuses it, so a `?tema=program` link falls back to Langit instead of an unstyled page. The ayat banner gives way to the programme sheet on this layout.
- **Tema: Kaca** — a photograph behind glass (draft 04 + 09): the zone page sits on the Blue Mosque, veiled, in cream ink with gold accents; the TV puts the answer on the glass and the day in a blurred panel, with a next row lit gold. The photograph is a bundled, hashed asset (`client/src/assets/kaca.webp`), so the kiosk's service worker caches it and an offline screen keeps its picture.
- **Tema: Dail** — the day as a ring (draft 06 + TV 07): a white page whose countdown block becomes a conic arc with the prayer in its hub, and a light TV board that prints the seven times beside the same ring with Lepas / Seterusnya in their own column. One `DayDial` for both, sharing the day maths with the ribbon.
- **Tema: Jalur** — the day as one band (draft 03 + TV 03): a paper-white page with a 24-hour gradient ribbon, the clock marker and the five prayers plotted on it; a green-black TV board with the same ribbon under the countdown. One `DayRibbon` component for both, with rows computed so clustered prayers never print over each other.
- **Tema: Papan** — deep green and gold, Reem Kufi masthead, a board layout for the TV (masthead, one huge answer, seven columns with jawi) and a green web palette.
- **TV layout pool**: `ellipse` (the sky screen with the day track), `papan` (the board) and `potret` (the tall panel). A tema names one per surface.
- **Portrait panels**: a tall viewport on `/tv/:zone` and `/m/:id` now gets a real portrait layout — header, countdown, the seven times and the banner stacked — instead of a "use a TV" notice.
- **The Almanak page** for Takwim and Papan on the website: masthead, one answer with its countdown, the seven times as dotted leaders, then the week or month. Shares the sky page's data path, so the two can never disagree on a time.
- **A tema picker on the site** (the "Tema" button on a zone page): cards from the registry, applied in place with no reload and remembered; `?tema=` wins for shared links.
- **Editor picker with both screens**: each card draws the landscape TV and the tall panel the tema owns.
- **Offline tema caching**: the TV's service worker (`tv-sw.js`, cache version 2) now takes the files the screen actually uses — the tema's CSS chunk and its font files — at boot and again whenever a poll switches tema. A Papan mosque boots green offline, not on Langit's white.

### Changed

- **No theme toggle.** A tema is either `auto` (Langit follows the system light/dark setting) or `fixed` (one light, the system setting ignored). The choice is a mode, not a switch; nothing is stored for `fixed` temas.
- **The sky belongs to Langit.** The navbar band, the sheet and the landing page paint sky only for Langit; a printed tema starts at its own ground.
- `TemaPicker` reads the registry instead of a hard-coded list.

### Removed

- **Songket** — it had no live mosque (the two registered rows were test data). Its CSS, font chunk and references are gone.
- `ThemeToggle` and `lib/theme.js`, with the `waktu:theme` storage key.

### Fixed

- The site's tema swap fired a non-bubbling event, so the page never changed layout (only its palette).
- The navbar and the sheet painted sky for every tema, and the landing page ignored the tema for a remembered zone.
- The mosque name and zone line were ellipsised on the TV; both wrap now, in the landscape and the portrait layouts.

### Verified at release

`bun test` 259 tests / 0 failures · contrast 444 token pairs, 0 under 4.5:1 · three temas × two surfaces at 1920×1080 and 1080×1920, in the countdown, iqamah and solat states, with no element outside the frame · an editor change reached the TV in 57.1 s with no reload · offline boot of a Papan screen with the network off.

## [2.1.0] — before 2026-11-23

TV display, mosque registry, programmes, mosque editor and mosque TV mode; see `SPEC-tv-display.md`, `SPEC-mosque-registry.md`, `SPEC-programmes.md`, `SPEC-mosque-editor.md`, `SPEC-tv-mosque-mode.md` and `SPEC-redesign.md`.
