// schedule.js — what the TV shows right now. Pure: no Date.now(), no DOM.
//
// States (spec: Screen states):
//   countdown    next prayer's azan
//   iqamah       azan <= now < iqamah
//   solat        iqamah <= now < iqamah + config.solat minutes
//   after-isyak  past Isyak's solat window: tomorrow's Subuh
import { DAY_MS } from "./mytime.js";
import { ADVISORY, isFriday, ORDER, PRAYERS, prayerLabel } from "./names.js";

const MINUTE = 60 * 1000;
const SUBUH_ENDS_WARNING = 15 * MINUTE;

// One window per prayer: azan, iqamah, end of the solat state.
export function prayerWindows(day, config) {
	const friday = isFriday(day.times.subuh);
	return PRAYERS.map((key) => {
		const azan = day.times[key];
		const minutes = key === "zohor" && friday ? config.jumaat : config.iqamah[key];
		const iqamah = azan + minutes * MINUTE;
		return {
			key,
			label: prayerLabel(key, azan),
			azan,
			iqamah,
			end: iqamah + config.solat * MINUTE,
		};
	});
}

const lead = (kind, w, target, extra = {}) => ({
	kind,
	prayer: w.key,
	label: w.label,
	azan: w.azan,
	iqamah: w.iqamah,
	target,
	estimate: false,
	secondary: null,
	...extra,
});

// "Waktu Subuh tamat dalam …" in the last 15 minutes before Syuruk.
function subuhEnds(now, day) {
	const syuruk = day.times.syuruk;
	return now >= syuruk - SUBUH_ENDS_WARNING && now < syuruk
		? { kind: "subuh-ends", target: syuruk }
		: null;
}

export function screenState(now, today, tomorrow, config) {
	const windows = prayerWindows(today, config);
	for (const w of windows) {
		if (now >= w.azan && now < w.iqamah) return lead("iqamah", w, w.iqamah);
		if (now >= w.iqamah && now < w.end) return lead("solat", w, w.end);
	}
	const next = windows.find((w) => w.azan > now);
	if (next) return lead("countdown", next, next.azan, { secondary: subuhEnds(now, today) });

	if (tomorrow) {
		const subuh = prayerWindows(tomorrow, config)[0];
		return lead("after-isyak", subuh, subuh.azan);
	}
	// No next-day data (e.g. 31 Dec before the new year is cached):
	// today's Subuh one day later, marked as an estimate.
	const w = windows[0];
	const shifted = { ...w, azan: w.azan + DAY_MS, iqamah: w.iqamah + DAY_MS };
	return lead("after-isyak", shifted, shifted.azan, { estimate: true });
}

// Each list row: "passed", "current" (in its iqamah/solat window), "next"
// (the countdown's target) or "upcoming". Advisory rows are only ever
// passed or upcoming.
export function rowStates(now, today, state) {
	const active = state.kind === "iqamah" || state.kind === "solat";
	const nextToday = state.kind === "countdown" ? state.prayer : null;
	return Object.fromEntries(
		ORDER.map((key) => {
			if (ADVISORY.includes(key)) return [key, today.times[key] <= now ? "passed" : "upcoming"];
			if (active && key === state.prayer) return [key, "current"];
			if (key === nextToday) return [key, "next"];
			return [key, today.times[key] <= now ? "passed" : "upcoming"];
		}),
	);
}

// What the prayer list shows: each row's state and time. After Isyak every
// row of today has passed, so Subuh is marked next and shows tomorrow's
// Subuh (the lead's target); otherwise today's times and rowStates().
export function listRows(now, today, state) {
	const rows = rowStates(now, today, state);
	const times = { ...today.times };
	if (state.kind === "after-isyak") {
		rows.subuh = "next";
		times.subuh = state.azan;
	}
	return { rows, times };
}
