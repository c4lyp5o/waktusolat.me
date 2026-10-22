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
