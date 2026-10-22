# Tasks: `tv-display`

Plan: [plan.md](plan.md) · Spec: [SPEC-tv-display.md](../SPEC-tv-display.md)

Standing verification for every task (Definition of Done):
- `bun run test` is green.
- `bunx --bun @biomejs/biome@2.5.12 check .` is clean.
- `bun run build-client` succeeds.
- Commit on `development`. Don't push.

---

## Phase 1: Foundation

## Task 1: `GET /api/v1/time`

**Description:** A server time endpoint the TV uses to correct its clock.

**Acceptance criteria:**
- [x] Returns `{ now: <epoch ms>, tz: "Asia/Kuala_Lumpur" }` with status 200.
- [x] It's never served from the response cache (sits outside `cachedRoutes`), and `Cache-Control: no-store` is set.

**Verification:**
- [x] `tests/time.test.js`: `now` is within 1 s of `Date.now()`; two calls 50 ms apart differ.

**Dependencies:** None
**Files:** `routes/api.js`, `tests/time.test.js`
**Scope:** XS

## Task 2: Prayer names and URL config

**Description:** `names.js` holds the Malay prayer names, the advisory set (Imsak, Syuruk) and the Jumaat rule. `config.js` parses and validates `iqamah`, `jumaat`, `solat`, `nama` and the dev-only `now`.

**Acceptance criteria:**
- [x] Defaults: iqamah `10,10,10,10,10`, jumaat `30`, solat `10`.
- [x] Invalid values fall back to the default per field: wrong count, non-numbers, out of 0–60, `nama` over 60 characters.
- [x] `now` is honoured only when `mode !== "production"`.
- [x] On a Friday in Malaysia time, `zohor` is reported as Jumaat with the Jumaat offset.

**Verification:**
- [x] `tests/tv-config.test.js`, `tests/tv-names.test.js`: a table of good and bad inputs.

**Dependencies:** None
**Files:** `client/src/tv/lib/names.js`, `client/src/tv/lib/config.js`, two tests
**Scope:** S

## Task 3: Year rows → schedule state machine

**Description:** `rows.js` turns year-endpoint rows into epoch times in Malaysia time. `schedule.js` provides `screenState(now, today, tomorrow, config)` with the four states and the "Waktu Subuh tamat dalam …" secondary line.

**Acceptance criteria:**
- [x] Every boundary resolves correctly: azan − 1 s / azan / iqamah − 1 s / iqamah / solat end, for each of the 5 prayers and for Jumaat.
- [x] After Isyak, the countdown targets tomorrow's Subuh. On 31 Dec with no next-year row, it uses today's Subuh marked as an estimate.
- [x] Imsak and Syuruk are never the lead and never get an iqamah or solat state.
- [x] Results are identical with the process timezone set to UTC and to America/New_York.

**Verification:**
- [x] `tests/tv-schedule.test.js`, also run as `TZ=America/New_York bun test tests/tv-schedule.test.js`.
- [x] Mutation check: flip `<` to `<=` on the iqamah boundary → a test fails. Restore.

**Dependencies:** Task 2
**Files:** `client/src/tv/lib/rows.js`, `client/src/tv/lib/schedule.js`, `tests/tv-schedule.test.js`, `tests/fixtures.js` (reuse `makeRows`)
**Scope:** M

## Task 4: Server-offset clock and year cache

**Description:** `clock.js` keeps `offset = serverNow − (sent + received) / 2` and exposes `now()`. `cache.js` stores the year per zone in `localStorage` with its fetch time, and reads it first.

**Acceptance criteria:**
- [x] The offset is computed from round-trip midpoints. A failed sync keeps the last offset (also cached).
- [x] The cache read survives missing, corrupt or quota-exceeded storage by falling back to network-only, without throwing.
- [x] `needsRefresh` is true after 6 h, after midnight Malaysia time, or when the cached rows don't contain today.

**Verification:**
- [x] `tests/tv-clock.test.js` with a fake fetch. `tests/tv-cache.test.js` with a fake storage that throws.

**Dependencies:** Task 3 (rows shape)
**Files:** `client/src/tv/lib/clock.js`, `client/src/tv/lib/cache.js`, two tests
**Scope:** S

### Checkpoint A: Foundation
- [x] All `lib/` tests green in UTC and New York timezones.
- [x] Mutation checks recorded in the commit message.

---

## Phase 2: First screen on the TV

## Task 5: Lazy `/tv/:zone` route, tokens, self-hosted Inter, cache-first data

**Description:** The route shell. It loads with no Navbar, sets the true-black-flat + amber tokens and the `vh` type scale, loads Inter from the bundle, renders from cache, then refreshes and syncs the clock.

**Acceptance criteria:**
- [x] `/tv/wly01` renders on `#000` with no Navbar, no scrollbar and no cursor. Other routes are unchanged.
- [x] Inter loads from the bundle (no Google Fonts request), with tabular figures confirmed.
- [x] The TV code is in its own chunk. `/tv/` is added to `VISIT_PREFIXES`.

