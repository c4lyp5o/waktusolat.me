// mosqueTv.js — /m/:id, a registered mosque's TV (SPEC-tv-mosque-mode.md):
// its settings as the TV's config, its cache for offline boots, and which
// programmes the banner shows, in what order, with what "when" line.
import { atText, dayLabel, resolveAt } from "../programmeText.js";
import { DEFAULTS, TEMAS } from "./config.js";
import { mytIsoDate, mytParts } from "./mytime.js";

// No end times exist, so an occurrence leaves the banner this long after it
// starts (owner decision, 2026-10-23).
export const DROP_AFTER_MS = 2 * 60 * 60 * 1000;
const keyFor = (id) => `tv:mosque:v1:${id}`;

// The mosque's settings in parseConfig's shape. `now` is the dev-only ?now=.
export function mosqueConfig(mosque, now = null) {
	return {
		...DEFAULTS,
		iqamah: { ...mosque.iqamah },
		jumaat: mosque.jumaat,
		solat: mosque.solat,
		nama: mosque.name,
		// A mosque saved before themes (or by an older server) has none.
		tema: TEMAS.includes(mosque.tema) ? mosque.tema : DEFAULTS.tema,
		now,
	};
}

// { mosque, mosqueTag, feed, feedTag, gone } or null.
export function readMosque(storage, id) {
	try {
		const entry = JSON.parse(storage.getItem(keyFor(id)));
		return entry?.mosque?.zone ? entry : null;
	} catch {
		return null;
	}
}

export function writeMosque(storage, id, entry) {
	try {
		storage.setItem(keyFor(id), JSON.stringify(entry));
	} catch {
		// Blocked or full: the screen still runs for this load.
	}
}

// The feed's occurrences still worth showing at `now`: not on a past day,
// and not more than DROP_AFTER_MS past their start. Each gets its start
// (null when the day's prayer times are not loaded) and a stable key.
export function liveProgrammes(feed, days, now) {
	if (!feed?.items?.length) return [];
	const today = mytIsoDate(now);
	const out = [];
	for (const { date, at, programme } of feed.items) {
		if (date < today) continue;
		const day = days?.find((d) => d.isoDate === date);
		const start = resolveAt(at, date, day);
		if (start != null && now > start + DROP_AFTER_MS) continue;
		out.push({ key: `p:${programme.id}:${date}`, date, at, start, programme, day });
	}
	// The feed is in date order; within a day, by the real start time.
	return out.sort((a, b) => a.date.localeCompare(b.date) || (a.start ?? 0) - (b.start ?? 0));
}

// "Malam ini · selepas Isyak (8:10 malam)", "Esok · 9:00 pagi",
// "Isnin, 26 Oktober · selepas Maghrib (7:01 malam)".
export function whenLine(item, now) {
	const today = mytIsoDate(now);
	let day = dayLabel(item.date, today);
	if (item.date === today && item.start != null && mytParts(item.start).hour >= 18) {
		day = "Malam ini";
	}
	return `${day} · ${atText(item.at, item.date, item.day)}`;
}

// The banner's rotation: every live programme, then one ayat or hadith.
// Slot i -> { programme: index } or { quote: true }.
export function bannerSlot(i, programmeCount) {
	if (programmeCount === 0) return { quote: true };
	const at = i % (programmeCount + 1);
	return at < programmeCount ? { programme: at } : { quote: true };
}
