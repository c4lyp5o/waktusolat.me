// daytrack.js — geometry of the day track, the TV's signature element: the
// day from Subuh to Isyak as a time axis, with the sun on its Syuruk ->
// Maghrib arc. Pure; the SVG and three.js renderers draw from the same
// numbers, so they cannot drift apart. x is 0..1 across the band; lift is
// 0 (horizon) .. 1 (top of the arc).

// Imsak is 10 minutes before Subuh (~20px at 1080p): its label would
// collide, so the axis starts at Subuh and Imsak stays in the list.
export const TRACK_KEYS = ["subuh", "syuruk", "zohor", "asar", "maghrib", "isyak"];
// Inset of the first and last tick, so their labels fit inside the band.
export const TRACK_PAD = 0.04;

export function dayTrack(now, day) {
	const { subuh, syuruk, maghrib, isyak } = day.times;
	const x = (t) => TRACK_PAD + (1 - 2 * TRACK_PAD) * ((t - subuh) / (isyak - subuh));
	const daylight = now >= syuruk && now < maghrib;
	const phase =
		now < subuh || now >= isyak ? "night" : now < syuruk ? "dawn" : daylight ? "day" : "dusk";
	return {
		ticks: TRACK_KEYS.map((key) => ({ key, x: x(day.times[key]) })),
		arc: { from: x(syuruk), to: x(maghrib) },
		sun: daylight
			? { x: x(now), lift: Math.sin(Math.PI * ((now - syuruk) / (maghrib - syuruk))) }
			: null,
		nowX: now >= subuh && now <= isyak ? x(now) : null,
		phase,
	};
}

// Drawing helpers shared by the TV and the site (SVG renderers).
export const ARC_TOP = 0.9; // share of the sky's height the arc may rise to
const SAMPLES = 48;

// Stars for the night sky: fixed positions (x 0..1, y 0..1 from the top),
// so the sky does not reshuffle on every render.
export const STARS = Array.from({ length: 28 }, (_, i) => ({
	x: ((i * 0.618034) % 1) * 0.96 + 0.02,
	y: ((i * 0.381966 + 0.13) % 1) * 0.8 + 0.05,
	big: i % 5 === 0,
}));

export function arcPoints(from, to) {
	return Array.from({ length: SAMPLES + 1 }, (_, i) => {
		const f = i / SAMPLES;
		const x = (from + (to - from) * f) * 1000;
		const y = 100 - ARC_TOP * 100 * Math.sin(Math.PI * f);
		return `${x.toFixed(1)},${y.toFixed(1)}`;
	}).join(" ");
}
