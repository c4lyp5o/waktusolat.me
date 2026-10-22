# Spec: site revamp (non-TV pages)

Status: **approved 2026-10-22**. Owner request (2026-10-22): "you can revamp the current UI UX for the non tv page." The TV display (`/tv/:zone`) is out of scope; it is the reference this revamp aligns to.

## What the site is for

Most visits are someone on a **phone** checking **their own zone's** prayer times, often more than once a day. Second: reading the Quran and hadith. Then radio, chat and about.

**The site's one question:** *"When is the next prayer where I am?"* Today the answer is two screens away: open the site, scroll a list of 57 zones, tap one, then read.

## Critique of the current site (before)

Inspected at 1440/768/390 with the taste skill. Screenshots are in `.taste-skill/before-*/`.

| # | Finding | Where |
| --- | --- | --- |
| 1 | **The main job takes a scroll through 57 zones every visit.** The site never remembers your zone. | `/` |
| 2 | **Two products in two styles.** The site is navy, emerald and violet with gradients; the TV is true black with lamp amber. Prayer names also differ: the site says "Zuhur/Isha", JAKIM and the TV say "Zohor/Isyak". | all |
| 3 | **Template devices:** gradient panels and backgrounds (5 FAILs), glowing coloured shadows, tiny uppercase tracked labels at 10px, a coloured accent word in headlines ("Waktu Solat **Malaysia**", "Koleksi **Hadis**"), and violet/indigo on the times page. | `/`, `/times`, `/hadith`, `/radio`, `/about` |
| 4 | **The times page leads with the clock, not the answer.** The h1 is "9:38:22 PM" at 72px. "Subuh akan masuk dalam 8 jam 10 minit", the actual answer, is a small pill. The day's times are 12px-label tiles. | `/times/:zone` |
| 5 | **Desktop wastes the width.** A narrow centred column with empty sides, and 33–60% empty first screens. | `/hadith`, `/radio`, `/chat`, `/about` |
| 6 | **Text too small for the audience.** Many readers are older, on phones: 51% of chat text is under 13px, and labels are at 10px. | `/chat`, `/` |

What works and stays:
- the routes and everything behind them: search across zones, the Quran reader with Arabic in the Uthmanic font, the six hadith books, the radio streams, live chat
- Malay as the main language
- the dark theme

## Direction

**One product.** The site takes the TV's language, so a jemaah who sees the mosque screen recognises the site on their phone:
- **Look:** true black, lamp amber `#f2b33d` only on "now / next", Inter self-hosted, no gradients, no glows, no tracked capitals.
- **Prayer names:** JAKIM's (Subuh, Syuruk, Zohor, Asar, Maghrib, Isyak, and Jumaat on Friday).
- **Shared code:** the TV's tested logic in `client/src/tv/lib/` (state machine, Malaysia-time maths, day track geometry) moves to `client/src/lib/waktu/`, used by both. No second copy.

| Page | Revamp |
| --- | --- |
| **`/` (landing)** | **Remembers your zone** (localStorage). A returning visitor sees their zone's next prayer, countdown and today's times at once, with "Tukar zon" one tap away. A first visit leads with zone search, typing-first ("Gombak", "Shah Alam"), grouped by state, results as you type. The visitor counters move to `/about`. |
| **`/times/:zone`** | The TV's structure at phone size: the lead is "Asar dalam 1:24:05" plus the azan time, then today's seven times as a list (next lit amber), then the day track (SVG only, no three.js on phones), then week/month as a plain table. 24-hour times. Sets the remembered zone. |
| **`/quran`, `/quran/:surah`** | Reading first: surah list as a clean two-column index with search on top; the reader with larger Malay (18px) and Arabic (32px+), ayat numbers as data, no green header slab. "Ayat hari ini" stays as a quiet card. |
| **`/hadith`** | The six kitab as a simple segmented choice; the hadith in large readable type with its reference (kitab), plus "Hadis lain" to draw another. No dashed empty box. |
| **`/radio`** | One list of stations with a single shared player bar (one stream at a time), not three identical cards each with its own player. |
| **`/chat`** | Readable: 16px messages, names as identity tints, the composer always visible. Same socket protocol and server limits. |
| **`/about`** | What the site is, the data source (JAKIM e-Solat), the visitor counters, the TV display ("Paparan TV masjid: buka /tv/<zon> pada TV"), and the repo link. |
| **Navbar** | Wordmark plus five plain links, active state by brightness. On phones, a bottom bar with the 4–5 destinations (thumb reach). |

## Character (added 2026-10-22, after owner review: "too bland")

The first build was correct but thin. The owner chose three additions, each taken from the subject:
- **The sky as the page.** The lead band on zone pages is a flat field in the colour of the sky over the zone right now: malam, subuh, pagi, zohor, asar, senja (`lib/waktu/sky.js`, from the zone's prayer times). Each sky re-sets the theme tokens so text keeps its contrast.
- **Jawi names** beside the Malay ones (صبح, ظهر, عصر…), as on the LED boards on surau walls, set in the bundled Uthmanic face.
- **The state's mosque.** One real, openly licensed photograph per state from Wikimedia Commons, with its name and credit under it (creator, licence, link). Sources and licences are recorded in `client/src/assets/mosques/credits.json` and listed on `/about`. Each is a real place in the zone's state, never presented as the visitor's own mosque.

## Boundaries

- **Always:**
  - keep every route and API contract
  - reuse the tested `lib/waktu` logic
  - Malay copy
  - taste inspector run per page at 390/768/1440, 0 FAIL
  - before/after screenshots per page
- **Ask first:** removing any page or feature (none planned), adding dependencies (none planned beyond what the TV already uses), changing the chat protocol.
- **Never:**
  - load three.js outside `/tv`
  - break `/tv`
  - invent content: no fake testimonials or stats; the visitor counters are real

## Success criteria

1. A returning visitor sees their zone's next prayer and countdown on `/` with **zero taps**.
2. A first-time visitor finds their zone by typing 3 letters of a district.
3. Every page passes the taste inspector at 390/768/1440 with **0 FAIL**, and its WARNs are fixed or defended in one line.
4. `/times/:zone` and `/tv/:zone` agree on every prayer time and label (same `lib/waktu` code, plus a test that renders both from one fixture).
5. Body text ≥ 16px on phones, and nothing under 12px anywhere.
6. Bundle: the main chunk does not grow by more than 15 kB gzipped. three.js and the GL chunk stay TV-only.
7. Existing tests stay green, with new tests for zone memory and zone search.

## Resolved questions (2026-10-22)

1. **Remember my zone:** yes. `/` shows the last zone's times directly, with "Tukar zon".
2. **Theme:** toggleable. Light and dark variants of the same palette. It follows the phone's setting until the visitor toggles, and their choice is remembered. Dark stays true black; light is a warm off-white ground with near-black ink, amber kept for "now / next" (darkened to pass contrast on light). `/tv` stays dark always.
3. **Order:** times + landing first, then Quran/hadith, then radio/chat/about.
