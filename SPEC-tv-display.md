# Spec: `tv-display`

Module 1 of the [capability map](CAPABILITY-MAP.md). Status: **approved 2026-10-22**.

## Objective

A read-only, full-screen waktu solat display at **`/tv/:zone`** that a mosque or surau opens once on a landscape TV and leaves running for months. It replaces the LED prayer-time boards Malaysian mosques buy today, for free.

**The screen's one question:** *"How long until the next prayer — or, if the azan has gone, until iqamah?"* The largest element on screen always answers it.

**Users**
- **Jemaah**, glancing from 3–10 m away: the next prayer, how long until it, today's times and the date.
- **Mosque AJK**, who set it up once: open a URL on the TV, optionally add iqamah offsets and the mosque's name in the URL, then never touch it again.

**User stories / acceptance**
1. Opening `/tv/wly01` on a 1920×1080 TV shows: today's seven times, the next prayer with a live countdown, the current time, and the Gregorian and Hijri dates (Hijri exactly as JAKIM's data gives it). The mobile site and all existing pages are unchanged.
2. Between a prayer's azan time and azan + its iqamah offset, the lead becomes "Iqamah {prayer} dalam mm:ss". When it hits zero, a full-screen **solat in progress** state ("Solat {prayer} sedang didirikan · Sila senyapkan telefon bimbit") shows for a set duration, then the screen returns to normal.
3. On Friday, Zohor is labelled **Jumaat** and uses the Jumaat offset (khutbah gap) instead of Zohor's.
4. If the internet drops, or the TV reloads while offline, the screen keeps showing correct times for at least the rest of the cached year and keeps counting down.
5. The TV's clock is not trusted. The screen corrects itself against server time and is within 1 s of it.
6. The screen never sleeps (Wake Lock where supported), never shows a scrollbar or cursor, and needs no input after load.
7. On a TV whose browser lacks WebGL or is too slow for it, the screen still works and looks finished (static fallback), with no error visible.

**Not in this module:** mosque accounts, programmes and the banner editor (`mosque-registry`, `programmes`, `mosque-editor`, `tv-mosque-mode`); portrait layout; azan audio; English UI; any setup UI on the TV itself.

## Behaviour

### URL

`/tv/:zone` with optional query parameters. All are validated; an invalid value falls back to its default and is never shown.

| Param | Example | Default | Meaning |
| --- | --- | --- | --- |
| `iqamah` | `10,8,10,5,10` | `10,10,10,10,10` | Minutes after azan for Subuh, Zohor, Asar, Maghrib, Isyak (0–60). |
| `jumaat` | `25` | `30` | Minutes from the Jumaat azan to iqamah (covers the khutbah). |
| `solat` | `12` | `10` | Minutes the solat-in-progress screen stays up. |
| `nama` | `Masjid Al-Ikhlas` | — | Mosque name in the header (max 60 chars, shown as plain text). Without it, the zone's area name is the title. |

Unknown zone → a full-screen "Zon tidak dijumpai" message with the zone code. No crash.

### Screen states

One pure function, `screenState(now, today, tomorrow, config)`, decides the state. It is unit-tested at every boundary.

| State | When | Lead shows |
| --- | --- | --- |
| `countdown` | Default | Next prayer name, its time, and "dalam h:mm:ss" |
| `iqamah` | azan ≤ now < azan + offset (Subuh/Zohor/Jumaat/Asar/Maghrib/Isyak) | "Iqamah {prayer} dalam mm:ss" |
| `solat` | iqamah ≤ now < iqamah + `solat` minutes | Full-screen solat-in-progress notice, very dim, no motion |
| `after-isyak` | After Isyak's solat window | Countdown to **tomorrow's** Subuh (uses the next day's row; across 31 Dec, the next year's data if cached, otherwise today's Subuh as an estimate, labelled with "~") |

**Imsak and Syuruk are advisory, not prayers.** They stay in the list in time order (Imsak before Subuh, Syuruk after it) at the same size, set in `--faint` with no band and no extra label. Colour alone sets them apart, since a gap can't work when they sit between prayer rows. They are never the lead, have no iqamah and no solat state. Syuruk ends the Subuh window ("Waktu Subuh tamat dalam …" during Subuh's last 15 minutes, as a secondary line, never the lead).

### Data and resilience

