# Implementation Plan: `tv-display`

Status: **approved 2026-10-22**.

Spec: [SPEC-tv-display.md](../SPEC-tv-display.md) (approved 2026-10-22). Map: [CAPABILITY-MAP.md](../CAPABILITY-MAP.md). Tasks: [todo.md](todo.md).

## Overview

Build the read-only `/tv/:zone` screen in thin, testable slices.
1. **Pure logic first:** schedule state machine, URL config, clock and cache, all under bun tests.
2. **A plain but correct screen**, so it can go on the Android TV early.
3. **The signature day track:** first as an SVG drawing, then as three.js, with the SVG as the fallback.
4. **Motion, then the ayat/hadith banner.**
5. **Resilience last:** service worker, wake lock, burn-in drift, daily reload.

Each slice leaves `development` working. Nothing is pushed without being asked.

## Architecture decisions

- **All wall-clock maths in Malaysia time, not the device's.** The spec handles a wrong *clock* via the server offset. A TV can also have the wrong **timezone**. Malaysia is UTC+8 with no DST, so `lib/` works on `epochMs + 8 h` and never calls `Date#getHours()` or `toLocale*` without `timeZone: "Asia/Kuala_Lumpur"`. Tests run with `TZ=UTC` and `TZ=America/New_York` to prove it.
- **Parse the existing year endpoint** (`/api/v1/waktusolat/year/:zone`), using the first half of its formatted `date` ("22/10/2026 / 22/Oktober/2026") and its `HH:MM:SS` times. A single `rows.js` turns rows into `{ isoDate, hijri, times: { imsak: epochMs, … } }`, so the rest of `lib/` never sees strings. No backend change.
- **`?now=` for previews (dev builds only).** `config.js` accepts `?now=2026-10-23T13:05` when `import.meta.env.MODE !== "production"`. Screenshot tests and design review can show every state on demand. It's ignored in production builds.
- **SVG day track first, three.js second.** The SVG drawing is both the design baseline and the fallback the spec requires. three.js then renders the same geometry from the same `dayTrack()` data function. One source of geometry means the two can't drift apart.
- **Lazy TV chunk outside the Navbar layout.** `App.jsx` gets a `React.lazy` route for `/tv/:zone` above the `<Navbar/>` tree. `three` and `motion` are imported only inside `client/src/tv/`. A build check fails if either appears in another chunk.
- **Visit beacon:** add `/tv/` to `VISIT_PREFIXES`, so a TV counts once per load (useful to know how many mosques use it). It doesn't fire again on state changes.
- **Banner content needs one additive backend change.** This is a decision for you (see Open questions). Without it, the banner shows ayat only.

## Task list

See [todo.md](todo.md) for acceptance criteria, verification and files.

**Phase 1: Foundation (pure logic and backend)**
1. `GET /api/v1/time`
2. Prayer names and URL config (`names.js`, `config.js`)
3. Year rows → schedule state machine (`rows.js`, `schedule.js`)
4. Server-offset clock and year cache (`clock.js`, `cache.js`)

*Checkpoint A:* all logic tested in two timezones, plus mutation checks on the state machine.

**Phase 2: First screen on the TV**

5. Lazy `/tv/:zone` route, tokens, self-hosted Inter, cache-first data
6. Header, prayer list and lead (countdown, iqamah, after-isyak)
7. Solat-in-progress, unknown-zone and no-data states

*Checkpoint B:* runs on your Android TV, gets a taste inspection and critique, and existing pages are unchanged.

**Phase 3: Signature and motion**

8. Day track as SVG, from `dayTrack()` geometry
9. Day track in three.js, with perf probe and SVG fallback
10. Motion: state crossfades, reduced motion

*Checkpoint C:* 4× throttle and Android TV performance, plus the bundle check.

**Phase 4: Banner**

11. *(needs your OK)* `?max=` length filter on the random ayat/hadith endpoints, plus a hadith reference
12. Banner: 20 s rotation, offline pool, Uthmanic Arabic

**Phase 5: Resilience and sign-off**

13. Service worker, wake lock, burn-in drift, daily 03:00 reload
14. Screenshot script, final inspection, success-criteria run on the Android TV, README

*Checkpoint D:* all 8 spec success criteria met, then your review.

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Android TV browser varies (Chrome, WebView kiosk apps, TV Bro) in WebGL, Service Worker and Wake Lock support | High | Feature-detect everything. The SVG track, `localStorage` cache and plain reload all work without these APIs. Test on your TV at Checkpoint B, before building on assumptions. |
| TV timezone or clock set wrong | High | Server offset plus fixed UTC+8 maths (above). Tests in UTC and New York. |
| Short hadith are rare (158 of 8,529 Bukhari ≤ 180 chars) | Med | Task 11 filters on the server. Fallback: ayat only. |
| Weak GPU stutters the day track | Med | Render on change (the sun moves a few px a minute), 30 fps cap, frame-time probe, then SVG fallback. |
| Burn-in on OLED or plasma | Med | ±6 px drift, brightest static text in `--muted`, solat state very dim. |
| The TV can't reach a dev machine for testing | Low | `bun dev` already binds `--host`. Otherwise use a staging deploy. |
| Existing pages regress | Med | Before/after screenshots at 390/768/1440 at Checkpoint B and the end. TV code lives only in `client/src/tv/`. |

## Resolved questions (2026-10-22)

1. **Banner backend:** approved. Task 11 adds `?max=` and the hadith `kitab`/`id`.
2. **Android TV browser:** varies by TV. So every TV-specific API (Service Worker, Wake Lock, WebGL) is feature-detected, and the baseline that must work is *none of them present*: `localStorage` cache, SVG day track, no reload while offline.