**Verification:**
- [x] Build: `ls public/assets` shows a separate tv chunk.
- [x] No third-party requests on `/tv/wly01`: Inter is bundled site-wide (owner approved 2026-10-22); `index.html` no longer loads Google Fonts.
- [x] Before/after screenshots of `/`, `/times/wly01` and `/quran` at 390/768/1440 are identical.

**Dependencies:** Tasks 1–4
**Files:** `client/src/App.jsx`, `client/src/tv/TvApp.jsx`, `client/src/tv/tv.css`, `client/src/tv/fonts/*`, `client/package.json` (Inter font, if a package)
**Scope:** M

## Task 6: Header, prayer list and lead

**Description:** The three blocks that answer the screen's question, rendered from `screenState()` on a 1 s tick.

**Acceptance criteria:**
- [x] Header: mosque name (`nama`) or zone area name, Gregorian + Hijri date ("1 Jamadilawal 1448"), and the clock.
- [x] List: 7 rows. The next prayer's time is in amber on a `--surface` band. Passed prayers are `--faint`, upcoming are `--muted`. Imsak and Syuruk are `--faint` and set apart from the prayers by a gap.
- [x] Lead: the countdown is the largest element on screen; the azan/iqamah line sits under it.

**Verification:**
- [x] Dev `?now=` previews of countdown, iqamah and after-isyak at 1920×1080 and 3840×2160.
- [x] Smallest hall-readable text ≥ 3.2vh, measured in DevTools.
- [x] The tick causes no layout shift: CLS 0.0000 over 10 s of ticks (Playwright, 4× CPU throttle).

**Dependencies:** Task 5
**Files:** `client/src/tv/Header.jsx`, `client/src/tv/PrayerList.jsx`, `client/src/tv/Lead.jsx`, `client/src/tv/TvApp.jsx`, `client/src/tv/tv.css`
**Scope:** M

## Task 7: Solat, unknown-zone and no-data states

**Description:** The full-screen dim solat notice, plus "Zon tidak dijumpai" for an unknown zone and a waiting state for a zone with no data yet. The screen is never blank and never shows an error.

**Acceptance criteria:**
- [x] The solat state shows "Solat {prayer} sedang didirikan · Sila senyapkan telefon bimbit" at low brightness for `solat` minutes, then returns to normal.
- [x] An unknown zone shows the code and the message. A 404 for a valid zone shows "Menunggu data waktu solat" and retries every 5 min.
- [x] A network failure with a cache present shows nothing at all (cached data keeps rendering).

**Verification:**
- [x] `?now=` preview of the solat state.
- [x] `/tv/xyz99`.
- [ ] DevTools offline after one load. *Not yet run; part of the Task 13 offline pass.*

**Dependencies:** Task 6
**Files:** `client/src/tv/SolatNotice.jsx`, `client/src/tv/TvApp.jsx`, `client/src/tv/tv.css`
**Scope:** S

### Checkpoint B: on the TV
- [x] `/tv/wly01` runs on the owner's Android TV (Chrome), via `bun dev`. Owner: "Clear" (2026-10-22). Found and fixed on the way: the StrictMode loader bug (aa29d64).
- [x] Taste `inspect.mjs --app` has no FAIL except the spec's listed deviations, and the app-screen critique is written down with the top 3 fixed.
- [x] Existing pages are unchanged (screenshot diff).
- [x] Owner review before Phase 3.

---

## Phase 3: Signature and motion

## Task 8: Day track as SVG

**Description:** `dayTrack(now, today)` returns geometry: the axis from Imsak to Isyak, ticks with names, the sun's position on its Syuruk→Maghrib arc, and the night state. `DayTrackSvg` draws it.

**Acceptance criteria:**
- [x] Ticks sit at their true times.
- [x] The sun appears only between Syuruk and Maghrib, at the right fraction of the arc. Outside that, a faint moon and stars are shown.
- [x] Amber is used only on the sun and the next tick. The sky glow stays inside the band at low opacity.

**Verification:**
- [x] `tests/tv-daytrack.test.js` (positions at sample times).
- [x] `?now=` previews at 06:00, 13:00, 19:30 and 23:00.

**Dependencies:** Task 6
**Files:** `client/src/tv/lib/daytrack.js`, `client/src/tv/DayTrackSvg.jsx`, `client/src/tv/TvApp.jsx`, test
**Scope:** S

## Task 9: Day track in three.js

**Description:** The same geometry rendered in WebGL, lazy-imported. It renders on change and is capped at 30 fps. A frame-time probe falls back to SVG.

**Acceptance criteria:**
- [x] `three` appears only in the TV chunk.
- [x] With no WebGL, or frames over 50 ms for 5 s, the SVG version is used, decided once per load, and nothing appears in the console as an error.
- [x] At idle, the GPU and main thread do near-zero work between sun updates.

**Verification:**
- [x] Bundle check script.
- [x] Chrome with WebGL disabled.
- [x] 4× CPU throttle trace.