- **Source:** `GET /api/v1/waktusolat/year/:zone`, fetched on load, stored in `localStorage` per zone, and refreshed every 6 h and right after midnight. The screen renders from the cache first, so it can start offline.
- **Clock:** `GET /api/v1/time` (new, see Backend) on load and every 30 min. The screen keeps an offset to the device clock and runs all logic on `Date.now() + offset`. The offset is cached too.
- **Shell offline:** a small hand-written service worker (`/tv-sw.js`, scoped to `/tv/`) caches the TV route's built assets and font, so a reload with no internet still boots.
- **Self-reload:** once a day at 03:00 local, **only if** the server answers (so it never reloads into a blank screen while offline). This picks up deploys and clears leaks.
- **Wake Lock:** `navigator.wakeLock.request("screen")`, re-requested on `visibilitychange`. When it's unsupported, nothing happens (the TV's own settings apply).
- **Burn-in:** the whole layout shifts by up to ±6 px on a 20-minute cycle, using transform only. Nothing static sits in pure white for hours; the brightest static text is `--muted`.
- **Cursor and input:** `cursor: none`, no focusable controls, no scroll.

### Backend addition

`GET /api/v1/time` → `{ "now": <epoch ms>, "tz": "Asia/Kuala_Lumpur" }`. Uncached, rate-limited like everything else. This is the only backend change in this module.

## Art direction

Taste skill, app-screen run. Sheet: **`true-black-flat`**, seed `749316183`, kind `community`, dark. It's saved in `.taste-skill/direction.json`; reprint it with `draw.mjs --show`.

**Why this style:** a glance display running all day in a prayer hall. True black reduces glare at night and switches OLED pixels off. Elevation by lightness alone survives cheap TVs' crushed contrast. "Colour only on data" lets the one hue mean *now / next*.

**The idea:** *the LED prayer-time board on every surau wall becomes one quiet screen: the day's seven times as a list, the next one lit, and the sun itself moving along the day.*

**Its face** (one, as the sheet requires): the data hue is taken from the product's world. It is **lamp amber `#f2b33d`** (the sheet's "solar amber"), the colour of the sun on the day track and of the next prayer. It replaces the dealt lime. It is the only hue on data, and never touches chrome. `--warning` keeps only its pill pair, so the two don't meet.

