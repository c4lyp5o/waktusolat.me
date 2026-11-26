// ribbon.js — the day as a band (drafts 03): where "now" sits between
// midnight and midnight, and where each prayer's mark goes. Pure: no DOM, so
// the positions are testable and the two sizes share one placement rule.
import { mytParts } from "./mytime.js";
import { prayerJawi, prayerLabel } from "./names.js";

const DAY_MINUTES = 24 * 60;

export const RIBBON_KEYS = ["subuh", "zohor", "asar", "maghrib", "isyak"];

// A label is up to ~20% of the band wide on a phone and ~10% on a TV, so two
// marks closer than this must not sit on the same row. 16 clears both.
export const MIN_GAP = 16;
export const MAX_ROWS = 3;

// 0..100: the visitor's own clock, Malaysia time, as a share of the day.
export function dayPercent(ms) {
	const p = mytParts(ms);
	return ((p.hour * 60 + p.minute + p.second / 60) / DAY_MINUTES) * 100;
}

export function clockPercent(ms) {
	const p = mytParts(ms);
	return ((p.hour * 60 + p.minute) / DAY_MINUTES) * 100;
}

// The five marks on the band, each on the first row far enough from the mark
// before it — so Asar, Maghrib and Isyak never print over one another.
export function ribbonMarks(times, now) {
	const marks = RIBBON_KEYS.map((key) => ({
		key,
		label: prayerLabel(key, times[key]),
		jawi: prayerJawi(key, times[key]),
		time: times[key],
		left: clockPercent(times[key]),
		past: times[key] <= now,
	}));
	const lastLeft = Array(MAX_ROWS).fill(Number.NEGATIVE_INFINITY);
	for (const m of marks) {
		let row = lastLeft.findIndex((l) => m.left - l >= MIN_GAP);
		if (row === -1) row = MAX_ROWS - 1;
		m.row = row;
		lastLeft[row] = m.left;
	}
	return marks;
}