**Dependencies:** Task 8
**Files:** `client/src/tv/DayTrack.jsx`, `client/src/tv/DayTrackGl.js`, `client/package.json`
**Scope:** M

## Task 10: Motion on state changes

**Description:** `motion` crossfades the lead when the state or prayer changes, and drives the burn-in drift container.

**Acceptance criteria:**
- [x] Only transform and opacity are animated. There's no load-in choreography.
- [x] `prefers-reduced-motion` keeps crossfades and drops travel.
- [x] `motion` appears only in the TV chunk.

**Verification:**
- [x] Step `?now=` across an azan boundary and watch the transition.
- [x] Reduced-motion emulation in DevTools.

**Dependencies:** Task 7
**Files:** `client/src/tv/Lead.jsx`, `client/src/tv/TvApp.jsx`, `client/package.json`
**Scope:** S

### Checkpoint C
- [x] Under 4× throttle (Playwright, SwiftShader GPU): main thread 4.0% busy at night with stars + motion, 2.2% by day; CLS 0; no fallback triggered.
- [x] Android TV: the owner reviewed phase 3 on the TV: "Its looking good" (2026-10-22).
- [x] Bundle check: `three` only in the lazy DayTrackGl chunk; motion only in the TvApp chunk (main bundle unchanged at 335.7 kB).

---

## Phase 4: Banner

## Task 11: Short ayat/hadith API *(approved 2026-10-22)*

**Description:** An optional `?max=<chars>` on `GET /quran/random` and `GET /hadis/:book`, picking only items whose Malay text fits. Adds `kitab` and `id` to the hadith response. Both changes are additive.

**Acceptance criteria:**
- [x] With `max`, every result's Malay text is ≤ max characters. Without it, behaviour is unchanged.
- [x] Invalid `max` → 400. Results stay uncached and random.
- [x] Short-item indexes are precomputed once at startup, not filtered per request.

**Verification:**
- [x] `tests/random-content.test.js`: 50 calls with `max=180` all ≤ 180, and at least 2 distinct items.

**Dependencies:** None (can run in parallel with Phases 2–3)
**Files:** `controllers/helpers.js`, `routes/api.js`, `README.md`, test
**Scope:** S

## Task 12: Banner

**Description:** A rotating card every 20 s, alternating short ayat and hadith (Malay text, reference, and the Arabic ayat in the Uthmanic font). The next card is prefetched. A pool of the last 30 items is kept in `localStorage`, so the banner keeps rotating offline.

**Acceptance criteria:**
- [x] Text never shrinks to fit (≤ 180 characters, enforced by the API).
- [x] With the network down, the banner rotates through the cached pool. On a first-ever offline load, the slot shows the date line instead.
- [x] A card change is a `motion` slide/fade, with reduced motion respected.

**Verification:**
- [x] Watch 3 rotations.
- [x] DevTools offline.
- [x] Longest-allowed text at 1920×1080 and 1280×720 fits without clipping.

**Dependencies:** Tasks 10, 11
**Files:** `client/src/tv/Banner.jsx`, `client/src/tv/lib/bannerPool.js`, `client/src/tv/TvApp.jsx`, test
**Scope:** M

---

## Phase 5: Resilience and sign-off

## Task 13: Service worker, wake lock, burn-in, daily reload

**Description:** `/tv-sw.js`, scoped to `/tv/`, caches the TV chunk, the fonts and the shell. The screen requests a Wake Lock (and re-requests it). The ±6 px drift runs on a 20-minute cycle. The page reloads daily at 03:00 Malaysia time, only after `/api/v1/time` answers.

**Acceptance criteria:**
- [ ] After one online load, a reload with the network off boots the full screen.
- [ ] Non-TV routes register no service worker.
- [ ] No reload happens while the server is unreachable.
- [ ] Unsupported APIs fail silently.

**Verification:**
- [ ] DevTools offline reload.
- [ ] Application panel: SW scope is `/tv/`.
- [ ] `?now=02:59:50` (dev) with the server stopped → no reload.

**Dependencies:** Task 12
**Files:** `client/public/tv-sw.js`, `client/src/tv/TvApp.jsx`, `client/src/tv/lib/kiosk.js`
**Scope:** M

## Task 14: Screenshot script, final inspection, sign-off

**Description:** A script that captures every state (via `?now=`) at 1920×1080 and 3840×2160. Then the final taste inspection and critique, the spec's success criteria checked on the Android TV, and the README's "Paparan TV" section.

**Acceptance criteria:**
- [ ] All 8 spec success criteria are checked and recorded with their evidence.
- [ ] The README documents `/tv/:zone` and its parameters, with an example URL.

**Verification:**
- [ ] `node scripts/tv-shots.mjs` produces the image set, and each image has been reviewed.

**Dependencies:** Tasks 1–13
**Files:** `scripts/tv-shots.mjs`, `README.md`, `SPEC-tv-display.md` (status)
**Scope:** S

### Checkpoint D: Complete
- [ ] All spec success criteria met.
- [ ] Owner review and sign-off, then next module: `mosque-registry`.