**The signature element: the day track.** A full-width band showing the real time axis from Imsak to Isyak. Each prayer is a tick with its name. The **sun** (an amber disc) sits at the current time and travels along an arc between Syuruk and Maghrib. After Maghrib, the arc fades and a faint moon and stars take over until Subuh. This is the three.js piece: it shows **data** (where today's light actually is), not decoration.

### Layout (1920×1080 reference; everything sized in `vh`, so 4K and 720p scale)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Masjid Al-Ikhlas · WLY01 Kuala Lumpur        Khamis 23 Okt 2026 · 1 Jamadilawal 1448   21:47 │  header  ~11vh
├───────────────────────────────────────────────┬──────────────────────────┤
│                                               │  Imsak     05:41          │
│  Isyak                                        │  Subuh     05:51          │
│  dalam 0:42:15                                │  Syuruk    07:02          │
│  20:29 · iqamah 20:39                         │  Zohor     13:07          │
│                                               │  Asar      16:19          │
│                                  (lead, 2/3)  │  Maghrib   19:13   ← amber (next) │
│                                               │  Isyak     20:24          │  main  ~58vh
├───────────────────────────────────────────────┴──────────────────────────┤
│  ·Imsak ·Subuh ·Syuruk ─────── ☀ ─────── ·Zohor ·Asar ·Maghrib ·Isyak       │  day track ~13vh (three.js)
├──────────────────────────────────────────────────────────────────────────┤
│  rotating banner (phase 1: a short ayat or hadith; later: programmes)    │  banner ~18vh
└──────────────────────────────────────────────────────────────────────────┘
```

(Sample times above are illustrative only.)

- **The lead** (left two-thirds) is the largest thing on screen: the prayer name at about 9vh/600, the countdown at about **20vh/500 in tabular figures**, then a muted line with the azan and iqamah times.
- **The list** (right third) has seven rows on a fixed pitch, name left and time right-aligned in tabular figures.
  - The next prayer's row: amber time, `--text` name, on a `--surface` band.
  - Passed prayers: `--faint`.
  - Upcoming prayers: `--muted`.
- **The banner** sits on a `--surface` card.
  - In phase 1 (confirmed) it rotates every 20 s through **short** ayat and hadith (≤ 160 characters, so two lines; hadith from Bukhari, Muslim and Nasa'i, which have enough short ones). Offline it walks the last 30 items it fetched; on a first-ever offline load it shows "Sila senyapkan telefon bimbit" (the date is already in the header). Arabic appears only when it fits one line (≤ 60 characters).
  - Sources: `/quran/random?max=160` and `/hadis/:book?max=160`. Malay text plus a reference (surah and ayat, or the kitab). Arabic ayat use the project's own Uthmanic font.
  - In `tv-mosque-mode` the same slot carries programmes.

### Where it departs from the app-screen rules, and why

| App rule | On this screen | Reason |
| --- | --- | --- |
| h1 18–32px, no figure ≥ 48px | Lead countdown ~20vh (~216px at 1080p). Smallest text meant to be read from the hall ≥ 3.2vh (~35px). | Viewing distance is 3–10 m, not 60 cm. At 10 m on a 55" panel, a legible cap height is about 3 cm, which is about 50 px. |
| Shell: ruled T-frame with sidebar and 64px top bar | **No shell.** A single full-bleed screen with the header band as the h1 row. | Signage has no navigation. The product is still named: mosque or zone in the header. |
| No entrance motion | Motion only on **state changes**: the lead crossfades when the prayer changes, banner cards slide/fade on rotation, and the burn-in drift. No load-in choreography. | Motion is the user's ask and, on a wall screen, is how a change gets noticed from across the room. |
| No gradients on grounds | The day track's sky glow is allowed **only inside the track band**, at low opacity, driven by the sun's real position. The ground stays flat `#000`. | The three.js piece is data (where the light is), confined to its band. |

Everything else stays as the sheet sets it:
- tokens (except `--accent` and `--positive` → `#f2b33d`)
- Inter at 400/500/600, self-hosted woff2 with tabular figures checked
- sentence case, no borders or shadows on surfaces, a 20 px card radius scaled to `vh`
- no emoji, icons, pills or eyebrows, and colour share ≤ 3% outside the amber marks

### Motion and three.js budget

- `three` renders **only** the day track, in its own canvas. Frame rate is capped at 30 fps, and the sun only needs a few updates per minute, so it renders on change rather than continuously when nothing else is moving.
- `motion` handles state transitions and banner rotation. Transform and opacity only. `prefers-reduced-motion` drops travel and keeps crossfades.
- **Fallback:** no WebGL, or a frame time over 50 ms for 5 s, switches the track to a static SVG version of the same drawing. This is decided once per load and logged.
- Both libraries load only in the lazy `/tv` chunk.

## Tech stack

React 19, react-router 7, Vite 6, Tailwind 4 (existing). **New:** `three` and `motion`, pinned to exact current versions when added (approved in the capability map). `@fontsource/inter` (or a vendored woff2) for self-hosted Inter: this is a new dependency, so I'll ask first if there's any doubt. No other dependencies.

## Commands

```
Dev (client + server):  bun dev                  # client on :3000 proxies /api/v1 → :5000
Server only:            bun run server
Client build:           bun run build-client     # → public/
Tests:                  bun run test             # bun test, root tests/
Lint:                   bunx --bun @biomejs/biome@2.5.12 check .
Visual check:           node <taste-skill>/scripts/inspect.mjs --app http://localhost:3000/tv/wly01
TV screenshots:         headless Chrome at 1920×1080 and 3840×2160 (DPR 2) — script added in this module
```

## Project structure

```
client/src/tv/
  TvApp.jsx          → route entry (lazy). No Navbar, no VisitTracker chrome
  Lead.jsx · PrayerList.jsx · Header.jsx · Banner.jsx · SolatNotice.jsx
  DayTrack.jsx       → three.js canvas + SVG fallback
  tv.css             → tokens (true-black-flat, amber), vh type scale
  lib/
    schedule.js      → screenState(), next-prayer and iqamah maths (pure)
    config.js        → parse/validate URL params (pure)
    clock.js         → server-offset clock (pure core + tiny fetch wrapper)
    cache.js         → localStorage year cache
    names.js         → Malay prayer names, Jumaat rule (pure)
client/public/tv-sw.js   → service worker scoped to /tv/
routes/api.js            → + GET /time
tests/tv-*.test.js       → bun tests importing client/src/tv/lib/*
```

`App.jsx`: the `/tv/:zone` route sits **outside** the Navbar layout and is `React.lazy`-loaded, so no other route downloads `three` or `motion`.

## Code style

This matches the existing client and Biome config: tabs, double quotes, function components, named pure helpers in `lib/`.

```js
// schedule.js — what the TV shows right now. Pure: no Date.now(), no DOM.
export function screenState(now, today, tomorrow, config) {
	const next = nextPrayer(now, today);
	if (!next) return { kind: "after-isyak", target: subuhOf(tomorrow ?? today) };
	const iqamah = iqamahAt(next.previous, config, now);
	if (iqamah && now < iqamah.at) return { kind: "iqamah", prayer: iqamah.prayer, target: iqamah.at };
	return { kind: "countdown", prayer: next.prayer, target: next.at };
}
```

## Testing strategy

- **Unit (bun test, root `tests/`)**, written first for every `lib/` function:
  - every state boundary (azan − 1 s, azan, iqamah − 1 s, iqamah, solat end)
  - Friday → Jumaat
  - after-Isyak → tomorrow's Subuh, including 31 Dec with and without next year's data
  - param validation (bad and out-of-range values)
  - clock offset maths
  - cache read and fallback
- **Mutation spot checks** on the state machine: flipping a boundary comparison must fail a test.
- **Visual:** taste `inspect.mjs --app` plus 1920×1080 and 4K screenshots for each state (countdown, iqamah, solat, after-isyak, offline, no-WebGL), critiqued per the app-screen questions.
- **Resilience (manual, scripted where possible):**
  - go offline and reload → still renders
  - skew the device clock ±10 min → display matches server time
  - Chrome with 4× CPU throttle → day track holds ≤ 33 ms frames or falls back
- **Regression:** existing routes are screenshotted before and after at 390 / 768 / 1440 and must match. The build manifest must show `three` and `motion` only in the TV chunk.

## Boundaries

- **Always:**
  - write pure logic with tests first
  - render from cache before network
  - validate every URL param
  - keep text sizes in `vh`
  - run tests and Biome before each commit
  - commit to `development` only, never push without being asked
- **Ask first:**
  - adding any dependency beyond `three`, `motion` and an Inter font package
  - any backend change beyond `GET /time`
  - changing existing routes or the Navbar
  - the service-worker scope
- **Never:**
  - load `three` or `motion` outside `/tv`
  - adjust or compute Hijri dates (JAKIM's only)
  - show an error, stack trace or blank screen on the TV
  - add tracking or analytics to the TV route beyond the existing visit beacon (and the beacon fires once per load, not per minute)
  - add a gradient ground, glow or decorative shape

## Success criteria

1. `/tv/wly01` at 1920×1080 shows all four states correctly at their boundaries (tests green; screenshots of each state reviewed).
2. Existing pages at 390 / 768 / 1440 are pixel-identical before and after. `three` and `motion` are absent from every non-TV chunk.
3. Offline: after one online load, a reload with the network off renders the full screen with correct times and countdown.
4. With the device clock skewed by +10 min, the displayed time is within 1 s of server time after load.
5. With no WebGL, the static day track renders, with no console error visible on screen.
6. Under 4× CPU throttle, the main thread stays under 10% busy at idle (countdown ticking), and the day track never drops below 30 fps or falls back.
7. Smallest hall-readable text ≥ 3.2vh. The lead countdown is the largest element. Colour share outside the amber marks ≤ 3%.
8. `bun run test` and Biome are green. Taste inspector: no FAIL apart from the deviations listed above, each defended in one line.

## Resolved questions (2026-10-22)

1. **Defaults:** iqamah 10 min for every prayer, Jumaat 30 min, solat-in-progress 10 min.
2. **Phase-1 banner:** short ayat and hadith from our own API.
3. **Hijri format:** "1 Jamadilawal 1448" from JAKIM's `1448-05-01` is right.
4. **Test hardware:** the owner has an Android TV, which is the reference device for success criteria 3–6.
5. **Imsak and Syuruk:** both advisory (see Screen states).
