# Tasks: site revamp

Spec: [SPEC-site-revamp.md](../SPEC-site-revamp.md) (approved 2026-10-22). Kept apart from `todo.md`, whose TV tasks 13-14 (service worker, wake lock, sign-off) are still open.

Every task: `bun run test` green · Biome clean · `bun run build-client` · taste inspector 0 FAIL at 390/768/1440 on the pages touched · before/after screenshots · commit on `development`, don't push.

## Slice 1: the main job (times + landing)

- [x] **R1. Shared prayer-time logic.** Move `client/src/tv/lib` to `client/src/lib/waktu`, used by both the TV and the site. Zones come from the server's `controllers/zones.js` (one list; ZoneSelector's hand copy goes).
  - Verify: all tests pass with updated paths; `/tv` unchanged.
- [x] **R2. Theme tokens + toggle.** Light and dark palettes as CSS variables. The theme follows the system until toggled, then the choice is remembered; it's set before paint, with no flash. `/tv` stays dark.
  - Verify: tests for theme resolution; screenshots in both themes.
- [x] **R3. Navbar.** Wordmark, five plain links, active by brightness, theme toggle. On phones, a bottom bar.
  - Verify: inspector at 390, keyboard focus visible.
- [x] **R4. Zone memory + search** (pure, tested): remembered zone in localStorage; typing-first search over negeri, area names and codes.
  - Verify: "gomb" finds SGR01, "kl" or "kuala lumpur" finds WLY01, "jhr" finds the Johor zones.
- [x] **R5. `/times/:zone`.** Lead countdown, today's list, SVG day track, week/month table. Uses `lib/waktu`; remembers the zone.
  - Verify: shows the same times and labels as `/tv` for a fixture day.
- [x] **R6. `/` landing.** A returning visitor sees their zone's times (zero taps) plus "Tukar zon". A first visit leads with search, and on desktop a "Paparan TV untuk masjid" panel with a real screenshot. The visitor counters move to `/about` (R11).

### Checkpoint 1
- [ ] Owner review on phone and desktop, in both themes.

## Slice 2: reading
- [x] **R7. `/quran` and `/quran/:surah`.** Index with forgiving search (number, spelling, meaning) and a sticky ayat card; reader shows the whole surah with mushaf ayah markers, correct Bismillah (none for At-Tawbah) and previous/next. Inspector WARN/FAILs defended: Arabic ayat text measured as headlines, and long pages passing under the fixed phone bar.
- [x] **R8. `/hadith`.** Opens on Sahih Bukhari; six kitab with Arabic names; large text with reference; "Hadis lain" and "Salin". Inspector 0 FAIL 0 WARN.

## Slice 3: the rest
- [ ] **R9. `/radio`** (one shared player).
- [ ] **R10. `/chat`.**
- [x] **R11a. `/about`** (done early, 2026-10-22): intro, real visitor counters (moved from `/`), data sources, the TV display, full photo credits (`#kredit-foto`), source link.
- [ ] **R11b. `/404`.** Then remove the old navy/emerald tokens and decorative CSS.

### Checkpoint 2
- [ ] Success criteria 1-7 of the spec; owner review.
